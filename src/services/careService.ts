/** Login, pessoa cuidada, rede, remédios, rotina, consultas e receitas. */
import { apiConfig } from "./config";
import { ApiError, http } from "./http";
import { appointments, caregivers, doses, medications, patients, prescriptions, timeline, users } from "@/mocks/db";
import { createId, mockError, mockResponse } from "@/mocks/helpers";
import type {
  ApiSession, ApiUser, Appointment, AppUser, Caregiver, CreateNoteInput, Medication, MedicationDose, Patient, Prescription,
  RegisterInput, Session, TimelineEntry, UpdateAccountInput, UpdateAddressInput,
} from "@/types";
import { isSameDay } from "@/utils/date";
import { getInitials } from "@/utils/text";
import { addressLine } from "@/utils/address";
import { withDefaults } from "@/utils/preferences";

const fullPermissions = { receivesAlerts: true, canViewHealth: true, canViewRoutine: true };
const alertsOnly = { receivesAlerts: true, canViewHealth: false, canViewRoutine: false };

const nextOrder = (patientId: string) => caregivers.filter((c) => c.patientId === patientId).length + 1;

/** Liga a conta a uma pessoa cuidada: por código (já cadastrada) ou criando um perfil novo. */
function resolvePatient(input: RegisterInput): Patient | string {
  if (input.patientCode) {
    return patients.find((p) => p.inviteCode === input.patientCode)
      ?? "Código não encontrado. Confira os 6 números com quem cuida de você.";
  }
  if (!input.newPatient) return "Informe o código ou os dados da pessoa cuidada.";
  const name = "name" in input.newPatient ? input.newPatient.name : input.name;
  const created: Patient = {
    id: createId("p"), name, fullName: name, initials: getInitials(name),
    age: new Date().getFullYear() - input.newPatient.birthYear, city: input.newPatient.city, address: "",
    status: "estavel", lastActivityAt: new Date().toISOString(), batteryLevel: 100, adherence30d: 0,
    inviteCode: String(Math.floor(100000 + Math.random() * 900000)),
    phone: input.role === "pessoa" ? input.phone : undefined,
  };
  patients.push(created);
  return created;
}

/** Converte o usuário da API para o formato do app. O app é só da pessoa cuidada e da rede de cuidado. */
export function toAppUser(user: ApiUser): AppUser {
  const base = {
    id: user.id, name: user.name, initials: user.initials, email: user.email, phone: user.phone,
    displayName: user.displayName ?? user.name.split(" ")[0],
  };
  if (user.accountRole === "pessoa" && user.patientIds[0]) {
    return { ...base, role: "pessoa", patientId: user.patientIds[0], accessibility: user.accessibility };
  }
  const link = user.caregiverLinks?.[0];
  if (user.accountRole === "cuidador" && link) {
    return { ...base, role: "cuidador", patientId: link.patientId, caregiverId: link.caregiverId };
  }
  if (user.accountRole === "medico") throw new ApiError(403, "Esta conta é de médico. Use o portal web do Acolhe.");
  throw new ApiError(403, "Esta conta ainda não está ligada a uma pessoa cuidada.");
}

const toSession = (session: ApiSession): Session => ({ token: session.token, user: toAppUser(session.user) });

/** Modo mock: quem está logado (a API descobre isso pelo token). */
let currentMockUserId: string | null = null;

/** Modo mock: tira login e senha do usuário guardado e expõe o e-mail, como a API faz. */
function toMockUser({ login, password: _password, ...user }: (typeof users)[number]): AppUser {
  void _password;
  return { ...user, email: login };
}

export const authService = {
  async login(login: string, password: string): Promise<Session> {
    if (!apiConfig.useMocks) return toSession(await http.post<ApiSession>("/auth/login", { login, password }));
    const found = users.find((u) => u.login === login.trim().toLowerCase());
    if (!found || found.password !== password) return mockError("E-mail/celular ou senha incorretos.");
    currentMockUserId = found.id;
    return mockResponse({ token: `mock-token-${found.id}`, user: toMockUser(found) });
  },

  /** Cria a conta (pessoa cuidada ou cuidador) e já devolve a sessão. */
  async register(input: RegisterInput): Promise<Session> {
    if (!apiConfig.useMocks) return toSession(await http.post<ApiSession>("/auth/register", input));

    const email = input.email.trim().toLowerCase();
    if (users.some((u) => u.login === email)) return mockError("Já existe uma conta com este e-mail.");

    const patient = resolvePatient(input);
    if (typeof patient === "string") return mockError(patient);

    const base = { id: createId("u"), name: input.name.trim(), initials: getInitials(input.name), email, phone: input.phone };

    let user: AppUser;
    if (input.role === "pessoa") {
      user = { ...base, displayName: input.name.trim().split(" ")[0], role: "pessoa", patientId: patient.id, accessibility: input.accessibility };
    } else {
      const me: Caregiver = {
        id: createId("c"), patientId: patient.id, name: base.name.split(" ")[0], initials: base.initials,
        relation: "Cuidador(a)", relationType: "familiar", phone: input.phone, order: nextOrder(patient.id),
        status: "ativo", permissions: fullPermissions, level: "cuidador", channels: ["app", "whatsapp", "sms"], waitMinutes: 2,
      };
      caregivers.push(me);
      input.supportContacts.forEach((contact) => {
        caregivers.push({
          id: createId("c"), patientId: patient.id, name: contact.name.trim(), initials: getInitials(contact.name),
          relation: "Contato de apoio", relationType: "outro", phone: contact.phone, order: nextOrder(patient.id),
          status: "convite_pendente", permissions: alertsOnly, level: "apoio", channels: ["whatsapp", "sms"], waitMinutes: 5,
        });
      });
      user = { ...base, displayName: base.name.split(" ")[0], role: "cuidador", patientId: patient.id, caregiverId: me.id };
    }
    users.push({ ...user, login: email, password: input.password });
    currentMockUserId = user.id;
    return mockResponse({ token: `mock-token-${user.id}`, user }, 900);
  },

  /** Recupera o usuário a partir do token salvo no aparelho. */
  async me(token: string): Promise<Session> {
    if (!apiConfig.useMocks) return { token, user: toAppUser(await http.get<ApiUser>("/auth/me")) };
    const found = users.find((u) => token === `mock-token-${u.id}`);
    if (!found) return mockError("Sessão expirada.");
    currentMockUserId = found.id;
    return mockResponse({ token, user: toMockUser(found) }, 100);
  },

  /** Muda e-mail, celular e preferências da própria conta. Devolve o usuário atualizado. */
  async updateAccount(input: UpdateAccountInput): Promise<AppUser> {
    if (!apiConfig.useMocks) return toAppUser(await http.patch<ApiUser>("/auth/me", input));
    const found = users.find((u) => u.id === currentMockUserId);
    if (!found) return mockError("Sessão expirada.");
    if (input.email !== undefined) {
      const email = input.email.trim().toLowerCase();
      if (users.some((u) => u.id !== found.id && u.login === email)) return mockError("Já existe uma conta com este e-mail.");
      found.login = email;
    }
    if (input.phone !== undefined) {
      found.phone = input.phone;
      if (found.role === "pessoa") patients.filter((p) => p.id === found.patientId).forEach((p) => (p.phone = input.phone));
      if (found.caregiverId) caregivers.filter((c) => c.id === found.caregiverId).forEach((c) => (c.phone = input.phone!));
    }
    if (input.accessibility && found.role === "pessoa") found.accessibility = withDefaults({ ...found.accessibility, ...input.accessibility });
    return mockResponse(toMockUser(found));
  },

  async logout(): Promise<void> {
    currentMockUserId = null;
    if (!apiConfig.useMocks) await http.post<void>("/auth/logout").catch(() => undefined);
  },

  /** Usado pelo modo demonstração para entrar direto num perfil. */
  async loginAsDemo(role: "pessoa" | "cuidador"): Promise<Session> {
    const found = users.find((u) => u.role === role)!;
    return this.login(found.login, found.password);
  },
};

export const patientService = {
  /** Procura a pessoa cuidada pelo código de 6 dígitos. */
  async findByCode(code: string): Promise<Patient | null> {
    if (!apiConfig.useMocks) return http.get<Patient | null>(`/patients/by-code/${code}`);
    return mockResponse(patients.find((p) => p.inviteCode === code) ?? null);
  },

  async getById(id: string): Promise<Patient> {
    if (!apiConfig.useMocks) return http.get<Patient>(`/patients/${id}`);
    const p = patients.find((x) => x.id === id);
    return p ? mockResponse(p) : mockError("Pessoa não encontrada.");
  },

  /** Salva o endereço completo da pessoa cuidada (substitui o anterior). */
  async updateAddress(id: string, input: UpdateAddressInput): Promise<Patient> {
    if (!apiConfig.useMocks) return http.patch<Patient>(`/patients/${id}/address`, input);
    const p = patients.find((x) => x.id === id);
    if (!p) return mockError("Pessoa não encontrada.");
    const { city, ...details } = input;
    p.addressDetails = details;
    p.address = addressLine(details);
    p.city = city.trim();
    return mockResponse(p);
  },
};

export const caregiverService = {
  async listByPatient(patientId: string): Promise<Caregiver[]> {
    if (!apiConfig.useMocks) return http.get<Caregiver[]>(`/patients/${patientId}/caregivers`);
    return mockResponse(caregivers.filter((c) => c.patientId === patientId).sort((a, b) => a.order - b.order));
  },
};

export interface DoseWithMedication extends MedicationDose {
  medication: Medication;
}

export const medicationService = {
  async listTodayDoses(patientId: string): Promise<DoseWithMedication[]> {
    if (!apiConfig.useMocks) return http.get<DoseWithMedication[]>(`/patients/${patientId}/doses?include=medication`);
    const today = new Date();
    const list = doses
      .filter((d) => d.patientId === patientId && isSameDay(new Date(d.scheduledAt), today))
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
      .map((d) => ({ ...d, medication: medications.find((m) => m.id === d.medicationId)! }));
    return mockResponse(list);
  },

  async confirmDose(doseId: string, confirmedBy: string): Promise<MedicationDose> {
    // Com a API, quem confirmou vem do login (confirmedBy só vale no modo mock).
    if (!apiConfig.useMocks) return http.post<MedicationDose>(`/doses/${doseId}/confirm`);
    const dose = doses.find((d) => d.id === doseId);
    if (!dose) return mockError("Dose não encontrada.");
    dose.status = "tomado";
    dose.confirmedBy = confirmedBy;
    const med = medications.find((m) => m.id === dose.medicationId);
    timeline.push({
      id: createId("t"), patientId: dose.patientId, at: new Date().toISOString(), type: "medicacao",
      title: `${med?.name ?? "Remédio"} tomado`, description: `${med?.dose ?? ""} • Confirmado no app`, authorName: confirmedBy,
    });
    return mockResponse(dose);
  },

  async postponeDose(doseId: string, minutes: number): Promise<MedicationDose> {
    if (!apiConfig.useMocks) return http.post<MedicationDose>(`/doses/${doseId}/postpone`, { minutes });
    const dose = doses.find((d) => d.id === doseId);
    if (!dose) return mockError("Dose não encontrada.");
    dose.status = "adiado";
    dose.scheduledAt = new Date(new Date(dose.scheduledAt).getTime() + minutes * 60_000).toISOString();
    return mockResponse(dose);
  },
};

export const timelineService = {
  async listByPatient(patientId: string): Promise<TimelineEntry[]> {
    if (!apiConfig.useMocks) return http.get<TimelineEntry[]>(`/patients/${patientId}/timeline`);
    return mockResponse(timeline.filter((t) => t.patientId === patientId).sort((a, b) => b.at.localeCompare(a.at)));
  },

  async createNote(input: CreateNoteInput, authorName: string): Promise<TimelineEntry> {
    if (!apiConfig.useMocks) return http.post<TimelineEntry>(`/patients/${input.patientId}/timeline`, input);
    const entry: TimelineEntry = { ...input, id: createId("t"), at: new Date().toISOString(), authorName };
    timeline.push(entry);
    return mockResponse(entry);
  },
};

export const appointmentService = {
  async listByPatient(patientId: string): Promise<Appointment[]> {
    if (!apiConfig.useMocks) return http.get<Appointment[]>(`/patients/${patientId}/appointments`);
    return mockResponse(appointments.filter((a) => a.patientId === patientId).sort((a, b) => a.at.localeCompare(b.at)));
  },
};

export const prescriptionService = {
  async listByPatient(patientId: string): Promise<Prescription[]> {
    if (!apiConfig.useMocks) return http.get<Prescription[]>(`/patients/${patientId}/prescriptions`);
    return mockResponse(prescriptions.filter((p) => p.patientId === patientId));
  },
};

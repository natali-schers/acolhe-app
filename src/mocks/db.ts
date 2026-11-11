/**
 * "Banco de dados" em memória usado enquanto não existe backend.
 * Os serviços em src/services leem e escrevem aqui quando EXPO_PUBLIC_USE_MOCKS != "false".
 */
import type {
  AppUser, Appointment, Caregiver, EmergencyAlert, Medication, MedicationDose, Patient, Prescription, TimelineEntry,
} from "@/types";
import { daysFromToday, minutesAgo, todayAt } from "@/utils/date";

export const users: (AppUser & { login: string; password: string })[] = [
  { id: "u-maria", name: "Maria Aparecida Souza", displayName: "Dona Maria", initials: "MA", role: "pessoa", patientId: "p-maria", login: "maria@exemplo.com", password: "12345678" },
  { id: "u-ana", name: "Ana Souza", displayName: "Ana", initials: "AN", role: "cuidador", patientId: "p-maria", caregiverId: "c-ana", login: "ana@exemplo.com", password: "12345678" },
];

export const patients: Patient[] = [
  {
    id: "p-maria", name: "Dona Maria", fullName: "Maria Aparecida Souza", initials: "MA", age: 78,
    city: "São Paulo, SP", address: "Rua das Flores, 120", status: "estavel",
    lastActivityAt: minutesAgo(8), batteryLevel: 72, adherence30d: 92, inviteCode: "482910", phone: "(11) 94444-0000",
  },
];

const full = { receivesAlerts: true, canViewHealth: true, canViewRoutine: true };
/** Contato de apoio (nível 2): só recebe alertas, não instala o app. */
const alertsOnly = { receivesAlerts: true, canViewHealth: false, canViewRoutine: false };

export const caregivers: Caregiver[] = [
  { id: "c-ana", patientId: "p-maria", name: "Ana", initials: "AN", relation: "Filha", relationType: "familiar", phone: "(11) 98888-1111", order: 1, status: "ativo", permissions: full, level: "cuidador", channels: ["app", "whatsapp", "sms"], waitMinutes: 2 },
  { id: "c-carlos", patientId: "p-maria", name: "Carlos", initials: "CA", relation: "Neto", relationType: "familiar", phone: "(11) 97777-2222", order: 2, status: "ativo", permissions: full, level: "cuidador", channels: ["app", "whatsapp", "sms"], waitMinutes: 3 },
  { id: "c-beatriz", patientId: "p-maria", name: "Beatriz", initials: "BE", relation: "Vizinha (casa 118)", relationType: "vizinho", phone: "(11) 96666-3333", order: 3, status: "ativo", permissions: alertsOnly, level: "apoio", channels: ["whatsapp", "sms"], waitMinutes: 5 },
  { id: "c-jorge", patientId: "p-maria", name: "Seu Jorge", initials: "JO", relation: "Amigo da igreja", relationType: "amigo", phone: "(11) 95555-4444", order: 4, status: "convite_pendente", permissions: alertsOnly, level: "apoio", channels: ["sms"], waitMinutes: 5 },
];

export const medications: Medication[] = [
  { id: "m-losartana", patientId: "p-maria", name: "Losartana", dose: "50 mg", frequency: "A cada 12 horas", instructions: "1 comprimido", times: ["08:00", "20:00"], continuousUse: true, adherence30d: 96 },
  { id: "m-metformina", patientId: "p-maria", name: "Metformina", dose: "850 mg", frequency: "Após o almoço", instructions: "Tomar depois do almoço. Não tomar em jejum.", times: ["12:30"], continuousUse: true, adherence30d: 88 },
];

export const doses: MedicationDose[] = [
  { id: "d1", medicationId: "m-losartana", patientId: "p-maria", scheduledAt: todayAt(8, 0), status: "tomado", confirmedBy: "Dona Maria" },
  { id: "d2", medicationId: "m-metformina", patientId: "p-maria", scheduledAt: todayAt(12, 30), status: "pendente" },
  { id: "d3", medicationId: "m-losartana", patientId: "p-maria", scheduledAt: todayAt(20, 0), status: "pendente" },
];

export const timeline: TimelineEntry[] = [
  { id: "t3", patientId: "p-maria", at: todayAt(10, 15), type: "atividade", title: "Caminhada da manhã", description: "20 minutos no quarteirão", authorName: "Dona Maria" },
  { id: "t4", patientId: "p-maria", at: todayAt(8, 2), type: "medicacao", title: "Losartana tomada", description: "50 mg • No horário", authorName: "Dona Maria" },
  { id: "t5", patientId: "p-maria", at: daysFromToday(-1, 19, 40), type: "anotacao", title: "Jantou bem", description: "Comeu sopa e fruta. Dormiu cedo.", authorName: "Carlos" },
];

export const appointments: Appointment[] = [
  { id: "ap1", patientId: "p-maria", doctorId: "u-paulo", doctorName: "Dr. Paulo Mendes", specialty: "Clínica geral", at: daysFromToday(1, 10, 30), durationMinutes: 30, mode: "online" },
];

export const prescriptions: Prescription[] = [
  {
    id: "rx1", patientId: "p-maria", doctorId: "u-paulo", doctorName: "Dr. Paulo Mendes", doctorCrm: "CRM 123456-SP",
    issuedAt: daysFromToday(-10, 9, 0), title: "Receita de uso contínuo", status: "ativa", signed: true,
    instructions: "Manter acompanhamento da pressão arterial.",
    items: [
      { medication: "Losartana", dose: "50 mg", frequency: "1 comprimido a cada 12 horas", duration: "Uso contínuo" },
      { medication: "Metformina", dose: "850 mg", frequency: "1 comprimido após o almoço", duration: "Uso contínuo" },
    ],
  },
];

export const alerts: EmergencyAlert[] = [
  {
    id: "a1", patientId: "p-maria", createdAt: daysFromToday(-42, 18, 42), triggeredBy: "Dona Maria", status: "resolvido",
    recipients: [{ caregiverId: "c-ana", status: "assumiu", updatedAt: daysFromToday(-42, 18, 43), channel: "app" }],
    assumedByCaregiverId: "c-ana", responseTimeSeconds: 84, resolvedAt: daysFromToday(-42, 19, 5), resultNote: "Tudo bem",
  },
  {
    id: "a2", patientId: "p-maria", createdAt: daysFromToday(-87, 7, 15), triggeredBy: "Dona Maria", status: "resolvido",
    recipients: [
      { caregiverId: "c-ana", status: "enviado", updatedAt: daysFromToday(-87, 7, 15), channel: "sms", failedChannels: ["app", "whatsapp"] },
      { caregiverId: "c-carlos", status: "assumiu", updatedAt: daysFromToday(-87, 7, 18), channel: "whatsapp" },
    ],
    assumedByCaregiverId: "c-carlos", responseTimeSeconds: 188, resolvedAt: daysFromToday(-87, 7, 40), resultNote: "Resolvido",
  },
];

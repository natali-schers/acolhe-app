/** Perfis do app: a pessoa cuidada ou alguém da rede de cuidadores. */
export type AppRole = "pessoa" | "cuidador";

export interface AppUser {
  id: string;
  name: string;
  /** Nome curto usado nas saudações ("Dona Maria", "Ana"). */
  displayName: string;
  initials: string;
  role: AppRole;
  /** Pessoa cuidada a que este usuário está ligado. */
  patientId: string;
  /** Id do cuidador na rede (apenas para role "cuidador"). */
  caregiverId?: string;
  email?: string;
  phone?: string;
  /** Preferências de acessibilidade escolhidas no cadastro (pessoa cuidada). */
  accessibility?: AccessibilityPrefs;
}

export type VoiceVolume = "baixo" | "medio" | "alto";

export interface AccessibilityPrefs {
  textSize: "normal" | "grande" | "muito_grande";
  voiceReminders: boolean;
  /** Volume da voz que lê os lembretes (relativo ao volume do aparelho). */
  voiceVolume: VoiceVolume;
}

/** Cadastro de quem cuida (familiar, vizinho, amigo...). */
export interface RegisterCaregiverInput {
  role: "cuidador";
  name: string;
  email: string;
  phone: string;
  password: string;
  /** Código de 6 dígitos mostrado no app da pessoa cuidada. */
  patientCode?: string;
  /** Usado quando a pessoa cuidada ainda não tem cadastro. */
  newPatient?: { name: string; birthYear: number; city: string };
  /** Contatos de nível 2: recebem alertas por WhatsApp/SMS, sem instalar o app. */
  supportContacts: { name: string; phone: string }[];
}

/** Cadastro da pessoa cuidada: liga a um código de cuidador ou cria o próprio perfil. */
export interface RegisterPersonInput {
  role: "pessoa";
  name: string;
  email: string;
  phone: string;
  password: string;
  patientCode?: string;
  newPatient?: { birthYear: number; city: string };
  accessibility: AccessibilityPrefs;
}

export type RegisterInput = RegisterCaregiverInput | RegisterPersonInput;

export interface Session {
  token: string;
  user: AppUser;
}

/**
 * Usuário como a API devolve (formato compartilhado com o portal web, em acolhe-web/src/types/user.ts).
 * O authService converte para AppUser.
 */
export interface ApiUser {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone?: string;
  patientIds: string[];
  accountRole?: "pessoa" | "cuidador" | "medico";
  displayName?: string;
  caregiverLinks?: { patientId: string; caregiverId: string }[];
  accessibility?: AccessibilityPrefs;
}

export interface ApiSession {
  token: string;
  user: ApiUser;
}

/** PATCH /auth/me (mesmo formato do acolhe-web): campos ausentes ficam como estão. */
export interface UpdateAccountInput {
  email?: string;
  phone?: string;
  accessibility?: Partial<AccessibilityPrefs>;
}

/** Quem cuida: familiares, vizinhos, amigos... combinado entre a família. */
export type CaregiverRelationType = "familiar" | "vizinho" | "amigo" | "cuidador_profissional" | "outro";

/** Por onde o alerta chega. "app" só existe para quem instalou o aplicativo. */
export type AlertChannel = "app" | "whatsapp" | "sms";

/**
 * "cuidador" (nível 1): usa o app e vê rotina/receitas conforme a permissão.
 * "apoio" (nível 2): só recebe alertas por WhatsApp/SMS, sem instalar nada.
 */
export type CaregiverLevel = "cuidador" | "apoio";

export type CaregiverStatus = "ativo" | "convite_pendente" | "pausado";

export interface CaregiverPermissions {
  receivesAlerts: boolean;
  canViewHealth: boolean;
  canViewRoutine: boolean;
}

export interface Caregiver {
  id: string;
  patientId: string;
  name: string;
  initials: string;
  /** Texto livre exibido na tela, ex.: "Filha", "Vizinha do 12". */
  relation: string;
  relationType: CaregiverRelationType;
  phone: string;
  /** Ordem de acionamento nos alertas (1 = primeiro). */
  order: number;
  status: CaregiverStatus;
  permissions: CaregiverPermissions;
  level: CaregiverLevel;
  /** Canais em ordem de tentativa. O primeiro é o preferido; os demais são alternativas. */
  channels: AlertChannel[];
  /** Minutos de espera antes de avisar a próxima pessoa da fila. */
  waitMinutes: number;
}

export interface InviteCaregiverInput {
  patientId: string;
  name: string;
  phone: string;
  relation: string;
  relationType: CaregiverRelationType;
  permissions: CaregiverPermissions;
  level: CaregiverLevel;
  channels: AlertChannel[];
  waitMinutes: number;
}

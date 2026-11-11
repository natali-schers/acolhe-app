export type PatientStatus = "estavel" | "atencao" | "em_alerta";

export interface Patient {
  id: string;
  name: string;
  fullName: string;
  initials: string;
  age: number;
  city: string;
  address: string;
  status: PatientStatus;
  /** Observação curta exibida quando o status é "atencao". */
  attentionNote?: string;
  lastActivityAt: string;
  batteryLevel: number;
  /** Adesão aos remédios nos últimos 30 dias, de 0 a 100. */
  adherence30d: number;
  /** Código de 6 dígitos para a família vincular a pessoa cuidada ao cadastro. */
  inviteCode?: string;
  phone?: string;
}

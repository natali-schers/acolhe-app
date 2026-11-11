import type { AlertChannel } from "./caregiver";

export type AlertStatus = "contagem" | "enviado" | "assumido" | "resolvido" | "cancelado";

export type RecipientStatus = "enviado" | "visto" | "assumiu" | "recusou";

export interface AlertRecipient {
  caregiverId: string;
  status: RecipientStatus;
  updatedAt: string;
  /** Canal pelo qual o aviso foi entregue (ou o último tentado). */
  channel?: AlertChannel;
  /** Canais que falharam antes de este funcionar, na ordem em que foram tentados. */
  failedChannels?: AlertChannel[];
}

export interface EmergencyAlert {
  id: string;
  patientId: string;
  createdAt: string;
  triggeredBy: string;
  status: AlertStatus;
  recipients: AlertRecipient[];
  assumedByCaregiverId?: string;
  /** Tempo até alguém assumir, em segundos. */
  responseTimeSeconds?: number;
  resolvedAt?: string;
  resultNote?: string;
  /** A pessoa estava sem internet: o pedido saiu por SMS. */
  offline?: boolean;
  /** Última localização conhecida, em texto. */
  location?: string;
}

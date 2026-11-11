export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dose: string;
  frequency: string;
  instructions: string;
  /** Horários do dia, formato HH:mm. */
  times: string[];
  continuousUse: boolean;
  adherence30d: number;
}

export type DoseStatus = "tomado" | "pendente" | "atrasado" | "adiado";

export interface MedicationDose {
  id: string;
  medicationId: string;
  patientId: string;
  scheduledAt: string;
  status: DoseStatus;
  confirmedBy?: string;
}

export interface AdherenceSummary {
  patientId: string;
  periodDays: number;
  taken: number;
  scheduled: number;
  late: number;
  notes: number;
  /** Percentual por dia, do mais antigo para o mais recente. */
  daily: { date: string; percent: number }[];
}

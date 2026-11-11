export type TimelineEntryType = "medicacao" | "anotacao" | "sintoma" | "atividade" | "alerta";

export interface TimelineEntry {
  id: string;
  patientId: string;
  at: string;
  type: TimelineEntryType;
  title: string;
  description: string;
  authorName: string;
  /** Destaca o item em amarelo (algo que merece atenção). */
  warn?: boolean;
}

export interface CreateNoteInput {
  patientId: string;
  title: string;
  description: string;
  type: TimelineEntryType;
  warn?: boolean;
}

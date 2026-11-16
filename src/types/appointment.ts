export type AppointmentMode = "online" | "presencial";

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  at: string;
  durationMinutes: number;
  mode: AppointmentMode;
  /** Endereço da consulta presencial (abre no Google Maps). */
  location?: string;
  /** Link da sala da consulta online. Virá do banco; fica vazio até o médico enviar. */
  meetingUrl?: string;
}

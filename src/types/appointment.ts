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
  location?: string;
}

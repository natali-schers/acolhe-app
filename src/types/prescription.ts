export interface PrescriptionItem {
  medication: string;
  dose: string;
  frequency: string;
  duration: string;
}

export type PrescriptionStatus = "ativa" | "encerrada";

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  doctorCrm: string;
  issuedAt: string;
  title: string;
  items: PrescriptionItem[];
  instructions: string;
  status: PrescriptionStatus;
  signed: boolean;
}

export interface CreatePrescriptionInput {
  patientId: string;
  items: PrescriptionItem[];
  instructions: string;
}

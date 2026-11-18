export type PatientStatus = "estavel" | "atencao" | "em_alerta";

/** Partes do endereço da pessoa cuidada (a cidade fica em Patient.city). */
export interface PatientAddress {
  /** CEP gravado como "01001-000". */
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  district?: string;
}

export interface Patient {
  id: string;
  name: string;
  fullName: string;
  initials: string;
  age: number;
  city: string;
  /** Endereço em uma linha ("Rua X, 123, apto 4 - Bairro"), usado nos alertas e no mapa. */
  address: string;
  /** Endereço separado em partes, para o formulário. */
  addressDetails?: PatientAddress;
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

/** PATCH /patients/:id/address: substitui o endereço inteiro (campo vazio apaga a parte). */
export interface UpdateAddressInput extends PatientAddress {
  city: string;
}

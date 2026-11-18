import type { PatientAddress } from "@/types";

/** Máscara do CEP enquanto a pessoa digita: "01001000" → "01001-000". */
export function formatZip(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

/** CEP vazio é aceito (é opcional); preenchido precisa ter os 8 números. */
export const isValidZip = (value: string) => [0, 8].includes(value.replace(/\D/g, "").length);

/** "Rua X, 123, apto 4 - Bairro": mesma regra da API, usada no modo de demonstração. */
export function addressLine(a: PatientAddress) {
  const street = [a.street, a.number, a.complement].map((p) => p?.trim()).filter(Boolean).join(", ");
  return [street, a.district?.trim()].filter(Boolean).join(" - ");
}

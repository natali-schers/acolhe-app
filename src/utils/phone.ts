/** Celular/telefone brasileiro com DDD: até 11 dígitos. */
export const PHONE_MAX_DIGITS = 11;

/** Só os dígitos, com DDD. Número colado da agenda com +55 perde o código do país. */
export function phoneDigits(value: string) {
  const digits = value.replace(/\D/g, "");
  const national = digits.length > PHONE_MAX_DIGITS && digits.startsWith("55") ? digits.slice(2) : digits;
  return national.slice(0, PHONE_MAX_DIGITS);
}

/** Válido com DDD: 10 dígitos (fixo) ou 11 (celular). */
export const isValidPhone = (value: string) => phoneDigits(value).length >= 10;

/**
 * Aplica a máscara enquanto a pessoa digita:
 * "11" → "(11", "119" → "(11) 9", "1190000" → "(11) 9000-0", 11 dígitos → "(11) 90000-0000".
 */
export function formatPhone(value: string) {
  const d = phoneDigits(value);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  const ddd = d.slice(0, 2);
  const rest = d.slice(2);
  if (rest.length <= 4) return `(${ddd}) ${rest}`;
  // 10 dígitos: (11) 9000-0000 · 11 dígitos: (11) 90000-0000
  const split = d.length === 11 ? 5 : 4;
  return `(${ddd}) ${rest.slice(0, split)}-${rest.slice(split)}`;
}

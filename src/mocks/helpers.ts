import { apiConfig } from "@/services/config";

/** Simula a latência de rede e devolve uma cópia (para não vazar referências do "banco"). */
export function mockResponse<T>(data: T, delay = apiConfig.mockDelay): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(JSON.parse(JSON.stringify(data ?? null)) as T), delay));
}

export function mockError(message: string, delay = apiConfig.mockDelay): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(new Error(message)), delay));
}

export function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

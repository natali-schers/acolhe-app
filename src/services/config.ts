/**
 * Configuração da camada de dados.
 * Variáveis EXPO_PUBLIC_* vêm do arquivo .env (veja .env.example).
 */
export const apiConfig = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3333/api",
  /** Enquanto for true, os serviços usam src/mocks em vez da API. */
  useMocks: process.env.EXPO_PUBLIC_USE_MOCKS !== "false",
  mockDelay: 300,
};

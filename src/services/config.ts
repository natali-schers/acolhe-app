/**
 * Configuração da camada de dados.
 * Variáveis EXPO_PUBLIC_* vêm do arquivo .env (veja .env.example).
 */
export const apiConfig = {
  /** API do Acolhe (fica no repositório acolhe-web). No celular, use o IP da sua rede ou a URL do Vercel, nunca localhost. */
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3334/api",
  /** Enquanto for true, os serviços usam src/mocks em vez da API. */
  useMocks: process.env.EXPO_PUBLIC_USE_MOCKS !== "false",
  mockDelay: 300,
  /** De quanto em quanto tempo o app confere os alertas: com alerta em andamento e sem alerta. */
  alertPollMs: { active: 4_000, idle: 15_000 },
};

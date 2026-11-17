/** Versão para o navegador (expo start --web): o SecureStore não existe na web. */
const KEY = "acolhe.session-token";

export const tokenStorage = {
  get: async () => globalThis.localStorage?.getItem(KEY) ?? null,
  set: async (token: string) => globalThis.localStorage?.setItem(KEY, token),
  remove: async () => globalThis.localStorage?.removeItem(KEY),
};

/**
 * Guarda o token de login no aparelho (Keychain no iPhone, Keystore no Android).
 * Sem isso a pessoa teria que entrar de novo toda vez que abrisse o app, e o widget de SOS não funcionaria.
 * No navegador o Metro usa tokenStorage.web.ts.
 */
import * as SecureStore from "expo-secure-store";

const KEY = "acolhe.session-token";

export const tokenStorage = {
  get: () => SecureStore.getItemAsync(KEY),
  set: (token: string) => SecureStore.setItemAsync(KEY, token),
  remove: () => SecureStore.deleteItemAsync(KEY),
};

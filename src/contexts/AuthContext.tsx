import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { router } from "expo-router";
import { ApiError, authService, setAuthToken, setUnauthorizedHandler, tokenStorage } from "@/services";
import type { AppRole, AppUser, RegisterInput, Session } from "@/types";

interface AuthContextValue {
  user: AppUser | null;
  login: (login: string, password: string) => Promise<AppUser>;
  loginAsDemo: (role: AppRole) => Promise<AppUser>;
  register: (input: RegisterInput) => Promise<AppUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Sessão do usuário. O token fica salvo no aparelho (SecureStore) para a pessoa continuar logada
 * ao reabrir o app — essencial para o widget de SOS funcionar sem pedir login.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [restoring, setRestoring] = useState(true);

  const clearSession = useCallback(() => {
    setAuthToken(null);
    setSession(null);
    tokenStorage.remove().catch(() => undefined);
  }, []);

  // Ao abrir o app: recupera a sessão salva. Token inválido ou expirado é descartado.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await tokenStorage.get();
        if (!token) return;
        setAuthToken(token);
        const restored = await authService.me(token);
        if (!cancelled) setSession(restored);
      } catch (e) {
        // Sem internet: não apaga o token, a pessoa tenta de novo ao reabrir. Só descarta se o servidor recusou.
        setAuthToken(null);
        if (e instanceof ApiError && e.status !== 0) tokenStorage.remove().catch(() => undefined);
      } finally {
        if (!cancelled) setRestoring(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Sessão expirou no meio do uso: volta para a tela inicial (mesmo caminho do "Sair").
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
      router.replace("/");
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const apply = useCallback(async (next: Session) => {
    setAuthToken(next.token);
    await tokenStorage.set(next.token).catch(() => undefined);
    setSession(next);
    return next.user;
  }, []);

  const login = useCallback(async (l: string, p: string) => apply(await authService.login(l, p)), [apply]);
  const loginAsDemo = useCallback(async (role: AppRole) => apply(await authService.loginAsDemo(role)), [apply]);
  const register = useCallback(async (input: RegisterInput) => apply(await authService.register(input)), [apply]);
  const logout = useCallback(() => {
    authService.logout();
    clearSession();
  }, [clearSession]);

  const value = useMemo(() => ({ user: session?.user ?? null, login, loginAsDemo, register, logout }), [session, login, loginAsDemo, register, logout]);

  // Enquanto confere a sessão salva, não mostra nada (como no carregamento das fontes): evita piscar a tela de login.
  if (restoring) return null;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return ctx;
}

/** Para telas que só abrem com alguém logado. */
export function useCurrentUser(): AppUser {
  const { user } = useAuth();
  if (!user) throw new Error("Usuário não autenticado");
  return user;
}

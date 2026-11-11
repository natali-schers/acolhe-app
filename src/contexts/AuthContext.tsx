import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { authService, setAuthToken } from "@/services";
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
 * Sessão do usuário.
 * TODO backend: guardar o token com expo-secure-store para manter a pessoa logada
 * (essencial para o widget de SOS funcionar sem pedir login).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  const apply = useCallback((next: Session) => {
    setAuthToken(next.token);
    setSession(next);
    return next.user;
  }, []);

  const login = useCallback(async (l: string, p: string) => apply(await authService.login(l, p)), [apply]);
  const loginAsDemo = useCallback(async (role: AppRole) => apply(await authService.loginAsDemo(role)), [apply]);
  const register = useCallback(async (input: RegisterInput) => apply(await authService.register(input)), [apply]);
  const logout = useCallback(() => {
    setAuthToken(null);
    setSession(null);
  }, []);

  const value = useMemo(() => ({ user: session?.user ?? null, login, loginAsDemo, register, logout }), [session, login, loginAsDemo, register, logout]);
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

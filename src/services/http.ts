import { apiConfig } from "./config";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let authToken: string | null = null;

/** Chamado pelo AuthContext ao entrar/sair. */
export function setAuthToken(token: string | null) {
  authToken = token;
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${apiConfig.baseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new ApiError(response.status, message || "Erro ao comunicar com o servidor");
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/** Cliente HTTP usado pelos serviços quando apiConfig.useMocks = false. */
export const http = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { router } from "expo-router";
import { useAuth } from "./AuthContext";
import { alertService, apiConfig } from "@/services";
import type { EmergencyAlert } from "@/types";

interface EmergencyContextValue {
  /** Alerta em andamento (ou o último, enquanto a tela de resultado estiver aberta). */
  alert: EmergencyAlert | null;
  /** Demonstração: finge que a pessoa cuidada está sem internet, e o alerta sai por SMS. */
  offline: boolean;
  setOffline: (value: boolean) => void;
  /** Pessoa cuidada: envia o pedido de ajuda (depois da contagem). */
  sendAlert: () => Promise<void>;
  cancelAlert: () => Promise<void>;
  /** Cuidador: assume ou recusa o atendimento. */
  respond: (answer: "assumiu" | "recusou") => Promise<void>;
  resolveAlert: () => Promise<void>;
  clear: () => void;
  /** Só na demonstração: cuidador recebe um alerta como se a Dona Maria tivesse apertado o botão. */
  simulateIncomingAlert: () => Promise<void>;
}

const EmergencyContext = createContext<EmergencyContextValue | null>(null);

export function EmergencyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [alert, setAlert] = useState<EmergencyAlert | null>(null);
  const [offline, setOffline] = useState(false);
  /** Alertas que já abriram a tela de "recebido": o mesmo alerta chega várias vezes enquanto muda. */
  const announced = useRef(new Set<string>());

  // Ouve os alertas da pessoa cuidada em "tempo real" (com a API, por consulta periódica).
  useEffect(() => {
    if (!user) return;
    const unsubscribe = alertService.subscribe(user.patientId, (incoming) => {
      // Cancelado (por quem pediu ajuda): some da tela de todos.
      if (incoming.status === "cancelado") {
        setAlert((current) => (current?.id === incoming.id ? null : current));
        return;
      }
      // Resolvido: só atualiza quem ainda está vendo este alerta (não reabre uma tela já fechada).
      if (incoming.status === "resolvido") {
        setAlert((current) => (current?.id === incoming.id ? incoming : current));
        return;
      }
      setAlert(incoming);
      const isNewForCaregiver =
        user.role === "cuidador" &&
        incoming.status === "enviado" &&
        !announced.current.has(incoming.id) &&
        incoming.recipients.some((r) => r.caregiverId === user.caregiverId && r.status === "enviado");
      if (isNewForCaregiver) {
        announced.current.add(incoming.id);
        router.push("/emergencia/recebido");
      }
    });
    if (apiConfig.useMocks) alertService.getActive(user.patientId).then((active) => active && setAlert(active));
    return unsubscribe;
  }, [user]);

  const sendAlert = useCallback(async () => {
    if (!user) return;
    setAlert(await alertService.trigger(user.patientId, user.displayName, true, offline));
  }, [user, offline]);

  const cancelAlert = useCallback(async () => {
    if (alert) await alertService.cancel(alert.id);
    setAlert(null);
  }, [alert]);

  const respond = useCallback(async (answer: "assumiu" | "recusou") => {
    if (!alert || !user?.caregiverId) return;
    setAlert(await alertService.respond(alert.id, user.caregiverId, answer));
  }, [alert, user]);

  const resolveAlert = useCallback(async () => {
    if (alert) setAlert(await alertService.resolve(alert.id));
  }, [alert]);

  const simulateIncomingAlert = useCallback(async () => {
    if (!user) return;
    await alertService.trigger(user.patientId, "Dona Maria", false);
  }, [user]);

  const clear = useCallback(() => setAlert(null), []);

  const value = useMemo(
    () => ({ alert, offline, setOffline, sendAlert, cancelAlert, respond, resolveAlert, clear, simulateIncomingAlert }),
    [alert, offline, sendAlert, cancelAlert, respond, resolveAlert, clear, simulateIncomingAlert],
  );
  return <EmergencyContext.Provider value={value}>{children}</EmergencyContext.Provider>;
}

export function useEmergency() {
  const ctx = useContext(EmergencyContext);
  if (!ctx) throw new Error("useEmergency precisa estar dentro de <EmergencyProvider>");
  return ctx;
}

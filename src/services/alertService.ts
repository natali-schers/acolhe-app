/**
 * Alertas de emergência (o coração do Acolhe).
 *
 * Com backend real:
 *  - trigger/cancel/respond/resolve viram chamadas HTTP;
 *  - subscribe deve ouvir um canal em tempo real (WebSocket/SSE) e/ou notificações push.
 *
 * No modo simulado, um "emissor" em memória faz o papel do servidor e simula a rede respondendo.
 */
import { apiConfig } from "./config";
import { http } from "./http";
import { alerts, caregivers, patients } from "@/mocks/db";
import { createId, mockError, mockResponse } from "@/mocks/helpers";
import type { AlertChannel, Caregiver, EmergencyAlert, RecipientStatus } from "@/types";

type Listener = (alert: EmergencyAlert) => void;
const listeners = new Map<string, Set<Listener>>();
const simulationTimers = new Map<string, ReturnType<typeof setTimeout>[]>();

function emit(alert: EmergencyAlert) {
  const copy = JSON.parse(JSON.stringify(alert)) as EmergencyAlert;
  listeners.get(alert.patientId)?.forEach((listener) => listener(copy));
}

function findAlert(id: string) {
  return alerts.find((a) => a.id === id);
}

function setRecipient(alert: EmergencyAlert, caregiverId: string, status: RecipientStatus) {
  const recipient = alert.recipients.find((r) => r.caregiverId === caregiverId);
  if (recipient) {
    recipient.status = status;
    recipient.updatedAt = new Date().toISOString();
  }
}

/** Simula a rede de cuidadores respondendo a um alerta (só no modo mock). */
function simulateNetworkResponse(alert: EmergencyAlert) {
  const [first, second] = alert.recipients;
  const steps: [number, () => void][] = [
    [1500, () => first && setRecipient(alert, first.caregiverId, "visto")],
    [2600, () => second && setRecipient(alert, second.caregiverId, "visto")],
    [5000, () => {
      if (!first) return;
      setRecipient(alert, first.caregiverId, "assumiu");
      alert.status = "assumido";
      alert.assumedByCaregiverId = first.caregiverId;
      alert.responseTimeSeconds = Math.round((Date.now() - new Date(alert.createdAt).getTime()) / 1000);
    }],
  ];
  simulationTimers.set(alert.id, steps.map(([delay, step]) => setTimeout(() => {
    if (alert.status === "cancelado" || alert.status === "resolvido") return;
    step();
    emit(alert);
  }, delay)));
}

function stopSimulation(alertId: string) {
  simulationTimers.get(alertId)?.forEach(clearTimeout);
  simulationTimers.delete(alertId);
}

/**
 * Decide por qual canal cada pessoa é avisada.
 * Normal: o primeiro canal da lista dela. Sem internet na pessoa cuidada: sai por SMS,
 * e os canais que dependem de internet aparecem como "falharam".
 */
function pickChannel(c: Caregiver, offline: boolean): { channel: AlertChannel; failedChannels: AlertChannel[] } {
  if (!offline) return { channel: c.channels[0], failedChannels: [] };
  const sms = c.channels.indexOf("sms");
  return sms >= 0
    ? { channel: "sms", failedChannels: c.channels.slice(0, sms) }
    : { channel: c.channels[0], failedChannels: [] };
}

export const alertService = {
  /** Ouve mudanças nos alertas da pessoa cuidada. Devolve a função para parar de ouvir. */
  subscribe(patientId: string, listener: Listener): () => void {
    // Backend real: abrir WebSocket aqui, ex.: new WebSocket(`${wsUrl}/patients/${patientId}/alerts`)
    if (!listeners.has(patientId)) listeners.set(patientId, new Set());
    listeners.get(patientId)!.add(listener);
    return () => listeners.get(patientId)?.delete(listener);
  },

  async listByPatient(patientId: string): Promise<EmergencyAlert[]> {
    if (!apiConfig.useMocks) return http.get<EmergencyAlert[]>(`/patients/${patientId}/alerts`);
    return mockResponse(
      alerts.filter((a) => a.patientId === patientId && a.status !== "cancelado").sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  },

  async getActive(patientId: string): Promise<EmergencyAlert | null> {
    if (!apiConfig.useMocks) return http.get<EmergencyAlert | null>(`/patients/${patientId}/alerts/active`);
    return mockResponse(alerts.find((a) => a.patientId === patientId && (a.status === "enviado" || a.status === "assumido")) ?? null, 100);
  },

  /**
   * Envia o pedido de ajuda para a rede.
   * @param simulateResponses no modo mock, simula os cuidadores respondendo (usado na demo da pessoa cuidada).
   */
  async trigger(patientId: string, triggeredBy: string, simulateResponses = true, offline = false): Promise<EmergencyAlert> {
    if (!apiConfig.useMocks) return http.post<EmergencyAlert>(`/patients/${patientId}/alerts`, { triggeredBy });
    const now = new Date().toISOString();
    const alert: EmergencyAlert = {
      id: createId("a"),
      patientId,
      createdAt: now,
      triggeredBy,
      status: "enviado",
      offline,
      location: patients.find((p) => p.id === patientId)?.address,
      recipients: caregivers
        .filter((c) => c.patientId === patientId && c.status === "ativo" && c.permissions.receivesAlerts)
        .sort((a, b) => a.order - b.order)
        .map((c) => ({ caregiverId: c.id, status: "enviado" as const, updatedAt: now, ...pickChannel(c, offline) })),
    };
    alerts.push(alert);
    emit(alert);
    if (simulateResponses) simulateNetworkResponse(alert);
    return mockResponse(alert, 150);
  },

  async cancel(alertId: string): Promise<EmergencyAlert> {
    if (!apiConfig.useMocks) return http.post<EmergencyAlert>(`/alerts/${alertId}/cancel`);
    const alert = findAlert(alertId);
    if (!alert) return mockError("Alerta não encontrado.");
    stopSimulation(alertId);
    alert.status = "cancelado";
    emit(alert);
    return mockResponse(alert, 100);
  },

  /** Cuidador responde: assume o atendimento ou diz que não pode. */
  async respond(alertId: string, caregiverId: string, answer: "assumiu" | "recusou"): Promise<EmergencyAlert> {
    if (!apiConfig.useMocks) return http.post<EmergencyAlert>(`/alerts/${alertId}/respond`, { caregiverId, answer });
    const alert = findAlert(alertId);
    if (!alert) return mockError("Alerta não encontrado.");
    setRecipient(alert, caregiverId, answer);
    if (answer === "assumiu" && alert.status === "enviado") {
      stopSimulation(alertId);
      alert.status = "assumido";
      alert.assumedByCaregiverId = caregiverId;
      alert.responseTimeSeconds = Math.round((Date.now() - new Date(alert.createdAt).getTime()) / 1000);
    }
    emit(alert);
    return mockResponse(alert, 150);
  },

  /** Encerra o atendimento ("Cheguei, está tudo bem"). */
  async resolve(alertId: string, resultNote = "Tudo bem"): Promise<EmergencyAlert> {
    if (!apiConfig.useMocks) return http.post<EmergencyAlert>(`/alerts/${alertId}/resolve`, { resultNote });
    const alert = findAlert(alertId);
    if (!alert) return mockError("Alerta não encontrado.");
    stopSimulation(alertId);
    alert.status = "resolvido";
    alert.resolvedAt = new Date().toISOString();
    alert.resultNote = resultNote;
    emit(alert);
    return mockResponse(alert, 150);
  },
};

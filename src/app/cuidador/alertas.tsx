import { useQuery } from "@tanstack/react-query";
import { View } from "react-native";
import { AppText, Card, InfoBanner, Screen, ScreenHeader, StatusTag } from "@/components/ui";
import { QueryState } from "@/components/domain";
import { useCurrentUser } from "@/contexts/AuthContext";
import { useEmergency } from "@/contexts/EmergencyContext";
import { useCaregivers } from "@/hooks/useCare";
import { alertService } from "@/services";
import { spacing } from "@/theme";
import { formatDuration, formatShortDate, formatTime } from "@/utils/date";

/** Histórico de pedidos de ajuda e quem atendeu. */
export default function AlertasScreen() {
  const user = useCurrentUser();
  const { alert } = useEmergency();
  const { data: caregivers = [] } = useCaregivers(user.patientId);
  const query = useQuery({
    // Recarrega quando o alerta atual muda de estado.
    queryKey: ["alerts", user.patientId, alert?.id, alert?.status],
    queryFn: () => alertService.listByPatient(user.patientId),
  });

  return (
    <Screen>
      <ScreenHeader overline="Segurança" title="Alertas" />
      <QueryState query={query}>
        {(alerts) =>
          alerts.length === 0 ? (
            <InfoBanner icon="shield" title="Nenhum alerta registrado" />
          ) : (
            alerts.map((a) => {
              const who = caregivers.find((c) => c.id === a.assumedByCaregiverId);
              const tone = a.status === "resolvido" ? "success" : a.status === "assumido" ? "info" : "danger";
              const label = a.status === "resolvido" ? a.resultNote ?? "Resolvido" : a.status === "assumido" ? "Em atendimento" : "Aguardando";
              return (
                <Card key={a.id}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm }}>
                    <AppText bold size="lg">{formatShortDate(a.createdAt)} • {formatTime(a.createdAt)}</AppText>
                    <StatusTag label={label} tone={tone} />
                  </View>
                  <AppText color="textMuted" style={{ marginTop: 6 }}>Acionado por {a.triggeredBy}</AppText>
                  {who && <AppText>Atendido por <AppText bold>{who.name}</AppText>{a.responseTimeSeconds != null ? ` em ${formatDuration(a.responseTimeSeconds)}` : ""}</AppText>}
                </Card>
              );
            })
          )
        }
      </QueryState>
    </Screen>
  );
}

import { Linking, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { AppText, Button, Card, Icon, InfoBanner, Screen, ScreenHeader } from "@/components/ui";
import { InfoRow, QueryState, Timeline } from "@/components/domain";
import { useCurrentUser } from "@/contexts/AuthContext";
import { useEmergency } from "@/contexts/EmergencyContext";
import { usePatient, useTimeline, useTodayDoses } from "@/hooks/useCare";
import { useLogoutPrompt } from "@/hooks/useLogoutPrompt";
import { apiConfig } from "@/services";
import { colors, spacing } from "@/theme";
import { formatTime, formatTimeAgo } from "@/utils/date";

export default function CuidadorHome() {
  const user = useCurrentUser();
  const logoutPrompt = useLogoutPrompt();
  const { alert, resolveAlert, clear, simulateIncomingAlert } = useEmergency();
  const patientQuery = usePatient(user.patientId);
  const { data: doses } = useTodayDoses(user.patientId);
  const timeline = useTimeline(user.patientId);

  const iAmGoing = alert?.status === "assumido" && alert.assumedByCaregiverId === user.caregiverId;
  const someoneElseGoing = alert?.status === "assumido" && !iAmGoing;
  const waiting = alert?.status === "enviado";
  const nextDose = doses?.find((d) => d.status !== "tomado");

  return (
    <Screen>
      <QueryState query={patientQuery}>
        {(patient) => (
          <>
            <ScreenHeader overline={`Olá, ${user.displayName}`} title={patient.name} avatar={user.initials} onAvatarPress={logoutPrompt} />

            {iAmGoing ? (
              <View style={{ alignItems: "center", paddingTop: spacing.lg }}>
                <View style={styles.check}><Icon name="check" size={36} color="textOnPrimary" /></View>
                <AppText size="xxl" bold center style={{ marginTop: spacing.lg }}>Você está indo</AppText>
                <AppText size="lg" color="textMuted" center>{patient.name} e toda a rede já foram avisados.</AppText>
                <Card style={styles.eta}>
                  <Icon name="map-pin" color="primary" />
                  <View style={{ flex: 1 }}>
                    <AppText size="xs" bold color="textMuted">ENDEREÇO</AppText>
                    <AppText bold size="lg">{patient.address}</AppText>
                  </View>
                </Card>
                <View style={{ alignSelf: "stretch", gap: spacing.sm }}>
                  <Button label="Abrir no mapa" icon="navigation" variant="secondary" size="lg" onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(`${patient.address}, ${patient.city}`)}`)} />
                  <Button label="Cheguei, está tudo bem" icon="check" size="lg" onPress={resolveAlert} />
                  <Button label="Preciso de socorro (192)" icon="alert-triangle" variant="dangerOutline" size="lg" onPress={() => Linking.openURL("tel:192")} />
                </View>
              </View>
            ) : (
              <>
                {waiting && (
                  <Button label={`${patient.name} precisa de ajuda — abrir`} variant="danger" icon="bell" size="lg" onPress={() => router.push("/emergencia/recebido")} style={{ marginBottom: spacing.md }} />
                )}
                {alert?.status === "resolvido" && (
                  <InfoBanner icon="check-circle" title="Atendimento encerrado" description="Obrigado por cuidar!" style={{ marginBottom: spacing.md }} />
                )}
                {someoneElseGoing ? (
                  <InfoBanner icon="navigation" tone="info" title="Alguém da rede já está indo" description="Fique atento ao celular." />
                ) : (
                  <InfoBanner
                    icon="shield"
                    title={`${patient.name} está bem`}
                    description={`Última atividade ${formatTimeAgo(patient.lastActivityAt).toLowerCase()} • Bateria ${patient.batteryLevel}%`}
                  />
                )}

                <AppText size="lg" bold style={styles.subheading}>Próximos cuidados</AppText>
                {nextDose ? (
                  <InfoRow icon="package" overline={`Hoje, ${formatTime(nextDose.scheduledAt)}`} title={`${nextDose.medication.name} ${nextDose.medication.dose}`} subtitle="Ainda não confirmado" />
                ) : (
                  <InfoBanner icon="check" title="Todos os remédios de hoje foram tomados" />
                )}

                <AppText size="lg" bold style={styles.subheading}>Atividade recente</AppText>
                <QueryState query={timeline}>{(entries) => <Timeline entries={entries.slice(0, 3)} showAuthor={false} />}</QueryState>
                <Button label="Ver rotina completa" variant="secondary" onPress={() => router.push("/cuidador/rotina")} />

                {apiConfig.useMocks && (
                  <View style={styles.demo}>
                    <AppText size="sm" color="textMuted" center>Demonstração: simula a Dona Maria apertando o botão de ajuda.</AppText>
                    <Button label="Simular alerta" variant="ghost" icon="zap" onPress={() => { clear(); simulateIncomingAlert(); }} />
                  </View>
                )}
              </>
            )}
          </>
        )}
      </QueryState>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subheading: { marginTop: spacing.xl, marginBottom: spacing.sm },
  check: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.success, alignItems: "center", justifyContent: "center" },
  eta: { flexDirection: "row", alignItems: "center", gap: spacing.md, alignSelf: "stretch", marginVertical: spacing.xl },
  demo: { marginTop: spacing.xxl, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
});

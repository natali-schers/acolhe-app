import { ActivityIndicator, Linking, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { AppText, Button, Icon, InfoBanner, Screen } from "@/components/ui";
import { RecipientList } from "@/components/domain";
import { useCurrentUser } from "@/contexts/AuthContext";
import { useEmergency } from "@/contexts/EmergencyContext";
import { useCaregivers } from "@/hooks/useCare";
import { colors, spacing } from "@/theme";

/** Pessoa cuidada: acompanha quem viu e quem assumiu o pedido de ajuda. */
export default function AlertSentScreen() {
  const user = useCurrentUser();
  const { alert, cancelAlert, clear } = useEmergency();
  const { data: caregivers = [] } = useCaregivers(user.patientId);

  const goHome = () => {
    clear();
    router.replace("/pessoa");
  };

  if (!alert) {
    return (
      <Screen scroll={false} contentStyle={{ alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.danger} />
        <AppText size="lg" style={{ marginTop: spacing.md }}>Enviando alerta...</AppText>
      </Screen>
    );
  }

  const helper = caregivers.find((c) => c.id === alert.assumedByCaregiverId);
  const assumed = alert.status === "assumido";
  const resolved = alert.status === "resolvido";

  const title = resolved ? "Atendimento encerrado" : assumed && helper ? `${helper.name} está indo ajudar` : "Alerta enviado!";
  const text = resolved
    ? "Que bom que está tudo bem."
    : assumed ? "Você não está sozinha. Fique tranquila, a ajuda está a caminho."
    : "Avisamos sua rede de cuidado. Fique calma, estamos acompanhando.";

  return (
    <Screen edges={["top", "bottom"]}>
      <View style={{ alignItems: "center", marginTop: spacing.lg }}>
        <View style={[styles.check, !(assumed || resolved) && { backgroundColor: colors.primary }]}>
          <Icon name="check" size={38} color="textOnPrimary" />
        </View>
        <AppText size="xxl" bold center style={{ marginTop: spacing.lg }} accessibilityRole="header" accessibilityLiveRegion="polite">{title}</AppText>
        <AppText size="lg" color="textMuted" center style={{ marginBottom: spacing.xl }}>{text}</AppText>
      </View>

      {alert.offline && (
        <InfoBanner
          icon="wifi-off"
          tone="warning"
          title="Você está sem internet"
          description="Avisamos sua rede por SMS. Quem não tem SMS recebe quando a conexão voltar."
          style={{ marginBottom: spacing.md }}
        />
      )}
      <RecipientList recipients={alert.recipients} caregivers={caregivers} />

      {assumed || resolved ? (
        <>
          {assumed && <InfoBanner icon="phone" tone="info" title="Mantenha o celular por perto" description={`${helper?.name ?? "A pessoa"} pode ligar para você.`} style={{ marginVertical: spacing.lg }} />}
          <Button label="Voltar ao início" variant="secondary" size="lg" onPress={goHome} style={{ marginTop: spacing.md }} />
        </>
      ) : (
        <>
          <View style={styles.waiting}>
            <ActivityIndicator color={colors.success} />
            <AppText color="textMuted">Aguardando alguém assumir...</AppText>
          </View>
          <Button label="Cancelar alerta" variant="ghost" onPress={() => cancelAlert().then(goHome)} />
        </>
      )}

      <Button label="Ligar 192 (Samu)" variant="dangerOutline" icon="phone" onPress={() => Linking.openURL("tel:192")} style={{ marginTop: spacing.lg }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  check: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.success, alignItems: "center", justifyContent: "center" },
  waiting: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, marginTop: spacing.xl, marginBottom: spacing.sm },
});

import { Linking, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { AppText, Button, Eyebrow, Icon, Screen } from "@/components/ui";
import { QueryState } from "@/components/domain";
import { useCurrentUser } from "@/contexts/AuthContext";
import { useEmergency } from "@/contexts/EmergencyContext";
import { usePatient } from "@/hooks/useCare";
import { colors, radius, spacing } from "@/theme";
import { formatTimeAgo } from "@/utils/date";

/** Cuidador: chegou um pedido de ajuda. Assumir ou dizer que não pode. */
export default function AlertReceivedScreen() {
  const user = useCurrentUser();
  const { alert, respond } = useEmergency();
  const patientQuery = usePatient(user.patientId);

  const close = () => (router.canGoBack() ? router.back() : router.replace("/cuidador"));

  return (
    <Screen edges={["top", "bottom"]} background={colors.dangerSoft}>
      <QueryState query={patientQuery}>
        {(patient) => (
          <View style={{ alignItems: "center" }}>
            <View style={styles.icon}><Icon name="bell" size={36} color="danger" /></View>
            <View style={{ marginTop: spacing.lg }}><Eyebrow color="danger">{`Alerta de ${patient.name}`}</Eyebrow></View>
            <AppText size="xxl" bold center accessibilityRole="header">{patient.name} precisa de ajuda</AppText>
            <AppText size="lg" color="textMuted" center>
              {alert ? `Enviado ${formatTimeAgo(alert.createdAt).toLowerCase()}` : "Agora"} • {patient.address}
            </AppText>

            <View style={styles.map} accessible accessibilityLabel={`Endereço: ${patient.address}, ${patient.city}`}>
              <View style={[styles.road, { transform: [{ rotate: "-12deg" }] }]} />
              <View style={[styles.road, { transform: [{ rotate: "62deg" }] }]} />
              <View style={styles.pin}><AppText bold color="textOnPrimary">{patient.initials}</AppText></View>
            </View>

            <View style={{ alignSelf: "stretch", gap: spacing.sm }}>
              <Button
                label="Assumir e ir ajudar"
                icon="check"
                variant="danger"
                size="lg"
                disabled={!alert || alert.status !== "enviado"}
                onPress={async () => { await respond("assumiu"); router.replace("/cuidador"); }}
              />
              {alert?.status === "assumido" && (
                <AppText bold color="success" center>Alguém da rede já assumiu este alerta.</AppText>
              )}
              <Button label="Não posso agora" variant="secondary" size="lg" onPress={async () => { await respond("recusou"); close(); }} />
              <Button label={`Ligar para ${patient.name}`} icon="phone" variant="ghost" onPress={() => Linking.openURL("tel:11999990000")} />
            </View>
          </View>
        )}
      </QueryState>
    </Screen>
  );
}

const styles = StyleSheet.create({
  icon: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", marginTop: spacing.lg },
  map: { alignSelf: "stretch", height: 180, borderRadius: radius.lg, backgroundColor: "#e0e7df", overflow: "hidden", marginVertical: spacing.xl, alignItems: "center", justifyContent: "center" },
  road: { position: "absolute", width: "140%", height: 20, backgroundColor: colors.surface },
  pin: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.danger, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: colors.surface },
});

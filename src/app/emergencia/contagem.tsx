import { useEffect, useRef, useState } from "react";
import { BackHandler, Platform, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { AppText, Button, Icon, Screen } from "@/components/ui";
import { useEmergency } from "@/contexts/EmergencyContext";
import { colors, spacing } from "@/theme";

const SECONDS = 5;

/** Contagem antes de enviar o alerta: dá tempo de cancelar um toque sem querer. */
export default function CountdownScreen() {
  const { sendAlert } = useEmergency();
  const [count, setCount] = useState(SECONDS);
  const sent = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => setCount((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    if (count === 0 && !sent.current) {
      sent.current = true;
      sendAlert().finally(() => router.replace("/emergencia/enviado"));
    }
  }, [count, sendAlert]);

  const cancel = () => {
    sent.current = true;
    if (router.canGoBack()) router.back();
    else router.replace("/pessoa");
  };

  // Botão "voltar" do Android também cancela.
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      cancel();
      return true;
    });
    return () => sub.remove();
  }, []);

  return (
    <Screen edges={["top", "bottom"]} contentStyle={{ alignItems: "center", paddingTop: spacing.xxl }}>
      <View style={styles.icon}><Icon name="bell" size={36} color="danger" /></View>
      <AppText size="xxl" bold center style={{ marginTop: spacing.lg }} accessibilityRole="header">Vamos avisar sua rede</AppText>
      <AppText size="lg" color="textMuted" center>O alerta será enviado em</AppText>

      <View style={styles.ring} accessible accessibilityLabel={`${count} segundos`} accessibilityLiveRegion="assertive">
        <AppText bold color="danger" style={{ fontSize: 84, lineHeight: 96 }}>{count}</AppText>
      </View>
      <AppText size="lg" color="textMuted" style={{ marginBottom: spacing.xl }}>segundos</AppText>

      <Button label="Cancelar" variant="dangerOutline" size="lg" onPress={cancel} style={{ alignSelf: "stretch", minHeight: 68 }} />
      <AppText color="textMuted" center style={{ marginTop: spacing.md }}>Toque em cancelar se você apertou sem querer.</AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  icon: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.dangerSoft, alignItems: "center", justifyContent: "center" },
  ring: {
    width: 190, height: 190, borderRadius: 95, borderWidth: 12, borderColor: colors.danger,
    alignItems: "center", justifyContent: "center", marginTop: spacing.xl, marginBottom: 4,
  },
});

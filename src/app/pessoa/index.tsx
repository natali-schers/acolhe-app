import { Linking, View } from "react-native";
import { router } from "expo-router";
import { AppText, Button, InfoBanner, Screen, ScreenHeader } from "@/components/ui";
import { HelpButton, InfoRow } from "@/components/domain";
import { useCurrentUser } from "@/contexts/AuthContext";
import { useEmergency } from "@/contexts/EmergencyContext";
import { apiConfig } from "@/services";
import { useAppointments, useTodayDoses } from "@/hooks/useCare";
import { greeting, useLogoutPrompt } from "@/hooks/useLogoutPrompt";
import { colors, spacing } from "@/theme";
import { formatDayAndTime, formatTime } from "@/utils/date";

/** Início da pessoa cuidada: botão de ajuda em destaque. */
export default function PessoaHome() {
  const user = useCurrentUser();
  const { offline, setOffline } = useEmergency();
  const logoutPrompt = useLogoutPrompt();
  const { data: doses } = useTodayDoses(user.patientId);
  const { data: appointments } = useAppointments(user.patientId);

  const nextDose = doses?.find((d) => d.status !== "tomado");
  const nextAppointment = appointments?.find((a) => new Date(a.at) > new Date());

  return (
    <Screen>
      <ScreenHeader overline={greeting()} title={user.displayName} avatar={user.initials} onAvatarPress={logoutPrompt} />
      <InfoBanner icon="shield" title="Tudo tranquilo por aqui" description="Sua rede de cuidado está conectada" />

      <AppText size="lg" color="textMuted" center style={{ marginTop: spacing.xl }}>Se precisar, toque no botão abaixo</AppText>
      <HelpButton onPress={() => router.push("/emergencia/contagem")} />

      {nextDose && (
        <InfoRow
          icon="package"
          overline="Próximo remédio"
          title={`${nextDose.medication.name} ${nextDose.medication.dose}`}
          subtitle={nextDose.medication.instructions}
          trailing={<AppText size="xl" bold color="primary">{formatTime(nextDose.scheduledAt)}</AppText>}
          onPress={() => router.push("/pessoa/remedios")}
        />
      )}
      {nextAppointment && (
        <InfoRow
          icon="calendar"
          iconTone="info"
          overline="Próxima consulta"
          title={nextAppointment.doctorName}
          subtitle={`${formatDayAndTime(nextAppointment.at)} • ${nextAppointment.mode === "online" ? "Online" : "Presencial"}`}
        />
      )}

      <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
        <Button label="Ligar 192 (Samu)" variant="dangerOutline" icon="phone" size="lg" onPress={() => Linking.openURL("tel:192")} />
        <AppText size="xs" color="textMuted" center>O Acolhe não substitui o serviço de emergência.</AppText>
      </View>

      {apiConfig.useMocks && (
        <View style={{ marginTop: spacing.xl, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border }}>
          <AppText size="sm" color="textMuted" center>Demonstração: finge que o celular está sem internet. O alerta sai por SMS.</AppText>
          <Button label={offline ? "Voltar a ter internet" : "Simular sem internet"} variant="ghost" icon={offline ? "wifi" : "wifi-off"} onPress={() => setOffline(!offline)} />
        </View>
      )}
    </Screen>
  );
}

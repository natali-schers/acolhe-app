import { StyleSheet, View } from "react-native";
import * as Speech from "expo-speech";
import { AppText, Button, Card, Eyebrow, Icon, IconBadge, InfoBanner, Screen, ScreenHeader, StatusTag } from "@/components/ui";
import { InfoRow, QueryState } from "@/components/domain";
import { useCurrentUser } from "@/contexts/AuthContext";
import { useConfirmDose, usePostponeDose, usePrescriptions, useTodayDoses } from "@/hooks/useCare";
import { colors, spacing } from "@/theme";
import { formatTime } from "@/utils/date";

export default function RemediosScreen() {
  const user = useCurrentUser();
  const dosesQuery = useTodayDoses(user.patientId);
  const confirm = useConfirmDose(user.patientId, user.displayName);
  const postpone = usePostponeDose(user.patientId);
  const { data: prescriptions } = usePrescriptions(user.patientId);
  const newest = prescriptions?.[0];
  const isNewPrescription = newest && Date.now() - new Date(newest.issuedAt).getTime() < 2 * 86_400_000;

  return (
    <Screen>
      <ScreenHeader overline="Tratamento" title="Meus remédios" />
      {isNewPrescription && <InfoBanner icon="check" title={`Nova receita de ${newest.doctorName}`} style={{ marginBottom: spacing.md }} />}

      <QueryState query={dosesQuery}>
        {(doses) => {
          const taken = doses.filter((d) => d.status === "tomado").length;
          const current = doses.find((d) => d.status !== "tomado");
          const later = doses.filter((d) => d.status !== "tomado" && d.id !== current?.id);
          return (
            <>
              <View style={styles.heading}>
                <AppText size="xl" bold>Hoje</AppText>
                <AppText bold color="success">{taken} de {doses.length} tomados</AppText>
              </View>

              {current ? (
                <Card style={styles.big}>
                  <View style={{ alignItems: "center" }}><IconBadge name="package" size={90} round /></View>
                  <View style={{ alignItems: "center", marginTop: spacing.md }}>
                    <Eyebrow>{`Agora • ${formatTime(current.scheduledAt)}`}</Eyebrow>
                  </View>
                  <AppText size="xxl" bold center>{current.medication.name}</AppText>
                  <AppText size="lg" center color="textMuted">{current.medication.dose} • {current.medication.instructions}</AppText>
                  {current.status === "adiado" && <View style={{ alignItems: "center", marginTop: 8 }}><StatusTag label="Adiado 10 minutos" tone="info" icon="clock" /></View>}
                  <View style={styles.warning}>
                    <Icon name="alert-triangle" color="warning" size={20} />
                    <AppText bold color="warning" style={{ flex: 1 }}>{current.medication.frequency}</AppText>
                  </View>
                  <View style={{ gap: spacing.sm }}>
                    <Button label="Tomei o remédio" icon="check" size="lg" loading={confirm.isPending} onPress={() => confirm.mutate(current.id)} />
                    <Button label="Adiar 10 minutos" icon="clock" variant="secondary" size="lg" loading={postpone.isPending} onPress={() => postpone.mutate(current.id)} />
                    <Button
                      label="Ouvir em voz alta"
                      icon="volume-2"
                      variant="ghost"
                      onPress={() => Speech.speak(
                        `Agora é hora de tomar ${current.medication.name}, ${current.medication.dose}. ${current.medication.instructions}`,
                        { language: "pt-BR", rate: 0.9 },
                      )}
                    />
                  </View>
                </Card>
              ) : (
                <InfoBanner icon="check-circle" title="Todos os remédios de hoje foram tomados" description="Muito bem! Até amanhã." />
              )}

              {later.length > 0 && <AppText size="lg" bold style={{ marginTop: spacing.xl }}>Mais tarde</AppText>}
              {later.map((d) => (
                <InfoRow key={d.id} icon="package" overline={formatTime(d.scheduledAt)} title={`${d.medication.name} ${d.medication.dose}`} subtitle={d.medication.instructions} />
              ))}
            </>
          );
        }}
      </QueryState>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  big: { padding: spacing.xl },
  warning: {
    flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.warningSoft,
    borderRadius: 10, padding: 12, marginVertical: spacing.lg,
  },
});

import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { AppText, Button, InfoBanner, Screen, ScreenHeader } from "@/components/ui";
import { AppointmentCard, PrescriptionCard, QueryState } from "@/components/domain";
import { useCurrentUser } from "@/contexts/AuthContext";
import { useAppointments, usePrescriptions } from "@/hooks/useCare";
import { spacing } from "@/theme";

/** Consultas e receitas, compartilhada pelos dois perfis (igual à página do portal web). */
export function CareScreen() {
  const user = useCurrentUser();
  const appointments = useAppointments(user.patientId);
  const prescriptions = usePrescriptions(user.patientId);
  const [showOld, setShowOld] = useState(false);

  return (
    <Screen>
      <ScreenHeader overline="Tratamento" title="Consultas e receitas" />

      <AppText size="xl" bold style={styles.heading}>Próximas consultas</AppText>
      <QueryState query={appointments}>
        {(list) => {
          const now = new Date();
          const upcoming = list.filter((a) => new Date(a.at) > now);
          return upcoming.length
            ? upcoming.map((a) => <AppointmentCard key={a.id} appointment={a} />)
            : <InfoBanner icon="calendar" tone="neutral" title="Nenhuma consulta marcada" description="As consultas agendadas pelo médico aparecem aqui." />;
        }}
      </QueryState>

      <View style={[styles.row, styles.heading]}>
        <AppText size="xl" bold style={{ flex: 1 }}>{showOld ? "Todas as receitas" : "Receitas ativas"}</AppText>
        <Button label={showOld ? "Só ativas" : "Ver todas"} variant="ghost" onPress={() => setShowOld((v) => !v)} />
      </View>
      <QueryState query={prescriptions}>
        {(list) => {
          const visible = showOld ? list : list.filter((p) => p.status === "ativa");
          return visible.length
            ? visible.map((p) => <PrescriptionCard key={p.id} prescription={p} />)
            : <InfoBanner icon="file-text" tone="neutral" title="Nenhuma receita ativa" />;
        }}
      </QueryState>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { marginTop: spacing.lg, marginBottom: spacing.xs },
  row: { flexDirection: "row", alignItems: "center" },
});

/** Cartões de receita e de consulta, os mesmos do portal web adaptados para o celular. */
import { Linking, StyleSheet, View } from "react-native";
import { AppText, Button, Card, StatusTag } from "@/components/ui";
import { colors, radius, spacing } from "@/theme";
import type { Appointment, Prescription } from "@/types";
import { formatDayAndTime, formatLongDate } from "@/utils/date";
import { mapsUrl } from "@/utils/maps";

export function PrescriptionCard({ prescription }: { prescription: Prescription }) {
  const active = prescription.status === "ativa";
  return (
    <Card>
      <View style={styles.top}>
        <View style={styles.rx} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <AppText bold size="lg" color="primary">Rx</AppText>
        </View>
        <View style={{ flex: 1 }}>
          <AppText bold size="lg">{prescription.title}</AppText>
          <AppText color="textMuted">{prescription.doctorName} • {prescription.doctorCrm}</AppText>
        </View>
      </View>
      <StatusTag label={active ? "Ativa" : "Encerrada"} tone={active ? "success" : "neutral"} />

      <View style={styles.items}>
        {prescription.items.map((item) => (
          <View key={item.medication} style={styles.item}>
            <AppText bold>{item.medication} {item.dose}</AppText>
            <AppText size="sm" color="textMuted">{item.frequency} • {item.duration}</AppText>
          </View>
        ))}
      </View>

      {!!prescription.instructions && <AppText>{prescription.instructions}</AppText>}
      <AppText size="sm" color="textMuted" style={{ marginTop: spacing.sm }}>
        Emitida em {formatLongDate(prescription.issuedAt)}
        {prescription.signed && " • Assinada digitalmente"}
      </AppText>
    </Card>
  );
}

export function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const date = new Date(appointment.at);
  const isOnline = appointment.mode === "online";
  const month = date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "").toUpperCase();

  return (
    <Card>
      <View style={styles.top}>
        <View style={styles.date} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <AppText bold size="xl" color="primary">{date.getDate()}</AppText>
          <AppText bold size="xs" color="primary">{month}</AppText>
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <StatusTag label={isOnline ? "Online" : "Presencial"} tone={isOnline ? "info" : "primary"} icon={isOnline ? "video" : "map-pin"} />
          <AppText bold size="lg">{appointment.doctorName}</AppText>
          <AppText color="textMuted">
            {appointment.specialty} • {formatDayAndTime(appointment.at)} • {appointment.durationMinutes} min
          </AppText>
          {!isOnline && appointment.location && <AppText color="textMuted">{appointment.location}</AppText>}
        </View>
      </View>

      {isOnline ? (
        appointment.meetingUrl ? (
          <Button label="Entrar na consulta" icon="video" style={styles.action} onPress={() => Linking.openURL(appointment.meetingUrl!)} />
        ) : (
          <>
            <Button label="Entrar na consulta" icon="video" variant="secondary" disabled style={styles.action} />
            <AppText size="sm" color="textMuted" style={{ marginTop: spacing.xs }}>
              O link será disponibilizado no horário da consulta.
            </AppText>
          </>
        )
      ) : (
        appointment.location && (
          <Button
            label="Ver no mapa"
            icon="map-pin"
            variant="secondary"
            style={styles.action}
            onPress={() => Linking.openURL(mapsUrl(appointment.location!))}
          />
        )
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.sm },
  rx: {
    width: 52, height: 52, borderRadius: radius.md, backgroundColor: colors.primarySoft,
    alignItems: "center", justifyContent: "center",
  },
  date: {
    width: 58, height: 64, borderRadius: radius.md, backgroundColor: colors.primarySoft,
    alignItems: "center", justifyContent: "center",
  },
  items: { gap: spacing.sm, marginVertical: spacing.md },
  item: { backgroundColor: colors.surfaceMuted, borderRadius: radius.sm, padding: spacing.md },
  action: { marginTop: spacing.md },
});

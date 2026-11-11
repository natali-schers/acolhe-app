import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText, Avatar, Icon, IconBadge, StatusTag, type IconName, type Tone } from "@/components/ui";
import { channelLabels, ChannelTag } from "./Channel";
import { colors, radius, spacing } from "@/theme";
import type { AlertRecipient, Caregiver } from "@/types";

interface InfoRowProps {
  icon: IconName;
  iconTone?: Tone;
  overline?: string;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onPress?: () => void;
}

/** Cartão em linha: ícone, textos e algo à direita (horário, seta...). */
export function InfoRow({ icon, iconTone = "primary", overline, title, subtitle, trailing, onPress }: InfoRowProps) {
  const content = (
    <>
      <IconBadge name={icon} tone={iconTone} />
      <View style={{ flex: 1 }}>
        {overline && <AppText size="xs" bold color="textMuted" style={{ letterSpacing: 1 }}>{overline.toUpperCase()}</AppText>}
        <AppText bold size="lg">{title}</AppText>
        {subtitle && <AppText color="textMuted">{subtitle}</AppText>}
      </View>
      {trailing ?? (onPress && <Icon name="chevron-right" color="textMuted" />)}
    </>
  );
  return onPress ? (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]} accessibilityRole="button" accessibilityLabel={`${overline ?? ""} ${title}. ${subtitle ?? ""}`}>
      {content}
    </Pressable>
  ) : (
    <View style={styles.row} accessible accessibilityLabel={`${overline ?? ""} ${title}. ${subtitle ?? ""}`}>{content}</View>
  );
}

const recipientLabel: Record<AlertRecipient["status"], { label: string; tone: Tone; icon: IconName }> = {
  enviado: { label: "Enviado", tone: "neutral", icon: "clock" },
  visto: { label: "Visto", tone: "info", icon: "eye" },
  assumiu: { label: "Assumiu", tone: "success", icon: "check" },
  recusou: { label: "Não pode", tone: "neutral", icon: "x" },
};

/** Lista de quem recebeu o alerta e o que cada pessoa fez. Quem assumiu vai para o topo. */
export function RecipientList({ recipients, caregivers }: { recipients: AlertRecipient[]; caregivers: Caregiver[] }) {
  const sorted = [...recipients].sort((a, b) => Number(b.status === "assumiu") - Number(a.status === "assumiu"));
  return (
    <View style={{ gap: spacing.sm }}>
      {sorted.map((r) => {
        const c = caregivers.find((x) => x.id === r.caregiverId);
        if (!c) return null;
        const s = recipientLabel[r.status];
        return (
          <View key={r.caregiverId} style={[styles.recipient, r.status === "assumiu" && styles.recipientAssumed]} accessible accessibilityLabel={`${c.name}, ${c.relation}: ${s.label}${r.channel ? `, aviso por ${channelLabels[r.channel]}` : ""}`}>
            <Avatar initials={c.initials} />
            <View style={{ flex: 1 }}>
              <AppText bold>{c.name}</AppText>
              <AppText size="sm" color="textMuted">{c.relation}</AppText>
              {r.channel && (
                <View style={{ marginTop: 4, gap: 2 }}>
                  <ChannelTag channel={r.channel} tone={r.failedChannels?.length ? "info" : "neutral"} />
                  {!!r.failedChannels?.length && (
                    <AppText size="xs" color="textMuted">Antes tentou: {r.failedChannels.map((f) => channelLabels[f]).join(", ")}</AppText>
                  )}
                </View>
              )}
            </View>
            <StatusTag label={s.label} tone={s.tone} icon={s.icon} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 14, marginVertical: 6,
  },
  recipient: {
    flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 11,
  },
  recipientAssumed: { borderColor: colors.success, borderWidth: 2 },
});

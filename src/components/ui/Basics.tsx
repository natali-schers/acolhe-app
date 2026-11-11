/** Peças visuais pequenas e reutilizáveis: cartão, avatar, etiqueta, ícone com fundo e faixa de aviso. */
import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { AppText } from "./AppText";
import { Icon, type IconName } from "./Icon";
import { colors, radius, spacing, type ColorToken } from "@/theme";

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Avatar({ initials, size = 44, tone = "primary" }: { initials: string; size?: number; tone?: "primary" | "info" }) {
  return (
    <View
      style={{
        width: size, height: size, borderRadius: size / 2, alignItems: "center", justifyContent: "center",
        backgroundColor: tone === "info" ? colors.infoSoft : colors.primaryMuted,
      }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <AppText bold size={size > 50 ? "lg" : "md"} color={tone === "info" ? "info" : "primary"}>{initials}</AppText>
    </View>
  );
}

export type Tone = "success" | "warning" | "danger" | "info" | "primary" | "neutral";

const toneColors: Record<Tone, [ColorToken, ColorToken]> = {
  success: ["successSoft", "success"],
  warning: ["warningSoft", "warning"],
  danger: ["dangerSoft", "danger"],
  info: ["infoSoft", "info"],
  primary: ["primarySoft", "primary"],
  neutral: ["surfaceMuted", "textMuted"],
};

export function StatusTag({ label, tone = "neutral", icon }: { label: string; tone?: Tone; icon?: IconName }) {
  const [bg, fg] = toneColors[tone];
  return (
    <View style={[styles.tag, { backgroundColor: colors[bg] }]}>
      {icon && <Icon name={icon} size={14} color={fg} />}
      <AppText size="xs" bold color={fg}>{label}</AppText>
    </View>
  );
}

export function IconBadge({ name, tone = "primary", size = 46, round = false }: { name: IconName; tone?: Tone; size?: number; round?: boolean }) {
  const [bg, fg] = toneColors[tone];
  return (
    <View style={{ width: size, height: size, borderRadius: round ? size / 2 : 13, backgroundColor: colors[bg], alignItems: "center", justifyContent: "center" }}>
      <Icon name={name} color={fg} size={Math.round(size * 0.48)} />
    </View>
  );
}

interface InfoBannerProps {
  icon: IconName;
  title: string;
  description?: string;
  tone?: Tone;
  style?: StyleProp<ViewStyle>;
}

export function InfoBanner({ icon, title, description, tone = "success", style }: InfoBannerProps) {
  const [bg, fg] = toneColors[tone];
  return (
    <View style={[styles.banner, { backgroundColor: colors[bg] }, style]} accessible accessibilityLabel={`${title}. ${description ?? ""}`}>
      <Icon name={icon} color={fg} />
      <View style={{ flex: 1 }}>
        <AppText bold color={fg}>{title}</AppText>
        {description && <AppText size="sm" color="textMuted">{description}</AppText>}
      </View>
    </View>
  );
}

export function Brand({ inverted = false }: { inverted?: boolean }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
      <View style={[styles.brandMark, inverted && { backgroundColor: colors.surface }]}>
        <Icon name="heart" color={inverted ? "primary" : "textOnPrimary"} size={24} />
      </View>
      <AppText size="xxl" bold color={inverted ? "textOnPrimary" : "primary"}>Acolhe</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginVertical: spacing.sm,
  },
  tag: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5, alignSelf: "flex-start" },
  banner: { flexDirection: "row", alignItems: "center", gap: spacing.md, borderRadius: 14, padding: 14 },
  brandMark: { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
});

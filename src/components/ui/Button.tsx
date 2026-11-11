import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import { AppText } from "./AppText";
import { Icon, type IconName } from "./Icon";
import { colors, radius, spacing, touchTarget, type ColorToken } from "@/theme";

type Variant = "primary" | "secondary" | "danger" | "dangerOutline" | "ghost";

const variants: Record<Variant, { bg: ColorToken | "transparent"; border: ColorToken | "transparent"; text: ColorToken }> = {
  primary: { bg: "primary", border: "primary", text: "textOnPrimary" },
  secondary: { bg: "surface", border: "borderStrong", text: "text" },
  danger: { bg: "danger", border: "danger", text: "textOnPrimary" },
  dangerOutline: { bg: "surface", border: "danger", text: "danger" },
  ghost: { bg: "transparent", border: "transparent", text: "primary" },
};

export interface ButtonProps extends Omit<PressableProps, "style" | "children"> {
  label: string;
  variant?: Variant;
  icon?: IconName;
  loading?: boolean;
  size?: "md" | "lg";
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, variant = "primary", icon, loading, size = "md", disabled, style, ...rest }: ButtonProps) {
  const v = variants[variant];
  const resolve = (token: ColorToken | "transparent") => (token === "transparent" ? "transparent" : colors[token]);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: Boolean(disabled || loading), busy: Boolean(loading) }}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        size === "lg" && styles.lg,
        { backgroundColor: resolve(v.bg), borderColor: resolve(v.border), opacity: pressed ? 0.85 : disabled ? 0.55 : 1 },
        style,
      ]}
      {...rest}
    >
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={colors[v.text]} /> : icon && <Icon name={icon} color={v.text} size={size === "lg" ? 24 : 20} />}
        <AppText bold size={size === "lg" ? "lg" : "md"} color={v.text}>{label}</AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: touchTarget,
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
  },
  lg: { minHeight: 60, borderRadius: radius.lg },
  content: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm },
});

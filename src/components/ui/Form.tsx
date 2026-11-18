import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { AppText } from "./AppText";
import { Icon } from "./Icon";
import { colors, fontFamily, fontSize, radius, spacing } from "@/theme";

export interface FieldProps extends TextInputProps {
  label: string;
  hint?: string;
  /** Esconde o texto e mostra o botão de ver/esconder (como no login). */
  password?: boolean;
}

/** Campo de formulário com rótulo acima. */
export function Field({ label, hint, password = false, style, ...props }: FieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={{ marginTop: spacing.lg }}>
      <AppText bold style={{ marginBottom: 6 }}>{label}</AppText>
      {hint && <AppText size="sm" color="textMuted" style={{ marginBottom: 6 }}>{hint}</AppText>}
      <View>
        <TextInput
          style={[styles.input, password && { paddingRight: 56 }, style]}
          accessibilityLabel={label}
          accessibilityHint={hint}
          placeholderTextColor={colors.textMuted}
          {...(password ? { secureTextEntry: !visible, autoCapitalize: "none" as const, autoCorrect: false } : {})}
          {...props}
        />
        {password && (
          <Pressable
            style={styles.eye}
            onPress={() => setVisible((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={visible ? "Ocultar senha" : "Mostrar senha"}
          >
            <Icon name={visible ? "eye-off" : "eye"} color="textMuted" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

/** Caixa de marcar com o texto ao lado; a linha inteira é a área de toque. */
export function CheckRow({ checked, onChange, children, disabled }: { checked: boolean; onChange: (v: boolean) => void; children: string; disabled?: boolean }) {
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled: Boolean(disabled) }}
      accessibilityLabel={children}
      style={[styles.checkRow, disabled && { opacity: 0.55 }]}
    >
      <View style={[styles.box, checked && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
        {checked && <Icon name="check" size={18} color="textOnPrimary" />}
      </View>
      <AppText style={{ flex: 1 }}>{children}</AppText>
    </Pressable>
  );
}

/** Lista de opções em que só uma fica marcada (tamanho do texto, volume...). */
export function OptionGroup<T extends string>({
  options, value, onChange, disabled, renderLabel,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  /** Para mostrar a opção de um jeito especial (ex.: no próprio tamanho de texto). */
  renderLabel?: (option: { value: T; label: string }) => ReactNode;
}) {
  return (
    <View style={{ gap: spacing.sm }} accessibilityRole="radiogroup">
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            disabled={disabled}
            accessibilityRole="radio"
            accessibilityState={{ selected, disabled: Boolean(disabled) }}
            accessibilityLabel={o.label}
            style={[styles.option, selected && styles.optionSelected, disabled && !selected && { opacity: 0.55 }]}
          >
            {renderLabel ? renderLabel(o) : <AppText bold size="lg">{o.label}</AppText>}
            {selected && <Icon name="check-circle" color="primary" />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  eye: { position: "absolute", right: 4, top: 4, width: 46, height: 46, alignItems: "center", justifyContent: "center" },
  input: {
    minHeight: 54, borderWidth: 1.5, borderColor: colors.borderStrong, borderRadius: radius.md, paddingHorizontal: 16,
    backgroundColor: colors.surface, fontFamily: fontFamily.regular, fontSize: fontSize.lg, color: colors.text,
  },
  checkRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, minHeight: 56, paddingVertical: 8 },
  box: { width: 28, height: 28, borderRadius: 8, borderWidth: 2, borderColor: colors.borderStrong, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface },
  option: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 60, paddingHorizontal: 16,
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
});

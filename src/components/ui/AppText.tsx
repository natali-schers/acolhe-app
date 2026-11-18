import { createContext, useContext } from "react";
import { Text, type TextProps } from "react-native";
import { colors, fontFamily, fontSize, type ColorToken } from "@/theme";

/**
 * Multiplicador do tamanho do texto escolhido em "Meus dados" (1 = normal).
 * O AuthProvider fornece o valor; fora dele (widgets, carregamento) fica no tamanho padrão.
 */
export const TextScaleContext = createContext(1);

export interface AppTextProps extends TextProps {
  size?: keyof typeof fontSize;
  bold?: boolean;
  color?: ColorToken;
  center?: boolean;
}

/** Texto padrão do app, sempre com a fonte Atkinson Hyperlegible (feita para baixa visão). */
export function AppText({ size = "md", bold = false, color = "text", center, style, ...rest }: AppTextProps) {
  const scale = useContext(TextScaleContext);
  const px = Math.round(fontSize[size] * scale);
  return (
    <Text
      style={[
        {
          fontFamily: bold ? fontFamily.bold : fontFamily.regular,
          fontSize: px,
          lineHeight: Math.round(px * 1.3),
          color: colors[color],
          textAlign: center ? "center" : undefined,
        },
        style,
      ]}
      maxFontSizeMultiplier={1.6}
      {...rest}
    />
  );
}

/** Texto pequeno em caixa alta acima dos títulos. */
export function Eyebrow({ children, color = "primary" }: { children: string; color?: ColorToken }) {
  return (
    <AppText size="xs" bold color={color} style={{ letterSpacing: 1.3, marginBottom: 4 }}>
      {children.toUpperCase()}
    </AppText>
  );
}

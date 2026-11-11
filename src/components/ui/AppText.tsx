import { Text, type TextProps } from "react-native";
import { colors, fontFamily, fontSize, type ColorToken } from "@/theme";

export interface AppTextProps extends TextProps {
  size?: keyof typeof fontSize;
  bold?: boolean;
  color?: ColorToken;
  center?: boolean;
}

/** Texto padrão do app, sempre com a fonte Atkinson Hyperlegible (feita para baixa visão). */
export function AppText({ size = "md", bold = false, color = "text", center, style, ...rest }: AppTextProps) {
  return (
    <Text
      style={[
        {
          fontFamily: bold ? fontFamily.bold : fontFamily.regular,
          fontSize: fontSize[size],
          lineHeight: Math.round(fontSize[size] * 1.3),
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

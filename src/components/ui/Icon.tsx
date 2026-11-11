import Feather from "@expo/vector-icons/Feather";
import type { ComponentProps } from "react";
import { colors, type ColorToken } from "@/theme";

export type IconName = ComponentProps<typeof Feather>["name"];

interface IconProps {
  name: IconName;
  size?: number;
  color?: ColorToken;
}

/** Ícones do app (conjunto Feather, mesmo estilo do portal web). */
export function Icon({ name, size = 22, color = "text" }: IconProps) {
  return <Feather name={name} size={size} color={colors[color]} accessibilityElementsHidden importantForAccessibility="no" />;
}

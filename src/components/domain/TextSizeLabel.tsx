import { AppText } from "@/components/ui";
import { fontSize } from "@/theme";
import type { AccessibilityPrefs } from "@/types";
import { textScaleFor } from "@/utils/preferences";

/** Nome da opção já no tamanho que ela vai deixar o texto, para a pessoa comparar antes de escolher. */
export function TextSizeLabel({ option }: { option: { value: AccessibilityPrefs["textSize"]; label: string } }) {
  const px = Math.round(fontSize.lg * textScaleFor(option.value));
  return <AppText bold style={{ fontSize: px, lineHeight: Math.round(px * 1.3) }}>{option.label}</AppText>;
}

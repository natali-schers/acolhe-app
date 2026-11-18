import type { AccessibilityPrefs, VoiceVolume } from "@/types";

/** Contas antigas ou sem preferência salva usam estes valores (os mesmos da API). */
export const defaultPrefs: AccessibilityPrefs = { textSize: "normal", voiceReminders: true, voiceVolume: "alto" };

export const withDefaults = (prefs?: Partial<AccessibilityPrefs>): AccessibilityPrefs => ({ ...defaultPrefs, ...prefs });

export const textSizeOptions: { value: AccessibilityPrefs["textSize"]; label: string; scale: number }[] = [
  { value: "normal", label: "Normal", scale: 1 },
  { value: "grande", label: "Grande", scale: 1.15 },
  { value: "muito_grande", label: "Muito grande", scale: 1.3 },
];

/** Quanto o texto do app cresce para cada opção. Soma-se à escala de fonte do sistema. */
export const textScaleFor = (size?: AccessibilityPrefs["textSize"]) =>
  textSizeOptions.find((o) => o.value === size)?.scale ?? 1;

export const voiceVolumeOptions: { value: VoiceVolume; label: string; volume: number }[] = [
  { value: "baixo", label: "Baixo", volume: 0.4 },
  { value: "medio", label: "Médio", volume: 0.7 },
  { value: "alto", label: "Alto", volume: 1 },
];

/** Volume do expo-speech (0 a 1), relativo ao volume do aparelho. */
export const speechVolumeFor = (volume?: VoiceVolume) =>
  voiceVolumeOptions.find((o) => o.value === volume)?.volume ?? 1;

export const labelOf = <T extends string>(options: { value: T; label: string }[], value: T) =>
  options.find((o) => o.value === value)?.label ?? value;

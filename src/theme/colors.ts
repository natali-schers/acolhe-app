/**
 * Paleta de cores do Acolhe (app).
 *
 * Este é o ÚNICO lugar onde as cores do app são definidas.
 * Os componentes importam `colors` daqui; nunca escreva um "#hex" direto numa tela.
 * Os valores são os mesmos do portal web (acolhe-web/src/theme/colors.ts).
 */
export const palette = {
  teal900: "#0c4e4e",
  teal800: "#094747",
  teal700: "#0f5c5c",
  teal200: "#d4e8e5",
  teal100: "#e6f1ef",

  red700: "#b3261e",
  red200: "#f3d0cd",
  red100: "#fbe9e7",

  green700: "#1b6b3a",
  green100: "#e6f3ea",

  amber700: "#8a5a00",
  amber100: "#fff3d6",

  blue700: "#315c88",
  blue100: "#e9f0fa",

  neutral0: "#ffffff",
  neutral50: "#faf8f5",
  neutral150: "#f2f1ee",
  neutral200: "#eeece8",
  neutral300: "#dedbd5",
  neutral400: "#c9c8c3",
  neutral500: "#848785",
  neutral600: "#666b69",
  neutral900: "#1a1a1a",
} as const;

export const colors = {
  primary: palette.teal700,
  primaryDark: palette.teal800,
  primarySoft: palette.teal100,
  primaryMuted: palette.teal200,

  danger: palette.red700,
  dangerSoft: palette.red100,
  dangerBorder: palette.red200,
  success: palette.green700,
  successSoft: palette.green100,
  warning: palette.amber700,
  warningSoft: palette.amber100,
  info: palette.blue700,
  infoSoft: palette.blue100,

  background: palette.neutral50,
  surface: palette.neutral0,
  surfaceMuted: palette.neutral150,
  border: palette.neutral300,
  borderSoft: palette.neutral200,
  borderStrong: palette.neutral400,
  text: palette.neutral900,
  textMuted: palette.neutral600,
  textSubtle: palette.neutral500,
  textOnPrimary: palette.neutral0,
} as const;

export type ColorToken = keyof typeof colors;

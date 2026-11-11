/**
 * Ponto de entrada do app.
 * Carrega o Expo Router e, no Android, registra quem desenha o widget de SOS da tela inicial.
 */
import "expo-router/entry";
import { Platform } from "react-native";

if (Platform.OS === "android") {
  // require só no Android: a biblioteca não existe no iOS nem na web.
  const { registerWidgetTaskHandler } = require("react-native-android-widget");
  const { widgetTaskHandler } = require("./src/widgets/android/widgetTaskHandler");
  registerWidgetTaskHandler(widgetTaskHandler);
}

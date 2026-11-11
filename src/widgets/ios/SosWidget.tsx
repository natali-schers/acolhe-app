/**
 * Widget de SOS para a tela inicial do iPhone (expo-widgets + SwiftUI).
 * Tocar em qualquer parte do widget abre o app em acolhe://sos, que começa a contagem de 5 segundos.
 *
 * Regras do expo-widgets: o componente roda isolado do app (diretiva 'widget'),
 * sem hooks e sem usar valores de fora da função. Por isso as cores estão escritas aqui dentro;
 * elas seguem src/theme/colors.ts (danger = #b3261e).
 */
import { Image, Text, VStack } from "@expo/ui/swift-ui";
import { containerBackground, font, foregroundStyle, widgetURL } from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";

type SosWidgetProps = { label: string };

const SosWidget = (props: SosWidgetProps, environment: WidgetEnvironment) => {
  "widget";
  const danger = "#b3261e";
  const white = "#ffffff";

  if (environment.widgetFamily === "accessoryCircular") {
    return (
      <VStack modifiers={[containerBackground(danger, "widget"), widgetURL("acolhe://sos")]}>
        <Image systemName="bell.fill" size={22} />
        <Text modifiers={[font({ size: 11, weight: "bold" })]}>SOS</Text>
      </VStack>
    );
  }

  return (
    <VStack spacing={6} modifiers={[containerBackground(danger, "widget"), widgetURL("acolhe://sos")]}>
      <Image systemName="bell.fill" size={34} color={white} />
      <Text modifiers={[font({ size: 20, weight: "bold" }), foregroundStyle(white)]}>{props.label}</Text>
      <Text modifiers={[font({ size: 12 }), foregroundStyle(white)]}>Toque para avisar sua rede</Text>
    </VStack>
  );
};

export default createWidget("SosWidget", SosWidget, { label: "PRECISO DE AJUDA" });

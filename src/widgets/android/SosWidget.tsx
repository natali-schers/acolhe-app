/**
 * Widget de SOS para a tela inicial do Android (react-native-android-widget).
 * Tocar em qualquer parte abre acolhe://sos, que leva à contagem de 5 segundos no app.
 * Também pode ficar na tela de bloqueio em aparelhos com suporte (widgetCategory no app.json).
 */
import { FlexWidget, TextWidget } from "react-native-android-widget";
import { colors } from "@/theme/colors";

export function SosWidget() {
  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: "acolhe://sos" }}
      accessibilityLabel="Preciso de ajuda. Toque para avisar sua rede."
      style={{
        height: "match_parent",
        width: "match_parent",
        backgroundColor: colors.danger,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        padding: 12,
      }}
    >
      <TextWidget text="🔔" style={{ fontSize: 30 }} />
      <TextWidget text="PRECISO DE" style={{ fontSize: 18, fontWeight: "bold", color: colors.textOnPrimary }} />
      <TextWidget text="AJUDA" style={{ fontSize: 22, fontWeight: "bold", color: colors.textOnPrimary }} />
      <TextWidget text="Toque para avisar sua rede" style={{ fontSize: 11, color: colors.textOnPrimary, marginTop: 4 }} />
    </FlexWidget>
  );
}

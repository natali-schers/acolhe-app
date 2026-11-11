import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { SosWidget } from "./SosWidget";

const widgets = { SosWidget } as const;

/**
 * Chamado pelo Android quando o widget é adicionado, atualizado ou redimensionado.
 * O toque é tratado pelo próprio Android (OPEN_URI), então não precisa de código aqui.
 */
export async function widgetTaskHandler({ widgetInfo, widgetAction, renderWidget }: WidgetTaskHandlerProps) {
  const Widget = widgets[widgetInfo.widgetName as keyof typeof widgets];
  if (!Widget) return;
  if (widgetAction === "WIDGET_ADDED" || widgetAction === "WIDGET_UPDATE" || widgetAction === "WIDGET_RESIZED") {
    renderWidget(<Widget />);
  }
}

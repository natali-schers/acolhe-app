import { StatusTag, type IconName, type Tone } from "@/components/ui";
import type { AlertChannel, CaregiverLevel } from "@/types";

export const channelLabels: Record<AlertChannel, string> = {
  app: "Aplicativo",
  whatsapp: "WhatsApp",
  sms: "SMS",
};

export const levelLabels: Record<CaregiverLevel, string> = {
  cuidador: "Cuidadores",
  apoio: "Contatos de apoio",
};

const channelIcons: Record<AlertChannel, IconName> = { app: "smartphone", whatsapp: "message-circle", sms: "message-square" };

/** Canal sempre com ícone E texto, para não depender só de cor. */
export function ChannelTag({ channel, tone = "neutral" }: { channel: AlertChannel; tone?: Tone }) {
  return <StatusTag label={channelLabels[channel]} tone={tone} icon={channelIcons[channel]} />;
}

/** "Aplicativo, WhatsApp" -> texto corrido, para leitores de tela. */
export const channelsText = (channels: AlertChannel[]) => channels.map((c) => channelLabels[c]).join(", ");

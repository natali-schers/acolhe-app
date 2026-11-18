import * as Speech from "expo-speech";
import type { VoiceVolume } from "@/types";
import { speechVolumeFor } from "./preferences";

/** Lê o texto em português, no volume escolhido em "Meus dados". Interrompe a leitura anterior. */
export function speak(text: string, volume?: VoiceVolume) {
  Speech.stop();
  Speech.speak(text, { language: "pt-BR", rate: 0.9, volume: speechVolumeFor(volume) });
}

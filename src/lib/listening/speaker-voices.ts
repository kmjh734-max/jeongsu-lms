import { getElevenLabsListeningConfig } from "@/lib/listening/audioProviders/elevenlabs-config";
import type { ListeningSpeakerType } from "@/lib/listening/types";

/** DB voice_name / 표시용 — ElevenLabs voice_id (서버 env) */
export function voiceForSpeaker(speaker: ListeningSpeakerType): string {
  try {
    const { voiceIds } = getElevenLabsListeningConfig();
    return voiceIds[speaker];
  } catch {
    return `elevenlabs-${speaker}`;
  }
}

export function isListeningSpeaker(value: string): value is ListeningSpeakerType {
  return value === "ANN" || value === "M" || value === "W";
}

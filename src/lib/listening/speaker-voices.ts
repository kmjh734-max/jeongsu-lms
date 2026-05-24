import type { ListeningSpeakerType } from "@/lib/listening/types";

/** OpenAI TTS voice per speaker role — change here to tune voices. */
export const SPEAKER_VOICE_MAP: Record<ListeningSpeakerType, string> = {
  ANN: "alloy",
  M: "echo",
  W: "nova",
};

export function voiceForSpeaker(speaker: ListeningSpeakerType): string {
  return SPEAKER_VOICE_MAP[speaker];
}

export function isListeningSpeaker(value: string): value is ListeningSpeakerType {
  return value === "ANN" || value === "M" || value === "W";
}

import type { ListeningSpeakerType } from "@/lib/listening/types";

/** DB voice_name 저장용 (표시) */
export function voiceLabelForId(voiceId: string): string {
  return voiceId.length > 12 ? `${voiceId.slice(0, 8)}…` : voiceId;
}

export function voiceForSpeaker(
  speaker: ListeningSpeakerType,
  voiceId?: string | null
): string {
  const id = voiceId?.trim();
  return id || `auto-${speaker}`;
}

export function isListeningSpeaker(value: string): value is ListeningSpeakerType {
  return value === "ANN" || value === "M" || value === "W";
}

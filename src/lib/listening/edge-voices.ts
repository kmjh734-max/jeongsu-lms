import { EDGE_VOICES, edgeVoiceFor } from "@/lib/listening/audioProviders/edgeTts";
import type { ListeningSpeakerType } from "@/lib/listening/types";

export interface ListeningSetVoiceOverrides {
  voice_ann_id?: string | null;
  voice_m_id?: string | null;
  voice_w_id?: string | null;
}

export interface ResolvedListeningVoices {
  voiceIds: Record<ListeningSpeakerType, string>;
}

const OVERRIDE_KEYS: Record<ListeningSpeakerType, keyof ListeningSetVoiceOverrides> = {
  ANN: "voice_ann_id",
  M: "voice_m_id",
  W: "voice_w_id",
};

/** 세트에 따로 정해 둔 목소리가 있으면 그것, 없으면 기본 Edge 목소리 */
export function resolveListeningVoiceIds(
  setOverrides?: ListeningSetVoiceOverrides | null
): ResolvedListeningVoices {
  const voiceIds = {} as Record<ListeningSpeakerType, string>;
  for (const speaker of ["ANN", "M", "W"] as ListeningSpeakerType[]) {
    voiceIds[speaker] = edgeVoiceFor(speaker, setOverrides?.[OVERRIDE_KEYS[speaker]]);
  }
  return { voiceIds };
}

export { EDGE_VOICES };

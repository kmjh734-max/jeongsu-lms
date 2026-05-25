import { fetchElevenLabsVoices } from "@/lib/listening/elevenlabs/getVoices";
import { autoSelectElevenLabsVoices } from "@/lib/listening/elevenlabs/selectVoices";
import type { ListeningSpeakerType } from "@/lib/listening/types";

export interface ListeningSetVoiceOverrides {
  voice_ann_id?: string | null;
  voice_m_id?: string | null;
  voice_w_id?: string | null;
}

export interface ResolvedListeningVoices {
  apiKey: string;
  voiceIds: Record<ListeningSpeakerType, string>;
  autoSelected: Record<ListeningSpeakerType, string>;
}

/** .env 값에 따옴표·BOM이 붙는 경우(401 오류)를 방지 */
function normalizeElevenLabsApiKey(raw: string): string {
  let key = raw.trim();
  if (key.charCodeAt(0) === 0xfeff) {
    key = key.slice(1).trim();
  }
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim();
  }
  return key;
}

export function getElevenLabsApiKey(): string {
  const raw = process.env.ELEVENLABS_API_KEY;
  const apiKey = raw ? normalizeElevenLabsApiKey(raw) : "";
  if (!apiKey) {
    throw new Error(
      "ELEVENLABS_API_KEY가 설정되어 있지 않습니다. .env.local 또는 Vercel 환경변수에 추가한 뒤 서버를 재시작해 주세요."
    );
  }
  return apiKey;
}

function envVoiceId(speaker: ListeningSpeakerType): string | undefined {
  const key = `ELEVENLABS_VOICE_${speaker}` as const;
  return process.env[key]?.trim() || undefined;
}

const OVERRIDE_KEYS: Record<ListeningSpeakerType, keyof ListeningSetVoiceOverrides> = {
  ANN: "voice_ann_id",
  M: "voice_m_id",
  W: "voice_w_id",
};

/**
 * 우선순위: 세트 저장값 → env → 자동 선택
 */
export async function resolveListeningVoiceIds(
  setOverrides?: ListeningSetVoiceOverrides | null
): Promise<ResolvedListeningVoices> {
  const apiKey = getElevenLabsApiKey();
  const voices = await fetchElevenLabsVoices(apiKey);
  const autoSelected = autoSelectElevenLabsVoices(voices);

  const voiceIds = {} as Record<ListeningSpeakerType, string>;
  const speakers: ListeningSpeakerType[] = ["ANN", "M", "W"];

  for (const speaker of speakers) {
    const overrideKey = OVERRIDE_KEYS[speaker];
    const fromSet = setOverrides?.[overrideKey]?.trim();
    const fromEnv = envVoiceId(speaker);
    voiceIds[speaker] = fromSet || fromEnv || autoSelected[speaker];
  }

  return { apiKey, voiceIds, autoSelected };
}

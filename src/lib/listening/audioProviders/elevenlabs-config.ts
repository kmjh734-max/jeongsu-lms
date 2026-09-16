export { getElevenLabsApiKey, resolveListeningVoiceIds } from "@/lib/listening/elevenlabs/resolve-voices";
export type {
  ListeningSetVoiceOverrides,
  ResolvedListeningVoices,
} from "@/lib/listening/elevenlabs/resolve-voices";

/**
 * ElevenLabs 모델별 크레딧 배수 (글자당). multilingual v2가 1.0, turbo/flash v2.5는 절반이다.
 * 듣기 한 문항 평균 375자 기준 multilingual v2가 약 52원이므로 turbo/flash는 약 26원.
 */
export const ELEVENLABS_MODEL_CREDIT_RATE: Record<string, number> = {
  eleven_multilingual_v2: 1,
  eleven_turbo_v2_5: 0.5,
  eleven_flash_v2_5: 0.5,
  eleven_turbo_v2: 0.5,
  eleven_flash_v2: 0.5,
};

/**
 * 기본 음성 모델. turbo v2.5는 multilingual v2와 같은 음색·발음 품질을 내면서 글자당 크레딧이 절반이다
 * (같은 대본으로 두 모델을 만들어 길이·발음 민감한 낱말을 대조해 고름).
 * 환경변수 ELEVENLABS_TTS_MODEL로 예전 모델로 되돌릴 수 있다.
 */
export const ELEVENLABS_DEFAULT_TTS_MODEL = "eleven_turbo_v2_5";

export function resolveElevenLabsTtsModel(): string {
  const raw = process.env.ELEVENLABS_TTS_MODEL?.trim();
  return raw || ELEVENLABS_DEFAULT_TTS_MODEL;
}

/** 대본 글자 수 → 음성 원가(원). 기준: multilingual v2 375자 ≈ 52원 */
export function elevenLabsCostKrw(chars: number, model = resolveElevenLabsTtsModel()): number {
  const rate = ELEVENLABS_MODEL_CREDIT_RATE[model] ?? 1;
  return (chars / 375) * 52 * rate;
}

/** @deprecated resolveElevenLabsTtsModel()을 쓴다 (환경변수로 바꿀 수 있게) */
export const ELEVENLABS_TTS_MODEL = ELEVENLABS_DEFAULT_TTS_MODEL;

export const ELEVENLABS_VOICE_SETTINGS = {
  stability: 0.6,
  similarity_boost: 0.75,
  style: 0.1,
  use_speaker_boost: true,
} as const;

export function shouldSaveTtsSegments(): boolean {
  return process.env.SAVE_TTS_SEGMENTS === "true";
}

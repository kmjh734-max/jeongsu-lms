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
 * 기본 음성 모델: multilingual v2.
 * 2026-09-16에 값을 줄이려고 turbo v2.5로 바꿨더니, 문장마다 따로 읽히는 듣기 대본에서
 * 억양이 들쭉날쭉해져 "갑자기 감정이 들어가고 목소리가 격해졌다가 바뀐다"는 지적을 받았다
 * (선생님, 2026-09-18). 시험 음성은 차분하고 한결같아야 하므로 원래 모델로 되돌린다.
 */
export const ELEVENLABS_DEFAULT_TTS_MODEL = "eleven_multilingual_v2";

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

/**
 * 시험 방송처럼 차분하게: 안정도를 높이고(문장마다 억양이 튀지 않게) 표현 과장(style)은 끈다.
 */
export const ELEVENLABS_VOICE_SETTINGS = {
  stability: 0.78,
  similarity_boost: 0.75,
  style: 0,
  use_speaker_boost: true,
} as const;

export function shouldSaveTtsSegments(): boolean {
  return process.env.SAVE_TTS_SEGMENTS === "true";
}

export type SpeechSpeedPreset = "very_slow" | "slow" | "normal" | "fast";

/** UI 라벨 → OpenAI TTS speed */
export const SPEECH_SPEED_MAP: Record<SpeechSpeedPreset, number> = {
  very_slow: 0.75,
  slow: 0.85,
  normal: 0.9,
  fast: 1.0,
};

/** 중1 영어듣기평가형 기본 */
export const EXAM_DEFAULT_SPEECH_SPEED = 0.85;

export const DEFAULT_SPEECH_SPEED_PRESET: SpeechSpeedPreset = "slow";

export function speedFromPreset(preset: string | undefined): number {
  if (
    preset === "very_slow" ||
    preset === "slow" ||
    preset === "normal" ||
    preset === "fast"
  ) {
    return SPEECH_SPEED_MAP[preset];
  }
  return SPEECH_SPEED_MAP.slow;
}

export function presetFromSpeed(speed: number | null | undefined): SpeechSpeedPreset {
  if (speed == null) return "slow";
  if (speed <= 0.78) return "very_slow";
  if (speed <= 0.87) return "slow";
  if (speed >= 0.95) return "fast";
  return "normal";
}

export function defaultSpeedForMode(mode: "free" | "exam"): number {
  return mode === "exam" ? EXAM_DEFAULT_SPEECH_SPEED : SPEECH_SPEED_MAP.normal;
}

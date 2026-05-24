export type SpeechSpeedPreset = "slow" | "normal" | "fast";

/** UI 라벨 → OpenAI TTS speed (0.25~4.0) */
export const SPEECH_SPEED_MAP: Record<SpeechSpeedPreset, number> = {
  slow: 0.8,
  normal: 0.9,
  fast: 1.0,
};

export const DEFAULT_SPEECH_SPEED_PRESET: SpeechSpeedPreset = "normal";

export function speedFromPreset(preset: string | undefined): number {
  if (preset === "slow" || preset === "normal" || preset === "fast") {
    return SPEECH_SPEED_MAP[preset];
  }
  return SPEECH_SPEED_MAP.normal;
}

export function presetFromSpeed(speed: number | null | undefined): SpeechSpeedPreset {
  if (speed == null || speed <= 0.85) return "slow";
  if (speed >= 0.95) return "fast";
  return "normal";
}

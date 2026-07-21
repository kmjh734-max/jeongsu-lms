export type SpeechSpeedPreset = "normal" | "x1_0" | "x1_25";

/**
 * UI 라벨 ≠ 실제 TTS speed
 * - 「1.25 배속」버튼 → 실제 1.0
 * - 「1.5 배속」버튼 → 실제 1.25
 */
export const SPEECH_SPEED_MAP: Record<SpeechSpeedPreset, number> = {
  normal: 0.75,
  x1_0: 1.0,
  x1_25: 1.25,
};

export const SPEECH_SPEED_OPTIONS: ReadonlyArray<{
  key: SpeechSpeedPreset;
  label: string;
}> = [
  { key: "normal", label: "보통 (0.75)" },
  { key: "x1_0", label: "1.25 배속" },
  { key: "x1_25", label: "1.5 배속" },
];

/** 기본 = 보통 */
export const EXAM_DEFAULT_SPEECH_SPEED = SPEECH_SPEED_MAP.normal;

export const DEFAULT_SPEECH_SPEED_PRESET: SpeechSpeedPreset = "normal";

export function speedFromPreset(preset: string | undefined): number {
  if (preset === "normal" || preset === "x1_0" || preset === "x1_25") {
    return SPEECH_SPEED_MAP[preset];
  }
  // 이전 키 호환
  if (preset === "very_slow") return SPEECH_SPEED_MAP.normal;
  if (preset === "x1_2" || preset === "slow") return SPEECH_SPEED_MAP.x1_0;
  if (preset === "x1_5" || preset === "fast") return SPEECH_SPEED_MAP.x1_25;
  return SPEECH_SPEED_MAP.normal;
}

export function presetFromSpeed(
  speed: number | null | undefined
): SpeechSpeedPreset {
  if (speed == null) return "normal";
  const entries = Object.entries(SPEECH_SPEED_MAP) as Array<
    [SpeechSpeedPreset, number]
  >;
  let best: SpeechSpeedPreset = "normal";
  let bestDist = Number.POSITIVE_INFINITY;
  for (const [key, value] of entries) {
    const d = Math.abs(value - speed);
    if (d < bestDist) {
      bestDist = d;
      best = key;
    }
  }
  return best;
}

export function defaultSpeedForMode(mode: "free" | "exam"): number {
  return mode === "exam"
    ? EXAM_DEFAULT_SPEECH_SPEED
    : SPEECH_SPEED_MAP.normal;
}

export type SpeechSpeedPreset = "middle" | "high" | "x1_0" | "x1_25";

/**
 * 세트를 구울 때 쓰는 말 속도 (선생님이 들어 보고 정한 값, 2026-09-21)
 * - 중등 0.75, 고등 0.8
 */
export const SPEECH_SPEED_MAP: Record<SpeechSpeedPreset, number> = {
  middle: 0.75,
  high: 0.8,
  x1_0: 1.0,
  x1_25: 1.25,
};

export const SPEECH_SPEED_OPTIONS: ReadonlyArray<{
  key: SpeechSpeedPreset;
  label: string;
}> = [
  { key: "middle", label: "중등 (0.75)" },
  { key: "high", label: "고등 (0.8)" },
  { key: "x1_0", label: "1.0 배속" },
  { key: "x1_25", label: "1.25 배속" },
];

/** 기본 = 중등 속도 */
export const EXAM_DEFAULT_SPEECH_SPEED = SPEECH_SPEED_MAP.middle;

export const DEFAULT_SPEECH_SPEED_PRESET: SpeechSpeedPreset = "middle";

export function speedFromPreset(preset: string | undefined): number {
  if (preset === "middle" || preset === "high" || preset === "x1_0" || preset === "x1_25") {
    return SPEECH_SPEED_MAP[preset];
  }
  // 이전 키 호환
  if (preset === "normal" || preset === "very_slow") return SPEECH_SPEED_MAP.middle;
  if (preset === "x1_2" || preset === "slow") return SPEECH_SPEED_MAP.x1_0;
  if (preset === "x1_5" || preset === "fast") return SPEECH_SPEED_MAP.x1_25;
  return SPEECH_SPEED_MAP.middle;
}

export function presetFromSpeed(
  speed: number | null | undefined
): SpeechSpeedPreset {
  if (speed == null) return "middle";
  const entries = Object.entries(SPEECH_SPEED_MAP) as Array<
    [SpeechSpeedPreset, number]
  >;
  let best: SpeechSpeedPreset = "middle";
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
  return mode === "exam" ? EXAM_DEFAULT_SPEECH_SPEED : SPEECH_SPEED_MAP.middle;
}

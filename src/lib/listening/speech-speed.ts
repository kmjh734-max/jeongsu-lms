export type SpeechSpeedPreset = "normal" | "x1_2" | "x1_5";

/** UI 라벨 → TTS speed (ElevenLabs / OpenAI) */
export const SPEECH_SPEED_MAP: Record<SpeechSpeedPreset, number> = {
  /** 기존「아주 천천히」→ 보통 */
  normal: 0.75,
  x1_2: 1.2,
  x1_5: 1.5,
};

export const SPEECH_SPEED_OPTIONS: ReadonlyArray<{
  key: SpeechSpeedPreset;
  label: string;
}> = [
  { key: "normal", label: "보통 (0.75)" },
  { key: "x1_2", label: "1.2 배속" },
  { key: "x1_5", label: "1.5 배속" },
];

/** 기본 = 보통 */
export const EXAM_DEFAULT_SPEECH_SPEED = SPEECH_SPEED_MAP.normal;

export const DEFAULT_SPEECH_SPEED_PRESET: SpeechSpeedPreset = "normal";

export function speedFromPreset(preset: string | undefined): number {
  if (preset === "normal" || preset === "x1_2" || preset === "x1_5") {
    return SPEECH_SPEED_MAP[preset];
  }
  // 이전 키 호환
  if (preset === "very_slow") return SPEECH_SPEED_MAP.normal;
  if (preset === "slow") return SPEECH_SPEED_MAP.x1_2;
  if (preset === "fast") return SPEECH_SPEED_MAP.x1_5;
  return SPEECH_SPEED_MAP.normal;
}

export function presetFromSpeed(
  speed: number | null | undefined
): SpeechSpeedPreset {
  if (speed == null) return "normal";
  // 가장 가까운 프리셋
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

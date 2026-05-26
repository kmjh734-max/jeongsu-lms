/** 4번 의도 선택지 검사 */

export const VALID_INTENTIONS = new Set([
  "감사",
  "거절",
  "칭찬",
  "사과",
  "항의",
  "격려",
  "부탁",
  "제안",
  "동의",
  "걱정",
]);

/** 별칭 → 표준 의도 */
const ALIASES: Record<string, string> = {
  응원: "격려",
  칭찬하기: "칭찬",
  사과하기: "사과",
  감사하기: "감사",
};

export function normalizeIntentionLabel(label: string): string {
  const t = label.trim().replace(/\s+/g, "");
  if (ALIASES[t]) return ALIASES[t]!;
  return t;
}

export function isIntentionChoice(choice: string): boolean {
  const n = normalizeIntentionLabel(choice);
  return VALID_INTENTIONS.has(n);
}

export function checkIntentionChoicesValid(choices: string[]): {
  ok: boolean;
  message?: string;
} {
  const invalid = choices.filter((c) => c.trim() && !isIntentionChoice(c));
  if (invalid.length > 0) {
    return {
      ok: false,
      message: `의도어가 아닌 선택지: ${invalid.join(", ")}`,
    };
  }
  const normalized = choices.map((c) => normalizeIntentionLabel(c));
  const unique = new Set(normalized.filter(Boolean));
  if (unique.size < choices.filter((c) => c.trim()).length) {
    return { ok: false, message: "선택지에 같은 의도가 중복되었습니다." };
  }
  return { ok: true };
}

const VAGUE_FINAL =
  /^(okay|ok|sure|thanks|thank you|yes|no|right|fine|good|great)\.?$/i;

export function isVagueFinalUtterance(text: string): boolean {
  return VAGUE_FINAL.test(text.trim());
}

export function intentionMatchesChoice(
  targetIntention: string,
  choices: string[],
  correctIndex: number
): boolean {
  const target = normalizeIntentionLabel(targetIntention);
  const choice = normalizeIntentionLabel(choices[correctIndex - 1] ?? "");
  return !target || !choice || target === choice;
}

export function speakerLabelFromCode(speaker: "M" | "W"): "남자" | "여자" {
  return speaker === "M" ? "남자" : "여자";
}

export function instructionMatchesLastSpeaker(
  instruction: string,
  lastSpeaker: "M" | "W"
): boolean {
  const who = speakerLabelFromCode(lastSpeaker);
  if (who === "남자" && /남자/.test(instruction)) return true;
  if (who === "여자" && /여자/.test(instruction)) return true;
  return false;
}

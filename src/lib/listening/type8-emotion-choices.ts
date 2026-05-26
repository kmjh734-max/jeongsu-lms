/** 8번 심정·감정 선택지 검사 */

import {
  instructionMatchesTargetPerson,
  speakerCodeFromTarget,
  targetPersonLabel,
} from "@/lib/listening/type7-career-choices";

export const VALID_EMOTIONS = new Set([
  "실망",
  "설렘",
  "걱정",
  "안도",
  "만족",
  "불안",
  "당황",
  "슬픔",
  "놀람",
  "자랑스러움",
  "지루함",
  "평화로움",
]);

const EMOTION_ALIASES: Record<string, string> = {
  당황스러움: "당황",
  당황함: "당황",
  실망감: "실망",
  불안함: "불안",
  걱정됨: "걱정",
  설레임: "설렘",
  기쁨: "만족",
  화남: "실망",
};

const MOSTLY_ENGLISH = /^[A-Za-z0-9\s.,'"-]+$/;

const VAGUE_CLUE =
  /^(okay|ok|really|i see|thank you|thanks|yes|no|right|sure|good)\.?$/i;

export function normalizeEmotionLabel(label: string): string {
  const t = label.trim().replace(/\s+/g, "");
  if (EMOTION_ALIASES[t]) return EMOTION_ALIASES[t]!;
  if (t.endsWith("스러움") && VALID_EMOTIONS.has(t.replace(/스러움$/, ""))) {
    return t.replace(/스러움$/, "");
  }
  return t;
}

export function isEmotionChoice(choice: string): boolean {
  const n = normalizeEmotionLabel(choice);
  return VALID_EMOTIONS.has(n);
}

export function checkKoreanEmotionChoices(choices: string[]): {
  ok: boolean;
  message?: string;
} {
  const invalid = choices.filter((c) => c.trim() && !isEmotionChoice(c));
  if (invalid.length > 0) {
    return {
      ok: false,
      message: `감정어가 아닌 선택지: ${invalid.join(", ")}`,
    };
  }
  const normalized = choices.map((c) => normalizeEmotionLabel(c));
  const unique = new Set(normalized.filter(Boolean));
  if (unique.size < choices.filter((c) => c.trim()).length) {
    return { ok: false, message: "선택지에 같은 감정이 중복되었습니다." };
  }
  return { ok: true };
}

export function emotionMatchesChoice(
  targetEmotion: string,
  choices: string[],
  correctIndex: number
): boolean {
  const target = normalizeEmotionLabel(targetEmotion);
  const choice = normalizeEmotionLabel(choices[correctIndex - 1] ?? "");
  return !!target && !!choice && target === choice;
}

export function indexOfEmotionInChoices(
  choices: string[],
  emotion: string
): number {
  const target = normalizeEmotionLabel(emotion);
  return choices.findIndex((c) => normalizeEmotionLabel(c) === target);
}

export function normalizeEmotionClues(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((x) => String(x).trim()).filter(Boolean);
}

export function isVagueAnswerClue(clue: string): boolean {
  return VAGUE_CLUE.test(clue.trim());
}

export function segmentsForTarget(
  segments: Array<{ speaker: string; text: string }>,
  targetPerson: string
): Array<{ speaker: string; text: string }> {
  const code = speakerCodeFromTarget(targetPerson);
  if (!code) return segments;
  return segments.filter((s) => s.speaker === code);
}

export function targetPersonHasClueText(
  segments: Array<{ speaker: string; text: string }>,
  targetPerson: string,
  minChars = 20
): boolean {
  const texts = segmentsForTarget(segments, targetPerson)
    .map((s) => s.text.trim())
    .filter(Boolean);
  const total = texts.join(" ").length;
  return texts.length >= 2 && total >= minChars;
}

export {
  instructionMatchesTargetPerson,
  speakerCodeFromTarget,
  targetPersonLabel,
};

export function validateType8EmotionFields(q: {
  instruction: string;
  choices: string[];
  correct_answer: number;
  answer_clue: string;
  target_person?: string;
  target_emotion?: string;
  emotion_clues?: string[];
  segments: Array<{ speaker: string; text: string }>;
}): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  const target = q.target_person?.trim() ?? "";
  const emotion = q.target_emotion?.trim() ?? "";

  if (!target) {
    issues.push("target_person(남자/여자)이 필요합니다.");
  } else if (!instructionMatchesTargetPerson(q.instruction, target)) {
    issues.push("지시문과 target_person이 일치하지 않습니다.");
  }

  if (!emotion) {
    issues.push("target_emotion(정답 감정)이 필요합니다.");
  } else if (!emotionMatchesChoice(emotion, q.choices, q.correct_answer)) {
    issues.push("target_emotion과 correct_answer 선택지가 일치하지 않습니다.");
  }

  const clues = q.emotion_clues ?? [];
  if (clues.length < 1) {
    issues.push("emotion_clues에 감정 단서가 1개 이상 필요합니다.");
  }

  if (q.answer_clue.trim()) {
    if (isVagueAnswerClue(q.answer_clue)) {
      issues.push("answer_clue가 감정 판단 근거로 충분하지 않습니다.");
    }
  } else {
    issues.push("answer_clue가 필요합니다.");
  }

  if (target && !targetPersonHasClueText(q.segments, target)) {
    issues.push("목표 인물의 발화에 감정 단서가 충분하지 않습니다.");
  }

  return { ok: issues.length === 0, issues };
}

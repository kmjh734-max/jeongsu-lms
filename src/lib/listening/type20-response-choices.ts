/** 20번 응답 고르기 선택지·맥락 검사 (19번과 대칭) */

import {
  checkEnglishResponseChoices,
  instructionMatchesBlankSpeaker,
  isTooGenericResponse,
  parseBlankSpeaker,
  previousTurnMatchesLastSegment,
  questionTextMatchesBlankSpeaker,
} from "@/lib/listening/type19-response-choices";

export type { DistractorReasonEntry } from "@/lib/listening/type19-response-choices";
export {
  checkEnglishResponseChoices,
  distractorReasonsToStrings,
  instructionMatchesBlankSpeaker,
  isTooGenericResponse,
  normalizeDistractorReasons,
  parseBlankSpeaker,
  previousTurnMatchesLastSegment,
  questionTextForBlankSpeaker,
} from "@/lib/listening/type19-response-choices";

export const TYPE20_END_SPEAKER = "M";
export const TYPE20_BLANK_SPEAKER = "W";

const TYPE19_LIKE_SITUATIONS =
  /잃|분실|lost\s*item|can't find|cannot find|looking for my|lost my/i;

const LOST_ITEM_SCRIPT =
  /\b(?:can't find|cannot find|lost my|looking for my)\b/i;

export function buildType20Instruction(): string {
  return "대화를 듣고, 남자의 마지막 말에 이어질 여자의 말로 가장 적절한 것을 고르시오.";
}

export function normalizeSituationType(raw: unknown): string {
  return String(raw ?? "").trim();
}

export function looksLikeType19Situation(situationType: string): boolean {
  return TYPE19_LIKE_SITUATIONS.test(situationType.trim());
}

export function scriptLooksLikeLostItemDialogue(script: string): boolean {
  return LOST_ITEM_SCRIPT.test(script);
}

export function validateType20ResponseFields(q: {
  instruction: string;
  question_text: string;
  choices: string[];
  correct_answer: number;
  answer_clue: string;
  previous_turn: string;
  blank_speaker?: string;
  situation_type?: string;
  correct_response_function?: string;
  distractor_reason?: string[];
  segments: Array<{ speaker: string; text: string }>;
  script_text?: string;
}): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  const blank =
    parseBlankSpeaker(q.blank_speaker ?? "") ?? TYPE20_BLANK_SPEAKER;

  if (!/응답|이어질/.test(q.instruction)) {
    issues.push("지시문이 응답 고르기 유형에 맞지 않을 수 있습니다.");
  }

  if (!instructionMatchesBlankSpeaker(q.instruction, blank)) {
    issues.push("지시문과 blank_speaker(빈칸 화자)가 일치하지 않습니다.");
  }
  if (!questionTextMatchesBlankSpeaker(q.question_text, blank)) {
    issues.push("question_text와 blank_speaker가 일치하지 않습니다.");
  }

  const choiceCheck = checkEnglishResponseChoices(q.choices);
  if (!choiceCheck.ok) {
    issues.push(choiceCheck.message ?? "보기 형식 오류");
  }

  const correctChoice = q.choices[q.correct_answer - 1]?.trim() ?? "";
  if (correctChoice && isTooGenericResponse(correctChoice)) {
    issues.push("정답 응답이 너무 일반적입니다(Okay/Yes/Sure/Thank you 등).");
  }

  if (!q.previous_turn?.trim()) {
    issues.push("previous_turn(직전 발화)이 필요합니다.");
  } else if (!previousTurnMatchesLastSegment(q.previous_turn, q.segments)) {
    issues.push("previous_turn이 segments 마지막 발화와 일치하지 않습니다.");
  }

  const lastSpeaker = q.segments[q.segments.length - 1]?.speaker;
  if (lastSpeaker !== TYPE20_END_SPEAKER) {
    issues.push("20번은 마지막 segment 화자가 M(남자)여야 합니다.");
  }

  if (!q.situation_type?.trim()) {
    issues.push("situation_type(상황 유형)이 필요합니다.");
  } else if (looksLikeType19Situation(q.situation_type)) {
    issues.push("situation_type이 19번(잃어버린 물건 등)과 너무 비슷합니다.");
  }

  const script =
    q.script_text?.trim() || q.segments.map((s) => s.text).join(" ");
  if (script && scriptLooksLikeLostItemDialogue(script)) {
    issues.push("대본이 19번 유형(잃어버린 물건)과 너무 비슷합니다.");
  }

  if (!q.correct_response_function?.trim()) {
    issues.push("correct_response_function(정답 응답 기능)이 필요합니다.");
  }

  const dr = q.distractor_reason ?? [];
  if (dr.filter(Boolean).length < 5) {
    issues.push("distractor_reason(오답 이유) 5개가 필요합니다.");
  }

  if (!q.answer_clue?.trim()) {
    issues.push("answer_clue가 필요합니다.");
  }

  return { ok: issues.length === 0, issues };
}

import { buildScriptText } from "@/lib/listening/script-text";
import type { GeneratedListeningQuestion, ListeningScriptSegment } from "@/lib/listening/types";

const BLANK_LINE = /^(?:_{2,}|\.{2,}|-{2,}|\[?\s*(?:pause|blank|silence)\s*\]?)$/i;

/** TTS·음원에 넣으면 안 되는 빈칸/기호 대사 */
export function isNonSpokenSegmentText(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  if (BLANK_LINE.test(t)) return true;
  if (/^_{1,}$/.test(t.replace(/\s/g, ""))) return true;
  return false;
}

export function filterSpokenSegments(
  segments: ListeningScriptSegment[]
): ListeningScriptSegment[] {
  return segments.filter((s) => !isNonSpokenSegmentText(s.text));
}

/** 19: 여자 마지막 말까지 / 20: 남자 마지막 말까지 (이후 응답 대사 제거) */
export function trimContinuationDialogue(
  segments: ListeningScriptSegment[],
  endSpeaker: "M" | "W"
): ListeningScriptSegment[] {
  const spoken = filterSpokenSegments(segments);
  let lastEnd = -1;
  for (let i = spoken.length - 1; i >= 0; i--) {
    if (spoken[i]!.speaker === endSpeaker) {
      lastEnd = i;
      break;
    }
  }
  if (lastEnd < 0) return spoken;
  return spoken.slice(0, lastEnd + 1);
}

export function defaultContinuationQuestionText(typeId: 19 | 20): string {
  return typeId === 19 ? "Man: ________" : "Woman: ________";
}

function normalizeQuestionTextForType(
  _raw: string,
  typeId: 19 | 20
): string {
  return defaultContinuationQuestionText(typeId);
}

/** 19~20번 지문 표시용 (DB에 'Man: ____ only' 등이 있어도 기출 형식으로 통일) */
export function continuationQuestionDisplayText(orderIndex: number): string | null {
  if (orderIndex === 19) return defaultContinuationQuestionText(19);
  if (orderIndex === 20) return defaultContinuationQuestionText(20);
  return null;
}

export function displayQuestionTextForOrder(
  orderIndex: number,
  questionText: string
): string | null {
  const fixed = continuationQuestionDisplayText(orderIndex);
  if (fixed) return fixed;
  const t = questionText.trim();
  return t || null;
}

/**
 * 19~20번 이어 말하기: 지문(영어 빈칸) 보정 + 음원에 넣지 않을 응답 줄 제거
 */
export function fixContinuationQuestion(
  q: GeneratedListeningQuestion,
  typeId: number
): GeneratedListeningQuestion {
  if (typeId !== 19 && typeId !== 20) {
    return {
      ...q,
      segments: filterSpokenSegments(q.segments),
    };
  }

  const endSpeaker: "M" | "W" = typeId === 19 ? "W" : "M";
  const segments = trimContinuationDialogue(q.segments, endSpeaker);
  const question_text = normalizeQuestionTextForType(
    q.question_text,
    typeId as 19 | 20
  );

  return {
    ...q,
    segments,
    question_text,
    script_text: buildScriptText(segments),
  };
}

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

/** 학생 풀이 중 빈칸 표시(19~20). 표(14)는 table_data 컴포넌트 사용 */
export function displayQuestionTextForOrder(
  orderIndex: number,
  questionText: string,
  options?: { hasTableData?: boolean; forStudent?: boolean }
): string | null {
  if (options?.hasTableData || orderIndex === 14) return null;
  if (options?.forStudent) {
    return continuationQuestionDisplayText(orderIndex);
  }
  const fixed = continuationQuestionDisplayText(orderIndex);
  if (fixed) return fixed;
  const t = questionText.trim();
  return t || null;
}

function inferPreviousTurn(segments: ListeningScriptSegment[]): string {
  const spoken = filterSpokenSegments(segments);
  const last = spoken[spoken.length - 1];
  if (!last) return "";
  const label = last.speaker === "W" ? "W" : last.speaker === "M" ? "M" : "ANN";
  return `${label}: ${last.text}`;
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
  const previous_turn =
    q.previous_turn?.trim() || inferPreviousTurn(segments);
  const distractor_reason = Array.isArray(q.distractor_reason)
    ? q.distractor_reason.map(String)
  : [];

  return {
    ...q,
    segments,
    question_text,
    previous_turn,
    distractor_reason,
    script_text: buildScriptText(segments),
  };
}

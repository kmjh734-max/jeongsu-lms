/**
 * 화면·인쇄·음원에서 "이 문항이 어떤 유형인지"를 번호가 아니라 이름·지시문으로 판단한다.
 * 예전에는 19·20번 = 응답으로 보고 "Woman: ____"을 찍었는데, 중3 20번은 상황에 맞는 말이고
 * 중3 17번(응답)은 빈칸 줄이 빠졌다. 서버·클라이언트 공용(DB 호출 없음).
 */
import type { ListeningGradeLevel } from "@/lib/listening/grade-level";
import { resolveQuestionTypeKey, type TypedQuestionLike } from "@/lib/listening/legacy-type-map";
import {
  getTypeDef,
  isMiniDialogueTypeKey,
  responseDirectionOf,
  type ListeningTypeKey,
  type ResponseDirection,
} from "@/lib/listening/type-catalog";

export type DisplayQuestionLike = TypedQuestionLike & { table_data?: unknown };

/** 문항의 유형 키 (학년을 알면 넘긴다 — 모르면 이름·지시문으로 짐작) */
export function displayTypeKey(
  q: DisplayQuestionLike,
  grade?: ListeningGradeLevel
): ListeningTypeKey | undefined {
  return resolveQuestionTypeKey(q, grade);
}

/** 중등 응답 문항의 방향 (지시문 → 빈칸 화자 → 인쇄 줄 → 마지막 화자 → 옛 번호 19·20) */
function middleResponseDirection(q: DisplayQuestionLike): ResponseDirection | null {
  const dir = responseDirectionOf({
    instruction: q.instruction ?? undefined,
    blank_speaker: q.blank_speaker ?? undefined,
    question_text: q.question_text ?? undefined,
    segments: q.segments,
  });
  if (dir) return dir;
  if (q.order_index === 19) return "wm";
  if (q.order_index === 20) return "mw";
  return null;
}

/**
 * 중등 응답 문항이면 인쇄할 빈칸 줄("Man: ________" / "Woman: ________"), 아니면 null.
 * 고등 짧은·긴 응답은 예전처럼 저장된 question_text를 쓴다.
 */
export function responseBlankLine(q: DisplayQuestionLike, grade?: ListeningGradeLevel): string | null {
  if (displayTypeKey(q, grade) !== "M_RESPONSE") return null;
  const dir = middleResponseDirection(q);
  if (!dir) return null;
  return dir === "wm" ? "Man: ________" : "Woman: ________";
}

/** 응답 줄을 잘라 낼 마지막 화자 (중등 응답: 여→남이면 W까지) — 응답 문항이 아니면 null */
export function responseEndSpeaker(q: DisplayQuestionLike, grade?: ListeningGradeLevel): "M" | "W" | null {
  if (displayTypeKey(q, grade) !== "M_RESPONSE") return null;
  const dir = middleResponseDirection(q);
  if (!dir) return null;
  return dir === "wm" ? "W" : "M";
}

/**
 * 문항 지문(질문 줄) 표시. 표·양식이 있으면 표를 쓰므로 null, 중등 응답은 빈칸 줄,
 * 학생 화면·인쇄는 그 밖의 줄을 숨긴다(예전 동작), 편집기는 저장된 question_text.
 */
export function displayQuestionText(
  q: DisplayQuestionLike,
  opts?: { forStudent?: boolean; grade?: ListeningGradeLevel }
): string | null {
  const key = displayTypeKey(q, opts?.grade);
  if (q.table_data || key === "M_TABLE_MISMATCH") return null;
  const blank = responseBlankLine(q, opts?.grade);
  if (blank) return blank;
  if (opts?.forStudent) return null;
  const t = String(q.question_text ?? "").trim();
  return t || null;
}

/** 짧은 대화 5개(그림 상황·어색한 대화) — 선택지 ①~⑤는 소리로만 */
export function isMiniDialogueQuestion(q: DisplayQuestionLike, grade?: ListeningGradeLevel): boolean {
  return isMiniDialogueTypeKey(displayTypeKey(q, grade));
}

/** 편집기·보고서용 유형 이름 (저장된 이름이 없으면 카탈로그 이름) */
export function displayTypeLabel(q: DisplayQuestionLike, grade?: ListeningGradeLevel): string {
  const saved = String(q.question_type ?? "").trim();
  if (saved) return saved;
  const key = displayTypeKey(q, grade);
  return key ? getTypeDef(key).label : "듣기";
}

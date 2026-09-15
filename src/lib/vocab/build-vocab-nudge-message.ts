import { ACADEMY_NAME } from "@/lib/branding";

/** 학부모께 권할 할 일 — 이어서 할 단계 · 최종 시험 다시 보기 · 새로 시작 */
export type VocabNudgeFocus =
  | { kind: "stage"; setTitle: string; stage: number }
  | { kind: "retest"; setTitle: string }
  | { kind: "start"; setTitle: string };

export type VocabNudgeKind = "not-studied" | "retry";

/** "「1과 단어」 2단계" 같은 짧은 설명 (목록·카드 한 줄) */
export function describeVocabNudgeFocus(focus: VocabNudgeFocus | null): string {
  if (!focus) return "";
  if (focus.kind === "stage") return `「${focus.setTitle}」 ${focus.stage}단계`;
  if (focus.kind === "retest") return `「${focus.setTitle}」 최종 시험 다시 보기`;
  return `「${focus.setTitle}」 시작 전`;
}

function focusAction(focus: VocabNudgeFocus | null): string {
  if (!focus) return "단어학습을 할 수 있도록";
  if (focus.kind === "stage") return `「${focus.setTitle}」 ${focus.stage}단계를 마무리할 수 있도록`;
  if (focus.kind === "retest") return `「${focus.setTitle}」 최종 시험을 다시 볼 수 있도록`;
  return `「${focus.setTitle}」 학습을 시작할 수 있도록`;
}

/** 단어학습 학부모 알림 — 학생 한 명에게만 쓴다 */
export function buildVocabNudgeMessage(params: {
  studentName: string;
  kind: VocabNudgeKind;
  focus: VocabNudgeFocus | null;
  /** 현황에서 고른 날이 오늘인지 */
  isToday: boolean;
  /** 고른 날 (예: "9월 12일") — 오늘이 아닐 때 문구에 쓴다 */
  dayLabel: string;
  academyName?: string;
  /** 학생 학습 화면 주소 */
  studyUrl?: string;
}): string {
  const {
    studentName,
    kind,
    focus,
    isToday,
    dayLabel,
    academyName = ACADEMY_NAME,
    studyUrl,
  } = params;

  const greeting = `안녕하세요, ${studentName} 학부모님. ${academyName}입니다.`;

  let body: string;
  if (kind === "retry" && focus?.kind === "retest") {
    body = `${studentName} 학생이 「${focus.setTitle}」 최종 시험에서 아쉽게 통과하지 못했는데, 아직 다시 보지 않았어요. 한 번 더 도전할 수 있도록 응원해 주세요. 🙂`;
  } else if (isToday) {
    body = `오늘 ${studentName} 학생의 단어학습이 아직 진행되지 않았어요. 오늘 안에 ${focusAction(focus)} 한 번 챙겨 주세요. 🙂`;
  } else {
    body = `${dayLabel}에는 ${studentName} 학생이 단어학습을 하지 않았어요. 오늘은 ${focusAction(focus)} 한 번 챙겨 주세요. 🙂`;
  }

  const linkLine = studyUrl ? `\n\n단어학습 바로가기\n${studyUrl}` : "";

  return `${greeting}\n\n${body}${linkLine}`;
}

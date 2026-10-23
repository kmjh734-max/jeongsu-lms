import { ACADEMY_NAME } from "@/lib/branding";
import { TODAY_STUDY_KIND_LABELS, type TodayStudyItem } from "@/lib/study-plan/today-status";

/** 알림을 받는 분 — 학생 본인 또는 학부모 */
export type TodayNudgeRecipient = "student" | "parent";

/** 일정표에 적어 둔 이번 회차 숙제 한 줄 */
export interface TodayNudgeHomework {
  area: string;
  homework: string;
}

/** "2026-10-23" → "10월 23일" */
export function todayLabelOf(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(m)}월 ${Number(d)}일`;
}

function itemLine(item: TodayStudyItem): string {
  const head = TODAY_STUDY_KIND_LABELS[item.kind];
  const how = item.state === "partial" ? "하다 말았어요" : "아직 안 했어요";
  return `· ${head} — ${item.title} (${how})`;
}

/**
 * 오늘 안 한 학습을 알리는 카톡 문구. 학생 한 명에게만 쓴다.
 *
 * 받는 분이 학생이면 학생에게 말하듯, 학부모면 학부모께 말하듯 쓴다.
 * 안 한 것만 적고 다 한 것은 적지 않는다 — 문구가 길어지면 카톡 화면을 넘긴다.
 */
export function buildTodayNudgeMessage(params: {
  studentName: string;
  recipient: TodayNudgeRecipient;
  /** 오늘 안 했거나 덜 한 것만 */
  undone: TodayStudyItem[];
  /** 일정표에 적어 둔 이번 회차 숙제 (있을 때만) */
  homework?: TodayNudgeHomework[];
  todayIso: string;
  academyName?: string;
  /** 학생 학습 화면 주소 */
  studyUrl?: string;
}): string {
  const { studentName, recipient, undone, homework = [], todayIso, academyName = ACADEMY_NAME, studyUrl } = params;
  const day = todayLabelOf(todayIso);
  const greeting =
    recipient === "student"
      ? `${studentName} 학생, 안녕하세요. ${academyName}입니다.`
      : `안녕하세요, ${studentName} 학부모님. ${academyName}입니다.`;

  const lines: string[] = [greeting, ""];
  if (undone.length > 0) {
    lines.push(
      recipient === "student"
        ? `오늘(${day}) 아직 안 한 온라인 학습이 있어요.`
        : `오늘(${day}) ${studentName} 학생의 온라인 학습 중 아직 안 된 것이 있어 안내드립니다.`,
    );
    for (const item of undone) lines.push(itemLine(item));
  }
  const hw = homework.filter((h) => h.homework.trim());
  if (hw.length > 0) {
    if (undone.length > 0) lines.push("");
    lines.push("이번 수업 숙제");
    for (const h of hw) lines.push(`· ${h.area} — ${h.homework.trim()}`);
  }
  lines.push("");
  lines.push(
    recipient === "student"
      ? "오늘 안에 마무리해 주세요. 🙂"
      : "오늘 안에 할 수 있도록 한 번 챙겨 주세요. 🙂",
  );
  if (studyUrl) {
    lines.push("", "학습 바로가기", studyUrl);
  }
  return lines.join("\n");
}

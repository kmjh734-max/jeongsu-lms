import type { SupabaseClient } from "@supabase/supabase-js";
import { ATTENDANCE_LABELS, type Attendance } from "@/lib/study-plan";

/** 리포트에 들어가는 학습일정표 요약 */
export interface StudyPlanReportSection {
  /** "2026년 9월" 처럼 */
  monthLabel: string;
  /** 출결 개수 — 적지 않은 회차는 세지 않는다 */
  attendance: { present: number; late: number; absent: number; makeup: number };
  /** 날짜가 잡힌 회차 수 */
  sessionsPlanned: number;
  /** 진도를 적은 회차 수 */
  sessionsRecorded: number;
  /** 영역별 진도 한 줄 — ["영단어: 1과, 2과", …] */
  areaLines: string[];
  /** 학부모께 그대로 보여 줄 한 문장 */
  line: string;
}

/**
 * 기간에 걸친 달 목록. 너무 길어지지 않게 최근 12달까지만 본다.
 *
 * 앞에서부터 12달을 세면 '전체 기간' 리포트에서 정작 이번 달이 잘려 나간다
 * (2025-09 ~ 2026-09 은 13달이라 2026-09 가 빠졌다). 그래서 뒤에서부터 센다.
 */
function monthsBetween(from: string, to: string): Array<{ year: number; month: number }> {
  const out: Array<{ year: number; month: number }> = [];
  const a = new Date(`${from}T00:00:00Z`);
  const b = new Date(`${to}T00:00:00Z`);
  const cur = new Date(Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), 1));
  while (cur <= b && out.length < 120) {
    out.push({ year: cur.getUTCFullYear(), month: cur.getUTCMonth() + 1 });
    cur.setUTCMonth(cur.getUTCMonth() + 1);
  }
  return out.slice(-12);
}

/**
 * 리포트 기간에 걸친 학습일정표를 한 칸으로 줄인다.
 *
 * 선생님이 일정표에 적어 둔 출결과 진도를 그대로 읽어 오므로, 일정표를 고치면
 * 다음에 만드는 리포트에 바로 반영된다.
 */
export async function loadStudyPlanSection(
  admin: SupabaseClient,
  studentId: string,
  range: { from: string; to: string },
): Promise<StudyPlanReportSection | null> {
  const months = monthsBetween(range.from, range.to);
  if (months.length === 0) return null;

  const { data: plans } = await admin
    .from("study_plans")
    .select("id, year, month, sessions_per_week, session_dates, attendance")
    .eq("student_id", studentId)
    .in("year", [...new Set(months.map((m) => m.year))])
    .in("month", [...new Set(months.map((m) => m.month))]);

  const wanted = (plans ?? []).filter((p) =>
    months.some((m) => m.year === Number(p.year) && m.month === Number(p.month)),
  );
  if (wanted.length === 0) return null;

  const planIds = wanted.map((p) => String(p.id));
  const { data: rows } = await admin
    .from("study_plan_rows")
    .select("plan_id, week, area, entries, order_index")
    .in("plan_id", planIds)
    .order("order_index");

  const count = { present: 0, late: 0, absent: 0, makeup: 0, holiday: 0 };
  let sessionsPlanned = 0;
  for (const p of wanted) {
    const dates = (p.session_dates ?? {}) as Record<string, string[]>;
    const att = (p.attendance ?? {}) as Record<string, Attendance[]>;
    for (const [week, list] of Object.entries(dates)) {
      (list ?? []).forEach((d, i) => {
        if (!d || d < range.from || d > range.to) return;
        sessionsPlanned += 1;
        const mark = att[week]?.[i];
        if (mark && mark in count) count[mark as keyof typeof count] += 1;
      });
    }
  }

  // 영역마다 적어 둔 진도를 모은다
  const byArea = new Map<string, string[]>();
  let sessionsRecorded = 0;
  for (const r of rows ?? []) {
    const area = String(r.area ?? "").trim();
    if (!area) continue;
    const entries = (r.entries ?? []) as Array<{ progress?: string }>;
    for (const e of entries) {
      const text = String(e?.progress ?? "").trim();
      if (!text) continue;
      sessionsRecorded += 1;
      const list = byArea.get(area) ?? [];
      if (!list.includes(text)) list.push(text);
      byArea.set(area, list);
    }
  }

  const first = wanted[0]!;
  const last = wanted[wanted.length - 1]!;
  const monthLabel =
    wanted.length === 1
      ? `${first.year}년 ${first.month}월`
      : `${first.year}년 ${first.month}월 ~ ${last.year}년 ${last.month}월`;

  const done = count.present + count.late + count.makeup;
  // 공휴일은 애초에 수업이 없던 날이라 참여율에서 뺀다
  const marked = done + count.absent;
  const parts: string[] = [];
  if (marked > 0) {
    parts.push(`수업 ${marked}회 중 ${done}회 참여`);
    const extra = (Object.keys(ATTENDANCE_LABELS) as Array<keyof typeof ATTENDANCE_LABELS>)
      .filter((k) => k !== "present" && count[k] > 0)
      .map((k) => `${ATTENDANCE_LABELS[k]} ${count[k]}회`);
    if (extra.length) parts.push(extra.join(", "));
  } else if (sessionsPlanned > 0) {
    parts.push(`수업 ${sessionsPlanned}회 예정`);
  }
  if (count.absent + count.holiday > 0) {
    parts.push("수업이 없던 회차의 진도는 다음 회차로 넘겼습니다");
  }

  return {
    monthLabel,
    attendance: count,
    sessionsPlanned,
    sessionsRecorded,
    areaLines: [...byArea].map(([area, list]) => `${area}: ${list.join(", ")}`),
    line: parts.length ? `${monthLabel} ${parts.join(" · ")}` : `${monthLabel} 학습일정표`,
  };
}

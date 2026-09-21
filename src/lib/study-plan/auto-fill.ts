"use server";

import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { isStudyPlanEnabled } from "@/lib/study-plan/access";

/** 일정표 회차 하나에 채워 넣을 한 줄 */
export interface AutoFillCell {
  week: number;
  index: number;
  /** 그 날짜에 실제로 한 것 — 없으면 빈 문자열 */
  text: string;
}

export type AutoFillArea = "listening" | "vocab";

function one<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

/**
 * 학생이 실제로 한 듣기·단어 기록을 일정표 회차 날짜에 맞춰 돌려준다.
 *
 * 일정표의 '듣기'·'영단어' 줄을 손으로 채우지 않아도 되도록, 회차 날짜마다
 * 그날 한 것을 한 줄로 만들어 준다. 채울지 말지는 화면에서 선생님이 고른다.
 */
export async function loadAutoFill(input: {
  studentId: string;
  area: AutoFillArea;
  /** 주차별 회차 날짜: { "1": ["2026-09-01", …] } */
  sessionDates: Record<string, string[]>;
}): Promise<{ ok: true; cells: AutoFillCell[] } | { ok: false; message: string }> {
  const profile = await getCurrentProfile();
  if (!profile || !["admin", "teacher"].includes(profile.role) || !profile.academy_id) {
    return { ok: false, message: "권한이 없어요." };
  }
  if (!(await isStudyPlanEnabled(profile.academy_id))) {
    return { ok: false, message: "권한이 없어요." };
  }

  const slots: { week: number; index: number; date: string }[] = [];
  for (const [week, list] of Object.entries(input.sessionDates)) {
    (list ?? []).forEach((date, index) => {
      if (date) slots.push({ week: Number(week), index, date });
    });
  }
  if (slots.length === 0) {
    return { ok: false, message: "회차 날짜를 먼저 넣어 주세요." };
  }
  const dates = [...new Set(slots.map((s) => s.date))].sort();
  const first = dates[0]!;
  const last = dates[dates.length - 1]!;

  const admin = createAdminClient();
  const { data: student } = await admin
    .from("profiles")
    .select("id, academy_id")
    .eq("id", input.studentId)
    .maybeSingle();
  if (!student || student.academy_id !== profile.academy_id) {
    return { ok: false, message: "우리 학원 학생이 아니에요." };
  }

  const byDate =
    input.area === "listening"
      ? await listeningByDate(admin, input.studentId, first, last)
      : await vocabByDate(admin, input.studentId, first, last);

  return {
    ok: true,
    cells: slots.map((s) => ({ week: s.week, index: s.index, text: byDate.get(s.date) ?? "" })),
  };
}

/** 날짜마다 그날 끝낸 듣기 세트 이름 */
async function listeningByDate(
  admin: ReturnType<typeof createAdminClient>,
  studentId: string,
  first: string,
  last: string,
): Promise<Map<string, string>> {
  const { data } = await admin
    .from("listening_daily_tasks")
    .select("task_date, status, completed_count, total_count, set:listening_sets(title)")
    .eq("student_id", studentId)
    .gte("task_date", first)
    .lte("task_date", last);

  const out = new Map<string, string[]>();
  for (const r of data ?? []) {
    const title = one(r.set as { title: string } | { title: string }[] | null)?.title ?? "듣기";
    const done = Number(r.completed_count ?? 0);
    const total = Number(r.total_count ?? 0);
    const label =
      r.status === "completed"
        ? title
        : total > 0
          ? `${title} (${done}/${total})`
          : `${title} (안 함)`;
    const list = out.get(String(r.task_date)) ?? [];
    if (!list.includes(label)) list.push(label);
    out.set(String(r.task_date), list);
  }
  return new Map([...out].map(([d, list]) => [d, list.join(", ")]));
}

/** 날짜마다 그날 끝낸 단어장 단계 수 */
async function vocabByDate(
  admin: ReturnType<typeof createAdminClient>,
  studentId: string,
  first: string,
  last: string,
): Promise<Map<string, string>> {
  const fromUtc = new Date(`${first}T00:00:00+09:00`).toISOString();
  const toUtc = new Date(`${last}T23:59:59+09:00`).toISOString();
  const { data } = await admin
    .from("vocab_stage_progress")
    .select(
      "stage1_completed_at, stage2_completed_at, stage3_completed_at, stage4_passed_at, set:vocab_sets(title)",
    )
    .eq("student_id", studentId)
    .gte("updated_at", fromUtc)
    .lte("updated_at", toUtc);

  /** 날짜 → 단어장 이름 → 끝낸 단계 수 */
  const byDate = new Map<string, Map<string, number>>();
  for (const r of data ?? []) {
    const title = one(r.set as { title: string } | { title: string }[] | null)?.title ?? "단어장";
    for (const key of [
      "stage1_completed_at",
      "stage2_completed_at",
      "stage3_completed_at",
      "stage4_passed_at",
    ] as const) {
      const at = (r as unknown as Record<string, string | null>)[key];
      if (!at || at < fromUtc || at > toUtc) continue;
      // UTC 시각을 한국 날짜로
      const iso = new Date(new Date(at).getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
      const per = byDate.get(iso) ?? new Map<string, number>();
      per.set(title, (per.get(title) ?? 0) + 1);
      byDate.set(iso, per);
    }
  }

  return new Map(
    [...byDate].map(([d, per]) => [
      d,
      [...per].map(([title, n]) => `${title} ${n}단계`).join(", "),
    ]),
  );
}


/** 이 학생에게 배정된 듣기 세트·단어장 이름 (반 배정 + 개별 배정) */
export async function loadAssignedTitles(
  studentId: string,
): Promise<{ ok: true; listening: string[]; vocab: string[] } | { ok: false; message: string }> {
  const profile = await getCurrentProfile();
  if (!profile || !["admin", "teacher"].includes(profile.role) || !profile.academy_id) {
    return { ok: false, message: "권한이 없어요." };
  }
  if (!(await isStudyPlanEnabled(profile.academy_id))) {
    return { ok: false, message: "권한이 없어요." };
  }

  const admin = createAdminClient();
  const { data: members } = await admin
    .from("class_students")
    .select("class_id")
    .eq("student_id", studentId);
  const classIds = [...new Set((members ?? []).map((m) => String(m.class_id)))];

  const [listenMine, listenClass, vocabMine, vocabClass] = await Promise.all([
    admin.from("listening_assignments").select("set:listening_sets(title)").eq("student_id", studentId),
    classIds.length
      ? admin.from("listening_assignments").select("set:listening_sets(title)").in("class_id", classIds)
      : Promise.resolve({ data: [] as { set: { title: string } | null }[] }),
    admin.from("vocab_assignments").select("set:vocab_sets(title)").eq("student_id", studentId),
    classIds.length
      ? admin.from("vocab_assignments").select("set:vocab_sets(title)").in("class_id", classIds)
      : Promise.resolve({ data: [] as { set: { title: string } | null }[] }),
  ]);

  const titles = (...groups: Array<{ data: unknown }>) => {
    const out: string[] = [];
    for (const g of groups) {
      for (const r of (g.data ?? []) as Array<{ set: unknown }>) {
        const t = one(r.set as { title: string } | { title: string }[] | null)?.title;
        if (t && !out.includes(t)) out.push(t);
      }
    }
    return out;
  };

  return {
    ok: true,
    listening: titles(listenClass, listenMine),
    vocab: titles(vocabClass, vocabMine),
  };
}

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


/** 일정표 한 영역 줄을 통째로 채울 내용 */
export interface PlanFillRow {
  /** 영역 이름 — "듣기" / "영단어" */
  area: string;
  /** 교재명 칸에 넣을 글 */
  textbook: string;
  /** 회차마다 진도 칸에 넣을 글 */
  cells: AutoFillCell[];
}

/** [1,2,3,5,6] → "1~3, 5~6" */
function numberRanges(nums: number[]): string {
  const sorted = [...new Set(nums)].sort((a, b) => a - b);
  const parts: string[] = [];
  let start = sorted[0];
  let prev = sorted[0];
  for (const n of sorted.slice(1)) {
    if (n === prev + 1) {
      prev = n;
      continue;
    }
    parts.push(start === prev ? `${start}` : `${start}~${prev}`);
    start = n;
    prev = n;
  }
  if (start !== undefined) parts.push(start === prev ? `${start}` : `${start}~${prev}`);
  return parts.join(", ");
}

/** 제목에서 Day 번호를 뽑는다 — "EngCore 중학필수 Day7 …" → 7 */
function dayNumberOf(title: string): number | null {
  const m = /day\s*0*(\d+)/i.exec(title);
  return m ? Number(m[1]) : null;
}

/**
 * 배정된 듣기·단어를 일정표 회차에 차례대로 깔아 준다.
 *
 * 듣기는 배정할 때 이미 날짜별로 몇 번 문항을 풀지가 정해져 있으므로,
 * 회차 날짜부터 다음 회차 날짜 사이에 풀 것을 "중3 20회 1~5번" 꼴로 모은다.
 * 단어는 Day 번호 순서대로, 한 회차에 며칠 치씩 "Day 1, 2" 꼴로 나눠 넣는다.
 */
export async function loadAssignedPlan(input: {
  studentId: string;
  /** 주차별 회차 날짜: { "1": ["2026-09-01", …] } */
  sessionDates: Record<string, string[]>;
  /** 단어 한 회차에 며칠 치를 볼지 */
  vocabDaysPerSession: number;
}): Promise<{ ok: true; rows: PlanFillRow[] } | { ok: false; message: string }> {
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
  slots.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.index - b.index));

  const admin = createAdminClient();
  const { data: student } = await admin
    .from("profiles")
    .select("id, academy_id")
    .eq("id", input.studentId)
    .maybeSingle();
  if (!student || student.academy_id !== profile.academy_id) {
    return { ok: false, message: "우리 학원 학생이 아니에요." };
  }

  const rows: PlanFillRow[] = [];
  const listening = await listeningPlanRow(admin, input.studentId, slots);
  if (listening) rows.push(listening);
  const vocab = await vocabPlanRow(admin, input.studentId, slots, input.vocabDaysPerSession);
  if (vocab) rows.push(vocab);

  if (rows.length === 0) {
    return { ok: false, message: "이 학생에게 배정된 듣기·단어가 아직 없어요." };
  }
  return { ok: true, rows };
}

/** 배정된 듣기를 회차마다 "중3 20회 1~5번"으로 */
async function listeningPlanRow(
  admin: ReturnType<typeof createAdminClient>,
  studentId: string,
  slots: { week: number; index: number; date: string }[],
): Promise<PlanFillRow | null> {
  const first = slots[0]!.date;
  const lastDate = new Date(`${slots[slots.length - 1]!.date}T00:00:00Z`);
  lastDate.setUTCDate(lastDate.getUTCDate() + 20);
  const last = lastDate.toISOString().slice(0, 10);

  const { data: tasks } = await admin
    .from("listening_daily_tasks")
    .select("task_date, set_id, question_ids, set:listening_sets(title)")
    .eq("student_id", studentId)
    .gte("task_date", first)
    .lte("task_date", last)
    .order("task_date");
  if (!tasks || tasks.length === 0) return null;

  // 문항 id → 문항 번호
  const setIds = [...new Set(tasks.map((t) => String(t.set_id)))];
  const { data: questions } = await admin
    .from("listening_questions")
    .select("id, order_index")
    .in("set_id", setIds);
  const orderOf = new Map((questions ?? []).map((q) => [String(q.id), Number(q.order_index)]));

  /** 회차 → 세트 이름 → 문항 번호들 */
  const perSlot = new Map<string, Map<string, number[]>>();
  const books: string[] = [];
  for (const t of tasks) {
    const date = String(t.task_date);
    // 이 날짜가 속하는 회차 = 날짜가 이 날 이하인 마지막 회차
    let slot = -1;
    for (let i = 0; i < slots.length; i += 1) {
      if (slots[i]!.date <= date) slot = i;
    }
    if (slot < 0) continue; // 첫 회차보다 이른 날은 건너뛴다

    const title = one(t.set as { title: string } | { title: string }[] | null)?.title ?? "듣기";
    if (!books.includes(title)) books.push(title);
    const key = `${slots[slot]!.week}-${slots[slot]!.index}`;
    const per = perSlot.get(key) ?? new Map<string, number[]>();
    const nums = per.get(title) ?? [];
    for (const qid of (t.question_ids ?? []) as string[]) {
      const n = orderOf.get(String(qid));
      if (n) nums.push(n);
    }
    per.set(title, nums);
    perSlot.set(key, per);
  }

  return {
    area: "듣기",
    textbook: books.join(", "),
    cells: slots.map((s) => {
      const per = perSlot.get(`${s.week}-${s.index}`);
      const text = per
        ? [...per]
            .filter(([, nums]) => nums.length > 0)
            .map(([title, nums]) => `${title} ${numberRanges(nums)}번`)
            .join(" / ")
        : "";
      return { week: s.week, index: s.index, text };
    }),
  };
}

/** 배정된 단어장을 Day 순서대로 회차마다 "Day 1, 2"로 */
async function vocabPlanRow(
  admin: ReturnType<typeof createAdminClient>,
  studentId: string,
  slots: { week: number; index: number; date: string }[],
  daysPerSession: number,
): Promise<PlanFillRow | null> {
  const { data: members } = await admin
    .from("class_students")
    .select("class_id")
    .eq("student_id", studentId);
  const classIds = [...new Set((members ?? []).map((m) => String(m.class_id)))];

  const [mine, ofClass] = await Promise.all([
    admin.from("vocab_assignments").select("set:vocab_sets(title)").eq("student_id", studentId),
    classIds.length
      ? admin.from("vocab_assignments").select("set:vocab_sets(title)").in("class_id", classIds)
      : Promise.resolve({ data: [] as Array<{ set: unknown }> }),
  ]);

  const titles: string[] = [];
  for (const g of [ofClass, mine]) {
    for (const r of (g.data ?? []) as Array<{ set: unknown }>) {
      const t = one(r.set as { title: string } | { title: string }[] | null)?.title;
      if (t && !titles.includes(t)) titles.push(t);
    }
  }
  if (titles.length === 0) return null;

  const per = Math.max(1, Math.floor(daysPerSession || 1));
  const withDay = titles
    .map((title) => ({ title, day: dayNumberOf(title) }))
    .filter((x): x is { title: string; day: number } => x.day !== null)
    .sort((a, b) => a.day - b.day);

  // Day 번호가 없는 단어장은 회차마다 하나씩 그대로 넣는다
  if (withDay.length === 0) {
    return {
      area: "영단어",
      textbook: titles.join(", "),
      cells: slots.map((s, i) => ({ week: s.week, index: s.index, text: titles[i] ?? "" })),
    };
  }

  // 교재명은 Day 번호를 뺀 이름
  const books: string[] = [];
  for (const { title } of withDay) {
    const name = title.replace(/day\s*0*\d+\s*/i, "").replace(/\s{2,}/g, " ").trim();
    if (name && !books.includes(name)) books.push(name);
  }

  const days = withDay.map((x) => x.day);
  return {
    area: "영단어",
    textbook: books.join(", "),
    cells: slots.map((s, i) => {
      const chunk = days.slice(i * per, i * per + per);
      return { week: s.week, index: s.index, text: chunk.length ? `Day ${chunk.join(", ")}` : "" };
    }),
  };
}

"use server";

import { getCurrentProfile } from "@/lib/auth/get-profile";
import { getTodayIsoKorea } from "@/lib/date/korea-today";
import { createAdminClient } from "@/lib/supabase/admin";
import { isStudyPlanEnabled } from "@/lib/study-plan/access";
import { ensureStudentScheduleDailyTasks } from "@/lib/listening/schedule/today-summary";
import { WEEKDAY_LABELS } from "@/lib/study-plan/weekday-dates";

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
 * 교재명 칸에 넣을 단어장 이름 하나를 고른다.
 *
 * 제목은 "EngCore 중학필수 Day57 주요 필수 단어 ★"처럼 길다. 교재명 칸에는
 * 책 이름만 있으면 되므로 Day 앞까지 자르고, 배정된 것이 여러 개면
 * 낱말 단위로 겹치는 앞머리만 남긴다 → "EngCore 중학필수".
 */
function bookNameOf(titles: string[]): string {
  const names = titles
    .map((t) => {
      const cut = /^(.*?)\s*day\s*0*\d+/i.exec(t);
      return (cut ? cut[1]! : t).trim();
    })
    .filter(Boolean);
  if (names.length === 0) return "";
  if (names.length === 1) return names[0]!;

  const words = names.map((n) => n.split(/\s+/));
  const head: string[] = [];
  for (let i = 0; i < words[0]!.length; i += 1) {
    const w = words[0]![i];
    if (words.every((ws) => ws[i] === w)) head.push(w!);
    else break;
  }
  // 겹치는 앞머리가 없으면 첫 이름을 그대로 쓴다
  return head.length ? head.join(" ") : names[0]!;
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
  /** 이 일정표가 다루는 달 — 이 달을 벗어난 과제는 끌어오지 않는다 */
  year: number;
  month: number;
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

  /*
   * 듣기 일일 과제는 학생이 듣기 화면을 열 때 앞으로 30일 치씩 만들어진다. 오늘 배정하고 학생이 아직
   * 열지 않았으면 과제가 하나도 없어 「배정된 것이 없다」고 나왔다(2026-10-05 장하은: 오늘 배정, 과제 0).
   * 일정표가 다루는 달 끝까지 과제를 먼저 만들어 둔다 — 학생 화면이 만들 것과 같은 과제다.
   */
  const lastDay = monthEnd(input.year, input.month);
  const today = getTodayIsoKorea();
  if (lastDay >= today) {
    const days = Math.round((Date.parse(lastDay) - Date.parse(today)) / 86400000);
    try {
      await ensureStudentScheduleDailyTasks(admin, input.studentId, today, { futureDays: Math.max(30, days + 1) });
    } catch {
      /* 못 만들면 있는 과제만으로 채운다 */
    }
  }

  const rows: PlanFillRow[] = [];
  const listening = await listeningPlanRow(admin, input.studentId, slots, lastDay);
  if (listening) rows.push(listening);
  const vocab = await vocabPlanRow(admin, input.studentId, slots, input.vocabDaysPerSession);
  if (vocab) rows.push(vocab);

  if (rows.length === 0) {
    return { ok: false, message: "이 학생에게 배정된 듣기·단어가 아직 없어요." };
  }
  return { ok: true, rows };
}

/** 그 달의 마지막 날 — "2026-09-30" */
function monthEnd(year: number, month: number): string {
  const d = new Date(Date.UTC(year, month, 0));
  return d.toISOString().slice(0, 10);
}

/**
 * 배정된 듣기를 회차마다 "중3 20회 1~5번"으로.
 *
 * 선생님 지적(2026-09-28): 학생에게 배정된 듣기 일정과 학습일정표가 안 맞는다.
 * 마지막 회차부터 20일 뒤까지를 끌어와 놓고, 그 사이 것을 전부 마지막 회차 한 칸에
 * 몰아넣고 있었다. 9월 일정표인데 10월 20일 치까지 한 칸에 들어갔다.
 * 이제 그 달 안에서만 끌어오고, 회차마다 다음 회차 전날까지만 담는다.
 */
export async function listeningPlanRow(
  admin: ReturnType<typeof createAdminClient>,
  studentId: string,
  slots: { week: number; index: number; date: string }[],
  monthLast: string,
): Promise<PlanFillRow | null> {
  const first = slots[0]!.date;
  const last = monthLast;
  if (last < first) return null;

  const { data: tasks } = await admin
    .from("listening_daily_tasks")
    .select("task_date, set_id, question_ids, assignment_id, set:listening_sets(title)")
    .eq("student_id", studentId)
    .gte("task_date", first)
    .lte("task_date", last)
    .order("task_date");
  if (!tasks || tasks.length === 0) return null;

  /*
   * 하루 몇 문항씩인지(배정의 questions_per_day)를 칸에 함께 적는다.
   * 선생님 말씀(2026-10-21): 듣기를 2개씩 풀기로 배정했는데 일정표에는 그렇게 안 보인다 — 회차 칸은
   * 다음 수업 전날까지 풀 분량을 묶어(수·목 → 1~5번) 하루 양이 안 보였다. 묶음은 두고 하루 양을 덧붙인다.
   */
  const assignmentIds = [...new Set(tasks.map((t) => String(t.assignment_id ?? "")).filter(Boolean))];
  const { data: assignments } = assignmentIds.length
    ? await admin.from("listening_schedule_assignments").select("id, questions_per_day").in("id", assignmentIds)
    : { data: [] as { id: string; questions_per_day: number }[] };
  const perDayOf = new Map((assignments ?? []).map((a) => [String(a.id), Number(a.questions_per_day)]));
  /** 세트 이름 → 하루 문항 수 */
  const perDayByTitle = new Map<string, number>();

  // 문항 id → 문항 번호
  const setIds = [...new Set(tasks.map((t) => String(t.set_id)))];
  const { data: questions } = await admin
    .from("listening_questions")
    .select("id, order_index")
    .in("set_id", setIds);
  const orderOf = new Map((questions ?? []).map((q) => [String(q.id), Number(q.order_index)]));

  /** 회차 → 세트 이름 → 문항 번호들 */
  const perSlot = new Map<string, Map<string, number[]>>();
  const titles: string[] = [];
  for (const t of tasks) {
    const date = String(t.task_date);
    /*
     * 이 날짜가 속하는 회차 = 이 날 이하인 마지막 회차.
     * 회차 칸에는 「그 수업 날부터 다음 수업 전날까지」 할 것만 담는다. 마지막 회차는
     * 그 달 말일까지만 담는다(위에서 이미 달 안으로 잘라 읽었다).
     */
    let slot = -1;
    for (let i = 0; i < slots.length; i += 1) {
      if (slots[i]!.date <= date) slot = i;
    }
    if (slot < 0) continue; // 첫 회차보다 이른 날은 건너뛴다

    const title = one(t.set as { title: string } | { title: string }[] | null)?.title ?? "듣기";
    if (!titles.includes(title)) titles.push(title);
    const perDay = perDayOf.get(String(t.assignment_id ?? ""));
    if (perDay && !perDayByTitle.has(title)) perDayByTitle.set(title, perDay);
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

  // 교재명은 세트가 든 폴더 이름 하나 — "중3 듣기"
  const { data: folder } = await admin
    .from("listening_sets")
    .select("folder:listening_set_folders(name)")
    .in("id", [...new Set(tasks.map((t) => String(t.set_id)))])
    .limit(1)
    .maybeSingle();
  const folderName = one(folder?.folder as { name: string } | { name: string }[] | null)?.name ?? "";

  return {
    area: "듣기",
    textbook: folderName || bookNameOf(titles),
    cells: slots.map((s) => {
      const per = perSlot.get(`${s.week}-${s.index}`);
      const text = per
        ? [...per]
            .filter(([, nums]) => nums.length > 0)
            .map(([title, nums]) => {
              const perDay = perDayByTitle.get(title);
              return `${title} ${numberRanges(nums)}번${perDay ? ` (하루 ${perDay}문항)` : ""}`;
            })
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
      textbook: bookNameOf(titles),
      cells: slots.map((s, i) => ({ week: s.week, index: s.index, text: titles[i] ?? "" })),
    };
  }

  const days = withDay.map((x) => x.day);
  return {
    area: "영단어",
    textbook: bookNameOf(withDay.map((x) => x.title)),
    cells: slots.map((s, i) => {
      const chunk = days.slice(i * per, i * per + per);
      return { week: s.week, index: s.index, text: chunk.length ? `Day ${chunk.join(", ")}` : "" };
    }),
  };
}


/** 일정표 한 회차에 그 영역을 실제로 했는지 */
export type PlanDoneState = "done" | "partial" | "missing" | "upcoming" | "none";

/** 실제 기록이 이어지는 영역 — 듣기·단어에 강좌(영상)까지 */
export type PlanDoneArea = AutoFillArea | "course";

export interface PlanDoneCell {
  week: number;
  index: number;
  area: PlanDoneArea;
  state: PlanDoneState;
  /** 칸에 붙일 짧은 글 — "3/3일", "2단계" */
  label: string;
  /**
   * 「실제」 줄에 적을 한 줄 — "Day15 합격 95 · Day16 합격 100", "10/19 4회 0/5 · 10/20 5회 5/5 ✓".
   * 선생님 요청(2026-10-23): 일정표에서 계획과 실제가 한눈에 비교되게.
   */
  text: string;
  /** 마우스를 올리면 보여 줄 날짜별 상세 */
  details: string[];
  /** 단어: 이 회차 안에 종합테스트에 합격한 Day 번호 — 계획 칸의 "Day 15, 16"과 맞춰 본다 */
  passedDays?: number[];
  /** 단어: 이 회차 안에 손댄 Day 번호(합격 못 한 것 포함) */
  touchedDays?: number[];
}

/** "2026-10-19" → "10/19" */
function md(iso: string): string {
  return `${Number(iso.slice(5, 7))}/${Number(iso.slice(8, 10))}`;
}

/** "2026-10-19" → "월" */
function wd(iso: string): string {
  return WEEKDAY_LABELS[(new Date(`${iso}T00:00:00Z`).getUTCDay() + 6) % 7] ?? "";
}

/** UTC 시각 → 한국 날짜 */
function koreaDateOf(ts: string): string {
  return new Date(new Date(ts).getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

/** "EngCore 중학필수 Day12 핵심 빈출 단어" → "Day12" (Day 없으면 제목 그대로) */
function shortSetTitle(title: string): string {
  const d = dayNumberOf(title);
  return d !== null ? `Day${d}` : title;
}

/**
 * 일정표 회차마다 듣기·단어·강좌를 실제로 했는지 돌려준다.
 *
 * 선생님 요청(2026-09-30): 일정표에서도 단어·듣기와 이어서 학습을 했는지 안 했는지
 * 표시가 나오게 해 달라. 진도 칸에 적힌 것은 「할 것」이지 「한 것」이 아니어서,
 * 옆에 실제 기록을 따로 붙인다.
 *
 * 선생님 요청(2026-10-23): 알약 하나로는 비교가 안 된다 — 회차마다 실제로 한 것을 글로 적고
 * (text), 마우스를 올리면 날짜별 상세(details)가 보이게. 강좌(영상)도 같이.
 *
 * 한 회차는 「그 수업 날부터 다음 수업 전날까지」를 본다 — 진도를 깔 때와 같은 규칙이다.
 * 아직 오지 않은 날은 안 한 것으로 세지 않는다.
 */
export async function loadPlanDoneStatus(input: {
  studentId: string;
  year: number;
  month: number;
  /** 주차별 회차 날짜: { "1": ["2026-09-01", …] } */
  sessionDates: Record<string, string[]>;
}): Promise<
  | { ok: true; cells: PlanDoneCell[]; /** 이 학생이 듣는 강좌 이름 — 교재명과 맞춰 강좌 영역을 찾는다 */ courseTitles: string[] }
  | { ok: false; message: string }
> {
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
  if (slots.length === 0) return { ok: false, message: "회차 날짜를 먼저 넣어 주세요." };
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

  const first = slots[0]!.date;
  const last = monthEnd(input.year, input.month);
  const today = getTodayIsoKorea();
  const firstUtc = new Date(`${first}T00:00:00+09:00`).toISOString();
  /** 날짜 → 그 날이 속한 회차 자리 (그 날 이하인 마지막 회차) */
  const slotOf = (date: string): number => {
    let at = -1;
    for (let i = 0; i < slots.length; i += 1) {
      if (slots[i]!.date <= date) at = i;
    }
    return at;
  };

  // 배정된 단어장이 없으면 단어 칸은 「안 함」이 아니라 비워 둔다(선생님 말씀 2026-10-05)
  const { data: members } = await admin.from("class_students").select("class_id").eq("student_id", input.studentId);
  const classIds = [...new Set((members ?? []).map((m) => String(m.class_id)))];
  const [vocabMine, vocabClass, enrollRes] = await Promise.all([
    admin.from("vocab_assignments").select("id", { count: "exact", head: true }).eq("student_id", input.studentId),
    classIds.length
      ? admin.from("vocab_assignments").select("id", { count: "exact", head: true }).in("class_id", classIds)
      : Promise.resolve({ count: 0 }),
    admin
      .from("enrollments")
      .select("course_id, course:courses(id, title, deleted_at)")
      .eq("student_id", input.studentId),
  ]);
  const hasVocab = (vocabMine.count ?? 0) + (vocabClass.count ?? 0) > 0;
  const courses = (enrollRes.data ?? [])
    .map((e) => one(e.course as unknown as { id: string; title: string | null; deleted_at: string | null } | null))
    .filter((c): c is { id: string; title: string | null; deleted_at: string | null } => Boolean(c && !c.deleted_at));
  const courseIds = courses.map((c) => c.id);
  const courseTitleOf = new Map(courses.map((c) => [c.id, c.title ?? "강좌"]));

  const [listeningRows, vocabRows, lessonRows] = await Promise.all([
    admin
      .from("listening_daily_tasks")
      .select("task_date, status, completed_count, total_count, set:listening_sets(title)")
      .eq("student_id", input.studentId)
      .gte("task_date", first)
      .lte("task_date", last)
      .order("task_date"),
    admin
      .from("vocab_stage_progress")
      .select(
        "stage1_completed_at, stage2_completed_at, stage3_completed_at, stage4_passed_at, stage4_passed, stage4_best_score, stage4_last_score, stage4_attempt_count, updated_at, set:vocab_sets(title, exam_compact)",
      )
      .eq("student_id", input.studentId)
      .gte("updated_at", firstUtc),
    courseIds.length
      ? admin
          .from("lesson_progress")
          .select("is_completed, completed_at, last_watched_at, progress_percent, lesson:lessons(title, course_id, order_index)")
          .eq("student_id", input.studentId)
          .gte("last_watched_at", firstUtc)
          .limit(2000)
      : Promise.resolve({ data: [] as unknown[] }),
  ]);

  /** 회차 자리 → 그 사이에 나간 듣기 과제 (아직 안 온 날은 뺀다) */
  type ListenDay = { date: string; title: string; done: number; total: number; completed: boolean };
  const listenBySlot = new Map<number, ListenDay[]>();
  for (const r of listeningRows.data ?? []) {
    const date = String(r.task_date);
    const at = slotOf(date);
    if (at < 0 || date > today) continue;
    const list = listenBySlot.get(at) ?? [];
    list.push({
      date,
      title: one(r.set as { title: string } | { title: string }[] | null)?.title ?? "듣기",
      done: Number(r.completed_count ?? 0),
      total: Number(r.total_count ?? 0),
      completed: r.status === "completed",
    });
    listenBySlot.set(at, list);
  }

  /** 회차 자리 → 단어장별로 그 사이에 한 것 */
  type VocabSet = { title: string; short: string; day: number | null; stages: number; passedAt: string | null; score: number; failed: boolean; lastAt: string };
  const vocabBySlot = new Map<number, Map<string, VocabSet>>();
  for (const r of vocabRows.data ?? []) {
    const title = one(r.set as { title: string } | { title: string }[] | null)?.title ?? "단어장";
    const row = r as unknown as Record<string, string | number | boolean | null>;
    const stamps = [
      row.stage1_completed_at,
      row.stage2_completed_at,
      row.stage3_completed_at,
      row.stage4_passed_at,
    ] as (string | null)[];
    /** 단계마다 회차 자리를 찾아 그 회차에 단계를 더한다 */
    const touchedSlots = new Set<number>();
    stamps.forEach((at, stageIdx) => {
      if (!at) return;
      const iso = koreaDateOf(at);
      if (iso < first || iso > last || iso > today) return;
      const slot = slotOf(iso);
      if (slot < 0) return;
      touchedSlots.add(slot);
      const per = vocabBySlot.get(slot) ?? new Map<string, VocabSet>();
      const got = per.get(title) ?? { title, short: shortSetTitle(title), day: dayNumberOf(title), stages: 0, passedAt: null, score: 0, failed: false, lastAt: "" };
      got.stages += 1;
      if (stageIdx === 3) {
        got.passedAt = iso;
        got.score = Number(row.stage4_best_score ?? 0);
      }
      if (iso > got.lastAt) got.lastAt = iso;
      per.set(title, got);
      vocabBySlot.set(slot, per);
    });
    // 종합테스트를 봤는데 아직 못 붙었으면 마지막 손댄 회차에 「불합격」으로 적는다
    const passed = Boolean(row.stage4_passed);
    const attempts = Number(row.stage4_attempt_count ?? 0);
    if (!passed && attempts > 0 && row.updated_at) {
      const iso = koreaDateOf(String(row.updated_at));
      if (iso >= first && iso <= last && iso <= today) {
        const slot = slotOf(iso);
        if (slot >= 0) {
          const per = vocabBySlot.get(slot) ?? new Map<string, VocabSet>();
          const got = per.get(title) ?? { title, short: shortSetTitle(title), day: dayNumberOf(title), stages: 0, passedAt: null, score: 0, failed: false, lastAt: iso };
          got.failed = true;
          got.score = Number(row.stage4_last_score ?? row.stage4_best_score ?? 0);
          if (iso > got.lastAt) got.lastAt = iso;
          per.set(title, got);
          vocabBySlot.set(slot, per);
        }
      }
    }
  }

  /** 회차 자리 → 그 사이에 본 영상 */
  type LessonHit = { date: string; title: string; course: string; completed: boolean; percent: number };
  const lessonBySlot = new Map<number, LessonHit[]>();
  for (const raw of (lessonRows.data ?? []) as unknown[]) {
    const r = raw as { is_completed: boolean; completed_at: string | null; last_watched_at: string | null; progress_percent: number | null; lesson: unknown };
    const lesson = one(r.lesson as { title: string; course_id: string; order_index: number } | { title: string; course_id: string; order_index: number }[] | null);
    if (!lesson || !courseIds.includes(String(lesson.course_id))) continue;
    const at = r.is_completed && r.completed_at ? r.completed_at : r.last_watched_at;
    if (!at) continue;
    const iso = koreaDateOf(at);
    if (iso < first || iso > last || iso > today) continue;
    const slot = slotOf(iso);
    if (slot < 0) continue;
    const list = lessonBySlot.get(slot) ?? [];
    list.push({
      date: iso,
      title: lesson.title,
      course: courseTitleOf.get(String(lesson.course_id)) ?? "강좌",
      completed: Boolean(r.is_completed),
      percent: Math.round(Number(r.progress_percent ?? 0)),
    });
    lessonBySlot.set(slot, list);
  }

  const cells: PlanDoneCell[] = [];
  slots.forEach((s, at) => {
    const upcoming = s.date > today;

    // 듣기
    const listen = listenBySlot.get(at) ?? [];
    const lDue = listen.length;
    const lDone = listen.filter((d) => d.completed).length;
    const lPart = listen.filter((d) => !d.completed && d.done > 0).length;
    cells.push({
      week: s.week,
      index: s.index,
      area: "listening",
      state: upcoming
        ? "upcoming"
        : lDue === 0
          ? "none"
          : lDone === lDue
            ? "done"
            : lDone + lPart > 0
              ? "partial"
              : "missing",
      label: lDue ? `${lDone}/${lDue}일` : "",
      text: upcoming
        ? "아직"
        : lDue === 0
          ? "배정된 과제 없음"
          : listen
              .map((d) => `${md(d.date)} ${d.title} ${d.done}/${d.total}${d.completed ? " ✓" : d.done === 0 ? " 안 함" : ""}`)
              .join(" · "),
      details: listen.map(
        (d) =>
          `${md(d.date)} (${wd(d.date)}) ${d.title} · ${d.total}문항 중 ${d.done}문항${d.completed ? " · 완료" : d.done === 0 ? " · 안 함" : " · 하다 맒"}`,
      ),
    });

    // 단어
    const per = vocabBySlot.get(at);
    const sets = per ? [...per.values()].sort((a, b) => (a.day ?? 0) - (b.day ?? 0) || a.title.localeCompare(b.title, "ko")) : [];
    const stages = sets.reduce((n, v) => n + v.stages, 0);
    const anyFailed = sets.some((v) => v.failed);
    const setText = (v: VocabSet) =>
      v.passedAt
        ? `${v.short} 합격 ${v.score}`
        : v.failed
          ? `${v.short} 불합격 ${v.score}`
          : `${v.short} ${v.stages}단계까지`;
    cells.push({
      week: s.week,
      index: s.index,
      area: "vocab",
      state:
        !hasVocab && sets.length === 0
          ? "none"
          : upcoming
            ? "upcoming"
            : sets.length === 0
              ? "missing"
              : anyFailed || sets.some((v) => !v.passedAt)
                ? "partial"
                : "done",
      label: stages > 0 ? `${stages}단계` : "",
      text: upcoming ? "아직" : !hasVocab && sets.length === 0 ? "배정된 단어장 없음" : sets.length === 0 ? "안 함" : sets.map(setText).join(" · "),
      details: sets.map(
        (v) =>
          `${v.title}: ${v.passedAt ? `종합테스트 합격 ${v.score}점 (${md(v.passedAt)})` : v.failed ? `종합테스트 ${v.score}점 불합격 (${md(v.lastAt)})` : `${v.stages}단계 끝냄 (${md(v.lastAt)})`}`,
      ),
      passedDays: sets.filter((v) => v.passedAt && v.day !== null).map((v) => v.day as number),
      touchedDays: sets.filter((v) => v.day !== null).map((v) => v.day as number),
    });

    // 강좌
    const hits = (lessonBySlot.get(at) ?? []).sort((a, b) => a.date.localeCompare(b.date));
    const cDone = hits.filter((h) => h.completed).length;
    cells.push({
      week: s.week,
      index: s.index,
      area: "course",
      state:
        courseIds.length === 0
          ? "none"
          : upcoming
            ? "upcoming"
            : cDone > 0
              ? "done"
              : hits.length > 0
                ? "partial"
                : "missing",
      label: hits.length ? `${cDone}강` : "",
      text:
        courseIds.length === 0
          ? "듣는 강좌 없음"
          : upcoming
            ? "아직"
            : hits.length === 0
              ? "본 영상 없음"
              : hits.map((h) => `${h.title}${h.completed ? " 완료" : ` ${h.percent}%`}`).join(" · "),
      details: hits.map((h) => `${md(h.date)} ${h.course} · ${h.title} · ${h.completed ? "완료" : `${h.percent}% 시청`}`),
    });
  });

  return { ok: true, cells, courseTitles: courses.map((c) => c.title ?? "").filter(Boolean) };
}

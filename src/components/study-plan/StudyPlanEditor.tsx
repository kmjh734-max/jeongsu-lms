"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { classScheduleAction, createPlanAction, savePlanAction } from "@/app/admin/study-plans/actions";
import {
  loadAssignedPlan,
  loadPlanDoneStatus,
  type AutoFillArea,
  type PlanDoneArea,
  type PlanDoneCell,
  type PlanDoneState,
} from "@/lib/study-plan/auto-fill";
import {
  ATTENDANCE_LABELS,
  emptyEntry,
  HOMEWORK_CHECK_LABELS,
  type Attendance,
  type HomeworkCheck,
  type PlanEntry,
  type StudyPlan,
} from "@/lib/study-plan";
import { WEEKDAY_LABELS, weeksInMonth } from "@/lib/study-plan/weekday-dates";
import { hasHolidayTable, holidayNameOf } from "@/lib/study-plan/holidays";
import { UnitPickerModal } from "@/components/textbooks/UnitPickerModal";
import { TodayStatusPanel, type SessionHomework } from "@/components/study-plan/TodayStatusPanel";
import { getTodayIsoKorea } from "@/lib/date/korea-today";
import type { Textbook } from "@/lib/textbooks";

export type PlanStudent = {
  id: string;
  name: string;
  school: string | null;
  schoolGrade: string | null;
  phone: string | null;
  parentPhone: string | null;
  enrolledOn: string | null;
  className: string | null;
  classTime: string | null;
};

type Row = { week: number; area: string; textbook: string; orderIndex: number; entries: PlanEntry[] };

/** "2026-09-21" → "월" */
function weekdayOf(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const d = new Date(`${iso}T00:00:00Z`);
  return WEEKDAY_LABELS[(d.getUTCDay() + 6) % 7] ?? "";
}

/** 상태별 색 — 「실제」 줄, 칸 바탕, 회차 머리 요약이 같은 색을 쓴다 */
const STATE_LINE: Record<PlanDoneState, string> = {
  done: "border-emerald-300 text-emerald-800",
  partial: "border-amber-300 text-amber-800",
  missing: "border-rose-300 text-rose-800",
  upcoming: "border-slate-200 text-slate-400",
  none: "border-slate-200 text-slate-400",
};
const STATE_CELL: Record<PlanDoneState, string> = {
  done: "bg-emerald-50/70",
  partial: "bg-amber-50/80",
  missing: "bg-rose-50/70",
  upcoming: "",
  none: "",
};
const STATE_PILL: Record<PlanDoneState, string> = {
  done: "border-emerald-300 bg-emerald-50 text-emerald-700",
  partial: "border-amber-300 bg-amber-50 text-amber-700",
  missing: "border-rose-300 bg-rose-50 text-rose-700",
  upcoming: "border-slate-200 bg-white text-slate-400",
  none: "border-slate-200 bg-white text-slate-300",
};
const STATE_MARK: Record<PlanDoneState, string> = { done: "✓", partial: "△", missing: "✗", upcoming: "", none: "" };
const AREA_SHORT: Record<PlanDoneArea, string> = { listening: "듣기", vocab: "단어", course: "강좌" };

/**
 * 「실제」 줄 — 진도(계획) 아래에 실제로 한 것을 적고, 마우스를 올리면 날짜별 상세가 뜬다.
 * 선생님 요청(2026-10-23): 일정표와 실제 학습을 한눈에 비교하고, 올리면 구체적인 내역이 보이게.
 */
function ActualLine({ cell, state }: { cell: PlanDoneCell; state: PlanDoneState }) {
  const faint = state === "upcoming" || state === "none";
  return (
    <div tabIndex={0} className="group relative outline-none">
      <div
        className={`flex min-h-8 items-start gap-1.5 rounded-md border bg-white/70 px-2 py-1 text-xs ${faint ? "font-normal" : "font-medium"} ${STATE_LINE[state]}`}
      >
        <span className="shrink-0 text-[10px] font-bold opacity-70">실제</span>
        <span className="min-w-0 flex-1 break-words">{cell.text || "-"}</span>
        {STATE_MARK[state] ? <span className="shrink-0 font-bold">{STATE_MARK[state]}</span> : null}
      </div>
      {cell.details.length > 0 ? (
        <div
          role="tooltip"
          className="pointer-events-none absolute left-0 top-full z-20 hidden w-72 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700 shadow-lg group-hover:block group-focus-within:block"
        >
          <p className="mb-1 font-bold text-slate-900">{AREA_SHORT[cell.area]} · 날짜별 기록</p>
          <ul className="space-y-0.5">
            {cell.details.map((line, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="text-slate-400">·</span>
                <span className="min-w-0 break-words">{line}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/** 진도 칸의 "Day 15, 16" · "Day 9,10" · "Day 1~3" 에서 Day 번호들을 뽑는다 */
function plannedDaysOf(text: string): number[] {
  const out: number[] = [];
  const re = /day\s*([\d][\d\s,~\-]*)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    for (const part of m[1]!.split(",")) {
      const range = /(\d+)\s*[~\-]\s*(\d+)/.exec(part);
      if (range) {
        for (let d = Number(range[1]); d <= Number(range[2]) && d - Number(range[1]) < 50; d += 1) out.push(d);
      } else {
        const n = Number(part.trim());
        if (n) out.push(n);
      }
    }
  }
  return [...new Set(out)];
}

/**
 * 단어 칸은 계획에 적힌 Day 와 실제 합격한 Day 를 맞춰 본다.
 * "Day 11, 12" 인데 Day11 불합격·Day12 2단계면 「덜 함」, 둘 다 합격이면 「했음」.
 * 계획에 Day 가 없으면 서버가 준 상태(단계를 하나라도 끝냈으면 했음)를 그대로 쓴다.
 */
function refineState(cell: PlanDoneCell, progress: string): PlanDoneState {
  if (cell.area !== "vocab") return cell.state;
  if (cell.state === "upcoming" || cell.state === "none") return cell.state;
  const planned = plannedDaysOf(progress);
  if (planned.length === 0) return cell.state;
  const passed = new Set(cell.passedDays ?? []);
  const touched = new Set(cell.touchedDays ?? []);
  const hit = planned.filter((d) => passed.has(d)).length;
  if (hit === planned.length) return "done";
  if (hit > 0 || planned.some((d) => touched.has(d)) || (cell.touchedDays?.length ?? 0) > 0) return "partial";
  return "missing";
}

/** 영역 이름·교재명으로 강좌(영상) 기록과 이어지는 줄인지 — "강좌/영상/인강" 이거나 교재명이 듣는 강좌 이름과 같을 때 */
function isCourseRow(area: string, textbook: string, courseTitles: string[]): boolean {
  if (courseTitles.length === 0) return false;
  if (/강좌|영상|인강/.test(area)) return true;
  const norm = (t: string) => t.toLowerCase().replace(/\s+/g, "");
  const tb = norm(textbook);
  if (!tb) return false;
  return courseTitles.some((c) => {
    const n = norm(c);
    return n === tb || n.includes(tb) || tb.includes(n);
  });
}

/** 숙제 확인 네 단계 단추 */
function CheckButtons({
  value,
  onPick,
}: {
  value: HomeworkCheck;
  onPick: (next: HomeworkCheck) => void;
}) {
  const tone: Record<Exclude<HomeworkCheck, "">, string> = {
    none: "border-rose-500 bg-rose-50 text-rose-700",
    weak: "border-amber-500 bg-amber-50 text-amber-700",
    done: "border-emerald-500 bg-emerald-50 text-emerald-700",
  };
  return (
    <div className="flex gap-0.5">
      {(Object.keys(HOMEWORK_CHECK_LABELS) as Array<Exclude<HomeworkCheck, "">>).map((key) => {
        const on = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onPick(on ? "" : key)}
            className={`h-6 flex-1 rounded border text-[11px] font-semibold transition ${
              on ? tone[key] : "border-slate-200 bg-white text-slate-400 hover:bg-slate-50"
            }`}
          >
            {HOMEWORK_CHECK_LABELS[key]}
          </button>
        );
      })}
    </div>
  );
}

/** 영역 이름을 보고 듣기·단어 중 무엇과 이어지는지 고른다 */
function autoFillArea(area: string): AutoFillArea | null {
  const t = area.replace(/\s/g, "");
  if (t.includes("듣기")) return "listening";
  if (t.includes("단어") || t.includes("어휘")) return "vocab";
  return null;
}

/**
 * 듣기·단어를 다 한 회차를 저절로 「완료」로 찍는다.
 *
 * 선생님 요청(2026-09-30): 듣기를 했으면 자동으로 완료가 되게 해 달라.
 * 이미 손으로 찍어 둔 칸은 건드리지 않는다 — 선생님이 미흡이라 본 것을
 * 기계가 완료로 덮으면 안 된다.
 */
function applyAutoDone(
  rows: Row[],
  done: Map<string, PlanDoneCell>,
): { rows: Row[]; count: number } {
  let count = 0;
  const next = rows.map((r) => {
    const kind = autoFillArea(r.area);
    if (!kind) return r;
    let touched = false;
    const entries = r.entries.map((e, i) => {
      if (e.check) return e;
      const cell = done.get(`${kind}-${r.week}-${i}`);
      if (!cell || refineState(cell, e.progress) !== "done") return e;
      touched = true;
      count += 1;
      return { ...e, check: "done" as HomeworkCheck };
    });
    return touched ? { ...r, entries } : r;
  });
  return { rows: count > 0 ? next : rows, count };
}

/** 밀려온 진도를 원래 있던 글 앞에 붙인다 */
function joinPushed(moved: string, existing: string): string {
  const a = moved.trim();
  const b = existing.trim();
  if (!a) return existing;
  if (!b) return a;
  if (b.includes(a)) return existing;
  return `${a} / ${b}`;
}

/** 학습일정표 편집 — 주차 × 영역 × 수업 회차 */
export function StudyPlanEditor({
  student,
  year,
  month,
  plan,
  books,
  academyName,
}: {
  student: PlanStudent;
  year: number;
  month: number;
  plan: StudyPlan | null;
  /** 올려 둔 교재 목차 — 진도 칸을 트리로 고른다 */
  books: Textbook[];
  /** 알림 문구에 넣을 학원 이름 */
  academyName?: string;
}) {
  const [sessions, setSessions] = useState(plan?.sessionsPerWeek ?? 3);
  const [rows, setRows] = useState<Row[]>(plan?.rows ?? []);
  const [dates, setDates] = useState<Record<string, string[]>>(plan?.sessionDates ?? {});
  const [attendance, setAttendance] = useState<Record<string, Attendance[]>>(plan?.attendance ?? {});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  /** 목차에서 고르기: 어느 칸에 넣을지 */
  const [picking, setPicking] = useState<{ week: number; area: string; index: number } | null>(null);
  /** 듣기·단어에서 끌어오는 중인 영역 이름 */
  const [filling, setFilling] = useState<string | null>(null);
  /** 단어를 한 회차에 며칠 치씩 볼지 */
  const [vocabDays, setVocabDays] = useState(2);
  /** 실제로 했는지 — "listening-1-0" 꼴 열쇠 */
  const [done, setDone] = useState<Map<string, PlanDoneCell>>(new Map());
  /** 이 학생이 듣는 강좌 이름 — 교재명과 맞춰 강좌 줄을 찾는다 */
  const [courseTitles, setCourseTitles] = useState<string[]>([]);


  /** 이 달이 달력상 걸치는 주차 — 9월이면 1~5주 */
  const monthWeeks = useMemo(() => weeksInMonth(year, month), [year, month]);

  /**
   * 표에 실제로 그릴 주차.
   *
   * 학생이 달 중간에 들어오면 1·2주차는 쓸 일이 없으니 뺄 수 있게 한다.
   * 저장된 일정표가 있으면 거기 있는 주차를 따르되, 그 뒤로 달력에 더 있는 주차는
   * 붙여 준다(4주로 만들어 둔 표를 5주짜리 달에 열 때).
   */
  const [weeks, setWeeks] = useState<number[]>(() => {
    const stored = [...new Set((plan?.rows ?? []).map((r) => r.week))].sort((a, b) => a - b);
    if (stored.length === 0) return monthWeeks;
    const last = stored[stored.length - 1]!;
    return [...stored, ...monthWeeks.filter((w) => w > last)];
  });

  const areas = [...new Map(rows.filter((r) => r.week === weeks[0]).map((r) => [r.area, r.orderIndex])).keys()];
  /** 뺐다가 되돌릴 수 있는 주차 */
  const droppedWeeks = monthWeeks.filter((w) => !weeks.includes(w));

  /**
   * 오늘이 속한 회차의 숙제 — 「오늘 학습 현황」 오른쪽 칸에 보여 준다.
   * 이 달을 보고 있을 때만 뜬다. 회차는 「그 수업 날부터 다음 수업 전날까지」(진도를 깔 때와 같은 규칙).
   */
  const todayIso = getTodayIsoKorea();
  const viewingThisMonth = todayIso.startsWith(`${year}-${String(month).padStart(2, "0")}`);
  const todaySession = useMemo(() => {
    if (!viewingThisMonth) return null;
    let best: { week: number; index: number; date: string } | null = null;
    for (const week of weeks) {
      (dates[String(week)] ?? []).slice(0, sessions).forEach((date, index) => {
        if (!date || date > todayIso) return;
        if (!best || date > best.date || (date === best.date && index > best.index)) best = { week, index, date };
      });
    }
    return best as { week: number; index: number; date: string } | null;
  }, [viewingThisMonth, weeks, dates, sessions, todayIso]);
  const todayHomework: SessionHomework[] | null = useMemo(() => {
    if (!todaySession) return null;
    return rows
      .filter((r) => r.week === todaySession.week)
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((r) => ({
        area: r.area,
        homework: r.entries[todaySession.index]?.homework ?? "",
        check: r.entries[todaySession.index]?.check ?? "",
      }));
  }, [rows, todaySession]);
  const todaySessionLabel = todaySession
    ? `${Number(todaySession.date.slice(5, 7))}/${Number(todaySession.date.slice(8, 10))} (${weekdayOf(todaySession.date)}) 회차`
    : null;

  /** 표에 있는 주차인데 줄이 없으면 만들어 넣는다 */
  useEffect(() => {
    setRows((prev) => {
      if (prev.length === 0) return prev;
      const have = new Set(prev.map((r) => r.week));
      const missing = weeks.filter((w) => !have.has(w));
      if (missing.length === 0) return prev;
      const shape = [...new Map(prev.filter((r) => r.week === weeks[0]).map((r) => [r.area, r])).values()];
      return [
        ...prev,
        ...missing.flatMap((week) =>
          shape.map((r) => ({
            week,
            area: r.area,
            textbook: r.textbook,
            orderIndex: r.orderIndex,
            entries: Array.from({ length: sessions }, emptyEntry),
          })),
        ),
      ];
    });
  }, [weeks, sessions]);

  /**
   * 공휴일에 걸린 회차를 자동으로 '공휴일'로 둔다.
   *
   * 이미 선생님이 뭔가 찍어 둔 회차는 건드리지 않는다. 손으로 고친 것이
   * 화면을 다시 그릴 때마다 되돌아가면 안 되기 때문이다.
   */
  useEffect(() => {
    if (!hasHolidayTable(year)) return;
    setAttendance((prev) => {
      let touched = false;
      const next = { ...prev };
      for (const week of weeks) {
        const list = [...(next[String(week)] ?? [])];
        while (list.length < sessions) list.push("");
        (dates[String(week)] ?? []).forEach((d, i) => {
          if (!d || i >= sessions) return;
          if (list[i]) return; // 이미 적어 둔 회차는 그대로
          if (!holidayNameOf(d)) return;
          list[i] = "holiday";
          touched = true;
        });
        next[String(week)] = list;
      }
      return touched ? next : prev;
    });
  }, [dates, weeks, sessions, year]);

  /** 이 주차를 표에서 뺀다 — 달 중간에 들어온 학생의 앞 주차를 지울 때 */
  function removeWeek(week: number) {
    setWeeks((prev) => prev.filter((w) => w !== week));
    setRows((prev) => prev.filter((r) => r.week !== week));
    setDates((prev) => {
      const next = { ...prev };
      delete next[String(week)];
      return next;
    });
    setAttendance((prev) => {
      const next = { ...prev };
      delete next[String(week)];
      return next;
    });
  }

  /** 뺐던 주차를 되돌린다 */
  function restoreWeek(week: number) {
    setWeeks((prev) => [...prev, week].sort((a, b) => a - b));
    setDates((prev) => ({ ...prev, [String(week)]: [] }));
  }

  /** 날짜가 아직 하나도 없으면 반 요일로 알아서 채운다 */
  useEffect(() => {
    if (!plan) return;
    if (Object.values(dates).flat().filter(Boolean).length > 0) return;
    void (async () => {
      const r = await classScheduleAction({ studentId: student.id, year, month });
      if (!r.ok) return;
      changeSessions(r.sessionsPerWeek);
      setDates(r.sessionDates);
    })();
    // 처음 열 때 한 번
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan?.id]);

  /** 저절로 찍을 때 지금 줄을 본다 — 효과가 옛 줄을 들고 있지 않게 */
  const rowsRef = useRef(rows);
  useEffect(() => {
    rowsRef.current = rows;
  });

  /** 회차 날짜를 한 줄로 — 이것이 바뀔 때만 실제 기록을 다시 읽는다 */
  const dateKey = useMemo(
    () =>
      weeks
        .map((w) => `${w}:${(dates[String(w)] ?? []).slice(0, sessions).join(",")}`)
        .join("|"),
    [weeks, dates, sessions],
  );

  /**
   * 회차마다 듣기·단어를 실제로 했는지 읽어 온다.
   * 날짜 칸을 고치는 동안 매번 부르지 않도록 조금 기다렸다 부른다.
   */
  useEffect(() => {
    if (!plan) return;
    if (Object.values(dates).flat().filter(Boolean).length === 0) {
      setDone(new Map());
      return;
    }
    let alive = true;
    const timer = setTimeout(() => {
      void (async () => {
        const r = await loadPlanDoneStatus({
          studentId: student.id,
          year,
          month,
          sessionDates: dates,
        });
        if (!alive || !r.ok) return;
        const map = new Map(r.cells.map((c) => [`${c.area}-${c.week}-${c.index}`, c]));
        setDone(map);
        setCourseTitles(r.courseTitles);
        // 듣기·단어를 다 한 회차는 여기서 바로 완료로 찍어 둔다
        const auto = applyAutoDone(rowsRef.current, map);
        if (auto.count > 0) {
          setRows(auto.rows);
          setMsg({
            ok: true,
            text: `듣기·단어를 다 한 ${auto.count}칸을 완료로 찍어 뒀어요. 저장을 눌러 주세요.`,
          });
        }
      })();
    }, 600);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
    // 날짜가 바뀔 때만 — dates 는 dateKey 로 대신 본다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan?.id, dateKey, student.id, year, month]);

  function patch(week: number, area: string, apply: (r: Row) => Row) {
    setRows((prev) => prev.map((r) => (r.week === week && r.area === area ? apply(r) : r)));
  }

  function renameArea(oldName: string, next: string) {
    setRows((prev) => prev.map((r) => (r.area === oldName ? { ...r, area: next } : r)));
  }

  function setTextbook(area: string, textbook: string) {
    setRows((prev) => prev.map((r) => (r.area === area ? { ...r, textbook } : r)));
  }

  function addArea() {
    const name = `새 영역 ${areas.length + 1}`;
    setRows((prev) => [
      ...prev,
      ...weeks.map((week) => ({ week, area: name, textbook: "", orderIndex: areas.length, entries: Array.from({ length: sessions }, emptyEntry) })),
    ]);
  }

  function removeArea(area: string) {
    setRows((prev) => prev.filter((r) => r.area !== area));
  }

  function changeSessions(n: number) {
    setSessions(n);
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        entries: Array.from({ length: n }, (_, i) => r.entries[i] ?? emptyEntry()),
      }))
    );
  }

  async function create() {
    setBusy(true);
    const r = await createPlanAction({ studentId: student.id, year, month, sessionsPerWeek: sessions });
    setMsg({ ok: r.ok, text: r.message });
    setBusy(false);
  }

  /**
   * 반 수업 요일로 주당 회차 수와 그 달 날짜를 한꺼번에 채운다.
   * 월수금 반이면 3회차가 되고 날짜가 요일에 맞춰 촤르륵 들어간다.
   */
  async function applyClassWeekdays() {
    setFilling("요일");
    setMsg(null);
    try {
      const r = await classScheduleAction({ studentId: student.id, year, month });
      if (!r.ok) {
        setMsg({ ok: false, text: r.message });
        return;
      }
      changeSessions(r.sessionsPerWeek);
      setDates(r.sessionDates);
      const n = Object.values(r.sessionDates).flat().filter(Boolean).length;
      setMsg({ ok: true, text: `${r.label} 반이라 ${r.sessionsPerWeek}회차로 두고 날짜 ${n}개를 넣었어요. 저장을 눌러 주세요.` });
    } finally {
      setFilling(null);
    }
  }

  /** 이 주의 회차 출결 */
  function attendanceAt(week: number, i: number): Attendance {
    return attendance[String(week)]?.[i] ?? "";
  }

  /**
   * 회차 출결을 바꾼다. 결석·공휴일로 바꾸면 그날 적어 둔 진도·숙제를 다음 회차로 밀고,
   * 되돌릴 때는 밀었던 것을 되돌리지 않는다(이미 손으로 고쳤을 수 있다).
   */
  function setAttendanceAt(week: number, i: number, next: Attendance) {
    const before = attendanceAt(week, i);
    setAttendance((prev) => {
      const list = [...(prev[String(week)] ?? [])];
      while (list.length < sessions) list.push("");
      list[i] = next;
      return { ...prev, [String(week)]: list };
    });
    // 수업이 없는 날(결석·공휴일)은 그날 진도를 다음 회차로 넘긴다
    const skips = (a: Attendance) => a === "absent" || a === "holiday";
    if (skips(next) && !skips(before)) pushToNextSession(week, i);
  }

  /** 결석한 회차의 진도·숙제를 다음 회차로 밀어 넣는다 */
  function pushToNextSession(week: number, i: number) {
    setRows((prev) => {
      const flat = weeks.flatMap((w) =>
        Array.from({ length: sessions }, (_, k) => ({ week: w, index: k })),
      );
      const at = flat.findIndex((f) => f.week === week && f.index === i);
      const to = at >= 0 ? flat[at + 1] : undefined;
      if (!to) return prev; // 마지막 회차면 밀 곳이 없다

      return prev.map((r) => {
        const isFrom = r.week === week;
        const isTo = r.week === to.week;
        if (!isFrom && !isTo) return r;

        const from = prev.find((x) => x.week === week && x.area === r.area);
        const moved = from?.entries[i];
        if (!moved || (!moved.progress.trim() && !moved.homework.trim())) return r;

        if (isFrom && isTo) {
          // 같은 주 안에서 다음 회차로
          return {
            ...r,
            entries: r.entries.map((x, k) => {
              if (k === i) return { ...x, progress: "", homework: "" };
              if (k === to.index) return { ...x, progress: joinPushed(moved.progress, x.progress), homework: joinPushed(moved.homework, x.homework) };
              return x;
            }),
          };
        }
        if (isFrom) {
          return { ...r, entries: r.entries.map((x, k) => (k === i ? { ...x, progress: "", homework: "" } : x)) };
        }
        return {
          ...r,
          entries: r.entries.map((x, k) =>
            k === to.index
              ? { ...x, progress: joinPushed(moved.progress, x.progress), homework: joinPushed(moved.homework, x.homework) }
              : x,
          ),
        };
      });
    });
  }

  /** "Day 3, 4" → [3, 4] */
  function daysOf(text: string): number[] {
    if (!/^\s*day/i.test(text)) return [];
    return (text.match(/\d+/g) ?? []).map(Number).filter((n) => n > 0);
  }

  /**
   * 진도 칸을 고친다. 단어 줄에서 "Day 3, 4"처럼 고치면, 뒤 회차를 같은 묶음 크기로
   * 5,6 · 7,8 … 이어서 다시 매긴다. 선생님이 한 칸만 옮겨도 나머지가 따라온다.
   */
  function setProgressAt(week: number, area: string, index: number, text: string) {
    const days = daysOf(text);
    setRows((prev) => {
      const flat = weeks.flatMap((w) =>
        Array.from({ length: sessions }, (_, k) => ({ week: w, index: k })),
      );
      const at = flat.findIndex((f) => f.week === week && f.index === index);
      const per = days.length;
      let nextDay = days.length ? Math.max(...days) + 1 : 0;

      return prev.map((r) => {
        if (r.area !== area) return r;
        return {
          ...r,
          entries: r.entries.map((x, k) => {
            if (r.week === week && k === index) return { ...x, progress: text };
            if (per === 0 || at < 0) return x;
            const pos = flat.findIndex((f) => f.week === r.week && f.index === k);
            if (pos <= at) return x;
            // 원래 Day 로 적혀 있던 칸만 다시 매긴다
            if (daysOf(x.progress).length === 0) return x;
            const chunk = Array.from({ length: per }, (_, n) => nextDay + n);
            nextDay += per;
            return { ...x, progress: `Day ${chunk.join(", ")}` };
          }),
        };
      });
    });
  }

  /**
   * 배정된 듣기·단어를 일정표 회차에 그대로 깔아 넣는다.
   * '듣기'·'영단어' 영역이 없으면 만들어서 넣는다.
   */
  async function pullAssigned() {
    setFilling("배정");
    setMsg(null);
    try {
      const r = await loadAssignedPlan({
        studentId: student.id,
        year,
        month,
        sessionDates: dates,
        vocabDaysPerSession: vocabDays,
      });
      if (!r.ok) {
        setMsg({ ok: false, text: r.message });
        return;
      }

      setRows((prev) => {
        let next = [...prev];
        let order = areas.length;
        for (const fill of r.rows) {
          const kind = autoFillArea(fill.area);
          const target = next.find((row) => autoFillArea(row.area) === kind);
          const name = target?.area ?? fill.area;
          if (!target) {
            next = [
              ...next,
              ...weeks.map((week) => ({
                week,
                area: name,
                textbook: "",
                orderIndex: order,
                entries: Array.from({ length: sessions }, emptyEntry),
              })),
            ];
            order += 1;
          }
          next = next.map((row) => {
            if (row.area !== name) return row;
            return {
              ...row,
              textbook: fill.textbook || row.textbook,
              entries: row.entries.map((e, i) => {
                const cell = fill.cells.find((c) => c.week === row.week && c.index === i);
                return cell && cell.text.trim() ? { ...e, progress: cell.text } : e;
              }),
            };
          });
        }
        return next;
      });

      const filled = r.rows.map((f) => `${f.area} ${f.cells.filter((c) => c.text.trim()).length}칸`);
      setMsg({ ok: true, text: `${filled.join(" · ")}을 채웠어요. 저장을 눌러 주세요.` });
    } finally {
      setFilling(null);
    }
  }

  async function save() {
    if (!plan) return;
    setBusy(true);
    const r = await savePlanAction({
      planId: plan.id,
      sessionsPerWeek: sessions,
      rows,
      sessionDates: dates,
      attendance,
    });
    setMsg({ ok: r.ok, text: r.message });
    setBusy(false);
  }

  if (!plan) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-base font-bold text-slate-900">
          {year}년 {month}월 일정표가 아직 없어요.
        </p>
        <p className="mt-1 text-sm text-slate-500">지난달 일정표가 있으면 영역과 교재명을 그대로 가져와요.</p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <label className="text-sm text-slate-600">
            주당 수업
            <select value={sessions} onChange={(e) => setSessions(Number(e.target.value))} className="ui-input ml-2 inline-block h-9 w-24">
              {[2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}회
                </option>
              ))}
            </select>
          </label>
          <Button onClick={create} disabled={busy}>
            {busy ? "만드는 중…" : "일정표 만들기"}
          </Button>
        </div>
        {msg ? <div className="mt-3"><Alert variant={msg.ok ? "success" : "error"}>{msg.text}</Alert></div> : null}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 머리: 학생 정보 */}
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
          <b className="text-base text-slate-900">{student.name}</b>
          <span className="text-slate-600">{[student.school, student.schoolGrade].filter(Boolean).join(" ") || "학교 미입력"}</span>
          <span className="text-slate-600">{student.className ?? "반 없음"}{student.classTime ? ` · ${student.classTime}` : ""}</span>
          <span className="text-slate-500">본인 {student.phone ?? "-"} · 학부모 {student.parentPhone ?? "-"}</span>
          {student.enrolledOn ? <span className="text-slate-500">입학 {student.enrolledOn}</span> : null}
        </div>
      </div>

      {viewingThisMonth ? (
        <TodayStatusPanel
          key={student.id}
          studentId={student.id}
          studentName={student.name}
          academyName={academyName}
          homework={todayHomework}
          sessionLabel={todaySessionLabel}
        />
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm text-slate-600">
          주당 수업
          <select value={sessions} onChange={(e) => changeSessions(Number(e.target.value))} className="ui-input ml-2 inline-block h-9 w-24">
            {[2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}회
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-slate-600">
            단어 한 회차에
            <select value={vocabDays} onChange={(e) => setVocabDays(Number(e.target.value))} className="ui-input mx-1 inline-block h-9 w-20">
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}일
                </option>
              ))}
            </select>
            치
          </label>
          <Button variant="secondary" onClick={() => void applyClassWeekdays()} disabled={filling !== null}>
            {filling === "요일" ? "채우는 중…" : "반 요일로 날짜 채우기"}
          </Button>
          <Button variant="secondary" onClick={() => void pullAssigned()} disabled={filling !== null}>
            {filling === "배정" ? "가져오는 중…" : "배정된 듣기·단어 채우기"}
          </Button>
          <Button variant="secondary" onClick={addArea}>+ 영역 추가</Button>
          <Button onClick={save} disabled={busy}>{busy ? "저장 중…" : "저장"}</Button>
        </div>
      </div>

      {msg ? <Alert variant={msg.ok ? "success" : "error"}>{msg.text}</Alert> : null}

      {droppedWeeks.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <span>뺀 주차</span>
          {droppedWeeks.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => restoreWeek(w)}
              className="rounded border border-slate-300 bg-white px-2 py-0.5 text-xs font-semibold text-slate-600 hover:bg-white hover:text-brand-700"
            >
              {w}주 되돌리기
            </button>
          ))}
        </div>
      ) : null}

      {picking ? (
        <UnitPickerModal
          books={books}
          onPick={(text) => {
            patch(picking.week, picking.area, (r) => ({
              ...r,
              entries: r.entries.map((x, k) => (k === picking.index ? { ...x, progress: text } : x)),
            }));
            setPicking(null);
          }}
          onClose={() => setPicking(null)}
        />
      ) : null}

      {weeks.map((week) => {
        /** 이 주의 줄마다 실제 기록과 이어지는 영역 — 회차 머리 요약·주차 합계에 쓴다 */
        const linkedRows = rows
          .filter((r) => r.week === week)
          .map((r) => ({ row: r, kind: (autoFillArea(r.area) ?? (isCourseRow(r.area, r.textbook, courseTitles) ? "course" : null)) as PlanDoneArea | null }))
          .filter((x): x is { row: Row; kind: PlanDoneArea } => x.kind !== null)
          .sort((a, b) => a.row.orderIndex - b.row.orderIndex);
        const stateAt = (kind: PlanDoneArea, row: Row, i: number): PlanDoneState | null => {
          const cell = done.get(`${kind}-${week}-${i}`);
          return cell ? refineState(cell, row.entries[i]?.progress ?? "") : null;
        };
        /** 주차 합계: 지난 회차 중 했음 수 / 본 회차 수 */
        const weekTotals = linkedRows.map(({ row, kind }) => {
          let seen = 0;
          let ok = 0;
          for (let i = 0; i < sessions; i += 1) {
            const st = stateAt(kind, row, i);
            if (!st || st === "upcoming" || st === "none") continue;
            seen += 1;
            if (st === "done") ok += 1;
          }
          return { kind, area: row.area, seen, ok };
        });
        return (
        <section key={week} className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-bold text-slate-600">
                <th className="w-20 px-2 py-2">
                  <span className="block">{week}주</span>
                  {weekTotals.some((t) => t.seen > 0) ? (
                    <span className="mt-1 block space-y-0.5 text-[11px] font-normal text-slate-500">
                      {weekTotals
                        .filter((t) => t.seen > 0)
                        .map((t) => (
                          <span key={t.area} className="block whitespace-nowrap">
                            {AREA_SHORT[t.kind]}{" "}
                            <b className={t.ok === t.seen ? "text-emerald-700" : t.ok === 0 ? "text-rose-700" : "text-amber-700"}>
                              {t.ok}/{t.seen}
                            </b>
                          </span>
                        ))}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => removeWeek(week)}
                    title="이 주차를 표에서 뺍니다"
                    className="mt-1 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] font-semibold text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  >
                    주차 빼기
                  </button>
                </th>
                <th className="w-28 px-2 py-2">영역</th>
                <th className="w-40 px-2 py-2">교재명</th>
                {Array.from({ length: sessions }, (_, i) => (
                  <th key={i} className="px-2 py-2">
                    <span className="block">
                      {i + 1}회차
                      {weekdayOf(dates[String(week)]?.[i] ?? "") ? (
                        <span className="ml-1 text-brand-600">({weekdayOf(dates[String(week)]?.[i] ?? "")})</span>
                      ) : null}
                      {holidayNameOf(dates[String(week)]?.[i] ?? "") ? (
                        <span className="ml-1 font-normal text-rose-500">
                          {holidayNameOf(dates[String(week)]?.[i] ?? "")}
                        </span>
                      ) : null}
                    </span>
                    <input
                      type="date"
                      value={dates[String(week)]?.[i] ?? ""}
                      onChange={(e) =>
                        setDates((prev) => {
                          const list = [...(prev[String(week)] ?? [])];
                          list[i] = e.target.value;
                          return { ...prev, [String(week)]: list };
                        })
                      }
                      className="ui-input mt-1 h-7 w-[9.5rem] text-xs font-normal"
                    />
                    {linkedRows.some(({ row, kind }) => {
                      const st = stateAt(kind, row, i);
                      return st && st !== "none";
                    }) ? (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {linkedRows.map(({ row, kind }) => {
                          const st = stateAt(kind, row, i);
                          if (!st || st === "none") return null;
                          return (
                            <span key={row.area} className={`rounded-full border px-1.5 py-px text-[10px] font-semibold ${STATE_PILL[st]}`}>
                              {AREA_SHORT[kind]} {STATE_MARK[st] || "·"}
                            </span>
                          );
                        })}
                      </div>
                    ) : null}
                    <div className="mt-1 flex flex-wrap gap-0.5">
                      {(Object.keys(ATTENDANCE_LABELS) as Array<keyof typeof ATTENDANCE_LABELS>).map((key) => {
                        const on = attendanceAt(week, i) === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setAttendanceAt(week, i, on ? "" : key)}
                            title={
                              key === "absent" || key === "holiday"
                                ? `${ATTENDANCE_LABELS[key]}로 두면 이 회차의 진도·숙제가 다음 회차로 넘어가요`
                                : ATTENDANCE_LABELS[key]
                            }
                            className={`h-6 min-w-[2.6rem] flex-1 rounded border text-[11px] font-semibold transition ${
                              on
                                ? key === "absent"
                                  ? "border-rose-500 bg-rose-50 text-rose-700"
                                  : key === "late"
                                    ? "border-amber-500 bg-amber-50 text-amber-700"
                                    : key === "makeup"
                                      ? "border-violet-500 bg-violet-50 text-violet-700"
                                      : key === "holiday"
                                        ? "border-slate-500 bg-slate-100 text-slate-700"
                                        : "border-emerald-500 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 bg-white text-slate-400 hover:bg-slate-50"
                            }`}
                          >
                            {ATTENDANCE_LABELS[key]}
                          </button>
                        );
                      })}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {areas.map((area) => {
                const row = rows.find((r) => r.week === week && r.area === area);
                if (!row) return null;
                return (
                  <tr key={area} className="border-t border-slate-100 align-top">
                    <td className="px-2 py-2 text-xs text-slate-400">{week === weeks[0] ? "" : ""}</td>
                    <td className="p-1">
                      {week === weeks[0] ? (
                        <div className="flex items-center gap-1">
                          <input
                            value={row.area}
                            onChange={(e) => renameArea(area, e.target.value)}
                            className="ui-input h-8 text-sm"
                          />
                          <button type="button" onClick={() => removeArea(area)} className="px-1 text-slate-300 hover:text-red-600" title="영역 빼기">
                            ✕
                          </button>
                        </div>
                      ) : (
                        <span className="px-1 text-slate-700">{row.area}</span>
                      )}
                    </td>
                    <td className="p-1">
                      {week === weeks[0] ? (
                        <input value={row.textbook} onChange={(e) => setTextbook(area, e.target.value)} className="ui-input h-8 text-sm" placeholder="교재명" />
                      ) : (
                        <span className="px-1 text-slate-500">{row.textbook}</span>
                      )}
                    </td>
                    {row.entries.map((entry, i) => {
                      const kind = autoFillArea(area);
                      const linked = kind !== null;
                      // 듣기·단어 영역이면 그 회차에 실제로 했는지, 강좌와 이어진 줄이면 본 영상을 진도 아래에 붙인다
                      const doneKind: PlanDoneArea | null = kind ?? (isCourseRow(area, row.textbook, courseTitles) ? "course" : null);
                      const doneCell = doneKind ? done.get(`${doneKind}-${week}-${i}`) : undefined;
                      const cellState = doneCell ? refineState(doneCell, entry.progress) : null;
                      // 강좌 줄은 영상 기록이 없는 게 흔해(수업에서 듣는다) 「안 함」이어도 바탕은 안 칠하고 글만 빨갛게 둔다
                      return (
                      <td key={i} className={`p-1 ${cellState && !(doneKind === "course" && cellState === "missing") ? STATE_CELL[cellState] : ""}`}>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <input
                              value={entry.progress}
                              onChange={(e) => setProgressAt(week, area, i, e.target.value)}
                              className="ui-input h-8 flex-1 text-sm"
                              placeholder={linked ? "계획" : "학습진도"}
                            />
                            {linked ? null : (
                              <button
                                type="button"
                                onClick={() => setPicking({ week, area, index: i })}
                                title="교재 목차에서 고르기"
                                className="h-8 shrink-0 rounded-md border border-slate-200 px-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                              >
                                목차
                              </button>
                            )}
                          </div>
                          {doneCell && cellState ? <ActualLine cell={doneCell} state={cellState} /> : null}
                          {linked ? null : (
                          <input
                            value={entry.homework}
                            onChange={(e) =>
                              patch(week, area, (r) => ({
                                ...r,
                                entries: r.entries.map((x, k) => (k === i ? { ...x, homework: e.target.value } : x)),
                              }))
                            }
                            className="ui-input h-8 text-sm"
                            placeholder="숙제"
                          />
                          )}
                          <input
                            value={entry.note}
                            onChange={(e) =>
                              patch(week, area, (r) => ({
                                ...r,
                                entries: r.entries.map((x, k) => (k === i ? { ...x, note: e.target.value } : x)),
                              }))
                            }
                            className="ui-input h-8 text-sm"
                            placeholder="특이사항"
                          />
                          <CheckButtons
                            value={entry.check}
                            onPick={(next) =>
                              patch(week, area, (r) => ({
                                ...r,
                                entries: r.entries.map((x, k) => (k === i ? { ...x, check: next } : x)),
                              }))
                            }
                          />
                        </div>
                      </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
        );
      })}
    </div>
  );
}

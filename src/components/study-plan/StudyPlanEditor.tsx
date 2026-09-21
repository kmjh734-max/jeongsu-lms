"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { classScheduleAction, createPlanAction, savePlanAction } from "@/app/admin/study-plans/actions";
import { loadAssignedPlan, type AutoFillArea } from "@/lib/study-plan/auto-fill";
import {
  ATTENDANCE_LABELS,
  emptyEntry,
  type Attendance,
  type PlanEntry,
  type StudyPlan,
} from "@/lib/study-plan";
import { WEEKDAY_LABELS, weeksInMonth } from "@/lib/study-plan/weekday-dates";
import { hasHolidayTable, holidayNameOf } from "@/lib/study-plan/holidays";
import { UnitPickerModal } from "@/components/textbooks/UnitPickerModal";
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
}: {
  student: PlanStudent;
  year: number;
  month: number;
  plan: StudyPlan | null;
  /** 올려 둔 교재 목차 — 진도 칸을 트리로 고른다 */
  books: Textbook[];
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

  /** 영역 이름을 보고 듣기·단어 중 무엇과 이어지는지 고른다 */
  function autoFillArea(area: string): AutoFillArea | null {
    const t = area.replace(/\s/g, "");
    if (t.includes("듣기")) return "listening";
    if (t.includes("단어") || t.includes("어휘")) return "vocab";
    return null;
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

      {weeks.map((week) => (
        <section key={week} className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-bold text-slate-600">
                <th className="w-20 px-2 py-2">
                  <span className="block">{week}주</span>
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
                      const linked = autoFillArea(area) !== null;
                      return (
                      <td key={i} className="p-1">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <input
                              value={entry.progress}
                              onChange={(e) => setProgressAt(week, area, i, e.target.value)}
                              className="ui-input h-8 flex-1 text-sm"
                              placeholder={linked ? "진도" : "학습진도"}
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
      ))}
    </div>
  );
}

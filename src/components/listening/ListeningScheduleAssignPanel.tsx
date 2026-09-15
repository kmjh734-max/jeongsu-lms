"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/layout/NavIcon";
import { ListeningScheduleAddSetsModal } from "@/components/listening/ListeningScheduleAddSetsModal";
import {
  DAY_LABELS,
  WEEKDAY_PRESETS,
  isStudyDay,
  parseDateOnly,
  toDateOnlyString,
} from "@/lib/listening/schedule/days-of-week";
import {
  buildPackedDailySlices,
  sortSetIdsByRound,
} from "@/lib/listening/schedule/question-queue";
import type { QuestionQueueItem } from "@/lib/listening/schedule/types";

export interface AssignPanelClass {
  id: string;
  name: string;
  studentCount: number;
}

export interface AssignPanelStudent {
  id: string;
  name: string;
}

export interface AssignPanelSet {
  id: string;
  title: string;
  folder_id: string | null;
  questionCount: number;
  dictationPassScore: number;
}

interface ListeningScheduleAssignPanelProps {
  classes: AssignPanelClass[];
  students: AssignPanelStudent[];
  sets: AssignPanelSet[];
  folders: { id: string; name: string }[];
  initialSetIds?: string[];
  onClose: () => void;
  onSuccess: (targetLabel: string) => void;
}

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;
const PER_DAY_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 17, 20];

function todayLocalIso(): string {
  // 브라우저 로컬(한국) 기준 — UTC toISOString은 날짜가 하루 밀릴 수 있음
  return toDateOnlyString(new Date());
}

function formatMD(iso: string): string {
  const d = parseDateOnly(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function sameDays(a: number[], b: readonly number[]): boolean {
  return a.length === b.length && [...a].sort().join() === [...b].sort().join();
}

interface PreviewDay {
  date: string;
  weekday: number;
  setId: string;
  from: number;
  to: number;
}

function buildPreview(opts: {
  orderedSetIds: string[];
  countBySet: Map<string, number>;
  perDay: number;
  daysOfWeek: number[];
  startIso: string;
  endIso: string;
}): { days: PreviewDay[]; totalQuestions: number; coveredQuestions: number } {
  const queue: QuestionQueueItem[] = [];
  for (const setId of opts.orderedSetIds) {
    const n = opts.countBySet.get(setId) ?? 0;
    for (let i = 1; i <= n; i++) {
      queue.push({ setId, questionId: `${setId}#${i}`, orderIndex: i });
    }
  }
  const totalQuestions = queue.length;
  if (totalQuestions === 0 || opts.daysOfWeek.length === 0 || !opts.startIso) {
    return { days: [], totalQuestions, coveredQuestions: 0 };
  }

  const slices = buildPackedDailySlices(queue, opts.perDay);
  const days: PreviewDay[] = [];
  const cursor = parseDateOnly(opts.startIso);
  const end = opts.endIso ? parseDateOnly(opts.endIso) : null;
  let covered = 0;
  for (let guard = 0; days.length < slices.length && guard < 1500; guard++) {
    if (end && cursor > end) break;
    if (isStudyDay(cursor, opts.daysOfWeek)) {
      const slice = slices[days.length]!;
      const nums = slice.questionIds.map((id) => Number(id.split("#")[1]));
      covered += nums.length;
      days.push({
        date: toDateOnlyString(cursor),
        weekday: cursor.getDay(),
        setId: slice.setId,
        from: Math.min(...nums),
        to: Math.max(...nums),
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return { days, totalQuestions, coveredQuestions: covered };
}

export function ListeningScheduleAssignPanel({
  classes,
  students,
  sets,
  folders,
  initialSetIds = [],
  onClose,
  onSuccess,
}: ListeningScheduleAssignPanelProps) {
  const [target, setTarget] = useState(() =>
    classes[0] ? `class:${classes[0].id}` : students[0] ? `student:${students[0].id}` : ""
  );
  const [selectedSetIds, setSelectedSetIds] = useState<string[]>(initialSetIds);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([...WEEKDAY_PRESETS.weekdays]);
  const [questionsPerDay, setQuestionsPerDay] = useState(5);
  const [startDate, setStartDate] = useState(todayLocalIso);
  const [endDate, setEndDate] = useState("");
  const [requireDictationPass, setRequireDictationPass] = useState(true);
  const [dictationPassScore, setDictationPassScore] = useState(80);
  const [scoreTouched, setScoreTouched] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !pickerOpen) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, pickerOpen]);

  const setById = useMemo(() => new Map(sets.map((s) => [s.id, s])), [sets]);
  const titleById = useMemo(() => new Map(sets.map((s) => [s.id, s.title])), [sets]);
  const countBySet = useMemo(
    () => new Map(sets.map((s) => [s.id, s.questionCount])),
    [sets]
  );

  /** 서버와 같은 순서 (제목의 「n회」 순, 없으면 고른 순서) */
  const orderedSetIds = useMemo(
    () => sortSetIdsByRound(selectedSetIds.filter((id) => setById.has(id)), titleById),
    [selectedSetIds, setById, titleById]
  );

  // 받아쓰기 통과 점수 기본값: 첫 세트의 기본 통과 점수
  const firstSetId = orderedSetIds[0];
  useEffect(() => {
    if (scoreTouched || !firstSetId) return;
    const s = setById.get(firstSetId);
    if (s) setDictationPassScore(s.dictationPassScore);
  }, [firstSetId, scoreTouched, setById]);

  const preview = useMemo(
    () =>
      buildPreview({
        orderedSetIds,
        countBySet,
        perDay: questionsPerDay,
        daysOfWeek,
        startIso: startDate,
        endIso: endDate,
      }),
    [orderedSetIds, countBySet, questionsPerDay, daysOfWeek, startDate, endDate]
  );

  const [targetKind, targetId] = target.split(":") as ["class" | "student" | "", string];
  const targetClass = targetKind === "class" ? classes.find((c) => c.id === targetId) : undefined;
  const targetStudent =
    targetKind === "student" ? students.find((s) => s.id === targetId) : undefined;
  const targetLabel = targetClass
    ? `${targetClass.name}${targetClass.studentCount > 0 ? ` ${targetClass.studentCount}명` : ""}`
    : (targetStudent?.name ?? "");

  function toggleDay(day: number) {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function removeSet(id: string) {
    setSelectedSetIds((prev) => prev.filter((x) => x !== id));
  }

  async function submit() {
    if (!targetKind || !targetId) {
      setError("누구에게 배정할지 골라 주세요.");
      return;
    }
    if (orderedSetIds.length === 0) {
      setError("세트를 하나 이상 골라 주세요.");
      return;
    }
    if (daysOfWeek.length === 0) {
      setError("요일을 하나 이상 골라 주세요.");
      return;
    }
    setBusy(true);
    setError(null);
    const firstTitle = titleById.get(orderedSetIds[0]!) ?? "듣기";
    const title =
      orderedSetIds.length > 1 ? `${firstTitle} 외 ${orderedSetIds.length - 1}` : firstTitle;
    const res = await fetch("/api/listening/schedule-assignments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        targetType: targetKind,
        targetClassId: targetKind === "class" ? targetId : null,
        targetStudentId: targetKind === "student" ? targetId : null,
        setIds: orderedSetIds,
        startDate,
        endDate: endDate || null,
        daysOfWeek: [...daysOfWeek].sort((a, b) => a - b),
        questionsPerDay,
        requireDictationPass,
        dictationPassScore,
        lockNextUntilTodayComplete: true,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
    setBusy(false);
    if (!data.ok) {
      setError(data.message ?? "배정하지 못했어요.");
      return;
    }
    onSuccess(targetClass?.name ?? targetStudent?.name ?? "");
  }

  const lastDay = preview.days[preview.days.length - 1];
  const cutShort = preview.totalQuestions > 0 && preview.coveredQuestions < preview.totalQuestions;

  return (
    <aside
      aria-label="새로 배정하기"
      className="fixed inset-0 z-50 flex flex-col gap-3.5 overflow-y-auto bg-white px-4 py-5 lg:sticky lg:inset-auto lg:top-4 lg:z-auto lg:max-h-[calc(100vh-2rem)] lg:rounded-lg lg:border lg:border-slate-200 lg:px-5 lg:py-[18px] lg:shadow-card"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900">새로 배정하기</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <Icon name="x" size={18} />
        </button>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-slate-500">누구에게</span>
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="ui-select"
        >
          {classes.length === 0 && students.length === 0 ? (
            <option value="">배정할 반·학생이 없어요</option>
          ) : null}
          {classes.length > 0 ? (
            <optgroup label="반">
              {classes.map((c) => (
                <option key={c.id} value={`class:${c.id}`}>
                  {`반: ${c.name}${c.studentCount > 0 ? ` (${c.studentCount}명)` : ""}`}
                </option>
              ))}
            </optgroup>
          ) : null}
          {students.length > 0 ? (
            <optgroup label="학생">
              {students.map((s) => (
                <option key={s.id} value={`student:${s.id}`}>
                  {`학생: ${s.name}`}
                </option>
              ))}
            </optgroup>
          ) : null}
        </select>
      </label>

      <div>
        <span className="mb-1.5 block text-xs font-semibold text-slate-500">어떤 세트를 · 순서대로</span>
        <div className="flex flex-wrap gap-1.5">
          {orderedSetIds.map((id, i) => (
            <span
              key={id}
              className="inline-flex h-7 max-w-full items-center gap-1.5 rounded-md bg-brand-50 pl-2.5 pr-1.5 text-xs font-semibold text-brand-700"
            >
              <span className="tabular-nums">{i + 1}</span>
              <span className="truncate">{titleById.get(id)}</span>
              <button
                type="button"
                onClick={() => removeSet(id)}
                aria-label={`${titleById.get(id)} 빼기`}
                className="rounded p-0.5 hover:bg-brand-100"
              >
                <Icon name="x" size={12} strokeWidth={2.2} />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="inline-flex h-7 items-center gap-1 rounded-md border border-dashed border-slate-300 px-2.5 text-xs font-semibold text-slate-500 hover:border-slate-400 hover:text-slate-800"
          >
            <Icon name="plus" size={12} strokeWidth={2} />
            세트 추가
          </button>
        </div>
      </div>

      <div>
        <span className="mb-1.5 block text-xs font-semibold text-slate-500">요일</span>
        <div className="flex flex-wrap items-center gap-1.5">
          {WEEK_ORDER.map((d) => {
            const on = daysOfWeek.includes(d);
            return (
              <button
                key={d}
                type="button"
                onClick={() => toggleDay(d)}
                aria-pressed={on}
                className={`h-[30px] min-w-[34px] rounded-md px-2.5 text-[13px] font-semibold transition ${
                  on
                    ? "bg-brand-600 text-white"
                    : "border border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                }`}
              >
                {DAY_LABELS[d]}
              </button>
            );
          })}
        </div>
        <div className="mt-1.5 flex gap-1">
          {(
            [
              ["월~금", WEEKDAY_PRESETS.weekdays],
              ["월수금", WEEKDAY_PRESETS.monWedFri],
              ["매일", WEEKDAY_PRESETS.everyDay],
            ] as const
          ).map(([label, days]) => (
            <button
              key={label}
              type="button"
              onClick={() => setDaysOfWeek([...days])}
              className={`rounded px-2 py-0.5 text-xs font-medium transition ${
                sameDays(daysOfWeek, days)
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-slate-500">하루 문항</span>
          <select
            value={questionsPerDay}
            onChange={(e) => setQuestionsPerDay(Number(e.target.value))}
            className="ui-select px-2"
          >
            {PER_DAY_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {`${n}문항`}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-slate-500">시작</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="ui-input px-2"
          />
        </label>
        <div>
          <span className="mb-1.5 block text-xs font-semibold text-slate-500">끝</span>
          {endDate ? (
            <div className="relative">
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                aria-label="끝나는 날"
                className="ui-input px-2 pr-7"
              />
              <button
                type="button"
                onClick={() => setEndDate("")}
                aria-label="끝나는 날 지우기"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-700"
              >
                <Icon name="x" size={13} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEndDate(lastDay?.date ?? startDate)}
              className="ui-input truncate px-2 text-left text-slate-700 hover:border-slate-400"
            >
              세트 끝날 때까지
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[13px] text-slate-800">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={requireDictationPass}
            onChange={(e) => setRequireDictationPass(e.target.checked)}
            className="h-4 w-4 accent-brand-600"
          />
          받아쓰기
        </label>
        <input
          type="number"
          min={0}
          max={100}
          value={dictationPassScore}
          disabled={!requireDictationPass}
          onChange={(e) => {
            setScoreTouched(true);
            setDictationPassScore(Math.min(100, Math.max(0, Number(e.target.value) || 0)));
          }}
          aria-label="받아쓰기 통과 점수"
          className="h-8 w-16 rounded-md border border-slate-300 px-2 text-center text-[13px] tabular-nums disabled:bg-slate-50 disabled:text-slate-400"
        />
        <span className={requireDictationPass ? "" : "text-slate-400"}>점 넘어야 다음 문제로</span>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[13px] font-bold text-slate-900">이렇게 나가요</span>
          {preview.days.length > 0 ? (
            <span className="text-xs text-slate-500">
              {preview.coveredQuestions}문항 · {preview.days.length}일 · {formatMD(lastDay!.date)} 끝
            </span>
          ) : null}
        </div>
        {orderedSetIds.length === 0 ? (
          <p className="mt-2 text-xs text-slate-500">세트를 고르면 날마다 나갈 문항을 보여 드려요.</p>
        ) : preview.totalQuestions === 0 ? (
          <p className="mt-2 text-xs text-slate-500">고른 세트에 아직 문항이 없어요.</p>
        ) : daysOfWeek.length === 0 ? (
          <p className="mt-2 text-xs text-slate-500">요일을 골라 주세요.</p>
        ) : preview.days.length === 0 ? (
          <p className="mt-2 text-xs text-amber-700">시작부터 끝까지 공부하는 날이 없어요.</p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {preview.days.slice(0, 5).map((d) => (
              <li key={d.date} className="flex items-center gap-3 text-[13px]">
                <span className="w-[68px] shrink-0 tabular-nums text-slate-500">
                  {formatMD(d.date)} ({DAY_LABELS[d.weekday]})
                </span>
                <span className="min-w-0 truncate font-semibold text-slate-900">
                  {orderedSetIds.length > 1 ? `${titleById.get(d.setId)} ` : ""}
                  {d.from === d.to ? `${d.from}번` : `${d.from}~${d.to}번`}
                </span>
              </li>
            ))}
            {preview.days.length > 5 ? (
              <li className="pl-[80px] text-xs text-slate-400">… {preview.days.length - 5}일 더</li>
            ) : null}
          </ul>
        )}
        {cutShort && preview.days.length > 0 ? (
          <p className="mt-2 text-xs text-amber-700">
            끝나는 날까지 {preview.totalQuestions}문항 중 {preview.coveredQuestions}문항만 나가요.
          </p>
        ) : null}
        {preview.days.length > 0 ? (
          <p className="mt-2 text-[11px] text-slate-400">세트가 바뀌는 날은 문항이 적을 수 있어요.</p>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-auto pt-1">
        <button
          type="button"
          disabled={busy || !targetLabel || orderedSetIds.length === 0}
          onClick={() => void submit()}
          className="flex h-[42px] w-full items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "배정하는 중…" : targetLabel ? `${targetLabel}에게 배정` : "배정"}
        </button>
      </div>

      {pickerOpen ? (
        <ListeningScheduleAddSetsModal
          title="세트 추가"
          description="고른 순서대로 나가요. 이름에 「n회」가 있으면 회차 순서를 따라요."
          existingSetIds={selectedSetIds}
          availableSets={sets}
          folders={folders}
          onClose={() => setPickerOpen(false)}
          onSubmit={(ids) => setSelectedSetIds((prev) => [...prev, ...ids])}
        />
      ) : null}
    </aside>
  );
}

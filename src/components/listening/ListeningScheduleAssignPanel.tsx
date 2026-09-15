"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/layout/NavIcon";
import { ListeningScheduleAddSetsModal } from "@/components/listening/ListeningScheduleAddSetsModal";
import {
  DAY_LABELS,
  WEEKDAY_PRESETS,
  formatDaysOfWeek,
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

/** 「수정」으로 열 때 채워 둘 배정 */
export interface AssignPanelEditTarget {
  id: string;
  title: string;
  targetType: "class" | "student";
  targetLabel: string;
  targetSub: string;
  setIds: string[];
  setTitles: string[];
  daysOfWeek: number[];
  questionsPerDay: number;
  startDate: string;
  endDate: string | null;
  requireDictationPass: boolean;
  dictationPassScore: number;
  isActive: boolean;
}

interface ListeningScheduleAssignPanelProps {
  classes: AssignPanelClass[];
  students: AssignPanelStudent[];
  sets: AssignPanelSet[];
  folders: { id: string; name: string }[];
  initialSetIds?: string[];
  onClose: () => void;
  onSuccess: (targetLabel: string) => void;
  /** 있으면 「배정 수정」 창 */
  editing?: AssignPanelEditTarget;
  onSaved?: (message: string) => void;
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

function prettyDaysOf(days: number[]): string {
  if (sameDays(days, WEEKDAY_PRESETS.weekdays)) return "월~금";
  if (sameDays(days, WEEKDAY_PRESETS.everyDay)) return "매일";
  if (sameDays(days, WEEKDAY_PRESETS.monWedFri)) return "월수금";
  return formatDaysOfWeek(days);
}

function laterIso(a: string, b: string): string {
  return a >= b ? a : b;
}

/** from 부터(포함) 공부하는 날 몇 개 */
function upcomingStudyDates(opts: {
  fromIso: string;
  endIso: string;
  daysOfWeek: number[];
  limit: number;
}): string[] {
  const out: string[] = [];
  if (!opts.fromIso || opts.daysOfWeek.length === 0) return out;
  const cursor = parseDateOnly(opts.fromIso);
  const end = opts.endIso ? parseDateOnly(opts.endIso) : null;
  for (let guard = 0; out.length < opts.limit && guard < 400; guard++) {
    if (end && cursor > end) break;
    if (isStudyDay(cursor, opts.daysOfWeek)) out.push(toDateOnlyString(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

interface EditHistoryInfo {
  hasHistory: boolean;
  reachedSetIds: Set<string>;
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
  editing,
  onSaved,
}: ListeningScheduleAssignPanelProps) {
  const isEdit = Boolean(editing);
  const [target, setTarget] = useState(() =>
    classes[0] ? `class:${classes[0].id}` : students[0] ? `student:${students[0].id}` : ""
  );
  const [title, setTitle] = useState(editing?.title ?? "");
  const [selectedSetIds, setSelectedSetIds] = useState<string[]>(
    editing ? editing.setIds : initialSetIds
  );
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(
    editing ? [...editing.daysOfWeek] : [...WEEKDAY_PRESETS.weekdays]
  );
  const [questionsPerDay, setQuestionsPerDay] = useState(editing?.questionsPerDay ?? 5);
  const [startDate, setStartDate] = useState(() => editing?.startDate ?? todayLocalIso());
  const [endDate, setEndDate] = useState(editing?.endDate ?? "");
  const [requireDictationPass, setRequireDictationPass] = useState(
    editing?.requireDictationPass ?? true
  );
  const [dictationPassScore, setDictationPassScore] = useState(
    editing?.dictationPassScore ?? 80
  );
  const [scoreTouched, setScoreTouched] = useState(isEdit);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** 수정 창: 이미 나간 기록 (불러오는 중이면 null) */
  const [history, setHistory] = useState<EditHistoryInfo | null>(null);
  const [historyFailed, setHistoryFailed] = useState(false);
  const [todayIso] = useState(todayLocalIso);

  const editingId = editing?.id;
  useEffect(() => {
    if (!editingId) return;
    let cancelled = false;
    void (async () => {
      const res = await fetch(`/api/listening/schedule-assignments/${editingId}`).catch(
        () => null
      );
      const data = (await res?.json().catch(() => null)) as
        | { ok?: boolean; hasHistory?: boolean; reachedSetIds?: string[] }
        | null
        | undefined;
      if (cancelled) return;
      if (!data?.ok) {
        setHistoryFailed(true);
        return;
      }
      setHistory({
        hasHistory: Boolean(data.hasHistory),
        reachedSetIds: new Set(data.reachedSetIds ?? []),
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [editingId]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !pickerOpen) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, pickerOpen]);

  const setById = useMemo(() => new Map(sets.map((s) => [s.id, s])), [sets]);
  const titleById = useMemo(() => {
    const map = new Map(sets.map((s) => [s.id, s.title]));
    // 수정할 배정에 든 세트는 목록에 없어도 이름을 보여 준다
    editing?.setIds.forEach((id, i) => {
      if (!map.has(id)) map.set(id, editing.setTitles[i] ?? "세트");
    });
    return map;
  }, [sets, editing]);
  const countBySet = useMemo(
    () => new Map(sets.map((s) => [s.id, s.questionCount])),
    [sets]
  );

  /** 서버와 같은 순서 (제목의 「n회」 순, 없으면 고른 순서) */
  const orderedSetIds = useMemo(
    () => sortSetIdsByRound(selectedSetIds.filter((id) => titleById.has(id)), titleById),
    [selectedSetIds, titleById]
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

  /** 수정 창: 이미 들어 있던 세트 중 뺄 수 없는 것 (학생에게 나간 세트) */
  function setLockedInEdit(id: string): boolean {
    if (!editing || !editing.setIds.includes(id)) return false;
    if (!history) return true;
    return history.reachedSetIds.has(id);
  }
  const startLocked = isEdit && (!history || history.hasHistory);

  const editChanges = useMemo(() => {
    if (!editing) return null;
    const lines: string[] = [];
    let rulesChanged = false;
    const trimmedTitle = title.trim();
    if (trimmedTitle && trimmedTitle !== editing.title) {
      lines.push(`과제명: 「${editing.title}」 → 「${trimmedTitle}」`);
    }
    if (daysOfWeek.length > 0 && !sameDays(daysOfWeek, editing.daysOfWeek)) {
      lines.push(`요일: ${prettyDaysOf(editing.daysOfWeek)} → ${prettyDaysOf(daysOfWeek)}`);
      rulesChanged = true;
    }
    if (questionsPerDay !== editing.questionsPerDay) {
      lines.push(`하루 문항: ${editing.questionsPerDay}문항 → ${questionsPerDay}문항`);
      rulesChanged = true;
    }
    if (startDate !== editing.startDate) {
      lines.push(`시작일: ${formatMD(editing.startDate)} → ${formatMD(startDate)}`);
      rulesChanged = true;
    }
    if ((endDate || null) !== (editing.endDate ?? null)) {
      const label = (v: string | null) => (v ? formatMD(v) : "세트 끝날 때까지");
      lines.push(`끝나는 날: ${label(editing.endDate)} → ${label(endDate || null)}`);
      rulesChanged = true;
    }
    if (requireDictationPass !== editing.requireDictationPass) {
      lines.push(
        requireDictationPass
          ? `받아쓰기: 안 함 → ${dictationPassScore}점 넘기`
          : `받아쓰기: ${editing.dictationPassScore}점 넘기 → 안 함`
      );
    } else if (requireDictationPass && dictationPassScore !== editing.dictationPassScore) {
      lines.push(`받아쓰기 통과: ${editing.dictationPassScore}점 → ${dictationPassScore}점`);
    }
    const added = orderedSetIds.filter((id) => !editing.setIds.includes(id));
    const removed = editing.setIds.filter((id) => !orderedSetIds.includes(id));
    if (added.length > 0) {
      lines.push(`세트 더하기: ${added.map((id) => `「${titleById.get(id)}」`).join(", ")}`);
      rulesChanged = true;
    }
    if (removed.length > 0) {
      lines.push(`세트 빼기: ${removed.map((id) => `「${titleById.get(id)}」`).join(", ")}`);
      rulesChanged = true;
    }
    return { lines, rulesChanged, added, removed };
  }, [
    editing,
    title,
    daysOfWeek,
    questionsPerDay,
    startDate,
    endDate,
    requireDictationPass,
    dictationPassScore,
    orderedSetIds,
    titleById,
  ]);

  async function submitEdit() {
    if (!editing || !editChanges) return;
    if (!title.trim()) {
      setError("과제명을 적어 주세요.");
      return;
    }
    if (orderedSetIds.length === 0) {
      setError("세트를 하나 이상 남겨 주세요.");
      return;
    }
    if (daysOfWeek.length === 0) {
      setError("요일을 하나 이상 골라 주세요.");
      return;
    }
    if (endDate && endDate < startDate) {
      setError("끝나는 날이 시작일보다 앞이에요.");
      return;
    }
    if (editChanges.lines.length === 0) {
      setError("바뀐 내용이 없어요.");
      return;
    }
    const note = editChanges.rulesChanged
      ? "\n\n지난 과제는 그대로 두고, 아직 시작하지 않은 날부터 새 규칙으로 나가요."
      : "";
    if (!window.confirm(`이렇게 바꿀까요?\n\n${editChanges.lines.join("\n")}${note}`)) {
      return;
    }

    setBusy(true);
    setError(null);
    // 과제명은 늘 보내서 세트만 바꿔도 「수정」으로 처리되게 한다
    const body: Record<string, unknown> = { title: title.trim() };
    if (!sameDays(daysOfWeek, editing.daysOfWeek)) {
      body.daysOfWeek = [...daysOfWeek].sort((a, b) => a - b);
    }
    if (questionsPerDay !== editing.questionsPerDay) body.questionsPerDay = questionsPerDay;
    if (startDate !== editing.startDate) body.startDate = startDate;
    if ((endDate || null) !== (editing.endDate ?? null)) body.endDate = endDate || null;
    if (requireDictationPass !== editing.requireDictationPass) {
      body.requireDictationPass = requireDictationPass;
    }
    if (dictationPassScore !== editing.dictationPassScore) {
      body.dictationPassScore = dictationPassScore;
    }
    if (editChanges.added.length > 0) body.addSetIds = editChanges.added;
    if (editChanges.removed.length > 0) body.removeSetIds = editChanges.removed;

    const res = await fetch(`/api/listening/schedule-assignments/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => null);
    const data = (await res?.json().catch(() => null)) as
      | { ok?: boolean; message?: string }
      | null
      | undefined;
    setBusy(false);
    if (!data?.ok) {
      setError(data?.message ?? "저장하지 못했어요.");
      return;
    }
    onSaved?.(data.message ?? "배정을 고쳤어요.");
  }

  async function submit() {
    if (isEdit) {
      await submitEdit();
      return;
    }
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

  const editNextDates = isEdit
    ? upcomingStudyDates({
        fromIso: laterIso(startDate, todayIso),
        endIso: endDate,
        daysOfWeek,
        limit: 5,
      })
    : [];
  const scoreRaised =
    !!editing &&
    requireDictationPass &&
    editing.requireDictationPass &&
    dictationPassScore > editing.dictationPassScore;
  const dictationTurnedOn = !!editing && requireDictationPass && !editing.requireDictationPass;

  return (
    <aside
      aria-label={isEdit ? "배정 수정" : "새로 배정하기"}
      className="fixed inset-0 z-50 flex flex-col gap-3.5 overflow-y-auto bg-white px-4 py-5 lg:sticky lg:inset-auto lg:top-4 lg:z-auto lg:max-h-[calc(100vh-2rem)] lg:rounded-lg lg:border lg:border-slate-200 lg:px-5 lg:py-[18px] lg:shadow-card"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900">{isEdit ? "배정 수정" : "새로 배정하기"}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <Icon name="x" size={18} />
        </button>
      </div>

      {editing ? (
        <>
          <div>
            <span className="mb-1.5 block text-xs font-semibold text-slate-500">누구에게</span>
            <div className="flex min-h-[38px] items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
              <Icon
                name={editing.targetType === "class" ? "users" : "usercheck"}
                size={16}
                className="shrink-0 text-brand-700"
              />
              <span className="truncate font-semibold text-slate-900">{editing.targetLabel || "—"}</span>
              <span className="shrink-0 text-xs text-slate-500">{editing.targetSub}</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              배정 대상은 바꿀 수 없어요. 다른 반·학생은 새로 배정해 주세요.
            </p>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-500">과제명</span>
            <input
              type="text"
              value={title}
              maxLength={100}
              onChange={(e) => setTitle(e.target.value)}
              className="ui-input"
              placeholder="학생 화면에 보이는 이름"
            />
          </label>
        </>
      ) : (
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
      )}

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
              {setLockedInEdit(id) ? (
                <span
                  className="px-0.5 text-brand-400"
                  title={history ? "이미 학생들에게 나간 세트라 뺄 수 없어요" : "확인하는 중이에요"}
                >
                  <Icon name="lock" size={11} strokeWidth={2.2} />
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => removeSet(id)}
                  aria-label={`${titleById.get(id)} 빼기`}
                  className="rounded p-0.5 hover:bg-brand-100"
                >
                  <Icon name="x" size={12} strokeWidth={2.2} />
                </button>
              )}
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
            disabled={startLocked}
            onChange={(e) => setStartDate(e.target.value)}
            title={
              startLocked && history
                ? "이미 공부를 시작한 과제라 시작일은 그대로예요"
                : undefined
            }
            className="ui-input px-2 disabled:bg-slate-50 disabled:text-slate-500"
          />
        </label>
        <div>
          <span className="mb-1.5 block text-xs font-semibold text-slate-500">끝</span>
          {endDate ? (
            <div className="relative">
              <input
                type="date"
                value={endDate}
                min={isEdit ? laterIso(startDate, todayIso) : startDate}
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
              onClick={() =>
                setEndDate(
                  isEdit
                    ? (editNextDates[editNextDates.length - 1] ?? laterIso(startDate, todayIso))
                    : (lastDay?.date ?? startDate)
                )
              }
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
      {scoreRaised ? (
        <p className="-mt-2 text-[11px] text-slate-500">
          이미 통과한 문항은 그대로 두고, 아직 못 넘은 문항부터 새 점수로 봐요.
        </p>
      ) : dictationTurnedOn ? (
        <p className="-mt-2 text-[11px] text-amber-700">
          받아쓰기를 켜면 받아쓰기 없이 끝낸 문항은 다시 열 때 받아쓰기를 해야 할 수 있어요.
        </p>
      ) : null}

      {editing ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[13px] font-bold text-slate-900">이렇게 나가요</span>
            <span className="text-xs text-slate-500">
              {daysOfWeek.length > 0 ? prettyDaysOf(daysOfWeek) : "요일 없음"} · 하루 {questionsPerDay}문항
            </span>
          </div>
          {daysOfWeek.length === 0 ? (
            <p className="mt-2 text-xs text-slate-500">요일을 골라 주세요.</p>
          ) : editNextDates.length === 0 ? (
            <p className="mt-2 text-xs text-amber-700">끝나는 날까지 공부하는 날이 없어요.</p>
          ) : (
            <div className="mt-2 text-[13px]">
              <span className="text-slate-500">다음 공부하는 날 </span>
              <span className="font-semibold tabular-nums text-slate-900">
                {editNextDates
                  .map((iso) => `${formatMD(iso)}(${DAY_LABELS[parseDateOnly(iso).getDay()]})`)
                  .join(" · ")}
              </span>
              <span className="text-slate-400"> …</span>
            </div>
          )}
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            {editChanges?.rulesChanged
              ? "지난 과제는 그대로 두고, 아직 시작하지 않은 날부터 새 규칙으로 나가요. 문항은 학생마다 멈춘 곳 다음부터 이어져요."
              : "날마다 나가는 문항은 그대로예요."}
          </p>
          {editChanges?.rulesChanged ? (
            <p className="mt-1 text-[11px] text-slate-400">오늘 벌써 풀기 시작한 과제는 그대로 두고 내일부터 바뀌어요.</p>
          ) : null}
          {!editing.isActive ? (
            <p className="mt-1 text-[11px] text-slate-500">지금은 일시정지 중이에요. 재개하면 새 규칙으로 이어져요.</p>
          ) : null}
          {startLocked && history ? (
            <p className="mt-1 text-[11px] text-slate-400">이미 공부를 시작한 과제라 시작일은 그대로예요.</p>
          ) : null}
          {historyFailed ? (
            <p className="mt-1 text-[11px] text-amber-700">
              지난 기록을 불러오지 못해 시작일과 기존 세트는 잠가 두었어요.
            </p>
          ) : null}
        </div>
      ) : (
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
      )}

      {error ? (
        <p className="rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-auto pt-1">
        <button
          type="button"
          disabled={busy || (!isEdit && !targetLabel) || orderedSetIds.length === 0}
          onClick={() => void submit()}
          className="flex h-[42px] w-full items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isEdit
            ? busy
              ? "저장하는 중…"
              : "저장"
            : busy
              ? "배정하는 중…"
              : targetLabel
                ? `${targetLabel}에게 배정`
                : "배정"}
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

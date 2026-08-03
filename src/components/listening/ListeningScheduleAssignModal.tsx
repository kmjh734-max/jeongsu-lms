"use client";

import { useCallback, useEffect, useState } from "react";
import { ListeningSetFolderPicker } from "@/components/listening/ListeningSetFolderPicker";
import {
  DAY_LABELS,
  WEEKDAY_PRESETS,
} from "@/lib/listening/schedule/days-of-week";

interface ClassOption {
  id: string;
  name: string;
}

interface StudentOption {
  id: string;
  name: string;
}

interface SetOption {
  id: string;
  title: string;
  folder_id?: string | null;
}

interface FolderOption {
  id: string;
  name: string;
}

interface ListeningScheduleAssignModalProps {
  setIds?: string[];
  setTitles?: Record<string, string>;
  availableSets?: SetOption[];
  folders?: FolderOption[];
  classes: ClassOption[];
  initialTargetType?: "class" | "student";
  initialTargetClassId?: string;
  initialTargetStudentId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ListeningScheduleAssignModal({
  setIds: initialSetIds = [],
  setTitles = {},
  availableSets = [],
  folders = [],
  classes,
  initialTargetType,
  initialTargetClassId,
  initialTargetStudentId,
  onClose,
  onSuccess,
}: ListeningScheduleAssignModalProps) {
  const [selectedSetIds, setSelectedSetIds] = useState<string[]>(initialSetIds);
  const [title, setTitle] = useState("듣기 스케줄 과제");
  const [targetType, setTargetType] = useState<"class" | "student">(
    initialTargetType ?? "class"
  );
  const [targetClassId, setTargetClassId] = useState(
    initialTargetClassId ?? classes[0]?.id ?? ""
  );
  const [studentSearch, setStudentSearch] = useState("");
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [targetStudentId, setTargetStudentId] = useState(
    initialTargetStudentId ?? ""
  );
  const [startDate, setStartDate] = useState(() => {
    // 브라우저 로컬(한국) 기준 — UTC toISOString은 날짜가 하루 밀릴 수 있음
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  });
  const [endDate, setEndDate] = useState("");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([...WEEKDAY_PRESETS.weekdays]);
  const [questionsPerDay, setQuestionsPerDay] = useState(5);
  const [requireDictationPass, setRequireDictationPass] = useState(true);
  const [dictationPassScore, setDictationPassScore] = useState(80);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStudents = useCallback(async (q: string) => {
    const params = new URLSearchParams({ limit: "50" });
    if (q.trim()) params.set("q", q.trim());
    const res = await fetch(`/api/listening/student-options?${params}`);
    const data = (await res.json()) as {
      ok?: boolean;
      students?: StudentOption[];
    };
    if (data.ok && data.students) {
      setStudents(data.students);
      if (data.students[0] && !targetStudentId) {
        setTargetStudentId(data.students[0].id);
      }
    }
  }, [targetStudentId]);

  useEffect(() => {
    const t = setTimeout(() => void loadStudents(studentSearch), 300);
    return () => clearTimeout(t);
  }, [studentSearch, loadStudents]);

  function toggleDay(day: number) {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function applyPreset(preset: number[]) {
    setDaysOfWeek([...preset]);
  }

  const resolvedSetTitles = { ...setTitles };
  for (const s of availableSets) {
    resolvedSetTitles[s.id] = s.title;
  }

  async function submit() {
    if (!selectedSetIds.length) {
      setError("듣기 세트를 1개 이상 선택하세요.");
      return;
    }
    if (!daysOfWeek.length) {
      setError("학습 요일을 1개 이상 선택하세요.");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await fetch("/api/listening/schedule-assignments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        targetType,
        targetClassId: targetType === "class" ? targetClassId : null,
        targetStudentId: targetType === "student" ? targetStudentId : null,
        setIds: selectedSetIds,
        startDate,
        endDate: endDate || null,
        daysOfWeek: [...daysOfWeek].sort((a, b) => a - b),
        questionsPerDay,
        requireDictationPass,
        dictationPassScore,
        lockNextUntilTodayComplete: true,
      }),
    });
    const data = (await res.json()) as { ok?: boolean; message?: string };
    setBusy(false);
    if (!data.ok) {
      setError(data.message ?? "배정 실패");
      return;
    }
    onSuccess();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">스케줄 과제 배정</h2>
        <p className="mt-1 text-xs text-slate-600">
          선택 {selectedSetIds.length}개 세트 · 요일마다 {questionsPerDay}문항씩 순서대로 배정
        </p>

        {availableSets.length > 0 ? (
          <div className="mt-3 max-h-56 overflow-y-auto rounded-lg border border-slate-200 p-2">
            <p className="mb-2 text-xs font-medium text-slate-700">
              듣기 세트 선택 (폴더 제목을 체크하면 폴더 전체가 선택됩니다)
            </p>
            <ListeningSetFolderPicker
              sets={availableSets.map((s) => ({
                id: s.id,
                title: s.title,
                folder_id: s.folder_id ?? null,
              }))}
              folders={folders}
              selectedIds={selectedSetIds}
              onChange={setSelectedSetIds}
            />
          </div>
        ) : (
          <ul className="mt-2 max-h-24 overflow-y-auto text-xs text-slate-500">
            {selectedSetIds.map((id, i) => (
              <li key={id}>
                {i + 1}. {resolvedSetTitles[id] ?? id}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 space-y-3 text-sm">
          <label className="block">
            <span className="font-medium text-slate-700">과제명</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>

          <fieldset>
            <span className="font-medium text-slate-700">배정 대상</span>
            <div className="mt-1 flex gap-4">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  checked={targetType === "class"}
                  onChange={() => setTargetType("class")}
                />
                반
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  checked={targetType === "student"}
                  onChange={() => setTargetType("student")}
                />
                학생
              </label>
            </div>
          </fieldset>

          {targetType === "class" ? (
            <label className="block">
              반
              <select
                value={targetClassId}
                onChange={(e) => setTargetClassId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <div className="space-y-2">
              <input
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="학생 검색"
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
              <select
                value={targetStudentId}
                onChange={(e) => setTargetStudentId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <label className="flex-1">
              시작일
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="flex-1">
              종료일 (선택)
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
          </div>

          <div>
            <span className="font-medium text-slate-700">학습 요일</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {([1, 2, 3, 4, 5, 6, 0] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(d)}
                  className={`rounded-md px-2 py-1 text-xs ${
                    daysOfWeek.includes(d)
                      ? "bg-indigo-600 text-white"
                      : "border border-slate-200 text-slate-700"
                  }`}
                >
                  {DAY_LABELS[d]}
                </button>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => applyPreset([...WEEKDAY_PRESETS.weekdays])}
                className="rounded border border-slate-200 px-2 py-0.5 text-xs"
              >
                월~금
              </button>
              <button
                type="button"
                onClick={() => applyPreset([...WEEKDAY_PRESETS.monWedFri])}
                className="rounded border border-slate-200 px-2 py-0.5 text-xs"
              >
                월수금
              </button>
              <button
                type="button"
                onClick={() => applyPreset([...WEEKDAY_PRESETS.everyDay])}
                className="rounded border border-slate-200 px-2 py-0.5 text-xs"
              >
                매일
              </button>
            </div>
          </div>

          <label className="block">
            하루 문항 수
            <input
              type="number"
              min={1}
              max={20}
              value={questionsPerDay}
              onChange={(e) => setQuestionsPerDay(Number(e.target.value) || 5)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={requireDictationPass}
              onChange={(e) => setRequireDictationPass(e.target.checked)}
            />
            Dictation 통과 필요
          </label>
          {requireDictationPass && (
            <label className="block">
              통과 점수
              <input
                type="number"
                min={0}
                max={100}
                value={dictationPassScore}
                onChange={(e) =>
                  setDictationPassScore(Number(e.target.value) || 80)
                }
                className="mt-1 w-24 rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
          >
            취소
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void submit()}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {busy ? "배정 중…" : "배정하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

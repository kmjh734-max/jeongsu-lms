"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  assignCourseAction,
  loadCourseAssignPanelAction,
  unassignCourseAction,
} from "@/app/admin/courses/assign-actions";
import { TargetPicker } from "@/components/assign/TargetPicker";
import { Button } from "@/components/ui/Button";
import { ModalShell } from "@/components/vocab/VocabUi";
import type { CourseAssignPanelData } from "@/lib/courses/course-assign";

/**
 * 강좌를 반·학생에게 배정하는 창. 강좌 하나(강좌 화면) 또는 여러 개(강좌 목록에서 골라 「배정」).
 * 단어·듣기에서 쓰는 같은 고르기 부품(TargetPicker)을 쓴다 — 선생님 요청(2026-09-28): 배정 방식을 하나로.
 * 선생님 요청(2026-10-21): 관리 화면에서 체크하고 배정하게, 단어장 배정처럼. 배정된 곳을 보고 해제도 한다.
 */
export function CourseAssignModal({
  open,
  onClose,
  courseId,
  courseIds,
  courseTitle,
  onChanged,
}: {
  open: boolean;
  onClose: () => void;
  /** 강좌 하나(강좌 화면) */
  courseId?: string;
  /** 여러 강좌(강좌 목록에서 고른 것) */
  courseIds?: string[];
  courseTitle: string;
  onChanged?: () => void;
}) {
  const targetIds = useMemo(
    () => (courseIds && courseIds.length ? courseIds : courseId ? [courseId] : []),
    [courseId, courseIds]
  );
  const idsKey = targetIds.join(",");
  const [data, setData] = useState<CourseAssignPanelData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pickedClasses, setPickedClasses] = useState<string[]>([]);
  const [pickedStudents, setPickedStudents] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; bad: boolean } | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const d = await loadCourseAssignPanelAction(idsKey.split(",").filter(Boolean));
      if (!d) {
        setLoadError("배정 정보를 불러오지 못했어요.");
        return;
      }
      setData(d);
    } catch {
      setLoadError("배정 정보를 불러오지 못했어요. 다시 열어 주세요.");
    }
  }, [idsKey]);

  useEffect(() => {
    if (!open) return;
    setData(null);
    setPickedClasses([]);
    setPickedStudents([]);
    setMessage(null);
    void load();
  }, [open, load]);

  async function handleAssign() {
    if (pickedClasses.length === 0 && pickedStudents.length === 0) return;
    setBusy(true);
    setMessage(null);
    try {
      const r = await assignCourseAction(targetIds, pickedClasses, pickedStudents);
      setMessage({ text: r.message, bad: !r.ok });
      if (r.ok) {
        setPickedClasses([]);
        setPickedStudents([]);
        await load();
        onChanged?.();
      }
    } catch {
      setMessage({ text: "배정하지 못했어요. 다시 해 주세요.", bad: true });
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(target: { classId?: string; studentId?: string }, label: string) {
    const what = target.classId
      ? `「${label}」 반의 배정을 뺄까요?\n이 반 학생들의 수강도 함께 빠집니다(같은 강좌를 다른 반으로 받는 학생은 그대로). 학습 기록은 남아요.`
      : `「${label}」 학생의 수강을 뺄까요? 학습 기록은 남아요.`;
    if (!window.confirm(what)) return;
    setBusy(true);
    setMessage(null);
    try {
      const r = await unassignCourseAction(targetIds, target);
      setMessage({ text: r.message, bad: !r.ok });
      if (r.ok) {
        await load();
        onChanged?.();
      }
    } catch {
      setMessage({ text: "빼지 못했어요. 다시 해 주세요.", bad: true });
    } finally {
      setBusy(false);
    }
  }

  const n = data?.courseCount ?? targetIds.length;
  const mark = (covered: number | undefined) =>
    !covered ? "" : covered >= n ? " · 배정됨" : ` · 일부 배정(${covered}/${n})`;

  const already = data
    ? new Set([...data.assignedClassIds.map((id) => `c:${id}`), ...data.assignedStudentIds.map((id) => `s:${id}`)])
    : new Set<string>();
  const newClasses = pickedClasses.filter((id) => !already.has(`c:${id}`)).length;
  const newStudents = pickedStudents.filter((id) => !already.has(`s:${id}`)).length;

  /** 지금 배정된 곳: 반, 그리고 배정된 반에 들지 않고 따로 받는 학생 */
  const assignedClasses = data ? data.classes.filter((c) => (data.classCoverage[c.id] ?? 0) > 0) : [];
  const assignedClassNames = new Set(assignedClasses.map((c) => c.name));
  const directStudents = data
    ? data.students.filter(
        (s) =>
          (data.studentCoverage[s.id] ?? 0) > 0 &&
          !s.classLabel.split(", ").some((name) => assignedClassNames.has(name))
      )
    : [];

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      busy={busy}
      widthClass="max-w-[640px]"
      title={targetIds.length > 1 ? `강좌 ${targetIds.length}개 배정하기` : "강좌 배정하기"}
      subtitle={courseTitle}
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="min-w-0 text-sm text-slate-700" role="status">
            {message ? (
              <span className={message.bad ? "text-rose-700" : "text-green-700"}>{message.text}</span>
            ) : newClasses + newStudents > 0 ? (
              <>
                <b className="font-semibold text-slate-900">
                  {[newClasses ? `반 ${newClasses}개` : "", newStudents ? `학생 ${newStudents}명` : ""]
                    .filter(Boolean)
                    .join(", ")}
                </b>
                에게 새로 배정해요
              </>
            ) : (
              <span className="text-slate-400">배정할 반이나 학생을 골라 주세요.</span>
            )}
          </p>
          <div className="flex shrink-0 justify-end gap-2">
            <Button variant="secondary" onClick={onClose} disabled={busy}>
              닫기
            </Button>
            <Button
              onClick={() => void handleAssign()}
              disabled={busy || !data || (pickedClasses.length === 0 && pickedStudents.length === 0)}
              className="px-[22px]"
            >
              {busy ? "처리 중…" : "배정하기"}
            </Button>
          </div>
        </div>
      }
    >
      {loadError ? (
        <p className="px-6 py-12 text-center text-sm text-rose-700" role="alert">
          {loadError}
        </p>
      ) : !data ? (
        <div className="animate-pulse space-y-3 px-6 py-6">
          <div className="h-9 w-32 rounded-md bg-slate-100" />
          <div className="h-[220px] rounded-lg bg-slate-100" />
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 px-5 py-[18px] sm:px-[22px]">
          <p className="text-[13px] text-slate-500">
            반을 고르면 그 반 학생 모두가 {targetIds.length > 1 ? "고른 강좌를" : "이 강좌를"} 듣게 돼요. 이미 받고
            있는 곳은 건너뜁니다.
          </p>
          <div className="flex h-[300px] flex-col">
            <TargetPicker
              classes={data.classes.map((c) => ({
                id: c.id,
                name: `${c.name}${mark(data.classCoverage[c.id])}`,
                studentCount: c.studentCount,
              }))}
              students={data.students.map((s) => ({
                id: s.id,
                name: `${s.name}${mark(data.studentCoverage[s.id])}`,
                classLabel: s.classLabel,
              }))}
              pickedClasses={pickedClasses}
              pickedStudents={pickedStudents}
              onChangeClasses={setPickedClasses}
              onChangeStudents={setPickedStudents}
            />
          </div>

          {assignedClasses.length + directStudents.length > 0 ? (
            <div className="mt-1 rounded-lg border border-slate-200">
              <p className="border-b border-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                지금 배정된 곳 · 반 {assignedClasses.length}개
                {directStudents.length ? ` · 따로 받는 학생 ${directStudents.length}명` : ""}
              </p>
              <ul className="max-h-[150px] divide-y divide-slate-100 overflow-auto">
                {assignedClasses.map((c) => (
                  <li key={`c-${c.id}`} className="flex items-center justify-between gap-2 px-3 py-1.5 text-sm">
                    <span className="min-w-0 truncate">
                      <span className="mr-1.5 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-500">
                        반
                      </span>
                      {c.name}
                      <span className="ml-1 text-xs text-slate-400">
                        {c.studentCount}명{mark(data.classCoverage[c.id])}
                      </span>
                    </span>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleRemove({ classId: c.id }, c.name)}
                      className="shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-40"
                    >
                      해제
                    </button>
                  </li>
                ))}
                {directStudents.map((s) => (
                  <li key={`s-${s.id}`} className="flex items-center justify-between gap-2 px-3 py-1.5 text-sm">
                    <span className="min-w-0 truncate">
                      <span className="mr-1.5 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-500">
                        학생
                      </span>
                      {s.name}
                      <span className="ml-1 text-xs text-slate-400">
                        {s.classLabel}
                        {mark(data.studentCoverage[s.id])}
                      </span>
                    </span>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleRemove({ studentId: s.id }, s.name)}
                      className="shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-40"
                    >
                      해제
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </ModalShell>
  );
}

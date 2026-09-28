"use client";

import { useCallback, useEffect, useState } from "react";
import {
  assignCourseAction,
  loadCourseAssignPanelAction,
} from "@/app/admin/courses/assign-actions";
import { TargetPicker } from "@/components/assign/TargetPicker";
import { Button } from "@/components/ui/Button";
import { ModalShell } from "@/components/vocab/VocabUi";
import type { CourseAssignPanelData } from "@/lib/courses/course-assign";

/**
 * 강좌를 반·학생에게 배정하는 창.
 * 단어·듣기에서 쓰는 같은 고르기 부품(TargetPicker)을 쓴다
 * — 선생님 요청(2026-09-28): 배정 방식을 하나로.
 */
export function CourseAssignModal({
  open,
  onClose,
  courseId,
  courseTitle,
  onChanged,
}: {
  open: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  onChanged?: () => void;
}) {
  const [data, setData] = useState<CourseAssignPanelData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pickedClasses, setPickedClasses] = useState<string[]>([]);
  const [pickedStudents, setPickedStudents] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; bad: boolean } | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const d = await loadCourseAssignPanelAction(courseId);
      if (!d) {
        setLoadError("배정 정보를 불러오지 못했어요.");
        return;
      }
      setData(d);
    } catch {
      setLoadError("배정 정보를 불러오지 못했어요. 다시 열어 주세요.");
    }
  }, [courseId]);

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
      const r = await assignCourseAction(courseId, pickedClasses, pickedStudents);
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

  const already = data
    ? new Set([...data.assignedClassIds.map((id) => `c:${id}`), ...data.assignedStudentIds.map((id) => `s:${id}`)])
    : new Set<string>();
  const newClasses = pickedClasses.filter((id) => !already.has(`c:${id}`)).length;
  const newStudents = pickedStudents.filter((id) => !already.has(`s:${id}`)).length;

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      busy={busy}
      widthClass="max-w-[620px]"
      title="강좌 배정하기"
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
              {busy ? "배정 중…" : "배정하기"}
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
            반을 고르면 그 반 학생 모두가 이 강좌를 듣게 돼요. 이미 받고 있는 곳은 건너뜁니다.
          </p>
          <div className="flex h-[300px] flex-col">
            <TargetPicker
              classes={data.classes.map((c) => ({
                id: c.id,
                name: data.assignedClassIds.includes(c.id) ? `${c.name} · 배정됨` : c.name,
                studentCount: c.studentCount,
              }))}
              students={data.students.map((s) => ({
                id: s.id,
                name: data.assignedStudentIds.includes(s.id) ? `${s.name} · 배정됨` : s.name,
                classLabel: s.classLabel,
              }))}
              pickedClasses={pickedClasses}
              pickedStudents={pickedStudents}
              onChangeClasses={setPickedClasses}
              onChangeStudents={setPickedStudents}
            />
          </div>
        </div>
      )}
    </ModalShell>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface ClassOption {
  id: string;
  name: string;
}

interface StudentOption {
  id: string;
  name: string;
}

interface ListeningAssignPanelProps {
  setId: string;
  classes: ClassOption[];
  students: StudentOption[];
  assignedClassNames: string[];
  assignedStudentNames: string[];
  isPublished: boolean;
}

export function ListeningAssignPanel({
  setId,
  classes,
  students,
  assignedClassNames,
  assignedStudentNames,
  isPublished,
}: ListeningAssignPanelProps) {
  const router = useRouter();
  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function assignClass() {
    if (!classId) return;
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/listening/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setId, classId }),
    });
    const data = (await res.json()) as { ok?: boolean; message?: string };
    setBusy(false);
    if (!data.ok) {
      setMessage(data.message ?? "배정 실패");
      return;
    }
    setMessage(data.message ?? "반에 배정되었습니다.");
    router.refresh();
  }

  async function assignStudent() {
    if (!studentId) return;
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/listening/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setId, studentId }),
    });
    const data = (await res.json()) as { ok?: boolean; message?: string };
    setBusy(false);
    if (!data.ok) {
      setMessage(data.message ?? "배정 실패");
      return;
    }
    setMessage(data.message ?? "학생에게 배정되었습니다.");
    router.refresh();
  }

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold text-slate-900">반 배정</h2>
        <p className="mt-1 text-xs text-slate-600">
          반에 배정하면 자동 공개됩니다. 해당 반 소속 학생만 목록에 보입니다.
        </p>
        {!isPublished && (
          <p className="mt-2 rounded-lg bg-amber-50 px-2 py-1 text-xs text-amber-800">
            비공개 상태입니다. 배정 시 자동으로 공개됩니다.
          </p>
        )}
        {assignedClassNames.length > 0 && (
          <p className="mt-2 text-xs text-slate-600">
            배정된 반: {assignedClassNames.join(", ")}
          </p>
        )}
        {classes.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">배정할 반이 없습니다.</p>
        ) : (
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={busy}
              onClick={assignClass}
              className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              반에 배정
            </button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold text-slate-900">학생 개별 배정</h2>
        <p className="mt-1 text-xs text-slate-600">
          특정 학생에게만 배정합니다. 반 배정과 별도로 적용됩니다.
        </p>
        {assignedStudentNames.length > 0 && (
          <p className="mt-2 text-xs text-slate-600">
            배정된 학생: {assignedStudentNames.join(", ")}
          </p>
        )}
        {students.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">배정할 학생이 없습니다.</p>
        ) : (
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="min-w-[12rem] rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={busy}
              onClick={assignStudent}
              className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              학생에게 배정
            </button>
          </div>
        )}
      </div>

      {message && <p className="text-sm text-slate-600">{message}</p>}
    </section>
  );
}

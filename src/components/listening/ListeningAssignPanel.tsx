"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

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
  assignedClassNames: string[];
  assignedStudentNames: string[];
}

export function ListeningAssignPanel({
  setId,
  classes,
  assignedClassNames,
  assignedStudentNames,
}: ListeningAssignPanelProps) {
  const router = useRouter();
  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const [studentSearch, setStudentSearch] = useState("");
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [studentId, setStudentId] = useState("");
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadStudents = useCallback(async (query: string) => {
    setStudentsLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (query.trim()) params.set("q", query.trim());
      const res = await fetch(`/api/listening/student-options?${params}`);
      const data = (await res.json()) as {
        ok?: boolean;
        students?: StudentOption[];
      };
      if (data.ok && data.students) {
        setStudents(data.students);
        if (data.students.length > 0 && !data.students.some((s) => s.id === studentId)) {
          setStudentId(data.students[0]!.id);
        }
      }
    } finally {
      setStudentsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    const t = setTimeout(() => {
      void loadStudents(studentSearch);
    }, 300);
    return () => clearTimeout(t);
  }, [studentSearch, loadStudents]);

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
          해당 반 소속 학생만 목록에 보입니다.
        </p>
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
          이름으로 검색 후 배정합니다. (전체 학생 목록을 미리 불러오지 않습니다)
        </p>
        {assignedStudentNames.length > 0 && (
          <p className="mt-2 text-xs text-slate-600">
            배정된 학생: {assignedStudentNames.join(", ")}
          </p>
        )}
        <div className="mt-3 space-y-2">
          <input
            type="search"
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            placeholder="학생 이름 검색"
            className="w-full max-w-xs rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          {studentsLoading ? (
            <p className="text-xs text-slate-500">검색 중…</p>
          ) : students.length === 0 ? (
            <p className="text-sm text-slate-500">검색 결과가 없습니다.</p>
          ) : (
            <div className="flex flex-wrap items-end gap-2">
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
                disabled={busy || !studentId}
                onClick={assignStudent}
                className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                학생에게 배정
              </button>
            </div>
          )}
        </div>
      </div>

      {message && <p className="text-sm text-slate-600">{message}</p>}
    </section>
  );
}

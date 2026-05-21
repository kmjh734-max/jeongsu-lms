"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export interface ClassWithStudents {
  id: string;
  name: string;
  students: { id: string; name: string }[];
}

export interface FolderAssignmentRow {
  id: string;
  set_id: string;
  student_id: string;
  class_id: string;
  set_title: string;
  student_name: string;
  class_name: string;
}

interface FolderAssignPanelProps {
  folderId: string;
  setCount: number;
  classes: ClassWithStudents[];
  assignments: FolderAssignmentRow[];
  onAssignToClass: (
    folderId: string,
    classId: string
  ) => Promise<{ ok: boolean; message: string }>;
  onAssignToStudents: (
    folderId: string,
    classId: string,
    studentIds: string[]
  ) => Promise<{ ok: boolean; message: string }>;
  onRemoveAssignment: (
    assignmentId: string,
    folderId: string
  ) => Promise<{ ok: boolean; message: string }>;
}

export function FolderAssignPanel({
  folderId,
  setCount,
  classes,
  assignments,
  onAssignToClass,
  onAssignToStudents,
  onRemoveAssignment,
}: FolderAssignPanelProps) {
  const router = useRouter();
  const [classId, setClassId] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selectedClass = classes.find((c) => c.id === classId);
  const students = selectedClass?.students ?? [];

  const groupedAssignments = useMemo(() => {
    const map = new Map<
      string,
      {
        student_name: string;
        class_name: string;
        items: FolderAssignmentRow[];
      }
    >();
    for (const a of assignments) {
      const key = `${a.student_id}:${a.class_id}`;
      const entry = map.get(key) ?? {
        student_name: a.student_name,
        class_name: a.class_name,
        items: [],
      };
      entry.items.push(a);
      map.set(key, entry);
    }
    return [...map.values()];
  }, [assignments]);

  function handleClassChange(nextClassId: string) {
    setClassId(nextClassId);
    setSelectedStudents(new Set());
  }

  function toggleStudent(id: string) {
    setSelectedStudents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllStudents() {
    setSelectedStudents(new Set(students.map((s) => s.id)));
  }

  async function handleAssignClass() {
    if (!classId) return;
    setLoading(true);
    setMessage(null);
    const result = await onAssignToClass(folderId, classId);
    setMessage(result.message);
    if (result.ok) router.refresh();
    setLoading(false);
  }

  async function handleAssignStudents() {
    if (!classId || selectedStudents.size === 0) return;
    setLoading(true);
    setMessage(null);
    const result = await onAssignToStudents(
      folderId,
      classId,
      [...selectedStudents]
    );
    setMessage(result.message);
    if (result.ok) {
      setSelectedStudents(new Set());
      router.refresh();
    }
    setLoading(false);
  }

  async function handleRemove(assignmentId: string) {
    if (!confirm("이 배정을 해제할까요?")) return;
    setLoading(true);
    const result = await onRemoveAssignment(assignmentId, folderId);
    setMessage(result.message);
    if (result.ok) router.refresh();
    setLoading(false);
  }

  if (setCount === 0) {
    return (
      <p className="text-sm text-slate-500">
        이 폴더에 단어장이 없어 배정할 수 없습니다. 위에서 단어세트를 먼저
        만드세요.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-slate-600">
        이 폴더의 단어장 <strong>{setCount}개</strong>를 반 또는 학생에게
        배정합니다. 배정된 학생만 단어 학습 메뉴에서 볼 수 있습니다.
      </p>

      {classes.length === 0 ? (
        <p className="text-sm text-amber-700">
          등록된 반이 없습니다. 반 관리에서 반을 먼저 만드세요.
        </p>
      ) : (
        <>
          <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-5">
            <h3 className="font-semibold text-slate-900">반 전체에 배정</h3>
            <p className="mt-1 text-sm text-slate-600">
              선택한 반의 모든 학생에게 이 폴더의 단어장을 한 번에 배정합니다.
            </p>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <div className="min-w-[200px] flex-1">
                <label className="ui-label">반 선택</label>
                <select
                  className="ui-select"
                  value={classId}
                  onChange={(e) => handleClassChange(e.target.value)}
                >
                  <option value="">반 선택</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.students.length}명)
                    </option>
                  ))}
                </select>
              </div>
              <Button
                type="button"
                disabled={
                  loading ||
                  !classId ||
                  (selectedClass?.students.length ?? 0) === 0
                }
                onClick={handleAssignClass}
              >
                {loading ? "배정 중..." : "반 전체 배정"}
              </Button>
            </div>
            {classId && students.length === 0 && (
              <p className="mt-2 text-sm text-slate-500">
                이 반에 등록된 학생이 없습니다.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold text-slate-900">학생 선택 배정</h3>
            <p className="mt-1 text-sm text-slate-600">
              반을 고른 뒤 배정할 학생만 골라서 단어장을 넣습니다.
            </p>
            <div className="mt-4">
              <label className="ui-label">반 선택</label>
              <select
                className="ui-select max-w-md"
                value={classId}
                onChange={(e) => handleClassChange(e.target.value)}
              >
                <option value="">반 선택</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            {classId && students.length > 0 && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={selectAllStudents}
                  >
                    전체 선택
                  </Button>
                  <span className="text-sm text-slate-500">
                    {selectedStudents.size}명 선택
                  </span>
                </div>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {students.map((s) => (
                    <li key={s.id}>
                      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-100 px-3 py-2 hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={selectedStudents.has(s.id)}
                          onChange={() => toggleStudent(s.id)}
                          className="rounded border-slate-300"
                        />
                        <span className="text-sm text-slate-800">{s.name}</span>
                      </label>
                    </li>
                  ))}
                </ul>
                <Button
                  type="button"
                  disabled={loading || selectedStudents.size === 0}
                  onClick={handleAssignStudents}
                >
                  {loading ? "배정 중..." : "선택 학생에게 배정"}
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {message && (
        <p className="text-sm text-slate-700" role="status">
          {message}
        </p>
      )}

      <div>
        <h3 className="font-semibold text-slate-900">배정 현황</h3>
        {groupedAssignments.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            아직 배정된 학생이 없습니다.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {groupedAssignments.map((group) => (
              <li
                key={`${group.student_name}-${group.class_name}`}
                className="rounded-lg border border-slate-200 bg-slate-50/80 p-4"
              >
                <p className="font-medium text-slate-900">
                  {group.student_name}
                  <span className="ml-2 text-sm font-normal text-slate-500">
                    {group.class_name}
                  </span>
                </p>
                <ul className="mt-2 space-y-1">
                  {group.items.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="text-slate-700">{a.set_title}</span>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        disabled={loading}
                        onClick={() => handleRemove(a.id)}
                      >
                        해제
                      </Button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

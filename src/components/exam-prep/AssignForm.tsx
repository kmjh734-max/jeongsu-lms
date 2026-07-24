"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { SearchableTreePicker } from "@/components/ui/SearchableTreePicker";
import { createAssignmentAction } from "@/lib/exam-prep/staff-actions";
import { findLeafLabel, type TreeNode } from "@/lib/ui/tree-types";

export function AssignForm({
  basePath,
  workbooks,
  studentTree,
  classes,
}: {
  basePath: string;
  workbooks: { id: string; title: string }[];
  studentTree: TreeNode[];
  classes: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [workbookId, setWorkbookId] = useState(workbooks[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [pickedStudent, setPickedStudent] = useState("");
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const [classIds, setClassIds] = useState<string[]>([]);
  const [dueAt, setDueAt] = useState("");
  const [teacherMessage, setTeacherMessage] = useState("");
  const [allowDuplicate, setAllowDuplicate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function addStudent(id: string) {
    if (!id) return;
    setStudentIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setPickedStudent("");
  }

  function toggleClass(id: string) {
    setClassIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const result = await createAssignmentAction({
      workbook_id: workbookId,
      title,
      student_ids: studentIds,
      class_ids: classIds,
      due_at: dueAt ? new Date(dueAt).toISOString() : null,
      teacher_message: teacherMessage || null,
      allow_duplicate: allowDuplicate,
    });
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setMessage(`${result.studentCount}명에게 배정되었습니다.`);
    router.push(`${basePath}/assignments`);
    router.refresh();
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

  return (
    <form onSubmit={handleSubmit} className="ui-section-card space-y-4">
      <label className="block text-sm font-medium text-slate-700">
        승인된 워크북
        <select
          required
          className={inputClass}
          value={workbookId}
          onChange={(e) => setWorkbookId(e.target.value)}
        >
          {workbooks.length === 0 && (
            <option value="">승인된 워크북 없음</option>
          )}
          {workbooks.map((w) => (
            <option key={w.id} value={w.id}>
              {w.title}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-medium text-slate-700">
        배정 제목
        <input
          required
          className={inputClass}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>

      {studentTree.length > 0 && (
        <div className="space-y-2">
          <SearchableTreePicker
            label="학생 추가"
            tree={studentTree}
            value={pickedStudent}
            onChange={addStudent}
            searchPlaceholder="학생·반 검색"
            emptyLabel="학생 선택"
          />
          {studentIds.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {studentIds.map((id) => (
                <li
                  key={id}
                  className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-700"
                >
                  {findLeafLabel(studentTree, id) ?? id}
                  <button
                    type="button"
                    className="text-slate-500 hover:text-red-600"
                    onClick={() =>
                      setStudentIds((prev) => prev.filter((s) => s !== id))
                    }
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <fieldset>
        <legend className="text-sm font-medium text-slate-700">반 선택</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {classes.map((c) => (
            <label
              key={c.id}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                checked={classIds.includes(c.id)}
                onChange={() => toggleClass(c.id)}
              />
              {c.name}
            </label>
          ))}
          {classes.length === 0 && (
            <p className="text-sm text-slate-500">등록된 반이 없습니다.</p>
          )}
        </div>
      </fieldset>

      <label className="block text-sm font-medium text-slate-700">
        마감일
        <input
          type="datetime-local"
          className={inputClass}
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        교사 메시지
        <textarea
          rows={3}
          className={inputClass}
          value={teacherMessage}
          onChange={(e) => setTeacherMessage(e.target.value)}
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={allowDuplicate}
          onChange={(e) => setAllowDuplicate(e.target.checked)}
        />
        동일 워크북 재배정 허용
      </label>

      {message && (
        <p
          className={`text-sm ${
            message.includes("배정") ? "text-green-700" : "text-red-600"
          }`}
          role="status"
        >
          {message}
        </p>
      )}

      <Button
        type="submit"
        disabled={
          loading ||
          !workbookId ||
          (studentIds.length === 0 && classIds.length === 0)
        }
      >
        {loading ? "배정 중..." : "배정하기"}
      </Button>
    </form>
  );
}

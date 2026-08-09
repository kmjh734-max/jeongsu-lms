"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { matchesSearch as fieldMatchesSearch } from "@/lib/ui/filter-by-search";

const fieldClass =
  "w-full min-h-[3rem] rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
const labelClass = "mb-2 block text-base font-semibold text-slate-800";

export interface ClassWithStudents {
  id: string;
  name: string;
  students: { id: string; name: string }[];
}

export interface AssignableStudent {
  id: string;
  name: string;
  username: string | null;
  classIds: string[];
  classLabel: string;
}

export interface FolderAssignmentRow {
  id: string;
  set_id: string;
  student_id: string;
  class_id: string | null;
  set_title: string;
  student_name: string;
  class_name: string;
}

interface VocabAssignmentPanelProps {
  scopeLabel: string;
  setCount: number;
  setTitles: string[];
  classes: ClassWithStudents[];
  allStudents: AssignableStudent[];
  assignments: FolderAssignmentRow[];
  onAssignToClass: (
    classId: string
  ) => Promise<{ ok: boolean; message: string }>;
  onAssignToStudents: (
    studentIds: string[],
    classId?: string
  ) => Promise<{ ok: boolean; message: string }>;
  onRemoveAssignment: (
    assignmentId: string
  ) => Promise<{ ok: boolean; message: string }>;
}

function studentMatches(
  student: AssignableStudent,
  query: string,
  classNameById: Map<string, string>
): boolean {
  const classNames = student.classIds
    .map((id) => classNameById.get(id))
    .filter(Boolean) as string[];
  return fieldMatchesSearch(
    query,
    student.name,
    student.username,
    student.classLabel,
    ...classNames
  );
}

export function VocabAssignmentPanel({
  scopeLabel,
  setCount,
  setTitles,
  classes,
  allStudents,
  assignments,
  onAssignToClass,
  onAssignToStudents,
  onRemoveAssignment,
}: VocabAssignmentPanelProps) {
  const router = useRouter();
  const [classId, setClassId] = useState("");
  const [classSearch, setClassSearch] = useState("");
  const [search, setSearch] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isFolderScope = setCount > 1;
  const classNameById = useMemo(
    () => new Map(classes.map((c) => [c.id, c.name])),
    [classes]
  );

  const filteredClasses = useMemo(() => {
    if (!classSearch.trim()) return classes;
    return classes.filter((c) => fieldMatchesSearch(classSearch, c.name));
  }, [classes, classSearch]);

  const filteredStudents = useMemo(() => {
    let list = allStudents.filter((s) =>
      studentMatches(s, search, classNameById)
    );
    if (classId) {
      const selectedClassName = classNameById.get(classId) ?? "";
      list = list.filter(
        (s) =>
          s.classIds.includes(classId) ||
          (selectedClassName &&
            s.classLabel
              .toLowerCase()
              .includes(selectedClassName.toLowerCase()))
      );
    }
    return list.sort((a, b) => a.name.localeCompare(b.name, "ko"));
  }, [allStudents, search, classId, classNameById]);

  const selectedStudentDetails = useMemo(
    () => allStudents.filter((s) => selectedStudents.has(s.id)),
    [allStudents, selectedStudents]
  );

  const groupedAssignments = useMemo(() => {
    const map = new Map<
      string,
      {
        student_id: string;
        student_name: string;
        class_name: string;
        items: FolderAssignmentRow[];
      }
    >();
    for (const a of assignments) {
      const key = a.student_id;
      const entry = map.get(key) ?? {
        student_id: a.student_id,
        student_name: a.student_name,
        class_name: a.class_name,
        items: [],
      };
      entry.items.push(a);
      map.set(key, entry);
    }
    return [...map.values()].sort((a, b) =>
      a.student_name.localeCompare(b.student_name, "ko")
    );
  }, [assignments]);

  function handleClassChange(next: string) {
    setClassId(next);
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

  function selectAllVisible() {
    setSelectedStudents(new Set(filteredStudents.map((s) => s.id)));
  }

  function clearSelection() {
    setSelectedStudents(new Set());
  }

  async function handleAssignClass() {
    if (!classId) {
      setMessage("반을 선택해 주세요.");
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const result = await onAssignToClass(classId);
      setMessage(result.message);
      if (result.ok) router.refresh();
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "배정 요청에 실패했습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요."
      );
    }
    setLoading(false);
  }

  async function handleAssignStudents() {
    if (selectedStudents.size === 0) {
      setMessage("배정할 학생을 선택해 주세요.");
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const result = await onAssignToStudents(
        [...selectedStudents],
        classId || undefined
      );
      setMessage(result.message);
      if (result.ok) {
        setSelectedStudents(new Set());
        router.refresh();
      }
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "배정 요청에 실패했습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요."
      );
    }
    setLoading(false);
  }

  async function handleRemoveGroup(items: FolderAssignmentRow[]) {
    if (items.length === 0) return;
    const label =
      items.length > 1
        ? `${items[0]!.student_name}의 배정 ${items.length}개를 모두 해제할까요?`
        : "이 배정을 해제할까요?";
    if (!confirm(label)) return;
    setLoading(true);
    try {
      let lastMessage = "";
      let ok = true;
      for (const item of items) {
        const result = await onRemoveAssignment(item.id);
        lastMessage = result.message;
        if (!result.ok) {
          ok = false;
          break;
        }
      }
      setMessage(lastMessage);
      if (ok) router.refresh();
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "배정 해제에 실패했습니다."
      );
    }
    setLoading(false);
  }

  if (setCount === 0) {
    return (
      <p className="text-base text-slate-500">
        배정할 단어장이 없습니다. 먼저 단어세트를 만드세요.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-base text-slate-600">
          <strong>{scopeLabel}</strong>
          {isFolderScope ? (
            <>
              {" "}
              — 폴더 배정 · 단어세트 <strong>{setCount}개</strong>
            </>
          ) : (
            <>
              {" "}
              — 단어장 <strong>{setTitles[0] ?? "1개"}</strong>
            </>
          )}
        </p>
        {isFolderScope ? (
          <p className="mt-2 text-sm text-slate-500">
            폴더 안 세트 {setCount}개가 선택한 반·학생에게 함께 배정됩니다.
          </p>
        ) : null}
      </div>

      <div className="rounded-xl border-2 border-violet-200 bg-violet-50/40 p-6 sm:p-8">
        <h3 className="text-lg font-bold text-slate-900">배정하기</h3>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <label className={labelClass}>반 검색</label>
            <input
              className={fieldClass}
              value={classSearch}
              onChange={(e) => setClassSearch(e.target.value)}
              placeholder="반 이름 입력"
              autoComplete="off"
            />
            <label className={`${labelClass} mt-4`}>반 선택 (선택 사항)</label>
            <select
              className={fieldClass}
              value={classId}
              onChange={(e) => handleClassChange(e.target.value)}
            >
              <option value="">선택 안 함 — 전체 학생 검색</option>
              {filteredClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (학생 {c.students.length}명)
                </option>
              ))}
            </select>
            {classSearch.trim() && filteredClasses.length === 0 ? (
              <p className="mt-2 text-sm text-amber-700">
                검색된 반이 없습니다.
              </p>
            ) : null}
            {classId && (
              <Button
                type="button"
                className="mt-4 w-full sm:w-auto"
                disabled={loading}
                onClick={handleAssignClass}
              >
                {loading ? "배정 중..." : "선택한 반 전체에 배정"}
              </Button>
            )}
          </div>

          <div>
            <label className={labelClass}>학생 검색</label>
            <input
              className={fieldClass}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이름 · 아이디 · 반 이름"
              autoComplete="off"
            />
            <p className="mt-2 text-sm text-slate-500">
              반을 선택하지 않아도 전체 학생 중 검색할 수 있습니다.
              {allStudents.length > 0
                ? ` (등록 학생 ${allStudents.length}명)`
                : ""}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className={labelClass}>
              학생 선택
              {filteredStudents.length > 0 ? (
                <span className="ml-2 text-sm font-normal text-slate-500">
                  {filteredStudents.length}명
                </span>
              ) : null}
            </label>
            {filteredStudents.length > 0 && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={selectAllVisible}
                >
                  목록 전체 선택
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                >
                  선택 해제
                </Button>
              </div>
            )}
          </div>

          {filteredStudents.length === 0 ? (
            <p className="mt-3 rounded-lg border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-base text-slate-500">
              {allStudents.length === 0
                ? "등록된 학생이 없습니다."
                : classId
                  ? "이 반에 해당하는 학생이 없거나 검색 결과가 없습니다. 반 선택을 해제해 보세요."
                  : "검색 결과가 없습니다."}
            </p>
          ) : (
            <ul className="mt-3 grid max-h-[22rem] gap-3 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
              {filteredStudents.map((s) => {
                const checked = selectedStudents.has(s.id);
                return (
                  <li key={s.id}>
                    <label
                      className={`flex min-h-[3.25rem] cursor-pointer flex-col gap-0.5 rounded-xl border-2 px-4 py-3 transition ${
                        checked
                          ? "border-violet-500 bg-violet-50"
                          : "border-slate-200 bg-white hover:border-violet-300"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleStudent(s.id)}
                          className="h-5 w-5 shrink-0 rounded border-slate-300"
                        />
                        <span className="text-base font-medium text-slate-900">
                          {s.name}
                        </span>
                      </span>
                      <span className="pl-8 text-xs text-slate-500">
                        {s.username ? `@${s.username} · ` : ""}
                        {s.classLabel}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}

          {selectedStudentDetails.length > 0 && (
            <div className="mt-4 rounded-lg border border-violet-200 bg-white p-4">
              <p className="text-sm font-semibold text-violet-800">
                선택된 학생 ({selectedStudentDetails.length}명)
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {selectedStudentDetails.map((s) => s.name).join(", ")}
              </p>
            </div>
          )}

          <Button
            type="button"
            className="mt-5 w-full sm:w-auto"
            disabled={loading || selectedStudents.size === 0}
            onClick={handleAssignStudents}
          >
            {loading
              ? "배정 중..."
              : `선택한 학생 ${selectedStudents.size}명에게 배정`}
          </Button>
        </div>
      </div>

      {message && (
        <p className="text-base text-slate-700" role="status">
          {message}
        </p>
      )}

      <div>
        <h3 className="text-lg font-semibold text-slate-900">배정 현황</h3>
        {groupedAssignments.length === 0 ? (
          <p className="mt-2 text-base text-slate-500">
            아직 배정된 학생이 없습니다.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {groupedAssignments.map((group) => {
              const setN = group.items.length;
              const summary = isFolderScope
                ? `${scopeLabel} · 세트 ${setN}개`
                : group.items[0]?.set_title ?? "단어장";
              return (
                <li
                  key={group.student_id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-slate-900">
                      {group.student_name}
                      {group.class_name && group.class_name !== "—" && (
                        <span className="ml-2 text-sm font-normal text-slate-500">
                          {group.class_name}
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{summary}</p>
                  </div>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    disabled={loading}
                    onClick={() => handleRemoveGroup(group.items)}
                  >
                    {setN > 1 ? "전체 해제" : "해제"}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

/** @deprecated VocabAssignmentPanel 사용 */
export const FolderAssignPanel = VocabAssignmentPanel;

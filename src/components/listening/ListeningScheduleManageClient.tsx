"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ListeningScheduleAddSetsModal } from "@/components/listening/ListeningScheduleAddSetsModal";
import { ListeningScheduleAssignModal } from "@/components/listening/ListeningScheduleAssignModal";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import type { ScheduleAssignmentListItem } from "@/lib/listening/schedule/list-assignments";

interface ClassOption {
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

interface StudentOption {
  id: string;
  name: string;
}

type ViewFilter = "all" | "class" | "student";

function summarizeSetTitles(titles: string[], setCount: number): string {
  const n = titles.length > 0 ? titles.length : setCount;
  if (n <= 0) return "세트 없음";
  if (titles.length === 0) return `세트 ${n}개`;
  if (titles.length === 1) return titles[0]!;
  if (titles.length === 2) return `${titles[0]}, ${titles[1]}`;
  return `${titles[0]} 외 ${titles.length - 1}개`;
}

interface ListeningScheduleManageClientProps {
  basePath: "/admin/listening" | "/teacher/listening";
  classes: ClassOption[];
  sets: SetOption[];
  folders?: FolderOption[];
  initialAssignments?: ScheduleAssignmentListItem[];
  initialStudents?: StudentOption[];
}

export function ListeningScheduleManageClient({
  basePath,
  classes,
  sets,
  folders = [],
  initialAssignments = [],
  initialStudents = [],
}: ListeningScheduleManageClientProps) {
  const [items, setItems] = useState<ScheduleAssignmentListItem[]>(
    initialAssignments
  );
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [viewFilter, setViewFilter] = useState<ViewFilter>("all");
  const [filterClassId, setFilterClassId] = useState("");
  const [filterStudentId, setFilterStudentId] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [addSetsTarget, setAddSetsTarget] =
    useState<ScheduleAssignmentListItem | null>(null);
  const [expandedSetIds, setExpandedSetIds] = useState<Set<string>>(
    () => new Set()
  );
  const [assignPreset, setAssignPreset] = useState<{
    targetType?: "class" | "student";
    targetClassId?: string;
    targetStudentId?: string;
  }>({});

  const requestIdRef = useRef(0);
  const hasInitialData = initialAssignments.length > 0;

  const load = useCallback(async (options?: { silent?: boolean }) => {
    const requestId = ++requestIdRef.current;
    if (!options?.silent) {
      setRefreshing(true);
    }
    setError(null);

    try {
      const res = await fetch("/api/listening/schedule-assignments");
      const data = (await res.json()) as {
        ok?: boolean;
        assignments?: ScheduleAssignmentListItem[];
        message?: string;
      };

      if (requestId !== requestIdRef.current) return;

      if (!data.ok) {
        setError(data.message ?? "목록을 불러오지 못했습니다.");
        return;
      }
      setItems(data.assignments ?? []);
    } finally {
      if (requestId === requestIdRef.current) {
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!hasInitialData) {
      void load();
    }
  }, [hasInitialData, load]);

  const studentSelectOptions = useMemo(
    () =>
      initialStudents.map((s) => ({
        value: s.id,
        label: s.name,
      })),
    [initialStudents]
  );

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (viewFilter === "class") {
        if (item.targetType !== "class") return false;
        if (filterClassId && item.targetClassId !== filterClassId) return false;
      }
      if (viewFilter === "student") {
        if (item.targetType !== "student") return false;
        if (filterStudentId && item.targetStudentId !== filterStudentId) {
          return false;
        }
      }
      return true;
    });
  }, [items, viewFilter, filterClassId, filterStudentId]);

  const activeCount = items.filter((i) => i.isActive).length;
  const initialLoading = refreshing && items.length === 0;

  async function setActive(id: string, isActive: boolean, title: string) {
    const msg = isActive
      ? `「${title}」 스케줄 과제를 다시 활성화할까요?`
      : `「${title}」 스케줄 배정을 취소(비활성화)할까요?\n학생에게 더 이상 새 과제가 배정되지 않습니다.`;
    if (!window.confirm(msg)) return;

    setBusyId(id);
    const res = await fetch(`/api/listening/schedule-assignments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    const data = (await res.json()) as { ok?: boolean; message?: string };
    setBusyId(null);
    if (!data.ok) {
      setError(data.message ?? "처리 실패");
      return;
    }
    void load({ silent: true });
  }

  async function removeAssignment(id: string, title: string) {
    if (
      !window.confirm(
        `「${title}」 과제를 완전히 삭제할까요?\n연결된 일일 과제 기록도 함께 삭제됩니다.`
      )
    ) {
      return;
    }
    setBusyId(id);
    const res = await fetch(`/api/listening/schedule-assignments/${id}`, {
      method: "DELETE",
    });
    const data = (await res.json()) as { ok?: boolean; message?: string };
    setBusyId(null);
    if (!data.ok) {
      setError(data.message ?? "삭제 실패");
      return;
    }
    void load({ silent: true });
  }

  async function addSetsToAssignment(
    assignmentId: string,
    setIds: string[]
  ): Promise<void> {
    const res = await fetch(
      `/api/listening/schedule-assignments/${assignmentId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addSetIds: setIds }),
      }
    );
    const data = (await res.json()) as { ok?: boolean; message?: string };
    if (!data.ok) {
      throw new Error(data.message ?? "세트 추가 실패");
    }
    void load({ silent: true });
  }

  function openAssignModal(preset?: {
    targetType?: "class" | "student";
    targetClassId?: string;
    targetStudentId?: string;
  }) {
    setAssignPreset(preset ?? {});
    setShowAssignModal(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-violet-50 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-4xl text-white shadow-md"
            aria-hidden
          >
            📅
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">스케줄 과제 관리</h2>
            <p className="mt-1 text-sm text-slate-600">
              반·학생별 듣기 과제를 배정하고 취소합니다. 활성 {activeCount}건
              {refreshing && items.length > 0 ? " · 업데이트 중…" : ""}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => openAssignModal()}
          disabled={sets.length === 0 || classes.length === 0}
          className="rounded-xl bg-indigo-600 px-5 py-3 text-base font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-50"
        >
          + 새 스케줄 배정
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "전체"],
              ["class", "반별"],
              ["student", "학생별"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setViewFilter(value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                viewFilter === value
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {viewFilter === "class" && (
          <label className="text-sm font-medium text-slate-700">
            반 선택
            <select
              value={filterClassId}
              onChange={(e) => setFilterClassId(e.target.value)}
              className="mt-1 block min-w-[160px] rounded-lg border border-slate-200 px-3 py-2"
            >
              <option value="">전체 반</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {viewFilter === "student" && (
          <div className="min-w-[220px]">
            <SearchableSelect
              label="학생 선택"
              value={filterStudentId}
              onChange={setFilterStudentId}
              options={studentSelectOptions}
              searchPlaceholder="학생 이름 검색"
              emptyOptionLabel="전체 학생"
            />
          </div>
        )}

        {viewFilter === "class" && filterClassId && (
          <button
            type="button"
            onClick={() =>
              openAssignModal({
                targetType: "class",
                targetClassId: filterClassId,
              })
            }
            className="rounded-lg border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-800 hover:bg-indigo-100"
          >
            이 반에 배정하기
          </button>
        )}

        {viewFilter === "student" && filterStudentId && (
          <button
            type="button"
            onClick={() =>
              openAssignModal({
                targetType: "student",
                targetStudentId: filterStudentId,
              })
            }
            className="rounded-lg border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-800 hover:bg-indigo-100"
          >
            이 학생에게 배정하기
          </button>
        )}

        <button
          type="button"
          onClick={() => void load()}
          disabled={refreshing}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          새로고침
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {initialLoading ? (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
          <div className="h-24 animate-pulse rounded bg-slate-200" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
          <p className="text-4xl" aria-hidden>
            📋
          </p>
          <p className="mt-3 font-medium text-slate-800">
            등록된 스케줄 과제가 없습니다
          </p>
          <p className="mt-1 text-sm text-slate-600">
            위 「새 스케줄 배정」으로 반 또는 학생에게 과제를 넣어 주세요.
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <p className="text-sm text-slate-500">
          선택한 조건에 맞는 스케줄 과제가 없습니다.
        </p>
      ) : (
        <div className="ui-table-wrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th>과제명</th>
                <th>배정 대상</th>
                <th>듣기 세트</th>
                <th>요일·문항</th>
                <th>기간</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((a) => (
                <tr key={a.id} className={!a.isActive ? "bg-slate-50" : undefined}>
                  <td className="font-medium text-slate-900">{a.title}</td>
                  <td>
                    <span
                      className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${
                        a.targetType === "class"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-violet-100 text-violet-800"
                      }`}
                    >
                      {a.targetLabel}
                    </span>
                  </td>
                  <td className="max-w-[220px] text-sm text-slate-700">
                    <div className="flex flex-col items-start gap-1">
                      {(() => {
                        const expanded = expandedSetIds.has(a.id);
                        const full =
                          a.setTitles.length > 0
                            ? a.setTitles.join(", ")
                            : `세트 ${a.setCount}개`;
                        const summary = summarizeSetTitles(
                          a.setTitles,
                          a.setCount
                        );
                        const canExpand = a.setTitles.length > 2;
                        return (
                          <>
                            <span
                              className="line-clamp-2 break-keep"
                              title={full}
                            >
                              {expanded ? full : summary}
                            </span>
                            <div className="flex flex-wrap items-center gap-1">
                              {canExpand ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedSetIds((prev) => {
                                      const next = new Set(prev);
                                      if (next.has(a.id)) next.delete(a.id);
                                      else next.add(a.id);
                                      return next;
                                    })
                                  }
                                  className="text-xs font-medium text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline"
                                >
                                  {expanded
                                    ? "접기"
                                    : `전체 ${a.setTitles.length}개`}
                                </button>
                              ) : null}
                              {a.isActive &&
                                sets.some((s) => !a.setIds.includes(s.id)) && (
                                  <button
                                    type="button"
                                    disabled={busyId === a.id}
                                    onClick={() => setAddSetsTarget(a)}
                                    className="shrink-0 rounded border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-xs font-medium text-indigo-800 hover:bg-indigo-100 disabled:opacity-50"
                                  >
                                    + 추가
                                  </button>
                                )}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </td>
                  <td className="whitespace-nowrap text-sm">
                    {a.daysLabel}
                    <br />
                    <span className="text-slate-500">
                      하루 {a.questionsPerDay}문항
                    </span>
                  </td>
                  <td className="whitespace-nowrap text-sm text-slate-600">
                    {a.startDate}
                    {a.endDate ? ` ~ ${a.endDate}` : ""}
                  </td>
                  <td>
                    {a.isActive ? (
                      <span className="font-medium text-emerald-700">활성</span>
                    ) : (
                      <span className="font-medium text-slate-500">취소됨</span>
                    )}
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {a.isActive ? (
                        <button
                          type="button"
                          disabled={busyId === a.id}
                          onClick={() => void setActive(a.id, false, a.title)}
                          className="rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-900 hover:bg-amber-100 disabled:opacity-50"
                        >
                          배정 취소
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busyId === a.id}
                          onClick={() => void setActive(a.id, true, a.title)}
                          className="rounded-lg border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
                        >
                          다시 활성화
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={busyId === a.id}
                        onClick={() => void removeAssignment(a.id, a.title)}
                        className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAssignModal && (
        <ListeningScheduleAssignModal
          availableSets={sets}
          folders={folders}
          classes={classes}
          initialTargetType={assignPreset.targetType}
          initialTargetClassId={assignPreset.targetClassId}
          initialTargetStudentId={assignPreset.targetStudentId}
          onClose={() => setShowAssignModal(false)}
          onSuccess={() => {
            setShowAssignModal(false);
            void load({ silent: true });
          }}
        />
      )}

      {addSetsTarget && (
        <ListeningScheduleAddSetsModal
          assignmentTitle={addSetsTarget.title}
          existingSetIds={addSetsTarget.setIds}
          availableSets={sets}
          folders={folders}
          onClose={() => setAddSetsTarget(null)}
          onSubmit={(setIds) => addSetsToAssignment(addSetsTarget.id, setIds)}
        />
      )}
    </div>
  );
}

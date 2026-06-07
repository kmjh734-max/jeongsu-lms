"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ListeningScheduleAssignModal } from "@/components/listening/ListeningScheduleAssignModal";

interface ClassOption {
  id: string;
  name: string;
}

interface SetOption {
  id: string;
  title: string;
}

interface ScheduleAssignmentItem {
  id: string;
  title: string;
  targetType: "class" | "student";
  targetClassId: string | null;
  targetStudentId: string | null;
  targetLabel: string;
  setCount: number;
  setTitles: string[];
  startDate: string;
  endDate: string | null;
  daysLabel: string;
  questionsPerDay: number;
  isActive: boolean;
}

type ViewFilter = "all" | "class" | "student";

interface ListeningScheduleManageClientProps {
  basePath: "/admin/listening" | "/teacher/listening";
  classes: ClassOption[];
  sets: SetOption[];
}

export function ListeningScheduleManageClient({
  basePath,
  classes,
  sets,
}: ListeningScheduleManageClientProps) {
  const [items, setItems] = useState<ScheduleAssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [viewFilter, setViewFilter] = useState<ViewFilter>("all");
  const [filterClassId, setFilterClassId] = useState("");
  const [filterStudentId, setFilterStudentId] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignPreset, setAssignPreset] = useState<{
    targetType?: "class" | "student";
    targetClassId?: string;
    targetStudentId?: string;
  }>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/listening/schedule-assignments");
    const data = (await res.json()) as {
      ok?: boolean;
      assignments?: ScheduleAssignmentItem[];
      message?: string;
    };
    setLoading(false);
    if (!data.ok) {
      setError(data.message ?? "목록을 불러오지 못했습니다.");
      return;
    }
    setItems(data.assignments ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const [studentOptions, setStudentOptions] = useState<
    { id: string; name: string }[]
  >([]);

  useEffect(() => {
    if (viewFilter !== "student") return;
    void (async () => {
      const res = await fetch("/api/listening/student-options?limit=80");
      const data = (await res.json()) as {
        ok?: boolean;
        students?: { id: string; name: string }[];
      };
      if (data.ok && data.students) {
        setStudentOptions(data.students);
      }
    })();
  }, [viewFilter]);

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
    void load();
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
    void load();
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
      <Link
        href={basePath}
        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline"
      >
        ← 듣기 세트 목록
      </Link>

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
          <label className="text-sm font-medium text-slate-700">
            학생 선택
            <select
              value={filterStudentId}
              onChange={(e) => setFilterStudentId(e.target.value)}
              className="mt-1 block min-w-[160px] rounded-lg border border-slate-200 px-3 py-2"
            >
              <option value="">전체 학생</option>
              {studentOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
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
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-slate-600">불러오는 중…</p>
      ) : filteredItems.length === 0 ? (
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
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        a.targetType === "class"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-violet-100 text-violet-800"
                      }`}
                    >
                      {a.targetLabel}
                    </span>
                  </td>
                  <td className="max-w-[200px] text-sm text-slate-700">
                    {a.setTitles.length > 0
                      ? a.setTitles.join(", ")
                      : `세트 ${a.setCount}개`}
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
          classes={classes}
          initialTargetType={assignPreset.targetType}
          initialTargetClassId={assignPreset.targetClassId}
          initialTargetStudentId={assignPreset.targetStudentId}
          onClose={() => setShowAssignModal(false)}
          onSuccess={() => {
            setShowAssignModal(false);
            void load();
          }}
        />
      )}
    </div>
  );
}

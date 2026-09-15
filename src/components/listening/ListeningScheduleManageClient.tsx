"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/layout/NavIcon";
import { ListeningMenu, ListeningMenuItem } from "@/components/listening/ListeningMenu";
import {
  ListeningModuleHeader,
  type ListeningBasePath,
} from "@/components/listening/ListeningModuleHeader";
import { ListeningScheduleAddSetsModal } from "@/components/listening/ListeningScheduleAddSetsModal";
import {
  ListeningScheduleAssignPanel,
  type AssignPanelClass,
  type AssignPanelEditTarget,
  type AssignPanelSet,
  type AssignPanelStudent,
} from "@/components/listening/ListeningScheduleAssignPanel";
import { Button } from "@/components/ui/Button";
import type { ScheduleAssignmentProgress } from "@/lib/listening/load-listening-overview";
import { parseDateOnly } from "@/lib/listening/schedule/days-of-week";
import type { ScheduleAssignmentListItem } from "@/lib/listening/schedule/list-assignments";

type ViewFilter = "all" | "class" | "student";

interface ListeningScheduleManageClientProps {
  basePath: ListeningBasePath;
  classes: AssignPanelClass[];
  sets: AssignPanelSet[];
  folders?: { id: string; name: string }[];
  assignments: ScheduleAssignmentListItem[];
  students: AssignPanelStudent[];
  classStudentCounts: Record<string, number>;
  studentClassNames: Record<string, string>;
  progressByAssignment: Record<string, ScheduleAssignmentProgress>;
  todayIso: string;
  setCount: number;
  /** 세트 화면의 「배정」에서 넘어온 세트 */
  presetSetId?: string;
}

function formatMD(iso: string): string {
  const d = parseDateOnly(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function prettyDays(label: string): string {
  if (label === "월·화·수·목·금") return "월~금";
  if (label === "월·화·수·목·금·토·일") return "매일";
  return label;
}

export function ListeningScheduleManageClient({
  basePath,
  classes,
  sets,
  folders = [],
  assignments,
  students,
  classStudentCounts,
  studentClassNames,
  progressByAssignment,
  todayIso,
  setCount,
  presetSetId,
}: ListeningScheduleManageClientProps) {
  const router = useRouter();
  const [viewFilter, setViewFilter] = useState<ViewFilter>("all");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(Boolean(presetSetId));
  const [panelKey, setPanelKey] = useState(0);
  const [addSetsTarget, setAddSetsTarget] = useState<ScheduleAssignmentListItem | null>(null);
  /** 「수정」으로 연 배정 — 있으면 오른쪽 창이 「배정 수정」 */
  const [editingId, setEditingId] = useState<string | null>(null);

  // 넓은 화면에서는 배정 창을 처음부터 옆에 열어 둔다
  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) setPanelOpen(true);
  }, []);

  const activeCount = assignments.filter((a) => a.isActive).length;
  const classCount = assignments.filter((a) => a.targetType === "class").length;
  const studentCount = assignments.length - classCount;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return assignments.filter((a) => {
      if (viewFilter !== "all" && a.targetType !== viewFilter) return false;
      if (!q) return true;
      return (
        a.targetLabel.toLowerCase().includes(q) ||
        a.setTitles.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [assignments, viewFilter, query]);

  async function setPaused(a: ScheduleAssignmentListItem, pause: boolean) {
    const msg = pause
      ? `「${a.targetLabel}」 과제를 잠시 쉴까요?\n\n쉬는 동안 학생에게 과제가 보이지 않아요. 끝낸 기록은 남고, 다시 시작하면 멈춘 곳부터 이어져요.`
      : `「${a.targetLabel}」 과제를 다시 시작할까요?\n\n오늘부터 다시 나가요.`;
    if (!window.confirm(msg)) return;
    setBusyId(a.id);
    setError(null);
    const res = await fetch(`/api/listening/schedule-assignments/${a.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !pause }),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
    setBusyId(null);
    if (!data.ok) {
      setError(data.message ?? "바꾸지 못했어요.");
      return;
    }
    router.refresh();
  }

  async function removeAssignment(a: ScheduleAssignmentListItem) {
    if (
      !window.confirm(
        `「${a.targetLabel}」 과제를 지울까요?\n날마다 나간 과제 기록도 함께 지워져요.`
      )
    ) {
      return;
    }
    setBusyId(a.id);
    setError(null);
    const res = await fetch(`/api/listening/schedule-assignments/${a.id}`, { method: "DELETE" });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
    setBusyId(null);
    if (!data.ok) {
      setError(data.message ?? "지우지 못했어요.");
      return;
    }
    router.refresh();
  }

  async function addSetsToAssignment(assignmentId: string, setIds: string[]) {
    const res = await fetch(`/api/listening/schedule-assignments/${assignmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addSetIds: setIds }),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
    if (!data.ok) throw new Error(data.message ?? "세트를 더하지 못했어요.");
    router.refresh();
  }

  function openPanel() {
    setEditingId(null);
    setPanelKey((k) => k + 1);
    setPanelOpen(true);
    setNotice(null);
  }

  function subLabelOf(a: ScheduleAssignmentListItem): string {
    return a.targetType === "class"
      ? a.targetClassId && classStudentCounts[a.targetClassId]
        ? `${classStudentCounts[a.targetClassId]}명`
        : "반"
      : (a.targetStudentId && studentClassNames[a.targetStudentId]) || "학생";
  }

  function openEdit(a: ScheduleAssignmentListItem) {
    setEditingId(a.id);
    setPanelKey((k) => k + 1);
    setPanelOpen(true);
    setNotice(null);
    setError(null);
  }

  const editingAssignment = editingId
    ? (assignments.find((a) => a.id === editingId) ?? null)
    : null;
  const editTarget: AssignPanelEditTarget | undefined = editingAssignment
    ? {
        id: editingAssignment.id,
        title: editingAssignment.title,
        targetType: editingAssignment.targetType,
        targetLabel: editingAssignment.targetLabel,
        targetSub: subLabelOf(editingAssignment),
        setIds: editingAssignment.setIds,
        setTitles: editingAssignment.setTitles,
        daysOfWeek: editingAssignment.daysOfWeek,
        questionsPerDay: editingAssignment.questionsPerDay,
        startDate: editingAssignment.startDate,
        endDate: editingAssignment.endDate,
        requireDictationPass: editingAssignment.requireDictationPass,
        dictationPassScore: editingAssignment.dictationPassScore,
        isActive: editingAssignment.isActive,
      }
    : undefined;

  const segments: Array<[ViewFilter, string, number]> = [
    ["all", "전체", assignments.length],
    ["class", "반", classCount],
    ["student", "학생", studentCount],
  ];

  return (
    <div>
      <ListeningModuleHeader
        basePath={basePath}
        setCount={setCount}
        assignCount={activeCount}
        action={
          !panelOpen ? (
            <Button onClick={openPanel}>
              <Icon name="plus" size={16} strokeWidth={2} />
              새로 배정하기
            </Button>
          ) : undefined
        }
      />

      <div
        className={`grid gap-5 ${panelOpen ? "lg:grid-cols-[minmax(0,1fr)_420px]" : ""} lg:items-start`}
      >
        <div className="min-w-0 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex self-start overflow-hidden rounded-md border border-slate-200 bg-white">
              {segments.map(([value, label, count]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setViewFilter(value)}
                  aria-pressed={viewFilter === value}
                  className={`px-3.5 py-[7px] text-[13px] font-semibold transition ${
                    viewFilter === value
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {label} <span className="tabular-nums">{count}</span>
                </button>
              ))}
            </div>
            <label className="relative block sm:w-[200px]">
              <Icon
                name="search"
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="반·학생 찾기"
                aria-label="반·학생 찾기"
                className="ui-input h-9 py-1.5 pl-9"
              />
            </label>
          </div>

          {notice ? (
            <p className="flex items-center gap-2 rounded-md border border-green-100 bg-green-50 px-3 py-2 text-sm text-green-700" role="status">
              <Icon name="check" size={15} strokeWidth={2.4} />
              {notice}
            </p>
          ) : null}
          {error ? (
            <p className="rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
              {error}
            </p>
          ) : null}

          {assignments.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <Icon name="calendar" size={28} className="mx-auto text-slate-300" />
              <p className="mt-3 font-semibold text-slate-800">아직 배정한 과제가 없어요</p>
              <p className="mt-1 text-sm text-slate-500">
                반이나 학생에게 세트를 날마다 나눠 배정해 보세요.
              </p>
              {!panelOpen ? (
                <Button className="mt-4" onClick={openPanel}>
                  <Icon name="plus" size={16} strokeWidth={2} />
                  새로 배정하기
                </Button>
              ) : null}
            </div>
          ) : filtered.length === 0 ? (
            <p className="rounded-lg border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
              조건에 맞는 과제가 없어요.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {filtered.map((a) => (
                <AssignmentCard
                  key={a.id}
                  a={a}
                  sub={subLabelOf(a)}
                  progress={progressByAssignment[a.id]}
                  todayIso={todayIso}
                  busy={busyId === a.id}
                  editing={editTarget?.id === a.id}
                  canAddSets={a.isActive && sets.some((s) => !a.setIds.includes(s.id))}
                  onEdit={() => openEdit(a)}
                  onAddSets={() => setAddSetsTarget(a)}
                  onPause={() => void setPaused(a, true)}
                  onResume={() => void setPaused(a, false)}
                  onDelete={() => void removeAssignment(a)}
                />
              ))}
            </div>
          )}
        </div>

        {panelOpen ? (
          <ListeningScheduleAssignPanel
            key={editTarget ? `edit-${editTarget.id}-${panelKey}` : `new-${panelKey}`}
            classes={classes}
            students={students}
            sets={sets}
            folders={folders}
            initialSetIds={presetSetId && sets.some((s) => s.id === presetSetId) ? [presetSetId] : []}
            editing={editTarget}
            onSaved={(message) => {
              setNotice(message);
              setEditingId(null);
              setPanelKey((k) => k + 1);
              if (!window.matchMedia("(min-width: 1024px)").matches) setPanelOpen(false);
              router.refresh();
            }}
            onClose={() => {
              setEditingId(null);
              setPanelOpen(false);
            }}
            onSuccess={(label) => {
              setNotice(`${label}에게 배정했어요.`);
              setPanelKey((k) => k + 1);
              if (!window.matchMedia("(min-width: 1024px)").matches) setPanelOpen(false);
              router.refresh();
            }}
          />
        ) : null}
      </div>

      {addSetsTarget ? (
        <ListeningScheduleAddSetsModal
          title="세트 더하기"
          description={`「${addSetsTarget.targetLabel}」 과제 뒤에 이어서 나가요.`}
          existingSetIds={addSetsTarget.setIds}
          availableSets={sets}
          folders={folders}
          onClose={() => setAddSetsTarget(null)}
          onSubmit={(setIds) => addSetsToAssignment(addSetsTarget.id, setIds)}
        />
      ) : null}
    </div>
  );
}

function AssignmentCard({
  a,
  sub,
  progress,
  todayIso,
  busy,
  editing,
  canAddSets,
  onEdit,
  onAddSets,
  onPause,
  onResume,
  onDelete,
}: {
  a: ScheduleAssignmentListItem;
  sub: string;
  progress?: ScheduleAssignmentProgress;
  todayIso: string;
  busy: boolean;
  editing: boolean;
  canAddSets: boolean;
  onEdit: () => void;
  onAddSets: () => void;
  onPause: () => void;
  onResume: () => void;
  onDelete: () => void;
}) {
  const titles = a.setTitles.length > 0 ? a.setTitles : [];
  const shown = titles.slice(0, 3);
  const more = Math.max(0, (titles.length || a.setCount) - shown.length);

  let progressLabel: string;
  let pct: number | null = null;
  if (!a.isActive) {
    progressLabel = "잠시 쉬는 중이에요";
  } else if (a.startDate > todayIso) {
    progressLabel = `${formatMD(a.startDate)}에 시작해요`;
  } else if (progress && progress.dueTasks > 0) {
    progressLabel =
      a.startDate === todayIso
        ? "오늘 시작 · 평균 수행"
        : `배정된 날 ${progress.studyDays}일 · 평균 수행`;
    pct = Math.round((progress.completedTasks / progress.dueTasks) * 100);
  } else {
    progressLabel = "아직 나간 과제가 없어요";
  }

  return (
    <article
      className={`flex flex-col gap-2.5 rounded-lg border bg-white px-[18px] py-4 shadow-card ${
        editing ? "border-brand-300 ring-2 ring-brand-100" : "border-slate-200"
      } ${busy ? "opacity-60" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Icon
            name={a.targetType === "class" ? "users" : "usercheck"}
            size={18}
            className="text-brand-700"
          />
          <span className="truncate text-[15px] font-bold text-slate-900">{a.targetLabel || "—"}</span>
          <span className="shrink-0 text-[13px] text-slate-500">{sub}</span>
        </div>
        {a.isActive ? (
          <span className="inline-flex h-[22px] shrink-0 items-center rounded bg-green-50 px-2 text-xs font-semibold text-green-700">
            진행 중
          </span>
        ) : (
          <span className="inline-flex h-[22px] shrink-0 items-center gap-1 rounded bg-slate-100 px-2 text-xs font-semibold text-slate-500">
            <Icon name="pause" size={12} strokeWidth={2.2} />
            쉬는 중
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5" title={titles.join(", ") || undefined}>
        {shown.map((t, i) => (
          <span
            key={`${t}-${i}`}
            className="inline-flex h-6 max-w-[14rem] items-center truncate rounded bg-slate-100 px-2 text-xs font-medium text-slate-700"
          >
            <span className="truncate">{t}</span>
          </span>
        ))}
        {more > 0 ? (
          <span className="inline-flex h-6 items-center rounded bg-slate-100 px-2 text-xs font-medium text-slate-700">
            +{more}
          </span>
        ) : null}
        {titles.length === 0 && a.setCount === 0 ? (
          <span className="text-xs text-slate-400">세트 없음</span>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-slate-700">
        <span className="flex items-center gap-1.5">
          <Icon name="calendar" size={14} className="text-slate-500" />
          {prettyDays(a.daysLabel)} · 하루 {a.questionsPerDay}문항
        </span>
        <span className="tabular-nums">
          {formatMD(a.startDate)} – {a.endDate ? formatMD(a.endDate) : "세트 끝날 때까지"}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-slate-500">
          <span>{progressLabel}</span>
          <span className="font-semibold tabular-nums text-slate-900">
            {pct === null ? "—" : `${pct}%`}
          </span>
        </div>
        <div className="h-[5px] overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-brand-600" style={{ width: `${pct ?? 0}%` }} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="ghost" size="sm" disabled={busy} onClick={onEdit} aria-pressed={editing}>
          <Icon name="edit" size={14} />
          수정
        </Button>
        {canAddSets ? (
          <Button variant="ghost" size="sm" disabled={busy} onClick={onAddSets}>
            세트 더하기
          </Button>
        ) : null}
        {a.isActive ? (
          <Button variant="secondary" size="sm" disabled={busy} onClick={onPause}>
            잠시 쉬기
          </Button>
        ) : (
          <Button variant="secondary" size="sm" disabled={busy} onClick={onResume}>
            다시 시작
          </Button>
        )}
        <ListeningMenu label={`${a.targetLabel} 과제 메뉴`}>
          <ListeningMenuItem icon="trash" danger disabled={busy} onClick={onDelete}>
            과제 지우기
          </ListeningMenuItem>
        </ListeningMenu>
      </div>
    </article>
  );
}

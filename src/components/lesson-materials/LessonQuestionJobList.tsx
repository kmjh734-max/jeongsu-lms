"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/layout/NavIcon";
import type { LessonQuestionJobRow } from "@/lib/lesson-materials/load-library";

const STATUS_LABEL: Record<string, string> = {
  completed: "완료",
  queued: "대기 중",
  pending: "대기 중",
  running: "생성 중",
  processing: "생성 중",
  failed: "일부 실패",
  cancelled: "취소됨",
};

function formatWhen(iso: string): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

function moveRow(rows: LessonQuestionJobRow[], fromId: string, toId: string): LessonQuestionJobRow[] {
  const from = rows.findIndex((r) => r.id === fromId);
  const to = rows.findIndex((r) => r.id === toId);
  if (from < 0 || to < 0 || from === to) return rows;
  const next = [...rows];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved!);
  return next;
}

/**
 * 자료함 "변형문제" 탭: 자료함에서 지문을 골라 "문제 제작"으로 만든 변형문제 목록.
 * 손잡이를 끌어 순서를 바꾸고, 체크해서 여러 개를 한 번에 지운다.
 * 문제지·정답·상세는 변형문제 화면을 새 탭으로 연다.
 */
export function LessonQuestionJobList({
  role,
  jobs,
}: {
  role: "admin" | "teacher";
  jobs: LessonQuestionJobRow[];
}) {
  const base = role === "admin" ? "/admin/question-generator" : "/teacher/question-generator";
  const [rows, setRows] = useState(jobs);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const lastClicked = useRef<string | null>(null);
  const pendingOrder = useRef<string[] | null>(null);
  const orderBusy = useRef(false);

  // 서버에서 새 목록이 오면(새 작업, 새로 고침) 그것으로 바꾸고, 사라진 작업은 선택에서 뺀다.
  const [seen, setSeen] = useState(jobs);
  if (seen !== jobs) {
    setSeen(jobs);
    setRows(jobs);
    const alive = new Set(jobs.map((j) => j.id));
    setSelected((prev) => new Set([...prev].filter((id) => alive.has(id))));
  }

  const allChecked = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const open = (path: string) => window.open(path, "_blank", "noopener,noreferrer");

  function toggleSelect(id: string, shiftKey: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (shiftKey && lastClicked.current) {
        const ids = rows.map((r) => r.id);
        const a = ids.indexOf(lastClicked.current);
        const b = ids.indexOf(id);
        if (a >= 0 && b >= 0) {
          const [from, to] = a < b ? [a, b] : [b, a];
          for (let i = from; i <= to; i++) next.add(ids[i]!);
          lastClicked.current = id;
          return next;
        }
      }
      if (next.has(id)) next.delete(id);
      else next.add(id);
      lastClicked.current = id;
      return next;
    });
  }

  async function persistOrder(next: LessonQuestionJobRow[], before: LessonQuestionJobRow[]) {
    pendingOrder.current = next.map((r) => r.id);
    if (orderBusy.current) return;
    orderBusy.current = true;
    setSavingOrder(true);
    setError(null);
    try {
      while (pendingOrder.current) {
        const orderedIds = pendingOrder.current;
        pendingOrder.current = null;
        const res = await fetch("/api/question-generator/jobs", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderedIds }),
        });
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
        if (!data.ok) {
          setError(data.message ?? "순서를 저장하지 못했습니다.");
          setRows(before);
          pendingOrder.current = null;
          return;
        }
      }
    } catch {
      setError("서버 응답이 늦어 순서를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      setRows(before);
    } finally {
      orderBusy.current = false;
      setSavingOrder(false);
    }
  }

  function dropOn(targetId: string) {
    if (!draggingId || draggingId === targetId) return;
    const before = rows;
    const next = moveRow(rows, draggingId, targetId);
    setRows(next);
    setDraggingId(null);
    setDragOverId(null);
    void persistOrder(next, before);
  }

  async function remove(ids: string[]) {
    if (ids.length === 0) return;
    if (!window.confirm(`선택한 변형문제 ${ids.length}개를 삭제할까요? 만든 문항도 함께 지워지고 되돌릴 수 없습니다.`)) return;
    setError(null);
    setBusyIds(new Set(ids));
    try {
      for (let i = 0; i < ids.length; i += 50) {
        const chunk = ids.slice(i, i + 50);
        const res = await fetch("/api/question-generator/jobs", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: chunk }),
        });
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string; ids?: string[] };
        if (!data.ok) {
          setError(data.message ?? "삭제하지 못했습니다.");
          return;
        }
        const gone = new Set(data.ids ?? chunk);
        setRows((prev) => prev.filter((r) => !gone.has(r.id)));
        setSelected((prev) => new Set([...prev].filter((id) => !gone.has(id))));
      }
    } catch {
      setError("서버 응답이 늦어 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setBusyIds(new Set());
    }
  }

  const link =
    "rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-slate-500 hover:bg-slate-100 disabled:opacity-40";

  return (
    <section className="mt-3">
      <h2 className="mb-2 text-sm font-bold text-slate-800">
        만든 변형문제 <span className="font-semibold text-slate-400">{rows.length}</span>
      </h2>
      {error ? <p className="mb-2 text-xs text-rose-600">{error}</p> : null}
      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
          지문자료 탭에서 지문을 골라 문제 제작을 누르면, 만든 변형문제가 여기에 모입니다.
        </p>
      ) : (
        <>
          <div className="mb-1.5 flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
            <label className="inline-flex items-center gap-2 font-semibold">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={(e) => setSelected(e.target.checked ? new Set(rows.map((r) => r.id)) : new Set())}
              />
              전체 선택
            </label>
            <span className="text-[11px] text-slate-400">
              왼쪽 손잡이를 끌어 순서를 바꾸세요 · Shift + 클릭으로 범위 선택
              {savingOrder ? " · 순서 저장 중…" : ""}
            </span>
            {selected.size > 0 ? (
              <button
                type="button"
                disabled={busyIds.size > 0}
                onClick={() => void remove(rows.filter((r) => selected.has(r.id)).map((r) => r.id))}
                className="ml-auto rounded-md border border-rose-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
              >
                {busyIds.size > 0 ? "삭제 중…" : `선택 삭제 (${selected.size})`}
              </button>
            ) : null}
          </div>
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
            {rows.map((job) => {
              const ready = (job.total_completed ?? 0) > 0;
              const checked = selected.has(job.id);
              const isDragging = draggingId === job.id;
              const isOver = dragOverId === job.id && draggingId !== job.id;
              return (
                <li
                  key={job.id}
                  onDragOver={(e) => {
                    if (!draggingId || draggingId === job.id) return;
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    setDragOverId(job.id);
                  }}
                  onDragLeave={() => setDragOverId((cur) => (cur === job.id ? null : cur))}
                  onDrop={(e) => {
                    e.preventDefault();
                    dropOn(job.id);
                  }}
                  className={`flex items-center gap-2.5 px-2.5 py-1 first:rounded-t-lg last:rounded-b-lg ${
                    checked ? "bg-violet-50" : "bg-white hover:bg-slate-50"
                  } ${isDragging || busyIds.has(job.id) ? "opacity-50" : ""} ${
                    isOver ? "ring-2 ring-inset ring-violet-400" : ""
                  }`}
                >
                  <span
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/job-id", job.id);
                      e.dataTransfer.effectAllowed = "move";
                      setDraggingId(job.id);
                    }}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setDragOverId(null);
                    }}
                    className={`flex h-6 w-5 shrink-0 cursor-grab select-none items-center justify-center rounded border shadow-sm transition-all duration-150 hover:border-violet-300 hover:bg-violet-600 hover:text-white active:scale-95 active:cursor-grabbing ${
                      isDragging
                        ? "border-violet-500 bg-violet-600 text-white"
                        : "border-slate-200 bg-gradient-to-b from-white to-slate-50 text-slate-400"
                    }`}
                    title="끌어서 순서 변경"
                    aria-label={`${job.title} 순서 변경`}
                  >
                    <Icon name="grip" size={12} />
                  </span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => toggleSelect(job.id, (e.nativeEvent as MouseEvent).shiftKey)}
                    onClick={(e) => {
                      if (e.shiftKey) {
                        e.preventDefault();
                        toggleSelect(job.id, true);
                      }
                    }}
                    aria-label={`${job.title} 선택`}
                  />
                  <div className="flex min-w-0 flex-1 items-baseline gap-2">
                    <button
                      type="button"
                      onClick={() => open(`${base}/generations/${job.id}`)}
                      className="min-w-0 truncate text-left text-[13px] font-semibold text-slate-900 hover:text-violet-700 hover:underline"
                      title="새 탭에서 열기"
                    >
                      {job.title}
                    </button>
                    <span className="shrink-0 text-[11px] text-slate-400">
                      지문 {job.project_ids.length}개 · 문항 {job.total_completed ?? 0}
                      {job.total_requested ? `/${job.total_requested}` : ""} ·{" "}
                      {STATUS_LABEL[job.status] ?? job.status} · {formatWhen(job.created_at)}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      disabled={!ready}
                      onClick={() => open(`${base}/generations/${job.id}/print?mode=exam`)}
                      className={link}
                    >
                      문제지
                    </button>
                    <button
                      type="button"
                      disabled={!ready}
                      onClick={() => open(`${base}/generations/${job.id}/print?mode=answers`)}
                      className={link}
                    >
                      정답
                    </button>
                    <button
                      type="button"
                      disabled={busyIds.size > 0}
                      onClick={() => void remove([job.id])}
                      className="rounded-md p-1 text-slate-300 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
                      title="삭제"
                      aria-label={`${job.title} 삭제`}
                    >
                      <Icon name="trash" size={13} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}

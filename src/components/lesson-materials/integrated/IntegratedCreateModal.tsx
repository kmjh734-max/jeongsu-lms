"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createIntegratedDocument } from "@/lib/lesson-materials/document-actions";
import type { LessonMaterialLibraryData } from "@/lib/lesson-materials/load-library";
import {
  INTEGRATED_SECTION_META,
  emptyIntegratedPayload,
  type IntegratedSectionKind,
} from "@/lib/lesson-materials/integrated";
import { koreanMonthDay } from "@/lib/lesson-materials/documents";

type Row = { id: string; title: string; sub: string; projectIds: string[] };

function formatDate(iso: string): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

/**
 * 새 통합자료 생성 창. 제목과 구성 순서를 정하고, 폴더로 걸러 가며 유형별로 넣을 파일을 고른다.
 * 만들면 통합자료 파일을 저장하고 프리뷰(표지·목차·간지 포함)로 간다.
 */
export function IntegratedCreateModal({
  role,
  open,
  onClose,
  data,
  preselectedProjectIds = [],
}: {
  role: "admin" | "teacher";
  open: boolean;
  onClose: () => void;
  data: LessonMaterialLibraryData;
  preselectedProjectIds?: string[];
}) {
  const router = useRouter();
  const base = role === "admin" ? "/admin/lesson-materials" : "/teacher/lesson-materials";
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState<IntegratedSectionKind[]>(() => emptyIntegratedPayload().order);
  const [folder, setFolder] = useState<string>("all");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rowsByKind: Record<IntegratedSectionKind, Row[]> = useMemo(() => {
    const docs = data.documents ?? [];
    const fromDocs = (kind: string): Row[] =>
      docs
        .filter((d) => d.kind === kind)
        .map((d) => ({
          id: d.id,
          title: d.name,
          sub: `지문 ${d.project_ids.length}개 · ${formatDate(d.created_at)}`,
          projectIds: d.project_ids,
        }));
    return {
      lesson_pack: fromDocs("lesson_pack"),
      analysis_report: fromDocs("analysis_report"),
      workbook: fromDocs("workbook"),
      questions: (data.questionJobs ?? []).map((j) => ({
        id: j.id,
        title: j.title,
        sub: `문항 ${j.total_completed ?? 0} · ${formatDate(j.created_at)}`,
        projectIds: j.project_ids,
      })),
    };
  }, [data.documents, data.questionJobs]);

  // 자료함에서 지문을 골라 연 경우: 그 지문으로 만든 파일을 미리 골라 둔다.
  const [selected, setSelected] = useState<Record<IntegratedSectionKind, Set<string>>>(() => {
    const pre = new Set(preselectedProjectIds);
    const pickFor = (rows: Row[]) =>
      new Set(pre.size ? rows.filter((r) => r.projectIds.some((id) => pre.has(id))).map((r) => r.id) : []);
    return {
      lesson_pack: pickFor(rowsByKind.lesson_pack),
      analysis_report: pickFor(rowsByKind.analysis_report),
      questions: pickFor(rowsByKind.questions),
      workbook: pickFor(rowsByKind.workbook),
    };
  });

  const projectsInFolder = useMemo(() => {
    if (folder === "all") return null;
    const all = [...data.projects, ...data.unfiledProjects];
    if (folder === "unfiled") return new Set(data.unfiledProjects.map((p) => p.id));
    const ids = new Set<string>([folder]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const f of data.folders) {
        if (f.parent_id && ids.has(f.parent_id) && !ids.has(f.id)) {
          ids.add(f.id);
          grew = true;
        }
      }
    }
    return new Set(all.filter((p) => p.folder_id && ids.has(p.folder_id)).map((p) => p.id));
  }, [folder, data.projects, data.unfiledProjects, data.folders]);

  const visible = (rows: Row[]) =>
    projectsInFolder ? rows.filter((r) => r.projectIds.some((id) => projectsInFolder.has(id))) : rows;

  if (!open) return null;

  const toggle = (kind: IntegratedSectionKind, id: string) =>
    setSelected((prev) => {
      const next = new Set(prev[kind]);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...prev, [kind]: next };
    });
  const toggleAll = (kind: IntegratedSectionKind, rows: Row[]) =>
    setSelected((prev) => {
      const all = rows.every((r) => prev[kind].has(r.id));
      const next = new Set(prev[kind]);
      for (const r of rows) {
        if (all) next.delete(r.id);
        else next.add(r.id);
      }
      return { ...prev, [kind]: next };
    });
  const move = (i: number, dir: -1 | 1) =>
    setOrder((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });

  async function create() {
    setError(null);
    const total = Object.values(selected).reduce((n, s) => n + s.size, 0);
    if (total === 0) {
      setError("넣을 자료를 하나 이상 골라 주세요.");
      return;
    }
    const payload = emptyIntegratedPayload(title.trim());
    payload.order = order;
    for (const k of Object.keys(selected) as IntegratedSectionKind[]) {
      // 목록에 보이는 순서(최신순)대로 넣는다.
      payload.selections[k] = rowsByKind[k].filter((r) => selected[k].has(r.id)).map((r) => r.id);
    }
    const projectIds = [
      ...new Set(
        (Object.keys(selected) as IntegratedSectionKind[]).flatMap((k) =>
          rowsByKind[k].filter((r) => selected[k].has(r.id)).flatMap((r) => r.projectIds)
        )
      ),
    ];
    setBusy(true);
    try {
      const res = await createIntegratedDocument(role, {
        name: title.trim() || `통합자료_${koreanMonthDay()}`,
        projectIds,
        payload,
      });
      if (!res.ok) {
        setError(res.message);
        return;
      }
      onClose();
      router.push(`${base}/final?doc=${encodeURIComponent(res.id)}`);
    } catch {
      setError("통합자료를 만들지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  const folderCount = (id: string) =>
    [...data.projects, ...data.unfiledProjects].filter((p) =>
      id === "unfiled" ? !p.folder_id : p.folder_id === id
    ).length;

  const column = (kind: IntegratedSectionKind) => {
    const rows = visible(rowsByKind[kind]);
    const meta = INTEGRATED_SECTION_META[kind];
    return (
      <div key={kind} className="flex min-h-0 min-w-0 flex-col rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
          <p className="text-sm font-bold text-slate-900">
            {meta.icon} {meta.title}{" "}
            <span className="font-semibold text-slate-400">({selected[kind].size}개)</span>
          </p>
          <button type="button" onClick={() => toggleAll(kind, rows)} className="text-[11px] font-semibold text-slate-500 hover:text-violet-700">
            전체 선택
          </button>
        </div>
        <ul className="min-h-0 flex-1 divide-y divide-slate-100 overflow-auto">
          {rows.length === 0 ? (
            <li className="px-3 py-6 text-center text-xs text-slate-400">만든 자료가 없습니다.</li>
          ) : (
            rows.map((r) => (
              <li key={r.id}>
                <label className="flex cursor-pointer items-start gap-2 px-3 py-2 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={selected[kind].has(r.id)}
                    onChange={() => toggle(kind, r.id)}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-semibold text-slate-900">{r.title}</span>
                    <span className="block text-[11px] text-slate-500">{r.sub}</span>
                  </span>
                </label>
              </li>
            ))
          )}
        </ul>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="flex h-[88vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-center justify-between bg-violet-50 px-5 py-3">
          <h2 className="text-base font-black text-violet-700">새 통합자료 생성</h2>
          <button type="button" onClick={onClose} className="text-xl leading-none text-slate-400 hover:text-slate-700" aria-label="닫기">
            ×
          </button>
        </header>

        <div className="flex flex-wrap items-start gap-6 border-b border-slate-100 px-5 py-4">
          <label className="block min-w-[280px] flex-1 space-y-1">
            <span className="text-sm font-bold text-slate-800">통합 자료 제목</span>
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
              placeholder="예: 리얼고 1학년 기말대비 1회차"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-800">구성 순서</p>
            <div className="flex flex-wrap gap-2">
              {order.map((k, i) => (
                <span key={k} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1.5 text-sm">
                  <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="px-1 text-slate-500 disabled:opacity-25">
                    ‹
                  </button>
                  <span className="font-bold text-violet-600">{i + 1}</span>
                  <span className="font-bold text-slate-900">{INTEGRATED_SECTION_META[k].title}</span>
                  <button type="button" disabled={i === order.length - 1} onClick={() => move(i, 1)} className="px-1 text-slate-500 disabled:opacity-25">
                    ›
                  </button>
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">왼쪽부터 순서대로 목차와 본문에 배치됩니다.</p>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[180px_repeat(4,minmax(0,1fr))] gap-3 bg-slate-50 p-4">
          <div className="flex min-h-0 flex-col rounded-xl border border-slate-200 bg-white">
            <p className="border-b border-slate-100 px-3 py-2 text-sm font-bold text-slate-900">🗀 폴더</p>
            <ul className="min-h-0 flex-1 overflow-auto p-1.5 text-[13px]">
              {[
                { id: "all", name: "전체 자료", count: data.projects.length + data.unfiledProjects.length },
                { id: "unfiled", name: "미분류", count: folderCount("unfiled") },
                ...data.folders.map((f) => ({ id: f.id, name: f.name, count: folderCount(f.id) })),
              ].map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => setFolder(f.id)}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left ${
                      folder === f.id ? "bg-violet-100 font-semibold text-violet-800" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="truncate">{f.name}</span>
                    <span className="shrink-0 text-[11px] text-slate-400">{f.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {order.map((k) => column(k))}
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-slate-100 px-5 py-3">
          {error ? <p className="mr-auto text-sm text-rose-600">{error}</p> : null}
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">
            취소
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void create()}
            className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {busy ? "만드는 중…" : "통합자료 만들기"}
          </button>
        </footer>
      </div>
    </div>
  );
}

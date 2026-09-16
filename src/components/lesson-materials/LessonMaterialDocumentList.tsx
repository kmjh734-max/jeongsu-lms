"use client";

import { useRef, useState } from "react";
import {
  renameLessonMaterialDocument,
  trashLessonMaterialDocuments,
} from "@/lib/lesson-materials/document-actions";
import {
  documentPagePath,
  type LessonMaterialDocumentKind,
  type LessonMaterialDocumentRow,
} from "@/lib/lesson-materials/documents";

const KIND_LABEL: Record<LessonMaterialDocumentKind, string> = {
  lesson_pack: "수업용 자료",
  analysis_report: "지문 분석서",
  workbook: "워크북",
  integrated: "통합자료",
  one_page_summary: "1장 요약직보자료",
  one_page_test: "1장 테스트",
};

const KIND_ICON: Record<LessonMaterialDocumentKind, string> = {
  lesson_pack: "✦",
  analysis_report: "📄",
  workbook: "📘",
  integrated: "🗂",
  one_page_summary: "📃",
  one_page_test: "📝",
};

function formatWhen(iso: string): string {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
  return parts;
}

/**
 * 자료함의 "만든 파일" 목록. 지문자료에서 수업용 자료·분석서·워크북을 만들 때마다
 * 파일이 하나씩 생긴다(수업용자료_0911). 이름을 누르면 열리고, 이름을 바꾸거나
 * 휴지통으로 보낼 수 있다. 체크해서 여러 개를 한 번에 지울 수도 있다.
 */
export function LessonMaterialDocumentList({
  role,
  kind,
  documents,
}: {
  role: "admin" | "teacher";
  kind: LessonMaterialDocumentKind;
  documents: LessonMaterialDocumentRow[];
}) {
  const [rows, setRows] = useState(documents);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const lastClicked = useRef<string | null>(null);

  // 서버에서 새 목록이 오면(새 파일, 새로 고침) 그것으로 바꾸고, 사라진 파일은 선택에서 뺀다.
  const [seen, setSeen] = useState(documents);
  if (seen !== documents) {
    setSeen(documents);
    setRows(documents);
    const alive = new Set(documents.map((d) => d.id));
    setSelected((prev) => new Set([...prev].filter((id) => alive.has(id))));
  }

  const allChecked = rows.length > 0 && rows.every((r) => selected.has(r.id));

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

  function open(id: string) {
    window.open(`${documentPagePath(role, kind)}?doc=${encodeURIComponent(id)}`, "_blank", "noopener,noreferrer");
  }

  async function commitRename(id: string) {
    const name = draft.trim();
    const before = rows.find((r) => r.id === id)?.name ?? "";
    setEditingId(null);
    if (!name || name === before) return;
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, name } : r)));
    setBusyIds(new Set([id]));
    const res = await renameLessonMaterialDocument(role, { id, name });
    setBusyIds(new Set());
    if (!res.ok) {
      setError(res.message);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, name: before } : r)));
      return;
    }
  }

  async function trash(ids: string[], question: string) {
    if (ids.length === 0 || !window.confirm(`${question} 지문 자료는 그대로 남습니다.`)) return;
    setError(null);
    setBusyIds(new Set(ids));
    const res = await trashLessonMaterialDocuments(role, { ids });
    setBusyIds(new Set());
    if (!res.ok) {
      setError(res.message);
      return;
    }
    const gone = new Set(ids);
    setRows((prev) => prev.filter((r) => !gone.has(r.id)));
    setSelected((prev) => new Set([...prev].filter((id) => !gone.has(id))));
  }

  return (
    <section className="mt-3">
      <h2 className="mb-2 text-sm font-bold text-slate-800">
        만든 {KIND_LABEL[kind]} <span className="font-semibold text-slate-400">{rows.length}</span>
      </h2>
      {error ? <p className="mb-2 text-xs text-rose-600">{error}</p> : null}
      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
          지문자료 탭에서 지문을 골라 {KIND_LABEL[kind]} 제작을 누르면 여기에 파일로 저장됩니다.
        </p>
      ) : (
        <>
        <div className="mb-1.5 flex flex-wrap items-center gap-3 rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
          <label className="inline-flex items-center gap-2 font-semibold">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={(e) =>
                setSelected(e.target.checked ? new Set(rows.map((r) => r.id)) : new Set())
              }
            />
            전체 선택
          </label>
          <span className="text-[11px] text-slate-400">Shift + 클릭으로 범위 선택</span>
          {selected.size > 0 ? (
            <button
              type="button"
              disabled={busyIds.size > 0}
              onClick={() =>
                void trash(
                  rows.filter((r) => selected.has(r.id)).map((r) => r.id),
                  `선택한 파일 ${selected.size}개를 삭제할까요?`
                )
              }
              className="ml-auto rounded-md border border-rose-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
            >
              선택 삭제 ({selected.size})
            </button>
          ) : null}
        </div>
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200">
          {rows.map((doc) => (
            <li
              key={doc.id}
              className={`flex items-center gap-2.5 px-3 py-1.5 ${
                selected.has(doc.id) ? "bg-violet-50" : "bg-white hover:bg-slate-50"
              } ${busyIds.has(doc.id) ? "opacity-60" : ""}`}
            >
              <input
                type="checkbox"
                checked={selected.has(doc.id)}
                onChange={(e) => toggleSelect(doc.id, (e.nativeEvent as MouseEvent).shiftKey)}
                onClick={(e) => {
                  if (e.shiftKey) {
                    e.preventDefault();
                    toggleSelect(doc.id, true);
                  }
                }}
                aria-label={`${doc.name} 선택`}
              />
              <span className="text-xs" aria-hidden>
                {KIND_ICON[kind]}
              </span>
              <div className="flex min-w-0 flex-1 items-baseline gap-2">
                {editingId === doc.id ? (
                  <input
                    autoFocus
                    value={draft}
                    maxLength={80}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={() => void commitRename(doc.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void commitRename(doc.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="w-full max-w-md rounded-md border border-violet-300 px-2 py-0.5 text-[13px] font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-violet-200"
                    aria-label="파일 이름"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => open(doc.id)}
                    className="min-w-0 truncate text-left text-[13px] font-semibold text-slate-900 hover:text-violet-700 hover:underline"
                    title="새 탭에서 열기"
                  >
                    {doc.name}
                  </button>
                )}
                <span className="shrink-0 text-[11px] text-slate-400">
                  지문 {doc.project_ids.length}개 · {formatWhen(doc.created_at)}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setDraft(doc.name);
                    setEditingId(doc.id);
                  }}
                  className="rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-slate-500 hover:bg-slate-100"
                >
                  이름 바꾸기
                </button>
                <button
                  type="button"
                  onClick={() => void trash([doc.id], `「${doc.name}」 파일을 삭제할까요?`)}
                  className="rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-rose-600 hover:bg-rose-50"
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
        </>
      )}
    </section>
  );
}

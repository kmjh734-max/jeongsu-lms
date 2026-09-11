"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  renameLessonMaterialDocument,
  trashLessonMaterialDocument,
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
};

const KIND_ICON: Record<LessonMaterialDocumentKind, string> = {
  lesson_pack: "✦",
  analysis_report: "📄",
  workbook: "📘",
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
 * 휴지통으로 보낼 수 있다.
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
  const router = useRouter();
  const [rows, setRows] = useState(documents);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // 서버에서 새 목록이 오면(새 파일, 새로 고침) 그것으로 바꾼다.
  const [seen, setSeen] = useState(documents);
  if (seen !== documents) {
    setSeen(documents);
    setRows(documents);
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
    setBusyId(id);
    const res = await renameLessonMaterialDocument(role, { id, name });
    setBusyId(null);
    if (!res.ok) {
      setError(res.message);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, name: before } : r)));
      return;
    }
    router.refresh();
  }

  async function trash(id: string, name: string) {
    if (!window.confirm(`「${name}」 파일을 삭제할까요? 지문 자료는 그대로 남습니다.`)) return;
    setBusyId(id);
    const res = await trashLessonMaterialDocument(role, { id });
    setBusyId(null);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
    router.refresh();
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
        <ul className="space-y-2">
          {rows.map((doc) => (
            <li
              key={doc.id}
              className={`flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 ${
                busyId === doc.id ? "opacity-60" : ""
              }`}
            >
              <span className="text-base" aria-hidden>
                {KIND_ICON[kind]}
              </span>
              <div className="min-w-0 flex-1">
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
                    className="w-full max-w-md rounded-lg border border-violet-300 px-2 py-1 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-violet-200"
                    aria-label="파일 이름"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => open(doc.id)}
                    className="truncate text-left text-sm font-semibold text-slate-900 hover:text-violet-700 hover:underline"
                    title="새 탭에서 열기"
                  >
                    {doc.name}
                  </button>
                )}
                <p className="mt-0.5 text-xs text-slate-500">
                  지문 {doc.project_ids.length}개 · {formatWhen(doc.created_at)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setDraft(doc.name);
                    setEditingId(doc.id);
                  }}
                  className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  이름 바꾸기
                </button>
                <button
                  type="button"
                  onClick={() => void trash(doc.id, doc.name)}
                  className="rounded-lg px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

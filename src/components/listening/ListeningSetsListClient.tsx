"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export interface ListeningSetListItem {
  id: string;
  title: string;
  is_published: boolean;
  created_at: string;
}

interface ListeningSetsListClientProps {
  sets: ListeningSetListItem[];
  basePath: "/admin/listening" | "/teacher/listening";
}

export function ListeningSetsListClient({
  sets,
  basePath,
}: ListeningSetsListClientProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createSet(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/listening/sets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim() }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      message?: string;
      set?: { id: string };
    };
    setBusy(false);
    if (!data.ok || !data.set?.id) {
      setError(data.message ?? "생성 실패");
      return;
    }
    router.push(`${basePath}/${data.set.id}`);
  }

  async function deleteSet(setId: string, setTitle: string) {
    if (
      !window.confirm(
        `「${setTitle}」 세트와 문항·음원·배정 정보를 모두 삭제합니다. 계속할까요?`
      )
    ) {
      return;
    }
    setDeletingId(setId);
    setError(null);
    const res = await fetch(`/api/listening/sets/${setId}`, { method: "DELETE" });
    const data = (await res.json()) as { ok?: boolean; message?: string };
    setDeletingId(null);
    if (!data.ok) {
      setError(data.message ?? "삭제 실패");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={createSet}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4"
      >
        <label className="flex-1 text-sm font-medium text-slate-700">
          새 듣기 세트 제목
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2"
            placeholder="예: 중1 듣기 연습 1회"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {busy ? "만드는 중…" : "세트 만들기"}
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}

      {sets.length === 0 ? (
        <p className="text-sm text-slate-600">등록된 듣기 세트가 없습니다.</p>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
          {sets.map((set) => (
            <li key={set.id} className="flex items-center gap-2 px-4 py-3">
              <Link
                href={`${basePath}/${set.id}`}
                className="min-w-0 flex-1 hover:text-indigo-700"
              >
                <span className="font-medium text-slate-900">{set.title}</span>
                <span className="ml-2 text-xs text-slate-500">
                  {set.is_published ? "공개" : "비공개"}
                </span>
              </Link>
              <Link
                href={`${basePath}/${set.id}/print`}
                className="shrink-0 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
              >
                출력
              </Link>
              <button
                type="button"
                disabled={deletingId === set.id}
                onClick={() => deleteSet(set.id, set.title)}
                className="shrink-0 rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                {deletingId === set.id ? "삭제 중…" : "삭제"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

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
            <li key={set.id}>
              <Link
                href={`${basePath}/${set.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
              >
                <span className="font-medium text-slate-900">{set.title}</span>
                <span className="text-xs text-slate-500">
                  {set.is_published ? "공개" : "비공개"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

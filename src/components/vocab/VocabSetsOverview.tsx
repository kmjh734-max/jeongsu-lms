"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { VocabSidebarSet } from "@/components/vocab/vocab-sidebar-types";
import { useVocabSidebar } from "@/components/vocab/VocabSidebarContext";

interface VocabSetsOverviewProps {
  role: "admin" | "teacher";
  classesHref: string;
}

export function VocabSetsOverview({ role, classesHref }: VocabSetsOverviewProps) {
  const { folders, sets } = useVocabSidebar();
  const pathname = usePathname();
  const base = role === "admin" ? "/admin/vocab" : "/teacher/vocab";
  const isSetsRoot = pathname === `${base}/sets`;

  if (!isSetsRoot) return null;

  const unfiled = sets.filter((s) => !s.folder_id);
  const setsByFolder = new Map<string, VocabSidebarSet[]>();
  for (const s of sets) {
    if (!s.folder_id) continue;
    const list = setsByFolder.get(s.folder_id) ?? [];
    list.push(s);
    setsByFolder.set(s.folder_id, list);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">단어세트 만들기</h1>
        <p className="mt-2 text-slate-600">
          왼쪽에서 폴더를 선택하거나, 아래 목록에서 바로 이동하세요.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="폴더" value={folders.length} accent="emerald" />
        <StatCard label="단어세트" value={sets.length} accent="violet" />
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">나의 폴더</h2>
          <Link
            href={classesHref}
            className="text-sm font-medium text-brand-600 hover:underline"
          >
            반 관리
          </Link>
        </div>
        {folders.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-slate-500">
            폴더가 없습니다. 왼쪽에서 새 폴더를 만드세요.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {folders.map((folder) => {
              const folderSets = setsByFolder.get(folder.id) ?? [];
              const cardCount = folderSets.reduce(
                (sum, s) => sum + s.item_count,
                0
              );
              return (
                <Link
                  key={folder.id}
                  href={`${base}/folder/${folder.id}`}
                  className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-emerald-300 hover:shadow-md"
                >
                  <div className="bg-gradient-to-r from-[#8fd14f] to-[#7cb518] px-4 py-3">
                    <span className="text-2xl" aria-hidden>
                      📁
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-slate-900 group-hover:text-brand-600">
                      {folder.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      세트 {folderSets.length}개 · {cardCount} 카드
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {unfiled.length > 0 && (
        <section className="rounded-xl border border-amber-200 bg-amber-50/50 p-5">
          <h2 className="font-semibold text-amber-900">
            폴더 없는 단어세트 ({unfiled.length})
          </h2>
          <ul className="mt-3 space-y-2">
            {unfiled.map((s) => (
              <li key={s.id}>
                <Link
                  href={`${base}/set/${s.id}`}
                  className="text-sm font-medium text-brand-600 hover:underline"
                >
                  {s.title} ({s.item_count} 카드)
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "emerald" | "violet";
}) {
  const colors = {
    emerald: "text-emerald-700",
    violet: "text-violet-700",
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className={`text-3xl font-bold ${colors[accent]}`}>{value}</p>
      <p className="mt-1 text-sm text-slate-600">{label}</p>
    </div>
  );
}

"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { useVocabSidebar } from "@/components/vocab/VocabSidebarContext";

interface VocabAssignHubProps {
  role: "admin" | "teacher";
}

/** 사이드바 데이터 재사용 — 서버에서 folders/sets를 다시 치지 않음 */
export function VocabAssignHub({ role }: VocabAssignHubProps) {
  const base = role === "admin" ? "/admin/vocab" : "/teacher/vocab";
  const { folders, sets } = useVocabSidebar();

  const setCountByFolder = new Map<string, number>();
  let unfiledCount = 0;
  for (const s of sets) {
    if (s.folder_id) {
      setCountByFolder.set(
        s.folder_id,
        (setCountByFolder.get(s.folder_id) ?? 0) + 1
      );
    } else {
      unfiledCount += 1;
    }
  }

  const folderItems = folders.map((folder) => ({
    id: folder.id,
    name: folder.name,
    setCount: setCountByFolder.get(folder.id) ?? 0,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="단어세트 배정하기"
        description="폴더·단어세트를 반·학생에게 배정합니다."
      />

      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">폴더별 배정</h2>
          {folderItems.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-slate-500">
              폴더가 없습니다. 「단어세트 만들기」에서 폴더를 먼저 만드세요.
            </p>
          ) : (
            <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
              {folderItems.map((folder) => (
                <li
                  key={folder.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-slate-900">{folder.name}</p>
                    <p className="text-sm text-slate-500">
                      단어세트 {folder.setCount}개
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`${base}/folder/${folder.id}`}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      세트 보기
                    </Link>
                    <Link
                      href={`${base}/folder/${folder.id}?openAssign=1`}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                      배정하기
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {unfiledCount > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">미분류</h2>
            <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
              <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-medium text-slate-900">미분류</p>
                  <p className="text-sm text-slate-500">
                    단어세트 {unfiledCount}개
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`${base}/unfiled`}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    세트 보기
                  </Link>
                  <Link
                    href={`${base}/unfiled?openAssign=1`}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                  >
                    배정하기
                  </Link>
                </div>
              </li>
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

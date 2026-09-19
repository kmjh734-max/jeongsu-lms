"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/layout/NavIcon";

type AnalysisOption = {
  id: string;
  title: string;
  exam: string | null;
  items: number;
  subjective: number;
  created_at: string;
};

/** 수업자료에서 고른 지문으로 동형모의고사: 따라 만들 시험 분석을 고른다 */
export function PickExamForMockModal({
  role,
  projectIds,
  onClose,
}: {
  role: "admin" | "teacher";
  projectIds: string[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [list, setList] = useState<AnalysisOption[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const base = role === "admin" ? "/admin/exam-analysis" : "/teacher/exam-analysis";

  useEffect(() => {
    let alive = true;
    fetch("/api/exam-analysis")
      .then((r) => r.json())
      .then((d: { ok?: boolean; analyses?: AnalysisOption[]; message?: string }) => {
        if (!alive) return;
        if (d.ok) setList(d.analyses ?? []);
        else setError(d.message ?? "목록을 불러오지 못했어요.");
      })
      .catch(() => alive && setError("목록을 불러오지 못했어요."));
    return () => {
      alive = false;
    };
  }, []);

  function pick(id: string) {
    router.push(`${base}/${id}/mock?passages=${encodeURIComponent(projectIds.join(","))}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">어떤 시험을 따라 만들까요?</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              고른 지문 {projectIds.length}개로, 선택한 시험과 같은 번호·유형·난이도·배점의 동형모의고사를 만들어요.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기" className="text-slate-400 hover:text-slate-700">
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="mt-4 max-h-[420px] overflow-y-auto">
          {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          {!list && !error ? <p className="py-6 text-center text-sm text-slate-500">불러오는 중…</p> : null}
          {list && list.length === 0 ? (
            <div className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
              아직 분석한 시험이 없어요.
              <Link href={base} className="mt-2 block font-semibold text-brand-700 hover:underline">
                내신 시험 분석에서 시험지 올리기 →
              </Link>
            </div>
          ) : null}
          <ul className="space-y-2">
            {(list ?? []).map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => pick(a.id)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left hover:border-brand-300 hover:bg-brand-50/40"
                >
                  <span className="min-w-0">
                    <b className="block truncate text-slate-900">{a.title}</b>
                    <span className="text-xs text-slate-500">
                      {[a.exam, `${a.items}문항`, a.subjective ? `서술형 ${a.subjective}` : ""].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-brand-700">고르기 →</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

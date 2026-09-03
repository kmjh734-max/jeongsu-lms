import type { LessonMaterialAnalysisCard } from "@/lib/lesson-materials/generate-organization";

export function LessonMaterialLogicalFlow({
  cards,
  loading,
  onRegenerate,
  regenerating,
}: {
  cards: LessonMaterialAnalysisCard[] | null;
  loading?: boolean;
  onRegenerate?: () => void;
  regenerating?: boolean;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-bold text-violet-700">분석 &amp; 삽화</h3>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {onRegenerate ? (
          <button
            type="button"
            onClick={onRegenerate}
            disabled={regenerating || loading}
            className="rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {regenerating ? "생성 중…" : "논리 흐름 재생성"}
          </button>
        ) : null}
        <span className="text-xs text-slate-500">Logical Flow (논리 흐름)</span>
      </div>

      <div className="mt-4 space-y-5">
        {loading && !cards?.length ? (
          <div className="rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-500">
            논리 흐름을 만드는 중입니다.
          </div>
        ) : null}
        {(cards ?? []).map((row, i) => (
          <div key={`${i}-${row.title}`}>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-violet-700">{i + 1}</span>
              <h4 className="text-sm font-bold text-slate-900">{row.title}</h4>
            </div>
            <div className="mt-2 border-t border-slate-200 pt-2">
              <div className="rounded-lg bg-slate-100 px-4 py-3 text-sm leading-relaxed text-slate-700">
                {row.desc}
              </div>
            </div>
          </div>
        ))}
        {!loading && !cards?.length ? (
          <div className="rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-500">
            아직 논리 흐름이 없습니다.
          </div>
        ) : null}
      </div>
    </section>
  );
}

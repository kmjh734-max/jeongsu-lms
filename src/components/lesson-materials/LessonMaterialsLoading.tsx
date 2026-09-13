/**
 * 자료함(수업자료) 화면을 여는 동안 보여 줄 뼈대. 페이지가 준비될 때까지 화면이 멈춘 듯
 * 보이지 않게, 폴더 목록과 자료 목록 모양을 먼저 그린다.
 */
export function LessonMaterialsLoading() {
  return (
    <div className="flex animate-pulse gap-4">
      <aside className="hidden w-64 shrink-0 space-y-3 rounded-2xl border border-slate-200 bg-white p-4 md:block">
        <div className="h-4 w-24 rounded bg-slate-200" />
        <div className="h-10 rounded-xl bg-violet-50" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 rounded-xl bg-slate-100" />
        ))}
      </aside>
      <main className="min-w-0 flex-1 space-y-3">
        <div className="flex gap-3 border-b border-slate-200 pb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-6 w-16 rounded bg-slate-200" />
          ))}
        </div>
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="h-6 w-40 rounded bg-slate-200" />
          <div className="h-4 w-56 rounded bg-slate-100" />
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-14 rounded-xl border border-slate-100 bg-slate-50" />
          ))}
        </div>
      </main>
    </div>
  );
}

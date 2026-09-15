export function VocabStageLoadingSkeleton() {
  return (
    <div className="flex w-full animate-pulse flex-col gap-6 sm:gap-8">
      <div className="flex flex-col gap-3.5">
        <div className="h-4 w-32 rounded bg-slate-200" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          <div className="flex flex-col gap-1.5 sm:min-w-[220px]">
            <div className="h-3 w-10 rounded bg-slate-200" />
            <div className="h-6 w-28 rounded bg-slate-200" />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-3 w-40 rounded bg-slate-100" />
            <div className="h-2 w-full rounded-full bg-slate-200" />
          </div>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-[640px] flex-col gap-5 sm:mt-6">
        <div className="flex flex-col items-center gap-5 rounded-lg border border-slate-200 bg-white px-6 py-8 shadow-card">
          <div className="h-3 w-44 rounded bg-slate-100" />
          <div className="h-9 w-56 rounded bg-slate-200" />
          <div className="h-14 w-full rounded-lg bg-slate-100" />
        </div>
        <div className="mx-auto h-11 w-full rounded-md bg-slate-200 sm:w-[200px]" />
      </div>
    </div>
  );
}

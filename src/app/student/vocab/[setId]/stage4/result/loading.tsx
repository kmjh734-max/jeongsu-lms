export default function StudentVocabStage4ResultLoading() {
  return (
    <div className="flex w-full animate-pulse flex-col gap-4 sm:gap-5">
      <div className="h-4 w-40 rounded bg-slate-200" />
      <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="flex flex-col gap-3">
          <div className="h-[230px] rounded-lg bg-slate-300" />
          <div className="h-11 rounded-md bg-slate-200" />
        </div>
        <div className="flex flex-col gap-3">
          <div className="h-9 w-48 rounded-md bg-slate-200" />
          <div className="h-72 rounded-lg border border-slate-200 bg-white shadow-card" />
        </div>
      </div>
    </div>
  );
}

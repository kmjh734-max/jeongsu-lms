export default function VocabShellLoading() {
  return (
    <div className="flex animate-pulse gap-4" aria-label="불러오는 중">
      <div className="hidden h-72 w-[216px] shrink-0 rounded-lg bg-slate-200/60 lg:block" />
      <div className="flex-1 space-y-3">
        <div className="h-9 w-full rounded-md bg-slate-200/60" />
        <div className="h-64 w-full rounded-lg bg-slate-200/60" />
      </div>
    </div>
  );
}

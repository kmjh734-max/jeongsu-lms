export default function StudentVocabLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-5 flex flex-col gap-2">
        <div className="h-6 w-28 rounded bg-slate-200" />
        <div className="h-4 w-full max-w-md rounded bg-slate-100" />
      </div>
      <div className="mb-4 flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-16 rounded-md bg-slate-200" />
        ))}
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-card">
        <div className="h-9 border-b border-slate-200 bg-slate-50" />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-5 border-t border-slate-100 px-5 py-4 first:border-t-0"
          >
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 max-w-xs rounded bg-slate-200" />
              <div className="h-3 w-1/2 max-w-[200px] rounded bg-slate-100" />
            </div>
            <div className="hidden h-5 w-32 rounded-full bg-slate-100 md:block" />
            <div className="h-8 w-20 rounded-md bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

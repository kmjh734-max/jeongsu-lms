export default function StudentVocabSetLoading() {
  return (
    <div className="flex animate-pulse flex-col gap-5">
      <div className="flex flex-col gap-2.5">
        <div className="h-4 w-24 rounded bg-slate-200" />
        <div className="h-7 w-48 rounded bg-slate-200" />
        <div className="h-4 w-16 rounded bg-slate-100" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex flex-col gap-3.5 rounded-lg border border-slate-200 bg-white p-5 shadow-card"
          >
            <div className="h-9 w-9 rounded-full bg-slate-100" />
            <div className="space-y-2">
              <div className="h-3 w-10 rounded bg-slate-100" />
              <div className="h-5 w-24 rounded bg-slate-200" />
              <div className="h-3 w-full rounded bg-slate-100" />
            </div>
            <div className="h-10 w-full rounded-md bg-slate-100" />
          </div>
        ))}
      </div>
      <div className="h-48 rounded-lg border border-slate-200 bg-white shadow-card" />
    </div>
  );
}

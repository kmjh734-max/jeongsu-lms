export default function StudentLoading() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="space-y-2">
        <div className="h-7 w-48 rounded-md bg-slate-200" />
        <div className="h-4 w-64 rounded bg-slate-200/70" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 rounded-lg border border-slate-200 bg-white p-5">
            <div className="h-8 w-8 rounded-md bg-slate-100" />
            <div className="mt-4 h-4 w-3/4 rounded bg-slate-200" />
            <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
            <div className="mt-6 h-1.5 w-full rounded-full bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

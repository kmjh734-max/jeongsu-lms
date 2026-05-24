export default function StudentLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-40 rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="h-5 w-3/4 rounded bg-slate-200" />
            <div className="mt-3 h-3 w-full rounded bg-slate-100" />
            <div className="mt-6 h-2 w-full rounded-full bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

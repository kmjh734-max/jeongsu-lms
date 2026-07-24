export default function TeacherLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-36 rounded-lg bg-slate-200" />
        <div className="h-4 w-64 max-w-full rounded bg-slate-100" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-36 rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="h-5 w-2/3 rounded bg-slate-200" />
            <div className="mt-3 h-3 w-full rounded bg-slate-100" />
            <div className="mt-6 h-6 w-16 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

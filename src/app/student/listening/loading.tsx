export default function StudentListeningLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div>
        <div className="h-7 w-32 rounded bg-slate-200" />
        <div className="mt-2 h-4 w-56 rounded bg-slate-100" />
      </div>
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
        <div className="h-4 w-40 rounded bg-slate-200" />
        <div className="mt-3 h-16 w-full rounded-lg bg-white" />
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border-b border-slate-100 px-4 py-4 last:border-b-0"
          >
            <div className="h-4 w-2/3 rounded bg-slate-200" />
            <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

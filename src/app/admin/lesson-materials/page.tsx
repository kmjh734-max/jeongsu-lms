import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { loadLessonMaterialsLibraryData } from "@/lib/lesson-materials/load-library";

export default async function AdminLessonMaterialsPage() {
  const supabase = await createClient();
  const data = await loadLessonMaterialsLibraryData(supabase);

  return (
    <div className="flex gap-6">
      <aside className="w-72 shrink-0 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              자료함 폴더
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {data.folders.length}개 폴더
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Link
            href="/admin/lesson-materials"
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
          >
            <span>미분류</span>
            <span className="text-xs text-slate-500">
              {data.unfiledProjects.length}
            </span>
          </Link>

          {data.folders.map((f) => {
            const count = data.projects.filter((p) => p.folder_id === f.id)
              .length;
            return (
              <div
                key={f.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
              >
                <span className="truncate">{f.name}</span>
                <span className="text-xs text-slate-500">{count}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-4">
          <Link
            href="/admin/lesson-materials/input"
            className="inline-flex w-full items-center justify-center rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700"
          >
            + 새 자료 추가
          </Link>
        </div>
      </aside>

      <main className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900">자료함</h1>
            <p className="mt-1 text-sm text-slate-600">
              저장된 자료를 여기서 확인할 수 있습니다. (AI 분석/삽화는 추후 연결)
            </p>
          </div>
          <div className="text-xs text-slate-500">
            총 {data.projects.length + data.unfiledProjects.length}개 자료
          </div>
        </div>

        {data.unfiledProjects.length > 0 ? (
          <section className="mt-4">
            <h2 className="text-sm font-bold text-slate-900">미분류</h2>
            <ul className="mt-2 space-y-2">
              {data.unfiledProjects.map((p) => (
                <li
                  key={p.id}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/lesson-materials/project/${p.id}`}
                        className="truncate font-semibold text-slate-900 hover:text-brand-700"
                      >
                        {p.title}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">
                        updated_at: {p.updated_at}
                      </p>
                    </div>
                    <div className="shrink-0 text-xs text-slate-500">
                      아이템 {data.itemCountByProjectId[p.id] ?? 0}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {data.folders.length > 0 ? (
          <section className="mt-6">
            {data.folders.map((f) => {
              const projects = data.projects.filter((p) => p.folder_id === f.id);
              if (projects.length === 0) return null;
              return (
                <div key={f.id} className="mt-4">
                  <h2 className="text-sm font-bold text-slate-900">
                    {f.name}
                  </h2>
                  <ul className="mt-2 space-y-2">
                    {projects.map((p) => (
                      <li
                        key={p.id}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <Link
                              href={`/admin/lesson-materials/project/${p.id}`}
                              className="truncate font-semibold text-slate-900 hover:text-brand-700"
                            >
                              {p.title}
                            </Link>
                            <p className="mt-1 text-xs text-slate-500">
                              updated_at: {p.updated_at}
                            </p>
                          </div>
                          <div className="shrink-0 text-xs text-slate-500">
                            아이템 {data.itemCountByProjectId[p.id] ?? 0}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </section>
        ) : null}
      </main>
    </div>
  );
}


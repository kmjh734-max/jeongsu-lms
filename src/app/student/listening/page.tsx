import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { Icon } from "@/components/layout/NavIcon";
import { PageHeader } from "@/components/ui/PageHeader";
import { StudentListeningTodayPanel } from "@/components/listening/StudentListeningTodayPanel";
import { fetchStudentListeningSets } from "@/lib/listening/student-sets";

export default async function StudentListeningPage() {
  const [profile, supabase] = await Promise.all([
    getCurrentProfile(),
    createClient(),
  ]);

  const sets = await fetchStudentListeningSets(supabase, profile!.id);

  return (
    <div>
      <PageHeader
        title="듣기학습"
        description="배정된 날마다 문제를 풀고 받아쓰기까지 끝내면 완료예요."
      />

      <StudentListeningTodayPanel />

      {/* 구형 세트 배정 목록 — 스케줄 배정과 별개. 비어 있어도 안내 문구를 띄우지 않음 */}
      {sets.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-3 text-[15px] font-bold text-slate-900">연습 세트</h2>
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-card">
            {sets.map((set) => (
              <li key={set.id}>
                <Link
                  href={`/student/listening/${set.id}`}
                  className="group flex items-center gap-3 px-4 py-3.5 transition hover:bg-slate-50 sm:px-5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                    <Icon name="headphones" size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-900 group-hover:text-brand-700">
                      {set.title}
                    </span>
                    {set.description && (
                      <span className="mt-0.5 block text-xs leading-snug text-slate-500">
                        {set.description}
                      </span>
                    )}
                  </span>
                  <Icon
                    name="chevron"
                    size={16}
                    className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-600"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

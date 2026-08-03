import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
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
        description="배정된 듣기 연습을 진행합니다."
      />
      <div className="mt-6">
        <StudentListeningTodayPanel />

        {/* 구형 세트 배정 목록 — 스케줄 배정과 별개. 비어 있어도 안내 문구를 띄우지 않음 */}
        {sets.length > 0 ? (
          <ul className="mt-6 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {sets.map((set) => (
              <li key={set.id}>
                <Link
                  href={`/student/listening/${set.id}`}
                  className="block px-4 py-4 hover:bg-slate-50"
                >
                  <span className="font-medium text-slate-900">{set.title}</span>
                  {set.description && (
                    <p className="mt-1 text-sm text-slate-600">
                      {set.description}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

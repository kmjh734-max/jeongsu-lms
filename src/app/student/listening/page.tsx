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
        {sets.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            <p>배정된 듣기 세트가 없습니다.</p>
            <ul className="mt-2 list-inside list-disc text-xs text-slate-500">
              <li>선생님이 반에 배정했는지 확인해 주세요.</li>
              <li>내가 반에 등록되어 있는지도 확인이 필요합니다.</li>
            </ul>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {sets.map((set) => (
              <li key={set.id}>
                <Link
                  href={`/student/listening/${set.id}`}
                  className="block px-4 py-4 hover:bg-slate-50"
                >
                  <span className="font-medium text-slate-900">{set.title}</span>
                  {set.description && (
                    <p className="mt-1 text-sm text-slate-600">{set.description}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

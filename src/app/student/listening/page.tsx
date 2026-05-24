import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function StudentListeningPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const { data: classRows } = await supabase
    .from("class_students")
    .select("class_id")
    .eq("student_id", profile!.id);

  const classIds = (classRows ?? []).map((r) => r.class_id);

  const { data: directAssign } = await supabase
    .from("listening_assignments")
    .select("set_id")
    .eq("student_id", profile!.id);

  const { data: classAssign } =
    classIds.length > 0
      ? await supabase
          .from("listening_assignments")
          .select("set_id")
          .in("class_id", classIds)
      : { data: [] };

  const setIds = [
    ...new Set([
      ...(directAssign ?? []).map((a) => a.set_id),
      ...(classAssign ?? []).map((a) => a.set_id),
    ]),
  ];

  const { data: sets } =
    setIds.length > 0
      ? await supabase
          .from("listening_sets")
          .select("id, title, description")
          .in("id", setIds)
          .eq("is_published", true)
          .order("created_at", { ascending: false })
      : { data: [] };

  return (
    <div>
      <PageHeader
        title="듣기학습"
        description="배정된 듣기 연습을 진행합니다."
      />
      <div className="mt-6">
        {(sets ?? []).length === 0 ? (
          <p className="text-sm text-slate-600">배정된 듣기 세트가 없습니다.</p>
        ) : (
          <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {sets!.map((set) => (
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

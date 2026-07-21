import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { SuperAdminAcademiesClient } from "@/components/super-admin/SuperAdminAcademiesClient";

export default async function SuperAdminHomePage() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "super_admin") {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: academies } = await supabase
    .from("academies")
    .select(
      "id, name, slug, status, primary_color, logo_url, created_at, updated_at"
    )
    .order("created_at", { ascending: true });

  const academyIds = (academies ?? []).map((a) => a.id);
  const countsByAcademy: Record<
    string,
    { students: number; teachers: number; courses: number }
  > = {};

  for (const id of academyIds) {
    countsByAcademy[id] = { students: 0, teachers: 0, courses: 0 };
  }

  if (academyIds.length > 0) {
    const [{ data: profiles }, { data: courses }] = await Promise.all([
      supabase
        .from("profiles")
        .select("academy_id, role")
        .in("academy_id", academyIds),
      supabase.from("courses").select("academy_id").in("academy_id", academyIds),
    ]);

    for (const p of profiles ?? []) {
      const aid = p.academy_id as string | null;
      if (!aid || !countsByAcademy[aid]) continue;
      if (p.role === "student") countsByAcademy[aid].students += 1;
      if (p.role === "teacher") countsByAcademy[aid].teachers += 1;
    }
    for (const c of courses ?? []) {
      const aid = c.academy_id as string | null;
      if (!aid || !countsByAcademy[aid]) continue;
      countsByAcademy[aid].courses += 1;
    }
  }

  const rows = (academies ?? []).map((a) => ({
    ...a,
    students: countsByAcademy[a.id]?.students ?? 0,
    teachers: countsByAcademy[a.id]?.teachers ?? 0,
    courses: countsByAcademy[a.id]?.courses ?? 0,
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <PageHeader
        title="EngCore Admin"
        description="전체 학원을 관리합니다. 영어교육의 중심, EngCore"
        action={
          <Link
            href="/login"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            로그인 화면
          </Link>
        }
      />
      <p className="mb-4 text-sm text-slate-600">
        {profile.name} · {profile.email}
      </p>
      <SuperAdminAcademiesClient initialRows={rows} />
    </div>
  );
}

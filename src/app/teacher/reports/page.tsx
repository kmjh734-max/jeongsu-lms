import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { ReportWorkspace } from "@/components/reports/ReportWorkspace";
import { loadLastReportShares } from "@/lib/reports/last-shared";
import { listReportClasses, listReportStudents } from "@/lib/reports/list-students";
import { getAcademyBrandingForCurrentUser } from "@/lib/tenant/academy-branding";

export default async function TeacherReportsPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const [classes, students, branding] = await Promise.all([
    listReportClasses(supabase, "teacher", profile!.id),
    listReportStudents(supabase, "teacher", profile!.id, {}),
    getAcademyBrandingForCurrentUser(),
  ]);
  const lastShared = await loadLastReportShares(students.map((s) => s.id));

  return (
    <ReportWorkspace
      initialClasses={classes}
      initialStudents={students}
      initialLastShared={lastShared}
      academyName={branding.name}
      logoSrc={branding.logoUrl}
    />
  );
}

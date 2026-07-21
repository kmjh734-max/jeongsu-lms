import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { ReportWorkspace } from "@/components/reports/ReportWorkspace";
import { listReportClasses, listReportStudents } from "@/lib/reports/list-students";
import { getAcademyBrandingForCurrentUser } from "@/lib/tenant/academy-branding";

export default async function AdminReportsPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const [classes, students, branding] = await Promise.all([
    listReportClasses(supabase, "admin", profile!.id),
    listReportStudents(supabase, "admin", profile!.id, {}),
    getAcademyBrandingForCurrentUser(),
  ]);

  return (
    <ReportWorkspace
      role="admin"
      initialClasses={classes}
      initialStudents={students}
      academyName={branding.name}
      logoSrc={branding.logoUrl}
    />
  );
}

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { ReportWorkspace } from "@/components/reports/ReportWorkspace";
import { listReportClasses, listReportStudents } from "@/lib/reports/list-students";

export default async function TeacherReportsPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const [classes, students] = await Promise.all([
    listReportClasses(supabase, "teacher", profile!.id),
    listReportStudents(supabase, "teacher", profile!.id, {}),
  ]);

  return (
    <ReportWorkspace
      role="teacher"
      initialClasses={classes}
      initialStudents={students}
    />
  );
}

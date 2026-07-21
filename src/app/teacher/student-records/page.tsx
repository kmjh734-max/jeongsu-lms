import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { StudentRecordWorkspace } from "@/components/student-records/StudentRecordWorkspace";
import { listReportClasses, listReportStudents } from "@/lib/reports/list-students";
import { getAcademyBrandingForCurrentUser } from "@/lib/tenant/academy-branding";

export default async function TeacherStudentRecordsPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const [classes, students, branding] = await Promise.all([
    listReportClasses(supabase, "teacher", profile!.id),
    listReportStudents(supabase, "teacher", profile!.id, {}),
    getAcademyBrandingForCurrentUser(),
  ]);

  return (
    <StudentRecordWorkspace
      initialClasses={classes}
      initialStudents={students}
      academyName={branding.name}
      logoSrc={branding.logoUrl}
    />
  );
}

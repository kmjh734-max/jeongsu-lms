import { redirect } from "next/navigation";
import { isNeltEnabled } from "@/lib/academy-features";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { NeltWorkspace } from "@/components/nelt/NeltWorkspace";
import { listNeltStudentGroups } from "@/lib/nelt/list-student-groups";
import { getAcademyBrandingForCurrentUser } from "@/lib/tenant/academy-branding";

export default async function TeacherNeltPage() {
  if (!isNeltEnabled()) redirect("/teacher");

  const profile = await getCurrentProfile();
  if (!profile?.academy_id) redirect("/teacher");

  const [groups, branding] = await Promise.all([
    listNeltStudentGroups(profile.academy_id),
    getAcademyBrandingForCurrentUser(),
  ]);

  return (
    <NeltWorkspace
      role="teacher"
      academyName={branding.name}
      initialGroups={groups}
    />
  );
}

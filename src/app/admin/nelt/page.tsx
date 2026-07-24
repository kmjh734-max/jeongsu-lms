import { redirect } from "next/navigation";
import { isNeltEnabled } from "@/lib/academy-features";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { NeltWorkspace } from "@/components/nelt/NeltWorkspace";
import { listNeltStudentGroups } from "@/lib/nelt/list-student-groups";
import { getAcademyBrandingForCurrentUser } from "@/lib/tenant/academy-branding";

export default async function AdminNeltPage() {
  if (!isNeltEnabled()) redirect("/admin");

  const profile = await getCurrentProfile();
  if (!profile?.academy_id) redirect("/admin");

  const [groups, branding] = await Promise.all([
    listNeltStudentGroups(profile.academy_id),
    getAcademyBrandingForCurrentUser(),
  ]);

  return (
    <NeltWorkspace
      role="admin"
      academyName={branding.name}
      initialGroups={groups}
    />
  );
}

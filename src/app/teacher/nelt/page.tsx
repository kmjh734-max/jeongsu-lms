import { redirect } from "next/navigation";
import { isNeltEnabled } from "@/lib/academy-features";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { NeltWorkspace } from "@/components/nelt/NeltWorkspace";
import { listNeltStudentGroups } from "@/lib/nelt/list-student-groups";

interface PageProps {
  searchParams: Promise<{ import?: string; name?: string }>;
}

export default async function TeacherNeltPage({ searchParams }: PageProps) {
  if (!isNeltEnabled()) redirect("/teacher");

  const profile = await getCurrentProfile();
  if (!profile?.academy_id) redirect("/teacher");

  const [groups, params] = await Promise.all([
    listNeltStudentGroups(profile.academy_id),
    searchParams,
  ]);

  return (
    <NeltWorkspace
      role="teacher"
      initialGroups={groups}
      initialImportOpen={params.import === "1"}
      initialImportName={params.name?.trim() ?? ""}
    />
  );
}

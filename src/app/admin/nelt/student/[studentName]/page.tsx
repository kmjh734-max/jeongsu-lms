import { notFound, redirect } from "next/navigation";
import { NeltStudentPageContent } from "@/components/nelt/NeltStudentPageContent";
import { isNeltEnabled } from "@/lib/academy-features";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { loadStudentNeltAttempts } from "@/lib/nelt/load-student-attempts";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  params: Promise<{ studentName: string }>;
}

export default async function AdminNeltStudentPage({ params }: PageProps) {
  if (!isNeltEnabled()) redirect("/admin");
  const profile = await getCurrentProfile();
  if (!profile?.academy_id) redirect("/admin");

  const { studentName: raw } = await params;
  const studentName = decodeURIComponent(raw).trim();
  if (!studentName) notFound();

  const supabase = await createClient();
  const attempts = await loadStudentNeltAttempts(
    supabase,
    profile.academy_id,
    studentName
  );

  return (
    <NeltStudentPageContent
      role="admin"
      studentName={studentName}
      attempts={attempts}
    />
  );
}

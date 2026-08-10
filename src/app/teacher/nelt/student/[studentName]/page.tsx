import { notFound, redirect } from "next/navigation";
import { NeltStudentPageContent } from "@/components/nelt/NeltStudentPageContent";
import { isNeltEnabled } from "@/lib/academy-features";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { loadStudentNeltAttempts } from "@/lib/nelt/load-student-attempts";
import { loadStoredNeltNarratives } from "@/lib/nelt/load-stored-narratives";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  params: Promise<{ studentName: string }>;
}

export default async function TeacherNeltStudentPage({ params }: PageProps) {
  if (!isNeltEnabled()) redirect("/teacher");
  const profile = await getCurrentProfile();
  if (!profile?.academy_id) redirect("/teacher");

  const { studentName: raw } = await params;
  const studentName = decodeURIComponent(raw).trim();
  if (!studentName) notFound();

  const supabase = await createClient();
  const [attempts, storedNarratives] = await Promise.all([
    loadStudentNeltAttempts(supabase, profile.academy_id, studentName),
    loadStoredNeltNarratives(supabase, profile.academy_id, studentName),
  ]);

  return (
    <NeltStudentPageContent
      role="teacher"
      studentName={studentName}
      attempts={attempts}
      storedNarratives={storedNarratives}
    />
  );
}

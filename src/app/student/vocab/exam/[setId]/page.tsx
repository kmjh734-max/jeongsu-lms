import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import {
  ensureExamCompactStageSkip,
  ensureStudentExamVocabAssignment,
} from "@/lib/question-generator/exam-vocab";

interface PageProps {
  params: Promise<{ setId: string }>;
}

/** 시험지 QR 진입: 배정 보장 후 단어학습 허브로 */
export default async function StudentExamVocabEntryPage({ params }: PageProps) {
  const { setId } = await params;
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect(`/login?redirect=${encodeURIComponent(`/student/vocab/exam/${setId}`)}`);
  }
  if (profile.role !== "student") {
    redirect(`/student/vocab/${setId}`);
  }

  const ok = await ensureStudentExamVocabAssignment(profile.id, setId);
  if (!ok) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("vocab_sets")
      .select("id, exam_compact")
      .eq("id", setId)
      .maybeSingle();
    if (!data) notFound();
  }

  await ensureExamCompactStageSkip(profile.id, setId);
  redirect(`/student/vocab/${setId}`);
}

import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { StudentListeningExamHub } from "@/components/listening/StudentListeningExamHub";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export default async function ListenHubPage({
  params,
}: {
  params: Promise<{ setId: string }>;
}) {
  const { setId } = await params;

  const profile = await getCurrentProfile();
  if (!profile) {
    redirect(`/login?redirect=${encodeURIComponent(`/listen/${setId}`)}`);
  }

  if (profile.is_active === false) {
    redirect("/login?inactive=1");
  }

  const supabase = await createClient();

  const { data: set } = await supabase
    .from("listening_sets")
    .select("id, title")
    .eq("id", setId)
    .eq("is_published", true)
    .maybeSingle();

  if (!set) notFound();

  const { data: questions } = await supabase
    .from("listening_questions")
    .select("id, order_index, audio_url")
    .eq("set_id", setId)
    .order("order_index", { ascending: true });

  const canSubmitOmr = profile.role === "student";
  let initialAttempt = null;

  if (canSubmitOmr) {
    const admin = createAdminClient();
    const { data: latest } = await admin
      .from("listening_exam_attempts")
      .select("id, score, correct_count, total_count, submitted_at")
      .eq("student_id", profile.id)
      .eq("set_id", setId)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latest) {
      const { data: answerRows } = await admin
        .from("listening_exam_answers")
        .select(
          "question_id, order_index, student_answer, correct_answer, is_correct"
        )
        .eq("attempt_id", latest.id)
        .order("order_index", { ascending: true });

      initialAttempt = {
        score: latest.score as number,
        correctCount: latest.correct_count as number,
        totalCount: latest.total_count as number,
        submittedAt: latest.submitted_at as string,
        results: (answerRows ?? []).map((row) => ({
          questionId: row.question_id as string,
          orderIndex: row.order_index as number,
          studentAnswer: row.student_answer as number | null,
          correctAnswer: row.correct_answer as number,
          isCorrect: row.is_correct as boolean,
        })),
      };
    }
  }

  return (
    <StudentListeningExamHub
      setId={setId}
      setTitle={set.title}
      questions={(questions ?? []).map((q) => ({
        id: q.id as string,
        orderIndex: q.order_index as number,
        audioUrl: q.audio_url as string | null,
      }))}
      canSubmitOmr={canSubmitOmr}
      initialAttempt={initialAttempt}
    />
  );
}

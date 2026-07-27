import { notFound, redirect } from "next/navigation";
import { WorkbookPrintView } from "@/components/exam-prep/WorkbookPrintView";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import { getAcademyBrandingForCurrentUser } from "@/lib/tenant/academy-branding";
import { createClient } from "@/lib/supabase/server";
import { sanitizeQuestionDataForStudent } from "@/lib/exam-prep/strip-answers";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ answers?: string }>;
}

export default async function TeacherExamPrepWorkbookPrintPage({
  params,
  searchParams,
}: PageProps) {
  if (!isExamPrepEnabled()) redirect("/teacher");
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "teacher" || !profile.academy_id) {
    redirect("/login");
  }

  const { id } = await params;
  const sp = await searchParams;
  const showAnswers = sp.answers === "1";

  const supabase = await createClient();
  const { data: wb } = await supabase
    .from("exam_workbooks")
    .select("id, title, passage_id, exam_passages(title, original_text)")
    .eq("id", id)
    .eq("academy_id", profile.academy_id)
    .maybeSingle();
  if (!wb) notFound();

  const passageRaw = wb.exam_passages as
    | { title: string; original_text: string }
    | { title: string; original_text: string }[]
    | null;
  const passage = Array.isArray(passageRaw) ? passageRaw[0] ?? null : passageRaw;

  const [{ data: steps }, { data: questions }, branding] = await Promise.all([
    supabase
      .from("exam_workbook_steps")
      .select("id, step_order, step_type, title")
      .eq("workbook_id", id)
      .order("step_order", { ascending: true }),
    supabase
      .from("exam_workbook_questions")
      .select(
        "id, step_id, question_order, question_text, question_type, question_data, points, correct_answer, explanation, is_active"
      )
      .eq("workbook_id", id)
      .eq("is_active", true)
      .order("question_order", { ascending: true }),
    getAcademyBrandingForCurrentUser(),
  ]);

  return (
    <WorkbookPrintView
      workbookTitle={wb.title as string}
      passageTitle={passage?.title ?? "-"}
      passageText={passage?.original_text ?? ""}
      steps={(steps ?? []).map((st) => ({
        stepOrder: st.step_order as number,
        stepType: st.step_type as string,
        title: st.title as string | null,
        questions: (questions ?? [])
          .filter((q) => q.step_id === st.id)
          .map((q) => ({
            order: q.question_order as number,
            text: q.question_text as string | null,
            type: q.question_type as string,
            data: sanitizeQuestionDataForStudent(
              q.question_type as string,
              (q.question_data as Record<string, unknown>) ?? {}
            ),
            points: Number(q.points) || 1,
            correctAnswer: showAnswers ? q.correct_answer : undefined,
            explanation: showAnswers ? (q.explanation as string | null) : null,
          })),
      }))}
      showAnswers={showAnswers}
      backHref={`/teacher/exam-prep/workbooks/${id}/edit`}
      academyName={branding.name}
      logoSrc={branding.logoUrl}
    />
  );
}

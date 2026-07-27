import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { WrongPracticeClient } from "@/components/exam-prep/WrongPracticeClient";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import { toPublicWrongPractice } from "@/lib/exam-prep/transform-wrong-question";
import { transformWrongQuestionWithAi } from "@/lib/exam-prep/transform-wrong-ai";
import { createClient } from "@/lib/supabase/server";
import type { ExamWorkbookQuestion } from "@/lib/exam-prep/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentWrongPracticePage({ params }: PageProps) {
  if (!isExamPrepEnabled()) redirect("/student");
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "student") redirect("/login");

  const { id } = await params;
  const supabase = await createClient();
  const { data: wrong } = await supabase
    .from("exam_wrong_answers")
    .select("id, question_id, is_mastered")
    .eq("id", id)
    .eq("student_id", profile.id)
    .maybeSingle();
  if (!wrong) notFound();

  const { data: q } = await supabase
    .from("exam_workbook_questions")
    .select("*")
    .eq("id", wrong.question_id)
    .maybeSingle();
  if (!q) notFound();

  const practiceFull = await transformWrongQuestionWithAi(
    q as ExamWorkbookQuestion
  );
  const practice = toPublicWrongPractice(practiceFull);

  return (
    <div>
      <PageHeader
        title="오답 변형 연습"
        description={
          wrong.is_mastered
            ? "이미 숙달된 문항입니다. 복습만 가능합니다."
            : "틀린 문항을 다른 유형으로 바꿔 다시 풀어 보세요."
        }
        action={
          <Link
            href="/student/exam-prep/wrong"
            className="text-sm text-brand-700 hover:underline"
          >
            목록
          </Link>
        }
      />
      <WrongPracticeClient
        wrongId={wrong.id}
        originalType={q.question_type}
        practice={practice}
      />
    </div>
  );
}

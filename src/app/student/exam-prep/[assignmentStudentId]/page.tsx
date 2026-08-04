import { notFound, redirect } from "next/navigation";
import { StudentAssignmentPlayer } from "@/components/exam-prep/StudentAssignmentPlayer";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import {
  sanitizeQuestionDataForStudent,
  stripQuestions,
} from "@/lib/exam-prep/strip-answers";
import { createClient } from "@/lib/supabase/server";
import type {
  ExamPassage,
  ExamPassageSentence,
  ExamStage1Progress,
  ExamWorkbookQuestion,
  ExamWorkbookQuestionPublic,
  ExamWorkbookStep,
} from "@/lib/exam-prep/types";

interface PageProps {
  params: Promise<{ assignmentStudentId: string }>;
}

export default async function StudentExamPrepPlayerPage({
  params,
}: PageProps) {
  if (!isExamPrepEnabled()) redirect("/student");
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "student") redirect("/login");

  const { assignmentStudentId } = await params;
  const supabase = await createClient();

  const { data: asRow } = await supabase
    .from("exam_assignment_students")
    .select("id, assignment_id")
    .eq("id", assignmentStudentId)
    .eq("student_id", profile.id)
    .maybeSingle();

  if (!asRow) notFound();

  const { data: assignment } = await supabase
    .from("exam_assignments")
    .select("id, title, workbook_id")
    .eq("id", asRow.assignment_id)
    .maybeSingle();

  if (!assignment?.workbook_id) notFound();

  const { data: workbook } = await supabase
    .from("exam_workbooks")
    .select("id, title, passage_id")
    .eq("id", assignment.workbook_id)
    .maybeSingle();

  if (!workbook) notFound();

  const { data: passage } = await supabase
    .from("exam_passages")
    .select(
      "id, title, school_level, grade, source, exam_name, passage_number, stage2_published, stage3_published, stage4_published, stage5_published, stage6_published, stage7_published, stage8_published, stage9_published, stage10_published"
    )
    .eq("id", workbook.passage_id)
    .maybeSingle();

  if (!passage) notFound();

  const passageTitle =
    passage.title ?? workbook.title ?? assignment.title ?? "내신대비 학습";

  const [
    { data: steps },
    { data: questions },
    { data: attempts },
    { data: sentences },
    { data: stage1 },
    { data: stage2Done },
    { data: stage3Done },
    { data: stage4Done },
    { data: stage5Done },
    { data: stage6Done },
    { data: stage7Done },
    { data: stage8Done },
    { data: stage9Done },
  ] = await Promise.all([
    supabase
      .from("exam_workbook_steps")
      .select("*")
      .eq("workbook_id", workbook.id)
      .order("step_order", { ascending: true }),
    supabase
      .from("exam_workbook_questions")
      .select("*")
      .eq("workbook_id", workbook.id)
      .eq("is_active", true)
      .order("question_order", { ascending: true }),
    supabase
      .from("exam_attempts")
      .select("step_id, status, score, attempt_number")
      .eq("assignment_student_id", assignmentStudentId),
    supabase
      .from("exam_passage_sentences")
      .select("*")
      .eq("passage_id", passage.id)
      .order("sentence_order", { ascending: true }),
    supabase
      .from("exam_stage1_progress")
      .select("*")
      .eq("assignment_student_id", assignmentStudentId)
      .eq("stage_number", 1)
      .maybeSingle(),
    supabase
      .from("exam_stage2_progress")
      .select("completed_at")
      .eq("assignment_student_id", assignmentStudentId)
      .eq("stage_number", 2)
      .maybeSingle(),
    supabase
      .from("exam_stage2_progress")
      .select("completed_at")
      .eq("assignment_student_id", assignmentStudentId)
      .eq("stage_number", 3)
      .maybeSingle(),
    supabase
      .from("exam_stage2_progress")
      .select("completed_at")
      .eq("assignment_student_id", assignmentStudentId)
      .eq("stage_number", 4)
      .maybeSingle(),
    supabase
      .from("exam_stage2_progress")
      .select("completed_at")
      .eq("assignment_student_id", assignmentStudentId)
      .eq("stage_number", 5)
      .maybeSingle(),
    supabase
      .from("exam_stage2_progress")
      .select("completed_at")
      .eq("assignment_student_id", assignmentStudentId)
      .eq("stage_number", 6)
      .maybeSingle(),
    supabase
      .from("exam_stage2_progress")
      .select("completed_at")
      .eq("assignment_student_id", assignmentStudentId)
      .eq("stage_number", 7)
      .maybeSingle(),
    supabase
      .from("exam_stage2_progress")
      .select("completed_at")
      .eq("assignment_student_id", assignmentStudentId)
      .eq("stage_number", 8)
      .maybeSingle(),
    supabase
      .from("exam_stage2_progress")
      .select("completed_at")
      .eq("assignment_student_id", assignmentStudentId)
      .eq("stage_number", 9)
      .maybeSingle(),
  ]);

  const publicQuestions: ExamWorkbookQuestionPublic[] = stripQuestions(
    (questions ?? []) as ExamWorkbookQuestion[]
  ).map((q) => ({
    ...q,
    question_data: sanitizeQuestionDataForStudent(
      q.question_type,
      q.question_data ?? {}
    ),
  }));

  return (
    <div>
      <PageHeader title={assignment.title} description={passageTitle} />
      <StudentAssignmentPlayer
        assignmentStudentId={assignmentStudentId}
        steps={(steps ?? []) as ExamWorkbookStep[]}
        questions={publicQuestions}
        passageTitle={passageTitle}
        passage={passage as ExamPassage}
        sentences={(sentences ?? []) as ExamPassageSentence[]}
        stage1Progress={(stage1 as ExamStage1Progress | null) ?? null}
        stage2Published={Boolean(
          (passage as { stage2_published?: boolean }).stage2_published
        )}
        stage3Published={Boolean(
          (passage as { stage3_published?: boolean }).stage3_published
        )}
        stage4Published={Boolean(
          (passage as { stage4_published?: boolean }).stage4_published
        )}
        stage5Published={Boolean(
          (passage as { stage5_published?: boolean }).stage5_published
        )}
        stage6Published={Boolean(
          (passage as { stage6_published?: boolean }).stage6_published
        )}
        stage7Published={Boolean(
          (passage as { stage7_published?: boolean }).stage7_published
        )}
        stage8Published={Boolean(
          (passage as { stage8_published?: boolean }).stage8_published
        )}
        stage9Published={Boolean(
          (passage as { stage9_published?: boolean }).stage9_published
        )}
        stage10Published={Boolean(
          (passage as { stage10_published?: boolean }).stage10_published
        )}
        stage2Completed={Boolean(stage2Done?.completed_at)}
        stage3Completed={Boolean(stage3Done?.completed_at)}
        stage4Completed={Boolean(stage4Done?.completed_at)}
        stage5Completed={Boolean(stage5Done?.completed_at)}
        stage6Completed={Boolean(stage6Done?.completed_at)}
        stage7Completed={Boolean(stage7Done?.completed_at)}
        stage8Completed={Boolean(stage8Done?.completed_at)}
        stage9Completed={Boolean(stage9Done?.completed_at)}
        existingAttempts={(attempts ?? []).map((a) => ({
          step_id: a.step_id as string,
          status: a.status as string,
          score: a.score != null ? Number(a.score) : null,
          attempt_number: Number(a.attempt_number) || 1,
        }))}
      />
    </div>
  );
}

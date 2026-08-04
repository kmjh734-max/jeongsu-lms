"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";

async function requireStudent() {
  if (!isExamPrepEnabled()) {
    return { ok: false as const, message: "기능을 사용할 수 없습니다." };
  }
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "student" || !profile.academy_id) {
    return { ok: false as const, message: "권한이 없습니다." };
  }
  return { ok: true as const, profile };
}

async function assertAssignmentOwned(
  assignmentStudentId: string,
  studentId: string
) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("exam_assignment_students")
    .select("id, academy_id, assignment_id")
    .eq("id", assignmentStudentId)
    .eq("student_id", studentId)
    .maybeSingle();
  return data;
}

/** 문장 확인 상태 저장 (페이지 이탈·재접속 복원용) */
export async function saveStage1ProgressAction(input: {
  assignmentStudentId: string;
  passageId: string;
  completedSentenceIds: string[];
  lastViewedSentenceId?: string | null;
  totalSentenceCount: number;
}) {
  const auth = await requireStudent();
  if (!auth.ok) return auth;

  const asRow = await assertAssignmentOwned(
    input.assignmentStudentId,
    auth.profile.id
  );
  if (!asRow) {
    return { ok: false as const, message: "배정을 찾을 수 없습니다." };
  }

  const supabase = await createClient();
  const uniqueIds = [...new Set(input.completedSentenceIds.filter(Boolean))];
  const total = Math.max(1, input.totalSentenceCount);
  const progressPercent = Math.min(
    100,
    Math.round((uniqueIds.length / total) * 1000) / 10
  );

  const payload = {
    academy_id: asRow.academy_id ?? auth.profile.academy_id,
    assignment_student_id: input.assignmentStudentId,
    passage_id: input.passageId,
    stage_number: 1,
    completed_sentence_ids: uniqueIds,
    last_viewed_sentence_id: input.lastViewedSentenceId || null,
    progress_percent: progressPercent,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("exam_stage1_progress")
    .upsert(payload, { onConflict: "assignment_student_id,stage_number" })
    .select("*")
    .single();

  if (error) {
    return { ok: false as const, message: error.message };
  }

  revalidatePath(`/student/exam-prep/${input.assignmentStudentId}`);
  return { ok: true as const, progress: data };
}

/**
 * 모든 문장 확인 후 1단계 완료.
 * 기존 워크북 순차 해제를 위해 comprehension step attempt도 제출한다.
 */
export async function completeStage1Action(input: {
  assignmentStudentId: string;
  passageId: string;
  stepId: string;
  completedSentenceIds: string[];
  totalSentenceCount: number;
}) {
  const auth = await requireStudent();
  if (!auth.ok) return auth;

  if (input.completedSentenceIds.length < input.totalSentenceCount) {
    return {
      ok: false as const,
      message: "모든 문장을 확인해야 1단계를 완료할 수 있습니다.",
    };
  }

  const save = await saveStage1ProgressAction({
    assignmentStudentId: input.assignmentStudentId,
    passageId: input.passageId,
    completedSentenceIds: input.completedSentenceIds,
    totalSentenceCount: input.totalSentenceCount,
  });
  if (!save.ok) return save;

  const supabase = await createClient();

  await supabase
    .from("exam_stage1_progress")
    .update({
      completed_at: new Date().toISOString(),
      progress_percent: 100,
      updated_at: new Date().toISOString(),
    })
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 1);

  // comprehension 문항을 모두 confirmed 로 제출해 기존 unlock 유지
  const { startOrResumeAttemptAction, submitStepAttemptAction } = await import(
    "@/lib/exam-prep/student-actions"
  );

  const started = await startOrResumeAttemptAction(
    input.assignmentStudentId,
    input.stepId
  );
  if (!started.ok || !("attempt" in started) || !started.attempt) {
    return {
      ok: true as const,
      message:
        "1단계 학습은 저장되었습니다. (단계 세션: " +
        ("message" in started ? started.message : "오류") +
        ")",
      stageCompleted: true,
      submitOk: false,
    };
  }

  const { data: questions } = await supabase
    .from("exam_workbook_questions")
    .select("id")
    .eq("step_id", input.stepId)
    .eq("is_active", true);

  const answers: Record<string, { confirmed: boolean }> = {};
  for (const q of questions ?? []) {
    answers[q.id as string] = { confirmed: true };
  }

  const submit = await submitStepAttemptAction({
    assignment_student_id: input.assignmentStudentId,
    step_id: input.stepId,
    attempt_id: started.attempt.id,
    answers,
  });

  if (!submit.ok) {
    return {
      ok: true as const,
      message:
        "1단계 학습은 저장되었습니다. (단계 제출 연동: " +
        submit.message +
        ")",
      stageCompleted: true,
      submitOk: false,
    };
  }

  revalidatePath(`/student/exam-prep/${input.assignmentStudentId}`);
  revalidatePath("/student/exam-prep");
  return {
    ok: true as const,
    message: "1단계 학습을 완료했습니다. 다음 단계는 준비 중입니다.",
    stageCompleted: true,
    submitOk: true,
  };
}

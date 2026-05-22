"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/vocab/actions-shared";
import { gradeVocabTestSubmission } from "@/lib/vocab/grade-test";
import { isVocabTestType, type VocabTestType } from "@/lib/vocab/test-types";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import type { VocabItem } from "@/types/database";

export type SubmitVocabTestResult = ActionResult & { attemptId?: string };

export async function recordVocabProgress(
  itemId: string,
  known: boolean
): Promise<ActionResult> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "student") {
    return actionError("학생 권한이 필요합니다.");
  }

  const supabase = await createClient();

  const { data: item, error: itemError } = await supabase
    .from("vocab_items")
    .select("id, set_id")
    .eq("id", itemId)
    .single();

  if (itemError || !item) {
    return actionError("단어를 찾을 수 없습니다.");
  }

  const { data: existing } = await supabase
    .from("vocab_progress")
    .select("id, studied_count")
    .eq("student_id", profile.id)
    .eq("item_id", itemId)
    .maybeSingle();

  const status = known ? "known" : "review";
  const now = new Date().toISOString();

  if (existing) {
    const { error: updateError } = await supabase
      .from("vocab_progress")
      .update({
        status,
        studied_count: (existing.studied_count ?? 0) + 1,
        last_studied_at: now,
      })
      .eq("id", existing.id);

    if (updateError) return actionError(updateError.message);
  } else {
    const { error: insertError } = await supabase.from("vocab_progress").insert({
      student_id: profile.id,
      item_id: itemId,
      status,
      studied_count: 1,
      last_studied_at: now,
    });

    if (insertError) return actionError(insertError.message);
  }

  revalidatePath("/student/vocab");
  revalidatePath(`/student/vocab/${item.set_id}`);
  return actionSuccess(known ? "알아요로 저장했습니다." : "복습 필요로 저장했습니다.");
}

export async function submitVocabTest(
  setId: string,
  testType: string,
  answers: { itemId: string; studentAnswer: string }[],
  itemOrder: string[]
): Promise<SubmitVocabTestResult> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "student") {
    return actionError("학생 권한이 필요합니다.");
  }

  if (!isVocabTestType(testType)) {
    return actionError("올바르지 않은 테스트 유형입니다.");
  }

  const typedTestType = testType as VocabTestType;
  const supabase = await createClient();

  const { data: set } = await supabase
    .from("vocab_sets")
    .select("id")
    .eq("id", setId)
    .single();

  if (!set) return actionError("단어장을 찾을 수 없습니다.");

  const { data: items } = await supabase
    .from("vocab_items")
    .select("*")
    .eq("set_id", setId)
    .order("order_index")
    .order("created_at");

  const itemList = (items ?? []) as VocabItem[];
  if (itemList.length < 2) {
    return actionError("테스트를 보려면 단어가 2개 이상 필요합니다.");
  }

  const answerMap = new Map<string, string>();
  for (const a of answers) {
    answerMap.set(a.itemId, a.studentAnswer ?? "");
  }

  const order =
    itemOrder.length > 0 ? itemOrder : itemList.map((i) => i.id);

  const { graded, correctCount, totalQuestions, score } =
    gradeVocabTestSubmission(itemList, typedTestType, answerMap, order);

  const startedAt = new Date().toISOString();
  const submittedAt = new Date().toISOString();

  const { data: attempt, error: attemptError } = await supabase
    .from("vocab_test_attempts")
    .insert({
      set_id: setId,
      student_id: profile.id,
      test_type: typedTestType,
      score,
      total_questions: totalQuestions,
      correct_count: correctCount,
      started_at: startedAt,
      submitted_at: submittedAt,
    })
    .select("id")
    .single();

  if (attemptError || !attempt) {
    return actionError(attemptError?.message ?? "테스트 저장에 실패했습니다.");
  }

  const answerRows = graded.map((g) => ({
    attempt_id: attempt.id,
    item_id: g.itemId,
    question_type: g.questionType,
    question_text: g.questionText,
    correct_answer: g.correctAnswer,
    student_answer: g.studentAnswer,
    is_correct: g.isCorrect,
    choices: g.choices,
  }));

  const { error: answersError } = await supabase
    .from("vocab_test_answers")
    .insert(answerRows);

  if (answersError) {
    await supabase.from("vocab_test_attempts").delete().eq("id", attempt.id);
    return actionError(answersError.message);
  }

  revalidatePath("/student/vocab");
  revalidatePath(`/student/vocab/${setId}`);
  revalidatePath(`/student/vocab/${setId}/test/result`);

  return {
    ...actionSuccess("테스트가 제출되었습니다."),
    attemptId: attempt.id as string,
  };
}

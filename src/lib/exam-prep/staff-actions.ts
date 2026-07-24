"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import { splitPassageIntoSentences } from "@/lib/exam-prep/split-sentences";
import {
  createAssignmentSchema,
  createPassageSchema,
  createWorkbookSchema,
  updateSentenceSchema,
} from "@/lib/exam-prep/schemas";
import { getPresetSteps } from "@/lib/exam-prep/presets";
import { generateRuleBasedQuestions } from "@/lib/exam-prep/generate-rule-questions";
import type {
  ExamPassageSentence,
  ExamPresetType,
  ExamStepType,
} from "@/lib/exam-prep/types";

async function requireStaff() {
  if (!isExamPrepEnabled()) {
    return { ok: false as const, message: "기능을 사용할 수 없습니다." };
  }
  const profile = await getCurrentProfile();
  if (
    !profile ||
    (profile.role !== "admin" && profile.role !== "teacher") ||
    !profile.academy_id
  ) {
    return { ok: false as const, message: "권한이 없습니다." };
  }
  if (profile.role === "teacher" && profile.is_active === false) {
    return { ok: false as const, message: "비활성 계정입니다." };
  }
  return { ok: true as const, profile };
}

function revalidateExamPrep() {
  revalidatePath("/admin/exam-prep");
  revalidatePath("/teacher/exam-prep");
  revalidatePath("/student/exam-prep");
}

export async function createPassageAction(raw: unknown) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const parsed = createPassageSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, message: "입력값을 확인해 주세요." };
  }
  const data = parsed.data;
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("exam_passages")
    .insert({
      academy_id: auth.profile.academy_id,
      title: data.title,
      original_text: data.original_text,
      grade: data.grade ?? null,
      school_name: data.school_name ?? null,
      textbook_name: data.textbook_name ?? null,
      publisher: data.publisher ?? null,
      unit_name: data.unit_name ?? null,
      exam_range: data.exam_range ?? null,
      passage_number: data.passage_number ?? null,
      passage_type: data.passage_type ?? null,
      difficulty: data.difficulty ?? null,
      full_translation: data.full_translation ?? null,
      teacher_note: data.teacher_note ?? null,
      exam_points: data.exam_points ?? null,
      status: data.status ?? "draft",
      created_by: auth.profile.id,
    })
    .select("id")
    .single();
  if (error || !row) {
    return { ok: false as const, message: error?.message ?? "저장 실패" };
  }

  const sentences = splitPassageIntoSentences(data.original_text);
  if (sentences.length > 0) {
    await supabase.from("exam_passage_sentences").insert(
      sentences.map((english_text, i) => ({
        academy_id: auth.profile.academy_id,
        passage_id: row.id,
        sentence_order: i + 1,
        english_text,
        korean_text: null,
      }))
    );
  }

  revalidateExamPrep();
  return { ok: true as const, id: row.id as string };
}

export async function updatePassageAction(id: string, raw: unknown) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const parsed = createPassageSchema.partial().safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, message: "입력값을 확인해 주세요." };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("exam_passages")
    .update({
      ...parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("academy_id", auth.profile.academy_id);
  if (error) return { ok: false as const, message: error.message };
  revalidateExamPrep();
  return { ok: true as const };
}

export async function resplitPassageSentencesAction(passageId: string) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();
  const { data: passage, error } = await supabase
    .from("exam_passages")
    .select("id, original_text, academy_id")
    .eq("id", passageId)
    .eq("academy_id", auth.profile.academy_id)
    .single();
  if (error || !passage) {
    return { ok: false as const, message: "지문을 찾을 수 없습니다." };
  }

  await supabase
    .from("exam_passage_sentences")
    .delete()
    .eq("passage_id", passageId);

  const sentences = splitPassageIntoSentences(passage.original_text);
  if (sentences.length > 0) {
    await supabase.from("exam_passage_sentences").insert(
      sentences.map((english_text, i) => ({
        academy_id: auth.profile.academy_id,
        passage_id: passageId,
        sentence_order: i + 1,
        english_text,
      }))
    );
  }
  revalidateExamPrep();
  return { ok: true as const, count: sentences.length };
}

export async function saveSentencesAction(
  passageId: string,
  sentences: unknown[]
) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();

  const { data: passage } = await supabase
    .from("exam_passages")
    .select("id")
    .eq("id", passageId)
    .eq("academy_id", auth.profile.academy_id)
    .maybeSingle();
  if (!passage) return { ok: false as const, message: "지문 없음" };

  const validated = [];
  for (const s of sentences) {
    const p = updateSentenceSchema.safeParse(s);
    if (!p.success) {
      return { ok: false as const, message: "문장 데이터 오류" };
    }
    validated.push(p.data);
  }

  // 순서 재배치: 삭제 후 재삽입이 안전 (기존 id 유지 시 update)
  for (let i = 0; i < validated.length; i++) {
    const s = validated[i];
    const { error } = await supabase
      .from("exam_passage_sentences")
      .update({
        english_text: s.english_text,
        korean_text: s.korean_text,
        vocabulary: s.vocabulary ?? undefined,
        grammar_points: s.grammar_points ?? undefined,
        exam_points: s.exam_points ?? undefined,
        is_important_writing: s.is_important_writing,
        sentence_order: s.sentence_order ?? i + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", s.id)
      .eq("passage_id", passageId)
      .eq("academy_id", auth.profile.academy_id);
    if (error) return { ok: false as const, message: error.message };
  }

  revalidateExamPrep();
  return { ok: true as const };
}

export async function addSentenceAction(passageId: string, afterOrder: number) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();

  // shift orders
  const { data: rows } = await supabase
    .from("exam_passage_sentences")
    .select("id, sentence_order")
    .eq("passage_id", passageId)
    .eq("academy_id", auth.profile.academy_id)
    .gt("sentence_order", afterOrder)
    .order("sentence_order", { ascending: false });

  for (const r of rows ?? []) {
    await supabase
      .from("exam_passage_sentences")
      .update({ sentence_order: r.sentence_order + 1 })
      .eq("id", r.id);
  }

  const { data: inserted, error } = await supabase
    .from("exam_passage_sentences")
    .insert({
      academy_id: auth.profile.academy_id,
      passage_id: passageId,
      sentence_order: afterOrder + 1,
      english_text: "",
      korean_text: null,
    })
    .select("id")
    .single();

  if (error) return { ok: false as const, message: error.message };
  revalidateExamPrep();
  return { ok: true as const, id: inserted.id as string };
}

export async function deleteSentenceAction(sentenceId: string) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("exam_passage_sentences")
    .select("id, passage_id, sentence_order, academy_id")
    .eq("id", sentenceId)
    .eq("academy_id", auth.profile.academy_id)
    .maybeSingle();
  if (!row) return { ok: false as const, message: "문장 없음" };

  await supabase.from("exam_passage_sentences").delete().eq("id", sentenceId);

  const { data: rest } = await supabase
    .from("exam_passage_sentences")
    .select("id, sentence_order")
    .eq("passage_id", row.passage_id)
    .order("sentence_order", { ascending: true });

  let i = 1;
  for (const r of rest ?? []) {
    await supabase
      .from("exam_passage_sentences")
      .update({ sentence_order: i++ })
      .eq("id", r.id);
  }

  revalidateExamPrep();
  return { ok: true as const };
}

export async function reorderSentencesAction(
  passageId: string,
  orderedIds: string[]
) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();

  // temporary high orders to avoid unique conflicts
  for (let i = 0; i < orderedIds.length; i++) {
    await supabase
      .from("exam_passage_sentences")
      .update({ sentence_order: 10000 + i })
      .eq("id", orderedIds[i])
      .eq("passage_id", passageId)
      .eq("academy_id", auth.profile.academy_id);
  }
  for (let i = 0; i < orderedIds.length; i++) {
    await supabase
      .from("exam_passage_sentences")
      .update({ sentence_order: i + 1 })
      .eq("id", orderedIds[i])
      .eq("passage_id", passageId);
  }
  revalidateExamPrep();
  return { ok: true as const };
}

export async function createWorkbookAction(raw: unknown) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const result = createWorkbookSchema.safeParse(raw);
  if (!result.success) {
    return { ok: false as const, message: "입력값을 확인해 주세요." };
  }
  const data = result.data;
  const supabase = await createClient();

  const { data: passage } = await supabase
    .from("exam_passages")
    .select("id, title, status")
    .eq("id", data.passage_id)
    .eq("academy_id", auth.profile.academy_id)
    .maybeSingle();
  if (!passage) return { ok: false as const, message: "지문 없음" };
  if (passage.status !== "ready") {
    return {
      ok: false as const,
      message: "ready 상태의 지문만 워크북을 만들 수 있습니다.",
    };
  }

  const preset = (data.preset_type ?? "basic") as ExamPresetType;
  const steps =
    preset === "custom"
      ? getPresetSteps("basic")
      : getPresetSteps(preset);

  const { data: wb, error } = await supabase
    .from("exam_workbooks")
    .insert({
      academy_id: auth.profile.academy_id,
      passage_id: data.passage_id,
      title: data.title,
      description: data.description ?? null,
      preset_type: preset,
      status: "draft",
      created_by: auth.profile.id,
    })
    .select("id")
    .single();
  if (error || !wb) {
    return { ok: false as const, message: error?.message ?? "생성 실패" };
  }

  const { data: sentences } = await supabase
    .from("exam_passage_sentences")
    .select("*")
    .eq("passage_id", data.passage_id)
    .order("sentence_order", { ascending: true });

  const sentenceRows = (sentences ?? []) as ExamPassageSentence[];

  for (const st of steps) {
    const { data: stepRow, error: stepErr } = await supabase
      .from("exam_workbook_steps")
      .insert({
        academy_id: auth.profile.academy_id,
        workbook_id: wb.id,
        step_type: st.step_type,
        step_order: st.step_order,
        title: st.title,
        difficulty: st.difficulty,
        passing_score: st.passing_score,
        is_required: st.is_required,
        sequential_unlock: st.sequential_unlock,
        max_attempts: st.max_attempts,
        show_answer_policy: st.show_answer_policy,
        settings: st.settings,
      })
      .select("id")
      .single();
    if (stepErr || !stepRow) continue;

    const questions = generateRuleBasedQuestions(
      st.step_type as ExamStepType,
      sentenceRows,
      st.difficulty
    );
    if (questions.length === 0) continue;
    await supabase.from("exam_workbook_questions").insert(
      questions.map((q) => ({
        academy_id: auth.profile.academy_id,
        workbook_id: wb.id,
        step_id: stepRow.id,
        sentence_id: q.sentence_id,
        question_type: q.question_type,
        question_order: q.question_order,
        question_text: q.question_text,
        question_data: q.question_data,
        correct_answer: q.correct_answer,
        acceptable_answers: q.acceptable_answers,
        explanation: q.explanation,
        difficulty: q.difficulty,
        points: q.points,
        is_active: true,
        ai_generated: false,
      }))
    );
  }

  revalidateExamPrep();
  return { ok: true as const, id: wb.id as string };
}

export async function approveWorkbookAction(workbookId: string) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();
  const { data: wb } = await supabase
    .from("exam_workbooks")
    .select("id, status")
    .eq("id", workbookId)
    .eq("academy_id", auth.profile.academy_id)
    .maybeSingle();
  if (!wb) return { ok: false as const, message: "워크북 없음" };

  const { count } = await supabase
    .from("exam_workbook_questions")
    .select("id", { count: "exact", head: true })
    .eq("workbook_id", workbookId)
    .eq("is_active", true);
  if (!count || count < 1) {
    return { ok: false as const, message: "활성 문항이 없습니다." };
  }

  const { error } = await supabase
    .from("exam_workbooks")
    .update({
      status: "approved",
      approved_by: auth.profile.id,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", workbookId);
  if (error) return { ok: false as const, message: error.message };
  revalidateExamPrep();
  return { ok: true as const };
}

export async function updateQuestionAction(
  questionId: string,
  patch: {
    question_text?: string;
    question_data?: Record<string, unknown>;
    correct_answer?: unknown;
    acceptable_answers?: unknown;
    explanation?: string | null;
    points?: number;
    is_active?: boolean;
    difficulty?: string | null;
  }
) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();
  const { error } = await supabase
    .from("exam_workbook_questions")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", questionId)
    .eq("academy_id", auth.profile.academy_id);
  if (error) return { ok: false as const, message: error.message };
  revalidateExamPrep();
  return { ok: true as const };
}

export async function regenerateStepQuestionsAction(stepId: string) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();
  const { data: step } = await supabase
    .from("exam_workbook_steps")
    .select("*, exam_workbooks!inner(passage_id, academy_id, status)")
    .eq("id", stepId)
    .eq("academy_id", auth.profile.academy_id)
    .maybeSingle();
  if (!step) return { ok: false as const, message: "단계 없음" };
  const wb = step.exam_workbooks as {
    passage_id: string;
    academy_id: string;
    status: string;
  };
  if (wb.status === "approved") {
    return {
      ok: false as const,
      message: "승인된 워크북은 문항을 다시 생성할 수 없습니다. 상태를 변경하세요.",
    };
  }

  const { data: sentences } = await supabase
    .from("exam_passage_sentences")
    .select("*")
    .eq("passage_id", wb.passage_id)
    .order("sentence_order", { ascending: true });

  await supabase
    .from("exam_workbook_questions")
    .delete()
    .eq("step_id", stepId);

  const questions = generateRuleBasedQuestions(
    step.step_type,
    (sentences ?? []) as ExamPassageSentence[],
    step.difficulty ?? "medium"
  );
  if (questions.length > 0) {
    await supabase.from("exam_workbook_questions").insert(
      questions.map((q) => ({
        academy_id: auth.profile.academy_id,
        workbook_id: step.workbook_id,
        step_id: stepId,
        sentence_id: q.sentence_id,
        question_type: q.question_type,
        question_order: q.question_order,
        question_text: q.question_text,
        question_data: q.question_data,
        correct_answer: q.correct_answer,
        acceptable_answers: q.acceptable_answers,
        explanation: q.explanation,
        difficulty: q.difficulty,
        points: q.points,
        is_active: true,
        ai_generated: false,
      }))
    );
  }

  await supabase
    .from("exam_workbooks")
    .update({ status: "reviewing", updated_at: new Date().toISOString() })
    .eq("id", step.workbook_id);

  revalidateExamPrep();
  return { ok: true as const, count: questions.length };
}

export async function createAssignmentAction(raw: unknown) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const parsed = createAssignmentSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, message: "입력값을 확인해 주세요." };
  }
  const data = parsed.data;
  const supabase = await createClient();

  const { data: wb } = await supabase
    .from("exam_workbooks")
    .select("id, status")
    .eq("id", data.workbook_id)
    .eq("academy_id", auth.profile.academy_id)
    .maybeSingle();
  if (!wb) return { ok: false as const, message: "워크북 없음" };
  if (wb.status !== "approved") {
    return { ok: false as const, message: "승인된 워크북만 배정할 수 있습니다." };
  }

  const studentIds = new Set<string>(data.student_ids);
  for (const classId of data.class_ids) {
    const { data: members } = await supabase
      .from("class_students")
      .select("student_id")
      .eq("class_id", classId);
    for (const m of members ?? []) studentIds.add(m.student_id);
  }
  if (studentIds.size === 0) {
    return { ok: false as const, message: "배정할 학생이 없습니다." };
  }

  if (!data.allow_duplicate) {
    const { data: existing } = await supabase
      .from("exam_assignment_students")
      .select("student_id, exam_assignments!inner(workbook_id)")
      .in("student_id", [...studentIds])
      .eq("academy_id", auth.profile.academy_id);
    const dup = (existing ?? []).filter((e) => {
      const raw = e.exam_assignments as
        | { workbook_id: string }
        | { workbook_id: string }[]
        | null;
      const a = Array.isArray(raw) ? raw[0] ?? null : raw;
      return a?.workbook_id === data.workbook_id;
    });
    if (dup.length > 0) {
      return {
        ok: false as const,
        message: `이미 같은 워크북이 배정된 학생이 ${dup.length}명 있습니다. 재배정하려면 허용 옵션을 켜세요.`,
        duplicateCount: dup.length,
      };
    }
  }

  const primaryClass =
    data.class_ids.length === 1 ? data.class_ids[0] : data.class_ids[0] ?? null;

  const { data: assignment, error } = await supabase
    .from("exam_assignments")
    .insert({
      academy_id: auth.profile.academy_id,
      workbook_id: data.workbook_id,
      title: data.title,
      class_id: primaryClass,
      start_at: data.start_at ?? null,
      due_at: data.due_at ?? null,
      teacher_message: data.teacher_message ?? null,
      settings: data.settings ?? {},
      created_by: auth.profile.id,
    })
    .select("id")
    .single();
  if (error || !assignment) {
    return { ok: false as const, message: error?.message ?? "배정 실패" };
  }

  const { data: firstStep } = await supabase
    .from("exam_workbook_steps")
    .select("id")
    .eq("workbook_id", data.workbook_id)
    .order("step_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  await supabase.from("exam_assignment_students").insert(
    [...studentIds].map((student_id) => ({
      academy_id: auth.profile.academy_id,
      assignment_id: assignment.id,
      student_id,
      status: "not_started",
      current_step_id: firstStep?.id ?? null,
    }))
  );

  revalidateExamPrep();
  return {
    ok: true as const,
    id: assignment.id as string,
    studentCount: studentIds.size,
  };
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import { splitPassageIntoSentences } from "@/lib/exam-prep/split-sentences";
import {
  createAssignmentSchema,
  createPassageSchema,
  createPassagesBulkSchema,
  createWorkbookSchema,
  updateSentenceSchema,
} from "@/lib/exam-prep/schemas";
import { getPresetSteps, buildStepsFromNumbers } from "@/lib/exam-prep/presets";
import { generateStepQuestionsWithAi } from "@/lib/exam-prep/generate-ai-questions";
import { generateRuleBasedQuestions } from "@/lib/exam-prep/generate-rule-questions";
import { CREDIT_FEATURES, debitFeatureCredits } from "@/lib/credits";
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
      school_level: data.school_level ?? null,
      school_name: data.school_name ?? null,
      source: data.source ?? null,
      exam_name: data.exam_name ?? null,
      exam_year: data.exam_year ?? null,
      exam_month: data.exam_month ?? null,
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
  // 해석 미입력 시 AI 자동 채움 (실패해도 지문 생성은 유지)
  let enrichNote: string | null = null;
  try {
    const enrich = await enrichPassageSentencesAction(row.id as string);
    enrichNote = enrich.ok
      ? `우리말 해석을 AI로 채웠습니다.`
      : `해석 자동 채움 보류: ${enrich.message}`;
  } catch {
    enrichNote = "해석 자동 채움 중 오류가 발생했습니다.";
  }

  return {
    ok: true as const,
    id: row.id as string,
    enrichNote,
  };
}

export async function createPassagesBulkAction(raw: unknown) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const parsed = createPassagesBulkSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false as const,
      message:
        "입력값을 확인해 주세요. (세트 제목 + 영어 지문이 있는 행만 저장됩니다)",
    };
  }
  const {
    set_title: setTitle,
    grade: sharedGrade,
    school_name: schoolName,
    rows,
  } = parsed.data;
  const supabase = await createClient();
  const academyId = auth.profile.academy_id!;
  const createdIds: string[] = [];

  const { data: setRow, error: setErr } = await supabase
    .from("exam_passage_sets")
    .insert({
      academy_id: academyId,
      title: setTitle,
      grade: sharedGrade || null,
      school_name: schoolName || null,
      status: "draft",
      created_by: auth.profile.id,
    })
    .select("id")
    .single();
  if (setErr || !setRow) {
    return {
      ok: false as const,
      message: setErr?.message ?? "세트 생성 실패",
    };
  }

  const passageInserts = rows.map((row, i) => {
    const source = row.source?.trim() || null;
    const n = i + 1;
    const title = source ? `지문 ${n} · ${source}` : `지문 ${n}`;
    const numMatch = source?.match(/(\d+)\s*번/);
    return {
      academy_id: academyId,
      set_id: setRow.id,
      title: title.slice(0, 200),
      original_text: row.original_text,
      grade: row.grade?.trim() || sharedGrade || null,
      school_name: schoolName || null,
      exam_range: source,
      passage_number: numMatch?.[1] ?? String(n),
      status: "draft" as const,
      created_by: auth.profile.id,
    };
  });

  const { data: inserted, error } = await supabase
    .from("exam_passages")
    .insert(passageInserts)
    .select("id, original_text");
  if (error || !inserted?.length) {
    await supabase.from("exam_passage_sets").delete().eq("id", setRow.id);
    return { ok: false as const, message: error?.message ?? "일괄 저장 실패" };
  }

  const sentenceRows: Array<{
    academy_id: string;
    passage_id: string;
    sentence_order: number;
    english_text: string;
  }> = [];
  for (const p of inserted) {
    createdIds.push(p.id);
    const sentences = splitPassageIntoSentences(p.original_text);
    sentences.forEach((english_text, si) => {
      sentenceRows.push({
        academy_id: academyId,
        passage_id: p.id,
        sentence_order: si + 1,
        english_text,
      });
    });
  }
  if (sentenceRows.length > 0) {
    const chunk = 200;
    for (let i = 0; i < sentenceRows.length; i += chunk) {
      const { error: sErr } = await supabase
        .from("exam_passage_sentences")
        .insert(sentenceRows.slice(i, i + chunk));
      if (sErr) {
        return {
          ok: false as const,
          message: `지문은 저장됐으나 문장 분리 일부 실패: ${sErr.message}`,
          ids: createdIds,
          count: createdIds.length,
          setId: setRow.id as string,
        };
      }
    }
  }

  revalidateExamPrep();
  return {
    ok: true as const,
    ids: createdIds,
    count: createdIds.length,
    setId: setRow.id as string,
  };
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
  let enrichNote: string | null = null;
  try {
    const enrich = await enrichPassageSentencesAction(passageId);
    enrichNote = enrich.ok
      ? "우리말 해석을 AI로 채웠습니다."
      : `해석 자동 채움 보류: ${enrich.message}`;
  } catch {
    enrichNote = "해석 자동 채움 중 오류가 발생했습니다.";
  }
  return { ok: true as const, count: sentences.length, enrichNote };
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
        paragraph_number: s.paragraph_number ?? 1,
        is_paragraph_start: s.is_paragraph_start ?? false,
        teacher_note: s.teacher_note ?? null,
        student_note: s.student_note ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", s.id)
      .eq("passage_id", passageId)
      .eq("academy_id", auth.profile.academy_id);
    if (error) return { ok: false as const, message: error.message };
  }

  revalidateExamPrep();

  const needsEnrich = validated.some((s) => !String(s.korean_text ?? "").trim());
  let enrichNote: string | null = null;
  if (needsEnrich) {
    try {
      const enrich = await enrichPassageSentencesAction(passageId);
      enrichNote = enrich.ok
        ? "비어 있던 우리말 해석을 AI로 채웠습니다."
        : `해석 자동 채움 보류: ${enrich.message}`;
    } catch {
      enrichNote = "해석 자동 채움 중 오류가 발생했습니다.";
    }
  }

  return { ok: true as const, enrichNote };
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
  if (passage.status === "archived") {
    return {
      ok: false as const,
      message: "보관된 지문으로는 워크북을 만들 수 없습니다.",
    };
  }

  const { count: sentenceCount } = await supabase
    .from("exam_passage_sentences")
    .select("id", { count: "exact", head: true })
    .eq("passage_id", passage.id);
  if (!sentenceCount || sentenceCount < 1) {
    return {
      ok: false as const,
      message: "문장이 없는 지문입니다. 지문에서 문장을 분리해 주세요.",
    };
  }

  // draft 지문으로 생성 시 ready로 승격해 이후 목록에도 보이게 함
  if (passage.status === "draft") {
    await supabase
      .from("exam_passages")
      .update({
        status: "ready",
        updated_at: new Date().toISOString(),
      })
      .eq("id", passage.id)
      .eq("academy_id", auth.profile.academy_id);
  }

  const preset = (data.preset_type ?? "custom") as ExamPresetType;
  const steps =
    data.step_numbers && data.step_numbers.length > 0
      ? buildStepsFromNumbers(data.step_numbers)
      : preset === "custom"
        ? buildStepsFromNumbers([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
        : getPresetSteps(preset);

  if (steps.length === 0) {
    return { ok: false as const, message: "학습 단계를 한 개 이상 선택해 주세요." };
  }

  const { data: wb, error } = await supabase
    .from("exam_workbooks")
    .insert({
      academy_id: auth.profile.academy_id,
      passage_id: data.passage_id,
      title: data.title,
      description: data.description ?? null,
      preset_type: data.step_numbers?.length ? "custom" : preset,
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

  let sentenceRows = (sentences ?? []) as ExamPassageSentence[];
  const needsKo = sentenceRows.some((s) => !String(s.korean_text ?? "").trim());
  if (needsKo) {
    await enrichPassageSentencesAction(data.passage_id);
    const { data: refreshed } = await supabase
      .from("exam_passage_sentences")
      .select("*")
      .eq("passage_id", data.passage_id)
      .order("sentence_order", { ascending: true });
    sentenceRows = (refreshed ?? []) as ExamPassageSentence[];
  }

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

    // 변형 실험 세트만 규칙 스킵 — 인천 10단계는 규칙/후속 AI 생성
    if (String(st.step_type).startsWith("variant_")) continue;

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

  const { data: passageMeta } = await supabase
    .from("exam_passages")
    .select("original_text, grade, title")
    .eq("id", wb.passage_id)
    .maybeSingle();

  const { data: sentences } = await supabase
    .from("exam_passage_sentences")
    .select("*")
    .eq("passage_id", wb.passage_id)
    .order("sentence_order", { ascending: true });

  await supabase
    .from("exam_workbook_questions")
    .delete()
    .eq("step_id", stepId);

  const sentenceRows = (sentences ?? []) as ExamPassageSentence[];
  const passageText =
    (passageMeta?.original_text as string | undefined)?.trim() ||
    sentenceRows.map((s) => s.english_text).join(" ");

  const generated = await generateStepQuestionsWithAi(
    step.step_type as ExamStepType,
    sentenceRows,
    step.difficulty ?? "medium",
    {
      passageText,
      settings: (step.settings ?? {}) as Record<string, unknown>,
      grade: (passageMeta?.grade as string | null) ?? "고1",
      sourceDetail: (passageMeta?.title as string | null) ?? undefined,
    }
  );
  const questions = generated.questions;

  if (generated.source === "ai" && questions.length > 0) {
    try {
      await debitFeatureCredits(supabase, {
        academyId: auth.profile.academy_id!,
        featureKey: CREDIT_FEATURES.exam_prep_workbook_ai,
        actorId: auth.profile.id,
        idempotencyKey: `exam_prep_ai_step:${stepId}:${Date.now()}`,
        quantity: 1,
        metadata: { stepId, workbookId: step.workbook_id, source: "ai" },
      });
    } catch (e) {
      // 문항은 저장하되 크레딧 안내
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
            ai_generated: q.ai_generated === true,
          }))
        );
      }
      await supabase
        .from("exam_workbooks")
        .update({ status: "reviewing", updated_at: new Date().toISOString() })
        .eq("id", step.workbook_id);
      revalidateExamPrep();
      const msg = e instanceof Error ? e.message : "크레딧 차감 실패";
      return {
        ok: true as const,
        count: questions.length,
        source: generated.source,
        creditWarning: msg,
      };
    }
  }

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
        ai_generated: q.ai_generated === true,
      }))
    );
  }

  await supabase
    .from("exam_workbooks")
    .update({ status: "reviewing", updated_at: new Date().toISOString() })
    .eq("id", step.workbook_id);

  revalidateExamPrep();
  return {
    ok: true as const,
    count: questions.length,
    source: generated.source,
  };
}

/** 빈 단계만 규칙 기반으로 즉시 채움 (AI 버튼 없이) */
export async function fillEmptyWorkbookQuestionsAction(workbookId: string) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();

  const { data: wb } = await supabase
    .from("exam_workbooks")
    .select("id, passage_id, status")
    .eq("id", workbookId)
    .eq("academy_id", auth.profile.academy_id)
    .maybeSingle();
  if (!wb) return { ok: false as const, message: "워크북 없음" };
  if (wb.status === "approved") {
    return { ok: false as const, message: "승인된 워크북은 수정할 수 없습니다." };
  }

  const { data: sentences } = await supabase
    .from("exam_passage_sentences")
    .select("*")
    .eq("passage_id", wb.passage_id)
    .order("sentence_order", { ascending: true });

  let sentenceRows = (sentences ?? []) as ExamPassageSentence[];
  if (sentenceRows.some((s) => !String(s.korean_text ?? "").trim())) {
    await enrichPassageSentencesAction(wb.passage_id as string);
    const refreshed = await supabase
      .from("exam_passage_sentences")
      .select("*")
      .eq("passage_id", wb.passage_id)
      .order("sentence_order", { ascending: true });
    sentenceRows = (refreshed.data ?? []) as ExamPassageSentence[];
  }

  const { data: steps } = await supabase
    .from("exam_workbook_steps")
    .select("id, step_type, difficulty, step_order")
    .eq("workbook_id", workbookId)
    .order("step_order", { ascending: true });

  let filledSteps = 0;
  let filledQuestions = 0;

  for (const st of steps ?? []) {
    const { count } = await supabase
      .from("exam_workbook_questions")
      .select("id", { count: "exact", head: true })
      .eq("step_id", st.id)
      .eq("is_active", true);
    if ((count ?? 0) > 0) continue;

    const drafts = generateRuleBasedQuestions(
      st.step_type as ExamStepType,
      sentenceRows,
      (st.difficulty as string) || "medium"
    );
    if (drafts.length === 0) continue;

    const { error } = await supabase.from("exam_workbook_questions").insert(
      drafts.map((q) => ({
        academy_id: auth.profile.academy_id,
        workbook_id: workbookId,
        step_id: st.id,
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
    if (!error) {
      filledSteps += 1;
      filledQuestions += drafts.length;
    }
  }

  revalidateExamPrep();
  return {
    ok: true as const,
    filledSteps,
    filledQuestions,
    message:
      filledQuestions > 0
        ? `빈 단계 ${filledSteps}개에 문항 ${filledQuestions}개를 자동 생성했습니다.`
        : "모든 단계에 문항이 이미 있습니다.",
  };
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

/** 강사가 needs_review 답안을 수동 채점 */
export async function teacherGradeAnswerAction(raw: {
  answerId: string;
  isCorrect: boolean;
  feedback?: string;
  score?: number;
}) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();

  const { data: answer } = await supabase
    .from("exam_answers")
    .select(
      "id, academy_id, question_id, attempt_id, score, exam_workbook_questions(points, sentence_id)"
    )
    .eq("id", raw.answerId)
    .eq("academy_id", auth.profile.academy_id)
    .maybeSingle();
  if (!answer) return { ok: false as const, message: "답안 없음" };

  const q = answer.exam_workbook_questions as
    | { points: number; sentence_id: string | null }
    | { points: number; sentence_id: string | null }[]
    | null;
  const qRow = Array.isArray(q) ? q[0] : q;
  const points = Number(qRow?.points) || 1;
  const score =
    typeof raw.score === "number"
      ? Math.min(points, Math.max(0, raw.score))
      : raw.isCorrect
        ? points
        : 0;

  const { error } = await supabase
    .from("exam_answers")
    .update({
      is_correct: raw.isCorrect,
      score,
      grading_status: raw.isCorrect ? "teacher_correct" : "teacher_incorrect",
      teacher_feedback: raw.feedback?.trim() || null,
      graded_by: auth.profile.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", raw.answerId);

  if (error) return { ok: false as const, message: error.message };

  // 오답 노트 연동
  const { data: attempt } = await supabase
    .from("exam_attempts")
    .select("assignment_student_id")
    .eq("id", answer.attempt_id)
    .maybeSingle();

  const asId = attempt?.assignment_student_id as string | undefined;
  const { data: asRow } = asId
    ? await supabase
        .from("exam_assignment_students")
        .select("id, student_id, academy_id")
        .eq("id", asId)
        .maybeSingle()
    : { data: null };

  if (asRow) {
    if (!raw.isCorrect) {
      const { data: existingWrong } = await supabase
        .from("exam_wrong_answers")
        .select("id, wrong_count")
        .eq("student_id", asRow.student_id)
        .eq("question_id", answer.question_id)
        .eq("assignment_student_id", asRow.id)
        .maybeSingle();
      if (existingWrong) {
        await supabase
          .from("exam_wrong_answers")
          .update({
            wrong_count: (existingWrong.wrong_count ?? 1) + 1,
            last_wrong_at: new Date().toISOString(),
            is_mastered: false,
            mastered_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingWrong.id);
      } else {
        await supabase.from("exam_wrong_answers").insert({
          academy_id: asRow.academy_id,
          student_id: asRow.student_id,
          assignment_student_id: asRow.id,
          question_id: answer.question_id,
          sentence_id: qRow?.sentence_id ?? null,
          error_category: "writing_review",
          wrong_count: 1,
        });
      }
    } else {
      await supabase
        .from("exam_wrong_answers")
        .update({
          is_mastered: true,
          mastered_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("student_id", asRow.student_id)
        .eq("question_id", answer.question_id)
        .eq("assignment_student_id", asRow.id)
        .eq("is_mastered", false);
    }
  }

  revalidateExamPrep();
  revalidatePath("/admin/exam-prep/progress");
  revalidatePath("/teacher/exam-prep/progress");
  return { ok: true as const };
}

/** 문장 해석·어휘 AI 초안 채우기 (원문 영어 미수정) */
export async function enrichPassageSentencesAction(passageId: string) {
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

  const { data: sentences } = await supabase
    .from("exam_passage_sentences")
    .select("id, english_text, korean_text, vocabulary, grammar_points")
    .eq("passage_id", passageId)
    .order("sentence_order", { ascending: true });

  const rows = sentences ?? [];
  if (rows.length === 0) {
    return { ok: false as const, message: "문장이 없습니다." };
  }

  try {
    await debitFeatureCredits(supabase, {
      academyId: auth.profile.academy_id!,
      featureKey: CREDIT_FEATURES.exam_prep_workbook_ai,
      actorId: auth.profile.id,
      idempotencyKey: `exam_prep_enrich:${passageId}:${Date.now()}`,
      quantity: 1,
      metadata: { passageId, kind: "sentence_enrich" },
    });
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "크레딧 차감 실패",
    };
  }

  const { enrichSentencesWithAi } = await import(
    "@/lib/exam-prep/enrich-sentences-ai"
  );
  let enriched;
  try {
    enriched = await enrichSentencesWithAi(rows);
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "AI 해석 생성 실패",
    };
  }

  let updated = 0;
  for (const item of enriched) {
    const prev = rows.find((r) => r.id === item.sentenceId);
    if (!prev) continue;
    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (!(prev.korean_text ?? "").trim() && item.korean) {
      patch.korean_text = item.korean;
    }
    if (item.vocabulary.length > 0) {
      patch.vocabulary = item.vocabulary;
    }
    if (item.grammarPoints.length > 0) {
      patch.grammar_points = item.grammarPoints;
    }
    if (Object.keys(patch).length <= 1) continue;
    const { error } = await supabase
      .from("exam_passage_sentences")
      .update(patch)
      .eq("id", item.sentenceId);
    if (!error) updated += 1;
  }

  revalidateExamPrep();
  return { ok: true as const, updated, total: enriched.length };
}

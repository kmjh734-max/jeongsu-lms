"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import { gradeStage4TranslationWithAi } from "@/lib/exam-prep/stage4-grade-ai";
import {
  STAGE4_DEFAULTS,
  computePassageAverageScore,
  isBlankOrWhitespace,
  parseKeyMeaningPoints,
  type ExamStage4Progress,
  type ExamStage4Setting,
  type Stage4SentenceAnswerState,
} from "@/lib/exam-prep/stage4-types";

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

async function loadPassageCtx(assignmentId: string) {
  const admin = createAdminClient();
  const { data: assignment } = await admin
    .from("exam_assignments")
    .select("id, workbook_id")
    .eq("id", assignmentId)
    .maybeSingle();
  if (!assignment?.workbook_id) return null;
  const { data: workbook } = await admin
    .from("exam_workbooks")
    .select("id, passage_id")
    .eq("id", assignment.workbook_id)
    .maybeSingle();
  if (!workbook?.passage_id) return null;
  const { data: passage } = await admin
    .from("exam_passages")
    .select(
      "id, title, school_level, grade, source, exam_name, passage_number, stage4_published"
    )
    .eq("id", workbook.passage_id)
    .maybeSingle();
  return passage ? { passage, workbookId: workbook.id as string } : null;
}

async function assertPriorStages(assignmentStudentId: string) {
  const admin = createAdminClient();
  const { data: s1 } = await admin
    .from("exam_stage1_progress")
    .select("completed_at")
    .eq("assignment_student_id", assignmentStudentId)
    .eq("stage_number", 1)
    .maybeSingle();
  if (!s1?.completed_at) {
    return { ok: false as const, code: "stage1_required" as const };
  }
  const { data: s2 } = await admin
    .from("exam_stage2_progress")
    .select("completed_at")
    .eq("assignment_student_id", assignmentStudentId)
    .eq("stage_number", 2)
    .maybeSingle();
  if (!s2?.completed_at) {
    return { ok: false as const, code: "stage2_required" as const };
  }
  const { data: s3 } = await admin
    .from("exam_stage2_progress")
    .select("completed_at")
    .eq("assignment_student_id", assignmentStudentId)
    .eq("stage_number", 3)
    .maybeSingle();
  if (!s3?.completed_at) {
    return { ok: false as const, code: "stage3_required" as const };
  }
  return { ok: true as const };
}

function parseAnswers(raw: unknown): Record<string, Stage4SentenceAnswerState> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, Stage4SentenceAnswerState> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!v || typeof v !== "object") continue;
    const o = v as Record<string, unknown>;
    out[k] = {
      value: String(o.value ?? ""),
      status: (o.status as Stage4SentenceAnswerState["status"]) || "draft",
      attempts: Number(o.attempts) || 0,
      latestScore: o.latestScore != null ? Number(o.latestScore) : null,
      finalScore: o.finalScore != null ? Number(o.finalScore) : null,
      isPass: Boolean(o.isPass),
      modelTranslationRevealed: Boolean(o.modelTranslationRevealed),
      revealedModelTranslation:
        typeof o.revealedModelTranslation === "string"
          ? o.revealedModelTranslation
          : null,
      overallFeedback:
        typeof o.overallFeedback === "string" ? o.overallFeedback : null,
      naturalnessFeedback:
        typeof o.naturalnessFeedback === "string"
          ? o.naturalnessFeedback
          : null,
      meaningResults: Array.isArray(o.meaningResults)
        ? (o.meaningResults as Stage4SentenceAnswerState["meaningResults"])
        : [],
      missingMeanings: Array.isArray(o.missingMeanings)
        ? (o.missingMeanings as string[])
        : [],
      mistranslations: Array.isArray(o.mistranslations)
        ? (o.mistranslations as string[])
        : [],
      gradingSource:
        (o.gradingSource as Stage4SentenceAnswerState["gradingSource"]) ??
        null,
      lastSavedAt:
        typeof o.lastSavedAt === "string" ? o.lastSavedAt : null,
      submittedAt:
        typeof o.submittedAt === "string" ? o.submittedAt : null,
    };
  }
  return out;
}

function sanitizeAnswersForClient(
  answers: Record<string, Stage4SentenceAnswerState>
): Record<string, Stage4SentenceAnswerState> {
  const out: Record<string, Stage4SentenceAnswerState> = {};
  for (const [id, a] of Object.entries(answers)) {
    out[id] = {
      ...a,
      revealedModelTranslation: a.modelTranslationRevealed
        ? a.revealedModelTranslation ?? null
        : null,
    };
  }
  return out;
}

export async function loadStage4StudentDataAction(input: {
  assignmentStudentId: string;
}) {
  const auth = await requireStudent();
  if (!auth.ok) return auth;

  const asRow = await assertAssignmentOwned(
    input.assignmentStudentId,
    auth.profile.id
  );
  if (!asRow) {
    return {
      ok: false as const,
      message: "배정을 찾을 수 없습니다.",
      code: "no_assignment" as const,
    };
  }

  const ctx = await loadPassageCtx(asRow.assignment_id);
  if (!ctx) {
    return {
      ok: false as const,
      message: "지문을 찾을 수 없습니다.",
      code: "no_passage" as const,
    };
  }

  const prior = await assertPriorStages(input.assignmentStudentId);
  if (!prior.ok) {
    const messages = {
      stage1_required: "1단계 지문 익히기를 먼저 완료해 주세요.",
      stage2_required: "2단계 우리말 빈칸 완성하기를 먼저 완료해 주세요.",
      stage3_required: "3단계 영문 빈칸 완성하기를 먼저 완료해 주세요.",
    };
    return {
      ok: false as const,
      message: messages[prior.code],
      code: prior.code,
      passage: ctx.passage,
    };
  }

  if (!ctx.passage.stage4_published) {
    return {
      ok: false as const,
      message: "4단계가 아직 공개되지 않았습니다.",
      code: "not_published" as const,
      passage: ctx.passage,
    };
  }

  const admin = createAdminClient();
  const [{ data: sentences }, { data: settingsRows }] = await Promise.all([
    admin
      .from("exam_passage_sentences")
      .select("id, sentence_order, english_text, paragraph_number, is_paragraph_start")
      .eq("passage_id", ctx.passage.id)
      .order("sentence_order", { ascending: true }),
    admin
      .from("exam_stage_translation_settings")
      .select("*")
      .eq("passage_id", ctx.passage.id)
      .eq("stage_number", 4),
  ]);

  const settings = (settingsRows ?? []) as ExamStage4Setting[];
  const requiredIds = settings
    .filter((s) => s.is_required)
    .map((s) => s.sentence_id);
  // settings 없으면 영어 있는 문장 전부
  const publicSentences = (sentences ?? []).map((s) => ({
    id: s.id as string,
    sentence_order: Number(s.sentence_order),
    english_text: String(s.english_text ?? ""),
    paragraph_number: Number(s.paragraph_number) || 1,
    is_paragraph_start: Boolean(s.is_paragraph_start),
    isRequired:
      requiredIds.length > 0
        ? requiredIds.includes(s.id as string)
        : Boolean(String(s.english_text ?? "").trim()),
    maxScore:
      settings.find((x) => x.sentence_id === s.id)?.max_score ?? 100,
    minimumPassScore:
      settings.find((x) => x.sentence_id === s.id)?.minimum_pass_score ?? 70,
  }));

  if (publicSentences.filter((s) => s.isRequired).length < 1) {
    return {
      ok: false as const,
      message: "4단계 필수 문장이 준비되지 않았습니다.",
      code: "no_sentences" as const,
      passage: ctx.passage,
    };
  }

  const supabase = await createClient();
  const { data: progressRow } = await supabase
    .from("exam_stage2_progress")
    .select("*")
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 4)
    .maybeSingle();

  const answers = sanitizeAnswersForClient(
    parseAnswers(progressRow?.answers)
  );

  return {
    ok: true as const,
    passage: ctx.passage,
    sentences: publicSentences,
    progress: progressRow
      ? ({
          ...(progressRow as ExamStage4Progress),
          answers,
        } as ExamStage4Progress)
      : null,
    thresholds: STAGE4_DEFAULTS,
  };
}

export async function saveStage4DraftAction(input: {
  assignmentStudentId: string;
  passageId: string;
  answers: Record<string, string>;
  expectedRevision?: number;
}) {
  const auth = await requireStudent();
  if (!auth.ok) return auth;
  const asRow = await assertAssignmentOwned(
    input.assignmentStudentId,
    auth.profile.id
  );
  if (!asRow) return { ok: false as const, message: "배정 없음" };

  const prior = await assertPriorStages(input.assignmentStudentId);
  if (!prior.ok) {
    return { ok: false as const, message: "이전 단계를 먼저 완료해 주세요." };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("exam_stage2_progress")
    .select("*")
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 4)
    .maybeSingle();

  if (
    existing &&
    input.expectedRevision != null &&
    Number(existing.revision) > input.expectedRevision
  ) {
    return {
      ok: false as const,
      message: "다른 기기에서 더 최근 답안이 있습니다. 새로고침해 주세요.",
      code: "stale" as const,
    };
  }

  const prev = parseAnswers(existing?.answers);
  const next = { ...prev };
  const now = new Date().toISOString();
  for (const [sid, value] of Object.entries(input.answers)) {
    const p = next[sid];
    if (p?.status === "passed") continue;
    next[sid] = {
      value,
      status: p?.status === "draft" || !p ? "draft" : p.status,
      attempts: p?.attempts ?? 0,
      latestScore: p?.latestScore ?? null,
      finalScore: p?.finalScore ?? null,
      isPass: p?.isPass ?? false,
      modelTranslationRevealed: p?.modelTranslationRevealed ?? false,
      revealedModelTranslation: p?.revealedModelTranslation ?? null,
      overallFeedback: p?.overallFeedback ?? null,
      naturalnessFeedback: p?.naturalnessFeedback ?? null,
      meaningResults: p?.meaningResults ?? [],
      missingMeanings: p?.missingMeanings ?? [],
      mistranslations: p?.mistranslations ?? [],
      gradingSource: p?.gradingSource ?? null,
      lastSavedAt: now,
      submittedAt: p?.submittedAt ?? null,
    };
  }

  const { data, error } = await supabase
    .from("exam_stage2_progress")
    .upsert(
      {
        academy_id: asRow.academy_id ?? auth.profile.academy_id,
        assignment_student_id: input.assignmentStudentId,
        passage_id: input.passageId,
        stage_number: 4,
        answers: next,
        revision: (Number(existing?.revision) || 0) + 1,
        updated_at: now,
      },
      { onConflict: "assignment_student_id,stage_number" }
    )
    .select("*")
    .single();

  if (error) return { ok: false as const, message: error.message };
  return {
    ok: true as const,
    progress: {
      ...(data as ExamStage4Progress),
      answers: sanitizeAnswersForClient(parseAnswers(data.answers)),
    },
  };
}

export async function submitStage4SentenceAction(input: {
  assignmentStudentId: string;
  passageId: string;
  sentenceId: string;
  answerText: string;
  clearAnswer?: boolean;
}) {
  const auth = await requireStudent();
  if (!auth.ok) return auth;
  const asRow = await assertAssignmentOwned(
    input.assignmentStudentId,
    auth.profile.id
  );
  if (!asRow) return { ok: false as const, message: "배정 없음" };

  const prior = await assertPriorStages(input.assignmentStudentId);
  if (!prior.ok) {
    return { ok: false as const, message: "이전 단계를 먼저 완료해 주세요." };
  }

  if (isBlankOrWhitespace(input.answerText)) {
    return { ok: false as const, message: "해석을 입력해 주세요." };
  }

  const admin = createAdminClient();
  const [{ data: sentence }, { data: settingRow }, { data: passage }] =
    await Promise.all([
      admin
        .from("exam_passage_sentences")
        .select("id, english_text, korean_text")
        .eq("id", input.sentenceId)
        .eq("passage_id", input.passageId)
        .maybeSingle(),
      admin
        .from("exam_stage_translation_settings")
        .select("*")
        .eq("passage_id", input.passageId)
        .eq("sentence_id", input.sentenceId)
        .eq("stage_number", 4)
        .maybeSingle(),
      admin
        .from("exam_passages")
        .select("stage4_published")
        .eq("id", input.passageId)
        .maybeSingle(),
    ]);

  if (!passage?.stage4_published) {
    return { ok: false as const, message: "4단계가 공개되지 않았습니다." };
  }
  if (!sentence) return { ok: false as const, message: "문장을 찾을 수 없습니다." };

  const setting = settingRow as ExamStage4Setting | null;
  const modelTranslation =
    setting?.override_model_translation?.trim() ||
    String(sentence.korean_text ?? "").trim();
  const keyMeaningPoints = parseKeyMeaningPoints(
    setting?.key_meaning_points
  );
  const maxScore = setting?.max_score ?? 100;
  const minimumPassScore = setting?.minimum_pass_score ?? 70;
  const gradingMode = setting?.grading_mode ?? "ai_assisted";

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("exam_stage2_progress")
    .select("*")
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 4)
    .maybeSingle();

  if (existing?.completed_at) {
    return { ok: false as const, message: "이미 4단계를 완료했습니다." };
  }

  const answers = parseAnswers(existing?.answers);
  const prev = answers[input.sentenceId];
  const attemptNumber = (prev?.attempts ?? 0) + 1;

  // 먼저 답안 저장
  const { data: attemptRow, error: attemptErr } = await admin
    .from("exam_stage4_attempts")
    .insert({
      academy_id: asRow.academy_id ?? auth.profile.academy_id,
      assignment_student_id: input.assignmentStudentId,
      passage_id: input.passageId,
      sentence_id: input.sentenceId,
      attempt_number: attemptNumber,
      answer_text: input.answerText,
      status: "grading",
      model_translation_revealed: prev?.modelTranslationRevealed ?? false,
    })
    .select("*")
    .single();

  if (attemptErr) {
    return { ok: false as const, message: attemptErr.message };
  }

  let gradeResult = await gradeStage4TranslationWithAi({
    englishText: String(sentence.english_text ?? ""),
    modelTranslation,
    studentAnswer: input.answerText,
    keyMeaningPoints,
    acceptedExpressions: setting?.accepted_expressions ?? [],
    commonErrors: setting?.common_errors ?? [],
    teacherExplanation: setting?.teacher_explanation,
    maxScore,
    minimumPassScore,
  });

  if (gradingMode === "manual_only") {
    gradeResult = {
      score: 0,
      isPass: false,
      meaningResults: [],
      missingMeanings: [],
      mistranslations: [],
      naturalnessFeedback: "",
      overallFeedback: "선생님 확인을 기다리고 있습니다.",
      requiresTeacherReview: true,
    };
  }

  if (!gradeResult) {
    gradeResult = {
      score: 0,
      isPass: false,
      meaningResults: [],
      missingMeanings: [],
      mistranslations: [],
      naturalnessFeedback: "",
      overallFeedback:
        "자동 피드백을 생성하지 못해 선생님 확인을 기다리고 있습니다.",
      requiresTeacherReview: true,
    };
  }

  const pending = gradeResult.requiresTeacherReview;
  const passed = !pending && gradeResult.score >= minimumPassScore;
  const status = pending
    ? "pending_review"
    : passed
      ? "passed"
      : "needs_retry";

  await admin
    .from("exam_stage4_attempts")
    .update({
      ai_score: gradeResult.score,
      final_score: pending ? null : gradeResult.score,
      ai_result_json: gradeResult,
      status,
      grading_source: "ai",
    })
    .eq("id", attemptRow.id);

  const revealed = prev?.modelTranslationRevealed ?? false;
  answers[input.sentenceId] = {
    value: input.clearAnswer ? "" : input.answerText,
    status,
    attempts: attemptNumber,
    latestScore: gradeResult.score,
    finalScore: pending ? null : gradeResult.score,
    isPass: passed,
    modelTranslationRevealed: revealed,
    revealedModelTranslation: revealed ? modelTranslation : null,
    overallFeedback: gradeResult.overallFeedback,
    naturalnessFeedback: gradeResult.naturalnessFeedback,
    meaningResults: gradeResult.meaningResults,
    missingMeanings: gradeResult.missingMeanings,
    mistranslations: gradeResult.mistranslations,
    gradingSource: "ai",
    lastSavedAt: new Date().toISOString(),
    submittedAt: new Date().toISOString(),
  };

  const requiredIds = (
    await admin
      .from("exam_stage_translation_settings")
      .select("sentence_id, is_required")
      .eq("passage_id", input.passageId)
      .eq("stage_number", 4)
  ).data;
  let requiredSentenceIds =
    (requiredIds ?? [])
      .filter((r) => r.is_required)
      .map((r) => r.sentence_id as string) ?? [];
  if (requiredSentenceIds.length === 0) {
    requiredSentenceIds = [input.sentenceId];
  }

  const completed = Object.entries(answers)
    .filter(([, a]) => a.isPass)
    .map(([id]) => id);
  const incorrect = Object.entries(answers)
    .filter(([, a]) => a.status === "needs_retry")
    .map(([id]) => id);
  const score = computePassageAverageScore(answers, requiredSentenceIds);

  const { data: progress, error: progErr } = await supabase
    .from("exam_stage2_progress")
    .upsert(
      {
        academy_id: asRow.academy_id ?? auth.profile.academy_id,
        assignment_student_id: input.assignmentStudentId,
        passage_id: input.passageId,
        stage_number: 4,
        answers,
        correct_blank_ids: completed,
        incorrect_blank_ids: incorrect,
        completed_blank_ids: completed,
        attempt_count: (Number(existing?.attempt_count) || 0) + 1,
        score,
        progress_percent: Math.round(
          (completed.filter((id) => requiredSentenceIds.includes(id)).length /
            Math.max(1, requiredSentenceIds.length)) *
            100
        ),
        revision: (Number(existing?.revision) || 0) + 1,
        last_attempt_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "assignment_student_id,stage_number" }
    )
    .select("*")
    .single();

  if (progErr) return { ok: false as const, message: progErr.message };

  return {
    ok: true as const,
    pendingReview: pending,
    message: pending
      ? "답안이 저장되었습니다. 현재 자동 피드백을 생성하지 못해 선생님 확인을 기다리고 있습니다."
      : passed
        ? "채점이 완료되었습니다."
        : "채점이 완료되었습니다. 피드백을 확인하고 다시 풀어 보세요.",
    progress: {
      ...(progress as ExamStage4Progress),
      answers: sanitizeAnswersForClient(parseAnswers(progress.answers)),
    },
    sentenceState: sanitizeAnswersForClient(answers)[input.sentenceId],
  };
}

export async function submitStage4AllAction(input: {
  assignmentStudentId: string;
  passageId: string;
  answers: Record<string, string>;
}) {
  const results = [];
  for (const [sentenceId, answerText] of Object.entries(input.answers)) {
    if (isBlankOrWhitespace(answerText)) continue;
    const r = await submitStage4SentenceAction({
      assignmentStudentId: input.assignmentStudentId,
      passageId: input.passageId,
      sentenceId,
      answerText,
    });
    results.push({ sentenceId, ...r });
  }
  const failed = results.find((r) => !r.ok);
  if (failed && "message" in failed) {
    return { ok: false as const, message: failed.message, results };
  }
  return { ok: true as const, results };
}

export async function revealStage4ModelAction(input: {
  assignmentStudentId: string;
  sentenceId: string;
}) {
  const auth = await requireStudent();
  if (!auth.ok) return auth;
  const asRow = await assertAssignmentOwned(
    input.assignmentStudentId,
    auth.profile.id
  );
  if (!asRow) return { ok: false as const, message: "배정 없음" };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("exam_stage2_progress")
    .select("*")
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 4)
    .maybeSingle();

  const answers = parseAnswers(existing?.answers);
  const st = answers[input.sentenceId];
  if (!st || st.attempts < STAGE4_DEFAULTS.revealAfterAttempts) {
    return {
      ok: false as const,
      message: `${STAGE4_DEFAULTS.revealAfterAttempts}회 이상 제출 후 모범 해석을 확인할 수 있습니다.`,
    };
  }

  const admin = createAdminClient();
  const { data: sentence } = await admin
    .from("exam_passage_sentences")
    .select("korean_text")
    .eq("id", input.sentenceId)
    .maybeSingle();
  const { data: setting } = await admin
    .from("exam_stage_translation_settings")
    .select("override_model_translation")
    .eq("sentence_id", input.sentenceId)
    .eq("stage_number", 4)
    .maybeSingle();

  const model =
    setting?.override_model_translation?.trim() ||
    String(sentence?.korean_text ?? "").trim();
  if (!model) {
    return { ok: false as const, message: "모범 해석이 없습니다." };
  }

  answers[input.sentenceId] = {
    ...st,
    modelTranslationRevealed: true,
    revealedModelTranslation: model,
  };

  await admin
    .from("exam_stage4_attempts")
    .update({ model_translation_revealed: true })
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("sentence_id", input.sentenceId);

  const { data, error } = await supabase
    .from("exam_stage2_progress")
    .update({
      answers,
      revision: (Number(existing?.revision) || 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 4)
    .select("*")
    .single();

  if (error) return { ok: false as const, message: error.message };
  return {
    ok: true as const,
    modelTranslation: model,
    progress: {
      ...(data as ExamStage4Progress),
      answers: sanitizeAnswersForClient(parseAnswers(data.answers)),
    },
  };
}

export async function completeStage4Action(input: {
  assignmentStudentId: string;
  passageId: string;
  stepId: string;
}) {
  const auth = await requireStudent();
  if (!auth.ok) return auth;
  const asRow = await assertAssignmentOwned(
    input.assignmentStudentId,
    auth.profile.id
  );
  if (!asRow) return { ok: false as const, message: "배정 없음" };

  const prior = await assertPriorStages(input.assignmentStudentId);
  if (!prior.ok) {
    return { ok: false as const, message: "이전 단계를 먼저 완료해 주세요." };
  }

  const admin = createAdminClient();
  const { data: settings } = await admin
    .from("exam_stage_translation_settings")
    .select("sentence_id, is_required")
    .eq("passage_id", input.passageId)
    .eq("stage_number", 4);

  let required = (settings ?? [])
    .filter((s) => s.is_required)
    .map((s) => s.sentence_id as string);
  if (required.length === 0) {
    const { data: sentences } = await admin
      .from("exam_passage_sentences")
      .select("id, korean_text")
      .eq("passage_id", input.passageId);
    required = (sentences ?? [])
      .filter((s) => String(s.korean_text ?? "").trim())
      .map((s) => s.id as string);
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("exam_stage2_progress")
    .select("*")
    .eq("assignment_student_id", input.assignmentStudentId)
    .eq("stage_number", 4)
    .maybeSingle();

  if (existing?.completed_at) {
    return {
      ok: true as const,
      message: "4단계 학습을 완료했습니다. 5단계를 시작할 수 있습니다.",
      alreadyCompleted: true,
    };
  }

  const answers = parseAnswers(existing?.answers);
  for (const sid of required) {
    const a = answers[sid];
    if (!a?.isPass || a.status === "pending_review" || a.status === "error") {
      return {
        ok: false as const,
        message:
          "모든 필수 문장을 통과해야 합니다. 검토 대기·오류 문장이 있으면 완료할 수 없습니다.",
      };
    }
  }

  const score = computePassageAverageScore(answers, required);
  await supabase.from("exam_stage2_progress").upsert(
    {
      academy_id: asRow.academy_id ?? auth.profile.academy_id,
      assignment_student_id: input.assignmentStudentId,
      passage_id: input.passageId,
      stage_number: 4,
      answers,
      correct_blank_ids: required,
      completed_blank_ids: required,
      incorrect_blank_ids: [],
      score,
      progress_percent: 100,
      completed_at: new Date().toISOString(),
      revision: (Number(existing?.revision) || 0) + 1,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "assignment_student_id,stage_number" }
  );

  const { startOrResumeAttemptAction, submitStepAttemptAction } = await import(
    "@/lib/exam-prep/student-actions"
  );
  const started = await startOrResumeAttemptAction(
    input.assignmentStudentId,
    input.stepId
  );
  if (started.ok && "attempt" in started && started.attempt) {
    const { data: questions } = await admin
      .from("exam_workbook_questions")
      .select("id, sentence_id, correct_answer")
      .eq("step_id", input.stepId)
      .eq("is_active", true);
    const submitAnswers: Record<string, unknown> = {};
    for (const q of questions ?? []) {
      const sid = q.sentence_id as string | null;
      const text =
        (sid && answers[sid]?.value) ||
        (typeof q.correct_answer === "object" &&
        q.correct_answer &&
        "text" in (q.correct_answer as object)
          ? String((q.correct_answer as { text: string }).text)
          : "");
      submitAnswers[q.id as string] = { text };
    }
    await submitStepAttemptAction({
      assignment_student_id: input.assignmentStudentId,
      step_id: input.stepId,
      attempt_id: started.attempt.id,
      answers: submitAnswers,
    });
  }

  revalidatePath(`/student/exam-prep/${input.assignmentStudentId}`);
  return {
    ok: true as const,
    message: "4단계 학습을 완료했습니다. 5단계를 시작할 수 있습니다.",
    stageCompleted: true,
  };
}

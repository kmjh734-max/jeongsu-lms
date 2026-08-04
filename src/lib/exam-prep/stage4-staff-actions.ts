"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import {
  meaningWeightSum,
  parseKeyMeaningPoints,
  type ExamStage4Setting,
  type Stage4SettingDraft,
} from "@/lib/exam-prep/stage4-types";

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
  return { ok: true as const, profile };
}

function revalidatePassage(passageId: string) {
  revalidatePath(`/admin/exam-prep/passages/${passageId}`);
  revalidatePath(`/teacher/exam-prep/passages/${passageId}`);
  revalidatePath("/student/exam-prep");
  revalidatePath("/teacher/exam-prep/progress");
  revalidatePath("/admin/exam-prep/progress");
}

export async function listStage4SettingsAction(passageId: string) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exam_stage_translation_settings")
    .select("*")
    .eq("passage_id", passageId)
    .eq("academy_id", auth.profile.academy_id)
    .eq("stage_number", 4);
  if (error) return { ok: false as const, message: error.message };
  const settings = (data ?? []).map((row) => ({
    ...(row as ExamStage4Setting),
    key_meaning_points: parseKeyMeaningPoints(
      (row as { key_meaning_points: unknown }).key_meaning_points
    ),
  }));
  return { ok: true as const, settings };
}

export async function saveStage4SettingsAction(
  passageId: string,
  drafts: Stage4SettingDraft[]
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

  const warnings: string[] = [];
  for (const d of drafts) {
    const sum = meaningWeightSum(d.key_meaning_points);
    if (d.key_meaning_points.length > 0 && sum !== 100) {
      warnings.push(
        `문장 ${d.sentence_id.slice(0, 8)}…: 핵심 의미 요소 가중치 합계가 ${sum}입니다 (100 권장).`
      );
    }
  }

  for (const d of drafts) {
    const row = {
      academy_id: auth.profile.academy_id,
      passage_id: passageId,
      sentence_id: d.sentence_id,
      stage_number: 4,
      override_model_translation: d.override_model_translation?.trim() || null,
      key_meaning_points: d.key_meaning_points,
      accepted_expressions: d.accepted_expressions ?? [],
      common_errors: d.common_errors ?? [],
      teacher_explanation: d.teacher_explanation ?? null,
      max_score: d.max_score ?? 100,
      minimum_pass_score: d.minimum_pass_score ?? 70,
      grading_mode: d.grading_mode ?? "ai_assisted",
      manual_review_required: d.manual_review_required ?? false,
      is_required: d.is_required ?? true,
      created_by: auth.profile.id,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("exam_stage_translation_settings")
      .upsert(row, { onConflict: "passage_id,sentence_id,stage_number" });
    if (error) return { ok: false as const, message: error.message };
  }

  revalidatePassage(passageId);
  return { ok: true as const, count: drafts.length, warnings };
}

export async function ensureDefaultStage4SettingsAction(passageId: string) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();

  const { data: sentences } = await supabase
    .from("exam_passage_sentences")
    .select("id, korean_text")
    .eq("passage_id", passageId)
    .eq("academy_id", auth.profile.academy_id)
    .order("sentence_order", { ascending: true });

  const { data: existing } = await supabase
    .from("exam_stage_translation_settings")
    .select("sentence_id")
    .eq("passage_id", passageId)
    .eq("stage_number", 4);
  const have = new Set((existing ?? []).map((r) => r.sentence_id as string));

  const toInsert = (sentences ?? [])
    .filter((s) => !have.has(s.id as string))
    .map((s) => ({
      academy_id: auth.profile.academy_id,
      passage_id: passageId,
      sentence_id: s.id,
      stage_number: 4,
      key_meaning_points: [],
      accepted_expressions: [],
      common_errors: [],
      max_score: 100,
      minimum_pass_score: 70,
      grading_mode: "ai_assisted",
      is_required: Boolean(String(s.korean_text ?? "").trim()),
      created_by: auth.profile.id,
    }));

  if (toInsert.length > 0) {
    const { error } = await supabase
      .from("exam_stage_translation_settings")
      .insert(toInsert);
    if (error) return { ok: false as const, message: error.message };
  }

  revalidatePassage(passageId);
  return { ok: true as const, created: toInsert.length };
}

export async function setStage4PublishedAction(
  passageId: string,
  published: boolean
) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();

  if (published) {
    const { data: settings } = await supabase
      .from("exam_stage_translation_settings")
      .select("sentence_id, is_required, key_meaning_points")
      .eq("passage_id", passageId)
      .eq("academy_id", auth.profile.academy_id)
      .eq("stage_number", 4);

    const required = (settings ?? []).filter((s) => s.is_required);
    if (required.length < 1) {
      return {
        ok: false as const,
        message:
          "필수 문장이 최소 1개 있어야 공개할 수 있습니다. 설정을 저장해 주세요.",
      };
    }
    for (const s of required) {
      const points = parseKeyMeaningPoints(s.key_meaning_points);
      if (points.length > 0 && meaningWeightSum(points) !== 100) {
        return {
          ok: false as const,
          message:
            "공개 전 핵심 의미 요소의 가중치 합계가 100이 되도록 맞춰 주세요.",
        };
      }
    }

    const { data: sentences } = await supabase
      .from("exam_passage_sentences")
      .select("id, korean_text")
      .eq("passage_id", passageId);
    const koMap = new Map(
      (sentences ?? []).map((s) => [s.id as string, String(s.korean_text ?? "")])
    );
    for (const s of required) {
      if (!koMap.get(s.sentence_id as string)?.trim()) {
        return {
          ok: false as const,
          message: "필수 문장에 모범 해석(1단계 우리말)이 없습니다.",
        };
      }
    }
  }

  const { error } = await supabase
    .from("exam_passages")
    .update({
      stage4_published: published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", passageId)
    .eq("academy_id", auth.profile.academy_id);
  if (error) return { ok: false as const, message: error.message };

  revalidatePassage(passageId);
  return { ok: true as const };
}

export async function teacherGradeStage4AttemptAction(input: {
  attemptId: string;
  teacherScore: number;
  teacherFeedback: string;
  passed: boolean;
}) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();

  const { data: attempt } = await supabase
    .from("exam_stage4_attempts")
    .select("*")
    .eq("id", input.attemptId)
    .eq("academy_id", auth.profile.academy_id)
    .maybeSingle();
  if (!attempt) return { ok: false as const, message: "시도를 찾을 수 없습니다." };

  const score = Math.min(100, Math.max(0, Math.round(input.teacherScore)));
  const status = input.passed ? "passed" : "needs_retry";

  const { error } = await supabase
    .from("exam_stage4_attempts")
    .update({
      teacher_score: score,
      final_score: score,
      teacher_feedback: input.teacherFeedback,
      status,
      grading_source:
        attempt.ai_score != null ? "ai_then_teacher" : "teacher",
      reviewed_at: new Date().toISOString(),
      reviewed_by: auth.profile.id,
    })
    .eq("id", input.attemptId);
  if (error) return { ok: false as const, message: error.message };

  // progress answers 갱신
  const { data: progress } = await supabase
    .from("exam_stage2_progress")
    .select("*")
    .eq("assignment_student_id", attempt.assignment_student_id)
    .eq("stage_number", 4)
    .maybeSingle();

  if (progress) {
    const answers = {
      ...((progress.answers as Record<string, unknown>) ?? {}),
    } as Record<string, Record<string, unknown>>;
    const sid = attempt.sentence_id as string;
    const prev = answers[sid] ?? {};
    answers[sid] = {
      ...prev,
      status,
      latestScore: score,
      finalScore: score,
      isPass: input.passed,
      overallFeedback: input.teacherFeedback,
      gradingSource: attempt.ai_score != null ? "ai_then_teacher" : "teacher",
    };
    const completed = new Set<string>(
      (progress.completed_blank_ids as string[]) ?? []
    );
    const incorrect = new Set<string>(
      (progress.incorrect_blank_ids as string[]) ?? []
    );
    if (input.passed) {
      completed.add(sid);
      incorrect.delete(sid);
    } else {
      completed.delete(sid);
      incorrect.add(sid);
    }
    await supabase
      .from("exam_stage2_progress")
      .update({
        answers,
        completed_blank_ids: [...completed],
        incorrect_blank_ids: [...incorrect],
        correct_blank_ids: [...completed],
        updated_at: new Date().toISOString(),
        revision: (Number(progress.revision) || 0) + 1,
      })
      .eq("id", progress.id);
  }

  revalidatePath("/teacher/exam-prep/progress");
  revalidatePath("/admin/exam-prep/progress");
  return { ok: true as const };
}

export async function listPendingStage4ReviewsAction(passageId?: string) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;
  const supabase = await createClient();
  let q = supabase
    .from("exam_stage4_attempts")
    .select(
      "id, assignment_student_id, passage_id, sentence_id, attempt_number, answer_text, ai_score, final_score, ai_result_json, status, submitted_at"
    )
    .eq("academy_id", auth.profile.academy_id)
    .eq("status", "pending_review")
    .order("submitted_at", { ascending: false })
    .limit(50);
  if (passageId) q = q.eq("passage_id", passageId);
  const { data, error } = await q;
  if (error) return { ok: false as const, message: error.message };
  return { ok: true as const, attempts: data ?? [] };
}

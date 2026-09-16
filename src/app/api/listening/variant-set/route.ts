import { NextResponse } from "next/server";
import { assertListeningOpenAiEnv } from "@/lib/listening/assert-listening-openai";
import { assertListeningSetWritable } from "@/lib/listening/listening-api-auth";
import { CREDIT_FEATURES } from "@/lib/credits";
import { debitLessonCredits } from "@/lib/credits/lesson-credits";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchListeningSetGradeLevel } from "@/lib/listening/fetch-set-grade";
import { persistGeneratedQuestions } from "@/lib/listening/persist-questions";
import { runWithConcurrency } from "@/lib/run-with-concurrency";
import {
  generateVariantQuestion,
  type StoredQuestionForVariant,
} from "@/lib/listening/variant-question";
import type { ValidatedListeningQuestion } from "@/lib/listening/run-question-validation";

export const maxDuration = 800;

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

/** 한 번에 만드는 문항 수 — 문항끼리 기다리지 않게 나눠 부른다 */
const PARALLEL = 4;

/**
 * 이 세트와 비슷한 새 세트 — 문항 순서·유형·정답 자리를 그대로 두고 소재만 바꾼 회차를 새로 만든다.
 * 새 세트는 같은 폴더에 공개하지 않은 상태로 들어간다(음성·그림은 따로 만들어야 한다).
 */
export async function POST(request: Request) {
  try {
    let apiKey: string;
    try {
      ({ apiKey } = assertListeningOpenAiEnv());
    } catch (e) {
      return jsonError(e instanceof Error ? e.message : "OpenAI 설정 오류");
    }

    const body = (await request.json()) as { setId?: string; title?: string };
    const setId = body.setId?.trim();
    if (!setId) return jsonError("setId가 필요합니다.");

    const access = await assertListeningSetWritable(setId);
    if (!access.ok) return jsonError(access.message, access.status);

    const admin = createAdminClient();
    const { data: setRow } = await admin
      .from("listening_sets")
      .select("id, title, grade_level, academy_id, folder_id, teacher_id, created_by, order_index")
      .eq("id", setId)
      .maybeSingle();
    if (!setRow) return jsonError("세트를 찾을 수 없습니다.");

    const { data: rows } = await admin
      .from("listening_questions")
      .select(
        "id, order_index, question_type, instruction, question_text, script_text, script_translation, choices, correct_answer, answer_clue, explanation, table_data, previous_turn, blank_speaker"
      )
      .eq("set_id", setId)
      .order("order_index", { ascending: true });
    const sources = (rows ?? []) as StoredQuestionForVariant[];
    if (sources.length === 0) return jsonError("문항이 없는 세트입니다.");

    const gradeLevel = await fetchListeningSetGradeLevel(setId);
    const results = await runWithConcurrency(sources, PARALLEL, async (src) => {
      try {
        return await generateVariantQuestion(apiKey, src, gradeLevel);
      } catch {
        return null;
      }
    });
    const made = results.filter((q): q is ValidatedListeningQuestion => q != null);
    if (made.length === 0) return jsonError("비슷한 문항을 만들지 못했습니다.");

    const title = body.title?.trim() || `${setRow.title ?? "듣기"} (비슷한 회차)`;
    const { data: created, error: createErr } = await admin
      .from("listening_sets")
      .insert({
        title,
        grade_level: setRow.grade_level,
        academy_id: setRow.academy_id,
        folder_id: setRow.folder_id,
        teacher_id: setRow.teacher_id ?? access.profile.id,
        created_by: access.profile.id,
        // 만든 세트는 늘 비공개로 둔다 — 음성·그림을 만들고 확인한 뒤 공개한다
        is_published: false,
      })
      .select("id")
      .single();
    if (createErr || !created) return jsonError("새 세트를 만들지 못했습니다.");

    const saved = await persistGeneratedQuestions(created.id, made, { replaceAll: true });

    const academyId = setRow.academy_id ?? access.profile.academy_id ?? null;
    if (academyId) {
      await debitLessonCredits({
        academyId,
        actorId: access.profile.id,
        featureKey: CREDIT_FEATURES.listening_variant_questions,
        quantity: saved.length,
        metadata: { set_id: created.id, source_set_id: setId, variant: true },
        note: `비슷한 세트 ${saved.length}문항 만들기`,
      });
    }

    return NextResponse.json({
      ok: true,
      setId: created.id,
      title,
      made: saved.length,
      missing: sources.length - made.length,
      needsReview: made.filter((q) => q.needs_review).length,
    });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "비슷한 세트 만들기 실패");
  }
}

import { NextResponse } from "next/server";
import { assertListeningOpenAiEnv } from "@/lib/listening/assert-listening-openai";
import { assertListeningSetWritable } from "@/lib/listening/listening-api-auth";
import { CREDIT_FEATURES } from "@/lib/credits";
import { debitLessonCredits } from "@/lib/credits/lesson-credits";
import { fetchListeningSetGradeLevel } from "@/lib/listening/fetch-set-grade";
import { replaceGeneratedQuestion } from "@/lib/listening/persist-questions";
import {
  generateVariantQuestion,
  type StoredQuestionForVariant,
} from "@/lib/listening/variant-question";

export const maxDuration = 300;

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

/**
 * 비슷한 문항으로 다시 만들기 — 이미 있는 문항의 겉(이름·장소·물건·숫자)만 바꾼 평행 문항으로 바꿔 끼운다.
 * 유형·구조·정답 자리·난이도는 그대로라 새로 만드는 길보다 훨씬 적게 든다.
 */
export async function POST(request: Request) {
  try {
    let apiKey: string;
    try {
      ({ apiKey } = assertListeningOpenAiEnv());
    } catch (e) {
      return jsonError(e instanceof Error ? e.message : "OpenAI 설정 오류");
    }

    const body = (await request.json()) as { setId?: string; questionId?: string };
    const setId = body.setId?.trim();
    const questionId = body.questionId?.trim();
    if (!setId || !questionId) return jsonError("setId와 questionId가 필요합니다.");

    const access = await assertListeningSetWritable(setId);
    if (!access.ok) return jsonError(access.message, access.status);

    const { data: existing } = await access.admin
      .from("listening_questions")
      .select(
        "id, order_index, question_type, instruction, question_text, script_text, script_translation, choices, correct_answer, answer_clue, explanation, table_data, previous_turn, blank_speaker"
      )
      .eq("id", questionId)
      .eq("set_id", setId)
      .maybeSingle();
    if (!existing) return jsonError("문항을 찾을 수 없습니다.");

    const gradeLevel = await fetchListeningSetGradeLevel(setId);
    const generated = await generateVariantQuestion(
      apiKey,
      existing as StoredQuestionForVariant,
      gradeLevel
    );

    const academyId = access.setRow.academy_id ?? access.profile.academy_id ?? null;
    if (academyId) {
      await debitLessonCredits({
        academyId,
        actorId: access.profile.id,
        featureKey: CREDIT_FEATURES.listening_variant_questions,
        metadata: { set_id: setId, variant: true },
        note: "듣기 문항 1개 비슷한 문항으로 다시 만들기",
      });
    }

    const saved = await replaceGeneratedQuestion(setId, questionId, generated, gradeLevel);

    return NextResponse.json({
      ok: true,
      question: saved,
      needs_review: generated.needs_review,
      quality_score: generated.quality_score,
      quality_issues: generated.quality_issues,
      problems: generated.problems,
      audioNeedsRegeneration: true,
    });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "비슷한 문항 만들기 실패");
  }
}

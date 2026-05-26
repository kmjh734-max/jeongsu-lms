import { NextResponse } from "next/server";
import { getExamTypeById } from "@/lib/listening/exam-types";
import { assertListeningSetAccess } from "@/lib/listening/listening-api-auth";
import { runQuestionValidation } from "@/lib/listening/run-question-validation";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

function rowToGenerated(
  row: Record<string, unknown>,
  segments: Array<{ speaker_type: string; text: string }>
): GeneratedListeningQuestion {
  return {
    order_index: Number(row.order_index),
    question_type: String(row.question_type),
    instruction: String(row.instruction ?? ""),
    segments: segments.map((s) => ({
      speaker: s.speaker_type as "ANN" | "M" | "W",
      text: s.text,
    })),
    script_text: String(row.script_text ?? ""),
    script_translation: String(row.script_translation ?? ""),
    question_text: String(row.question_text ?? ""),
    choices: Array.isArray(row.choices) ? (row.choices as string[]) : [],
    correct_answer: Number(row.correct_answer),
    answer_clue: String(row.answer_clue ?? ""),
    explanation: String(row.explanation ?? ""),
  };
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) return jsonError("OPENAI_API_KEY가 설정되어 있지 않습니다.");

    const body = (await request.json()) as {
      setId?: string;
      questionId?: string;
      question?: GeneratedListeningQuestion;
      persist?: boolean;
    };

    let q = body.question;
    const questionId = body.questionId?.trim();
    const setId = body.setId?.trim();

    if (questionId && setId) {
      const access = await assertListeningSetAccess(setId);
      if (!access.ok) return jsonError(access.message, access.status);

      const { data: row } = await access.admin
        .from("listening_questions")
        .select("*")
        .eq("id", questionId)
        .eq("set_id", setId)
        .maybeSingle();

      if (!row) return jsonError("문항을 찾을 수 없습니다.");

      const { data: segs } = await access.admin
        .from("listening_question_segments")
        .select("speaker_type, text")
        .eq("question_id", questionId)
        .order("order_index", { ascending: true });

      q = rowToGenerated(row, segs ?? []);
    }

    if (!q) return jsonError("question 또는 questionId가 필요합니다.");

    const typeHint = getExamTypeById(q.order_index) ?? undefined;
    const validation = await runQuestionValidation(apiKey, q, typeHint);

    if (body.persist && questionId && setId) {
      const access = await assertListeningSetAccess(setId);
      if (!access.ok) return jsonError(access.message, access.status);

      await access.admin
        .from("listening_questions")
        .update({
          needs_review: validation.needs_review,
          quality_score: validation.quality_score,
          answer_clarity_score: validation.answer_clarity_score,
          quality_issues: validation.quality_issues,
          answer_validation: validation.answer_validation,
          answer_clue:
            q.answer_clue?.trim() ||
            validation.answer_validation.answer_clue ||
            q.answer_clue,
        })
        .eq("id", questionId);
    }

    return NextResponse.json({
      ok: true,
      validation: {
        quality_score: validation.quality_score,
        answer_clarity_score: validation.answer_clarity_score,
        is_answer_clear: validation.is_answer_clear,
        has_multiple_possible_answers: validation.has_multiple_possible_answers,
        has_answer_clue: validation.has_answer_clue,
        needs_review: validation.needs_review,
        problems: validation.problems,
        suggestions: validation.suggestions,
        quality_issues: validation.quality_issues,
        answer_validation: validation.answer_validation,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "검수 실패";
    return jsonError(message);
  }
}

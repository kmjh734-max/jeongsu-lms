import { NextResponse } from "next/server";
import type { ListeningDifficultyMode } from "@/lib/listening/exam-difficulty";
import { fetchListeningSetGradeLevel } from "@/lib/listening/fetch-set-grade";
import { assertListeningOpenAiEnv } from "@/lib/listening/assert-listening-openai";
import { generateSingleExamQuestion } from "@/lib/listening/generate-questions";
import { assertListeningSetAccess } from "@/lib/listening/listening-api-auth";
import { replaceGeneratedQuestion } from "@/lib/listening/persist-questions";
import { getExamTypeById } from "@/lib/listening/exam-types";

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function POST(request: Request) {
  try {
    let apiKey: string;
    try {
      ({ apiKey } = assertListeningOpenAiEnv());
    } catch (e) {
      return jsonError(e instanceof Error ? e.message : "OpenAI 설정 오류");
    }

    const body = (await request.json()) as {
      setId?: string;
      questionId?: string;
      typeId?: number;
      orderIndex?: number;
      questionType?: string;
      difficultyMode?: ListeningDifficultyMode;
      previousProblems?: string[];
    };

    const setId = body.setId?.trim();
    const questionId = body.questionId?.trim();
    if (!setId || !questionId) {
      return jsonError("setId와 questionId가 필요합니다.");
    }

    const access = await assertListeningSetAccess(setId);
    if (!access.ok) return jsonError(access.message, access.status);

    const { data: existing } = await access.admin
      .from("listening_questions")
      .select("id, order_index, quality_issues, answer_validation")
      .eq("id", questionId)
      .eq("set_id", setId)
      .maybeSingle();

    if (!existing) return jsonError("문항을 찾을 수 없습니다.");

    const gradeLevel = await fetchListeningSetGradeLevel(setId);
    const typeId = body.typeId ?? body.orderIndex ?? existing.order_index;
    const type = getExamTypeById(typeId, gradeLevel);
    if (!type) return jsonError("유형을 찾을 수 없습니다.");

    const prevFromBody = body.previousProblems ?? [];
    const storedIssues = Array.isArray(existing.quality_issues)
      ? (existing.quality_issues as Array<{ message?: string }>).map(
          (i) => i.message ?? ""
        )
      : [];
    const storedValidation = existing.answer_validation as {
      problems?: string[];
    } | null;
    const prevFromValidation = storedValidation?.problems ?? [];
    const previousProblems = [
      ...prevFromBody,
      ...storedIssues.filter(Boolean),
      ...prevFromValidation,
    ].slice(0, 12);

    const generated = await generateSingleExamQuestion(
      apiKey,
      typeId,
      body.difficultyMode ?? "auto",
      previousProblems.length ? previousProblems : undefined,
      gradeLevel
    );

    const saved = await replaceGeneratedQuestion(setId, questionId, generated);

    return NextResponse.json({
      ok: true,
      question: saved,
      needs_review: generated.needs_review,
      quality_score: generated.quality_score,
      answer_clarity_score: generated.answer_clarity_score,
      quality_issues: generated.quality_issues,
      answer_validation: generated.answer_validation,
      problems: generated.problems,
      audioNeedsRegeneration: true,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "재생성 실패";
    return jsonError(message);
  }
}

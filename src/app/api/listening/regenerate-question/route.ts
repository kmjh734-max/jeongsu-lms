import { NextResponse } from "next/server";
import type { ListeningDifficultyMode } from "@/lib/listening/exam-difficulty";
import { fetchListeningSetGradeLevel } from "@/lib/listening/fetch-set-grade";
import { assertListeningOpenAiEnv } from "@/lib/listening/assert-listening-openai";
import {
  generateSingleExamQuestion,
  type Type1RegenerationContext,
} from "@/lib/listening/generate-questions";
import {
  buildType1AvoidList,
  findType1SubjectFromAnswer,
} from "@/lib/listening/type1-subject-pool";
import { assertListeningSetAccess } from "@/lib/listening/listening-api-auth";
import { replaceGeneratedQuestion } from "@/lib/listening/persist-questions";
import { getExamTypeById, getExamTypesForGrade } from "@/lib/listening/exam-types";

export const maxDuration = 300;

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
      .select(
        "id, order_index, question_type, quality_issues, answer_validation, situation_type, choices, correct_answer, script_text"
      )
      .eq("id", questionId)
      .eq("set_id", setId)
      .maybeSingle();

    if (!existing) return jsonError("문항을 찾을 수 없습니다.");

    const gradeLevel = await fetchListeningSetGradeLevel(setId);
    const types = getExamTypesForGrade(gradeLevel);
    const typeFromQuestion = types.find(
      (t) => t.question_type === String(existing.question_type ?? "").trim()
    );
    const typeId =
      body.typeId ??
      typeFromQuestion?.id ??
      body.orderIndex ??
      existing.order_index;
    const slotIndex = existing.order_index;
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
    ];

    const existingChoices = Array.isArray(existing.choices)
      ? (existing.choices as string[])
      : [];
    const previousAnswer =
      existingChoices[(Number(existing.correct_answer) || 1) - 1] ?? "";
    const previousSubjectId = String(existing.situation_type ?? "").trim();
    const inferredSubjectId = findType1SubjectFromAnswer(previousAnswer)?.id;

    if (typeId === 1) {
      previousProblems.push(
        ...buildType1AvoidList([
          {
            order_index: existing.order_index,
            situation_type: previousSubjectId || inferredSubjectId,
            choices: existingChoices,
            correct_answer: Number(existing.correct_answer) || 1,
          },
        ])
      );
    }

    const trimmedProblems = previousProblems.filter(Boolean).slice(0, 12);

    let type1Regeneration: Type1RegenerationContext | undefined;
    if (typeId === 1) {
      const excludeSubjectIds = [
        ...new Set(
          [previousSubjectId, inferredSubjectId].filter((id): id is string =>
            Boolean(id)
          )
        ),
      ];
      type1Regeneration = {
        excludeSubjectIds,
        previousAnswer: previousAnswer || undefined,
        previousScript: String(existing.script_text ?? "").trim() || undefined,
      };
    }

    const generated = await generateSingleExamQuestion(
      apiKey,
      typeId,
      body.difficultyMode ?? "auto",
      trimmedProblems.length ? trimmedProblems : undefined,
      gradeLevel,
      slotIndex,
      type1Regeneration
    );

    const saved = await replaceGeneratedQuestion(
      setId,
      questionId,
      generated,
      gradeLevel
    );

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

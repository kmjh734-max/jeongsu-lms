import { NextResponse } from "next/server";
import type { ListeningDifficultyMode } from "@/lib/listening/exam-difficulty";
import { fetchListeningSetGradeLevel } from "@/lib/listening/fetch-set-grade";
import {
  generateSingleExamQuestion,
  generateSingleFreeQuestion,
  type Type1RegenerationContext,
} from "@/lib/listening/generate-questions";
import {
  buildType1AvoidList,
  findType1SubjectFromAnswer,
} from "@/lib/listening/type1-subject-pool";
import { assertListeningOpenAiEnv } from "@/lib/listening/assert-listening-openai";
import { assertListeningSetWritable } from "@/lib/listening/listening-api-auth";
import { persistGeneratedQuestions } from "@/lib/listening/persist-questions";
import type { ListeningGenerationMode } from "@/lib/listening/types";

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
      typeId?: number;
      orderIndex?: number;
      mode?: ListeningGenerationMode;
      difficultyMode?: ListeningDifficultyMode;
      persist?: boolean;
      previousProblems?: string[];
      previousQuestion?: {
        situation_type?: string;
        choices?: string[];
        correct_answer?: number;
        script_text?: string;
      };
    };

    const setId = body.setId?.trim();
    if (!setId) return jsonError("setId가 필요합니다.");

    const access = await assertListeningSetWritable(setId);
    if (!access.ok) return jsonError(access.message, access.status);

    const mode: ListeningGenerationMode = body.mode === "free" ? "free" : "exam";
    const typeId = body.typeId ?? body.orderIndex ?? 1;
    const slotIndex = body.orderIndex ?? typeId;

    const gradeLevel = await fetchListeningSetGradeLevel(setId);

    const previousProblems = [...(body.previousProblems ?? [])];
    let type1Regeneration: Type1RegenerationContext | undefined;
    const prev = body.previousQuestion;
    if (typeId === 1 && prev) {
      const choices = prev.choices ?? [];
      const previousAnswer = choices[(prev.correct_answer ?? 1) - 1] ?? "";
      const previousSubjectId = String(prev.situation_type ?? "").trim();
      const inferredSubjectId = findType1SubjectFromAnswer(previousAnswer)?.id;
      previousProblems.push(
        ...buildType1AvoidList([
          {
            order_index: slotIndex,
            situation_type: previousSubjectId || inferredSubjectId,
            choices,
            correct_answer: prev.correct_answer,
          },
        ])
      );
      type1Regeneration = {
        excludeSubjectIds: [
          ...new Set(
            [previousSubjectId, inferredSubjectId].filter(
              (id): id is string => Boolean(id)
            )
          ),
        ],
        previousAnswer: previousAnswer || undefined,
        previousScript: prev.script_text?.trim() || undefined,
      };
    }

    const generated =
      mode === "exam"
        ? await generateSingleExamQuestion(
            apiKey,
            typeId,
            body.difficultyMode ?? "auto",
            previousProblems.length ? previousProblems : undefined,
            gradeLevel,
            slotIndex,
            type1Regeneration
          )
        : await generateSingleFreeQuestion(
            apiKey,
            slotIndex,
            body.previousProblems,
            gradeLevel
          );

    if (body.persist) {
      const [saved] = await persistGeneratedQuestions(setId, [generated]);
      return NextResponse.json({
        ok: true,
        question: saved,
        schemaMigrationNeeded: saved.schema_extended_saved === false,
        schemaWarning:
          saved.schema_extended_saved === false
            ? "문항은 저장되었으나 DB 마이그레이션(027~036) 미적용으로 유형별 메타데이터는 저장되지 않았습니다. Supabase에서 RUN_LISTENING_027_THROUGH_036.sql을 실행하세요."
            : undefined,
        needs_review: generated.needs_review,
        quality_score: generated.quality_score,
        answer_clarity_score: generated.answer_clarity_score,
        quality_issues: generated.quality_issues,
        answer_validation: generated.answer_validation,
        problems: generated.problems,
      });
    }

    return NextResponse.json({
      ok: true,
      question: generated,
      needs_review: generated.needs_review,
      quality_score: generated.quality_score,
      answer_clarity_score: generated.answer_clarity_score,
      quality_issues: generated.quality_issues,
      answer_validation: generated.answer_validation,
      problems: generated.problems,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "문항 생성 중 오류";
    return jsonError(message);
  }
}

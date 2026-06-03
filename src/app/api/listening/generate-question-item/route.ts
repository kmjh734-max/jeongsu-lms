import { NextResponse } from "next/server";
import type { ListeningDifficultyMode } from "@/lib/listening/exam-difficulty";
import { fetchListeningSetGradeLevel } from "@/lib/listening/fetch-set-grade";
import {
  generateSingleExamQuestion,
  generateSingleFreeQuestion,
} from "@/lib/listening/generate-questions";
import { assertListeningSetAccess } from "@/lib/listening/listening-api-auth";
import { persistGeneratedQuestions } from "@/lib/listening/persist-questions";
import type { ListeningGenerationMode } from "@/lib/listening/types";

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return jsonError(
        "OPENAI_API_KEY가 설정되어 있지 않습니다. .env.local에 키를 추가한 뒤 서버를 재시작해 주세요."
      );
    }

    const body = (await request.json()) as {
      setId?: string;
      typeId?: number;
      orderIndex?: number;
      mode?: ListeningGenerationMode;
      difficultyMode?: ListeningDifficultyMode;
      persist?: boolean;
      previousProblems?: string[];
    };

    const setId = body.setId?.trim();
    if (!setId) return jsonError("setId가 필요합니다.");

    const access = await assertListeningSetAccess(setId);
    if (!access.ok) return jsonError(access.message, access.status);

    const mode: ListeningGenerationMode = body.mode === "free" ? "free" : "exam";
    const orderIndex = body.orderIndex ?? body.typeId ?? 1;

    const gradeLevel = await fetchListeningSetGradeLevel(setId);

    const generated =
      mode === "exam"
        ? await generateSingleExamQuestion(
            apiKey,
            body.typeId ?? orderIndex,
            body.difficultyMode ?? "auto",
            body.previousProblems,
            gradeLevel
          )
        : await generateSingleFreeQuestion(
            apiKey,
            orderIndex,
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

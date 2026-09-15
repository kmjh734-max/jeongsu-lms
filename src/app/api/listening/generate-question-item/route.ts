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
import { loadCurriculumAnswerUsage } from "@/lib/listening/curriculum-answer-usage";
import { CREDIT_FEATURES } from "@/lib/credits";
import { debitLessonCredits, lessonCreditShortfall } from "@/lib/credits/lesson-credits";
import { persistGeneratedQuestions } from "@/lib/listening/persist-questions";
import { examTypeCode, getExamTypeById } from "@/lib/listening/exam-types";
import { isListeningTypeKey } from "@/lib/listening/type-catalog";
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
      /** 배치표 밖 유형으로 만들 때 (예전 배치 문항 채우기) */
      typeKey?: string;
      variant?: string;
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

    // 문항 하나를 새로 만들 때마다 한 문항 값을 쓴다.
    const academyId = access.setRow.academy_id ?? access.profile.academy_id ?? null;
    if (academyId) {
      const shortfall = await lessonCreditShortfall(academyId, CREDIT_FEATURES.listening_generate_questions);
      if (shortfall) return jsonError(shortfall, 402);
    }

    const mode: ListeningGenerationMode = body.mode === "free" ? "free" : "exam";
    const typeId = body.typeId ?? body.orderIndex ?? 1;
    const slotIndex = body.orderIndex ?? typeId;

    const gradeLevel = await fetchListeningSetGradeLevel(setId);
    // typeId는 배치표 번호 — 유형별 규칙(정답 풀·1번 소재)은 모듈 번호로
    const typeKey = isListeningTypeKey(body.typeKey) ? body.typeKey : undefined;
    const baseType = getExamTypeById(typeId, gradeLevel);
    const code = baseType ? examTypeCode(baseType) : typeId;

    const previousProblems = [...(body.previousProblems ?? [])];
    let type1Regeneration: Type1RegenerationContext | undefined;
    const prev = body.previousQuestion;
    if (!typeKey && code === 1 && prev) {
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

    // 같은 과정의 다른 회차에서 이미 쓴 정답 (한 정답이 계속 반복되지 않게)
    const usedAnswers =
      mode === "exam"
        ? (await loadCurriculumAnswerUsage(access.admin, setId, gradeLevel))[code] ?? []
        : [];
    const prevAnswer = prev?.choices?.[(prev.correct_answer ?? 1) - 1];
    if (prevAnswer) usedAnswers.push(prevAnswer, prevAnswer);

    const generated =
      mode === "exam"
        ? await generateSingleExamQuestion(
            apiKey,
            typeId,
            body.difficultyMode ?? "auto",
            previousProblems.length ? previousProblems : undefined,
            gradeLevel,
            slotIndex,
            type1Regeneration,
            { usedAnswers, typeKey, variant: typeof body.variant === "string" ? body.variant : undefined }
          )
        : await generateSingleFreeQuestion(
            apiKey,
            slotIndex,
            body.previousProblems,
            gradeLevel
          );

    if (academyId) {
      await debitLessonCredits({
        academyId,
        actorId: access.profile.id,
        featureKey: CREDIT_FEATURES.listening_generate_questions,
        metadata: { set_id: setId },
        note: "듣기 문항 1개 생성",
      });
    }

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

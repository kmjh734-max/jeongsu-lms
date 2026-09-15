import { NextResponse } from "next/server";
import type { ListeningDifficultyMode } from "@/lib/listening/exam-difficulty";
import { fetchListeningSetGradeLevel } from "@/lib/listening/fetch-set-grade";
import {
  generateExamQuestionsFromSlotsSettled,
  generateFreeQuestionsFromSlotsSettled,
  type SlotGenerationResult,
} from "@/lib/listening/generate-exam-from-slots";
import { assertListeningOpenAiEnv } from "@/lib/listening/assert-listening-openai";
import { assertListeningSetWritable } from "@/lib/listening/listening-api-auth";
import { loadCurriculumAnswerUsage } from "@/lib/listening/curriculum-answer-usage";
import {
  clearListeningQuestionsForSet,
  persistGeneratedQuestions,
} from "@/lib/listening/persist-questions";
import type { ListeningGenerationSlot } from "@/lib/listening/generation-slots";
import { CREDIT_FEATURES } from "@/lib/credits";
import { debitLessonCredits, lessonCreditShortfall } from "@/lib/credits/lesson-credits";
import type {
  GeneratedListeningQuestion,
  ListeningGenerationMode,
} from "@/lib/listening/types";

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
      slots?: ListeningGenerationSlot[];
      mode?: ListeningGenerationMode;
      difficultyMode?: ListeningDifficultyMode;
      persist?: boolean;
    };

    const setId = body.setId?.trim();
    if (!setId) return jsonError("setId가 필요합니다.");

    const slots = body.slots ?? [];
    if (slots.length === 0) return jsonError("생성할 문항 슬롯이 없습니다.");

    const access = await assertListeningSetWritable(setId);
    if (!access.ok) return jsonError(access.message, access.status);

    // 화면의 문항 만들기는 이 경로로 온다. 만든 문항 수만큼 크레딧을 쓴다(모자라면 시작하지 않는다).
    const academyId = access.setRow.academy_id ?? access.profile.academy_id ?? null;
    if (academyId) {
      const shortfall = await lessonCreditShortfall(
        academyId,
        CREDIT_FEATURES.listening_generate_questions,
        slots.length
      );
      if (shortfall) return jsonError(shortfall, 402);
    }

    const mode: ListeningGenerationMode = body.mode === "free" ? "free" : "exam";
    const gradeLevel = await fetchListeningSetGradeLevel(setId);
    const difficultyMode = body.difficultyMode ?? "auto";

    // 같은 과정의 다른 회차에서 이미 쓴 정답 (한 정답이 계속 반복되지 않게)
    const usedAnswersByType =
      mode === "exam"
        ? await loadCurriculumAnswerUsage(access.admin, setId, gradeLevel)
        : undefined;

    let generated: SlotGenerationResult;
    try {
      generated =
        mode === "exam"
          ? await generateExamQuestionsFromSlotsSettled(
              apiKey,
              slots,
              difficultyMode,
              gradeLevel,
              { usedAnswersByType }
            )
          : await generateFreeQuestionsFromSlotsSettled(apiKey, slots, gradeLevel);
    } catch (e) {
      const message = e instanceof Error ? e.message : "문항 생성 실패";
      return jsonError(message);
    }

    const questions: GeneratedListeningQuestion[] = generated.questions;
    const missingSlotIndexes = generated.missingSlotIndexes;
    if (questions.length === 0) {
      return jsonError("문항을 만들지 못했습니다. 다시 시도해 주세요.");
    }

    // 일부만 만들어져도 만든 문항은 버리지 않고 저장·차감한다. 빠진 문항은 화면이 따로 다시 만든다.
    if (academyId) {
      await debitLessonCredits({
        academyId,
        actorId: access.profile.id,
        featureKey: CREDIT_FEATURES.listening_generate_questions,
        quantity: questions.length,
        metadata: {
          set_id: setId,
          ...(missingSlotIndexes.length > 0 ? { missing_slots: missingSlotIndexes } : {}),
        },
        note: `듣기 문항 ${questions.length}개 생성`,
      });
    }

    const partial = missingSlotIndexes.length > 0;
    const partialMessage = partial
      ? `${slots.length}문항 중 ${questions.length}문항을 만들었어요. ${missingSlotIndexes.join(", ")}번 문항은 만들지 못했어요.`
      : undefined;

    if (body.persist) {
      let saved: Awaited<ReturnType<typeof persistGeneratedQuestions>>;
      if (partial) {
        // 빠진 번호가 있으면 번호를 당기지 않고 슬롯 번호 그대로 저장한다(빠진 칸은 나중에 채운다)
        await clearListeningQuestionsForSet(setId);
        saved = await persistGeneratedQuestions(setId, questions);
      } else {
        saved = await persistGeneratedQuestions(
          setId,
          questions.map((q, i) => ({
            ...q,
            order_index: slots[i]?.slotIndex ?? i + 1,
          })),
          { replaceAll: true }
        );
      }
      const schemaMigrationNeeded = saved.some(
        (q) => q.schema_extended_saved === false
      );
      return NextResponse.json({
        ok: true,
        questions: saved,
        missingSlotIndexes,
        message: partialMessage,
        schemaMigrationNeeded,
        schemaWarning: schemaMigrationNeeded
          ? "문항은 저장되었으나 DB 마이그레이션(027~036) 미적용으로 유형별 메타데이터는 저장되지 않았습니다. Supabase에서 RUN_LISTENING_027_THROUGH_036.sql을 실행하세요."
          : undefined,
      });
    }

    return NextResponse.json({
      ok: true,
      questions,
      missingSlotIndexes,
      message: partialMessage,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "문항 일괄 생성 오류";
    return jsonError(message);
  }
}

import { NextResponse } from "next/server";
import type { ListeningDifficultyMode } from "@/lib/listening/exam-difficulty";
import { fetchListeningSetGradeLevel } from "@/lib/listening/fetch-set-grade";
import {
  generateExamQuestionsFromSlots,
  generateFreeQuestionsFromSlots,
} from "@/lib/listening/generate-exam-from-slots";
import { assertListeningOpenAiEnv } from "@/lib/listening/assert-listening-openai";
import { assertListeningSetWritable } from "@/lib/listening/listening-api-auth";
import { persistGeneratedQuestions } from "@/lib/listening/persist-questions";
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

    let questions: GeneratedListeningQuestion[];
    try {
      questions =
        mode === "exam"
          ? await generateExamQuestionsFromSlots(
              apiKey,
              slots,
              difficultyMode,
              gradeLevel
            )
          : await generateFreeQuestionsFromSlots(apiKey, slots, gradeLevel);
    } catch (e) {
      const message = e instanceof Error ? e.message : "문항 생성 실패";
      return jsonError(message);
    }

    if (questions.length !== slots.length) {
      return jsonError(
        `${slots.length}문항 중 ${questions.length}문항만 생성되었습니다. 다시 시도해 주세요.`
      );
    }

    if (academyId) {
      await debitLessonCredits({
        academyId,
        actorId: access.profile.id,
        featureKey: CREDIT_FEATURES.listening_generate_questions,
        quantity: questions.length,
        metadata: { set_id: setId },
        note: `듣기 문항 ${questions.length}개 생성`,
      });
    }

    if (body.persist) {
      const saved = await persistGeneratedQuestions(
        setId,
        questions.map((q, i) => ({
          ...q,
          order_index: slots[i]?.slotIndex ?? i + 1,
        })),
        { replaceAll: true }
      );
      const schemaMigrationNeeded = saved.some(
        (q) => q.schema_extended_saved === false
      );
      return NextResponse.json({
        ok: true,
        questions: saved,
        schemaMigrationNeeded,
        schemaWarning: schemaMigrationNeeded
          ? "문항은 저장되었으나 DB 마이그레이션(027~036) 미적용으로 유형별 메타데이터는 저장되지 않았습니다. Supabase에서 RUN_LISTENING_027_THROUGH_036.sql을 실행하세요."
          : undefined,
      });
    }

    return NextResponse.json({ ok: true, questions });
  } catch (e) {
    const message = e instanceof Error ? e.message : "문항 일괄 생성 오류";
    return jsonError(message);
  }
}

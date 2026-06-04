import { NextResponse } from "next/server";
import type { ListeningDifficultyMode } from "@/lib/listening/exam-difficulty";
import { fetchListeningSetGradeLevel } from "@/lib/listening/fetch-set-grade";
import {
  generateSingleExamQuestion,
  generateSingleFreeQuestion,
} from "@/lib/listening/generate-questions";
import { assertListeningOpenAiEnv } from "@/lib/listening/assert-listening-openai";
import { assertListeningSetAccess } from "@/lib/listening/listening-api-auth";
import { persistGeneratedQuestions } from "@/lib/listening/persist-questions";
import { buildContinuationAvoidList } from "@/lib/listening/continuation-scenario-pool";
import type { ListeningGenerationSlot } from "@/lib/listening/generation-slots";
import type {
  GeneratedListeningQuestion,
  ListeningGenerationMode,
} from "@/lib/listening/types";

export const maxDuration = 300;

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

function buildPreviousProblemsForSlot(
  prior: GeneratedListeningQuestion[],
  index: number,
  slot: ListeningGenerationSlot
): string[] | undefined {
  const lines: string[] = [];
  if (slot.typeId === 19 || slot.typeId === 20) {
    lines.push(...buildContinuationAvoidList(prior, slot.typeId));
  }
  const last = prior[index - 1]?.problems;
  if (last?.length) lines.push(...last);
  return lines.length > 0 ? lines : undefined;
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

    const access = await assertListeningSetAccess(setId);
    if (!access.ok) return jsonError(access.message, access.status);

    const mode: ListeningGenerationMode = body.mode === "free" ? "free" : "exam";
    const gradeLevel = await fetchListeningSetGradeLevel(setId);
    const questions: GeneratedListeningQuestion[] = [];

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i]!;
      let lastError: string | undefined;

      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const generated =
            mode === "exam"
              ? await generateSingleExamQuestion(
                  apiKey,
                  slot.typeId,
                  body.difficultyMode ?? "auto",
                  buildPreviousProblemsForSlot(questions, i, slot),
                  gradeLevel,
                  slot.slotIndex
                )
              : await generateSingleFreeQuestion(
                  apiKey,
                  slot.slotIndex,
                  buildPreviousProblemsForSlot(questions, i, slot),
                  gradeLevel
                );

          questions.push({
            ...generated,
            order_index: slot.slotIndex,
            needs_review: false,
          });
          lastError = undefined;
          break;
        } catch (e) {
          lastError = e instanceof Error ? e.message : "생성 실패";
        }
      }

      if (lastError) {
        return jsonError(
          questions.length > 0
            ? `${slot.slotIndex}번 생성 실패 (${lastError}). ${questions.length}문항까지 생성됨.`
            : `${slot.slotIndex}번 생성 실패: ${lastError}`
        );
      }
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

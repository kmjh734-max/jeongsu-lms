import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchListeningSetGradeLevel } from "@/lib/listening/fetch-set-grade";
import { assertListeningOpenAiEnv } from "@/lib/listening/assert-listening-openai";
import { generateListeningQuestionsWithAi } from "@/lib/listening/generate-questions";
import { persistGeneratedQuestions } from "@/lib/listening/persist-questions";
import type { ListeningDifficultyMode } from "@/lib/listening/exam-difficulty";
import type { GeneratedListeningQuestion, ListeningGenerationMode } from "@/lib/listening/types";

export const maxDuration = 300;

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
      return jsonError("권한이 없습니다.", 403);
    }

    let apiKey: string;
    try {
      ({ apiKey } = assertListeningOpenAiEnv());
    } catch (e) {
      return jsonError(e instanceof Error ? e.message : "OpenAI 설정 오류");
    }

    const body = (await request.json()) as {
      setId?: string;
      count?: number;
      persist?: boolean;
      mode?: ListeningGenerationMode;
      selectedTypeIds?: number[];
      difficultyMode?: ListeningDifficultyMode;
      questions?: GeneratedListeningQuestion[];
    };

    const setId = body.setId?.trim();
    if (!setId) {
      return jsonError("setId가 필요합니다.");
    }

    const admin = createAdminClient();
    const { data: setRow, error: setErr } = await admin
      .from("listening_sets")
      .select("id, teacher_id, created_by")
      .eq("id", setId)
      .maybeSingle();

    if (setErr || !setRow) {
      return jsonError("듣기 세트를 찾을 수 없습니다.");
    }

    if (
      profile.role === "teacher" &&
      setRow.teacher_id !== profile.id &&
      setRow.created_by !== profile.id
    ) {
      return jsonError("이 세트에 대한 권한이 없습니다.", 403);
    }

    if (Array.isArray(body.questions) && body.questions.length > 0) {
      const saved = await persistGeneratedQuestions(setId, body.questions);
      const schemaMigrationNeeded = saved.some((q) => q.schema_extended_saved === false);
      return NextResponse.json({
        ok: true,
        questions: saved,
        schemaMigrationNeeded,
        schemaWarning: schemaMigrationNeeded
          ? "문항은 저장되었으나 DB 마이그레이션(027~036) 미적용으로 유형별 메타데이터는 저장되지 않았습니다. Supabase에서 RUN_LISTENING_027_THROUGH_036.sql을 실행하세요."
          : undefined,
      });
    }

    const mode: ListeningGenerationMode =
      body.mode === "exam" ? "exam" : "free";
    const count = Math.min(Math.max(body.count ?? 5, 1), 20);

    const gradeLevel = await fetchListeningSetGradeLevel(setId);

    const { questions: generated } = await generateListeningQuestionsWithAi(apiKey, {
      mode,
      count,
      selectedTypeIds: body.selectedTypeIds,
      difficultyMode: body.difficultyMode ?? "auto",
      gradeLevel,
    });

    const persist = body.persist !== false;
    if (persist) {
      const saved = await persistGeneratedQuestions(setId, generated);
      const schemaMigrationNeeded = saved.some((q) => q.schema_extended_saved === false);
      return NextResponse.json({
        ok: true,
        questions: saved,
        mode,
        reviewCount: generated.filter((q) => q.needs_review).length,
        schemaMigrationNeeded,
        schemaWarning: schemaMigrationNeeded
          ? "문항은 저장되었으나 DB 마이그레이션(027~036) 미적용으로 유형별 메타데이터는 저장되지 않았습니다. Supabase에서 RUN_LISTENING_027_THROUGH_036.sql을 실행하세요."
          : undefined,
      });
    }

    return NextResponse.json({
      ok: true,
      questions: generated,
      mode,
      reviewCount: generated.filter((q) => q.needs_review).length,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "문항 생성 중 오류가 발생했습니다.";
    return jsonError(message);
  }
}

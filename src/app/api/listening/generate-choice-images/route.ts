import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import {
  generateAndSaveChoiceImages,
  resolveMismatchLabel,
} from "@/lib/listening/generate-choice-images";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertListeningSetWritable } from "@/lib/listening/listening-api-auth";
import { generateAndSaveSceneImage } from "@/lib/listening/scene-figure";
import { CREDIT_FEATURES } from "@/lib/credits";
import { debitLessonCredits, lessonCreditShortfall } from "@/lib/credits/lesson-credits";

/**
 * 그림은 새로 저장한 장수만큼 받는다(이미 있어 건너뛰면 0). 검수에 떨어져 버린 그림은 받지 않는다.
 * 잔액이 모자라면 그리기 전에 멈춘다.
 */
async function chargeImages(opts: {
  academyId: string | null | undefined;
  actorId: string;
  questionId: string;
  setId: string;
  feature: string;
  quantity: number;
  note: string;
}): Promise<void> {
  if (!opts.academyId || opts.quantity <= 0) return;
  await debitLessonCredits({
    academyId: opts.academyId,
    actorId: opts.actorId,
    featureKey: opts.feature,
    quantity: opts.quantity,
    idempotencyKey: `${opts.feature}:${opts.questionId}:${Date.now()}`,
    metadata: { set_id: opts.setId, question_id: opts.questionId },
    note: opts.note,
  });
}

export const maxDuration = 300;
export const dynamic = "force-dynamic";

/** 단일 문항 그림 생성 (choice_image_prompts → choice_image_urls) */
export async function POST(req: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
      return NextResponse.json(
        { ok: false, message: "권한이 없습니다." },
        { status: 403 }
      );
    }

    const body = (await req.json()) as {
      questionId?: string;
      setId?: string;
      force?: boolean;
    };
    const questionId = String(body.questionId ?? "").trim();
    if (!questionId) {
      return NextResponse.json(
        { ok: false, message: "questionId가 필요합니다." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { data: q, error } = await admin
      .from("listening_questions")
      .select(
        "id, set_id, choice_image_prompts, script_text, choices, correct_answer, explanation, answer_clue, question_type, instruction, visual_choice_type"
      )
      .eq("id", questionId)
      .maybeSingle();
    if (error || !q) {
      return NextResponse.json(
        { ok: false, message: error?.message ?? "문항 없음" },
        { status: 404 }
      );
    }

    const setId = String(body.setId ?? q.set_id ?? "").trim();
    const access = await assertListeningSetWritable(setId);
    if (!access.ok) {
      return NextResponse.json(
        { ok: false, message: access.message },
        { status: access.status }
      );
    }

    const prompts = Array.isArray(q.choice_image_prompts)
      ? (q.choice_image_prompts as string[])
          .map((p) => String(p).trim())
          .filter(Boolean)
      : [];
    if (prompts.length === 0) {
      return NextResponse.json(
        { ok: false, message: "choice_image_prompts가 비어 있습니다." },
        { status: 400 }
      );
    }

    if (!profile.academy_id) {
      return NextResponse.json({ ok: false, message: "소속 학원 정보가 없습니다." }, { status: 403 });
    }

    // 그림 상황에 맞는 대화: 글자 없는 장면 1장 — 정답 대화만 그림과 맞는지 검수한다(라벨 그림과 다름)
    const isScene =
      q.visual_choice_type === "scene" ||
      /그림의 상황에/.test(String(q.instruction ?? "")) ||
      String(q.question_type ?? "").trim() === "그림 상황에 맞는 대화";
    if (isScene) {
      if (!body.force) {
        const { data: row } = await admin
          .from("listening_questions")
          .select("choice_image_urls")
          .eq("id", questionId)
          .maybeSingle();
        const existing = Array.isArray(row?.choice_image_urls)
          ? (row!.choice_image_urls as string[]).filter((u) => String(u).trim())
          : [];
        if (existing.length > 0) {
          return NextResponse.json({ ok: true, urls: existing, generated: 0, skipped: true });
        }
      }
      const sceneShort = await lessonCreditShortfall(profile.academy_id, CREDIT_FEATURES.listening_generate_scene);
      if (sceneShort) return NextResponse.json({ ok: false, message: sceneShort }, { status: 402 });
      const { data: segs } = await admin
        .from("listening_question_segments")
        .select("speaker_type, text")
        .eq("question_id", questionId)
        .order("order_index", { ascending: true });
      const result = await generateAndSaveSceneImage({
        setId,
        questionId,
        scenePrompt: prompts[0]!,
        segments: (segs ?? []).map((r) => ({ speaker: String(r.speaker_type), text: String(r.text ?? "") })),
        correctAnswer: Number(q.correct_answer) || 1,
      });
      await chargeImages({
        academyId: profile.academy_id,
        actorId: profile.id,
        questionId,
        setId,
        feature: CREDIT_FEATURES.listening_generate_scene,
        quantity: result.generated > 0 ? 1 : 0,
        note: "듣기 그림 상황 그림",
      });
      return NextResponse.json({ ok: true, ...result });
    }

    // 그림 선택지 5개는 실제 문제지처럼 5칸 한 장으로 그린다 (그림값 1장분)
    const choiceGrid = prompts.length === 5;
    const imageShort = await lessonCreditShortfall(
      profile.academy_id,
      CREDIT_FEATURES.listening_generate_image,
      choiceGrid ? 1 : prompts.length
    );
    if (imageShort) return NextResponse.json({ ok: false, message: imageShort }, { status: 402 });

    // 합성 그림(그림 불일치)은 대본·정답 라벨을 함께 넘겨야 라벨마다 대화와 맞는지 검수할 수 있다
    const composite = prompts.length === 1;
    const result = await generateAndSaveChoiceImages({
      setId,
      questionId,
      prompts,
      choiceGrid,
      // 정답 칸은 정답 설명과 맞아야 검수를 통과한다
      choiceGridAnswerIndex: choiceGrid ? Number(q.correct_answer) || undefined : undefined,
      compositeLabeledFigure: composite,
      force: Boolean(body.force),
      figureContext: composite
        ? {
            scriptText: String(q.script_text ?? ""),
            mismatchLabel:
              resolveMismatchLabel(q.choices as string[] | null, q.correct_answer as number) ??
              undefined,
            explanation: String(q.explanation ?? ""),
            answerClue: String(q.answer_clue ?? ""),
          }
        : undefined,
    });

    await chargeImages({
      academyId: profile.academy_id,
      actorId: profile.id,
      questionId,
      setId,
      feature: CREDIT_FEATURES.listening_generate_image,
      quantity: result.generated,
      note: `듣기 그림 ${result.generated}장`,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        message: e instanceof Error ? e.message : "그림 생성 실패",
      },
      { status: 500 }
    );
  }
}

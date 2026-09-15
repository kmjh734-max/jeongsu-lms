import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { getElevenLabsApiKey } from "@/lib/listening/elevenlabs/resolve-voices";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateQuestionAudio } from "@/lib/listening/generate-audio";
import { EXAM_DEFAULT_SPEECH_SPEED } from "@/lib/listening/speech-speed";
import {
  chargeFeatureOrError,
  CREDIT_FEATURES,
} from "@/lib/credits/charge";
import { adjustAcademyCredits, getFeatureCost } from "@/lib/credits";
import { assertListeningSetWritable } from "@/lib/listening/listening-api-auth";

export const maxDuration = 180;

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
      return jsonError("권한이 없습니다.", 403);
    }

    try {
      getElevenLabsApiKey();
    } catch (e) {
      return jsonError(e instanceof Error ? e.message : "ElevenLabs 설정 오류");
    }

    const body = (await request.json()) as {
      setId?: string;
      questionId?: string;
      segmentId?: string;
      speed?: number;
      speechSpeed?: number;
    };

    const setId = body.setId?.trim();
    const questionId = body.questionId?.trim();
    if (!setId || !questionId) {
      return jsonError("setId와 questionId가 필요합니다.");
    }

    const writable = await assertListeningSetWritable(setId);
    if (!writable.ok) return jsonError(writable.message, writable.status);

    const admin = createAdminClient();
    const { data: question, error: qErr } = await admin
      .from("listening_questions")
      .select("id, set_id")
      .eq("id", questionId)
      .eq("set_id", setId)
      .maybeSingle();

    if (qErr || !question) {
      return jsonError("문항을 찾을 수 없습니다.");
    }

    const { data: setRow } = await admin
      .from("listening_sets")
      .select("teacher_id, created_by, speech_speed")
      .eq("id", setId)
      .maybeSingle();

    if (
      profile.role === "teacher" &&
      setRow &&
      setRow.teacher_id !== profile.id &&
      setRow.created_by !== profile.id
    ) {
      return jsonError("이 세트에 대한 권한이 없습니다.", 403);
    }

    const speechSpeed =
      typeof body.speed === "number"
        ? body.speed
        : typeof body.speechSpeed === "number"
          ? body.speechSpeed
          : typeof setRow?.speech_speed === "number"
            ? setRow.speech_speed
            : EXAM_DEFAULT_SPEECH_SPEED;

    // 문항·권한을 다 확인한 뒤 차감하고, 음성을 못 만들면 되돌려 준다.
    const chargeKey = `listening_generate_audio:${questionId}:${Date.now()}`;
    const chargeErr = await chargeFeatureOrError({
      academyId: profile.academy_id,
      featureKey: CREDIT_FEATURES.listening_generate_audio,
      actorId: profile.id,
      idempotencyKey: chargeKey,
      metadata: { set_id: setId, question_id: questionId },
    });
    if (chargeErr) return chargeErr;

    let result: Awaited<ReturnType<typeof generateQuestionAudio>>;
    try {
      result = await generateQuestionAudio({
        setId,
        questionId,
        segmentId: body.segmentId?.trim() || undefined,
        speechSpeed,
      });
    } catch (genErr) {
      const pricing = await getFeatureCost(admin, CREDIT_FEATURES.listening_generate_audio).catch(() => null);
      if (profile.academy_id && pricing && pricing.cost > 0) {
        await adjustAcademyCredits(admin, {
          academyId: profile.academy_id,
          amount: pricing.cost,
          direction: "grant",
          actorId: profile.id,
          note: "듣기 음성 만들기 실패 — 차감 취소",
          idempotencyKey: `refund:${chargeKey}`,
        }).catch((e) => console.error("[generate-audio] refund failed", e));
      }
      throw genErr;
    }

    return NextResponse.json({
      ok: true,
      questionId,
      audioUrl: result.audioUrl,
      provider: result.provider,
      stage: "uploaded",
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "ElevenLabs 음원 생성에 실패했습니다.";
    return jsonError(message);
  }
}

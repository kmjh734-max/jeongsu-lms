import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { getElevenLabsListeningConfig } from "@/lib/listening/audioProviders/elevenlabs-config";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateSetQuestionAudio } from "@/lib/listening/generate-audio";
import { EXAM_DEFAULT_SPEECH_SPEED } from "@/lib/listening/speech-speed";

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

    try {
      getElevenLabsListeningConfig();
    } catch (e) {
      return jsonError(e instanceof Error ? e.message : "ElevenLabs 설정 오류");
    }

    const body = (await request.json()) as {
      setId?: string;
      questionIds?: string[];
      speed?: number;
      speechSpeed?: number;
    };

    const setId = body.setId?.trim();
    if (!setId) {
      return jsonError("setId가 필요합니다.");
    }

    const admin = createAdminClient();
    const { data: setRow } = await admin
      .from("listening_sets")
      .select("teacher_id, created_by, speech_speed")
      .eq("id", setId)
      .maybeSingle();

    if (!setRow) {
      return jsonError("세트를 찾을 수 없습니다.");
    }

    if (
      profile.role === "teacher" &&
      setRow.teacher_id !== profile.id &&
      setRow.created_by !== profile.id
    ) {
      return jsonError("권한이 없습니다.", 403);
    }

    const speechSpeed =
      typeof body.speed === "number"
        ? body.speed
        : typeof body.speechSpeed === "number"
          ? body.speechSpeed
          : typeof setRow.speech_speed === "number"
            ? setRow.speech_speed
            : EXAM_DEFAULT_SPEECH_SPEED;

    const results = await generateSetQuestionAudio({
      setId,
      speechSpeed,
      questionIds: body.questionIds,
    });

    const okCount = results.filter((r) => r.ok).length;

    return NextResponse.json({
      ok: okCount > 0,
      message:
        okCount === results.length
          ? `${results.length}개 문항 ElevenLabs 음원 생성 완료`
          : `${okCount}/${results.length}개 성공 (실패 문항 메시지 확인)`,
      results,
      provider: "elevenlabs",
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "ElevenLabs 일괄 음원 생성에 실패했습니다.";
    return jsonError(message);
  }
}

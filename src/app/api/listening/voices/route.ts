import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { fetchElevenLabsVoices } from "@/lib/listening/elevenlabs/getVoices";
import { getElevenLabsApiKey } from "@/lib/listening/elevenlabs/resolve-voices";
import { autoSelectElevenLabsVoices } from "@/lib/listening/elevenlabs/selectVoices";

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

/** ElevenLabs voice 목록 + 자동 배정 결과 (관리자/강사 UI) */
export async function GET() {
  try {
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
      return jsonError("권한이 없습니다.", 403);
    }

    const apiKey = getElevenLabsApiKey();
    const voices = await fetchElevenLabsVoices(apiKey);
    const autoSelected = autoSelectElevenLabsVoices(voices);

    return NextResponse.json({
      ok: true,
      voices: voices.map((v) => ({
        voice_id: v.voice_id,
        name: v.name,
        category: v.category,
        labels: v.labels,
      })),
      autoSelected,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "voice 목록 조회 실패";
    return jsonError(message);
  }
}

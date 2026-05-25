import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { fetchElevenLabsVoices } from "@/lib/listening/elevenlabs/getVoices";
import { getElevenLabsApiKey } from "@/lib/listening/elevenlabs/resolve-voices";

/** ElevenLabs 키·연결 상태 확인 (관리자/강사) */
export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
    return NextResponse.json({ ok: false, message: "권한이 없습니다." }, { status: 403 });
  }

  try {
    const apiKey = getElevenLabsApiKey();
    const voices = await fetchElevenLabsVoices(apiKey);
    return NextResponse.json({
      ok: true,
      message: "ElevenLabs 연결 정상",
      voicesCount: voices.length,
      keyLength: apiKey.length,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "ElevenLabs 연결 실패";
    return NextResponse.json({ ok: false, message });
  }
}

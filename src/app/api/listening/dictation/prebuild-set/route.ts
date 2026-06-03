import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { prebuildDictationForSet } from "@/lib/listening/dictation/prebuild-question";
import { assertListeningSetAccess } from "@/lib/listening/listening-api-auth";

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

    const body = (await request.json()) as { setId?: string };
    const setId = body.setId?.trim();
    if (!setId) return jsonError("setId가 필요합니다.");

    const access = await assertListeningSetAccess(setId);
    if (!access.ok) return jsonError(access.message, access.status);

    const result = await prebuildDictationForSet(setId);

    return NextResponse.json({
      ok: true,
      prepared: result.ok,
      failed: result.failed,
      message:
        result.failed > 0
          ? `${result.ok}문항 준비 완료, ${result.failed}문항 실패`
          : `${result.ok}문항 Dictation 미리 생성 완료`,
      details: result.messages.slice(0, 5),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Dictation 준비 오류";
    return jsonError(message);
  }
}

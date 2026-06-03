import { after, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { ensureDictationPreparedForSet } from "@/lib/listening/dictation/prebuild-question";
import { assertListeningSetAccess } from "@/lib/listening/listening-api-auth";

export const maxDuration = 300;

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

/** 세트에 Dictation 빈칸이 없는 문항만 백그라운드로 자동 생성 */
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

    after(() => {
      void ensureDictationPreparedForSet(setId, { includeVariants: false }).catch(
        () => undefined
      );
    });

    return NextResponse.json({
      ok: true,
      started: true,
      message: "Dictation 자동 준비를 시작했습니다.",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Dictation 준비 오류";
    return jsonError(message);
  }
}

import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { repairSetMwDialogueInDb } from "@/lib/listening/ensure-mw-dialogue";
import { createAdminClient } from "@/lib/supabase/admin";

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

/** 세트 대화 문항의 같은 화자 연속 대사를 한 턴으로 합침 (화자는 바꾸지 않음, 음원은 재생성 필요) */
export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
      return jsonError("권한이 없습니다.", 403);
    }

    const body = (await request.json()) as { setId?: string };
    const setId = body.setId?.trim();
    if (!setId) return jsonError("setId가 필요합니다.");

    const admin = createAdminClient();
    const { data: setRow } = await admin
      .from("listening_sets")
      .select("teacher_id, created_by")
      .eq("id", setId)
      .maybeSingle();

    if (!setRow) return jsonError("세트를 찾을 수 없습니다.");

    if (
      profile.role === "teacher" &&
      setRow.teacher_id !== profile.id &&
      setRow.created_by !== profile.id
    ) {
      return jsonError("권한이 없습니다.", 403);
    }

    const repairedCount = await repairSetMwDialogueInDb(admin, setId);

    return NextResponse.json({
      ok: true,
      repairedCount,
      message:
        repairedCount > 0
          ? `${repairedCount}개 문항에서 같은 사람이 이어 말한 대사를 한 줄로 합쳤습니다. 음원 일괄 생성을 실행하세요.`
          : "수정할 대화 문항이 없습니다.",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "보정 오류";
    return jsonError(message);
  }
}

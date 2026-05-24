import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
      return jsonError("권한이 없습니다.", 403);
    }

    const body = (await request.json()) as { setId?: string; classId?: string };
    const setId = body.setId?.trim();
    const classId = body.classId?.trim();
    if (!setId || !classId) {
      return jsonError("setId와 classId가 필요합니다.");
    }

    const supabase = await createClient();
    const { error } = await supabase.from("listening_assignments").insert({
      set_id: setId,
      class_id: classId,
      student_id: null,
      assigned_by: profile.id,
    });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ ok: true, message: "이미 배정된 반입니다." });
      }
      return jsonError(error.message);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "배정 실패";
    return jsonError(message);
  }
}

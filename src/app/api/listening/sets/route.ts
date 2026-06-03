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

    const body = (await request.json()) as {
      title?: string;
      description?: string;
    };
    const title = body.title?.trim();
    if (!title) {
      return jsonError("제목을 입력해 주세요.");
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("listening_sets")
      .insert({
        title,
        description: body.description?.trim() || null,
        grade_level: "middle1",
        teacher_id: profile.role === "teacher" ? profile.id : profile.id,
        created_by: profile.id,
        is_published: false,
      })
      .select("id, title")
      .single();

    if (error || !data) {
      return jsonError(error?.message ?? "세트 생성 실패");
    }

    return NextResponse.json({ ok: true, set: data });
  } catch (e) {
    const message = e instanceof Error ? e.message : "세트 생성 중 오류";
    return jsonError(message);
  }
}

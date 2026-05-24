import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ setId: string }> }
) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
      return jsonError("권한이 없습니다.", 403);
    }

    const { setId } = await context.params;
    const body = (await request.json()) as { is_published?: boolean; title?: string };

    const supabase = await createClient();
    const patch: Record<string, unknown> = {};
    if (typeof body.is_published === "boolean") patch.is_published = body.is_published;
    if (typeof body.title === "string" && body.title.trim()) {
      patch.title = body.title.trim();
    }

    if (Object.keys(patch).length === 0) {
      return jsonError("변경할 내용이 없습니다.");
    }

    const { error } = await supabase
      .from("listening_sets")
      .update(patch)
      .eq("id", setId);

    if (error) return jsonError(error.message);

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "저장 실패";
    return jsonError(message);
  }
}

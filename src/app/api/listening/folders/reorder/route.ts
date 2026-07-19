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
      items?: Array<{ id?: string; orderIndex?: number }>;
    };
    const items = (body.items ?? []).filter(
      (it): it is { id: string; orderIndex: number } =>
        typeof it.id === "string" &&
        it.id.length > 0 &&
        typeof it.orderIndex === "number"
    );
    if (items.length === 0) {
      return jsonError("정렬할 폴더가 없습니다.");
    }

    const supabase = await createClient();

    // RLS 로 소유권이 제한되므로, 접근 가능한 폴더만 갱신된다.
    for (const it of items) {
      const { error } = await supabase
        .from("listening_set_folders")
        .update({ order_index: it.orderIndex, updated_at: new Date().toISOString() })
        .eq("id", it.id);
      if (error) return jsonError(error.message);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "폴더 순서 저장 실패";
    return jsonError(message);
  }
}

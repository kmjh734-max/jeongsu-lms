import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { assertFolderAccessible } from "@/lib/listening/folder-access";
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
      folderId?: string | null;
    };
    const title = body.title?.trim();
    if (!title) {
      return jsonError("제목을 입력해 주세요.");
    }
    if (!profile.academy_id) {
      return jsonError(
        "소속 학원 정보가 없습니다. EngCore Admin에서 학원에 연결해 주세요.",
        403
      );
    }

    const supabase = await createClient();

    if (body.folderId) {
      const allowed = await assertFolderAccessible(
        supabase,
        profile.role,
        profile.id,
        body.folderId
      );
      if (!allowed) {
        return jsonError("선택한 폴더에 접근할 수 없습니다.", 403);
      }
    }

    // 새 세트는 목록 맨 위(가장 작은 order_index)로
    const { data: topRow } = await supabase
      .from("listening_sets")
      .select("order_index")
      .order("order_index", { ascending: true })
      .limit(1)
      .maybeSingle();
    const nextOrder =
      typeof topRow?.order_index === "number" ? topRow.order_index - 1 : 0;

    const { data, error } = await supabase
      .from("listening_sets")
      .insert({
        title,
        description: body.description?.trim() || null,
        folder_id: body.folderId ?? null,
        grade_level: "middle1",
        teacher_id: profile.role === "teacher" ? profile.id : profile.id,
        created_by: profile.id,
        is_published: true,
        order_index: nextOrder,
        academy_id: profile.academy_id,
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

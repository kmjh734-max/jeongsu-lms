import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { assertFolderAccessible } from "@/lib/listening/folder-access";
import { createClient } from "@/lib/supabase/server";

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
      return jsonError("권한이 없습니다.", 403);
    }

    const { id } = await params;
    const supabase = await createClient();
    const allowed = await assertFolderAccessible(
      supabase,
      profile.role,
      profile.id,
      id
    );
    if (!allowed) return jsonError("이 폴더를 수정할 권한이 없습니다.", 403);

    const body = (await request.json()) as {
      name?: string;
      description?: string | null;
      parentId?: string | null;
      orderIndex?: number;
    };

    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (typeof body.name === "string" && body.name.trim()) {
      patch.name = body.name.trim();
    }
    if (body.description !== undefined) {
      patch.description = body.description?.trim() || null;
    }
    if (body.parentId !== undefined) {
      if (body.parentId === id) {
        return jsonError("폴더를 자기 자신의 하위로 넣을 수 없습니다.");
      }
      patch.parent_id = body.parentId;
    }
    if (typeof body.orderIndex === "number") {
      patch.order_index = body.orderIndex;
    }

    const { error } = await supabase
      .from("listening_set_folders")
      .update(patch)
      .eq("id", id);

    if (error) return jsonError(error.message);

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "폴더 수정 오류";
    return jsonError(message);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
      return jsonError("권한이 없습니다.", 403);
    }

    const { id } = await params;
    const supabase = await createClient();
    const allowed = await assertFolderAccessible(
      supabase,
      profile.role,
      profile.id,
      id
    );
    if (!allowed) return jsonError("이 폴더를 삭제할 권한이 없습니다.", 403);

    const { error } = await supabase
      .from("listening_set_folders")
      .delete()
      .eq("id", id);

    if (error) return jsonError(error.message);

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "폴더 삭제 오류";
    return jsonError(message);
  }
}

import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { listListeningSetFolders } from "@/lib/listening/folder-access";
import { createClient } from "@/lib/supabase/server";

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function GET() {
  try {
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
      return jsonError("권한이 없습니다.", 403);
    }

    const supabase = await createClient();
    const folders = await listListeningSetFolders(
      supabase,
      profile.role,
      profile.id
    );

    return NextResponse.json({ ok: true, folders });
  } catch (e) {
    const message = e instanceof Error ? e.message : "폴더 조회 오류";
    return jsonError(message);
  }
}

export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
      return jsonError("권한이 없습니다.", 403);
    }

    const body = (await request.json()) as {
      name?: string;
      description?: string;
      parentId?: string | null;
    };
    const name = body.name?.trim();
    if (!name) return jsonError("폴더 이름을 입력해 주세요.");

    const supabase = await createClient();

    if (body.parentId) {
      const { data: parent } = await supabase
        .from("listening_set_folders")
        .select("id")
        .eq("id", body.parentId)
        .maybeSingle();
      if (!parent) return jsonError("상위 폴더를 찾을 수 없습니다.");
    }

    const { data: siblings } = await supabase
      .from("listening_set_folders")
      .select("order_index")
      .is("parent_id", body.parentId ?? null)
      .order("order_index", { ascending: false })
      .limit(1);

    const nextOrder =
      siblings?.[0]?.order_index != null
        ? (siblings[0].order_index as number) + 1
        : 0;

    const { data, error } = await supabase
      .from("listening_set_folders")
      .insert({
        name,
        description: body.description?.trim() || null,
        parent_id: body.parentId ?? null,
        teacher_id: profile.id,
        created_by: profile.id,
        order_index: nextOrder,
      })
      .select("id, name, description, parent_id, order_index, created_at")
      .single();

    if (error || !data) {
      return jsonError(error?.message ?? "폴더 생성 실패");
    }

    return NextResponse.json({ ok: true, folder: data });
  } catch (e) {
    const message = e instanceof Error ? e.message : "폴더 생성 오류";
    return jsonError(message);
  }
}

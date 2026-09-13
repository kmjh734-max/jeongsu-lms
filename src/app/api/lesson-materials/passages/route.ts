import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { joinWorkbookPassageLines } from "@/lib/lesson-materials/workbook-types";

export const runtime = "nodejs";

/**
 * 자료함에서 고른 지문의 제목·출처·영어 원문을 돌려준다(AI 변형문제로 지문을 넘길 때).
 * 고른 순서를 지킨다. 선생님은 자기 지문만, 관리자는 학원 지문을 볼 수 있다.
 */
export async function GET(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
      return NextResponse.json({ ok: false, message: "권한이 없습니다." }, { status: 403 });
    }
    if (!profile.academy_id) {
      return NextResponse.json({ ok: false, message: "소속 학원 정보가 없습니다." });
    }
    const ids = (new URL(request.url).searchParams.get("ids") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 50);
    if (ids.length === 0) return NextResponse.json({ ok: true, passages: [] });

    const supabase = await createClient();
    let pq = supabase
      .from("lesson_material_projects")
      .select("id,title,source")
      .in("id", ids)
      .eq("academy_id", profile.academy_id)
      .is("deleted_at", null);
    if (profile.role === "teacher") {
      pq = pq.or(`teacher_id.eq.${profile.id},created_by.eq.${profile.id}`);
    }
    const { data: projects, error } = await pq;
    if (error) return NextResponse.json({ ok: false, message: error.message });
    const allowed = (projects ?? []).map((p) => p.id as string);
    const { data: items, error: iErr } = allowed.length
      ? await supabase
          .from("lesson_material_items")
          .select("project_id,english_text,order_index")
          .in("project_id", allowed)
          .order("order_index", { ascending: true })
      : { data: [], error: null };
    if (iErr) return NextResponse.json({ ok: false, message: iErr.message });

    const lines = new Map<string, string[]>();
    for (const it of items ?? []) {
      const list = lines.get(it.project_id as string) ?? [];
      list.push(String(it.english_text ?? ""));
      lines.set(it.project_id as string, list);
    }
    const byId = new Map((projects ?? []).map((p) => [p.id as string, p] as const));
    const passages = ids
      .map((id) => byId.get(id))
      .filter((p): p is NonNullable<typeof p> => !!p)
      .map((p) => ({
        id: p.id as string,
        title: (p.title as string) ?? "",
        source: (p.source as string | null) ?? "",
        text: joinWorkbookPassageLines(lines.get(p.id as string) ?? []),
      }))
      .filter((p) => p.text);
    return NextResponse.json({ ok: true, passages });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      message: e instanceof Error ? e.message : "지문을 불러오지 못했습니다.",
    });
  }
}

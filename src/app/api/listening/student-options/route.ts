import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
    return NextResponse.json({ ok: false, message: "권한이 없습니다." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 40), 1), 80);

  const supabase = await createClient();

  if (profile.role === "teacher") {
    const { data: classes } = await supabase
      .from("classes")
      .select("id")
      .eq("teacher_id", profile.id)
      .eq("is_active", true);

    const classIds = (classes ?? []).map((c) => c.id);
    if (classIds.length === 0) {
      return NextResponse.json({ ok: true, students: [] });
    }

    const { data: members } = await supabase
      .from("class_students")
      .select("student_id")
      .in("class_id", classIds);

    const studentIds = [...new Set((members ?? []).map((m) => m.student_id as string))];
    if (studentIds.length === 0) {
      return NextResponse.json({ ok: true, students: [] });
    }

    let query = supabase
      .from("profiles")
      .select("id, name")
      .eq("role", "student")
      .in("id", studentIds)
      .order("name")
      .limit(limit);

    if (q) query = query.ilike("name", `%${q}%`);

    const { data } = await query;
    return NextResponse.json({
      ok: true,
      students: (data ?? []).map((s) => ({ id: s.id, name: s.name })),
    });
  }

  let query = supabase
    .from("profiles")
    .select("id, name")
    .eq("role", "student")
    .eq("is_active", true)
    .order("name")
    .limit(limit);

  if (q) query = query.ilike("name", `%${q}%`);

  const { data } = await query;
  return NextResponse.json({
    ok: true,
    students: (data ?? []).map((s) => ({ id: s.id, name: s.name })),
  });
}

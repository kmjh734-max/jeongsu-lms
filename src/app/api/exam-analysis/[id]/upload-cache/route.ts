import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * 올린 자료를 읽은 글의 저장소 — 파일 내용 해시로 찾는다.
 *
 * 같은 파일을 다시 올리면 쪽 그림을 다시 읽지 않고 여기서 꺼내 쓴다(2026-10-02).
 * GET ?hash=…  → 있으면 { ok, text, pages, name }, 없으면 { ok: false }
 * PUT { hash, name, pages, text } → 담아 둔다
 */
async function guard(id: string) {
  const profile = await getCurrentProfile();
  if (!profile?.academy_id || (profile.role !== "admin" && profile.role !== "teacher")) {
    return { error: NextResponse.json({ ok: false, message: "권한이 없습니다." }, { status: 403 }) };
  }
  const admin = createAdminClient();
  const { data: analysis } = await admin
    .from("school_exam_analyses")
    .select("id, academy_id")
    .eq("id", id)
    .maybeSingle();
  if (!analysis || analysis.academy_id !== profile.academy_id) {
    return { error: NextResponse.json({ ok: false, message: "시험 분석을 찾을 수 없습니다." }, { status: 404 }) };
  }
  return { admin, academyId: profile.academy_id };
}

const HASH_RE = /^[0-9a-f]{64}$/;

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const g = await guard(id);
  if ("error" in g) return g.error;
  const hash = new URL(req.url).searchParams.get("hash") ?? "";
  if (!HASH_RE.test(hash)) return NextResponse.json({ ok: false }, { status: 400 });
  const { data } = await g.admin
    .from("exam_upload_reads")
    .select("name, pages, text")
    .eq("academy_id", g.academyId)
    .eq("file_hash", hash)
    .maybeSingle();
  if (!data || !String(data.text ?? "").trim()) return NextResponse.json({ ok: false });
  return NextResponse.json({ ok: true, name: data.name, pages: data.pages, text: data.text });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const g = await guard(id);
  if ("error" in g) return g.error;
  const body = (await req.json().catch(() => ({}))) as {
    hash?: string;
    name?: string;
    pages?: number;
    text?: string;
  };
  const hash = String(body.hash ?? "");
  const text = String(body.text ?? "");
  if (!HASH_RE.test(hash) || text.trim().length < 40) {
    return NextResponse.json({ ok: false, message: "담을 것이 없습니다." }, { status: 400 });
  }
  const { error } = await g.admin.from("exam_upload_reads").upsert(
    {
      academy_id: g.academyId,
      file_hash: hash,
      name: String(body.name ?? "").slice(0, 200),
      pages: Number.isFinite(Number(body.pages)) ? Math.max(0, Math.floor(Number(body.pages))) : 0,
      text: text.slice(0, 2_000_000),
    },
    { onConflict: "academy_id,file_hash" }
  );
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

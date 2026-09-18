import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const REASONS = new Set(["정답이 이상해요", "음성이 이상해요", "그림이 이상해요", "뜻·해석이 이상해요", "예문이 이상해요", "기타"]);

/** 문항 오류 신고 — 학생·선생님·원장님 누구나. 하루에 한 사람이 너무 많이 보내지 못하게 막는다 */
export async function POST(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ ok: false, message: "로그인이 필요해요." }, { status: 401 });

  let body: { kind?: string; setId?: string; targetId?: string; targetLabel?: string; reason?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "요청을 읽지 못했어요." }, { status: 400 });
  }
  const kind = body.kind === "vocab" ? "vocab" : body.kind === "listening" ? "listening" : null;
  const reason = String(body.reason ?? "");
  if (!kind || !REASONS.has(reason)) {
    return NextResponse.json({ ok: false, message: "신고 내용을 골라 주세요." }, { status: 400 });
  }
  const uuid = (v: unknown) => (typeof v === "string" && /^[0-9a-f-]{36}$/i.test(v) ? v : null);

  const admin = createAdminClient();
  const dayAgo = new Date(Date.now() - 86400000).toISOString();
  const { count } = await admin
    .from("content_reports")
    .select("id", { count: "exact", head: true })
    .eq("reporter_id", profile.id)
    .gte("created_at", dayAgo);
  if ((count ?? 0) >= 30) {
    return NextResponse.json({ ok: false, message: "오늘은 신고를 충분히 보냈어요. 고마워요!" }, { status: 429 });
  }

  const { error } = await admin.from("content_reports").insert({
    academy_id: profile.academy_id ?? null,
    reporter_id: profile.id,
    reporter_role: profile.role,
    kind,
    set_id: uuid(body.setId),
    target_id: uuid(body.targetId),
    target_label: String(body.targetLabel ?? "").slice(0, 200) || null,
    reason,
    message: String(body.message ?? "").trim().slice(0, 500) || null,
  });
  if (error) return NextResponse.json({ ok: false, message: "보내지 못했어요." }, { status: 500 });
  return NextResponse.json({ ok: true, message: "알려 줘서 고마워요. 확인해서 고칠게요." });
}

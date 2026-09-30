import { NextResponse } from "next/server";
import { requireSuperAdminApi } from "@/lib/auth/require-super-admin-api";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * 슈퍼관리자가 그 학원 관리자로 바로 들어간다.
 *
 * 선생님 요청(2026-09-30): 슈퍼관리자에서 각 학원으로 접속해 보고 싶다.
 * 학원마다 무엇이 어떻게 보이는지 직접 확인하려면 그 학원 관리자 눈으로 봐야 한다.
 *
 * 비밀번호는 건드리지 않는다. 그 관리자 앞으로 일회용 고리를 만들고, 그 고리의
 * token_hash만 떼어 우리 /auth/callback 주소로 돌려준다. Supabase가 만든 고리를
 * 그대로 열면 우리 주소가 아닌 곳으로 튕기고 토큰도 주소 뒤 해시로 와서 받을 수
 * 없다(직접 해 보고 알았다). 돌아올 때는 슈퍼관리자 계정으로 다시 로그인하면 된다.
 *
 * 누가 언제 어느 학원으로 들어갔는지 남긴다 — 남의 학원 자료를 보는 일이라
 * 자취가 있어야 한다.
 */
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperAdminApi();
  if ("error" in auth && auth.error) return auth.error;

  const { id: academyId } = await ctx.params;
  const body = (await request.json().catch(() => ({}))) as { adminId?: string };
  const admin = createAdminClient();

  const { data: academy } = await admin
    .from("academies")
    .select("id, name, slug")
    .eq("id", academyId)
    .maybeSingle();
  if (!academy) {
    return NextResponse.json({ ok: false, message: "학원을 찾을 수 없습니다." }, { status: 404 });
  }

  // 고른 관리자, 없으면 그 학원에서 가장 먼저 만든 관리자
  let q = admin
    .from("profiles")
    .select("id, name, email, role, is_active")
    .eq("academy_id", academyId)
    .eq("role", "admin")
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1);
  if (body.adminId) q = q.eq("id", body.adminId);
  const { data: rows } = await q;
  const target = rows?.[0];
  if (!target?.email) {
    return NextResponse.json(
      { ok: false, message: "이 학원에는 들어갈 수 있는 관리자가 없습니다. 먼저 관리자를 연결해 주세요." },
      { status: 400 }
    );
  }

  /*
   * 브라우저가 실제로 친 주소를 쓴다. new URL(request.url).origin 은 서버가 듣는
   * 주소라, 개발에서 0.0.0.0 처럼 브라우저가 갈 수 없는 값이 된다(직접 해 보고 알았다).
   */
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  const origin = host ? `${proto}://${host}` : new URL(request.url).origin;
  const { data: link, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: target.email as string,
  });
  const tokenHash = link?.properties?.hashed_token;
  if (error || !tokenHash) {
    return NextResponse.json(
      { ok: false, message: error?.message ?? "접속 고리를 만들지 못했습니다." },
      { status: 500 }
    );
  }

  await admin.from("super_admin_access_log").insert({
    actor_id: auth.profile.id,
    academy_id: academyId,
    target_id: target.id as string,
    note: `${academy.name} · ${target.name ?? target.email}`,
  });

  return NextResponse.json({
    ok: true,
    /*
     * 갈 곳에 ?academy= 를 달아 둔다. 학원은 서브도메인으로 가르는데 슈퍼관리자는
     * www 에서 들어오므로, 그대로 두면 기본 학원 이름과 색이 뜬다.
     * resolveAcademySlug 는 쿼리를 가장 먼저 보므로 이 값이 이긴다.
     */
    url:
      `${origin}/auth/callback?token_hash=${encodeURIComponent(tokenHash)}` +
      `&next=${encodeURIComponent(`/admin?academy=${String(academy.slug ?? "")}`)}` +
      `&academy=${encodeURIComponent(String(academy.slug ?? ""))}`,
    academyName: academy.name,
    adminName: (target.name as string | null) ?? (target.email as string),
  });
}

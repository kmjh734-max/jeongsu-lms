import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ROLE_COOKIE } from "@/lib/auth/role-cookie";
import { ACADEMY_COOKIE } from "@/lib/tenant/resolve-login-academy";
import { getDashboardPathForRole } from "@/lib/auth/roles";
import type { UserRole } from "@/types/database";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  /*
   * 일회용 고리(token_hash)로도 들어올 수 있게 한다.
   *
   * 슈퍼관리자가 학원 관리자로 들어갈 때 쓴다(2026-09-30). Supabase가 만든
   * 고리를 그대로 열면 우리 주소가 아닌 곳으로 튕기고 토큰도 주소 뒤 해시로
   * 와서 여기서 못 받는다. 그래서 고리의 token_hash만 떼어 우리 주소로 온다.
   */
  const tokenHash = searchParams.get("token_hash");
  const next = searchParams.get("next") ?? "/";

  if (tokenHash) {
    const supabase = await createClient();
    /*
     * 들어가기 전에 지금 세션을 걷어 낸다.
     *
     * 세션 쿠키는 길면 조각으로 나뉘어 담긴다(…auth-token.0, .1). 새 세션이 한
     * 조각뿐이면 옛 조각이 남아 섞여 토큰이 깨지고 로그인 화면으로 튕긴다
     * (직접 해 보고 알았다). scope: "local" 이라 이 브라우저의 쿠키만 지운다.
     */
    await supabase.auth.signOut({ scope: "local" });
    const { error } = await supabase.auth.verifyOtp({ type: "magiclink", token_hash: tokenHash });
    /*
     * 브라우저가 실제로 친 주소로 되돌린다.
     *
     * new URL(request.url).origin 은 서버가 듣는 주소라, 개발에서 0.0.0.0 처럼
     * 브라우저가 갈 수 없는 값이 될 수 있다(직접 해 보고 알았다).
     */
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    const proto = request.headers.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
    const back = host ? `${proto}://${host}` : origin;
    const res = NextResponse.redirect(
      error ? new URL("/login?error=auth", back) : new URL(next, back)
    );
    /*
     * 역할 쿠키를 지운다.
     *
     * 미들웨어는 이 쿠키가 있으면 profiles 를 다시 읽지 않는다. 사람이 바뀌었는데
     * 옛 역할이 남아 있으면 엉뚱한 화면으로 보낸다 — 슈퍼관리자로 들어갔다가
     * 학원 관리자가 되었는데도 /admin 에서 /super-admin 으로 되튕겼다.
     */
    res.cookies.set(ROLE_COOKIE, "", { path: "/", maxAge: 0 });
    /*
     * 학원 쿠키는 들어갈 학원으로 바꿔 준다. 그대로 두면 앞서 보던 학원의 이름과
     * 색이 남고, 비워 두면 기본 학원이 뜬다.
     */
    const academy = searchParams.get("academy");
    if (academy) res.cookies.set(ACADEMY_COOKIE, academy, { path: "/", maxAge: 60 * 60 * 24 * 7 });
    else res.cookies.set(ACADEMY_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        const role = profile?.role as UserRole | undefined;
        const redirectPath = role
          ? getDashboardPathForRole(role)
          : next;

        return NextResponse.redirect(`${origin}${redirectPath}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}

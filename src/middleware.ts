import { NextResponse, type NextRequest } from "next/server";
import { isNeltEnabled, isNeltPath, isVocabEnabled, isVocabPath } from "@/lib/academy-features";
import { updateSession } from "@/lib/supabase/middleware";
import {
  getDashboardPathForRole,
  isRolePathAllowed,
} from "@/lib/auth/roles";
import {
  parseRoleCookie,
  ROLE_COOKIE,
  ROLE_COOKIE_MAX_AGE,
} from "@/lib/auth/role-cookie";
import {
  ACADEMY_COOKIE,
  ACADEMY_COOKIE_MAX_AGE,
  resolveAcademySlug,
} from "@/lib/tenant/resolve-login-academy";
import type { UserRole } from "@/types/database";

const PUBLIC_PREFIXES = [
  "/login",
  "/auth/callback",
  "/report/share",
  "/student-record/share",
  "/nelt/share",
  "/api/reports/share",
  "/api/student-records/share",
  "/api/nelt/share",
  "/exam-vocab",
  "/api/exam-vocab",
];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true;
  }
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/favicon")) return true;
  if (pathname.startsWith("/image/")) return true;
  if (pathname.startsWith("/images/")) return true;
  if (pathname === "/pdf.worker.min.mjs") return true;
  if (/\.(svg|png|jpg|jpeg|gif|webp|ico|mjs)$/i.test(pathname)) return true;
  return false;
}

function applyAcademyCookie(res: NextResponse, slug: string | null) {
  if (!slug) return;
  res.cookies.set(ACADEMY_COOKIE, slug, {
    path: "/",
    maxAge: ACADEMY_COOKIE_MAX_AGE,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

function applyRoleCookie(res: NextResponse, role: UserRole) {
  res.cookies.set(ROLE_COOKIE, role, {
    path: "/",
    maxAge: ROLE_COOKIE_MAX_AGE,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

function clearRoleCookie(res: NextResponse) {
  res.cookies.set(ROLE_COOKIE, "", {
    path: "/",
    maxAge: 0,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

function readAcademySlug(request: NextRequest): string | null {
  return resolveAcademySlug({
    queryAcademy: request.nextUrl.searchParams.get("academy"),
    host: request.headers.get("host"),
    cookieAcademy: request.cookies.get(ACADEMY_COOKIE)?.value,
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const academySlug = readAcademySlug(request);

  // 학생 QR 경로 → 공개 학습 (로그인 전 리다이렉트)
  if (pathname.startsWith("/student/vocab/exam/")) {
    const setId = pathname.replace("/student/vocab/exam/", "").split("/")[0];
    if (setId) {
      const url = request.nextUrl.clone();
      url.pathname = `/exam-vocab/${setId}`;
      const res = NextResponse.redirect(url);
      applyAcademyCookie(res, academySlug);
      return res;
    }
  }

  // 공개 경로는 세션/역할 검사 없이 통과 (학부모 리포트 링크 등)
  if (isPublicPath(pathname)) {
    // 서브도메인으로 /login 진입 시 ?academy= 맞춰 URL 정규화
    if (
      pathname === "/login" &&
      academySlug &&
      !request.nextUrl.searchParams.get("academy")
    ) {
      const fromHost = resolveAcademySlug({
        host: request.headers.get("host"),
      });
      if (fromHost) {
        const url = request.nextUrl.clone();
        url.searchParams.set("academy", fromHost);
        const res = NextResponse.redirect(url);
        applyAcademyCookie(res, fromHost);
        return res;
      }
    }
    const res = NextResponse.next();
    applyAcademyCookie(res, academySlug);
    return res;
  }

  if (!isVocabEnabled() && pathname.startsWith("/api/vocab")) {
    return NextResponse.json(
      { ok: false, message: "이 학원에서는 단어학습을 사용하지 않습니다." },
      { status: 404 }
    );
  }

  if (!isNeltEnabled() && pathname.startsWith("/api/nelt")) {
    return NextResponse.json(
      { ok: false, message: "이 학원에서는 NELT 성장 리포트를 사용하지 않습니다." },
      { status: 404 }
    );
  }

  const { supabase, user, supabaseResponse } = await updateSession(request);
  applyAcademyCookie(supabaseResponse, academySlug);

  if (!user) {
    // fetch(/api/...)는 HTML 로그인 페이지를 JSON으로 파싱하다 깨지므로 JSON 반환
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { ok: false, message: "로그인이 필요합니다. 새로고침 후 다시 시도해 주세요." },
        { status: 401 }
      );
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    const returnPath = `${pathname}${request.nextUrl.search}`;
    url.searchParams.set("redirect", returnPath);
    if (academySlug) url.searchParams.set("academy", academySlug);
    const res = NextResponse.redirect(url);
    applyAcademyCookie(res, academySlug);
    clearRoleCookie(res);
    return res;
  }

  // 역할 쿠키가 있으면 profiles 조회 생략 (레이아웃에서 최종 권한 검증)
  let role: UserRole | null = parseRoleCookie(
    request.cookies.get(ROLE_COOKIE)?.value
  );
  if (!role) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = parseRoleCookie(profile?.role ?? null);
    if (role) applyRoleCookie(supabaseResponse, role);
  }

  if (!role) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { ok: false, message: "권한이 없습니다. 다시 로그인해 주세요." },
        { status: 401 }
      );
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    if (academySlug) url.searchParams.set("academy", academySlug);
    const res = NextResponse.redirect(url);
    applyAcademyCookie(res, academySlug);
    clearRoleCookie(res);
    return res;
  }

  const dashboardPath = getDashboardPathForRole(role);

  if (!isVocabEnabled() && isVocabPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = dashboardPath;
    url.search = "";
    const res = NextResponse.redirect(url);
    applyRoleCookie(res, role);
    return res;
  }

  if (!isNeltEnabled() && isNeltPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = dashboardPath;
    url.search = "";
    const res = NextResponse.redirect(url);
    applyRoleCookie(res, role);
    return res;
  }

  if (pathname === "/login") {
    const rawRedirect =
      request.nextUrl.searchParams.get("redirect") ??
      request.nextUrl.searchParams.get("redirectTo");
    if (
      rawRedirect?.startsWith("/") &&
      !rawRedirect.startsWith("//")
    ) {
      const url = request.nextUrl.clone();
      const q = rawRedirect.indexOf("?");
      url.pathname = q === -1 ? rawRedirect : rawRedirect.slice(0, q);
      url.search = q === -1 ? "" : rawRedirect.slice(q);
      const res = NextResponse.redirect(url);
      applyRoleCookie(res, role);
      return res;
    }
    const url = request.nextUrl.clone();
    url.pathname = dashboardPath;
    url.search = "";
    const res = NextResponse.redirect(url);
    applyRoleCookie(res, role);
    return res;
  }

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = dashboardPath;
    url.search = "";
    const res = NextResponse.redirect(url);
    applyRoleCookie(res, role);
    return res;
  }

  const rolePrefixes = ["/admin", "/teacher", "/student", "/super-admin"];
  const hitsRolePrefix = rolePrefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (hitsRolePrefix && !isRolePathAllowed(role, pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = dashboardPath;
    url.search = "";
    const res = NextResponse.redirect(url);
    applyRoleCookie(res, role);
    return res;
  }

  applyRoleCookie(supabaseResponse, role);
  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|pdf.worker.min.mjs|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mjs)$).*)",
  ],
};

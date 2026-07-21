import { NextResponse, type NextRequest } from "next/server";
import { isVocabEnabled, isVocabPath } from "@/lib/academy-features";
import { updateSession } from "@/lib/supabase/middleware";
import {
  getDashboardPathForRole,
  isRolePathAllowed,
} from "@/lib/auth/roles";
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
  "/api/reports/share",
  "/api/student-records/share",
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

  const { supabase, user, supabaseResponse } = await updateSession(request);
  applyAcademyCookie(supabaseResponse, academySlug);

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    const returnPath = `${pathname}${request.nextUrl.search}`;
    url.searchParams.set("redirect", returnPath);
    if (academySlug) url.searchParams.set("academy", academySlug);
    const res = NextResponse.redirect(url);
    applyAcademyCookie(res, academySlug);
    return res;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role as UserRole | undefined;

  if (!role) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    if (academySlug) url.searchParams.set("academy", academySlug);
    const res = NextResponse.redirect(url);
    applyAcademyCookie(res, academySlug);
    return res;
  }

  const dashboardPath = getDashboardPathForRole(role);

  if (!isVocabEnabled() && isVocabPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = dashboardPath;
    url.search = "";
    return NextResponse.redirect(url);
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
      return NextResponse.redirect(url);
    }
    const url = request.nextUrl.clone();
    url.pathname = dashboardPath;
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = dashboardPath;
    url.search = "";
    return NextResponse.redirect(url);
  }

  const rolePrefixes = ["/admin", "/teacher", "/student", "/super-admin"];
  const hitsRolePrefix = rolePrefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (hitsRolePrefix && !isRolePathAllowed(role, pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = dashboardPath;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|pdf.worker.min.mjs|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mjs)$).*)",
  ],
};

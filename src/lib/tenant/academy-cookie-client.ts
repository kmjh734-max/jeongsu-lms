"use client";

import { ACADEMY_COOKIE } from "@/lib/tenant/resolve-login-academy";

/**
 * 어느 학원 화면이었는지 기억해 둔 쿠키를 지운다.
 *
 * 슈퍼관리자가 학원에 들어갔다 나오면 이 쿠키(90일)가 남아, 로그아웃해도 계속
 * 그 학원 로그인 화면이 떴다(2026-10-01 선생님 지적: 「윌링어학원 로그아웃했는데
 * 계속 윌링어학원 페이지로 나와」). 로그아웃은 그 학원에서 나오는 것이므로 같이 지운다.
 *
 * 학원 주소(서브도메인)나 학원 전용 링크로 들어오면 미들웨어가 다시 넣어 주므로,
 * 학원 선생님이 보시는 화면은 달라지지 않는다.
 */
export function clearAcademyCookieClient() {
  document.cookie = `${ACADEMY_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

import { NextResponse } from "next/server";

/** 어휘 진단 공개 API 공통 */

export const NO_STORE = { "Cache-Control": "no-store" };

export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const host = new URL(origin).host;
    return [new URL(request.url).host, request.headers.get("host"), request.headers.get("x-forwarded-host")].includes(host);
  } catch {
    return false;
  }
}

export function closedMessage(kind: string): string {
  return kind === "expired" ? "링크 사용 기간이 지났습니다. 학원에 새 링크를 요청해 주세요."
    : kind === "revoked" ? "학원에서 회수한 링크입니다. 학원에 문의해 주세요."
    : kind === "inactive" ? "지금은 응시할 수 없는 시험입니다. 학원에 문의해 주세요."
    : "올바르지 않은 링크입니다.";
}

export function closedResponse(kind: string) {
  return NextResponse.json({ ok: false, kind, message: closedMessage(kind) }, { status: kind === "invalid" ? 404 : 410, headers: NO_STORE });
}

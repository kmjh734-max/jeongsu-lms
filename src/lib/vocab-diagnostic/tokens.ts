import { createHash, createHmac, randomBytes } from "node:crypto";

/**
 * 응시 링크·결과 링크 토큰.
 *
 * 토큰 원문은 DB에 두지 않는다. 행 id·목적·nonce를 서버 비밀값으로 서명해 만들고, DB에는 그 해시만 둔다.
 * 그래서 관리자 화면은 언제든 같은 링크를 다시 보여 줄 수 있고(서명을 다시 계산), DB가 새어도 링크는 만들 수 없다.
 * 회수·재발급은 nonce를 바꾼다. 응시 토큰과 결과 토큰은 목적이 달라 서로 바꿔 쓸 수 없다.
 */
export type DiagTokenPurpose = "invite" | "result";

function secret(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY가 설정되어 있지 않습니다.");
  return key;
}

export function newNonce(): string {
  return randomBytes(12).toString("base64url");
}

export function diagToken(purpose: DiagTokenPurpose, rowId: string, nonce: string): string {
  return createHmac("sha256", secret()).update(`vocab-diag:${purpose}:${rowId}:${nonce}`).digest("base64url");
}

export function hashDiagToken(purpose: DiagTokenPurpose, token: string): string {
  return createHash("sha256").update(`${purpose}:${token}`).digest("hex");
}

/** 주소창에서 온 값을 다듬는다. 꼴이 아니면 null */
export function cleanToken(raw: unknown): string | null {
  const t = decodeURIComponent(String(raw ?? "")).trim();
  return /^[A-Za-z0-9_-]{40,60}$/.test(t) ? t : null;
}

export function siteBaseUrl(): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "").trim().replace(/\/$/, "");
  return base;
}

export function invitePath(token: string): string {
  return `/diag/${token}`;
}

export function resultPath(token: string): string {
  return `/diag/result/${token}`;
}

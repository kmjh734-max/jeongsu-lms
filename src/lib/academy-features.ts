import { ACADEMY_ID } from "@/config/academy";

/** 단어학습 — 정수학원(jeongsu)만 사용 */
export function isVocabEnabled(): boolean {
  return ACADEMY_ID === "jeongsu";
}

/** NELT 성장 리포트 — 정수학원(jeongsu)만 사용 */
export function isNeltEnabled(): boolean {
  return ACADEMY_ID === "jeongsu";
}

export function filterNavItems<T extends { href: string }>(items: T[]): T[] {
  let next = items;
  if (!isVocabEnabled()) {
    next = next.filter((item) => !item.href.includes("/vocab"));
  }
  if (!isNeltEnabled()) {
    next = next.filter((item) => !item.href.includes("/nelt"));
  }
  return next;
}

export function isVocabPath(pathname: string): boolean {
  return (
    pathname.startsWith("/admin/vocab") ||
    pathname.startsWith("/teacher/vocab") ||
    pathname.startsWith("/student/vocab") ||
    pathname.startsWith("/api/vocab")
  );
}

export function isNeltPath(pathname: string): boolean {
  return (
    pathname.startsWith("/admin/nelt") ||
    pathname.startsWith("/teacher/nelt") ||
    pathname.startsWith("/nelt/") ||
    pathname.startsWith("/api/nelt")
  );
}

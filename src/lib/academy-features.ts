/**
 * 단어학습 — EngCore에 등록되는 모든 학원에서 사용.
 * (기존에는 jeongsu 전용이었으나, 신규 등록 학원도 쓸 수 있게 개방)
 */
export function isVocabEnabled(): boolean {
  return true;
}

/**
 * NELT 성장 리포트 — EngCore에 등록되는 모든 학원에서 사용.
 * (기존에는 jeongsu 전용이었으나, 신규 등록 학원도 쓸 수 있게 개방)
 */
export function isNeltEnabled(): boolean {
  return true;
}

/** 내신대비학습 — EngCore 모든 학원에서 사용 */
export function isExamPrepEnabled(): boolean {
  return true;
}

export function filterNavItems<T extends { href: string }>(items: T[]): T[] {
  let next = items;
  if (!isVocabEnabled()) {
    next = next.filter((item) => !item.href.includes("/vocab"));
  }
  if (!isNeltEnabled()) {
    next = next.filter((item) => !item.href.includes("/nelt"));
  }
  if (!isExamPrepEnabled()) {
    next = next.filter((item) => !item.href.includes("/exam-prep"));
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

export function isExamPrepPath(pathname: string): boolean {
  return (
    pathname.startsWith("/admin/exam-prep") ||
    pathname.startsWith("/teacher/exam-prep") ||
    pathname.startsWith("/student/exam-prep") ||
    pathname.startsWith("/api/exam-prep")
  );
}

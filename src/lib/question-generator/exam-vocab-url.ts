import { SITE_URL } from "@/lib/branding";

/**
 * 시험지 QR 주소 — 화면(클라이언트)에서도 쓰므로 서버 전용 코드를 불러오지 않는 작은 모듈로 둔다.
 * (exam-vocab.ts는 관리자 DB 클라이언트를 쓰는 서버 모듈)
 */
export function siteBase(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? SITE_URL).replace(/\/$/, "");
}

/** 시험지 QR — 변형문제 연계 단어학습 (로그인 불필요) */
export function buildExamVocabUrl(setId: string): string {
  return `${siteBase()}/exam-vocab/${setId}`;
}

/** vocab_set_id 없을 때 — job 기준 URL (접속 시 단어장 자동 생성) */
export function buildExamVocabUrlForJob(jobId: string): string {
  return `${siteBase()}/exam-vocab/job/${jobId}`;
}

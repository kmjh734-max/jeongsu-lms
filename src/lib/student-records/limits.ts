/** Vercel 업로드 본문 한도를 고려 */
export const STUDENT_RECORD_MAX_TOTAL_BYTES = 4_000_000;
export const STUDENT_RECORD_MAX_PDF_BYTES = 4 * 1024 * 1024;
export const STUDENT_RECORD_MAX_IMAGE_BYTES = 1 * 1024 * 1024;

/** 직접 업로드하는 JPG/PNG */
export const STUDENT_RECORD_MAX_DIRECT_IMAGES = 10;

/** 스캔 PDF → Vision 변환 최대 페이지 */
export const STUDENT_RECORD_MAX_PDF_PAGES = 40;

/** PDF 페이지 렌더 해상도 (용량·속도 균형) */
export const STUDENT_RECORD_PDF_RENDER_WIDTH = 1200;

/** 한 번에 Vision에 넣을 페이지 수 (작은 글자 인식용) */
export const STUDENT_RECORD_VISION_BATCH_SIZE = 2;

/** 클라이언트 PDF→JPEG 변환 후 업로드 예산 (전체) */
export const STUDENT_RECORD_PREPARED_UPLOAD_BUDGET = 3_600_000;

/** OCR extract API 1회당 이미지 수 (4MB 한도·선명도 균형) */
export const STUDENT_RECORD_EXTRACT_CHUNK_PAGES = 5;

/** 페이지 JPEG 목표 용량 — 청크 업로드로 페이지당 선명도 확보 */
export const STUDENT_RECORD_PAGE_JPEG_TARGET_BYTES = 380_000;

/** Vision OCR 동시 요청 수 (429 rate limit 방지) */
export const STUDENT_RECORD_VISION_CONCURRENCY = 2;

/** 이 수 초과 시 배치 전사 후 텍스트-only로 최종 보고서 생성 */
export const STUDENT_RECORD_VISION_BATCH_THRESHOLD = 6;

export const STUDENT_RECORD_ANALYSIS_TIMEOUT_MS = 300_000;

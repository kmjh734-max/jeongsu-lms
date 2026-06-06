/** Vercel 업로드 본문 한도를 고려 */
export const STUDENT_RECORD_MAX_TOTAL_BYTES = 4_000_000;
export const STUDENT_RECORD_MAX_PDF_BYTES = 4 * 1024 * 1024;
export const STUDENT_RECORD_MAX_IMAGE_BYTES = 1 * 1024 * 1024;

/** 직접 업로드하는 JPG/PNG */
export const STUDENT_RECORD_MAX_DIRECT_IMAGES = 10;

/** 스캔 PDF → Vision 변환 최대 페이지 */
export const STUDENT_RECORD_MAX_PDF_PAGES = 40;

/** PDF 페이지 렌더 해상도 (용량·속도 균형) */
export const STUDENT_RECORD_PDF_RENDER_WIDTH = 800;

/** 한 번에 Vision에 넣을 페이지 수 */
export const STUDENT_RECORD_VISION_BATCH_SIZE = 8;

/** 이 수 초과 시 배치 전사 후 텍스트-only로 최종 보고서 생성 */
export const STUDENT_RECORD_VISION_BATCH_THRESHOLD = 6;

export const STUDENT_RECORD_ANALYSIS_TIMEOUT_MS = 300_000;

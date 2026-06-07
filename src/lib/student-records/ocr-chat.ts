import { isGpt5FamilyModel } from "@/lib/student-records/model";

/** PDF 직접 OCR 1회 출력 상한 */
export const PDF_OCR_MAX_OUTPUT_TOKENS = 16_384;

/** Vision 배치 OCR 1회 출력 상한 */
export const VISION_OCR_MAX_OUTPUT_TOKENS = 16_384;

/** Vision 문서 OCR에 가장 안정적인 모델 */
export const OCR_MODEL_VISION_PRIMARY = "gpt-4o";
/** Vision 1차 실패 시 상위 모델 */
export const OCR_MODEL_VISION_SECONDARY = "gpt-5.5";
export const OCR_MODEL_FALLBACK = "gpt-5";

/** OCR 모델 (미설정 시 gpt-4o → gpt-5.5 → gpt-5) */
export function getOcrModelCandidates(): string[] {
  const configured = process.env.OPENAI_MODEL_STUDENT_RECORDS_OCR?.trim();
  const defaults = [
    OCR_MODEL_VISION_PRIMARY,
    OCR_MODEL_VISION_SECONDARY,
    OCR_MODEL_FALLBACK,
  ];
  if (configured) {
    return [configured, ...defaults.filter((m) => m !== configured)];
  }
  return defaults;
}

export function buildOcrChatBody(
  model: string,
  system: string,
  content: unknown,
  options?: {
    includeTemperature?: boolean;
    includeReasoningEffort?: boolean;
    maxOutputTokens?: number;
  }
): Record<string, unknown> {
  const includeTemperature = options?.includeTemperature ?? !isGpt5FamilyModel(model);
  const includeReasoningEffort =
    options?.includeReasoningEffort ?? isGpt5FamilyModel(model);
  const maxOut =
    options?.maxOutputTokens ??
    (isGpt5FamilyModel(model) ? PDF_OCR_MAX_OUTPUT_TOKENS : PDF_OCR_MAX_OUTPUT_TOKENS);

  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content },
    ],
  };

  if (includeTemperature) {
    body.temperature = 0.2;
  }

  if (isGpt5FamilyModel(model)) {
    body.max_completion_tokens = maxOut;
    if (includeReasoningEffort) {
      body.reasoning_effort = "low";
    }
  } else {
    body.max_tokens = maxOut;
  }

  return body;
}

export function sanitizePdfFilename(name: string): string {
  const base = name.trim() || "student-record.pdf";
  if (base.toLowerCase().endsWith(".pdf")) return base;
  return `${base}.pdf`;
}

export function pdfDataUrlToBuffer(dataUrl: string): Buffer {
  const marker = "base64,";
  const idx = dataUrl.indexOf(marker);
  const b64 = idx >= 0 ? dataUrl.slice(idx + marker.length) : dataUrl;
  return Buffer.from(b64, "base64");
}

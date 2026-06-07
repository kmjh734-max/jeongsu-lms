import { isGpt5FamilyModel } from "@/lib/student-records/model";

export const PDF_OCR_MAX_OUTPUT_TOKENS = 32_768;

/** PDF 직접 OCR — 4o가 스캔 PDF 인식률이 가장 안정적 */
export const PDF_OCR_MODELS = ["gpt-4o", "gpt-4o-mini", "gpt-5.5"] as const;

/** Vision OCR — reasoning 모델은 이미지 응답이 비는 경우가 있어 4o 계열만 사용 */
export const VISION_OCR_MODELS = ["gpt-4o", "gpt-4o-mini"] as const;

export function buildOcrChatBody(
  model: string,
  system: string,
  content: unknown,
  options?: { includeTemperature?: boolean; includeReasoningEffort?: boolean }
): Record<string, unknown> {
  const includeTemperature = options?.includeTemperature ?? !isGpt5FamilyModel(model);
  const includeReasoningEffort =
    options?.includeReasoningEffort ?? isGpt5FamilyModel(model);

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
    body.max_completion_tokens = PDF_OCR_MAX_OUTPUT_TOKENS;
    if (includeReasoningEffort) {
      body.reasoning_effort = "low";
    }
  } else {
    body.max_tokens = PDF_OCR_MAX_OUTPUT_TOKENS;
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

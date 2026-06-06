const MAX_IMAGE_BYTES = 1 * 1024 * 1024;
const MAX_PDF_BYTES = 3 * 1024 * 1024;
const MAX_IMAGES = 4;
const MAX_PDF_PAGES = 4;
const MAX_TOTAL_BYTES = 3_500_000;

import { isImageUpload, isPdfUpload } from "@/lib/student-records/file-types";

export { isPdfUpload } from "@/lib/student-records/file-types";

export interface ParsedStudentRecordUpload {
  textParts: string[];
  imageDataUrls: string[];
}

export async function parseStudentRecordUpload(
  formData: FormData
): Promise<ParsedStudentRecordUpload> {
  const textParts: string[] = [];
  const pasted = formData.get("text");
  if (typeof pasted === "string" && pasted.trim()) {
    textParts.push(pasted.trim());
  }

  const imageDataUrls: string[] = [];
  const files = formData.getAll("files");
  let totalBytes = 0;

  if (files.length === 0) {
    return { textParts, imageDataUrls };
  }

  for (const entry of files) {
    if (!(entry instanceof File) || entry.size === 0) continue;
    totalBytes += entry.size;
    if (totalBytes > MAX_TOTAL_BYTES) {
      throw new Error(
        "전체 업로드 용량이 서버 한도(약 3.5MB)를 초과합니다. 파일 수·용량을 줄여 주세요."
      );
    }

    if (isPdfUpload(entry)) {
      if (entry.size > MAX_PDF_BYTES) {
        throw new Error("PDF 파일은 3MB 이하만 업로드할 수 있습니다.");
      }
      const buffer = Buffer.from(await entry.arrayBuffer());
      await processPdfFile(buffer, entry.name, textParts, imageDataUrls);
      continue;
    }

    if (isImageUpload(entry)) {
      if (imageDataUrls.length >= MAX_IMAGES) {
        throw new Error(`이미지는 최대 ${MAX_IMAGES}장까지 업로드할 수 있습니다.`);
      }
      if (entry.size > MAX_IMAGE_BYTES) {
        throw new Error("이미지 파일은 1MB 이하만 업로드할 수 있습니다.");
      }
      const buffer = Buffer.from(await entry.arrayBuffer());
      const b64 = buffer.toString("base64");
      imageDataUrls.push(`data:${entry.type};base64,${b64}`);
      continue;
    }

    throw new Error(
      `지원하지 않는 파일 형식입니다. (${entry.name || "unknown"}) PDF, JPG/PNG/WEBP만 업로드할 수 있습니다.`
    );
  }

  return { textParts, imageDataUrls };
}

async function processPdfFile(
  buffer: Buffer,
  name: string,
  textParts: string[],
  imageDataUrls: string[]
): Promise<void> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });

  try {
    let pdfText = "";
    try {
      const textResult = await parser.getText();
      pdfText = typeof textResult.text === "string" ? textResult.text.trim() : "";
    } catch {
      pdfText = "";
    }

    if (pdfText) {
      textParts.push(`[PDF: ${name}]\n${pdfText}`);
      return;
    }

    const remainingSlots = MAX_IMAGES - imageDataUrls.length;
    if (remainingSlots <= 0) {
      throw new Error(
        `PDF(${name})에서 텍스트를 추출하지 못했고, 이미지 변환 슬롯이 없습니다.`
      );
    }

    const pageLimit = Math.min(MAX_PDF_PAGES, remainingSlots);
    let screenshots;
    try {
      screenshots = await parser.getScreenshot({
        first: pageLimit,
        desiredWidth: 1000,
        imageDataUrl: true,
        imageBuffer: false,
      });
    } catch {
      screenshots = null;
    }

    const pages = screenshots?.pages ?? [];
    for (const page of pages) {
      if (imageDataUrls.length >= MAX_IMAGES) break;
      if (page.dataUrl?.startsWith("data:image/")) {
        imageDataUrls.push(page.dataUrl);
      }
    }

    if (imageDataUrls.length === 0) {
      throw new Error(
        `PDF(${name})에서 내용을 읽지 못했습니다. 스캔 PDF라면 선명한 JPG/PNG로 나눠 업로드해 주세요.`
      );
    }

    textParts.push(
      `[PDF: ${name}] 텍스트 레이어 없음 — ${pages.length}페이지를 이미지로 변환해 분석합니다.`
    );
  } finally {
    await parser.destroy();
  }
}

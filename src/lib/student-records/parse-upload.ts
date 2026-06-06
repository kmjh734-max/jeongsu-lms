import { isImageUpload, isPdfUpload } from "@/lib/student-records/file-types";
import {
  STUDENT_RECORD_MAX_DIRECT_IMAGES,
  STUDENT_RECORD_MAX_PDF_BYTES,
  STUDENT_RECORD_MAX_PDF_PAGES,
  STUDENT_RECORD_MAX_TOTAL_BYTES,
} from "@/lib/student-records/limits";
import { createPdfParser } from "@/lib/student-records/pdf-runtime";
import { renderPdfPageImages } from "@/lib/student-records/render-pdf-pages";
import type { StudentRecordPdfDocument } from "@/lib/student-records/types";

export { isPdfUpload } from "@/lib/student-records/file-types";

export interface ParsedStudentRecordUpload {
  textParts: string[];
  imageDataUrls: string[];
  pdfDocuments: StudentRecordPdfDocument[];
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
  const pdfDocuments: StudentRecordPdfDocument[] = [];
  const files = formData.getAll("files");
  let totalBytes = 0;
  let directImageCount = 0;

  if (files.length === 0) {
    return { textParts, imageDataUrls, pdfDocuments };
  }

  for (const entry of files) {
    if (!(entry instanceof File) || entry.size === 0) continue;
    totalBytes += entry.size;
    if (totalBytes > STUDENT_RECORD_MAX_TOTAL_BYTES) {
      throw new Error(
        "전체 업로드 용량이 서버 한도(약 4MB)를 초과합니다. 파일 수·용량을 줄여 주세요."
      );
    }

    if (isPdfUpload(entry)) {
      if (entry.size > STUDENT_RECORD_MAX_PDF_BYTES) {
        throw new Error("PDF 파일은 4MB 이하만 업로드할 수 있습니다.");
      }
      const buffer = Buffer.from(await entry.arrayBuffer());
      await processPdfFile(
        buffer,
        entry.name,
        textParts,
        imageDataUrls,
        pdfDocuments
      );
      continue;
    }

    if (isImageUpload(entry)) {
      directImageCount += 1;
      if (directImageCount > STUDENT_RECORD_MAX_DIRECT_IMAGES) {
        throw new Error(
          `이미지는 최대 ${STUDENT_RECORD_MAX_DIRECT_IMAGES}장까지 업로드할 수 있습니다.`
        );
      }
      if (imageDataUrls.length >= STUDENT_RECORD_MAX_PDF_PAGES) {
        throw new Error(
          `처리 가능한 이미지는 최대 ${STUDENT_RECORD_MAX_PDF_PAGES}장입니다.`
        );
      }
      if (entry.size > 1 * 1024 * 1024) {
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

  return { textParts, imageDataUrls, pdfDocuments };
}

function toPdfDataUrl(buffer: Buffer): string {
  return `data:application/pdf;base64,${buffer.toString("base64")}`;
}

async function processPdfFile(
  buffer: Buffer,
  name: string,
  textParts: string[],
  imageDataUrls: string[],
  pdfDocuments: StudentRecordPdfDocument[]
): Promise<void> {
  const parser = createPdfParser(buffer);

  try {
    let pdfText = "";
    let totalPages = STUDENT_RECORD_MAX_PDF_PAGES;

    try {
      const [textResult, infoResult] = await Promise.all([
        parser.getText(),
        parser.getInfo(),
      ]);
      pdfText =
        typeof textResult.text === "string" ? textResult.text.trim() : "";
      if (infoResult.total > 0) {
        totalPages = Math.min(infoResult.total, STUDENT_RECORD_MAX_PDF_PAGES);
      }
    } catch {
      pdfText = "";
    }

    if (pdfText.length >= 200) {
      textParts.push(`[PDF: ${name}]\n${pdfText}`);
      return;
    }

    const pageLimit = Math.min(
      totalPages,
      STUDENT_RECORD_MAX_PDF_PAGES - imageDataUrls.length
    );

    if (pageLimit > 0) {
      const rendered = await renderPdfPageImages(parser, pageLimit);
      for (const url of rendered) {
        if (imageDataUrls.length >= STUDENT_RECORD_MAX_PDF_PAGES) break;
        imageDataUrls.push(url);
      }
    }

    pdfDocuments.push({
      name,
      dataUrl: toPdfDataUrl(buffer),
    });

    const pageNote =
      totalPages > pageLimit
        ? ` (전체 ${totalPages}페이지, OCR로 전 페이지 분석)`
        : totalPages > 0
          ? ` (${totalPages}페이지)`
          : "";

    if (imageDataUrls.length > 0) {
      textParts.push(
        `[PDF: ${name}] 스캔 PDF — ${imageDataUrls.length}페이지 이미지 변환 + OpenAI OCR${pageNote}`
      );
    } else {
      textParts.push(
        `[PDF: ${name}] 스캔 PDF — OpenAI OCR로 분석합니다.${pageNote}`
      );
    }

    if (pdfText) {
      textParts.push(`[PDF: ${name} 부분 텍스트]\n${pdfText}`);
    }
  } finally {
    await parser.destroy();
  }
}

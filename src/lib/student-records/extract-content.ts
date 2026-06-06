import { STUDENT_RECORD_ANALYSIS_TIMEOUT_MS } from "@/lib/student-records/limits";
import { extractTextFromPdfDocuments } from "@/lib/student-records/pdf-ocr";
import type { AnalyzeStudentRecordInput } from "@/lib/student-records/types";
import { extractTextFromPageImages } from "@/lib/student-records/vision-extract";

export async function extractStudentRecordContent(
  input: AnalyzeStudentRecordInput
): Promise<{ ok: true; text: string } | { ok: false; message: string }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, message: "OPENAI_API_KEY가 설정되어 있지 않습니다." };
  }

  if (
    !input.text.trim() &&
    input.imageDataUrls.length === 0 &&
    input.pdfDocuments.length === 0
  ) {
    return {
      ok: false,
      message: "학생부 텍스트 또는 이미지/PDF 자료를 입력해 주세요.",
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    STUDENT_RECORD_ANALYSIS_TIMEOUT_MS
  );

  try {
    let reportText = input.text.trim();
    let reportImages = [...input.imageDataUrls];

    if (input.pdfDocuments.length > 0) {
      const ocrText = await extractTextFromPdfDocuments(
        apiKey,
        input.pdfDocuments,
        input.studentName,
        controller.signal
      );
      if (ocrText.trim()) {
        reportText = [reportText, ocrText].filter(Boolean).join("\n\n");
        const ocrSucceeded =
          ocrText.length > 300 && !ocrText.includes("[OCR 실패]");
        if (ocrSucceeded) {
          reportImages = [];
        }
      }
    }

    if (reportImages.length > 0) {
      const extracted = await extractTextFromPageImages(
        apiKey,
        reportImages,
        input.studentName,
        controller.signal
      );
      if (extracted.trim()) {
        reportText = [reportText, extracted].filter(Boolean).join("\n\n");
      }
    }

    if (!reportText.trim()) {
      return {
        ok: false,
        message:
          "PDF/이미지에서 내용을 읽지 못했습니다. 파일이 선명한지 확인해 주세요.",
      };
    }

    return { ok: true, text: reportText };
  } catch {
    return {
      ok: false,
      message:
        "자료 읽기 시간이 초과되었거나 오류가 발생했습니다. PDF 용량을 줄여 다시 시도해 주세요.",
    };
  } finally {
    clearTimeout(timer);
  }
}

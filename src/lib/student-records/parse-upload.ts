const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_PDF_BYTES = 12 * 1024 * 1024;
const MAX_IMAGES = 8;

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

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

  for (const entry of files) {
    if (!(entry instanceof File) || entry.size === 0) continue;

    if (entry.type === "application/pdf") {
      if (entry.size > MAX_PDF_BYTES) {
        throw new Error("PDF 파일은 12MB 이하만 업로드할 수 있습니다.");
      }
      const buffer = Buffer.from(await entry.arrayBuffer());
      const pdfText = await extractPdfText(buffer);
      if (pdfText.trim()) {
        textParts.push(`[PDF: ${entry.name}]\n${pdfText.trim()}`);
      }
      continue;
    }

    if (IMAGE_TYPES.has(entry.type)) {
      if (imageDataUrls.length >= MAX_IMAGES) {
        throw new Error(`이미지는 최대 ${MAX_IMAGES}장까지 업로드할 수 있습니다.`);
      }
      if (entry.size > MAX_IMAGE_BYTES) {
        throw new Error("이미지 파일은 4MB 이하만 업로드할 수 있습니다.");
      }
      const buffer = Buffer.from(await entry.arrayBuffer());
      const b64 = buffer.toString("base64");
      imageDataUrls.push(`data:${entry.type};base64,${b64}`);
      continue;
    }

    throw new Error(
      "지원 형식: 텍스트, PDF, JPG/PNG/WEBP 이미지입니다."
    );
  }

  return { textParts, imageDataUrls };
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return typeof result.text === "string" ? result.text : "";
    } finally {
      await parser.destroy();
    }
  } catch {
    return "";
  }
}

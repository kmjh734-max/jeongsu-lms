const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

/** Vercel 요청 본문 한도(4.5MB)를 고려한 안전 상한 */
export const STUDENT_RECORD_MAX_TOTAL_BYTES = 3_500_000;
export const STUDENT_RECORD_MAX_PDF_BYTES = 3 * 1024 * 1024;
export const STUDENT_RECORD_MAX_IMAGE_BYTES = 1 * 1024 * 1024;
export const STUDENT_RECORD_MAX_IMAGES = 4;

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function validateStudentRecordFiles(files: File[]): string | null {
  let imageCount = 0;
  let total = 0;

  for (const file of files) {
    total += file.size;

    if (file.type === "application/pdf") {
      if (file.size > STUDENT_RECORD_MAX_PDF_BYTES) {
        return `PDF는 ${formatBytes(STUDENT_RECORD_MAX_PDF_BYTES)} 이하만 업로드할 수 있습니다. (${file.name})`;
      }
      continue;
    }

    if (IMAGE_TYPES.has(file.type)) {
      imageCount += 1;
      if (imageCount > STUDENT_RECORD_MAX_IMAGES) {
        return `이미지는 최대 ${STUDENT_RECORD_MAX_IMAGES}장까지 업로드할 수 있습니다.`;
      }
      if (file.size > STUDENT_RECORD_MAX_IMAGE_BYTES) {
        return `이미지는 ${formatBytes(STUDENT_RECORD_MAX_IMAGE_BYTES)} 이하만 업로드할 수 있습니다. (${file.name})`;
      }
      continue;
    }

    return "지원 형식: PDF, JPG/PNG/WEBP 이미지입니다.";
  }

  if (total > STUDENT_RECORD_MAX_TOTAL_BYTES) {
    return `전체 업로드 용량이 ${formatBytes(STUDENT_RECORD_MAX_TOTAL_BYTES)}를 초과합니다. 파일 수·용량을 줄여 주세요.`;
  }

  return null;
}

async function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("이미지를 읽지 못했습니다."));
      img.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function compressImageForUpload(file: File): Promise<File> {
  if (!IMAGE_TYPES.has(file.type)) return file;
  if (file.size <= 400_000) return file;

  const img = await loadImage(file);
  const maxEdge = 1600;
  const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.82);
  });
  if (!blob || blob.size >= file.size) return file;

  const base = file.name.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
}

export async function prepareStudentRecordFiles(files: File[]): Promise<File[]> {
  const prepared: File[] = [];
  for (const file of files) {
    if (IMAGE_TYPES.has(file.type)) {
      prepared.push(await compressImageForUpload(file));
    } else {
      prepared.push(file);
    }
  }
  return prepared;
}

export async function readStudentRecordApiResponse<T extends { ok?: boolean; message?: string }>(
  res: Response
): Promise<{ data: T | null; error: string | null }> {
  const text = await res.text();

  if (!text.trim()) {
    if (res.status === 413) {
      return {
        data: null,
        error: `업로드 용량이 서버 한도를 초과했습니다. PDF·이미지 용량을 줄여 주세요. (최대 약 ${formatBytes(STUDENT_RECORD_MAX_TOTAL_BYTES)})`,
      };
    }
    return { data: null, error: `요청에 실패했습니다. (${res.status})` };
  }

  try {
    const data = JSON.parse(text) as T;
    return { data, error: null };
  } catch {
    const lower = text.toLowerCase();
    if (
      res.status === 413 ||
      lower.includes("request entity too large") ||
      lower.includes("payload too large")
    ) {
      return {
        data: null,
        error: `업로드 용량이 서버 한도를 초과했습니다. PDF·이미지 용량을 줄여 주세요. (최대 약 ${formatBytes(STUDENT_RECORD_MAX_TOTAL_BYTES)})`,
      };
    }
    return {
      data: null,
      error: "서버 응답을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
}

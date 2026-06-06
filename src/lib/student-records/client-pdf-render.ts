import {
  STUDENT_RECORD_MAX_PDF_PAGES,
  STUDENT_RECORD_PREPARED_UPLOAD_BUDGET,
} from "@/lib/student-records/limits";

const MAX_PAGE_EDGE = 1400;

export async function pdfFileToJpegFiles(
  file: File,
  options?: {
    maxPages?: number;
    onProgress?: (current: number, total: number) => void;
  }
): Promise<File[]> {
  const maxPages = options?.maxPages ?? STUDENT_RECORD_MAX_PDF_PAGES;
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data }).promise;
  const pageLimit = Math.min(pdf.numPages, maxPages);
  const perPageBudget = Math.floor(
    STUDENT_RECORD_PREPARED_UPLOAD_BUDGET / Math.max(pageLimit, 1)
  );
  const baseName = file.name.replace(/\.pdf$/i, "") || "student-record";
  const output: File[] = [];

  for (let pageNum = 1; pageNum <= pageLimit; pageNum++) {
    options?.onProgress?.(pageNum, pageLimit);

    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1 });
    const edgeScale = MAX_PAGE_EDGE / Math.max(viewport.width, viewport.height);
    const renderScale = Math.min(2, Math.max(1, edgeScale));
    const scaled = page.getViewport({ scale: renderScale });

    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(scaled.width);
    canvas.height = Math.floor(scaled.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;

    await page.render({ canvasContext: ctx, viewport: scaled }).promise;

    let quality = 0.88;
    let blob: Blob | null = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", quality);
      });
      if (!blob) break;
      if (blob.size <= perPageBudget) break;
      quality -= 0.1;
    }

    if (blob && blob.size > 0) {
      output.push(
        new File([blob], `${baseName}-p${String(pageNum).padStart(2, "0")}.jpg`, {
          type: "image/jpeg",
        })
      );
    }
  }

  return output;
}

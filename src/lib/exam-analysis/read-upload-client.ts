/**
 * 선생님이 올리신 자료에서 글을 뽑는다(화면 쪽).
 *
 * - 글 파일(txt·md): 그대로 읽는다
 * - PDF: 글자가 들어 있으면 그대로 뽑는다(공짜). 스캔본이면 쪽 그림을 떠서 서버에 읽힌다
 * - 사진: 서버에 읽힌다
 *
 * 선생님 말씀(2026-10-01): 「파일이면 글자로도 읽을 수 있지만 1500으로 세팅은 해」.
 * 그래서 글자로 읽히면 모델을 아예 안 부른다 — 값은 같아도 원가는 0이 된다.
 */

/** 글자가 이만큼은 나와야 「글자가 든 PDF」로 본다 */
const TEXT_ENOUGH = 400;
/**
 * 쪽마다 이만큼은 나와야 글자가 든 PDF다.
 *
 * 스캔한 주간지(175쪽)가 쪽 번호 「- 2 -」만 뽑혀 1,500자가 나왔다(2026-10-02). 전체 글자
 * 수만 보면 글자가 든 것으로 잘못 보고 읽기를 건너뛰어, 대조할 글이 하나도 없었다.
 */
const TEXT_PER_PAGE_ENOUGH = 80;
/** 스캔본일 때 읽힐 쪽 수 — 너무 많으면 오래 걸리고 값이 든다 */
const MAX_SCAN_PAGES = 6;

export type UploadRead = {
  name: string;
  text: string;
  scanned: boolean;
  /** 선생님께 알릴 것 — 스캔본이라 앞 몇 쪽만 읽었다 등 */
  note?: string;
};

async function pdfText(file: File): Promise<{ text: string; pages: number }> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const out: string[] = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    const content = await page.getTextContent();
    const line = (content.items as Array<{ str?: string }>)
      .map((i) => String(i.str ?? ""))
      .join(" ")
      .replace(/\s{2,}/g, " ")
      .trim();
    if (line) out.push(line);
  }
  return { text: out.join("\n"), pages: pdf.numPages };
}

async function pdfPagesToText(file: File, analysisId: string): Promise<string> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const out: string[] = [];
  for (let n = 1; n <= Math.min(pdf.numPages, MAX_SCAN_PAGES); n++) {
    const page = await pdf.getPage(n);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    out.push(await readOnServer(analysisId, canvas.toDataURL("image/jpeg", 0.85), `${file.name} ${n}쪽`));
  }
  return out.filter(Boolean).join("\n");
}

async function readOnServer(analysisId: string, dataUrl: string, label: string): Promise<string> {
  const res = await fetch(`/api/exam-analysis/${analysisId}/read-upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dataUrl, label }),
  });
  const json = (await res.json()) as { ok?: boolean; text?: string };
  return json.ok ? String(json.text ?? "") : "";
}

const readDataUrl = (file: Blob) =>
  new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(new Error("파일을 읽지 못했어요."));
    fr.readAsDataURL(file);
  });

export async function readUploadedMaterial(file: File, analysisId: string): Promise<UploadRead> {
  const name = file.name;
  if (/\.(txt|md|csv)$/i.test(name)) {
    return { name, text: await file.text(), scanned: false };
  }
  if (/\.pdf$/i.test(name) || file.type === "application/pdf") {
    const { text, pages } = await pdfText(file);
    const chars = text.replace(/\s/g, "").length;
    if (chars >= TEXT_ENOUGH && chars / Math.max(1, pages) >= TEXT_PER_PAGE_ENOUGH) {
      return { name, text, scanned: false };
    }
    const read = await pdfPagesToText(file, analysisId);
    const note =
      pages > MAX_SCAN_PAGES
        ? `${name}은 스캔본이라 앞 ${MAX_SCAN_PAGES}쪽만 읽었어요(전체 ${pages}쪽). 글자가 든 PDF로 올리시면 전부 읽어요.`
        : undefined;
    return { name, text: read, scanned: true, ...(note ? { note } : {}) };
  }
  if (file.type.startsWith("image/")) {
    const text = await readOnServer(analysisId, await readDataUrl(file), name);
    return { name, text, scanned: true };
  }
  throw new Error(`${name}: PDF·사진·글 파일만 올릴 수 있어요.`);
}

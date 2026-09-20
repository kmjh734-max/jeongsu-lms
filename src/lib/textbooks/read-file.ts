/**
 * 교재 목차 파일 읽기(화면 쪽).
 * - CSV·TXT: 그대로 읽는다
 * - PDF: 글자가 있으면 글자를 뽑고(공짜), 스캔본이면 쪽 그림을 떠서 읽힌다
 * - 엑셀·사진: 서버로 보내 읽는다
 */
const toBase64 = (buf: ArrayBuffer) => {
  let s = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i += 0x8000) {
    s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(s);
};

const readDataUrl = (file: Blob) =>
  new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(new Error("파일을 읽지 못했어요."));
    fr.readAsDataURL(file);
  });

async function parseOnServer(body: Record<string, unknown>): Promise<string> {
  const res = await fetch("/api/textbooks/parse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { ok?: boolean; toc?: string; message?: string };
  if (!data.ok) throw new Error(data.message ?? "파일을 읽지 못했어요.");
  return String(data.toc ?? "");
}

/** CSV·TSV 한 줄 → 들여쓰기 목차 한 줄 */
function csvToToc(text: string): string {
  const lines: string[] = [];
  for (const raw of text.split(/\r?\n/)) {
    if (!raw.trim()) continue;
    const cells = raw.split(/,|\t/).map((c) => c.trim().replace(/^"|"$/g, ""));
    const firstIdx = cells.findIndex((c) => c);
    if (firstIdx < 0) continue;
    const filled = cells.filter(Boolean);
    const last = filled[filled.length - 1] ?? "";
    const isPage = filled.length > 1 && /^[\d\s~\-–p.]+$/i.test(last);
    const title = (isPage ? filled.slice(0, -1) : filled).join(" ").trim();
    if (!title) continue;
    lines.push(`${"  ".repeat(Math.min(3, firstIdx))}${title}${isPage ? `  ${last}` : ""}`);
  }
  return lines.join("\n");
}

/** PDF에서 글자를 뽑아 줄로 모은다(x 위치로 들여쓰기를 살린다) */
async function pdfToToc(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;

  const lines: string[] = [];
  for (let n = 1; n <= Math.min(pdf.numPages, 10); n++) {
    const page = await pdf.getPage(n);
    const content = await page.getTextContent();
    // 같은 줄(y가 비슷한 조각)끼리 모은다
    const rows = new Map<number, Array<{ x: number; text: string }>>();
    for (const item of content.items as Array<{ str?: string; transform?: number[] }>) {
      const text = String(item.str ?? "").trim();
      if (!text) continue;
      const x = Number(item.transform?.[4] ?? 0);
      const y = Math.round(Number(item.transform?.[5] ?? 0) / 4) * 4;
      rows.set(y, [...(rows.get(y) ?? []), { x, text }]);
    }
    const ys = [...rows.keys()].sort((a, b) => b - a);
    const minX = Math.min(...[...rows.values()].flat().map((p) => p.x));
    for (const y of ys) {
      const parts = (rows.get(y) ?? []).sort((a, b) => a.x - b.x);
      const indent = Math.min(3, Math.max(0, Math.round((parts[0]!.x - minX) / 18)));
      const text = parts.map((p) => p.text).join(" ").replace(/\s{2,}/g, "  ").replace(/\.{3,}/g, " ").trim();
      if (text) lines.push(`${"  ".repeat(indent)}${text}`);
    }
  }
  return lines.join("\n");
}

/** 스캔 PDF: 첫 쪽들을 그림으로 떠서 읽힌다 */
async function pdfPagesToToc(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const out: string[] = [];
  for (let n = 1; n <= Math.min(pdf.numPages, 3); n++) {
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
    out.push(await parseOnServer({ kind: "image", dataUrl: canvas.toDataURL("image/jpeg", 0.85) }));
  }
  return out.filter(Boolean).join("\n");
}

export async function tocFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".csv") || name.endsWith(".txt")) {
    const text = await file.text();
    return name.endsWith(".csv") ? csvToToc(text) : text;
  }

  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    return parseOnServer({ kind: "xlsx", base64: toBase64(await file.arrayBuffer()) });
  }

  if (name.endsWith(".pdf")) {
    const fromText = await pdfToToc(file);
    // 글자가 거의 없으면 스캔본으로 보고 그림으로 읽는다
    if (fromText.replace(/\s/g, "").length > 40) return fromText;
    return pdfPagesToToc(file);
  }

  if (file.type.startsWith("image/")) {
    return parseOnServer({ kind: "image", dataUrl: await readDataUrl(file) });
  }

  throw new Error("엑셀·PDF·사진·CSV만 올릴 수 있어요.");
}

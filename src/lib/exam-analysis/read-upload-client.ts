/**
 * 선생님이 올리신 자료에서 글을 뽑는다(화면 쪽).
 *
 * - 글 파일(txt·md): 그대로 읽는다
 * - PDF: 글자가 들어 있으면 그대로 뽑는다(공짜). 스캔본이면 쪽 그림을 떠서 읽는다
 * - 사진: 쪽 그림 하나로 읽는다
 *
 * 선생님 말씀(2026-10-01): 「파일이면 글자로도 읽을 수 있지만 1500으로 세팅은 해」.
 * 그래서 글자로 읽히면 모델을 아예 안 부른다 — 값은 같아도 원가는 0이 된다.
 *
 * 스캔본 읽기 값을 줄이려고(선생님 지시 2026-10-02) 세 겹으로 읽는다.
 *  1. 같은 파일(내용 해시)을 전에 읽었으면 서버에 담아 둔 글을 그대로 쓴다 — 0원.
 *  2. 브라우저에서 무료 글자 읽기(tesseract, 영어)로 모든 쪽을 훑어 시험 지문이 있는 쪽을 고른다.
 *  3. 지문이 있는 쪽만 모델(싼 것)로 또렷하게 읽는다. 나머지 쪽은 무료 읽기 글을 둔다.
 * 무료 읽기가 안 되면(내려받기 실패 등) 예전처럼 모든 쪽을 모델로 읽는다.
 */

import { findPassageAll } from "@/lib/exam-analysis/uploaded-material";

/** 글자가 이만큼은 나와야 「글자가 든 PDF」로 본다 */
const TEXT_ENOUGH = 400;
/**
 * 쪽마다 이만큼은 나와야 글자가 든 PDF다.
 *
 * 스캔한 주간지(175쪽)가 쪽 번호 「- 2 -」만 뽑혀 1,500자가 나왔다(2026-10-02). 전체 글자
 * 수만 보면 글자가 든 것으로 잘못 보고 읽기를 건너뛰어, 대조할 글이 하나도 없었다.
 */
const TEXT_PER_PAGE_ENOUGH = 80;
/**
 * 스캔본일 때 모델로 읽힐 쪽 수의 한도.
 *
 * 처음에는 6쪽이었다. 선생님이 11쪽짜리 시험지(스캔본)를 올리시니 앞 6쪽만 읽혀
 * 19~30번은 글이 없어 적중이 아니었다(2026-10-02). 무료 읽기로 쪽을 고르면 실제로
 * 모델에 가는 쪽은 지문이 있는 몇 쪽뿐이다.
 */
const MAX_SCAN_PAGES = 40;
/** 무료 읽기로 훑을 쪽 수 — 175쪽 주간지도 다 훑는다(값이 안 든다) */
const MAX_FREE_PAGES = 200;
/** 한꺼번에 읽힐 쪽 수 — 한 쪽에 30초쯤 걸려 차례로 읽으면 6쪽에 3분이 넘었다 */
const SCAN_PARALLEL = 4;

export type UploadRead = {
  name: string;
  text: string;
  scanned: boolean;
  /** 선생님께 알릴 것 — 스캔본이라 몇 쪽만 유료로 읽었다 등 */
  note?: string;
};

export type ReadProgress = (message: string) => void;

type Shot = { n: number; dataUrl: string };

async function loadPdf(file: File) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  return pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
}

async function pdfText(file: File): Promise<{ text: string; pages: number }> {
  const pdf = await loadPdf(file);
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

/** 쪽 그림을 차례로 뜬다(캔버스 하나). 1.5배면 글자가 또렷하면서 그림은 가볍다 */
async function pdfShots(file: File, limit: number, onProgress?: ReadProgress): Promise<Shot[]> {
  const pdf = await loadPdf(file);
  const total = Math.min(pdf.numPages, limit);
  const shots: Shot[] = [];
  const canvas = document.createElement("canvas");
  for (let n = 1; n <= total; n++) {
    onProgress?.(`${file.name} 쪽 그림 뜨는 중 ${n}/${total}`);
    const page = await pdf.getPage(n);
    const viewport = page.getViewport({ scale: 1.5 });
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    shots.push({ n, dataUrl: canvas.toDataURL("image/jpeg", 0.8) });
  }
  canvas.width = 0;
  canvas.height = 0;
  return shots;
}

/**
 * 브라우저 무료 글자 읽기(영어만). 실패하면 null — 그러면 모델로 다 읽는다.
 * 언어 자료는 처음 한 번 내려받는다(몇 MB).
 */
async function freeOcr(shots: Shot[], label: string, onProgress?: ReadProgress): Promise<string[] | null> {
  try {
    const { createWorker } = await import("tesseract.js");
    const worker = await createWorker("eng");
    try {
      const out: string[] = [];
      for (const [i, shot] of shots.entries()) {
        onProgress?.(`${label} 무료 글자 읽기 ${i + 1}/${shots.length}쪽`);
        const { data } = await worker.recognize(shot.dataUrl);
        out.push(String(data.text ?? ""));
      }
      return out;
    } finally {
      await worker.terminate();
    }
  } catch {
    return null;
  }
}

/** 쪽 그림을 서버 모델로 읽는다 — 몇 쪽씩 한꺼번에 */
async function modelOcr(
  shots: Shot[],
  analysisId: string,
  label: string,
  onProgress?: ReadProgress
): Promise<string[]> {
  const out: string[] = new Array<string>(shots.length).fill("");
  let next = 0;
  let done = 0;
  const worker = async () => {
    while (next < shots.length) {
      const i = next;
      next += 1;
      const shot = shots[i]!;
      out[i] = await readOnServer(analysisId, shot.dataUrl, `${label} ${shot.n}쪽`);
      done += 1;
      onProgress?.(`${label} 지문 있는 쪽 읽는 중 ${done}/${shots.length}`);
    }
  };
  await Promise.all(Array.from({ length: Math.min(SCAN_PARALLEL, shots.length) }, worker));
  return out;
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

/** 파일 내용의 SHA-256 — 같은 파일을 다시 읽지 않으려고 */
async function fileHash(file: File): Promise<string | null> {
  try {
    const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return null;
  }
}

async function cachedRead(analysisId: string, hash: string): Promise<{ text: string; pages: number } | null> {
  try {
    const res = await fetch(`/api/exam-analysis/${analysisId}/upload-cache?hash=${hash}`);
    const json = (await res.json()) as { ok?: boolean; text?: string; pages?: number };
    return json.ok && json.text ? { text: json.text, pages: Number(json.pages ?? 0) } : null;
  } catch {
    return null;
  }
}

async function storeRead(analysisId: string, hash: string, name: string, pages: number, text: string) {
  try {
    await fetch(`/api/exam-analysis/${analysisId}/upload-cache`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hash, name, pages, text }),
    });
  } catch {
    // 못 담아도 이번 대조에는 지장이 없다
  }
}

/**
 * 스캔본 쪽 그림들을 글로 — 무료 읽기로 지문 있는 쪽을 고르고 그 쪽만 모델로 읽는다.
 * @param excerpts 시험지 문항들의 지문 앞부분 — 어느 쪽에 지문이 있는지 고르는 실마리
 */
async function shotsToText(
  shots: Shot[],
  analysisId: string,
  label: string,
  excerpts: string[],
  onProgress?: ReadProgress
): Promise<{ text: string; paidPages: number; note?: string }> {
  const free = excerpts.length > 0 ? await freeOcr(shots, label, onProgress) : null;
  if (!free) {
    const limited = shots.slice(0, MAX_SCAN_PAGES);
    const texts = await modelOcr(limited, analysisId, label, onProgress);
    const note =
      shots.length > limited.length
        ? `${label}은 스캔본이라 앞 ${limited.length}쪽만 읽었어요(전체 ${shots.length}쪽). 글자가 든 PDF로 올리시면 전부 읽어요.`
        : undefined;
    return { text: texts.filter(Boolean).join("\n"), paidPages: limited.length, ...(note ? { note } : {}) };
  }

  // 지문이 있는 쪽 — 무료 읽기 글에서 시험 지문 다섯 낱말 묶음이 보이는 쪽
  const wanted = shots
    .map((shot, i) => ({ shot, i }))
    .filter(({ i }) => excerpts.some((ex) => findPassageAll(free[i] ?? "", ex).length > 0))
    .slice(0, MAX_SCAN_PAGES);
  const paid = await modelOcr(
    wanted.map(({ shot }) => shot),
    analysisId,
    label,
    onProgress
  );
  const texts = free.slice();
  wanted.forEach(({ i }, k) => {
    if (paid[k]?.trim()) texts[i] = paid[k]!;
  });
  const note = `${label}: 스캔본 ${shots.length}쪽 가운데 시험 지문이 보인 ${wanted.length}쪽만 유료로 읽었어요.`;
  return { text: texts.filter(Boolean).join("\n"), paidPages: wanted.length, note };
}

export async function readUploadedMaterial(
  file: File,
  analysisId: string,
  /** 읽는 동안 어디까지 왔는지 알린다 */
  onProgress?: ReadProgress,
  /** 시험지 문항들의 지문 앞부분 — 스캔본에서 유료로 읽을 쪽을 고르는 데 쓴다 */
  excerpts: string[] = []
): Promise<UploadRead> {
  const name = file.name;
  if (/\.(txt|md|csv)$/i.test(name)) {
    return { name, text: await file.text(), scanned: false };
  }

  const isPdf = /\.pdf$/i.test(name) || file.type === "application/pdf";
  const isImage = file.type.startsWith("image/");
  if (!isPdf && !isImage) throw new Error(`${name}: PDF·사진·글 파일만 올릴 수 있어요.`);

  let pages = 1;
  if (isPdf) {
    const got = await pdfText(file);
    pages = got.pages;
    const chars = got.text.replace(/\s/g, "").length;
    if (chars >= TEXT_ENOUGH && chars / Math.max(1, pages) >= TEXT_PER_PAGE_ENOUGH) {
      return { name, text: got.text, scanned: false };
    }
  }

  // 전에 읽은 파일이면 그대로 쓴다
  const hash = await fileHash(file);
  if (hash) {
    onProgress?.(`${name} 전에 읽은 적이 있는지 확인 중`);
    const cached = await cachedRead(analysisId, hash);
    if (cached) {
      return { name, text: cached.text, scanned: true, note: `${name}은 전에 읽어 둔 글을 썼어요(읽기 값 없음).` };
    }
  }

  const shots: Shot[] = isPdf
    ? await pdfShots(file, MAX_FREE_PAGES, onProgress)
    : [{ n: 1, dataUrl: await readDataUrl(file) }];
  const read = await shotsToText(shots, analysisId, name, excerpts, onProgress);
  if (hash && read.text.trim().length >= 40) {
    await storeRead(analysisId, hash, name, pages, read.text);
  }
  return { name, text: read.text, scanned: true, ...(read.note ? { note: read.note } : {}) };
}

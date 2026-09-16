/**
 * 그림 선택지 문항(구입할 물건·묘사·날씨 등)의 선택지 그림을 한 장으로 합친다.
 *
 * 예전에는 선택지마다 1장씩 5장을 그려서 문항 하나에 그림값이 다섯 배로 들었다.
 * 실제 시·도교육청 문제지도 ①~⑤가 한 그림판 안에 나란히 인쇄되므로,
 * 5칸짜리 그림 한 장이 학생·선생님이 보는 결과와 같다.
 * 그린 뒤 비전 검수로 칸이 다섯 개인지·라벨이 하나씩인지·칸마다 설명대로 그려졌는지 본다.
 */
import {
  buildVerifyBody,
  flattenPngOnWhite,
  generateImagePngBytes,
} from "@/lib/listening/generate-choice-images";

const CIRCLED = ["①", "②", "③", "④", "⑤"] as const;

export type ChoiceGridCheck = {
  ok: boolean;
  problems: string[];
  /** 칸마다 실제로 그려진 것 */
  panels: Array<{ label: string; count: number; drawn: string; matchesPlan: boolean }>;
  note: string;
};



/** 3×2 칸 (마지막 칸은 비움) */
export const GRID_COLS = 3;
export const GRID_ROWS = 2;

/**
 * 선택지 5개 → 한 장 프롬프트.
 * 번호(①~⑤)는 그림 모델에게 맡기지 않는다 — medium 품질에서는 번호가 아예 그려지지 않았다.
 * 모델은 칸 안의 그림만 그리고, 칸 선과 번호는 우리가 캔버스로 정확한 자리에 얹는다.
 */
export function buildChoiceGridPrompt(prompts: string[], extraNote?: string): string {
  const list = prompts
    .slice(0, 5)
    .map((p, i) => `Cell ${i + 1} — ${String(p ?? "").trim()}`)
    .join("\n");
  return `Korean middle-school English listening exam picture-choice sheet.

ONE square image on a plain pure-white background.
Imagine the square split into a 3 x 2 grid of six equal areas (each one third wide, one half tall):
area 1 = top-left, area 2 = top-middle, area 3 = top-right, area 4 = bottom-left, area 5 = bottom-middle,
area 6 = bottom-right and stays completely empty white.

Draw one picture centred in each of areas 1-5, filling about two thirds of its area:
${list}

Rules:
- Draw NO grid, NO frame, NO border, NO dividing line and NO box of any kind. The six areas are imaginary and separated only by white space.
- Draw NO numbers, NO circled digits and NO captions anywhere. The only letters allowed are words explicitly requested above (spell those correctly).
- Flat-color textbook illustration, clean thick black outlines, no photorealism, no 3D, no shadows, no gradients, no watermark.
- Each picture is ONE clear object or scene, fully inside its own area, never touching another area.
- The five pictures must be clearly DIFFERENT from each other — the differing detail (pattern, shape, count, printed word, position) must stay obvious when printed small.
- No answer marks, ticks or highlights.
${extraNote ? "\n" + extraNote : ""}
VERIFY: five pictures placed top-left / top-middle / top-right / bottom-left / bottom-middle, bottom-right empty, no lines, no numbers.`.slice(0, 3800);
}

/**
 * 칸 선과 번호(①~⑤)를 그림 위에 얹는다.
 * 실제 문제지처럼 칸마다 왼쪽 위에 동그라미 숫자를 놓고, 칸 사이에 얇은 선을 긋는다.
 */
export async function overlayGridLabels(bytes: Buffer): Promise<Buffer> {
  const { createCanvas, loadImage } = await import("@napi-rs/canvas");
  const img = await loadImage(bytes);
  const w = img.width;
  const h = img.height;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0);

  const cw = w / GRID_COLS;
  const ch = h / GRID_ROWS;

  // 칸 선
  ctx.strokeStyle = "#222222";
  ctx.lineWidth = Math.max(2, Math.round(w / 400));
  for (let i = 0; i < 5; i++) {
    const col = i % GRID_COLS;
    const row = Math.floor(i / GRID_COLS);
    ctx.strokeRect(col * cw, row * ch, cw, ch);
  }

  // 동그라미 숫자 — 글꼴에 ①이 없을 수 있어 원 + 숫자를 직접 그린다
  const r = Math.max(14, Math.round(cw * 0.075));
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `bold ${Math.round(r * 1.25)}px sans-serif`;
  for (let i = 0; i < 5; i++) {
    const col = i % GRID_COLS;
    const row = Math.floor(i / GRID_COLS);
    const cx = col * cw + r * 1.6;
    const cy = row * ch + r * 1.6;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = Math.max(2, Math.round(r / 8));
    ctx.stroke();
    ctx.fillStyle = "#111111";
    ctx.fillText(String(i + 1), cx, cy + r * 0.05);
  }

  return canvas.toBuffer("image/png");
}

/** 그림판 검수 (칸 수·라벨 중복·칸별 내용) */
export async function verifyChoiceGrid(
  png: Buffer,
  prompts: string[]
): Promise<ChoiceGridCheck> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, problems: ["OPENAI_API_KEY 없음 — 검수 불가"], panels: [], note: "" };
  }
  const models = [
    process.env.OPENAI_MODEL_LISTENING_IMAGE_PLAN?.trim(),
    "gpt-5.5",
    "gpt-4.1",
    "gpt-4o",
  ].filter(Boolean) as string[];

  const dataUrl = `data:image/png;base64,${png.toString("base64")}`;
  const plan = prompts
    .slice(0, 5)
    .map((p, i) => `${CIRCLED[i]}: ${String(p ?? "").trim()}`)
    .join("\n");
  let lastErr = "verify failed";

  for (const model of models) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(
          buildVerifyBody(model, [
            {
              role: "system",
              content:
                'You strictly check a Korean listening-exam picture-choice sheet. The image is a 3 x 2 grid of cells; cells 1-3 are the top row (left, middle, right), cells 4-5 are the bottom row (left, middle) and the bottom-right cell is empty. Each drawn cell carries a small circled number 1-5 at its top-left. Read the image literally (exact objects, patterns, counts, printed words, positions). JSON only: {"panels":[{"label":"1","count":1,"drawn":"what is actually drawn in this cell","matches_plan":true}, ...for cells 1,2,3,4,5],"panelCount":5,"panelsDistinct":true,"cleanBackground":true,"misspelledWords":[],"note":"..."}. count = 1 when this cell contains one picture, 0 when the cell is empty, 2+ when it holds several unrelated pictures. matches_plan=false when the cell contradicts its intended description. panelsDistinct=false when two cells look the same. cleanBackground=false if the background is not plain white (dark vignette, glow, blur).',
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Intended panels:\n${plan}\n\nCheck each panel: is the circled number there exactly once, and does the drawing match its description?`,
                },
                { type: "image_url", image_url: { url: dataUrl } },
              ],
            },
          ])
        ),
      });
      const text = await res.text();
      if (!res.ok) {
        lastErr = `vision ${model} HTTP ${res.status}: ${text.slice(0, 200)}`;
        continue;
      }
      const json = JSON.parse(text) as { choices?: Array<{ message?: { content?: string } }> };
      const parsed = JSON.parse(String(json.choices?.[0]?.message?.content ?? "{}")) as {
        panels?: Array<{ label?: string; count?: number; drawn?: string; matches_plan?: boolean }>;
        panelCount?: number;
        panelsDistinct?: boolean;
        cleanBackground?: boolean;
        misspelledWords?: string[];
        note?: string;
      };
      const panels = CIRCLED.map((label, idx) => {
        const num = String(idx + 1);
        const hit = (parsed.panels ?? []).find((x) => {
          const l = String(x.label ?? "").trim();
          return l === num || l === label;
        });
        return {
          label,
          count: Number(hit?.count ?? 0),
          drawn: String(hit?.drawn ?? ""),
          matchesPlan: hit?.matches_plan !== false,
        };
      });
      const problems: string[] = [];
      for (const p of panels) {
        if (p.count === 0) problems.push(`${p.label} 칸이 비어 있음`);
        else if (p.count > 1) problems.push(`${p.label} 칸에 그림이 ${p.count}개`);
        else if (!p.matchesPlan) problems.push(`${p.label} 칸이 설명과 다름`);
      }
      if (Number(parsed.panelCount ?? 5) !== 5) problems.push(`칸이 ${parsed.panelCount}개`);
      if (parsed.panelsDistinct === false) problems.push("칸끼리 구분이 안 됨");
      if (parsed.cleanBackground === false) problems.push("배경이 깨끗하지 않음");
      const misspelled = (parsed.misspelledWords ?? []).map(String).filter((w) => w.trim());
      if (misspelled.length) problems.push(`철자 오류: ${misspelled.join(", ")}`);
      return { ok: problems.length === 0, problems, panels, note: String(parsed.note ?? "") };
    } catch (e) {
      lastErr = e instanceof Error ? e.message : String(e);
    }
  }
  return { ok: false, problems: [`검수 실패: ${lastErr}`], panels: [], note: lastErr };
}

/** 그림판을 그리고 검수한다 (저장하지 않음). 통과한 그림이 없으면 bytes = null */
export async function drawCheckedChoiceGrid(opts: {
  prompts: string[];
  maxRetries?: number;
  onAttempt?: (info: { attempt: number; check: ChoiceGridCheck; bytes: Buffer }) => void;
}): Promise<{ bytes: Buffer | null; check: ChoiceGridCheck | null; attempts: number }> {
  const prompts = (opts.prompts ?? []).map((p) => String(p ?? "").trim()).filter(Boolean);
  if (prompts.length !== 5) {
    throw new Error("그림 선택지 5개가 있어야 한 장으로 합칠 수 있습니다.");
  }
  let prompt = buildChoiceGridPrompt(prompts);
  let last: ChoiceGridCheck | null = null;
  const max = opts.maxRetries ?? 1;
  for (let attempt = 0; attempt <= max; attempt++) {
    const drawn = await flattenPngOnWhite(await generateImagePngBytes(prompt));
    const bytes = await overlayGridLabels(drawn);
    const check = await verifyChoiceGrid(bytes, prompts);
    last = check;
    opts.onAttempt?.({ attempt: attempt + 1, check, bytes });
    if (check.ok) return { bytes, check, attempts: attempt + 1 };
    prompt = buildChoiceGridPrompt(
      prompts,
      `PREVIOUS DRAWING FAILED QA — ${check.problems.join(", ")}. ${check.note}
Fix exactly those problems: a 3 x 2 grid, one picture centred in each of cells 1-5, bottom-right cell empty, each cell drawn as described.`
    );
  }
  return { bytes: null, check: last, attempts: max + 1 };
}

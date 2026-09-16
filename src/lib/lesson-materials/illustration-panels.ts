/**
 * 컷 그림 요청. 여섯 컷을 한꺼번에 보내고, 실패한 컷은 null로 돌려준다.
 *
 * 한 장짜리 큰 그림을 시키는 대신 컷마다 따로 시키므로 기다리는 시간은 가장 늦은 한 컷만큼이다.
 * 컷이 따로 그려지면 인물이 달라질 수 있어, 장면 설명과 함께 등장인물 설명(cast)을 모든 컷에 붙인다.
 */
import { BEAT_COUNT, type IllustrationBeat } from "@/lib/lesson-materials/illustration-beats";

/**
 * 컷 그림 크기·품질. 3:2 가로 low가 A4 폭 60mm 칸에 쓰기 충분하면서 가장 빠르다
 * (2026-09-16 실측, gpt-image-2: 1536×1024 low 158토큰·13초, medium 1372토큰·35초).
 */
export const PANEL_SIZE = "1536x1024";
export const PANEL_QUALITY = "low";
/** 출력 토큰 단가 $40/1M, 1달러 1,400원 — 원가 계산용 */
export const PANEL_OUTPUT_TOKENS = 158;

function imageModelCandidates(): string[] {
  const dedicated = process.env.OPENAI_MODEL_LESSON_ILLUSTRATION?.trim();
  const out: string[] = [];
  const push = (m?: string) => {
    if (m && !out.includes(m)) out.push(m);
  };
  push(dedicated);
  push("gpt-image-2");
  push("gpt-image-1.5");
  push("gpt-image-1");
  return out;
}

const STYLE_RULES =
  "Bright flat-colour educational manhwa illustration, clean confident line art, soft friendly mood, simple uncluttered background, plain white backdrop, no photorealism. " +
  "The drawing must contain NO text of any kind: no letters, no words, no numbers, no signs, no labels, no speech bubbles, no captions, no watermark. Show the meaning through faces, gestures and objects only.";

export function buildPanelPrompt(beat: IllustrationBeat, cast: string, index: number): string {
  const castLine = cast
    ? `Recurring figures (draw them the same way in every panel): ${cast}\n`
    : "";
  return `One single illustration, panel ${index + 1} of ${BEAT_COUNT} in a series about one reading passage.

Scene: ${beat.draw}

${castLine}${STYLE_RULES}`.slice(0, 2400);
}

/** 컷 한 장이 이보다 오래 걸리면 그 컷은 포기한다 — 나머지 컷으로 판을 만든다 */
const PANEL_TIMEOUT_MS = 55_000;

/** 컷 한 장. 실패하면 null을 돌려주고 판에서 빠진다. */
async function generatePanel(
  prompt: string,
  deadlineAt: number,
  apiKey: string
): Promise<Buffer | null> {
  let lastErr = "";
  for (const model of imageModelCandidates()) {
    const remaining = deadlineAt - Date.now();
    if (remaining <= 5_000) break;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Math.min(PANEL_TIMEOUT_MS, remaining));
    try {
      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, prompt, n: 1, size: PANEL_SIZE, quality: PANEL_QUALITY }),
        signal: controller.signal,
      });
      const text = await res.text();
      if (!res.ok) {
        lastErr = `${model} HTTP ${res.status}`;
        // 분당 장수 제한(429)은 다음 모델로 옮겨도 같은 제한에 걸린다
        if (res.status === 429) break;
        continue;
      }
      const json = JSON.parse(text) as { data?: Array<{ b64_json?: string; url?: string }> };
      const item = json.data?.[0];
      if (item?.b64_json) return Buffer.from(item.b64_json, "base64");
      if (item?.url) {
        const imgRes = await fetch(item.url);
        if (imgRes.ok) return Buffer.from(await imgRes.arrayBuffer());
      }
      lastErr = `${model} 이미지 없음`;
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") break;
      lastErr = e instanceof Error ? e.message : String(e);
    } finally {
      clearTimeout(timer);
    }
  }
  if (lastErr) console.warn(`[illustration] 컷 실패: ${lastErr}`);
  return null;
}

/** 여섯 컷을 한꺼번에 요청한다 */
export async function generatePanels(input: {
  beats: IllustrationBeat[];
  cast: string;
  deadlineAt: number;
  apiKey: string;
}): Promise<Array<Buffer | null>> {
  return Promise.all(
    input.beats.map((beat, i) =>
      generatePanel(buildPanelPrompt(beat, input.cast, i), input.deadlineAt, input.apiKey)
    )
  );
}

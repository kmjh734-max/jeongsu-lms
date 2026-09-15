import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "listening-images";

function imageModelCandidates(): string[] {
  const dedicated = process.env.OPENAI_MODEL_LISTENING_IMAGE?.trim();
  const out: string[] = [];
  const push = (m?: string) => {
    if (m && !out.includes(m)) out.push(m);
  };
  // gpt-image-2 renders Hangul speech bubbles reliably
  push(dedicated);
  push("gpt-image-2");
  push("gpt-image-1.5");
  push("gpt-image-1");
  return out;
}

function normalizeCaptions(captions?: string[]): string[] {
  const fallback = [
    "이게 정말 맞을까?",
    "잠깐, 문제가 보이네",
    "다시 생각해 보자",
    "이제 이해가 됐어!",
  ];
  return [0, 1, 2, 3].map((i) => {
    const raw = String(captions?.[i] ?? "").trim();
    return raw || fallback[i]!;
  });
}

/** Ask the image model to draw Hangul bubbles (gpt-image-2). */
function buildComicImagePrompt(
  sourcePrompt: string,
  passageHint: string,
  captions: string[]
): string {
  const body = (sourcePrompt.trim() || passageHint.trim()).slice(0, 1200);
  return `Create ONE educational 2x2 four-panel manhwa comic as a single continuous short story.

Layout: panel 1 top-left, panel 2 top-right, panel 3 bottom-left, panel 4 bottom-right. Clear panel borders.

CRITICAL TEXT — each panel MUST have a white speech bubble with CLEAR, readable Korean Hangul.
Use EXACTLY these quoted strings (do not translate to English, do not garble characters):
Panel 1 bubble: "${captions[0]}"
Panel 2 bubble: "${captions[1]}"
Panel 3 bubble: "${captions[2]}"
Panel 4 bubble: "${captions[3]}"

Same characters in every panel. Bright clean colorful educational manhwa, soft friendly mood, flat colors, clean line art, no photorealism, no watermark, no extra English labels.

Story / scene idea (illustrate, do not print this paragraph as text):
${body}`.slice(0, 3000);
}

/** 한 모델에 주는 최대 시간 */
const MODEL_TIMEOUT_MS = 100_000;
/**
 * 남은 시간이 이보다 적으면 다음 모델을 시작하지 않는다. 이미지 한 장은 보통 30~60초 걸리고,
 * 끊은 요청도 OpenAI가 끝까지 만든 값을 받으므로 못 끝낼 요청은 아예 보내지 않는다.
 */
const MIN_MODEL_MS = 60_000;
/** 기본 마감: 경로 상한(120초)에서 저장·차감할 자리를 뺀 시간 */
const DEFAULT_BUDGET_MS = 105_000;

async function generateImagePngBytes(prompt: string, deadlineAt: number): Promise<Buffer> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY가 설정되어 있지 않습니다.");

  let lastErr = "이미지 생성 실패";
  let attempted = 0;
  for (const model of imageModelCandidates()) {
    const remaining = deadlineAt - Date.now();
    // 첫 모델은 남은 시간을 다 쓰고, 다음 모델은 끝낼 시간이 있을 때만 시작한다
    if (attempted > 0 && remaining < MIN_MODEL_MS) break;
    if (remaining <= 5_000) break;
    attempted++;
    const body: Record<string, unknown> = {
      model,
      prompt,
      n: 1,
      size: "1024x1024",
      // medium is much faster on Vercel time limits; still sharp enough for classroom use
      quality: "medium",
    };

    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(),
      Math.min(MODEL_TIMEOUT_MS, remaining)
    );
    let res: Response;
    try {
      res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (e) {
      clearTimeout(timer);
      if (e instanceof Error && e.name === "AbortError") {
        // 시간이 다 된 뒤라 다음 모델도 끝내지 못한다(남은 시간 검사가 막는다)
        lastErr = "삽화를 만드는 데 시간이 너무 오래 걸렸습니다. 잠시 뒤 다시 시도해 주세요.";
        continue;
      }
      lastErr = e instanceof Error ? e.message : `이미지 생성 실패 (${model})`;
      continue;
    }
    clearTimeout(timer);

    const text = await res.text();
    if (!res.ok) {
      lastErr = `이미지 생성 실패 (${model}, HTTP ${res.status}): ${text.slice(0, 180)}`;
      continue;
    }

    let json: { data?: Array<{ b64_json?: string; url?: string }> };
    try {
      json = JSON.parse(text) as typeof json;
    } catch {
      lastErr = `이미지 응답 파싱 실패 (${model})`;
      continue;
    }

    const item = json.data?.[0];
    if (item?.b64_json) return Buffer.from(item.b64_json, "base64");
    if (item?.url) {
      const imgRes = await fetch(item.url);
      if (!imgRes.ok) {
        lastErr = `이미지 다운로드 실패 (HTTP ${imgRes.status})`;
        continue;
      }
      return Buffer.from(await imgRes.arrayBuffer());
    }
    lastErr = `이미지 데이터가 없습니다 (${model})`;
  }
  throw new Error(lastErr);
}

export async function generateLessonMaterialComicIllustration(input: {
  academyId: string;
  illustrationPrompt: string;
  passageHint?: string;
  captions?: string[];
  /** 이 시각(ms)까지 끝내야 한다. 없으면 지금부터 DEFAULT_BUDGET_MS. */
  deadlineAt?: number;
  /** 그림이 실제로 나왔을 때(저장 전) 한 번 부른다 — 여기서 차감한다 */
  onImageProduced?: () => Promise<void>;
}): Promise<{ url: string; prompt: string }> {
  const captions = normalizeCaptions(input.captions);
  const prompt = buildComicImagePrompt(
    input.illustrationPrompt,
    input.passageHint ?? "",
    captions
  );
  const bytes = await generateImagePngBytes(
    prompt,
    input.deadlineAt ?? Date.now() + DEFAULT_BUDGET_MS
  );
  // 그림은 이미 만들어졌다(값이 나갔다). 저장이 실패해도 차감은 한다.
  await input.onImageProduced?.();

  const admin = createAdminClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL이 없습니다.");

  const storagePath = `lesson-materials/${input.academyId}/${crypto.randomUUID()}.png`;
  let { error } = await admin.storage.from(BUCKET).upload(storagePath, bytes, {
    contentType: "image/png",
    upsert: true,
  });
  if (error) {
    // 만든 그림을 버리지 않게 저장을 한 번 더 해 본다
    ({ error } = await admin.storage.from(BUCKET).upload(storagePath, bytes, {
      contentType: "image/png",
      upsert: true,
    }));
  }
  if (error) throw new Error(`삽화 저장 실패: ${error.message}`);

  const base = supabaseUrl.replace(/\/$/, "");
  const url = `${base}/storage/v1/object/public/${BUCKET}/${storagePath}?v=${Date.now()}`;
  return { url, prompt };
}

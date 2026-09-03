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

async function generateImagePngBytes(prompt: string): Promise<Buffer> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY가 설정되어 있지 않습니다.");

  let lastErr = "이미지 생성 실패";
  for (const model of imageModelCandidates()) {
    const body: Record<string, unknown> = {
      model,
      prompt,
      n: 1,
      size: "1024x1024",
      // medium is much faster on Vercel time limits; still sharp enough for classroom use
      quality: "medium",
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 90_000);
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
        lastErr = `이미지 생성 시간 초과 (${model})`;
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
}): Promise<{ url: string; prompt: string }> {
  const captions = normalizeCaptions(input.captions);
  const prompt = buildComicImagePrompt(
    input.illustrationPrompt,
    input.passageHint ?? "",
    captions
  );
  const bytes = await generateImagePngBytes(prompt);

  const admin = createAdminClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL이 없습니다.");

  const storagePath = `lesson-materials/${input.academyId}/${crypto.randomUUID()}.png`;
  const { error } = await admin.storage.from(BUCKET).upload(storagePath, bytes, {
    contentType: "image/png",
    upsert: true,
  });
  if (error) throw new Error(`삽화 저장 실패: ${error.message}`);

  const base = supabaseUrl.replace(/\/$/, "");
  const url = `${base}/storage/v1/object/public/${BUCKET}/${storagePath}?v=${Date.now()}`;
  return { url, prompt };
}

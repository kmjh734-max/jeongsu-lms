import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "listening-images";

function imageModelCandidates(): string[] {
  const dedicated = process.env.OPENAI_MODEL_LISTENING_IMAGE?.trim();
  const out: string[] = [];
  const push = (m?: string) => {
    if (m && !out.includes(m)) out.push(m);
  };
  push(dedicated);
  push("gpt-image-1.5");
  push("gpt-image-1");
  push("dall-e-3");
  return out;
}

function buildComicImagePrompt(sourcePrompt: string, passageHint: string): string {
  const body = sourcePrompt.trim() || passageHint.trim();
  return `Create ONE educational 2x2 four-panel manhwa illustration (single image).

CRITICAL TEXT RULE:
- Draw ZERO written language. No Korean Hangul, no Chinese, no Japanese, no English letters, no numbers as words.
- Speech bubbles must be EMPTY white ovals with a tail. Do not put glyphs inside bubbles.
- Icons, diagrams, arrows, and facial expressions only. Labels as pictures not letters.

Layout: panel 1 top-left, 2 top-right, 3 bottom-left, 4 bottom-right. Thick black borders.

Style: bright clean colorful educational manhwa, flat colors, clean line art, no photorealism, no watermark.

Characters consistent (boy, girl, teacher/scientist).

Narrative in pictures only:
1) misconception / overconfidence
2) explanation with icons
3) conflict or correction
4) correct conclusion with teamwork icons

Scene notes (for drawing, do not write these words in the picture):
${body}`.slice(0, 3200);
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
    };
    if (model.startsWith("dall-e")) {
      body.response_format = "b64_json";
      body.quality = "hd";
      body.style = "vivid";
    } else {
      body.quality = "high";
    }

    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) {
      lastErr = `이미지 생성 실패 (${model}, HTTP ${res.status})`;
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
}): Promise<{ url: string; prompt: string }> {
  const prompt = buildComicImagePrompt(
    input.illustrationPrompt,
    input.passageHint ?? ""
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

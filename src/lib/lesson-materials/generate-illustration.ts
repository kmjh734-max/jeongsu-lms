import { createAdminClient } from "@/lib/supabase/admin";
import { composeComicCaptionsOnImage } from "@/lib/lesson-materials/compose-comic-captions";

const BUCKET = "listening-images";

function imageModelCandidates(): string[] {
  const dedicated = process.env.OPENAI_MODEL_LISTENING_IMAGE?.trim();
  const out: string[] = [];
  const push = (m?: string) => {
    if (m && !out.includes(m)) out.push(m);
  };
  // Prefer models with better multilingual / comic text when available
  push(dedicated);
  push("gpt-image-2");
  push("gpt-image-1.5");
  push("gpt-image-1");
  push("dall-e-3");
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

/** Art only — Hangul is burned in afterward so it never breaks. */
function buildComicImagePrompt(
  sourcePrompt: string,
  passageHint: string,
  captions: string[]
): string {
  const body = sourcePrompt.trim() || passageHint.trim();
  return `Create ONE educational 2x2 four-panel manhwa illustration as a single continuous short story.

CRITICAL — TEXT AND BUBBLES:
- Do NOT draw any letters, Hangul, English words, numbers, logos, signs, UI text, or speech/thought bubbles.
- Leave the UPPER ~20% of each panel clear (sky / wall / blank space) for bubbles to be added later.
- Empty bubbles are forbidden.

Layout: panel 1 top-left → 2 top-right → 3 bottom-left → 4 bottom-right. Clear panel borders.

Storytelling (smooth flow, same characters in every panel):
1) ${captions[0]} — show the situation / assumption
2) ${captions[1]} — show the hidden problem
3) ${captions[2]} — characters struggle / realize
4) ${captions[3]} — warm resolution / understanding

Style: bright clean colorful educational manhwa, soft friendly mood, flat colors, clean line art, no photorealism, no watermark.

Scene to illustrate (do not write these words in the picture):
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
  captions?: string[];
}): Promise<{ url: string; prompt: string }> {
  const captions = normalizeCaptions(input.captions);
  const prompt = buildComicImagePrompt(
    input.illustrationPrompt,
    input.passageHint ?? "",
    captions
  );
  let bytes = await generateImagePngBytes(prompt);

  // Always burn Hangul with sharp+SVG (Noto). Never rely on the image model for Korean.
  try {
    bytes = await composeComicCaptionsOnImage(bytes, captions);
  } catch (e) {
    throw new Error(
      e instanceof Error
        ? `한글 말풍선 합성 실패: ${e.message}`
        : "한글 말풍선 합성 실패"
    );
  }

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

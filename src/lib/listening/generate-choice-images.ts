/**
 * 듣기 그림 문항 — OpenAI Images → Supabase storage
 * high1 4번: 합성 장면 1장 / middle: 선택지별 최대 5장
 */
import { createAdminClient } from "@/lib/supabase/admin";

export const LISTENING_IMAGES_BUCKET = "listening-images";

const STYLE_PREFIX = `Korean high school English listening exam worksheet illustration.
Clean simple black-and-white line drawing (textbook / CSAT listening style), high contrast, no photorealism, no shadows, no 3D, no watermark.
Clear circled number labels ① ② ③ ④ ⑤ on distinct visual elements so students can choose which label mismatches the dialogue.
White background. Educational diagram look.

Scene to draw:
`;

function imageModelCandidates(): string[] {
  const dedicated = process.env.OPENAI_MODEL_LISTENING_IMAGE?.trim();
  const out: string[] = [];
  const push = (m?: string) => {
    if (m && !out.includes(m)) out.push(m);
  };
  push(dedicated);
  push("gpt-image-1");
  push("dall-e-3");
  return out;
}

export function choiceImageStoragePath(
  setId: string,
  questionId: string,
  index: number
): string {
  return `listening/${setId}/${questionId}/choice-${index + 1}.png`;
}

export function publicChoiceImageUrl(
  supabaseUrl: string,
  storagePath: string
): string {
  const base = supabaseUrl.replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${LISTENING_IMAGES_BUCKET}/${storagePath}`;
}

function buildImagePrompt(scenePrompt: string): string {
  const body = String(scenePrompt ?? "").trim();
  if (!body) {
    throw new Error("choice_image_prompts가 비어 있습니다.");
  }
  return `${STYLE_PREFIX}${body}`.slice(0, 3500);
}

async function generateImagePngBytes(prompt: string): Promise<Buffer> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY가 없습니다.");

  let lastErr = "이미지 생성 실패";
  for (const model of imageModelCandidates()) {
    const body: Record<string, unknown> = {
      model,
      prompt,
      n: 1,
      size: "1024x1024",
    };
    // gpt-image-* returns b64 by default; dall-e-3 needs explicit format
    if (model.startsWith("dall-e")) {
      body.response_format = "b64_json";
      body.quality = "standard";
    } else {
      body.quality = "medium";
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
      lastErr = `Images API ${model} HTTP ${res.status}: ${text.slice(0, 300)}`;
      continue;
    }
    let json: {
      data?: Array<{ b64_json?: string; url?: string }>;
    };
    try {
      json = JSON.parse(text) as typeof json;
    } catch {
      lastErr = `Images API ${model}: JSON 파싱 실패`;
      continue;
    }
    const item = json.data?.[0];
    if (item?.b64_json) {
      return Buffer.from(item.b64_json, "base64");
    }
    if (item?.url) {
      const imgRes = await fetch(item.url);
      if (!imgRes.ok) {
        lastErr = `이미지 URL 다운로드 실패 HTTP ${imgRes.status}`;
        continue;
      }
      return Buffer.from(await imgRes.arrayBuffer());
    }
    lastErr = `Images API ${model}: data 없음`;
  }
  throw new Error(lastErr);
}

async function uploadPng(
  admin: ReturnType<typeof createAdminClient>,
  storagePath: string,
  bytes: Buffer
): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL이 없습니다.");

  const { error } = await admin.storage
    .from(LISTENING_IMAGES_BUCKET)
    .upload(storagePath, bytes, {
      contentType: "image/png",
      upsert: true,
    });
  if (error) {
    throw new Error(`storage upload 실패: ${error.message}`);
  }
  return publicChoiceImageUrl(supabaseUrl, storagePath);
}

/**
 * 문항의 choice_image_prompts로 이미지를 생성·업로드하고 choice_image_urls를 저장한다.
 */
export async function generateAndSaveChoiceImages(opts: {
  setId: string;
  questionId: string;
  prompts: string[];
  /** 이미 URL이 있으면 스킵 (기본 true) */
  skipIfPresent?: boolean;
  force?: boolean;
}): Promise<{ urls: string[]; generated: number; skipped: boolean }> {
  const admin = createAdminClient();
  const prompts = (opts.prompts ?? [])
    .map((p) => String(p ?? "").trim())
    .filter(Boolean);
  if (prompts.length === 0) {
    throw new Error("생성할 그림 프롬프트가 없습니다.");
  }

  if (!opts.force && opts.skipIfPresent !== false) {
    const { data: row } = await admin
      .from("listening_questions")
      .select("choice_image_urls")
      .eq("id", opts.questionId)
      .maybeSingle();
    const existing = Array.isArray(row?.choice_image_urls)
      ? (row!.choice_image_urls as string[]).filter((u) => String(u).trim())
      : [];
    if (existing.length >= prompts.length) {
      return { urls: existing.slice(0, prompts.length), generated: 0, skipped: true };
    }
  }

  const urls: string[] = [];
  let generated = 0;
  for (let i = 0; i < prompts.length; i++) {
    const prompt = buildImagePrompt(prompts[i]!);
    const bytes = await generateImagePngBytes(prompt);
    const path = choiceImageStoragePath(opts.setId, opts.questionId, i);
    const url = await uploadPng(admin, path, bytes);
    urls.push(url);
    generated += 1;
  }

  const { error } = await admin
    .from("listening_questions")
    .update({ choice_image_urls: urls })
    .eq("id", opts.questionId);
  if (error) {
    throw new Error(`choice_image_urls 저장 실패: ${error.message}`);
  }

  return { urls, generated, skipped: false };
}

/**
 * 템플릿 학원 문항의 이미지 URL을 같은 회차·같은 번호 문항에 복사
 */
export async function propagateChoiceImageUrls(opts: {
  sourceQuestionId: string;
  setTitle: string;
  orderIndex: number;
}): Promise<number> {
  const admin = createAdminClient();
  const { data: source } = await admin
    .from("listening_questions")
    .select("choice_image_urls")
    .eq("id", opts.sourceQuestionId)
    .maybeSingle();
  const urls = Array.isArray(source?.choice_image_urls)
    ? (source!.choice_image_urls as string[])
    : [];
  if (urls.length === 0) return 0;

  const { data: sets } = await admin
    .from("listening_sets")
    .select("id")
    .eq("title", opts.setTitle);
  const setIds = (sets ?? []).map((s) => s.id as string);
  if (setIds.length === 0) return 0;

  const { data: targets } = await admin
    .from("listening_questions")
    .select("id")
    .in("set_id", setIds)
    .eq("order_index", opts.orderIndex)
    .neq("id", opts.sourceQuestionId);

  let updated = 0;
  for (const t of targets ?? []) {
    const { error } = await admin
      .from("listening_questions")
      .update({ choice_image_urls: urls })
      .eq("id", t.id);
    if (!error) updated += 1;
  }
  return updated;
}

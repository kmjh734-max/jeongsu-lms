/**
 * 듣기 그림 문항 — OpenAI Images → Supabase storage
 * high1 4번: 합성 장면 1장 (그림 안에 ①–⑤ 전부) / middle: 선택지별 최대 5장
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { questionGeneratorChatJsonWithRetry } from "@/lib/question-generator/openai";
import {
  getListeningGeneratorModelCandidates,
} from "@/lib/listening/openai-listening-model";

export const LISTENING_IMAGES_BUCKET = "listening-images";

const COMPOSITE_LABEL_RULES = `CRITICAL — Korean CSAT / 학력평가 listening 「그림 불일치」 worksheet figure:
1) Draw ONE clean black-and-white line-art poster/scene on white background (textbook style, no photo, no 3D, no watermark).
2) The figure MUST contain ALL FIVE circled answer labels inside the drawing: ① ② ③ ④ ⑤.
3) Each of ① ② ③ ④ ⑤ must be a LARGE bold black circled number placed clearly next to a DISTINCT element (title, object, people, date, icon, etc.).
4) Do NOT omit any label. Before finishing, count: there must be exactly five circled numbers ①,②,③,④,⑤ all visible and readable.
5) Labels are the answer choices — students pick which numbered part mismatches the dialogue. Do not put a separate multiple-choice list outside the scene.
6) High contrast, simple shapes, exam-booklet look.`;

function imageModelCandidates(): string[] {
  const dedicated = process.env.OPENAI_MODEL_LISTENING_IMAGE?.trim();
  const out: string[] = [];
  const push = (m?: string) => {
    if (m && !out.includes(m)) out.push(m);
  };
  push(dedicated);
  // 상위 이미지 모델 우선
  push("gpt-image-1.5");
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

/**
 * 장면 설명을 ①–⑤ 체크리스트형 영문 프롬프트로 확장 (상위 chat 모델)
 */
async function enrichCompositeScenePrompt(scenePrompt: string): Promise<string> {
  const raw = String(scenePrompt ?? "").trim();
  if (!raw) throw new Error("choice_image_prompts가 비어 있습니다.");

  try {
    const preferred = [
      process.env.OPENAI_MODEL_LISTENING_IMAGE_PLAN?.trim(),
      process.env.OPENAI_MODEL_EXAM_PREP?.trim(),
      "gpt-5.5",
      "gpt-5.2",
      ...getListeningGeneratorModelCandidates(),
    ].filter(Boolean) as string[];

    const planned = (await questionGeneratorChatJsonWithRetry({
      system: `You plan Korean high-school listening exam figures (그림 불일치).
Return JSON only: {"imagePrompt":"..."}.
imagePrompt must be detailed English drawing instructions for ONE worksheet illustration.
Hard rules for imagePrompt:
- Require ALL five circled labels ① ② ③ ④ ⑤ inside the picture, each large and next to a different element.
- Explicitly list: "Label ①: ...", "Label ②: ...", "Label ③: ...", "Label ④: ...", "Label ⑤: ...".
- End with: "VERIFY: circled numbers ①,②,③,④,⑤ are all present and readable."
- Black-and-white line art, white background, CSAT listening booklet style.
- No photorealism, no extra choice list outside the scene.`,
      user: JSON.stringify({
        task: "enrich_high1_type4_figure_prompt",
        sourceScene: raw,
      }),
      temperature: 0.3,
      maxTokens: 2000,
      reasoningEffort: "high",
      preferredModels: preferred,
    })) as { imagePrompt?: string };

    const enriched = String(planned.imagePrompt ?? "").trim();
    if (enriched.length > 40) {
      return `${COMPOSITE_LABEL_RULES}\n\n${enriched}`.slice(0, 3200);
    }
  } catch {
    // fall through to deterministic wrap
  }

  return `${COMPOSITE_LABEL_RULES}

Scene details (must map each detail to one label):
${raw}

Mandatory label checklist — draw ALL of these as large circled numbers on the matching elements:
- ① must appear
- ② must appear
- ③ must appear
- ④ must appear
- ⑤ must appear
VERIFY before done: count five circled labels ①②③④⑤.`.slice(0, 3200);
}

function buildSimpleChoicePrompt(scenePrompt: string): string {
  const body = String(scenePrompt ?? "").trim();
  if (!body) throw new Error("choice_image_prompts가 비어 있습니다.");
  return `Korean middle-school English listening exam choice illustration.
Clean simple black-and-white line drawing, white background, textbook style, no text labels unless essential.
Subject: ${body}`.slice(0, 3000);
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
    if (model.startsWith("dall-e")) {
      body.response_format = "b64_json";
      body.quality = "hd";
      body.style = "natural";
    } else {
      // gpt-image-* : high quality for exam figures
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
  // cache-bust query so print/UI refresh shows new art
  const base = publicChoiceImageUrl(supabaseUrl, storagePath);
  return `${base}?v=${Date.now()}`;
}

async function verifyCompositeHasAllLabels(
  pngBytes: Buffer
): Promise<{ ok: boolean; missing: string[]; note: string }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return { ok: true, missing: [], note: "no api key skip verify" };

  const models = [
    process.env.OPENAI_MODEL_LISTENING_IMAGE_PLAN?.trim(),
    "gpt-5.5",
    "gpt-5.2",
    "gpt-4.1",
    "gpt-4o",
  ].filter(Boolean) as string[];

  const dataUrl = `data:image/png;base64,${pngBytes.toString("base64")}`;
  let lastErr = "verify failed";

  for (const model of models) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          temperature: 0,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                'You check Korean listening-exam figures. Reply JSON only: {"has1":bool,"has2":bool,"has3":bool,"has4":bool,"has5":bool,"missing":["②"],"note":"..."}. hasN true only if circled label ①/②/③/④/⑤ is clearly visible in the image.',
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Are circled labels ① ② ③ ④ ⑤ ALL present and readable?",
                },
                { type: "image_url", image_url: { url: dataUrl } },
              ],
            },
          ],
          max_tokens: 400,
        }),
      });
      const text = await res.text();
      if (!res.ok) {
        lastErr = `vision ${model} HTTP ${res.status}: ${text.slice(0, 200)}`;
        continue;
      }
      const json = JSON.parse(text) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = String(json.choices?.[0]?.message?.content ?? "");
      const parsed = JSON.parse(content) as {
        has1?: boolean;
        has2?: boolean;
        has3?: boolean;
        has4?: boolean;
        has5?: boolean;
        missing?: string[];
        note?: string;
      };
      const flags = [
        parsed.has1,
        parsed.has2,
        parsed.has3,
        parsed.has4,
        parsed.has5,
      ];
      const labels = ["①", "②", "③", "④", "⑤"];
      const missing =
        Array.isArray(parsed.missing) && parsed.missing.length
          ? parsed.missing.map(String)
          : labels.filter((_, i) => flags[i] !== true);
      return {
        ok: missing.length === 0,
        missing,
        note: String(parsed.note ?? ""),
      };
    } catch (e) {
      lastErr = e instanceof Error ? e.message : String(e);
    }
  }
  // 검수 실패 시 통과시키지 않고 재시도 유도
  return { ok: false, missing: ["①", "②", "③", "④", "⑤"], note: lastErr };
}

/**
 * 문항의 choice_image_prompts로 이미지를 생성·업로드하고 choice_image_urls를 저장한다.
 */
export async function generateAndSaveChoiceImages(opts: {
  setId: string;
  questionId: string;
  prompts: string[];
  /** high1 4번처럼 그림 안에 ①–⑤가 들어가는 합성 장면 */
  compositeLabeledFigure?: boolean;
  /** 이미 URL이 있으면 스킵 (기본 true) */
  skipIfPresent?: boolean;
  force?: boolean;
  /** 합성 장면 라벨 검수 재시도 (기본 2 = 총 3회) */
  maxLabelRetries?: number;
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

  const composite =
    opts.compositeLabeledFigure === true || prompts.length === 1;
  const maxRetries =
    composite && prompts.length === 1 ? (opts.maxLabelRetries ?? 2) : 0;

  const urls: string[] = [];
  let generated = 0;
  for (let i = 0; i < prompts.length; i++) {
    let bytes: Buffer | null = null;
    let attemptPrompt =
      composite && prompts.length === 1
        ? await enrichCompositeScenePrompt(prompts[i]!)
        : buildSimpleChoicePrompt(prompts[i]!);

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      bytes = await generateImagePngBytes(attemptPrompt);
      if (!(composite && prompts.length === 1)) break;

      const check = await verifyCompositeHasAllLabels(bytes);
      if (check.ok) break;
      if (attempt >= maxRetries) {
        console.warn(
          `[listening-image] labels incomplete after retries: missing=${check.missing.join(",")}`
        );
        break;
      }
      attemptPrompt = `${COMPOSITE_LABEL_RULES}

PREVIOUS DRAWING FAILED QA — missing labels: ${check.missing.join(", ") || "unknown"}.
${check.note ? `QA note: ${check.note}` : ""}

You MUST redraw so EVERY circled label ① ② ③ ④ ⑤ is large, bold, and clearly visible next to its element.
Especially force these missing ones back into the figure: ${check.missing.join(", ")}.

Original scene:
${prompts[i]}

Explicit checklist:
Label ①: first element from the scene (must show ①)
Label ②: second element (must show ②)
Label ③: third element (must show ③)
Label ④: fourth element (must show ④)
Label ⑤: fifth element (must show ⑤)
VERIFY: count five circled numbers.`.slice(0, 3200);
    }

    if (!bytes) throw new Error("이미지 바이트 없음");
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

/** 인쇄용: 보기가 ①–⑤ 번호뿐이면 목록을 숨기고 그림만 쓴다 */
export { shouldHideTextChoicesForFigure } from "@/lib/listening/figure-choice-display";

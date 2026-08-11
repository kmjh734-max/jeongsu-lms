/**
 * 듣기 그림 문항 — OpenAI Images → Supabase storage
 * high1 4번: 합성 장면 1장 (그림 안에 ①–⑤ 전부, 대본·색 정보 반영)
 * middle: 선택지별 최대 5장
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { questionGeneratorChatJsonWithRetry } from "@/lib/question-generator/openai";
import {
  getListeningGeneratorModelCandidates,
} from "@/lib/listening/openai-listening-model";

export const LISTENING_IMAGES_BUCKET = "listening-images";

export type CompositeFigureContext = {
  /** 듣기 대본 (영문) */
  scriptText?: string;
  /** 불일치 라벨 ①~⑤ */
  mismatchLabel?: string;
  /** 해설/단서 */
  explanation?: string;
  answerClue?: string;
};

const COMPOSITE_LABEL_RULES = `CRITICAL — Korean 학력평가 listening 「그림 불일치」 exam figure:
1) Draw ONE clean educational illustration (poster/scene) on white background. Flat vector / textbook style. No photorealism, no 3D, no watermark.
2) COLOR IS ALLOWED AND REQUIRED when the scene mentions different colors (e.g. bins of different colors). Use simple flat colors (red/blue/green/yellow) so differences are obvious. Do NOT make everything grayscale if color is part of the content.
3) The figure MUST contain ALL FIVE large circled labels inside the drawing: ① ② ③ ④ ⑤.
4) Each label sits next to a DISTINCT element. Count them — all five must be readable.
5) The picture shows what is ON the poster/scene (including the one mismatched detail). Students find which numbered part does NOT match the dialogue.
6) No separate multiple-choice list outside the scene.`;

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

/** choices/correct_answer → 그림 속 불일치 라벨 ①~⑤ */
export function resolveMismatchLabel(
  choices: string[] | null | undefined,
  correctAnswer: number | null | undefined
): string | null {
  const list = (choices ?? []).map((c) => String(c).trim());
  const idx = Number(correctAnswer);
  if (!Number.isFinite(idx) || idx < 1) return null;
  const fromChoice = list[idx - 1];
  if (fromChoice && /^[①②③④⑤]$/.test(fromChoice)) return fromChoice;
  const byIndex = ["①", "②", "③", "④", "⑤"][idx - 1];
  return byIndex ?? null;
}

/**
 * 장면 설명을 대본·불일치 정보까지 넣어 영문 드로잉 프롬프트로 확장
 */
async function enrichCompositeScenePrompt(
  scenePrompt: string,
  ctx?: CompositeFigureContext
): Promise<string> {
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
imagePrompt = detailed English drawing instructions for ONE worksheet illustration.

Hard rules:
- ALL five circled labels ① ② ③ ④ ⑤ must appear large inside the picture.
- Explicitly list Label ①…⑤ with what to draw at each.
- If dialogue mentions colors (different colors, colored objects), the drawing MUST use distinct flat colors — never all gray/identical.
- The picture must show the POSTER AS DRAWN, including the mismatched detail (the wrong label content). Other labels match the dialogue.
- If mismatchLabel is given, that label's drawn content is the wrong one (e.g. time says 4 p.m. while dialogue planned 3; or microphone instead of camera).
- Flat educational colors OK. No photorealism. No extra choice list outside the scene.
- End with: "VERIFY: ①②③④⑤ all present; color differences visible when required."`,
      user: JSON.stringify({
        task: "enrich_high1_type4_figure_prompt",
        sourceScene: raw,
        scriptText: ctx?.scriptText ?? null,
        mismatchLabel: ctx?.mismatchLabel ?? null,
        explanation: ctx?.explanation ?? null,
        answerClue: ctx?.answerClue ?? null,
      }),
      temperature: 0.25,
      maxTokens: 2500,
      reasoningEffort: "high",
      preferredModels: preferred,
    })) as { imagePrompt?: string };

    const enriched = String(planned.imagePrompt ?? "").trim();
    if (enriched.length > 40) {
      return `${COMPOSITE_LABEL_RULES}\n\n${enriched}`.slice(0, 3200);
    }
  } catch {
    // fall through
  }

  const mismatch = ctx?.mismatchLabel
    ? `\nMismatch label ${ctx.mismatchLabel}: draw the WRONG detail here (${ctx.answerClue || ctx.explanation || "as in answer clue"}).`
    : "";
  const scriptBit = ctx?.scriptText
    ? `\nDialogue (use for colors & details):\n${ctx.scriptText}`
    : "";

  return `${COMPOSITE_LABEL_RULES}

Scene:
${raw}
${scriptBit}
${mismatch}

Mandatory: Label ①,②,③,④,⑤ all large and visible.
If bins/objects have different colors in the dialogue, paint them clearly different flat colors (e.g. blue / yellow / green).
VERIFY: five labels + color differences when mentioned.`.slice(0, 3200);
}

function buildSimpleChoicePrompt(scenePrompt: string): string {
  const body = String(scenePrompt ?? "").trim();
  if (!body) throw new Error("choice_image_prompts가 비어 있습니다.");
  return `Korean middle-school English listening exam choice illustration.
Clean simple flat-color or line drawing, white background, textbook style.
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
                'Check Korean listening-exam figures. JSON only: {"has1":bool,"has2":bool,"has3":bool,"has4":bool,"has5":bool,"colorsDistinct":bool|null,"missing":["②"],"note":"..."}. hasN true only if circled ①–⑤ visible. colorsDistinct=true if multi-color objects are clearly different colors (not all gray/same).',
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Are circled labels ①②③④⑤ all present? If recycling bins or colored items appear, are their colors clearly different?",
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
        colorsDistinct?: boolean | null;
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
      const colorFail = parsed.colorsDistinct === false;
      return {
        ok: missing.length === 0 && !colorFail,
        missing: colorFail
          ? [...missing, "colors-not-distinct"]
          : missing,
        note: String(parsed.note ?? ""),
      };
    } catch (e) {
      lastErr = e instanceof Error ? e.message : String(e);
    }
  }
  return { ok: false, missing: ["①", "②", "③", "④", "⑤"], note: lastErr };
}

/**
 * 문항의 choice_image_prompts로 이미지를 생성·업로드하고 choice_image_urls를 저장한다.
 */
export async function generateAndSaveChoiceImages(opts: {
  setId: string;
  questionId: string;
  prompts: string[];
  compositeLabeledFigure?: boolean;
  figureContext?: CompositeFigureContext;
  skipIfPresent?: boolean;
  force?: boolean;
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
        ? await enrichCompositeScenePrompt(prompts[i]!, opts.figureContext)
        : buildSimpleChoicePrompt(prompts[i]!);

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      bytes = await generateImagePngBytes(attemptPrompt);
      if (!(composite && prompts.length === 1)) break;

      const check = await verifyCompositeHasAllLabels(bytes);
      if (check.ok) break;
      if (attempt >= maxRetries) {
        console.warn(
          `[listening-image] QA incomplete: ${check.missing.join(",")}`
        );
        break;
      }
      attemptPrompt = `${COMPOSITE_LABEL_RULES}

PREVIOUS DRAWING FAILED QA — issues: ${check.missing.join(", ") || "unknown"}.
${check.note ? `QA note: ${check.note}` : ""}

Redraw with ALL of ①②③④⑤ large and visible.
If colors were not distinct: paint recycling bins / colored objects in clearly DIFFERENT flat colors (blue, yellow, green — not the same gray).
Mismatch label ${opts.figureContext?.mismatchLabel ?? "(see scene)"} must show the WRONG detail from the answer.

Scene:
${prompts[i]}
Script:
${opts.figureContext?.scriptText ?? ""}
Clue: ${opts.figureContext?.answerClue ?? opts.figureContext?.explanation ?? ""}

VERIFY five labels + distinct colors when required.`.slice(0, 3200);
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

export { shouldHideTextChoicesForFigure } from "@/lib/listening/figure-choice-display";

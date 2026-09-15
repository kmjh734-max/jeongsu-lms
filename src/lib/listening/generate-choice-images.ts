/**
 * 듣기 그림 문항 — OpenAI Images → Supabase storage
 * high1 4번: 합성 장면 1장 (그림 안에 ①–⑤ 전부, 대본·색 정보 반영)
 * middle: 선택지별 최대 5장
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { questionGeneratorChatJsonWithRetry } from "@/lib/question-generator/openai";
import {
  getListeningGeneratorModelCandidates,
  isGpt5FamilyModel,
  listeningModelSupportsCustomTemperature,
} from "@/lib/listening/openai-listening-model";

/** 그림 검수(비전) 응답 상한 — GPT-5 계열은 추론 토큰도 여기서 차감되므로 넉넉히 */
const VERIFY_GPT5_MAX_COMPLETION_TOKENS = 2000;
const VERIFY_MAX_TOKENS = 400;

/**
 * 그림 검수 요청 본문. GPT-5 계열은 temperature(0)·max_tokens를 받지 않으므로
 * max_completion_tokens만 보내고 temperature는 생략한다.
 */
export function buildVerifyBody(
  model: string,
  messages: unknown[]
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model,
    response_format: { type: "json_object" },
    messages,
  };
  if (listeningModelSupportsCustomTemperature(model)) {
    body.temperature = 0;
  }
  if (isGpt5FamilyModel(model)) {
    body.max_completion_tokens = VERIFY_GPT5_MAX_COMPLETION_TOKENS;
    body.reasoning_effort = "low";
  } else {
    body.max_tokens = VERIFY_MAX_TOKENS;
  }
  return body;
}

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
1) Draw ONE clean educational illustration (poster/scene) on a plain pure-white background (no glow, vignette, gradient or dark edges). Flat vector / textbook style. No photorealism, no 3D, no watermark. Spell every word correctly.
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
  index: number,
  version?: string
): string {
  // 새로 그릴 때마다 다른 파일에 올린다 — 예전 그림을 덮어쓰지 않아야 되돌릴 수 있다
  const suffix = version ? `-${version}` : "";
  return `listening/${setId}/${questionId}/choice-${index + 1}${suffix}.png`;
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

/** 그림 속 라벨 하나에 무엇을 그릴지 (검수 때 실제 그림과 대조) */
export type FigureLabelSpec = {
  label: string;
  draw: string;
  /** 대화와 일치하게 그리는 라벨이면 true, 정답(불일치) 라벨이면 false */
  matchesDialogue: boolean;
};

const CIRCLED_LABELS = ["①", "②", "③", "④", "⑤"] as const;

function normalizeLabelSpecs(raw: unknown, mismatchLabel?: string): FigureLabelSpec[] {
  if (!Array.isArray(raw)) return [];
  const specs: FigureLabelSpec[] = [];
  for (const item of raw) {
    const o = (item ?? {}) as Record<string, unknown>;
    const label = String(o.label ?? "").trim();
    const draw = String(o.draw ?? o.content ?? "").trim();
    if (!CIRCLED_LABELS.includes(label as (typeof CIRCLED_LABELS)[number]) || !draw) continue;
    specs.push({
      label,
      draw,
      matchesDialogue: mismatchLabel ? label !== mismatchLabel : o.matches_dialogue !== false,
    });
  }
  const labels = new Set(specs.map((s) => s.label));
  return labels.size === 5 && specs.length === 5 ? specs : [];
}

/**
 * 장면 설명을 대본·불일치 정보까지 넣어 영문 드로잉 프롬프트로 확장.
 * 라벨별로 무엇을 그릴지(spec)도 받아 두어, 그린 뒤 라벨마다 대화와 맞는지 대조한다.
 */
async function enrichCompositeScenePrompt(
  scenePrompt: string,
  ctx?: CompositeFigureContext
): Promise<{ prompt: string; specs: FigureLabelSpec[] }> {
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
Return JSON only: {"labels":[{"label":"①","draw":"...","matches_dialogue":true}, ... five items ①..⑤],"imagePrompt":"..."}.
labels = what to draw next to each circled label, with exact text/numbers/counts/positions.
- Exactly ONE label (mismatchLabel when given) has matches_dialogue=false: draw it differently from the dialogue (e.g. dialogue says 3 p.m. → draw "4:00 P.M.").
- The other four labels must show exactly what the dialogue says. No two labels may show the same thing.
- Each label marks one distinct element; never reuse a label number.
imagePrompt = detailed English drawing instructions for ONE worksheet illustration.

Hard rules for imagePrompt:
- ALL five circled labels ① ② ③ ④ ⑤ must appear large inside the picture, each exactly once.
- Explicitly list Label ①…⑤ with what to draw at each (same as labels[].draw), including exact written text/numbers.
- If dialogue mentions colors (different colors, colored objects), the drawing MUST use distinct flat colors — never all gray/identical.
- The picture shows the POSTER AS DRAWN, including the mismatched detail. Other labels match the dialogue.
- Flat educational colors OK. No photorealism. No extra choice list outside the scene.
- End with: "VERIFY: ①②③④⑤ each appear exactly once; only the mismatch label differs from the dialogue."`,
      user: JSON.stringify({
        task: "enrich_high1_type4_figure_prompt",
        sourceScene: raw,
        scriptText: ctx?.scriptText ?? null,
        mismatchLabel: ctx?.mismatchLabel ?? null,
        explanation: ctx?.explanation ?? null,
        answerClue: ctx?.answerClue ?? null,
      }),
      temperature: 0.25,
      maxTokens: 3000,
      // 무엇을 그릴지 계획만 하는 단계라 깊은 추론이 필요 없음
      reasoningEffort: "low",
      preferredModels: preferred,
    })) as { imagePrompt?: string; labels?: unknown };

    const enriched = String(planned.imagePrompt ?? "").trim();
    const specs = normalizeLabelSpecs(planned.labels, ctx?.mismatchLabel);
    if (enriched.length > 40) {
      const labelLines = specs.length
        ? `\n\nLABEL PLAN (draw exactly this, each label once):\n${specs
            .map((s) => `${s.label}: ${s.draw}${s.matchesDialogue ? "" : "  ← the ONE detail that differs from the dialogue"}`)
            .join("\n")}`
        : "";
      return {
        prompt: `${COMPOSITE_LABEL_RULES}\n\n${enriched}${labelLines}`.slice(0, 3800),
        specs,
      };
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

  return {
    prompt: `${COMPOSITE_LABEL_RULES}

Scene:
${raw}
${scriptBit}
${mismatch}

Mandatory: Label ①,②,③,④,⑤ all large and visible, each exactly once.
If bins/objects have different colors in the dialogue, paint them clearly different flat colors (e.g. blue / yellow / green).
VERIFY: five labels + color differences when mentioned.`.slice(0, 3200),
    specs: [],
  };
}

function buildSimpleChoicePrompt(scenePrompt: string): string {
  const body = String(scenePrompt ?? "").trim();
  if (!body) throw new Error("choice_image_prompts가 비어 있습니다.");
  return `Korean middle-school English listening exam choice illustration.
Clean simple flat-color or line drawing, white background, textbook style.
Subject: ${body}`.slice(0, 3000);
}

export async function generateImagePngBytes(prompt: string): Promise<Buffer> {
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
      // 투명 배경으로 나오면 어두운 화면·인쇄에서 번진 것처럼 보인다 — 흰 배경으로 받는다
      body.background = "opaque";
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

/**
 * 투명 픽셀이 있는 PNG를 흰 바탕에 합친다 (없으면 그대로).
 * 캔버스 모듈을 못 불러오는 환경에서는 원본을 그대로 쓴다.
 */
export async function flattenPngOnWhite(bytes: Buffer): Promise<Buffer> {
  // PNG 헤더의 색 형식: 6 = RGBA, 4 = 회색+알파 — 알파가 없으면 손대지 않는다
  const colorType = bytes.length > 25 ? bytes[25] : 2;
  if (colorType !== 6 && colorType !== 4) return bytes;
  try {
    const { createCanvas, loadImage } = await import("@napi-rs/canvas");
    const img = await loadImage(bytes);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, img.width, img.height);
    ctx.drawImage(img, 0, 0);
    return canvas.toBuffer("image/png");
  } catch {
    return bytes;
  }
}

export async function uploadPng(
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

export type FigureCheck = {
  ok: boolean;
  /** 사람이 읽을 문제 목록 (빠진 라벨·중복 라벨·대화와 다른 라벨 등) */
  problems: string[];
  /** 대화와 다르게 그려진 라벨들 (정상이면 정답 라벨 하나) */
  mismatchLabels: string[];
  labels: Array<{ label: string; count: number; drawn: string; matchesDialogue: boolean }>;
  note: string;
};

/**
 * 합성 그림 검수. 라벨이 있는지만 보던 예전 검수는 ① 자리에 대화와 다른 날짜가 그려지거나
 * 같은 라벨·같은 시각이 두 번 나오는 그림도 통과시켰다(고1 6·7·9·11·14회).
 * 이제 라벨마다 한 번씩만 있는지, 대화와 다르게 그려진 라벨이 정답 라벨 하나뿐인지까지 본다.
 */
async function verifyCompositeFigure(
  pngBytes: Buffer,
  ctx: CompositeFigureContext | undefined,
  specs: FigureLabelSpec[]
): Promise<FigureCheck> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, problems: ["OPENAI_API_KEY 없음 — 검수 불가"], mismatchLabels: [], labels: [], note: "" };
  }

  const models = [
    process.env.OPENAI_MODEL_LISTENING_IMAGE_PLAN?.trim(),
    "gpt-5.5",
    "gpt-5.2",
    "gpt-4.1",
    "gpt-4o",
  ].filter(Boolean) as string[];

  const dataUrl = `data:image/png;base64,${pngBytes.toString("base64")}`;
  const planText = specs.length
    ? specs
        .map((s) => `${s.label}: ${s.draw} (${s.matchesDialogue ? "should MATCH the dialogue" : "should DIFFER from the dialogue"})`)
        .join("\n")
    : "(no plan — judge from the dialogue only)";
  let lastErr = "verify failed";

  for (const model of models) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          buildVerifyBody(model, [
            {
              role: "system",
              content:
                'You strictly check a Korean listening-exam figure (그림 불일치). The dialogue describes a poster/scene; in a correct figure EXACTLY ONE circled label shows something different from the dialogue. Read the image literally (exact text, numbers, times, counts, left/right positions). JSON only: {"labels":[{"label":"①","count":1,"drawn":"what is actually drawn/written at this label","matches_dialogue":true}, ...for ①②③④⑤],"colorsDistinct":true|null,"cleanBackground":true,"misspelledWords":[],"note":"..."}. cleanBackground=false if the background is not plain white/light (dark vignette, glow, blur, smudges). misspelledWords = English words in the image that are misspelled. count = how many times that circled number appears in the image (0 if missing). matches_dialogue=false when what is drawn contradicts the dialogue.',
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Dialogue:\n${ctx?.scriptText ?? "(none)"}\n\nIntended label plan:\n${planText}\n\nFor each label ①–⑤ report count, what is drawn, and whether it matches the dialogue. If recycling bins or colored items appear, are their colors clearly different?`,
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
      const json = JSON.parse(text) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = String(json.choices?.[0]?.message?.content ?? "");
      const parsed = JSON.parse(content) as {
        labels?: Array<{ label?: string; count?: number; drawn?: string; matches_dialogue?: boolean }>;
        colorsDistinct?: boolean | null;
        cleanBackground?: boolean;
        misspelledWords?: string[];
        note?: string;
      };
      const labels = CIRCLED_LABELS.map((label) => {
        const hit = (parsed.labels ?? []).find((l) => String(l.label ?? "").trim() === label);
        return {
          label,
          count: Number(hit?.count ?? 0),
          drawn: String(hit?.drawn ?? ""),
          matchesDialogue: hit?.matches_dialogue !== false,
        };
      });
      const problems: string[] = [];
      for (const l of labels) {
        if (l.count === 0) problems.push(`${l.label} 라벨 없음`);
        else if (l.count > 1) problems.push(`${l.label} 라벨 ${l.count}번 중복`);
      }
      const mismatchLabels: string[] = labels
        .filter((l) => !l.matchesDialogue)
        .map((l) => l.label);
      const expected = ctx?.mismatchLabel;
      if (expected) {
        if (!mismatchLabels.includes(expected)) {
          problems.push(`정답 라벨 ${expected}이 대화와 같게 그려짐`);
        }
        const extra = mismatchLabels.filter((m) => m !== expected);
        if (extra.length) problems.push(`정답이 아닌 ${extra.join(",")}도 대화와 다름`);
      } else if (mismatchLabels.length !== 1) {
        problems.push(`대화와 다른 라벨이 ${mismatchLabels.length}개`);
      }
      // 서로 다른 라벨에 같은 내용(예: 2:00이 두 번)이 그려졌는지
      const drawnKeys = labels
        .map((l) => l.drawn.toLowerCase().replace(/[^a-z0-9:]+/g, " ").trim())
        .filter((d) => d.length >= 3);
      if (new Set(drawnKeys).size < drawnKeys.length) problems.push("두 라벨이 같은 내용을 가리킴");
      if (parsed.colorsDistinct === false) problems.push("색 구분이 안 됨");
      // 시험지에 그대로 인쇄되므로 어두운 번짐·철자 오류가 있는 그림도 다시 그린다
      if (parsed.cleanBackground === false) problems.push("배경이 깨끗하지 않음(번짐·어두운 가장자리)");
      const misspelled = (parsed.misspelledWords ?? []).map(String).filter((w) => w.trim());
      if (misspelled.length) problems.push(`철자 오류: ${misspelled.join(", ")}`);
      return {
        ok: problems.length === 0,
        problems,
        mismatchLabels,
        labels,
        note: String(parsed.note ?? ""),
      };
    } catch (e) {
      lastErr = e instanceof Error ? e.message : String(e);
    }
  }
  return { ok: false, problems: [`검수 실패: ${lastErr}`], mismatchLabels: [], labels: [], note: lastErr };
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
  /** 합성 그림 검수 결과를 시도마다 받는다 (스크립트에서 그림 확인용) */
  onAttempt?: (info: { attempt: number; check: FigureCheck; bytes: Buffer }) => void;
}): Promise<{ urls: string[]; generated: number; skipped: boolean; check?: FigureCheck | null }> {
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
  let lastCheck: FigureCheck | null = null;
  for (let i = 0; i < prompts.length; i++) {
    let bytes: Buffer | null = null;
    let specs: FigureLabelSpec[] = [];
    let attemptPrompt: string;
    if (composite && prompts.length === 1) {
      const planned = await enrichCompositeScenePrompt(prompts[i]!, opts.figureContext);
      attemptPrompt = planned.prompt;
      specs = planned.specs;
    } else {
      attemptPrompt = buildSimpleChoicePrompt(prompts[i]!);
    }

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const candidate = await flattenPngOnWhite(await generateImagePngBytes(attemptPrompt));
      if (!(composite && prompts.length === 1)) {
        bytes = candidate;
        break;
      }

      const check = await verifyCompositeFigure(candidate, opts.figureContext, specs);
      lastCheck = check;
      opts.onAttempt?.({ attempt: attempt + 1, check, bytes: candidate });
      if (check.ok) {
        bytes = candidate;
        break;
      }
      console.warn(`[listening-image] QA 실패 (${attempt + 1}회): ${check.problems.join(", ")}`);
      if (attempt >= maxRetries) break;
      attemptPrompt = `${COMPOSITE_LABEL_RULES}

PREVIOUS DRAWING FAILED QA — problems: ${check.problems.join(", ") || "unknown"}.
${check.note ? `QA note: ${check.note}` : ""}

Redraw with ALL of ①②③④⑤ large and visible, each exactly once.
Only label ${opts.figureContext?.mismatchLabel ?? "(see scene)"} may differ from the dialogue; every other label must show exactly what the dialogue says.
If colors were not distinct: paint recycling bins / colored objects in clearly DIFFERENT flat colors (blue, yellow, green — not the same gray).
${specs.length ? `LABEL PLAN:\n${specs.map((s) => `${s.label}: ${s.draw}`).join("\n")}` : ""}

Scene:
${prompts[i]}
Script:
${opts.figureContext?.scriptText ?? ""}
Clue: ${opts.figureContext?.answerClue ?? opts.figureContext?.explanation ?? ""}

VERIFY five labels once each + only the mismatch label differs.`.slice(0, 3800);
    }

    // 검수를 통과하지 못한 그림은 저장하지 않는다 (예전에는 실패해도 저장해 정답과 다른 그림이 나갔다)
    if (!bytes) {
      throw new Error(
        `그림 검수를 통과하지 못해 저장하지 않았습니다: ${lastCheck?.problems.join(", ") || "알 수 없는 오류"}`
      );
    }
    const path = choiceImageStoragePath(opts.setId, opts.questionId, i, String(Date.now()));
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

  return { urls, generated, skipped: false, check: lastCheck };
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

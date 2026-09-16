/**
 * 문장 표시 분석 만들기. 문장 하나에 호출 하나를 쓰고(정확도가 걸린 자리라 gpt-5.5),
 * 돌아온 것은 코드가 전부 다시 확인한다.
 *
 * 확인하는 것
 *  - 모델이 따온 글자가 문장 안에 그대로 있는가(없으면 그 항목만 버린다)
 *  - 이름표가 고정 어휘에 있는가(analysis-markup.ts)
 *  - 구간이 서로 반쯤 걸치지 않는가(괄호를 칠 수 없는 배치는 버린다)
 *  - 문장성분이 너무 긴 구간에 붙지 않았는가(단어 아래 이름표가 줄을 넘기면 인쇄가 깨진다)
 * 틀린 분석을 찍느니 비우는 편이 낫다는 원칙을 따른다.
 */
import {
  isGpt5FamilyModel,
  isModelUnavailableError,
  isUnsupportedParameterError,
  isUnsupportedTemperatureError,
  studentRecordModelSupportsTemperature,
} from "@/lib/student-records/model";
import {
  ANALYSIS_MARKUP_SCHEMA,
  ANALYSIS_MARKUP_SYSTEM_PROMPT,
  buildAnalysisMarkupUserPrompt,
} from "@/lib/lesson-materials/analysis-markup-prompt";
import {
  canonicalMarkupLabel,
  MARKUP_SENTENCE_TAGS,
  resolveMarkupSpan,
  spansCross,
  type AnalysisSentenceMarkup,
  type MarkupBracket,
  type MarkupBracketKind,
  type MarkupCallout,
  type MarkupNumberedPoint,
  type MarkupRoleCode,
  type MarkupRoleLevel,
  type MarkupRoleMark,
  type MarkupSentenceTag,
  type MarkupSpan,
  type MarkupSpanNote,
} from "@/lib/lesson-materials/analysis-markup";

export type MarkupUsage = { inputTokens: number; outputTokens: number; calls: number };

export const emptyMarkupUsage = (): MarkupUsage => ({
  inputTokens: 0,
  outputTokens: 0,
  calls: 0,
});

/** 한 문장에 둘 수 있는 표시 수. 넘치면 인쇄가 빽빽해져 읽히지 않는다. */
const MAX_ROLES = 12;
const MAX_BRACKETS = 4;
const MAX_NOTES = 4;
const MAX_POINTS = 3;
const MAX_CALLOUTS = 1;
/** 단어 아래 성분 이름표를 붙일 수 있는 최대 길이. 더 길면 괄호로만 묶는다. */
const MAX_ROLE_WORDS = 8;
const MAX_ROLE_CHARS = 64;

export function resolveAnalysisMarkupModel(): string {
  return process.env.OPENAI_MODEL_ANALYSIS_MARKUP?.trim() || "gpt-5.5";
}

type Called = { text: string; inputTokens: number; outputTokens: number };

async function callMarkup(input: {
  apiKey: string;
  user: string;
  signal: AbortSignal;
}): Promise<Called | null> {
  const configured = resolveAnalysisMarkupModel();
  const candidates = configured === "gpt-5.5" ? ["gpt-5.5", "gpt-5"] : [configured];

  for (const model of candidates) {
    let includeTemperature = studentRecordModelSupportsTemperature(model);
    let includeReasoning = isGpt5FamilyModel(model);
    let includeSchema = true;

    for (let attempt = 0; attempt < 5; attempt++) {
      const body: Record<string, unknown> = {
        model,
        messages: [
          { role: "system", content: ANALYSIS_MARKUP_SYSTEM_PROMPT },
          { role: "user", content: input.user },
        ],
        // 문장마다 부르는 호출이라 긴 공통 지시문이 프롬프트 캐시에 걸리게 한다.
        prompt_cache_key: "analysis-markup",
      };
      if (includeSchema) {
        body.response_format = {
          type: "json_schema",
          json_schema: {
            name: "analysis_markup",
            strict: true,
            schema: ANALYSIS_MARKUP_SCHEMA,
          },
        };
      } else {
        body.response_format = { type: "json_object" };
      }
      if (includeTemperature) body.temperature = 0.2;
      if (isGpt5FamilyModel(model)) {
        body.max_completion_tokens = 6_000;
        if (includeReasoning) body.reasoning_effort = "low";
      } else {
        body.max_tokens = 3_000;
      }

      let res: Response;
      let text: string;
      try {
        res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${input.apiKey}`,
          },
          signal: input.signal,
          body: JSON.stringify(body),
        });
        text = await res.text();
      } catch {
        if (input.signal.aborted) return null;
        await new Promise((r) => setTimeout(r, 1_200 * (attempt + 1)));
        continue;
      }

      if (res.ok) {
        try {
          const envelope = JSON.parse(text) as {
            choices?: { message?: { content?: string } }[];
            usage?: { prompt_tokens?: number; completion_tokens?: number };
          };
          return {
            text: envelope.choices?.[0]?.message?.content ?? "",
            inputTokens: Number(envelope.usage?.prompt_tokens ?? 0),
            outputTokens: Number(envelope.usage?.completion_tokens ?? 0),
          };
        } catch {
          return null;
        }
      }
      if (includeTemperature && isUnsupportedTemperatureError(text)) {
        includeTemperature = false;
        continue;
      }
      if (includeReasoning && isUnsupportedParameterError(text, "reasoning_effort")) {
        includeReasoning = false;
        continue;
      }
      if (includeSchema && isUnsupportedParameterError(text, "response_format")) {
        includeSchema = false;
        continue;
      }
      if (isModelUnavailableError(res.status, text)) break;
      if (res.status === 429 || res.status >= 500) {
        await new Promise((r) => setTimeout(r, 1_500 * (attempt + 1)));
        continue;
      }
      break;
    }
  }
  return null;
}

type RawItem = { text?: unknown; occurrence?: unknown };

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

/** 모델이 따온 글자를 좌표로 바꾼다. 못 찾으면 null(그 항목은 버린다). */
function locate(sentence: string, raw: RawItem): MarkupSpan | null {
  const quote = String(raw.text ?? "").trim();
  if (!quote) return null;
  const occurrence = Math.max(1, Math.floor(Number(raw.occurrence) || 1));
  return (
    resolveMarkupSpan(sentence, quote, occurrence) ??
    // 번째 수가 틀린 경우가 잦아 첫 번째로 한 번 더 찾아 본다.
    (occurrence > 1 ? resolveMarkupSpan(sentence, quote, 1) : null)
  );
}

/** 이미 받아들인 구간과 반쯤 걸치면 안 된다(괄호를 칠 수 없는 배치). */
function fits(span: MarkupSpan, accepted: MarkupSpan[]): boolean {
  return !accepted.some((a) => spansCross(a, span));
}

const ROLE_SET: ReadonlySet<string> = new Set(["S", "V", "O", "C", "IO", "DO", "M", "A"]);

export type MarkupDropReason =
  | "span-not-found"
  | "label-unknown"
  | "span-crossing"
  | "role-too-long"
  | "too-many"
  | "empty-text";

export type MarkupBuildReport = {
  kept: number;
  dropped: Array<{ kind: string; reason: MarkupDropReason; text: string }>;
};

/**
 * 모델이 낸 것을 검사해 쓸 수 있는 것만 남긴다. 저장·인쇄로 나가는 모든 표시가 이 함수를 지난다.
 */
export function buildVerifiedMarkup(
  sentence: string,
  raw: unknown
): { markup: AnalysisSentenceMarkup; report: MarkupBuildReport } {
  const text = String(sentence ?? "").replace(/\s+/g, " ").trim();
  const report: MarkupBuildReport = { kept: 0, dropped: [] };
  const drop = (kind: string, reason: MarkupDropReason, t: unknown) => {
    report.dropped.push({ kind, reason, text: String(t ?? "").slice(0, 60) });
  };

  const empty: AnalysisSentenceMarkup = {
    text,
    roles: [],
    brackets: [],
    notes: [],
    points: [],
    callouts: [],
    translation: "",
    tags: [],
  };
  if (!text || !raw || typeof raw !== "object") return { markup: empty, report };
  const o = raw as Record<string, unknown>;

  /** 괄호·문장성분만 구간을 감싼다. 서로 반쯤 걸치면 괄호를 칠 수 없어 뒤의 것을 버린다. */
  const accepted: MarkupSpan[] = [];

  // 1) 괄호가 먼저다. 문장의 뼈대라 이것이 어긋나면 나머지가 다 어긋난다.
  const brackets: MarkupBracket[] = [];
  for (const b of Array.isArray(o.brackets) ? o.brackets : []) {
    if (brackets.length >= MAX_BRACKETS) {
      drop("bracket", "too-many", (b as RawItem)?.text);
      continue;
    }
    const row = b as RawItem & { kind?: unknown };
    const kind = String(row.kind ?? "") as MarkupBracketKind;
    if (kind !== "adverbial" && kind !== "nominal" && kind !== "inserted") {
      drop("bracket", "label-unknown", row.text);
      continue;
    }
    const span = locate(text, row);
    if (!span) {
      drop("bracket", "span-not-found", row.text);
      continue;
    }
    if (!fits(span, accepted)) {
      drop("bracket", "span-crossing", row.text);
      continue;
    }
    accepted.push(span);
    brackets.push({ span, kind });
  }

  // 2) 문장성분.
  const roles: MarkupRoleMark[] = [];
  for (const r of Array.isArray(o.roles) ? o.roles : []) {
    if (roles.length >= MAX_ROLES) {
      drop("role", "too-many", (r as RawItem)?.text);
      continue;
    }
    const row = r as RawItem & { role?: unknown; level?: unknown };
    const code = String(row.role ?? "").toUpperCase();
    if (!ROLE_SET.has(code)) {
      drop("role", "label-unknown", row.text);
      continue;
    }
    const quote = String(row.text ?? "").trim();
    if (wordCount(quote) > MAX_ROLE_WORDS || quote.length > MAX_ROLE_CHARS) {
      drop("role", "role-too-long", quote);
      continue;
    }
    const span = locate(text, row);
    if (!span) {
      drop("role", "span-not-found", row.text);
      continue;
    }
    if (roles.some((x) => x.span.start === span.start && x.span.end === span.end)) {
      continue;
    }
    if (!fits(span, accepted)) {
      drop("role", "span-crossing", row.text);
      continue;
    }
    accepted.push(span);
    const level = Math.min(2, Math.max(0, Math.floor(Number(row.level) || 0)));
    roles.push({
      span,
      role: code as MarkupRoleCode,
      level: level as MarkupRoleLevel,
    });
  }

  // 3) 번호 설명 자리. 설명이 실제 내용인 것만.
  const points: MarkupNumberedPoint[] = [];
  for (const p of Array.isArray(o.points) ? o.points : []) {
    if (points.length >= MAX_POINTS) {
      drop("point", "too-many", (p as RawItem)?.text);
      continue;
    }
    const row = p as RawItem & {
      label?: unknown;
      star?: unknown;
      explanation?: unknown;
      rewrite?: unknown;
    };
    const label = canonicalMarkupLabel(row.label);
    if (!label) {
      drop("point", "label-unknown", row.label);
      continue;
    }
    const explanation = String(row.explanation ?? "").replace(/\s+/g, " ").trim();
    if (explanation.length < 15) {
      drop("point", "empty-text", row.text);
      continue;
    }
    const span = locate(text, row);
    if (!span) {
      drop("point", "span-not-found", row.text);
      continue;
    }
    // 번호는 구간을 감싸지 않고 시작 자리에만 찍으므로 다른 구간과 걸쳐도 된다.
    const rewrite = String(row.rewrite ?? "").replace(/\s+/g, " ").trim();
    points.push({
      index: 0,
      span,
      label,
      star: row.star === true,
      explanation,
      rewrite: rewrite || undefined,
    });
  }
  points.sort((a, b) => a.span.start - b.span.start);
  points.forEach((p, i) => {
    p.index = i + 1;
  });
  // 별표는 한 문장에 하나만 남긴다.
  let starSeen = false;
  for (const p of points) {
    if (p.star && !starSeen) starSeen = true;
    else p.star = false;
  }

  // 4) 구간 위 이름표. 같은 자리에 번호 설명이 이미 있으면 겹쳐 찍지 않는다.
  const notes: MarkupSpanNote[] = [];
  for (const n of Array.isArray(o.notes) ? o.notes : []) {
    if (notes.length >= MAX_NOTES) {
      drop("note", "too-many", (n as RawItem)?.text);
      continue;
    }
    const row = n as RawItem & { label?: unknown; gloss?: unknown };
    const label = canonicalMarkupLabel(row.label);
    if (!label) {
      drop("note", "label-unknown", row.label);
      continue;
    }
    const span = locate(text, row);
    if (!span) {
      drop("note", "span-not-found", row.text);
      continue;
    }
    if (
      points.some(
        (p) => p.span.start === span.start && p.span.end === span.end && p.label === label
      )
    ) {
      continue;
    }
    const gloss = String(row.gloss ?? "").replace(/\s+/g, " ").trim();
    notes.push({ span, label, gloss: gloss || undefined });
  }

  // 5) 점선 상자.
  const callouts: MarkupCallout[] = [];
  for (const c of Array.isArray(o.callouts) ? o.callouts : []) {
    if (callouts.length >= MAX_CALLOUTS) {
      drop("callout", "too-many", (c as RawItem)?.text);
      continue;
    }
    const row = c as RawItem & { title?: unknown; body?: unknown; tone?: unknown };
    const title = String(row.title ?? "").replace(/\s+/g, " ").trim();
    const body = String(row.body ?? "").replace(/\s+/g, " ").trim();
    if (!title || body.length < 8) {
      drop("callout", "empty-text", row.text);
      continue;
    }
    const span = locate(text, row);
    if (!span) {
      drop("callout", "span-not-found", row.text);
      continue;
    }
    callouts.push({ span, title, body, tone: row.tone === "blue" ? "blue" : "red" });
  }

  const tags: MarkupSentenceTag[] = [];
  for (const t of Array.isArray(o.tags) ? o.tags : []) {
    const tag = String(t ?? "").trim();
    if ((MARKUP_SENTENCE_TAGS as readonly string[]).includes(tag)) {
      if (!tags.includes(tag as MarkupSentenceTag) && tags.length < 2) {
        tags.push(tag as MarkupSentenceTag);
      }
    }
  }

  const translation = String(o.translation ?? "").replace(/\s+/g, " ").trim();

  report.kept =
    brackets.length + roles.length + points.length + notes.length + callouts.length;

  return {
    markup: { text, roles, brackets, notes, points, callouts, translation, tags },
    report,
  };
}

function parseJsonSafe(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const s = text.indexOf("{");
    const e = text.lastIndexOf("}");
    if (s >= 0 && e > s) {
      try {
        return JSON.parse(text.slice(s, e + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

/** 문장 하나의 표시 분석. 실패하면 null(그 문장은 표시 없이 나간다). */
export async function generateSentenceMarkup(input: {
  apiKey: string;
  passage: string;
  sentence: string;
  sentenceNumber: number;
  totalSentences: number;
  koreanHint?: string | null;
  signal: AbortSignal;
  usage?: MarkupUsage;
}): Promise<{ markup: AnalysisSentenceMarkup; report: MarkupBuildReport } | null> {
  const called = await callMarkup({
    apiKey: input.apiKey,
    user: buildAnalysisMarkupUserPrompt({
      passage: input.passage,
      sentence: input.sentence,
      sentenceNumber: input.sentenceNumber,
      totalSentences: input.totalSentences,
      koreanHint: input.koreanHint,
    }),
    signal: input.signal,
  });
  if (!called) return null;
  if (input.usage) {
    input.usage.calls += 1;
    input.usage.inputTokens += called.inputTokens;
    input.usage.outputTokens += called.outputTokens;
  }
  const raw = parseJsonSafe(called.text);
  if (!raw) return null;
  return buildVerifiedMarkup(input.sentence, raw);
}

/**
 * 문장 표시 분석 검수. 만들어 낸 번호 설명과 해석을 값싼 모델로 한 번 더 확인해
 * 틀린 것을 고치거나 버린다(1장 자료의 one-page-verify.ts와 같은 방식).
 *
 * 만드는 호출은 한 문장에서 표시·설명·해석을 한꺼번에 내놓느라 하나하나를 따지지 못한다.
 * 그래서 설명만 떼어 "이 설명이 이 자리의 진짜 이유인가"를 짧게 되묻고, 해석은 "영어가 말하지
 * 않은 것을 말하고 있지 않은가"만 본다. 되묻는 값이 싸서 지문 하나에 몇 원이면 끝난다.
 */
import {
  isGpt5FamilyModel,
  isUnsupportedParameterError,
  isUnsupportedTemperatureError,
  studentRecordModelSupportsTemperature,
} from "@/lib/student-records/model";
import {
  canonicalMarkupLabel,
  type AnalysisSentenceMarkup,
} from "@/lib/lesson-materials/analysis-markup";
import type { MarkupUsage } from "@/lib/lesson-materials/generate-analysis-markup";
import { openAiFetch } from "@/lib/ai-usage/openai-fetch";

export function resolveAnalysisMarkupVerifyModel(): string {
  return process.env.OPENAI_MODEL_ANALYSIS_MARKUP_VERIFY?.trim() || "gpt-5-mini";
}

/** 한 번에 되묻는 항목 수. 답이 길어지면 그 길이가 그대로 기다리는 시간이 된다. */
const CHUNK = 6;

const POINT_PROMPT = `You check grammar explanations printed on a Korean school English analysis sheet.
For each item you get: sentence (unchanged), span (the marked part of that sentence), labelKo (the short Korean grammar name printed above the span), explanationKo (the numbered explanation printed below), rewrite (an optional rewritten form, may be "").
Answer for each item:
- labelFits: true only if labelKo names the construction that the span actually is in this sentence. False when it names a different construction (the span is an adverbial clause but the label says 명사절; the span is a gerund but the label says 현재분사).
- explanationTrue: true only if explanationKo states the rule that really governs this span in this sentence, describes the sentence correctly, and reads as clean Korean. False when the reason given is not the real reason, when it invents a rule, when it names words that are not in the sentence, when it is honorific Korean (-습니다), or when a word is broken or misspelled.
- rewriteTrue: true when rewrite is "" or when the rewritten form is grammatical English (or a correct Korean gloss) that really is equivalent to what the sentence says. False when the rewrite changes the meaning or is ungrammatical.
Judge grammar only, not style. Never mention this sheet, tools, or how the text was produced. Return only JSON.`;

const TRANSLATION_PROMPT = `You check Korean translations printed under English sentences on a Korean school English analysis sheet.
For each item you get an English sentence, its Korean rendering (ko), and sometimes the teacher's own translation (reference, may be "").
When ko says the same thing as reference, it is ok — do not reword it.
Set ok=false when the Korean says something the English does not say, drops the main clause, has the wrong subject, tense or negation, mistranslates a key word, reads unnatural in Korean, or uses honorific/polite endings (-습니다, -해요, -하세요) instead of the plain -다 ending a printed sheet uses.
An English imperative (Imagine ~, Think about ~) must stay an imperative in Korean: -하라 / -해 보라 is correct. Never turn it into -한다 / -해 본다 / -하다. "Let's ~" becomes -하자. A question stays a question (-인가? / -할까?).
When ok is false, write "fixed": a faithful, natural Korean rendering of the same English, same length and register, ending in -다 for a statement (-하라 for an imperative, -하자 for Let's, a question mark for a question). Otherwise "fixed" is "".
Return only JSON.`;

const NOTE_PROMPT = `You check the short Korean grammar names printed above parts of English sentences on a Korean school English analysis sheet.
For each item you get: sentence, span (the marked part), labelKo (the grammar name), glossKo (a short Korean meaning, may be "").
- labelFits: true only if labelKo correctly names what the span is in this sentence, by Korean school grammar. False examples:
  "등위절" on "and slowly turns up the heat" (no subject after and: that is 동사 병렬, not a clause);
  "삽입구" on a phrase at the end of a sentence that modifies the noun before it (such as coal, oil, and gas);
  a clause-type name on a span that is not that clause; a sentence-pattern name (5형식) on a sentence whose verb does not take that pattern.
- glossTrue: true when glossKo is "" or is a correct short meaning of the span in this sentence (an imperative stays -하라 / -해 보라).
Judge grammar only, not style. Return only JSON.`;

const str = { type: "string" } as const;
const bool = { type: "boolean" } as const;

const POINT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["results"],
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "id",
          "labelFits",
          "explanationTrue",
          "rewriteTrue",
        ],
        properties: {
          id: str,
          labelFits: bool,
          explanationTrue: bool,
          rewriteTrue: bool,
        },
      },
    },
  },
} as const;

const TRANSLATION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["results"],
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "ok", "fixed"],
        properties: { id: str, ok: bool, fixed: str },
      },
    },
  },
} as const;

const NOTE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["results"],
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "labelFits", "glossTrue"],
        properties: { id: str, labelFits: bool, glossTrue: bool },
      },
    },
  },
} as const;

/** 명령문 해석인가(「~하라」「~해 보라」로 끝난다). 검수가 이것을 평서형으로 바꾸면 받지 않는다. */
function isImperativeKo(ko: string): boolean {
  return /(?<!이)라[.!]?$/.test(ko.trim());
}

type Called = { text: string; inputTokens: number; outputTokens: number };

async function callJson(input: {
  apiKey: string;
  system: string;
  user: string;
  schemaName: string;
  schema: Record<string, unknown>;
  signal: AbortSignal;
}): Promise<Called | null> {
  const model = resolveAnalysisMarkupVerifyModel();
  let includeTemperature = studentRecordModelSupportsTemperature(model);
  let includeReasoning = isGpt5FamilyModel(model);
  for (let attempt = 0; attempt < 3; attempt++) {
    const body: Record<string, unknown> = {
      model,
      messages: [
        { role: "system", content: input.system },
        { role: "user", content: input.user },
      ],
      prompt_cache_key: `analysis-markup-verify-${input.schemaName}`,
      response_format: {
        type: "json_schema",
        json_schema: { name: input.schemaName, strict: true, schema: input.schema },
      },
    };
    if (includeTemperature) body.temperature = 0;
    if (isGpt5FamilyModel(model)) {
      body.max_completion_tokens = 8_000;
      if (includeReasoning) body.reasoning_effort = "low";
    } else {
      body.max_tokens = 2_500;
    }
    let res: Response;
    let text: string;
    try {
      res = await openAiFetch("https://api.openai.com/v1/chat/completions", {
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
      await new Promise((r) => setTimeout(r, 1_000 * (attempt + 1)));
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
    if (res.status === 429 || res.status >= 500) {
      await new Promise((r) => setTimeout(r, 1_200 * (attempt + 1)));
      continue;
    }
    return null;
  }
  return null;
}

function parseRows(text: string): Array<Record<string, unknown>> {
  try {
    const parsed = JSON.parse(text) as { results?: unknown };
    return Array.isArray(parsed.results) ? (parsed.results as Array<Record<string, unknown>>) : [];
  } catch {
    return [];
  }
}

function chunked<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

const clean = (v: unknown) => String(v ?? "").replace(/\s+/g, " ").trim();

export type MarkupVerifyResult = {
  markups: Array<AnalysisSentenceMarkup | null>;
  usage: MarkupUsage;
  /** 무엇을 버리고 무엇을 고쳤는지(점검 스크립트에서 본다) */
  notes: string[];
};

/**
 * 지문 하나의 표시 분석을 한꺼번에 검수한다. 설명·이름표가 틀렸다고 나오면 그 번호 설명을
 * 버린다. 해석은 고쳐 준 것으로 바꾼다.
 */
export async function verifyAnalysisMarkups(input: {
  apiKey: string;
  markups: Array<AnalysisSentenceMarkup | null>;
  /** 선생님이 넣은 해석(문장 순서대로). 있으면 해석 검수의 기준으로 준다. */
  references?: Array<string | null | undefined>;
  signal: AbortSignal;
}): Promise<MarkupVerifyResult> {
  const usage: MarkupUsage = { inputTokens: 0, outputTokens: 0, calls: 0 };
  const notes: string[] = [];
  const markups = input.markups.map((m) => (m ? { ...m } : m));

  type PointRef = { id: string; si: number; pi: number; ask: Record<string, unknown> };
  const pointItems: PointRef[] = [];
  const noteItems: Array<{ id: string; si: number; ni: number; ask: Record<string, unknown> }> = [];
  const translationItems: Array<{
    id: string;
    si: number;
    ask: Record<string, unknown>;
  }> = [];

  markups.forEach((m, si) => {
    if (!m) return;
    m.points.forEach((p, pi) => {
      const id = `${si}-${pi}`;
      pointItems.push({
        id,
        si,
        pi,
        ask: {
          id,
          sentence: m.text,
          span: m.text.slice(p.span.start, p.span.end),
          labelKo: p.label,
          explanationKo: p.explanation,
          rewrite: p.rewrite ?? "",
        },
      });
    });
    m.notes.forEach((n, ni) => {
      const id = `n-${si}-${ni}`;
      noteItems.push({
        id,
        si,
        ni,
        ask: {
          id,
          sentence: m.text,
          span: m.text.slice(n.span.start, n.span.end),
          labelKo: n.label,
          glossKo: n.gloss ?? "",
        },
      });
    });
    if (m.translation) {
      const id = `t-${si}`;
      translationItems.push({
        id,
        si,
        ask: {
          id,
          en: m.text,
          ko: m.translation,
          reference: String(input.references?.[si] ?? "").replace(/\s+/g, " ").trim(),
        },
      });
    }
  });

  const gather = async (
    items: Array<Record<string, unknown>>,
    system: string,
    schemaName: string,
    schema: Record<string, unknown>
  ): Promise<Map<string, Record<string, unknown>>> => {
    if (items.length === 0) return new Map();
    const parts = chunked(items, CHUNK);
    const done = await Promise.all(
      parts.map((part) =>
        callJson({
          apiKey: input.apiKey,
          system,
          user: JSON.stringify({ items: part }, null, 1),
          schemaName,
          schema,
          signal: input.signal,
        })
      )
    );
    const rows: Array<Record<string, unknown>> = [];
    for (const r of done) {
      if (!r) continue;
      usage.calls += 1;
      usage.inputTokens += r.inputTokens;
      usage.outputTokens += r.outputTokens;
      rows.push(...parseRows(r.text));
    }
    return new Map(rows.map((row) => [clean(row.id), row] as const));
  };

  const [pointRows, translationRows, noteRows] = await Promise.all([
    gather(
      pointItems.map((it) => it.ask),
      POINT_PROMPT,
      "analysis_points",
      POINT_SCHEMA as unknown as Record<string, unknown>
    ),
    gather(
      translationItems.map((it) => it.ask),
      TRANSLATION_PROMPT,
      "analysis_translations",
      TRANSLATION_SCHEMA as unknown as Record<string, unknown>
    ),
    gather(
      noteItems.map((it) => it.ask),
      NOTE_PROMPT,
      "analysis_notes",
      NOTE_SCHEMA as unknown as Record<string, unknown>
    ),
  ]);

  // 이름표: 그 자리에 안 맞으면 뗀다(고쳐 쓰지 않는다 — 다른 이름을 지어 붙이면 또 틀린다).
  if (noteRows.size > 0) {
    const dropByS = new Map<number, Set<number>>();
    for (const item of noteItems) {
      const row = noteRows.get(item.id);
      const note = markups[item.si]?.notes[item.ni];
      if (!row || !note) continue;
      if (row.labelFits !== true) {
        const set = dropByS.get(item.si) ?? new Set<number>();
        set.add(item.ni);
        dropByS.set(item.si, set);
        notes.push(`이름표 뗌 s${item.si + 1}: ${note.label}`);
      } else if (note.gloss && row.glossTrue !== true) {
        note.gloss = undefined;
        notes.push(`뜻풀이 뗌 s${item.si + 1}: ${note.label}`);
      }
    }
    for (const [si, drops] of dropByS) {
      const m = markups[si];
      if (m) m.notes = m.notes.filter((_, ni) => !drops.has(ni));
    }
  }

  // 번호 설명: 고칠 수 있으면 고치고, 아니면 버린다.
  if (pointRows.size > 0) {
    const dropByS = new Map<number, Set<number>>();
    for (const item of pointItems) {
      const row = pointRows.get(item.id);
      if (!row) continue;
      const m = markups[item.si];
      const point = m?.points[item.pi];
      if (!m || !point) continue;

      /*
       * 틀린 설명은 고쳐 쓰지 않고 뺀다. 검수가 새로 쓴 설명이 오히려 틀렸다
       * (2026-10-22 지문 다섯 개 대조: 고침 2건 모두 「보어 usually」「한옥」처럼 없는 말을 넣음).
       */
      if (row.explanationTrue !== true) {
        const set = dropByS.get(item.si) ?? new Set<number>();
        set.add(item.pi);
        dropByS.set(item.si, set);
        notes.push(`설명 버림 s${item.si + 1}: ${point.label}`);
        continue;
      }
      if (row.labelFits !== true) {
        const set = dropByS.get(item.si) ?? new Set<number>();
        set.add(item.pi);
        dropByS.set(item.si, set);
        notes.push(`이름표 버림 s${item.si + 1}: ${point.label}`);
        continue;
      }
      if (point.rewrite && row.rewriteTrue !== true) {
        point.rewrite = undefined;
        notes.push(`바꿔쓴 형태 버림 s${item.si + 1}: ${point.label}`);
      }
      // 검수가 되돌려 준 이름표도 고정 어휘를 지나야 한다.
      const label = canonicalMarkupLabel(point.label);
      if (!label) {
        const set = dropByS.get(item.si) ?? new Set<number>();
        set.add(item.pi);
        dropByS.set(item.si, set);
      }
    }
    for (const [si, drops] of dropByS) {
      const m = markups[si];
      if (!m) continue;
      m.points = m.points
        .filter((_, pi) => !drops.has(pi))
        .map((p, i) => ({ ...p, index: i + 1 }));
    }
  }

  // 해석: 고쳐 준 것이 있으면 바꾼다.
  for (const item of translationItems) {
    const row = translationRows.get(item.id);
    if (!row) continue;
    const m = markups[item.si];
    if (!m) continue;
    if (row.ok !== true) {
      const fixed = clean(row.fixed);
      // 명령문 해석을 평서형으로 바꾸는 고침은 받지 않는다(「상상해 보라」→「상상해 본다」, 2026-10-22)
      const wasQuestion = /\?\s*$/.test(m.translation) && /\?\s*["”’]?\s*$/.test(m.text);
      if (fixed && ((isImperativeKo(m.translation) && !isImperativeKo(fixed)) || (wasQuestion && !/\?\s*$/.test(fixed)))) {
        notes.push(`해석 고침 거절 s${item.si + 1}`);
        continue;
      }
      if (fixed) {
        m.translation = fixed;
        notes.push(`해석 고침 s${item.si + 1}`);
      } else {
        notes.push(`해석 확인 실패 s${item.si + 1}`);
      }
    }
  }

  return { markups, usage, notes };
}

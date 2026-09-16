import {
  isGpt5FamilyModel,
  isUnsupportedParameterError,
  isUnsupportedTemperatureError,
  studentRecordModelSupportsTemperature,
} from "@/lib/student-records/model";
import {
  ONE_PAGE_CONTENT_VERSION,
  findPhrase,
  onePageSourceHash,
  type OnePageContent,
  type OnePageGrammarPoint,
  type OnePageParaphrase,
  type OnePageTfItem,
  type OnePageVocabNote,
} from "@/lib/lesson-materials/one-page";
import { formatWorkbookPassage } from "@/lib/lesson-materials/workbook-types";

/**
 * 1장 요약직보자료·1장 테스트 재료를 지문당 한 번의 호출로 만든다: 한글 주제, 영어 제목, 요약문
 * (핵심 어구·해석), 도식화, 동·반의어, 어법 포인트, 표현 바꿔 쓰기, T/F, 영작 문장.
 * 본문에서 가져와야 하는 값(낱말·어법 자리·표현)은 코드가 본문과 대조해 없는 것은 버린다.
 * 시험지의 어법 선택·어휘 선택은 워크북 문항을 쓰므로 여기서 만들지 않는다.
 */

/**
 * 기본은 gpt-5-mini(추론 low). 2026-09-16 같은 지문으로 비교: gpt-4o·gpt-4.1은 어법 포인트가
 * 3~4개에 그치고 설명이 틀린 것이 섞였고(가주어 진주어를 "common 뒤 to부정사"로 설명), gpt-5-mini는
 * 5개를 맞게 설명했다. 지문당 입력 약 1,900·출력 약 2,500토큰(약 8원), 50초 안팎.
 */
export function resolveOnePageModel(): string {
  return process.env.OPENAI_MODEL_ONE_PAGE?.trim() || "gpt-5-mini";
}

const SYSTEM_PROMPT = `너는 한국 고등학교 내신 영어 시험 대비 "1장 요약직보자료"와 "1장 테스트" 재료를 만드는 편집자다.
입력 지문(문장마다 no가 있다)만 근거로 쓰고, 정해진 JSON으로만 답한다.

[공통]
- no는 입력 문장 번호를 그대로 쓴다.
- surface·target·right·expression은 그 문장(no)에 나온 글자 그대로 복사한다(대소문자·어형 포함, 바꾸거나 줄이지 않는다).
- 한국어는 짧고 자연스럽게 쓴다.

[topicKo] 지문의 주제를 한국어 한 문장(35~60자)으로. "~다."로 끝낸다.
[titleEn] 지문 내용을 담은 영어 제목(4~10 words, Title Case).
[summary]
- en: 지문 전체를 요약한 영어 한 문장(22~38 words). 지문 문장을 그대로 베끼지 말고 바꿔 쓴다.
- keywords: en 안에 철자·대소문자까지 똑같이 들어 있는 핵심 어구 3~4개(각 1~4 words, 서로 겹치지 않음, en에 나오는 순서대로). 요약문 빈칸 문제의 정답이 되므로 주제를 드러내는 내용어를 고르고, 관사·전치사만으로 된 어구는 안 된다.
- ko: en의 자연스러운 한국어 해석.
[flow] 글의 논리 흐름 3~5단계. en은 "라벨: 짧은 구" 꼴(라벨 예: Assumption, Claim, Example, Counter-example, Cause, Result, Contrast, Solution, Conclusion), 3~8 words. ko는 같은 내용의 한국어(8~22자). 마지막 단계는 결론·교훈이다.
[vocab] 시험에 나올 핵심 내용어 8~10개(동사·형용사·명사·부사, 쉬운 기초 낱말은 빼고 같은 낱말은 한 번만).
- surface: 지문에 나온 형태 그대로(굴절형 포함), no: 그 낱말이 나온 문장.
- meaningKo: 이 문맥에서의 뜻(짧게).
- synonyms: 이 문맥의 뜻으로 바꿔 쓸 수 있는 동의어 2~3개, antonyms: 반의어 2개(뚜렷한 반의어가 하나뿐이면 1개, 정말 없으면 []). 둘 다 되도록 2개 이상 채운다. 가능하면 surface와 같은 품사·형태(예: productive → fruitful, efficient / unproductive, useless).
[grammar] 내신 어법 선택·수정 문제에 실제로 나올 자리 4~6개(서로 다른 원리 위주, 한 문장에 최대 2개).
- 먼저 볼 원리: 주어-동사 수일치(긴 주어, each·every, 수식어 뒤 동사), 대명사 수·격(its/their, it/them), 형용사 vs 부사, 관계사 what/that/which와 관계부사, 분사 능동/수동, to부정사 vs 동명사, 가주어-진주어, 병렬 구조, 5형식 목적격보어, 도치, 시제·태.
- 넣지 않는 것: 조동사 뒤 동사원형, 관사, 철자, 생략된 말처럼 시험에서 고르게 할 수 없는 것.
- target: 그 어법이 보이는 부분(2~8 words), right: target 안에서 정답이 되는 낱말(또는 짧은 구) 그대로.
- wrong: 시험 오답처럼 right와 짝이 되는 형태(예: its↔their, what↔that, composed↔composing, necessarily↔necessary, assumes↔assume). 낱말을 덧붙이거나 뺀 형태는 쓰지 않는다.
- point: 원리 이름(예: "주어-동사 수일치", "관계대명사 what vs that", "과거분사(수동)").
- explanation: 그 원리로 right가 맞는 이유를 한국어 한 문장(45자 안팎)으로. 무엇을 받는지·무엇을 꾸미는지처럼 본문 근거를 짚는다.
[paraphrases] 서술형·바꿔 쓰기에 나올 핵심 표현 4~6개. expression은 지문에 나온 그대로의 2~6 words 어구(vocab 낱말 하나만인 표현은 피한다), meaningKo는 짧은 뜻, paraphrases는 이 문맥에서 같은 뜻인 영어 표현 1~2개.
[tf] 내용 일치 T/F 영어 문장 정확히 5개(각 12~25 words). 지문 문장을 그대로 베끼지 말고 내용 이해를 묻는다. T 2~3개, F 2~3개를 섞고, F는 지문에 비추어 분명히 틀린 내용이어야 한다(애매하면 안 됨).
[keySentences] 서술형·영작에 나올 핵심 문장 번호 4개(주제문·핵심 주장·중요 구문이 있는 문장, 가능하면 8~35 words). 문장이 4개보다 적으면 모두.`;

const str = { type: "string" } as const;
const int = { type: "integer" } as const;
const strList = { type: "array", items: str } as const;
const obj = (properties: Record<string, unknown>) => ({
  type: "object",
  additionalProperties: false,
  required: Object.keys(properties),
  properties,
});

const SCHEMA = obj({
  topicKo: str,
  titleEn: str,
  summary: obj({ en: str, keywords: strList, ko: str }),
  flow: { type: "array", items: obj({ en: str, ko: str }) },
  vocab: {
    type: "array",
    items: obj({ no: int, surface: str, meaningKo: str, synonyms: strList, antonyms: strList }),
  },
  grammar: {
    type: "array",
    items: obj({ no: int, target: str, right: str, wrong: str, point: str, explanation: str }),
  },
  paraphrases: {
    type: "array",
    items: obj({ no: int, expression: str, meaningKo: str, paraphrases: strList }),
  },
  tf: { type: "array", items: obj({ statement: str, answer: { type: "string", enum: ["T", "F"] } }) },
  keySentences: { type: "array", items: int },
});

type Row = Record<string, unknown>;
type RawContent = {
  topicKo?: unknown;
  titleEn?: unknown;
  summary?: { en?: unknown; keywords?: unknown; ko?: unknown } | null;
  flow?: unknown;
  vocab?: unknown;
  grammar?: unknown;
  paraphrases?: unknown;
  tf?: unknown;
  keySentences?: unknown;
};

function parseJsonSafe<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

const str1 = (v: unknown) => String(v ?? "").replace(/\s+/g, " ").trim();
const rows = (v: unknown): Row[] => (Array.isArray(v) ? v : []).map((r) => (r ?? {}) as Row);

function strList1(v: unknown, max: number): string[] {
  const list = Array.isArray(v) ? v : typeof v === "string" ? v.split(/[,/;]/) : [];
  const out: string[] = [];
  for (const row of list) {
    const s = str1(row);
    if (s && !out.some((o) => o.toLowerCase() === s.toLowerCase())) out.push(s);
    if (out.length >= max) break;
  }
  return out;
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/** 요약문 핵심 어구: 요약문에 실제로 있는 것만, 나온 순서대로, 겹치지 않게(요약문에 나온 글자 그대로). */
function locateKeywords(summary: string, raw: unknown): string[] {
  const found: Array<{ text: string; start: number; end: number }> = [];
  for (const kw of strList1(raw, 8)) {
    const hit = findPhrase(summary, kw);
    if (!hit) continue;
    if (found.some((f) => hit.start < f.end && f.start < hit.end)) continue;
    found.push({ text: summary.slice(hit.start, hit.end), ...hit });
  }
  return found
    .sort((a, b) => a.start - b.start)
    .slice(0, 5)
    .map((f) => f.text);
}

type Checked = { content: Omit<OnePageContent, "version" | "sourceHash" | "createdAt">; problems: string[] };

function checkContent(raw: RawContent, sentences: string[]): Checked {
  const problems: string[] = [];
  const n = sentences.length;
  /** 모델이 준 문장 번호(1부터)에 그 부분이 있으면 그 문장, 없으면 처음 나오는 문장. 본문에 없으면 -1. */
  const placeIn = (no: unknown, phrase: string): { si: number; exact: string } | null => {
    const k = Math.floor(Number(no)) - 1;
    const tryAt = (si: number) => {
      const hit = findPhrase(sentences[si]!, phrase);
      return hit ? { si, exact: sentences[si]!.slice(hit.start, hit.end) } : null;
    };
    if (k >= 0 && k < n) {
      const hit = tryAt(k);
      if (hit) return hit;
    }
    for (let si = 0; si < n; si++) {
      const hit = tryAt(si);
      if (hit) return hit;
    }
    return null;
  };

  const topicKo = str1(raw.topicKo);
  if (!topicKo) problems.push("주제 없음");
  const titleEn = str1(raw.titleEn);

  const summaryEn = str1(raw.summary?.en);
  const summaryKo = str1(raw.summary?.ko);
  const summaryKeywords = summaryEn ? locateKeywords(summaryEn, raw.summary?.keywords) : [];
  if (!summaryEn) problems.push("요약문 없음");
  if (summaryKeywords.length < 3) problems.push("요약문 핵심 어구 부족(summary.en에 그대로 있어야 함)");

  const flow = rows(raw.flow)
    .map((r) => ({ en: str1(r.en), ko: str1(r.ko) }))
    .filter((f) => f.en)
    .slice(0, 5);
  if (flow.length < 3) problems.push("도식화 부족");

  const vocab: OnePageVocabNote[] = [];
  for (const r of rows(raw.vocab)) {
    const placed = placeIn(r.no, str1(r.surface));
    if (!placed || vocab.some((v) => v.surface.toLowerCase() === placed.exact.toLowerCase())) continue;
    const synonyms = strList1(r.synonyms, 3);
    const antonyms = strList1(r.antonyms, 2);
    if (synonyms.length === 0 && antonyms.length === 0) continue;
    vocab.push({ sentenceIndex: placed.si, surface: placed.exact, meaningKo: str1(r.meaningKo), synonyms, antonyms });
    if (vocab.length >= 10) break;
  }
  if (vocab.length < 5) problems.push("어휘 부족(surface는 지문 그대로)");

  const grammar: OnePageGrammarPoint[] = [];
  for (const r of rows(raw.grammar)) {
    const placed = placeIn(r.no, str1(r.target));
    if (!placed) continue;
    const rightHit = findPhrase(placed.exact, str1(r.right));
    const right = rightHit ? placed.exact.slice(rightHit.start, rightHit.end) : "";
    const wrong = str1(r.wrong);
    const explanation = str1(r.explanation);
    if (!explanation) continue;
    if (grammar.some((g) => g.sentenceIndex === placed.si && g.target.toLowerCase() === placed.exact.toLowerCase())) continue;
    grammar.push({
      sentenceIndex: placed.si,
      target: placed.exact,
      right,
      // 바른 형태와 같거나 비어 있으면 틀린 형태를 싣지 않는다.
      wrong: right && wrong && wrong.toLowerCase() !== right.toLowerCase() ? wrong : "",
      point: str1(r.point),
      explanation,
    });
    if (grammar.length >= 6) break;
  }
  if (grammar.length < 3) problems.push("어법 포인트 부족(target은 지문 그대로)");

  const paraphrases: OnePageParaphrase[] = [];
  for (const r of rows(raw.paraphrases)) {
    const placed = placeIn(r.no, str1(r.expression));
    const alts = strList1(r.paraphrases, 2);
    if (!placed || alts.length === 0) continue;
    if (paraphrases.some((p) => p.expression.toLowerCase() === placed.exact.toLowerCase())) continue;
    paraphrases.push({ sentenceIndex: placed.si, expression: placed.exact, meaningKo: str1(r.meaningKo), paraphrases: alts });
    if (paraphrases.length >= 6) break;
  }
  if (paraphrases.length < 3) problems.push("바꿔 쓰기 표현 부족(expression은 지문 그대로)");

  const tf: OnePageTfItem[] = [];
  for (const r of rows(raw.tf)) {
    const statement = str1(r.statement);
    const a = str1(r.answer).toUpperCase();
    const answer = a === "T" || a === "TRUE" ? "T" : a === "F" || a === "FALSE" ? "F" : null;
    if (!statement || !answer) continue;
    tf.push({ statement, answer });
    if (tf.length >= 5) break;
  }
  if (tf.length < 5) problems.push("T/F 문항 수 부족");
  else if (!tf.some((t) => t.answer === "T") || !tf.some((t) => t.answer === "F")) {
    problems.push("T/F 정답이 한쪽으로 몰림");
  }

  const picked = new Set<number>();
  for (const v of Array.isArray(raw.keySentences) ? raw.keySentences : []) {
    const k = Math.floor(Number(v)) - 1;
    if (k >= 0 && k < n) picked.add(k);
    if (picked.size >= 4) break;
  }
  // 모자라면 알맞은 길이의 긴 문장으로 채운다.
  if (picked.size < Math.min(4, n)) {
    const fill = sentences
      .map((s, i) => ({ i, words: wordCount(s) }))
      .filter((r) => !picked.has(r.i) && r.words >= 6)
      .sort((a, b) => (a.words <= 35 ? 0 : 1) - (b.words <= 35 ? 0 : 1) || b.words - a.words);
    for (const r of fill) {
      if (picked.size >= Math.min(4, n)) break;
      picked.add(r.i);
    }
  }

  return {
    content: {
      topicKo,
      titleEn,
      summaryEn,
      summaryKeywords,
      summaryKo,
      flow,
      vocab,
      grammar,
      paraphrases,
      tf,
      keySentenceIndexes: [...picked].sort((a, b) => a - b),
    },
    problems,
  };
}

type Usage = { inputTokens: number; outputTokens: number };

async function requestContent(
  apiKey: string,
  userContent: string,
  signal: AbortSignal
): Promise<{ text: string; model: string; usage: Usage }> {
  const primary = resolveOnePageModel();
  const candidates = primary === "gpt-4o" ? ["gpt-4o", "gpt-4o-mini"] : [primary, "gpt-4o"];

  let lastErr = "";
  for (const model of candidates) {
    let includeTemperature = studentRecordModelSupportsTemperature(model);
    let includeReasoningEffort = isGpt5FamilyModel(model);
    let format: "schema" | "json" | "none" = "schema";
    for (let attempt = 0; attempt < 5; attempt++) {
      const body: Record<string, unknown> = {
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
        prompt_cache_key: "one-page-content",
      };
      if (format === "schema") {
        body.response_format = {
          type: "json_schema",
          json_schema: { name: "one_page_content", strict: true, schema: SCHEMA },
        };
      } else if (format === "json") {
        body.response_format = { type: "json_object" };
      }
      if (includeTemperature) body.temperature = 0.3;
      if (isGpt5FamilyModel(model)) {
        body.max_completion_tokens = 12_000;
        if (includeReasoningEffort) body.reasoning_effort = "low";
      } else {
        body.max_tokens = 5_000;
      }
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        signal,
        body: JSON.stringify(body),
      });
      const bodyText = await res.text();
      if (res.ok) {
        const envelope = parseJsonSafe<{
          model?: string;
          choices?: { message?: { content?: string } }[];
          usage?: { prompt_tokens?: number; completion_tokens?: number };
        }>(bodyText);
        return {
          text: envelope?.choices?.[0]?.message?.content ?? "",
          model: String(envelope?.model ?? model),
          usage: {
            inputTokens: Number(envelope?.usage?.prompt_tokens ?? 0),
            outputTokens: Number(envelope?.usage?.completion_tokens ?? 0),
          },
        };
      }
      if (includeTemperature && isUnsupportedTemperatureError(bodyText)) {
        includeTemperature = false;
        continue;
      }
      if (includeReasoningEffort && isUnsupportedParameterError(bodyText, "reasoning_effort")) {
        includeReasoningEffort = false;
        continue;
      }
      if (format !== "none" && isUnsupportedParameterError(bodyText, "response_format")) {
        format = format === "schema" ? "json" : "none";
        continue;
      }
      if (res.status === 429 || res.status >= 500) {
        await new Promise((r) => setTimeout(r, 1_500 * (attempt + 1)));
        continue;
      }
      lastErr = bodyText.slice(0, 200);
      break;
    }
  }
  throw new Error(`1장 자료를 만들지 못했습니다${lastErr ? `: ${lastErr}` : ""}`.slice(0, 180));
}

export async function generateOnePageContent(input: {
  title: string;
  sentences: string[];
}): Promise<{ content: OnePageContent; model: string; usage: Usage }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY가 설정되어 있지 않습니다.");
  const sentences = input.sentences.map((s) => formatWorkbookPassage(s)).filter(Boolean);
  if (sentences.length < 2) throw new Error("지문 문장이 너무 적습니다.");

  const baseUser = JSON.stringify({
    title: input.title || "",
    sentences: sentences.map((en, i) => ({ no: i + 1, en })),
  });

  const controller = new AbortController();
  // 추론 모델은 한 번에 1분 가까이 걸려, 다시 만들기 한 번까지 경로 상한(300초) 안에 들게 둔다.
  const timer = setTimeout(() => controller.abort(), 240_000);
  const usage: Usage = { inputTokens: 0, outputTokens: 0 };
  let model = "";
  try {
    let best: Checked | null = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      const user =
        attempt === 0 || !best
          ? baseUser
          : `${baseUser}\n\n이전 결과의 문제: ${best.problems.join(", ")}. 규칙을 지켜 다시 만들어라. summary.keywords는 summary.en에 그대로 들어 있어야 하고, surface·target·expression은 지문에 나온 그대로여야 한다.`;
      const res = await requestContent(apiKey, user, controller.signal);
      model = res.model;
      usage.inputTokens += res.usage.inputTokens;
      usage.outputTokens += res.usage.outputTokens;
      const parsed = parseJsonSafe<RawContent>(res.text);
      if (!parsed) continue;
      const checked = checkContent(parsed, sentences);
      if (!best || checked.problems.length < best.problems.length) best = checked;
      if (checked.problems.length === 0) break;
    }
    if (!best) throw new Error("1장 자료 응답을 읽지 못했습니다. 다시 시도해 주세요.");
    const fatal = best.problems.some((p) => p === "요약문 없음" || p === "주제 없음");
    if (fatal || best.content.tf.length < 3 || best.content.summaryKeywords.length === 0) {
      throw new Error(`1장 자료를 만들지 못했습니다(${best.problems.join(", ")}). 다시 시도해 주세요.`);
    }
    return {
      content: {
        ...best.content,
        version: ONE_PAGE_CONTENT_VERSION,
        sourceHash: onePageSourceHash(sentences),
        createdAt: new Date().toISOString(),
      },
      model,
      usage,
    };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("1장 자료를 만드는 시간이 초과되었습니다. 다시 시도해 주세요.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

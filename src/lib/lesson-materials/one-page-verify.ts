/**
 * 1장 요약직보자료 재료 검수. 만들어 낸 어법 포인트·동반의어·지칭어·해석을 값싼 모델로 한 번 더
 * 확인해 틀린 것을 버리거나 고친다.
 *
 * 2026-09-16 선생님 지적: 어법 포인트에 두 형태가 다 맞는 자리가 섞였고, 동의어·반의어가 그 문맥의
 * 뜻·품사와 맞지 않았고, 해석이 어색한 곳이 있었다. 만드는 호출은 한 번에 많은 것을 내놓느라
 * 하나하나를 따지지 못하므로, 항목만 떼어 짧게 되묻는 검수를 따로 둔다.
 *
 * 네 가지(어법·동반의어·지칭·해석)를 서로 기다리지 않게 같이 호출하고, 항목이 많은 갈래는
 * 몇 개씩 나눠 동시에 묻는다. 답이 짧아져 기다리는 시간이 줄어든다.
 */
import {
  isGpt5FamilyModel,
  isUnsupportedParameterError,
  isUnsupportedTemperatureError,
  studentRecordModelSupportsTemperature,
} from "@/lib/student-records/model";
import { findPhrase } from "@/lib/lesson-materials/one-page";
import type {
  OnePageGrammarPoint,
  OnePageParaphrase,
  OnePageReference,
  OnePageVocabNote,
} from "@/lib/lesson-materials/one-page";

/** 검수 모델. 만드는 모델보다 싸고 짧게 답하는 것을 쓴다. */
export function resolveOnePageVerifyModel(): string {
  return process.env.OPENAI_MODEL_ONE_PAGE_VERIFY?.trim() || "gpt-5-mini";
}

/** 검수가 "쉬운 낱말"이라고 뺄 때도 이만큼은 남긴다(정리자료 본문 주석이 비지 않게). */
const MIN_KEEP_VOCAB = 10;

export type VerifyUsage = { inputTokens: number; outputTokens: number; calls: number };

const str = { type: "string" } as const;
const bool = { type: "boolean" } as const;
const strList = { type: "array", items: str } as const;
const obj = (properties: Record<string, unknown>) => ({
  type: "object",
  additionalProperties: false,
  required: Object.keys(properties),
  properties,
});
const listOf = (properties: Record<string, unknown>) => ({ type: "array", items: obj(properties) });

const GRAMMAR_PROMPT = `You check Korean high-school English grammar points one by one. Judge each item inside its own unchanged sentence.
For each item you get: sentence, span (the underlined part), right (the answer inside the span), wrong (the distractor), pointKo (the name printed for this point), explanationKo (why right is correct), wrongWhyKo (why wrong is impossible).
Answer for each item:
- rightOk: true only if the sentence as written is fully grammatical.
- onlyOneCorrect: true only if replacing "right" with "wrong" makes the sentence ungrammatical in standard written English. If both forms are acceptable under any reading, set it false, and also when the two forms differ only in meaning or plausibility while both are well formed (an undeserving foul shot, make them / make people, a growing / a grown problem). Cases that are always false: gerund vs to-infinitive as a subject or complement, that vs which in a clause without commas, an omissible object relative pronoun, bare vs to-infinitive after help, if vs whether in an object clause, a simple past that could stand in for a present perfect, an optional comma, an article, a bare infinitive after a modal.
- wrongIsRealForm: true only if "wrong" is a real English word form (extraordinarily is real; slow downing, oftenly, would caused, won't able are not).
- spanCoversPoint: true only if span contains the word that makes "wrong" impossible - the to of an infinitive, the be/been of a passive, the modal, the preposition, the real subject, the antecedent - and everything explanationKo points at.
- explanationTrue: true only if explanationKo names the rule that actually governs this slot in this sentence, describes the sentence correctly, and reads as clean Korean. Set it false when the reason given is not the real reason (the slot is an infinitive after "enough" but the explanation talks about the tense of an adverbial clause; the slot is a gerund complement but the explanation calls it a participle modifying a noun), when it invents a rule, when it names the wrong construction, when it talks about the sheet itself ("target", "cue"), when it is honorific Korean (-습니다), or when a word is broken or misspelled.
- fixedExplanationKo: whenever explanationTrue is false and the point itself is sound, write the correct Korean explanation in one plain sentence ending in -다 (about 45 characters), naming the words in the sentence that decide the answer; otherwise "".
- fixedPointKo: when pointKo names a construction other than the one this slot actually tests, give the right short Korean name (for example "부사적 용법 to부정사", "전치사+동명사"); otherwise "".
Judge grammar only, not style. Return only JSON.`;

const VOCAB_PROMPT = `You check synonyms and antonyms for a Korean high-school English study sheet.
For each item you get: sentence, word (as it appears in the sentence), meaningKo (the Korean gloss printed on the sheet), synonyms, antonyms.
Keep a synonym only if it means the same as "word" in THIS sentence's sense and is the same part of speech; one that fits another sense of the word must be dropped.
Keep an antonym only if it is a true opposite of that sense and the same part of speech. Words that are merely different (asteroid/comet, diameter/radius, wages/poverty, cheat/obey) are not antonyms and must be dropped.
Drop invented or unnatural collocations (ethical license, mountain vents, "energy shortage" as an antonym of energy).
Then, if fewer than 2 remain, add ordinary English words that do pass the test; prefer single words. If this sense has no true opposite, leave antonyms empty rather than inventing one.
Also judge meaningKo: it must give one meaning that fits this sentence, in the part of speech of the word. Fill meaningKoFixed only when the gloss is wrong or lists several meanings.
For each item return: worthTeaching, pivotal, keepSynonyms (the final 2, in order), keepAntonyms (the final 0-2), meaningKoFixed ("" when the gloss is fine).
Judge worthTeaching by how much the passage's meaning depends on the word, not by how hard it is: keep a word when replacing it with its opposite would flip the argument or the flow of the passage. Set worthTeaching false for a proper noun, an abbreviation, a word that carries no part of the argument (a hard word the passage could lose without changing its point), or a word every middle-school student already knows (help, money, school, big).
pivotal is 0-5: how much of the passage's argument turns on this word. 5 = swapping in its opposite reverses the claim or the flow (increase/decrease, sustain/lose, necessarily/hardly); 3 = it carries a supporting step; 1 = it only names a topic or an example (astronomy, novel, experience) and the argument survives unchanged. A word with no true opposite rarely scores above 2.
Return only JSON.`;

const REFERENCE_PROMPT = `You check reference expressions on a Korean high-school English study sheet ("what does the underlined it refer to?").
For each item you get: passage (the numbered sentences), sentenceNo, surface (the reference expression as it appears in that sentence) and referent (what the sheet says it points back to). The sheet prints English only, so ignore any Korean gloss.
- refersCorrectly: true only if, reading the passage, "surface" in that sentence really points back to "referent". A plausible but wrong antecedent, or a referent taken from a later sentence, is false.
- worthAsking: false when the expression is not really a reference a test would ask about (a fixed phrase such as "it is important to", an "it" that is a dummy subject or object, "the" in a first mention, a generic "this" that points at nothing in the passage).
- fixedReferent: when refersCorrectly is false but a correct antecedent exists in an EARLIER sentence, copy it exactly from the passage; otherwise "".
- A referent may be a whole earlier sentence or clause when "this", "that" or "so" points at the whole idea; in that case it must be copied from the passage word for word.
- fixedMeaningKo: always "" (the sheet prints no Korean here).
Return only JSON.`;

const TRANSLATION_PROMPT = `You check Korean translations on a Korean high-school English study sheet.
For each item you get an English text and its Korean rendering (ko).
Set ok=false when the Korean says something the English does not say, drops the main clause, has the wrong subject or negation, or reads unnatural in Korean.
When ok is false, write "fixed": a faithful, natural Korean rendering of the same English, in the same length and register. Otherwise "fixed" is "".
Return only JSON.`;

type Called = { text: string; inputTokens: number; outputTokens: number };

async function callJson(input: {
  apiKey: string;
  system: string;
  user: string;
  schemaName: string;
  schema: Record<string, unknown>;
  signal: AbortSignal;
}): Promise<Called | null> {
  const model = resolveOnePageVerifyModel();
  let includeTemperature = studentRecordModelSupportsTemperature(model);
  let includeReasoning = isGpt5FamilyModel(model);
  for (let attempt = 0; attempt < 3; attempt++) {
    const body: Record<string, unknown> = {
      model,
      messages: [
        { role: "system", content: input.system },
        { role: "user", content: input.user },
      ],
      prompt_cache_key: `one-page-verify-${input.schemaName}`,
      response_format: {
        type: "json_schema",
        json_schema: { name: input.schemaName, strict: true, schema: input.schema },
      },
    };
    if (includeTemperature) body.temperature = 0;
    if (isGpt5FamilyModel(model)) {
      body.max_completion_tokens = 12_000;
      if (includeReasoning) body.reasoning_effort = "low";
    } else {
      body.max_tokens = 3_000;
    }
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${input.apiKey}` },
      signal: input.signal,
      body: JSON.stringify(body),
    });
    const text = await res.text();
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

/**
 * 항목이 많으면 몇 개씩 나눠 동시에 묻는다. 한 번에 다 물으면 답이 길어져 그 길이가 그대로
 * 기다리는 시간이 된다(선생님 지적: 1장 자료가 너무 느리다). id는 원래 번호를 그대로 쓴다.
 */
function chunked<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

const clean = (v: unknown) => String(v ?? "").replace(/\s+/g, " ").trim();

/** 고쳐 준 지칭 대상이 그 앞(또는 같은 문장)에 그대로 있는지 본다. 없으면 null(버린다). */
function locateReferent(
  sentences: string[],
  referent: string,
  beforeSentenceIndex: number
): { referent: string; sentenceIndex: number } | null {
  for (let i = beforeSentenceIndex; i >= 0; i--) {
    const hit = findPhrase(sentences[i] ?? "", referent);
    if (hit) return { referent: sentences[i]!.slice(hit.start, hit.end), sentenceIndex: i };
  }
  return null;
}

export type OnePageVerifyResult = {
  grammar: OnePageGrammarPoint[];
  vocab: OnePageVocabNote[];
  references: OnePageReference[];
  paraphrases: OnePageParaphrase[];
  summaryKo: string;
  usage: VerifyUsage;
  /** 무엇을 버리고 무엇을 고쳤는지(점검 스크립트에서 본다) */
  notes: string[];
};

/**
 * 어법·동반의어·지칭어·해석을 검수한다. 호출이 실패하면 그 갈래는 원래 재료를 그대로 둔다
 * (검수 때문에 자료를 못 만드는 일이 없게 한다).
 */
export async function verifyOnePageMaterial(input: {
  apiKey: string;
  sentences: string[];
  grammar: OnePageGrammarPoint[];
  vocab: OnePageVocabNote[];
  references: OnePageReference[];
  paraphrases: OnePageParaphrase[];
  summaryEn: string;
  summaryKo: string;
  signal: AbortSignal;
}): Promise<OnePageVerifyResult> {
  const usage: VerifyUsage = { inputTokens: 0, outputTokens: 0, calls: 0 };
  const notes: string[] = [];
  const sentenceOf = (i: number) => input.sentences[i] ?? "";
  const passage = input.sentences.map((en, i) => `${i + 1}. ${en}`).join("\n");

  type Kind = "grammar" | "vocab" | "reference" | "translation";
  const tasks: Array<{ kind: Kind; call: Promise<Called | null> }> = [];
  const add = (kind: Kind, call: Promise<Called | null>) => tasks.push({ kind, call });

  for (const part of chunked(input.grammar.map((g, i) => ({ g, i })), 5)) {
    add(
      "grammar",
      callJson({
        apiKey: input.apiKey,
        system: GRAMMAR_PROMPT,
        user: JSON.stringify({
          items: part.map(({ g, i }) => ({
            id: String(i),
            sentence: sentenceOf(g.sentenceIndex),
            span: g.target,
            right: g.right,
            wrong: g.wrong,
            pointKo: g.point,
            explanationKo: g.explanation,
            wrongWhyKo: g.wrongWhy ?? "",
          })),
        }),
        schemaName: "one_page_grammar_check",
        schema: obj({
          results: listOf({
            id: str,
            rightOk: bool,
            onlyOneCorrect: bool,
            wrongIsRealForm: bool,
            spanCoversPoint: bool,
            explanationTrue: bool,
            fixedExplanationKo: str,
            fixedPointKo: str,
          }),
        }),
        signal: input.signal,
      })
    );
  }

  for (const part of chunked(input.vocab.map((v, i) => ({ v, i })), 8)) {
    add(
      "vocab",
      callJson({
        apiKey: input.apiKey,
        system: VOCAB_PROMPT,
        user: JSON.stringify({
          items: part.map(({ v, i }) => ({
            id: String(i),
            sentence: sentenceOf(v.sentenceIndex),
            word: v.surface,
            meaningKo: v.meaningKo,
            synonyms: v.synonyms,
            antonyms: v.antonyms,
          })),
        }),
        schemaName: "one_page_vocab_check",
        schema: obj({
          results: listOf({
            id: str,
            worthTeaching: bool,
            pivotal: { type: "integer" },
            keepSynonyms: strList,
            keepAntonyms: strList,
            meaningKoFixed: str,
          }),
        }),
        signal: input.signal,
      })
    );
  }

  for (const part of chunked(input.references.map((r, i) => ({ r, i })), 8)) {
    add(
      "reference",
      callJson({
        apiKey: input.apiKey,
        system: REFERENCE_PROMPT,
        user: JSON.stringify({
          passage,
          items: part.map(({ r, i }) => ({
            id: String(i),
            sentenceNo: r.sentenceIndex + 1,
            surface: r.surface,
            referent: r.referent,
            meaningKo: r.meaningKo,
          })),
        }),
        schemaName: "one_page_reference_check",
        schema: obj({
          results: listOf({
            id: str,
            worthAsking: bool,
            refersCorrectly: bool,
            fixedReferent: str,
            fixedMeaningKo: str,
          }),
        }),
        signal: input.signal,
      })
    );
  }

  const translationItems = [
    { id: "summary", en: input.summaryEn, ko: input.summaryKo },
    ...input.paraphrases.map((p, i) => ({ id: `p${i}`, en: p.expression, ko: p.meaningKo })),
  ].filter((it) => it.en && it.ko);

  if (translationItems.length) {
    add(
      "translation",
      callJson({
        apiKey: input.apiKey,
        system: TRANSLATION_PROMPT,
        user: JSON.stringify({ items: translationItems }),
        schemaName: "one_page_translation_check",
        schema: obj({ results: listOf({ id: str, ok: bool, fixed: str }) }),
        signal: input.signal,
      })
    );
  }

  const done = await Promise.all(tasks.map((t) => t.call));
  for (const r of done) {
    if (!r) continue;
    usage.calls += 1;
    usage.inputTokens += r.inputTokens;
    usage.outputTokens += r.outputTokens;
  }
  /** 갈래별로 돌아온 답을 번호로 모은다. 답이 하나도 없으면 그 갈래는 원래 재료를 그대로 둔다. */
  const answersOf = (kind: Kind): Map<string, Record<string, unknown>> | null => {
    const rows = tasks.flatMap((t, i) => (t.kind === kind && done[i] ? parseRows(done[i]!.text) : []));
    const any = tasks.some((t, i) => t.kind === kind && done[i]);
    return any ? new Map(rows.map((row) => [clean(row.id), row] as const)) : null;
  };
  const grammarRows = answersOf("grammar");
  const vocabRows = answersOf("vocab");
  const referenceRows = answersOf("reference");
  const translationRows = answersOf("translation");

  // ---- 어법: 둘 다 맞거나 설명이 틀린 자리는 버린다(고쳐 준 설명이 있으면 고쳐 쓴다).
  let grammar = input.grammar;
  if (grammarRows) {
    const byId = grammarRows;
    grammar = input.grammar.flatMap((g, i) => {
      const row = byId.get(String(i));
      if (!row) return [g];
      if (row.rightOk === false || row.onlyOneCorrect === false || row.wrongIsRealForm === false) {
        notes.push(`어법 버림(둘 다 되거나 오답이 없는 형태): ${g.right} / ${g.wrong} · ${g.point}`);
        return [];
      }
      if (row.spanCoversPoint === false) {
        notes.push(`어법 버림(밑줄이 설명과 안 맞음): ${g.target}`);
        return [];
      }
      const point = clean(row.fixedPointKo) || g.point;
      if (point !== g.point) notes.push(`어법 이름 고침: ${g.point} → ${point}`);
      if (row.explanationTrue === false) {
        const fixed = clean(row.fixedExplanationKo);
        if (!fixed) {
          notes.push(`어법 버림(설명 틀림): ${g.right} · ${g.explanation}`);
          return [];
        }
        notes.push(`어법 설명 고침: ${g.explanation} → ${fixed}`);
        return [{ ...g, explanation: fixed, point }];
      }
      return [{ ...g, point }];
    });
  }

  // ---- 동·반의어: 문맥·품사에 맞지 않는 것을 빼고 모자라면 검수가 준 것으로 채운다.
  let vocab = input.vocab;
  if (vocabRows) {
    const byId = vocabRows;
    /**
     * 너무 쉬운 낱말이라 빼는 것은 남는 낱말이 넉넉할 때만 한다. 검수가 까다롭게 굴어 정리자료의
     * 낱말이 서너 개로 줄면 본문 아래 동·반의어가 텅 비어 보인다.
     */
    const easyCount = input.vocab.filter((_, i) => byId.get(String(i))?.worthTeaching === false).length;
    const dropEasy = Math.max(0, input.vocab.length - easyCount) >= MIN_KEEP_VOCAB ? easyCount : 0;
    let easyDropped = 0;
    vocab = input.vocab.flatMap((v, i) => {
      const row = byId.get(String(i));
      if (!row) return [v];
      if (row.worthTeaching === false && easyDropped < dropEasy) {
        easyDropped += 1;
        notes.push(`어휘 버림(가르칠 낱말이 아님): ${v.surface}`);
        return [];
      }
      const list = (raw: unknown, max: number) => {
        const out: string[] = [];
        for (const item of Array.isArray(raw) ? raw : []) {
          const word = clean(item);
          if (!word || word.toLowerCase() === v.surface.toLowerCase()) continue;
          if (out.some((o) => o.toLowerCase() === word.toLowerCase())) continue;
          out.push(word);
          if (out.length >= max) break;
        }
        return out;
      };
      const synonyms = list(row.keepSynonyms, 2);
      const antonyms = list(row.keepAntonyms, 2);
      if (synonyms.length === 0 && antonyms.length === 0) {
        notes.push(`어휘 버림(동·반의어 없음): ${v.surface}`);
        return [];
      }
      const meaningKo = clean(row.meaningKoFixed) || v.meaningKo;
      if (meaningKo !== v.meaningKo) notes.push(`뜻 고침: ${v.surface} ${v.meaningKo} → ${meaningKo}`);
      if (synonyms.join("|") !== v.synonyms.join("|") || antonyms.join("|") !== v.antonyms.join("|")) {
        notes.push(`동·반의어 고침: ${v.surface}`);
      }
      return [{ ...v, meaningKo, synonyms, antonyms }];
    });
    /**
     * 선생님 요청: 어려운 낱말이 아니라 논지를 가르는 낱말을 싣는다. 검수가 매긴 pivotal(0~5)과
     * "진짜 반대말이 있는지"로 줄을 세워, 자리가 모자랄 때 반의어가 빈 낱말부터 밀려나게 한다.
     * (부르는 쪽에서 앞에서부터 잘라 쓰고, 마지막에 지문 순서로 다시 줄 세운다.)
     */
    const scoreOf = (v: OnePageVocabNote) => {
      const i = input.vocab.findIndex((x) => x === v || x.surface === v.surface);
      const row = i >= 0 ? byId.get(String(i)) : undefined;
      const pivotal = Math.max(0, Math.min(5, Math.floor(Number(row?.pivotal ?? 3)) || 0));
      return pivotal * 2 + (v.antonyms.length > 0 ? 3 : 0);
    };
    vocab = vocab
      .map((v, i) => ({ v, i, score: scoreOf(v) }))
      .sort((a, b) => b.score - a.score || a.i - b.i)
      .map((row) => row.v);
  }

  // ---- 지칭어: 가리키는 대상이 틀리면 고치고, 고칠 수 없으면 버린다(틀린 지칭은 없느니만 못하다).
  let references = input.references;
  if (referenceRows) {
    const byId = referenceRows;
    references = input.references.flatMap((ref, i) => {
      const row = byId.get(String(i));
      if (!row) return [ref];
      if (row.worthAsking === false) {
        notes.push(`지칭 버림(물을 자리가 아님): ${ref.surface}`);
        return [];
      }
      const meaningKo = clean(row.fixedMeaningKo) || ref.meaningKo;
      if (row.refersCorrectly === false) {
        // 고쳐 준 대상도 앞 문장에 그대로 있어야 쓴다(지어낸 답은 버린다).
        const fixed = clean(row.fixedReferent);
        const at = fixed ? locateReferent(input.sentences, fixed, ref.sentenceIndex) : null;
        if (!at) {
          notes.push(`지칭 버림(가리키는 대상이 틀림): ${ref.surface} → ${ref.referent}`);
          return [];
        }
        notes.push(`지칭 고침: ${ref.surface} ${ref.referent} → ${at.referent}`);
        return [{ ...ref, referent: at.referent, referentSentenceIndex: at.sentenceIndex, meaningKo }];
      }
      if (meaningKo !== ref.meaningKo) notes.push(`지칭 뜻 고침: ${ref.surface}`);
      return [{ ...ref, meaningKo }];
    });
  }

  // ---- 해석: 요약문 해석과 바꿔 쓰기 표현의 뜻
  let summaryKo = input.summaryKo;
  let paraphrases = input.paraphrases;
  if (translationRows) {
    const byId = translationRows;
    const summaryRow = byId.get("summary");
    if (summaryRow && summaryRow.ok === false && clean(summaryRow.fixed)) {
      notes.push(`요약문 해석 고침: ${summaryKo} → ${clean(summaryRow.fixed)}`);
      summaryKo = clean(summaryRow.fixed);
    }
    paraphrases = input.paraphrases.map((p, i) => {
      const row = byId.get(`p${i}`);
      if (!row || row.ok !== false) return p;
      const fixed = clean(row.fixed);
      if (!fixed) return p;
      notes.push(`표현 뜻 고침: ${p.expression} ${p.meaningKo} → ${fixed}`);
      return { ...p, meaningKo: fixed };
    });
  }

  return { grammar, vocab, references, paraphrases, summaryKo, usage, notes };
}

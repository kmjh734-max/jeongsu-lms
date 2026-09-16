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
  type OnePageReference,
  type OnePageTfItem,
  type OnePageVocabNote,
} from "@/lib/lesson-materials/one-page";
import { rejectFabricatedDistractor } from "@/lib/lesson-materials/grammar-choice-v2/distractor-guard";
import { validateMinimalPair } from "@/lib/lesson-materials/grammar-choice-v2/minimal-pair";
import {
  onePageGrammarRule,
  onePageGrammarRulesText,
} from "@/lib/lesson-materials/one-page-grammar-rules";
import { verifyOnePageMaterial } from "@/lib/lesson-materials/one-page-verify";
import { formatWorkbookPassage } from "@/lib/lesson-materials/workbook-types";

/**
 * 1장 요약직보자료·1장 테스트 재료를 만든다: 한글 주제, 영어 제목, 요약문(핵심 어구·해석), 도식화,
 * 동·반의어, 어법 포인트, 지칭 정리, 표현 바꿔 쓰기, T/F, 영작 문장.
 * 시험지의 어법 선택·어휘 선택은 워크북 문항을 쓰므로 여기서 만들지 않는다.
 *
 * 2026-09-16 선생님 지적을 받아 세 겹으로 거른다.
 * 1) 프롬프트: 어법은 워크북 엔진의 교재 규칙 목록(one-page-grammar-rules)에 있는 것만, 두 형태가
 *    다 맞는 자리는 금지. 낱말은 한 낱말·같은 품사·진짜 반대말만.
 * 2) 코드: 본문에 있는 그대로인지, 그 문장에 한 번만 나오는지, 밑줄이 근거(cue)까지 덮는지,
 *    오답이 굴절·기능어 하나만 다른지(워크북의 오답 검사를 그대로 쓴다)를 본다.
 * 3) 검수(one-page-verify): 값싼 모델에 항목을 하나씩 되물어 두 형태가 다 맞거나 설명·동반의어·
 *    지칭·해석이 틀린 것을 버리거나 고친다. 버려서 모자라면 겹치지 않는 것으로 더 뽑는다.
 */

/**
 * 기본은 gpt-5-mini(추론 low). 2026-09-16 같은 지문으로 비교: gpt-4o·gpt-4.1은 어법 포인트가
 * 3~4개에 그치고 설명이 틀린 것이 섞였고(가주어 진주어를 "common 뒤 to부정사"로 설명), gpt-5-mini는
 * 5개를 맞게 설명했다. 지문당 입력 약 1,900·출력 약 2,500토큰(약 8원), 50초 안팎.
 */
export function resolveOnePageModel(): string {
  return process.env.OPENAI_MODEL_ONE_PAGE?.trim() || "gpt-5-mini";
}

const VOCAB_SECTION = `[vocab] 이 지문으로 공부할 때 외워야 할 핵심 낱말 10~12개.
- 고를 것: 글의 주제·논지를 나르는 내용어(명사·동사·형용사·부사)로, 고등학생이 새로 배울 만한 수준의 낱말.
- 빼야 할 것: 중학 수준의 쉬운 낱말(steal, cash, money, help, balance), 고유명사·약어(NEAs, Jackson High School), 숫자·단위, 두 낱말 이상의 구(그런 표현은 paraphrases로 보낸다), 한 지문에서 같은 어근인 낱말(diversify·diversity·variety 중 하나만).
- surface: 지문에 나온 형태 그대로의 낱말 하나(하이픈으로 이어진 낱말은 하나로 본다). 구는 안 된다. no: 그 낱말이 나온 문장.
- meaningKo: 이 문맥에서의 뜻 하나만, 품사에 맞게 쓴다(명사는 "~것", 동사는 "~하다", 형용사는 "~한"). 여러 뜻을 늘어놓지 않는다.
- synonyms: 이 뜻으로 그 자리에 넣어도 말이 되는 낱말 2개. surface와 품사가 같아야 하고(명사↔명사, 동사↔동사), 한 낱말짜리를 먼저 쓴다. 지어낸 어구(ethical license, mountain vents 같은 것)는 쓰지 않는다.
- antonyms: 이 뜻의 진짜 반대말 2개, 품사도 같아야 한다. "다른 것"은 반대말이 아니다(asteroid↔comet, diameter↔radius, wages↔poverty는 틀렸다). 진짜 반대말이 없으면 []로 두고, 그런 낱말은 애초에 고르지 않는 편이 낫다.`;

const GRAMMAR_SECTION = `[grammar] 내신 어법 선택·수정 문제로 그대로 낼 수 있는 자리 6~8개(되도록 서로 다른 code, 한 문장에 최대 2개).
code는 아래 GRAMMAR_RULES에 있는 것만 쓴다. 각 자리는 다음을 모두 만족해야 하고, 하나라도 어기면 그 자리는 빼라.
1) 이 문장에서 맞는 형태가 오직 하나여야 한다. 다른 형태도 문법에 맞으면 싣지 않는다. 예를 들어 주어 자리의 동명사(to부정사도 주어가 된다), 콤마 없는 관계절의 that/which, 목적격 관계대명사 생략, help 뒤의 원형/to V, 목적어절의 if/whether, 강조구문의 that/who는 모두 둘 다 되므로 금지다.
2) 관사, 쉼표, 철자, 단수·복수 표기, 생략된 말, 조동사 뒤 동사원형(should run, would have p.p.)은 고르게 할 수 없으니 금지다.
3) 답을 정하는 근거가 같은 문장 안에 드러나 있어야 한다.
4) 주어가 동사 바로 앞에 있는 인칭·수 일치(I am, you need, they feel, Humans enjoy, There are)는 시험에 나오지 않는다. 수일치는 주어와 동사 사이에 수식어구·관계절이 끼어 있을 때만 낸다.
- code: GRAMMAR_RULES의 코드 그대로.
- target: 근거와 정답을 함께 담은, 지문에 나온 그대로의 부분(3~12 words). 정리자료에서 이 부분에 밑줄이 그어지므로 explanation이 말하는 것이 모두 이 안에 있어야 한다. 그 문장에 두 번 나오는 부분은 고르지 않는다.
- right: target 안에서 정답이 되는 낱말(1~3 words), 지문 그대로.
- cue: 오답이 왜 안 되는지를 정해 주는 말(진짜 주어 명사, 선행사, 전치사, to부정사의 to, 수동태의 be·been, 시간 표시어, 연결동사 등), 지문 그대로. 이 말은 반드시 target 안에 있어야 한다.
- wrong: right와 한 가지만 다른 형태(굴절 하나 또는 기능어 하나). 학생이 실제로 하는 실수여야 하고 영어에 있는 형태여야 한다(slow downing, would caused, won’t able처럼 없는 형태 금지). 낱말을 덧붙이거나 빼지 않는다.
- wrongWhy: wrong이 이 문장에서 왜 틀렸는지 한국어 한 문장. "어색하다", "덜 자연스럽다"가 아니라 문법적으로 왜 안 되는지 적는다. 그렇게 쓸 수 없으면 그 자리를 빼라.
- explanation: right가 맞는 이유를 한국어 한 문장(45자 안팎). 근거가 되는 본문 낱말을 그대로 적어 말한다("target", "cue", "문장" 같은 말은 쓰지 않는다). "~다"로 끝나는 평서형으로 쓰고(존댓말 금지), code가 말하는 원리와 실제로 묻는 원리가 다르면 그 자리를 빼라. 본문에 없는 규칙을 지어내지 않는다.`;

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
${VOCAB_SECTION}
${GRAMMAR_SECTION}
[paraphrases] 서술형·바꿔 쓰기에 나올 핵심 표현 4~6개. expression은 지문에 나온 그대로의 2~6 words 어구(낱말 하나짜리는 vocab이 맡는다), meaningKo는 이 문맥에 맞는 짧고 자연스러운 한국어 뜻, paraphrases는 이 문맥에서 바꿔 써도 뜻이 같은 영어 표현 1~2개(지문의 다른 표현을 그대로 베끼지 않는다).
[references] 지칭 정리 4~6개. 시험에서 "밑줄 친 것이 가리키는 것"으로 물을 만한 자리만 고른다.
- 대상: 대명사(it, they, them, this, these, those, one, ones, so)와 앞말을 받는 명사구(such+명사, the+명사, this/that+명사, another, the former/the latter).
- surface: 그 문장에 나온 그대로(1~4 words). 그 문장에 두 번 나오는 말은 고르지 않는다.
- refersToNo: 가리키는 대상이 있는 문장 번호. 반드시 surface가 있는 문장보다 앞(또는 같은 문장의 앞부분)이어야 한다.
- referent: 가리키는 대상을 그 문장에서 그대로 옮긴 영어(철자·어순 그대로). 보통 1~10 words.
  this·that·so처럼 앞 문장 전체(또는 절 전체)를 받는 경우에는 그 문장(절)을 처음부터 끝까지 그대로 옮긴다(최대 40 words).
- meaningKo: 빈 문자열("")로 둔다. 지칭 정리는 영어만 적는다.
- 넣지 않는 것: 가주어·가목적어 it, 관용구의 it(it is important to), 앞에 가리킬 것이 없는 the·this, 날씨·시간의 it, 글쓴이·읽는이를 가리키는 I·you·we, 인사말.
- 같은 말은 한 번만 싣는다.
[tf] 내용 일치 T/F 영어 문장 정확히 5개(각 12~25 words). 지문 문장을 그대로 베끼지 말고 내용 이해를 묻는다. T 2~3개, F 2~3개를 섞고, F는 지문에 비추어 분명히 틀린 내용이어야 한다(애매하면 안 됨).
[keySentences] 서술형·영작에 나올 핵심 문장 번호 4개(주제문·핵심 주장·중요 구문이 있는 문장, 가능하면 8~35 words). 문장이 4개보다 적으면 모두.

GRAMMAR_RULES (code(이름): 고르는 기준):
${onePageGrammarRulesText()}`;

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
    items: obj({
      no: int,
      code: str,
      target: str,
      right: str,
      cue: str,
      wrong: str,
      wrongWhy: str,
      explanation: str,
    }),
  },
  paraphrases: {
    type: "array",
    items: obj({ no: int, expression: str, meaningKo: str, paraphrases: strList }),
  },
  references: {
    type: "array",
    items: obj({ no: int, surface: str, refersToNo: int, referent: str, meaningKo: str }),
  },
  tf: { type: "array", items: obj({ statement: str, answer: { type: "string", enum: ["T", "F"] } }) },
  keySentences: { type: "array", items: int },
});

/** 어법·어휘가 모자랄 때 겹치지 않는 것을 더 뽑는 호출(만드는 호출 전체를 다시 하지 않는다). */
const REFILL_PROMPT = `너는 한국 고등학교 내신 영어 자료를 만드는 편집자다.
입력 지문(문장마다 no가 있다)만 근거로 쓰고, 정해진 JSON으로만 답한다. 이미 쓴 것과 겹치지 않는 것만 낸다.
no는 입력 문장 번호를 그대로 쓰고, surface·target·right·cue는 그 문장에 나온 글자 그대로 복사한다.

${VOCAB_SECTION}
${GRAMMAR_SECTION}

GRAMMAR_RULES (code(이름): 고르는 기준):
${onePageGrammarRulesText()}`;

const REFILL_SCHEMA = obj({ vocab: SCHEMA.properties.vocab, grammar: SCHEMA.properties.grammar });

type Row = Record<string, unknown>;
type RawContent = {
  topicKo?: unknown;
  titleEn?: unknown;
  summary?: { en?: unknown; keywords?: unknown; ko?: unknown } | null;
  flow?: unknown;
  vocab?: unknown;
  grammar?: unknown;
  paraphrases?: unknown;
  references?: unknown;
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

/** 정리자료 한 장에 실을 어법 포인트 수(아래로 내려가면 다시 만들어 채운다). */
export const MIN_GRAMMAR = 4;
/** 한 장에 싣는 최대 개수 */
const MAX_GRAMMAR = 6;
const MAX_VOCAB = 10;
/**
 * 검수에서 버려질 것을 감안해 더 뽑아 둔다. 다시 뽑는 호출(약 20초·토큰 절반)보다
 * 처음에 두어 개 더 받는 편이 값이 덜 든다.
 */
const GRAMMAR_CANDIDATES = 8;
const VOCAB_CANDIDATES = 12;
/** 정리자료 한 장에 실을 낱말 수(검수에서 빠져 이보다 적어지면 더 뽑는다). */
export const MIN_VOCAB = 7;
/** 밑줄 구간의 최대 길이. 근거까지 담느라 문장 전체가 밑줄이 되는 것을 막는다. */
const MAX_TARGET_WORDS = 14;

/** 같은 어근인지 대충 본다(diversify·diversity, compensate·compensation). 한 장에 한 번만 싣기 위한 것. */
function sameStem(a: string, b: string): boolean {
  const cut = (w: string) =>
    w
      .toLowerCase()
      .replace(/[^a-z]/g, "")
      .replace(/(?:ies|ing|ies|ed|es|s|ly|ness|ment|tion|sion|ity|ive|ous|al)$/, "");
  const x = cut(a);
  const y = cut(b);
  if (!x || !y) return false;
  return x.length >= 4 && y.length >= 4 && (x === y || x.startsWith(y) || y.startsWith(x));
}

/** 낱말 경계로 센 등장 횟수 */
function countPhrase(text: string, phrase: string): number {
  let count = 0;
  let from = 0;
  for (;;) {
    const hit = findPhrase(text.slice(from), phrase);
    if (!hit) return count;
    count += 1;
    from += hit.end;
    if (count > 4) return count;
  }
}

/** 글쓴이·읽는이를 가리키는 말(앞말을 받는 지칭어가 아니다) */
const DEICTIC = new Set(["i", "you", "we", "me", "us", "my", "your", "our", "mine", "yours", "ours"]);

/** 앞에 붙어 답을 정하는 기능어. 밑줄이 이 말을 빠뜨리면 설명과 어긋난다(to ask, been nominated). */
const LEADING_CUES = new Set([
  "to","be","been","being","is","are","was","were","am","has","have","had","of","in","on","at","for","from",
  "after","before","without","by","with","about","than","as","not","the","a","an",
]);
/** 조동사 뒤 동사원형은 시험에 낼 수 없는 자리다. */
const MODALS = new Set(["should","would","can","could","will","shall","may","might","must","do","does","did"]);

/** 오답이 바른 형태와 굴절·기능어 하나만 다른지. 워크북 오답 검사에 더해 낱말 자체가 바뀐 것을 막는다. */
function minimalFormPair(right: string, wrong: string): boolean {
  const tok = (t: string) => t.toLowerCase().replace(/[^a-z'’-]/g, "");
  const a = right.split(/\s+/).map(tok).filter(Boolean);
  const b = wrong.split(/\s+/).map(tok).filter(Boolean);
  if (a.length === 0 || b.length === 0) return false;
  const sameWord = (x: string, y: string) => {
    if (x === y) return true;
    if (FUNCTION_WORDS.has(x) && FUNCTION_WORDS.has(y)) return true;
    if (FUNCTION_WORDS.has(x) !== FUNCTION_WORDS.has(y)) return false;
    const head = Math.min(4, Math.min(x.length, y.length));
    return head >= 3 && x.slice(0, head) === y.slice(0, head);
  };
  if (a.length === b.length) {
    const diffs = a.map((w, i) => (w === b[i] ? null : [w, b[i]!] as const)).filter(Boolean);
    return diffs.length === 1 && sameWord(diffs[0]![0], diffs[0]![1]);
  }
  if (Math.abs(a.length - b.length) !== 1) return false;
  // 한쪽에만 있는 낱말 하나가 기능어면 된다(because / because of, can be frozen / can frozen).
  const [long, short] = a.length > b.length ? [a, b] : [b, a];
  let i = 0;
  let skipped = "";
  for (const w of long) {
    if (i < short.length && sameWord(w, short[i]!)) {
      i += 1;
      continue;
    }
    if (skipped) return false;
    skipped = w;
  }
  return i === short.length && FUNCTION_WORDS.has(skipped);
}

/** 굴절·짝으로만 갈리는 기능어(오답이 이 안에서 바뀌는 것은 어법 문항이 된다). */
const FUNCTION_WORDS = new Set([
  "a","an","the","be","been","being","is","are","was","were","am","do","does","did","have","has","had",
  "to","of","in","on","at","for","from","by","with","about","into","over","under","after","before","during",
  "while","since","until","because","although","though","despite","without","than","as","so","that","which",
  "who","whom","whose","what","where","when","why","how","whether","if","and","or","but","not","no",
  "it","its","they","them","their","he","him","his","she","her","we","us","our","i","me","my","you","your",
  "this","that","these","those","one","ones","much","many","few","little","most","some","any","each","every",
  "will","would","can","could","shall","should","may","might","must","there",
]);

const PERSONAL_PRONOUNS = new Set(["i", "you", "we", "they", "he", "she", "it"]);
const WEAK_WORDS = /어색|자연스럽|더 낫|부드럽|흔히 쓰|선호/;

type Placed = { si: number; exact: string; start: number; end: number };

/** 모델이 준 문장 번호(1부터)에 그 부분이 있으면 그 문장, 없으면 처음 나오는 문장. 본문에 없으면 null. */
function makePlaceIn(sentences: string[]) {
  return (no: unknown, phrase: string): Placed | null => {
    const k = Math.floor(Number(no)) - 1;
    const tryAt = (si: number) => {
      const hit = findPhrase(sentences[si]!, phrase);
      return hit ? { si, exact: sentences[si]!.slice(hit.start, hit.end), ...hit } : null;
    };
    if (k >= 0 && k < sentences.length) {
      const hit = tryAt(k);
      if (hit) return hit;
    }
    for (let si = 0; si < sentences.length; si++) {
      const hit = tryAt(si);
      if (hit) return hit;
    }
    return null;
  };
}

/**
 * 낱말 하나를 본다. 지문에 있는 한 낱말이어야 하고, 같은 어근이 이미 실렸으면 싣지 않는다.
 */
function checkVocabNote(
  r: Row,
  placeIn: (no: unknown, phrase: string) => Placed | null,
  already: OnePageVocabNote[]
): OnePageVocabNote | null {
  const surface = str1(r.surface);
  // 낱말 하나만 싣는다(구는 바꿔 쓰기가 맡는다).
  if (!surface || wordCount(surface) !== 1) return null;
  const placed = placeIn(r.no, surface);
  if (!placed) return null;
  if (already.some((v) => v.surface.toLowerCase() === placed.exact.toLowerCase())) return null;
  // 같은 어근은 한 번만(diversify·diversity·variety).
  if (already.some((v) => sameStem(v.surface, placed.exact))) return null;
  const synonyms = strList1(r.synonyms, 3).filter((w) => !sameStem(w, placed.exact));
  const antonyms = strList1(r.antonyms, 2).filter((w) => !sameStem(w, placed.exact));
  if (synonyms.length === 0 && antonyms.length === 0) return null;
  return {
    sentenceIndex: placed.si,
    surface: placed.exact,
    meaningKo: str1(r.meaningKo),
    synonyms,
    antonyms,
  };
}

/**
 * 어법 포인트 하나를 본다. 답이 하나로 정해지는 자리만 남긴다.
 * - code는 정리자료가 쓰는 어법 목록(교재 규칙)에 있어야 한다.
 * - target은 그 문장에 한 번만 나와야 하고(밑줄이 엉뚱한 자리에 가지 않게), right는 target 안에 있어야 한다.
 * - 설명이 짚는 근거(cue)까지 밑줄 안에 들어오도록 구간을 넓힌다.
 * - 오답은 굴절·기능어 하나만 다르고 실제로 있는 형태여야 한다(워크북 엔진의 검사를 그대로 쓴다).
 */
function checkGrammarPoint(
  r: Row,
  sentences: string[],
  placeIn: (no: unknown, phrase: string) => Placed | null
): OnePageGrammarPoint | null {
  const code = str1(r.code).toUpperCase();
  const rule = onePageGrammarRule(code);
  if (!rule) return null;

  const placed = placeIn(r.no, str1(r.target));
  if (!placed) return null;
  const sentence = sentences[placed.si]!;
  if (countPhrase(sentence, placed.exact) !== 1) return null;

  const rightHit = findPhrase(placed.exact, str1(r.right));
  if (!rightHit) return null;
  const right = placed.exact.slice(rightHit.start, rightHit.end);
  if (countPhrase(placed.exact, right) !== 1) return null;
  const rightStart = placed.start + rightHit.start;
  const rightEnd = placed.start + rightHit.end;

  // 근거(cue)를 밑줄 안으로. 문장에 없거나 구간이 너무 길어지면 버린다.
  const cueHit = findPhrase(sentence, str1(r.cue));
  if (!cueHit) return null;
  let start = Math.min(placed.start, cueHit.start);
  const end = Math.max(placed.end, cueHit.end);
  // 답을 정하는 앞말(to ask의 to, been nominated의 been)이 밑줄 밖이면 설명과 어긋난다. 한 낱말 당겨 온다.
  const before = sentence.slice(0, start).match(/([A-Za-z’']+)\s*$/);
  if (before && LEADING_CUES.has(before[1]!.toLowerCase())) {
    start -= before[0].length;
  }
  const target = sentence.slice(start, end).replace(/^\s+/, "");
  if (wordCount(target) > MAX_TARGET_WORDS) return null;
  if (countPhrase(sentence, target) !== 1) return null;

  // 주어가 동사 바로 앞에 붙은 수일치(they feel, Humans enjoy)는 시험 문항이 되지 않는다.
  if (code.startsWith("AGREEMENT_")) {
    const cueWord = sentence.slice(cueHit.start, cueHit.end).toLowerCase();
    if (PERSONAL_PRONOUNS.has(cueWord)) return null;
    const gapFrom = Math.min(cueHit.end, rightEnd);
    const gapTo = Math.max(cueHit.start, rightStart);
    if (gapTo <= gapFrom || wordCount(sentence.slice(gapFrom, gapTo)) < 2) return null;
  }

  // 조동사 뒤 동사원형 자리는 시험에 낼 수 없다(should run / should ran).
  const beforeRight = sentence.slice(0, rightStart).match(/([A-Za-z’']+)\s*$/);
  if (beforeRight && MODALS.has(beforeRight[1]!.toLowerCase())) return null;

  const wrong = str1(r.wrong);
  if (!wrong || wrong.toLowerCase() === right.toLowerCase()) return null;
  if (!minimalFormPair(right, wrong)) return null;
  if (rejectFabricatedDistractor({ pointCode: code, correct: right, wrong, sentence })) return null;
  if (validateMinimalPair({ pointCode: code, sourceSpan: right, distractor: wrong, sentence })) return null;

  const explanation = str1(r.explanation);
  const wrongWhy = str1(r.wrongWhy);
  if (!explanation || !wrongWhy) return null;
  // "어색하다"는 둘 다 된다는 뜻이다. 그런 자리는 싣지 않는다.
  if (WEAK_WORDS.test(wrongWhy)) return null;

  return {
    sentenceIndex: placed.si,
    code,
    target,
    right,
    cue: sentence.slice(cueHit.start, cueHit.end),
    wrong,
    wrongWhy,
    point: rule.labelKo,
    explanation,
  };
}

type Checked = { content: Omit<OnePageContent, "version" | "sourceHash" | "createdAt">; problems: string[] };

function checkContent(raw: RawContent, sentences: string[]): Checked {
  const problems: string[] = [];
  const n = sentences.length;
  const placeIn = makePlaceIn(sentences);

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
    const note = checkVocabNote(r, placeIn, vocab);
    if (!note) continue;
    vocab.push(note);
    if (vocab.length >= VOCAB_CANDIDATES) break;
  }
  if (vocab.length < MIN_VOCAB) problems.push("어휘 부족(surface는 지문에 나온 낱말 그대로)");

  const grammar: OnePageGrammarPoint[] = [];
  for (const r of rows(raw.grammar)) {
    const point = checkGrammarPoint(r, sentences, placeIn);
    if (!point) continue;
    // 한 문장에 둘까지, 같은 어법은 한 번만(한 장에 여러 원리가 고르게 실리게).
    if (grammar.filter((g) => g.sentenceIndex === point.sentenceIndex).length >= 2) continue;
    if (grammar.filter((g) => g.code === point.code).length >= 2) continue;
    if (grammar.some((g) => g.target.toLowerCase() === point.target.toLowerCase())) continue;
    grammar.push(point);
    if (grammar.length >= GRAMMAR_CANDIDATES) break;
  }
  if (grammar.length < MIN_GRAMMAR) problems.push("어법 포인트 부족(답이 하나로 정해지는 자리만)");

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

  const references: OnePageReference[] = [];
  for (const r of rows(raw.references)) {
    const surface = str1(r.surface);
    if (!surface || wordCount(surface) > 4) continue;
    // 글쓴이·읽는이를 가리키는 말은 물을 자리가 아니다.
    if (DEICTIC.has(surface.toLowerCase())) continue;
    const placed = placeIn(r.no, surface);
    if (!placed) continue;
    // 밑줄이 엉뚱한 자리에 가지 않게, 그 문장에 한 번만 나오는 말만 싣는다.
    if (countPhrase(sentences[placed.si]!, placed.exact) !== 1) continue;
    const referent = str1(r.referent);
    // 앞 문장 전체를 받는 this·that·so는 문장 전체가 답이므로 길게 허용한다
    if (!referent || wordCount(referent) > 40) continue;
    const from = Math.floor(Number(r.refersToNo)) - 1;
    // 가리키는 대상은 앞(또는 같은 문장)에 실제로 있어야 한다.
    let si = from >= 0 && from <= placed.si && findPhrase(sentences[from] ?? "", referent) ? from : -1;
    if (si < 0) {
      for (let k = placed.si; k >= 0; k--) {
        if (findPhrase(sentences[k]!, referent)) {
          si = k;
          break;
        }
      }
    }
    if (si < 0) continue;
    const hit = findPhrase(sentences[si]!, referent)!;
    if (si === placed.si && hit.start >= placed.start) continue;
    // 같은 말은 한 번만(같은 지칭어가 여러 번 나와도 한 줄로 족하다).
    if (references.some((x) => x.surface.toLowerCase() === placed.exact.toLowerCase())) continue;
    references.push({
      sentenceIndex: placed.si,
      surface: placed.exact,
      referent: sentences[si]!.slice(hit.start, hit.end),
      referentSentenceIndex: si,
      meaningKo: str1(r.meaningKo),
    });
    if (references.length >= 6) break;
  }

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
      references,
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
  signal: AbortSignal,
  shape: { system: string; schemaName: string; schema: Record<string, unknown> } = {
    system: SYSTEM_PROMPT,
    schemaName: "one_page_content",
    schema: SCHEMA as unknown as Record<string, unknown>,
  }
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
          { role: "system", content: shape.system },
          { role: "user", content: userContent },
        ],
        prompt_cache_key: `one-page-${shape.schemaName}`,
      };
      if (format === "schema") {
        body.response_format = {
          type: "json_schema",
          json_schema: { name: shape.schemaName, strict: true, schema: shape.schema },
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

/**
 * 검수에서 버려져 어법 포인트·낱말이 모자랄 때, 이미 쓴 것과 버린 것을 빼고 더 뽑아 검수까지 마친다.
 * 만드는 호출 전체를 다시 하지 않아 값이 덜 든다.
 */
async function refillMaterial(input: {
  apiKey: string;
  baseUser: string;
  sentences: string[];
  grammar: OnePageGrammarPoint[];
  vocab: OnePageVocabNote[];
  /** 검수에서 버린 어법 자리·낱말(다시 뽑지 않게) */
  dropped: { targets: string[]; words: string[] };
  signal: AbortSignal;
  usage: Usage;
}): Promise<{ grammar: OnePageGrammarPoint[]; vocab: OnePageVocabNote[] }> {
  const needGrammar = Math.max(0, MIN_GRAMMAR - input.grammar.length);
  const needVocab = Math.max(0, MIN_VOCAB - input.vocab.length);
  if (needGrammar === 0 && needVocab === 0) return { grammar: [], vocab: [] };
  const usedTargets = [...input.grammar.map((g) => g.target), ...input.dropped.targets];
  const usedWords = [...input.vocab.map((v) => v.surface), ...input.dropped.words];
  const ask = [
    needGrammar > 0 ? `어법 포인트 ${needGrammar + 2}개` : "어법 포인트 0개(빈 배열)",
    needVocab > 0 ? `낱말 ${needVocab + 3}개` : "낱말 0개(빈 배열)",
  ].join(", ");
  const user = `${input.baseUser}

이미 쓴 어법 자리: ${JSON.stringify(usedTargets)}
이미 쓴 낱말: ${JSON.stringify(usedWords)}
이것들과 겹치지 않는 ${ask}를 골라라. 두 형태가 다 맞는 자리는 넣지 마라.`;
  const res = await requestContent(input.apiKey, user, input.signal, {
    system: REFILL_PROMPT,
    schemaName: "refill",
    schema: REFILL_SCHEMA as unknown as Record<string, unknown>,
  });
  input.usage.inputTokens += res.usage.inputTokens;
  input.usage.outputTokens += res.usage.outputTokens;
  const parsed = parseJsonSafe<{ grammar?: unknown; vocab?: unknown }>(res.text);
  if (!parsed) return { grammar: [], vocab: [] };
  const placeIn = makePlaceIn(input.sentences);

  const freshGrammar: OnePageGrammarPoint[] = [];
  if (needGrammar > 0) {
    const taken = (t: string) => usedTargets.some((x) => x.toLowerCase() === t.toLowerCase());
    for (const r of rows(parsed.grammar)) {
      const point = checkGrammarPoint(r, input.sentences, placeIn);
      if (!point || taken(point.target)) continue;
      const all = [...input.grammar, ...freshGrammar];
      if (all.some((g) => g.target.toLowerCase() === point.target.toLowerCase())) continue;
      if (all.filter((g) => g.code === point.code).length >= 2) continue;
      if (all.filter((g) => g.sentenceIndex === point.sentenceIndex).length >= 2) continue;
      freshGrammar.push(point);
      if (freshGrammar.length >= needGrammar + 2) break;
    }
  }

  const freshVocab: OnePageVocabNote[] = [];
  if (needVocab > 0) {
    for (const r of rows(parsed.vocab)) {
      const note = checkVocabNote(r, placeIn, [...input.vocab, ...freshVocab]);
      if (!note) continue;
      if (usedWords.some((w) => w.toLowerCase() === note.surface.toLowerCase())) continue;
      freshVocab.push(note);
      if (freshVocab.length >= needVocab + 3) break;
    }
  }
  if (freshGrammar.length === 0 && freshVocab.length === 0) return { grammar: [], vocab: [] };

  const checked = await verifyOnePageMaterial({
    apiKey: input.apiKey,
    sentences: input.sentences,
    grammar: freshGrammar,
    vocab: freshVocab,
    references: [],
    paraphrases: [],
    summaryEn: "",
    summaryKo: "",
    signal: input.signal,
  });
  input.usage.inputTokens += checked.usage.inputTokens;
  input.usage.outputTokens += checked.usage.outputTokens;
  return { grammar: checked.grammar, vocab: checked.vocab };
}

export async function generateOnePageContent(input: {
  title: string;
  sentences: string[];
}): Promise<{ content: OnePageContent; model: string; usage: Usage; notes: string[] }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY가 설정되어 있지 않습니다.");
  const sentences = input.sentences.map((s) => formatWorkbookPassage(s)).filter(Boolean);
  if (sentences.length < 2) throw new Error("지문 문장이 너무 적습니다.");

  const baseUser = JSON.stringify({
    title: input.title || "",
    sentences: sentences.map((en, i) => ({ no: i + 1, en })),
  });

  const controller = new AbortController();
  // 만들기·검수·보충까지 경로 상한(300초) 안에 들게 둔다.
  const timer = setTimeout(() => controller.abort(), 270_000);
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
      // 어휘·어법이 모자란 것은 뒤의 보충 호출이 메우므로, 그것 때문에 전체를 다시 만들지 않는다.
      if (checked.problems.every((p) => p.startsWith("어휘 부족") || p.startsWith("어법 포인트 부족"))) break;
    }
    if (!best) throw new Error("1장 자료 응답을 읽지 못했습니다. 다시 시도해 주세요.");
    const fatal = best.problems.some((p) => p === "요약문 없음" || p === "주제 없음");
    if (fatal || best.content.tf.length < 3 || best.content.summaryKeywords.length === 0) {
      throw new Error(`1장 자료를 만들지 못했습니다(${best.problems.join(", ")}). 다시 시도해 주세요.`);
    }

    // 검수: 어법·동반의어·지칭어·해석을 값싼 모델로 한 번 더 확인해 틀린 것을 버리거나 고친다.
    const verified = await verifyOnePageMaterial({
      apiKey,
      sentences,
      grammar: best.content.grammar,
      vocab: best.content.vocab,
      references: best.content.references ?? [],
      paraphrases: best.content.paraphrases,
      summaryEn: best.content.summaryEn,
      summaryKo: best.content.summaryKo,
      signal: controller.signal,
    });
    usage.inputTokens += verified.usage.inputTokens;
    usage.outputTokens += verified.usage.outputTokens;
    const notes = [...verified.notes];

    // 검수에서 버려져 어법·낱말이 모자라면 겹치지 않는 것으로 채운다.
    // 같은 어법이 둘이면 뒤엣것은 자리가 남을 때만 쓴다(한 장에 여러 원리가 고르게 실리게).
    const spread = <T extends { code?: string }>(list: T[], max: number) => {
      const first = list.filter((x, i) => list.findIndex((y) => y.code === x.code) === i);
      return [...first, ...list.filter((x) => !first.includes(x))].slice(0, max);
    };
    let grammar = spread(verified.grammar, MAX_GRAMMAR);
    let vocab = verified.vocab.slice(0, MAX_VOCAB);
    const dropped = {
      targets: best.content.grammar
        .filter((g) => !grammar.some((k) => k.target === g.target))
        .map((g) => g.target),
      words: best.content.vocab
        .filter((v) => !vocab.some((k) => k.surface === v.surface))
        .map((v) => v.surface),
    };
    for (let round = 0; round < 2; round++) {
      if (grammar.length >= MIN_GRAMMAR && vocab.length >= MIN_VOCAB) break;
      const more = await refillMaterial({
        apiKey,
        baseUser,
        sentences,
        grammar,
        vocab,
        dropped,
        signal: controller.signal,
        usage,
      });
      if (more.grammar.length === 0 && more.vocab.length === 0) break;
      if (more.grammar.length) notes.push(`어법 ${more.grammar.length}개 더 뽑음`);
      if (more.vocab.length) notes.push(`낱말 ${more.vocab.length}개 더 뽑음`);
      grammar = [...grammar, ...more.grammar].slice(0, MAX_GRAMMAR);
      vocab = [...vocab, ...more.vocab].slice(0, MAX_VOCAB);
    }

    return {
      content: {
        ...best.content,
        grammar,
        vocab,
        references: verified.references,
        paraphrases: verified.paraphrases,
        summaryKo: verified.summaryKo,
        version: ONE_PAGE_CONTENT_VERSION,
        sourceHash: onePageSourceHash(sentences),
        createdAt: new Date().toISOString(),
      },
      model,
      usage,
      notes,
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

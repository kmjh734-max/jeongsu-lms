/**
 * 테스트 교재(수업자료 NEW, 정수학원) 공용 — 브라우저에서도 쓴다.
 *
 * 선생님 구성(2026-10-19): 워크북을 숙제로 길게 내는 대신, 교재에는 단어 정리·동반의어 테스트·
 * 수업용 자료·테스트 견본·백지노트를 싣고, 학원에서는 같은 재료로 테스트지를 무작위로 뽑아
 * 1:1로 채점한다. 틀린 것은 백지노트에 정리한다.
 *
 * 재료는 지문마다 한 번 만들어 lesson_pack_json.testBookMaterial에 둔다(단어 정리·중요문장·
 * 어순 덩어리). 문항은 1장 자료 재료(onePageContent: 동반의어·어법 포인트·T/F·요약문)와 이 재료로
 * 규칙에 따라 조립하므로, 견본과 뽑기 모두 모델을 다시 부르지 않는다.
 * 섞기는 열쇠(seed)로 정해진다 — 교재 견본은 늘 같은 열쇠, 뽑기는 누를 때마다 새 열쇠.
 */
import {
  createSeededRng,
  fisherYatesShuffle,
  hashSeedToUint32,
  stripLeadingSentenceMarkers,
} from "@/lib/lesson-materials/sentence-order-shuffle";
import { formatWorkbookPassage } from "@/lib/lesson-materials/workbook-types";
import {
  answerSentence,
  buildOnePageSentenceOrder,
  findPhrase,
  splitSummaryByKeywords,
  type OnePageContent,
} from "@/lib/lesson-materials/one-page";
import type { AnalysisReportData } from "@/lib/lesson-materials/generate-analysis-report";
import type { WorkbookGrammarChoiceSection } from "@/lib/lesson-materials/workbook-types";

/**
 * 재료 형식이 바뀌면 올린다. 원문이 그대로인 옛 재료는 열 때 단어 정리(모델 호출)는 그대로 두고
 * 중요문장·어순 덩어리처럼 규칙으로 만드는 것만 다시 계산한다(선생님 2026-10-20: 들어갈 때마다
 * 새로 만드는 것 같고 너무 오래 걸린다 — 버전을 올리면 지문마다 단어 정리를 처음부터 다시 만들었다).
 */
export const TEST_BOOK_MATERIAL_VERSION = "tb-4";
/** 단어 정리(모델이 만드는 부분) 규칙이 바뀌면 올린다 — 이것만 다르면 단어 정리만 다시 만든다 */
export const TEST_BOOK_VOCAB_VERSION = "tv-3";

// ---------------------------------------------------------------- 유형

export type TestBookTypeKey =
  | "line"
  | "blank"
  | "grammar"
  | "vocab"
  | "order"
  | "tf"
  | "writing"
  | "link"
  | "sequence"
  | "insert"
  | "summary"
  | "grammarFix"
  | "words";

export const TEST_BOOK_TYPES: Array<{ key: TestBookTypeKey; label: string; basic: boolean; hint: string }> = [
  { key: "line", label: "한줄해석", basic: true, hint: "문장을 보고 해석 쓰기" },
  { key: "blank", label: "빈칸", basic: true, hint: "해석을 보고 핵심어 채우기" },
  { key: "grammar", label: "어법선택", basic: true, hint: "[ 바른 형태 / 틀린 형태 ] 고르기" },
  { key: "vocab", label: "어휘선택", basic: true, hint: "[ 문맥에 맞는 말 / 반대말 ] 고르기" },
  { key: "order", label: "중요문장 어순배열", basic: true, hint: "워크북과 같은 덩어리, 섞는 순서만 새로" },
  { key: "tf", label: "T/F", basic: true, hint: "바꿔 쓴 문장으로 참·거짓" },
  { key: "writing", label: "통문장 영작", basic: true, hint: "중요문장 해석만 보고 영어로 쓰기" },
  { key: "link", label: "연결어 빈칸", basic: true, hint: "However·Therefore 같은 연결어 채우기" },
  { key: "sequence", label: "문장 순서", basic: false, hint: "주어진 글 뒤 (A)~(E) 순서 맞추기" },
  { key: "insert", label: "문장 삽입", basic: false, hint: "중요문장이 들어갈 자리 고르기" },
  { key: "summary", label: "요약문 완성", basic: false, hint: "요약 한 문장의 핵심어 채우기" },
  { key: "grammarFix", label: "어법 서술형", basic: false, hint: "틀린 곳 찾아 고쳐 쓰기" },
  { key: "words", label: "단어 영↔한", basic: false, hint: "단어 정리 범위에서 뜻·철자 쓰기" },
];

export const ALL_TEST_BOOK_TYPES: TestBookTypeKey[] = TEST_BOOK_TYPES.map((t) => t.key);
export const BASIC_TEST_BOOK_TYPES: TestBookTypeKey[] = TEST_BOOK_TYPES.filter((t) => t.basic).map((t) => t.key);

export function testBookTypeLabel(key: TestBookTypeKey): string {
  return TEST_BOOK_TYPES.find((t) => t.key === key)?.label ?? key;
}

/** 저장값을 읽는다. 모르는 값은 버리고, 차례는 유형 목록 차례로 맞춘다. */
export function normalizeTestBookTypes(raw: unknown, fallback = BASIC_TEST_BOOK_TYPES): TestBookTypeKey[] {
  if (!Array.isArray(raw)) return [...fallback];
  const on = new Set(raw.map(String));
  return ALL_TEST_BOOK_TYPES.filter((k) => on.has(k));
}

// ---------------------------------------------------------------- 재료

/** 단어 정리 한 줄. 동의어·반의어는 핵심어(key)에만 붙는다. */
export type TestBookVocabRow = {
  word: string;
  /** n. v. a. ad. 구 … */
  pos: string;
  /** 지문 속 뜻 */
  meaning: string;
  synonyms: string[];
  antonyms: string[];
  /** 품사가 다른 형태(파생어) — 「명사형은?」 시험에 쓴다 */
  forms: Array<{ word: string; pos: string }>;
  /** 시험에 나올 어구(없으면 빈 문자열) */
  phrase: string;
  /** 내용상 핵심어이거나 바꿔 쓰기로 나올 만한 단어 */
  key: boolean;
};

export type TestBookMaterial = {
  version: string;
  sourceHash: string;
  vocab: TestBookVocabRow[];
  /** 단어 정리 규칙 버전(없으면 tv-1: 파생어 품사 표기가 다르면 버리던 때) */
  vocabVersion?: string;
  /** 워크북 「중요문장 어순배열」과 같은 규칙으로 고른 문장(0부터, 지문 차례) */
  keyIndexes: number[];
  /** 문장마다 어순 덩어리(원래 차례). 워크북과 같은 캐시에서 온다. 못 나눈 문장은 null. */
  chunks: Array<string[] | null>;
  /** 교과서 지문이면 그 과(「공통영어1|NE능률(민병천)|1」)와 단원문법이 든 문장(0부터) */
  unitKey?: string | null;
  unitHits?: Array<{ si: number; grammar: string[] }>;
  /** 구문·구조가 어려운 문장(0부터, 단원문법 문장 빼고 2개까지) — key-sentence-analysis */
  hardHits?: Array<{ si: number; structures: string[] }>;
  /** 문장마다 직독직해 덩어리(원문 조각 + 뜻). 못 만든 문장은 null — 한줄해석 「직독직해」에 쓴다 */
  chunkGloss?: Array<Array<{ en: string; ko: string }> | null>;
  createdAt: string;
};

/** 영어 원문 해시(재료가 옛 원문으로 만든 것인지 가린다). 해시에는 그 재료의 버전이 섞인다. */
export function testBookSourceHash(englishLines: string[], version: string = TEST_BOOK_MATERIAL_VERSION): string {
  const joined = englishLines
    .map((t) => formatWorkbookPassage(t).toLowerCase())
    .filter(Boolean)
    .join("\n");
  let out = "";
  for (let i = 0; i < 3; i++) {
    out += hashSeedToUint32(`${joined}#tb#${version}#${i}`).toString(16).padStart(8, "0");
  }
  return out;
}

/** 지금 원문으로 만든 재료인가(버전은 따지지 않는다) — 단어 정리를 다시 쓸 수 있는지 */
export function isTestBookMaterialSameSource(
  material: TestBookMaterial | null | undefined,
  englishLines: string[]
): material is TestBookMaterial {
  return !!material?.version && material.sourceHash === testBookSourceHash(englishLines, material.version);
}

export function isTestBookMaterialFresh(
  material: TestBookMaterial | null | undefined,
  englishLines: string[]
): material is TestBookMaterial {
  return material?.version === TEST_BOOK_MATERIAL_VERSION && isTestBookMaterialSameSource(material, englishLines);
}

/**
 * 단어 정리 핵심어의 동의어·반의어에 1장 자료 핵심어의 것(같은 낱말일 때만)을 더한다. 모델은 부르지 않는다.
 * 단어 정리 모델이 하나만 고르는 일이 많았다(선생님 2026-10-20: 여러 개일 수 있는데 한 개만 — 억지로는 말고).
 * 핵심어가 아닌 줄이나 1장 자료에 없는 낱말은 그대로 둔다.
 */
export function mergeTestBookVocabHints(
  material: TestBookMaterial,
  content: OnePageContent | null | undefined
): TestBookMaterial {
  if (!content?.vocab?.length) return material;
  const hints = new Map(content.vocab.map((v) => [v.surface.trim().toLowerCase(), v] as const));
  const merge = (own: string[], more: string[], word: string) => {
    const seen = new Set([word.trim().toLowerCase()]);
    return [...own, ...more]
      .map((w) => w.trim())
      .filter((w) => {
        const k = w.toLowerCase();
        if (!w || seen.has(k)) return false;
        seen.add(k);
        return true;
      })
      .slice(0, 3);
  };
  return {
    ...material,
    vocab: material.vocab.map((r) => {
      const h = r.key ? hints.get(r.word.trim().toLowerCase()) : undefined;
      if (!h) return r;
      return { ...r, synonyms: merge(r.synonyms, h.synonyms, r.word), antonyms: merge(r.antonyms, h.antonyms, r.word) };
    }),
  };
}

/** 화면에 넘기는 지문 하나 */
export type TestBookProjectInput = {
  id: string;
  title: string;
  titleEn: string | null;
  source: string | null;
  sentences: Array<{ english: string; korean: string }>;
  /** 1장 자료 재료(지금 원문으로 만든 것만). 없으면 화면이 준비한다. */
  content: OnePageContent | null;
  /** 테스트 교재 재료(지금 원문으로 만든 것만) */
  material: TestBookMaterial | null;
  /** 수업자료 분석서(있으면 「분석 자료」에 싣는다) */
  analysis?: AnalysisReportData | null;
  /** 워크북 어법 선택(저장된 것). 있으면 어법선택을 워크북과 같은 문항으로 싣는다. */
  grammarChoice?: WorkbookGrammarChoiceSection | null;
};

export function isTestBookProjectReady(
  p: TestBookProjectInput
): p is TestBookProjectInput & { content: OnePageContent; material: TestBookMaterial } {
  return !!p.content && !!p.material;
}

// ---------------------------------------------------------------- 교재 설정(파일 payload)

export type TestBookTranslationMode = "show" | "hide" | "back";

/*
 * 교재 차례(선생님 2026-10-20): 표지 → 목차 → 학습 계획표·이수표 → 수업용 자료 → 백지노트 →
 * 분석 자료 → 테스트지 자료 → 정답지. 묶음마다 넣고 뺄 수 있고, 테스트지 자료는 안에서 다시 고른다.
 */
/** 테스트 교재 시안 01(색 번짐) 표지 id. 나머지는 최종통합자료 표지(COVER_PRESETS)를 그대로 쓴다. */
export const TEST_BOOK_BLEED_COVER = "tb-bleed";

/** 표지 글자(최종통합자료 표지와 같은 칸). 비어 있으면 교재 이름·범위·학원명으로 채운다. */
export type TestBookCover = {
  presetId: string;
  /** 위 라벨(시험 범위 등) */
  label: string;
  /** 큰 제목(줄바꿈 가능) */
  title: string;
  /** 제목 아래·꼬릿말(줄바꿈 가능) */
  progress: string;
  academy: string;
  /** 색 번짐 표지의 큰 글자(줄바꿈 가능). 비우면 「read. / test. / note.」 */
  headline: string;
};

/** 색 번짐 표지 큰 글자 기본값 */
export const TEST_BOOK_DEFAULT_HEADLINE = "read.\ntest.\nnote.";

export type TestBookOptions = {
  /** 테스트지 자료 · 테스트 견본에 싣는 유형 */
  types: TestBookTypeKey[];
  /** 수업용 자료 해석: 있음 · 지움(쓸 줄) · 뒤쪽에 모음 */
  translation: TestBookTranslationMode;
  /** 통문장 영작: 모든 문장 · 중요문장만 */
  writing: WritingScope;
  /** 한줄해석: 전체 해석 · 직독직해 */
  lineMode: LineMode;
  /** 표지 */
  cover: boolean;
  /** 표지 모양·글자 */
  coverInfo: TestBookCover;
  /** 목차(묶음마다 쪽 범위) */
  toc: boolean;
  /** 묶음마다 간지(지문별 시작 쪽) — 목차를 켰을 때 */
  dividers: boolean;
  /** 묶음 안에서 지문마다 간지 */
  passageDividers: boolean;
  /** 학습 계획표·이수표 */
  plan: boolean;
  /** 수업용 자료: 지문마다 단어 정리 + 문장별 해석 */
  lesson: boolean;
  /** 수업용 자료 앞 전체 단어장(지문 단어를 한데 모음) */
  allVocab: boolean;
  /** 지문마다 백지노트 2쪽 */
  blankNote: boolean;
  /** 분석 자료: 지문마다 분석서(분석서가 있는 지문만) */
  analysis: boolean;
  /** 분석 자료 모양 — 분석서 화면의 A(교재 세리프)·B(산세리프)·C(클래식 인쇄) */
  analysisStyle: "a" | "b" | "c";
  /** 분석 자료 해석 — 전체 해석 · 직독직해 */
  analysisTranslation: "full" | "chunk";
  /** 테스트지 자료 */
  tests: boolean;
  /** 테스트지 자료 · 맨 앞 전체 단어 TEST */
  allWordTest: boolean;
  /** 테스트지 자료 · 지문마다 동반의어·품사 TEST */
  wordTest: boolean;
  /** 맨 뒤 정답지 */
  answers: boolean;
};

export const DEFAULT_TEST_BOOK_OPTIONS: TestBookOptions = {
  types: BASIC_TEST_BOOK_TYPES,
  translation: "hide",
  writing: "all",
  lineMode: "full",
  cover: true,
  coverInfo: { presetId: TEST_BOOK_BLEED_COVER, label: "", title: "", progress: "", academy: "", headline: "" },
  toc: true,
  dividers: true,
  passageDividers: true,
  plan: true,
  lesson: true,
  allVocab: true,
  blankNote: true,
  analysis: true,
  analysisStyle: "a",
  analysisTranslation: "full",
  tests: true,
  allWordTest: true,
  wordTest: true,
  answers: true,
};

export function normalizeTestBookOptions(raw: unknown): TestBookOptions {
  const r = (raw ?? {}) as Partial<Record<keyof TestBookOptions, unknown>>;
  const t = r.translation;
  return {
    types: normalizeTestBookTypes(r.types),
    translation: t === "show" || t === "hide" || t === "back" ? t : DEFAULT_TEST_BOOK_OPTIONS.translation,
    writing: r.writing === "key" ? "key" : "all",
    lineMode: r.lineMode === "chunk" ? "chunk" : "full",
    cover: r.cover !== false,
    coverInfo: (() => {
      const c = (r.coverInfo ?? {}) as Partial<Record<keyof TestBookCover, unknown>>;
      const str = (v: unknown) => (typeof v === "string" ? v.slice(0, 300) : "");
      return {
        presetId: str(c.presetId) || TEST_BOOK_BLEED_COVER,
        label: str(c.label),
        title: str(c.title),
        progress: str(c.progress),
        academy: str(c.academy),
        headline: str(c.headline),
      };
    })(),
    toc: r.toc !== false,
    dividers: r.dividers !== false,
    passageDividers: r.passageDividers !== false,
    plan: r.plan !== false,
    lesson: r.lesson !== false,
    allVocab: r.allVocab !== false,
    blankNote: r.blankNote !== false,
    analysis: r.analysis !== false,
    analysisStyle: r.analysisStyle === "b" || r.analysisStyle === "c" ? r.analysisStyle : "a",
    analysisTranslation: r.analysisTranslation === "chunk" ? "chunk" : "full",
    tests: r.tests !== false,
    // 예전 파일은 전체 단어장과 TEST를 한 칸(allVocab)으로 켜고 껐다
    allWordTest: r.allWordTest === undefined ? r.allVocab !== false : r.allWordTest !== false,
    wordTest: r.wordTest !== false,
    answers: r.answers !== false,
  };
}

// ---------------------------------------------------------------- 문항 모양

/** 한 줄 안의 조각: 글자 · 빈칸(번호) · 고르기 [왼쪽 / 오른쪽] */
/** 빈칸·고르기의 n은 지문 안 번호(워크북 모양: 빈칸 ¹____, 고르기 ①[A / B]) */
export type TestSeg = string | { blank: string; n?: string } | { pick: [string, string]; n?: string };

export type TestItem = {
  /** (1) (2) … 또는 A B */
  no: string;
  text: TestSeg[];
  /** 함께 주는 해석 */
  ko?: string;
  /** 어순배열 덩어리(섞은 차례) */
  chunks?: string[];
  /** 직독직해 덩어리(원래 차례) — 덩어리마다 아래에 뜻 쓸 칸 */
  gloss?: string[];
  /** 문장 앞에 주는 말(어순배열: In other words, …) */
  lead?: string;
  /** 영작 조건 */
  hint?: string;
  /** 문항 위 작은 꼬리표(단원문법) */
  tag?: string;
  /** 쓸 줄 수 */
  lines?: number;
  /** T/F 칸 */
  tf?: boolean;
  answer: string;
};

export type TestSection = {
  type: TestBookTypeKey;
  title: string;
  /** 발문 옆 짧은 안내 */
  hint?: string;
  /** 보기 상자 */
  box?: string[];
  /** 문항 앞에 놓는 글(문장 순서의 주어진 글, 문장 삽입의 주어진 문장) */
  given?: string;
  /** 지문을 통째로 싣는 유형(연결어·삽입·요약문, 빈칸·어법선택·어휘선택) */
  passage?: TestSeg[];
  /** 지문 아래 [해석](빈칸) */
  passageKo?: string;
  /** 문항이 지문 안에 번호로 들어 있다 — 문항 줄을 따로 그리지 않는다(정답·점수는 items로) */
  inline?: boolean;
  items: TestItem[];
  /** 지문형 유형의 정답(문항이 하나로 묶인 경우) */
  answer?: string;
};

export type TestSheet = {
  projectId: string;
  title: string;
  source: string | null;
  sections: TestSection[];
};

const CIRCLED = "①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳";
const no = (i: number) => `(${i + 1})`;

// ---------------------------------------------------------------- 조립

export type BlankMode = "same" | "diff";
/** 한줄해석: 문장 전체를 해석 · 덩어리마다 직독직해 */
export type LineMode = "full" | "chunk";
/** 통문장 영작 범위: 모든 문장 · 중요문장(단원문법·어려운 구문·핵심 문장)만 */
export type WritingScope = "all" | "key";

type Ready = TestBookProjectInput & { content: OnePageContent; material: TestBookMaterial };

function words(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function clean(text: string): string {
  return stripLeadingSentenceMarkers(formatWorkbookPassage(text));
}

/** 정해진 열쇠로 섞은 뒤 앞에서 n개 */
function pickN<T>(items: T[], n: number, seed: string): T[] {
  if (items.length <= n) return fisherYatesShuffle(items, createSeededRng(seed));
  return fisherYatesShuffle(items, createSeededRng(seed)).slice(0, n);
}

/** 고른 것을 지문 차례로 */
function bySentence<T extends { si: number; at?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.si - b.si || (a.at ?? 0) - (b.at ?? 0));
}

/** 문장 안 낱말 자리를 찾아 앞·뒤로 나눈다 */
function splitAt(sentence: string, phrase: string): { before: string; hit: string; after: string } | null {
  const at = findPhrase(sentence, phrase);
  if (!at) return null;
  return { before: sentence.slice(0, at.start), hit: sentence.slice(at.start, at.end), after: sentence.slice(at.end) };
}

/** 대소문자를 원문 자리에 맞춘다(문장 첫 낱말이면 대문자) */
function matchCase(model: string, word: string): string {
  if (!model || !word) return word;
  return /^[A-Z]/.test(model) && /^[a-z]/.test(word) ? word[0]!.toUpperCase() + word.slice(1) : word;
}

const LINK_WORDS = [
  "However",
  "Therefore",
  "Thus",
  "For example",
  "For instance",
  "In other words",
  "In addition",
  "Moreover",
  "Furthermore",
  "As a result",
  "In fact",
  "Instead",
  "Nevertheless",
  "Similarly",
  "On the other hand",
  "In contrast",
  "That is",
  "Otherwise",
  "Consequently",
  "Yet",
  "Still",
  "Besides",
  "Likewise",
  "Meanwhile",
  "Accordingly",
  "Hence",
  "Finally",
  "In short",
  "Above all",
];

const LINK_RE = new RegExp(`^(${LINK_WORDS.map((w) => w.replace(/\s+/g, "\\s+")).join("|")})\\b\\s*,?`, "");

type Cand = { si: number; at?: number; key: string };

function blankCandidates(p: Ready): Array<Cand & { phrase: string }> {
  const out: Array<Cand & { phrase: string }> = [];
  const seen = new Set<string>();
  const add = (si: number, phrase: string) => {
    const s = p.sentences[si];
    if (!s || !s.korean.trim() || !phrase.trim()) return;
    const hit = findPhrase(clean(s.english), phrase);
    if (!hit) return;
    const k = `${si}|${phrase.toLowerCase()}`;
    if (seen.has(k)) return;
    seen.add(k);
    out.push({ si, at: hit.start, key: k, phrase });
  };
  for (const v of p.content.vocab) add(v.sentenceIndex, v.surface);
  // 단어 정리의 핵심어가 나온 문장
  for (const row of p.material.vocab.filter((r) => r.key)) {
    const si = p.sentences.findIndex((s) => findPhrase(clean(s.english), row.word));
    if (si >= 0) add(si, row.word);
  }
  return out;
}

/** 교재 견본(열쇠가 book)은 지문 차례, 뽑기는 문장 차례를 섞는다 */
function arrange<T>(items: T[], seed: string): T[] {
  return seed.startsWith("book|") ? items : fisherYatesShuffle(items, createSeededRng(`${seed}|arrange`));
}

/*
 * 선생님 요청(2026-10-19): 중요문장 어순배열만 중요문장으로 하고, 나머지 유형은 지문 전체를 다룬다
 * (한줄해석·빈칸·영작은 모든 문장, 어법·어휘·T/F·연결어는 만들어 둔 것을 모두).
 */
function buildLine(p: Ready, seed: string, mode: LineMode = "full"): TestSection | null {
  const all = p.sentences.map((s, si) => ({ si, s })).filter(({ s }) => s.korean.trim() && words(s.english) >= 3);
  if (!all.length) return null;
  // 직독직해(선생님 2026-10-20): 덩어리마다 아래에 뜻을 쓴다. 덩어리를 못 만든 문장은 전체 해석으로.
  const gloss = mode === "chunk" ? p.material.chunkGloss : undefined;
  return {
    type: "line",
    title: "한줄해석",
    hint: mode === "chunk" ? "끊어 읽는 덩어리마다 뜻 쓰기" : undefined,
    items: arrange(all, seed).map(({ s, si }, i) => {
      const g = gloss?.[si];
      if (g?.length) {
        return { no: no(i), text: [], gloss: g.map((c) => c.en), answer: g.map((c) => c.ko).join(" / ") };
      }
      return { no: no(i), text: [clean(s.english)], lines: words(s.english) > 22 ? 2 : 1, answer: s.korean };
    }),
  };
}

const STOP = new Set(
  "about above after again against because before being below between could during every their there these those through under until where which while would should other another however therefore people".split(" ")
);

/** 후보가 없는 문장의 빈칸: 문장에서 가장 긴 내용어(고유명사·기능어 빼고) */
function fallbackBlank(sentence: string): string | null {
  const ws = sentence.match(/[A-Za-z][a-z]+(?:-[a-z]+)*/g) ?? [];
  const firstWord = sentence.match(/[A-Za-z]+/)?.[0];
  const cands = ws.filter((w) => w.length >= 5 && !STOP.has(w.toLowerCase()) && (/^[a-z]/.test(w) || w === firstWord));
  if (!cands.length) return null;
  return [...cands].sort((x, y) => y.length - x.length)[0]!;
}

/**
 * 문장마다 빈칸 하나. 「같은 자리」는 교재 견본과 같은 낱말, 「다른 자리」는 그 문장의 다른 후보.
 * 워크북 빈칸과 같은 모양으로 지문을 통째로 싣고 아래에 [해석]을 둔다(선생님 2026-10-20).
 */
function buildBlank(p: Ready, seed: string, mode: BlankMode): TestSection | null {
  const pool = blankCandidates(p);
  const passage: TestSeg[] = [];
  const items: TestItem[] = [];
  p.sentences.forEach((s, si) => {
    const sentence = clean(s.english);
    if (!sentence) return;
    if (passage.length) passage.push(" ");
    let phrase: string | null = null;
    if (s.korean.trim()) {
      const mine = pool.filter((c) => c.si === si);
      if (!mine.length) phrase = fallbackBlank(sentence);
      else {
        const bookOne = pickN(mine, 1, `book|${p.id}|blank|${si}`)[0]!;
        const others = mine.filter((c) => c.key !== bookOne.key);
        phrase = (mode === "diff" && others.length ? pickN(others, 1, `${seed}|blank|${si}`)[0]! : bookOne).phrase;
      }
    }
    const part = phrase ? splitAt(sentence, phrase) : null;
    if (!part) {
      passage.push(sentence);
      return;
    }
    const n = String(items.length + 1);
    passage.push(part.before, { blank: "", n }, part.after);
    items.push({ no: `${n}.`, text: [], answer: part.hit });
  });
  if (!items.length) return null;
  return {
    type: "blank",
    title: "빈칸",
    hint: "해석을 보고 빈칸 채우기",
    passage,
    passageKo: p.sentences.map((s) => s.korean.trim()).filter(Boolean).join(" "),
    inline: true,
    items,
  };
}

type PickCand = Cand & { before: string; right: string; wrong: string; after: string };

function grammarCandidates(p: Ready): PickCand[] {
  const out: PickCand[] = [];
  p.content.grammar.forEach((g, gi) => {
    if (!g.right || !g.wrong || g.right === g.wrong) return;
    const s = p.sentences[g.sentenceIndex];
    if (!s) return;
    const sentence = clean(s.english);
    const target = findPhrase(sentence, g.target);
    if (!target) return;
    const inside = findPhrase(sentence.slice(target.start, target.end), g.right);
    if (!inside) return;
    const start = target.start + inside.start;
    const end = target.start + inside.end;
    out.push({
      si: g.sentenceIndex,
      at: start,
      key: `g${gi}`,
      before: sentence.slice(0, start),
      right: sentence.slice(start, end),
      wrong: matchCase(sentence.slice(start, end), g.wrong),
      after: sentence.slice(end),
    });
  });
  return out;
}

function vocabCandidates(p: Ready): PickCand[] {
  const out: PickCand[] = [];
  p.content.vocab.forEach((v, vi) => {
    const ant = v.antonyms.find((a) => a.trim() && words(a) <= 2);
    const s = p.sentences[v.sentenceIndex];
    if (!ant || !s) return;
    const part = splitAt(clean(s.english), v.surface);
    if (!part) return;
    if (out.some((o) => o.right.toLowerCase() === part.hit.toLowerCase())) return;
    out.push({ si: v.sentenceIndex, at: part.before.length, key: `v${vi}`, before: part.before, right: part.hit, wrong: matchCase(part.hit, ant), after: part.after });
  });
  return out;
}

function pickSection(
  p: Ready,
  type: "grammar" | "vocab",
  title: string,
  hint: string,
  pool: PickCand[],
  seed: string
): TestSection | null {
  const chosen = bySentence(pool);
  if (!chosen.length) return null;
  // 한 문장에 고르기 자리가 여럿이면 문장을 한 번만 싣고 괄호를 여러 개 넣는다(겹치는 자리는 앞의 것만)
  const bySi = new Map<number, PickCand[]>();
  for (const c of chosen) {
    const list = bySi.get(c.si) ?? [];
    const end = (x: PickCand) => (x.at ?? 0) + x.right.length;
    if (!list.some((x) => (c.at ?? 0) < end(x) && (x.at ?? 0) < end(c))) list.push(c);
    bySi.set(c.si, list);
  }
  // 워크북 어법·어휘 선택과 같은 모양: 지문을 통째로 싣고 고르기 자리에 ①[A / B](선생님 2026-10-20)
  const passage: TestSeg[] = [];
  const items: TestItem[] = [];
  p.sentences.forEach((s, si) => {
    const cands = bySi.get(si);
    const sentence = cands ? cands[0]!.before + cands[0]!.right + cands[0]!.after : clean(s.english);
    if (!sentence) return;
    if (passage.length) passage.push(" ");
    if (!cands) {
      passage.push(sentence);
      return;
    }
    let cursor = 0;
    for (const c of [...cands].sort((x, y) => (x.at ?? 0) - (y.at ?? 0))) {
      const at = c.at ?? c.before.length;
      passage.push(sentence.slice(cursor, at));
      const n = circled(items.length);
      const left = hashSeedToUint32(`${seed}|${c.key}|side`) % 2 === 0;
      passage.push({ pick: left ? [c.right, c.wrong] : [c.wrong, c.right], n });
      items.push({ no: n, text: [], answer: c.right });
      cursor = at + c.right.length;
    }
    passage.push(sentence.slice(cursor));
  });
  return { type, title, hint, passage, inline: true, items };
}

/**
 * 어법선택을 워크북 어법 선택 문항 그대로(선생님 2026-10-20: 퀄리티가 안 나온다, 워크북 참고).
 * 지문·고르기 자리·바른 말은 워크북과 같고, 뽑기는 열쇠에 따라 [A / B] 좌우만 바꾼다.
 */
function workbookGrammarSection(p: Ready, seed: string): TestSection | null {
  const gc = p.grammarChoice;
  if (!gc?.segments?.length || !gc.items?.length) return null;
  const byNo = new Map(gc.items.map((it) => [it.number, it] as const));
  const book = seed.startsWith("book|");
  const passage: TestSeg[] = [];
  const items: TestItem[] = [];
  for (const seg of gc.segments) {
    if (seg.type === "text") {
      passage.push(seg.text);
      continue;
    }
    const it = byNo.get(seg.number);
    const n = circled(seg.number - 1);
    const swap = !book && hashSeedToUint32(`${seed}|wgc|${seg.number}`) % 2 === 1;
    passage.push({ pick: swap ? [seg.rightText, seg.leftText] : [seg.leftText, seg.rightText], n });
    items.push({ no: n, text: [], answer: it?.correctText ?? "" });
  }
  return { type: "grammar", title: "어법선택", hint: "알맞은 것에 ○", passage, inline: true, items };
}

/** 어순배열: 같은 덩어리를 섞는다. 원래 차례·뒤집은 차례와 같으면 다시 섞는다. */
function shuffleChunks(chunks: string[], seed: string): string[] {
  for (let attempt = 0; attempt < 12; attempt++) {
    const out = fisherYatesShuffle(chunks, createSeededRng(`${seed}#${attempt}`));
    const same = out.every((c, i) => c === chunks[i]);
    const reversed = out.every((c, i) => c === chunks[chunks.length - 1 - i]);
    if (!same && !(reversed && chunks.length > 2)) return out;
  }
  return [...chunks.slice(1), chunks[0]!];
}

/** 첫 덩어리가 연결어(In other words,)면 주고 나머지만 섞는다 */
function splitLead(chunks: string[]): { lead: string; rest: string[] } {
  const first = chunks[0] ?? "";
  if (chunks.length > 3 && LINK_RE.test(first) && first.replace(LINK_RE, "").trim() === "") {
    return { lead: first, rest: chunks.slice(1) };
  }
  return { lead: "", rest: chunks };
}

/** 어순배열에 쓸 중요문장(같은 시험지의 영작이 이 문장을 피한다) */
function orderPicks(p: Ready, seed: string): Array<{ si: number; chunks: string[] }> {
  const pool = p.material.keyIndexes
    .map((si) => ({ si, chunks: p.material.chunks[si] }))
    .filter((x): x is { si: number; chunks: string[] } => !!x.chunks && x.chunks.length >= 3 && !!p.sentences[x.si]?.korean.trim());
  // 선생님 2026-10-20: 단원문법이 든 문장은 꼭(5개까지), 구문·구조가 어려운 문장도(2개까지).
  // 둘 다 없는 지문만 다른 중요문장으로 2개.
  const unit = new Set((p.material.unitHits ?? []).map((h) => h.si));
  const hard = new Set((p.material.hardHits ?? []).map((h) => h.si));
  const withUnit = pool.filter((x) => unit.has(x.si)).slice(0, 5);
  const withHard = pool.filter((x) => hard.has(x.si) && !unit.has(x.si)).slice(0, 2);
  if (withUnit.length || withHard.length) return bySentence([...withUnit, ...withHard]);
  return bySentence(pickN(pool, 2, `${seed}|order`));
}

function buildOrder(p: Ready, seed: string): TestSection | null {
  const chosen = orderPicks(p, seed);
  if (!chosen.length) return null;
  return {
    type: "order",
    title: "중요문장 어순배열",
    hint: "해석에 맞게 배열하기",
    items: chosen.map((c, i) => {
      const { lead, rest } = splitLead(c.chunks);
      const grammar = p.material.unitHits?.find((h) => h.si === c.si)?.grammar ?? [];
      const structures = p.material.hardHits?.find((h) => h.si === c.si)?.structures ?? [];
      return {
        no: no(i),
        text: [],
        tag: grammar.length
          ? `단원문법 · ${grammar.join(" · ")}`
          : structures.length
            ? `어려운 구문 · ${structures.slice(0, 3).join(" · ")}`
            : undefined,
        ko: p.sentences[c.si]!.korean,
        lead: lead || undefined,
        chunks: shuffleChunks(rest, `${seed}|order|${c.si}`),
        lines: 1,
        answer: answerSentence(p.sentences[c.si]!.english),
      };
    }),
  };
}

function buildTf(p: Ready, seed: string): TestSection | null {
  const all = p.content.tf.filter((t) => t.statement.trim());
  if (!all.length) return null;
  const order = fisherYatesShuffle(all, createSeededRng(`${seed}|tf`));
  return {
    type: "tf",
    title: "T/F",
    hint: "지문 내용과 맞으면 T, 틀리면 F",
    items: order.map((x, i) => ({ no: no(i), text: [x.statement], tf: true, answer: x.answer })),
  };
}

/** 통문장 영작: 모든 문장 또는 중요문장만(선생님 2026-10-20 — 고르게) */
function buildWriting(p: Ready, seed: string, scope: WritingScope): TestSection | null {
  const key = new Set(p.material.keyIndexes);
  const all = p.sentences
    .map((s, si) => ({ si, s }))
    .filter(({ s, si }) => s.korean.trim() && words(s.english) >= 3 && (scope === "all" || key.has(si)));
  if (!all.length) return null;
  return {
    type: "writing",
    title: "통문장 영작",
    hint: "해석만 보고 영어로 쓰기",
    items: arrange(all, seed).map(({ s }, i) => {
      const answer = answerSentence(s.english);
      return { no: no(i), text: [], ko: s.korean, hint: `${words(answer)}단어`, lines: words(answer) > 16 ? 2 : 1, answer };
    }),
  };
}

function buildLink(p: Ready, seed: string): TestSection | null {
  const hits: Array<{ si: number; word: string; rest: string }> = [];
  p.sentences.forEach((s, si) => {
    const text = clean(s.english);
    const m = text.match(LINK_RE);
    if (!m) return;
    const word = m[1]!.replace(/\s+/g, " ");
    hits.push({ si, word, rest: text.slice(m[0].length).trimStart() });
  });
  if (!hits.length) return null;
  const chosen = hits;
  const labels = "ABCDEFGHIJ";
  const used = new Set(chosen.map((h) => h.si));
  const passage: TestSeg[] = [];
  let k = 0;
  p.sentences.forEach((s, si) => {
    if (passage.length) passage.push(" ");
    if (used.has(si)) {
      const h = chosen.find((x) => x.si === si)!;
      passage.push({ blank: `(${labels[k++]})` }, `, ${h.rest}`);
    } else {
      passage.push(clean(s.english));
    }
  });
  const answers = chosen.map((h) => h.word);
  const distractors = pickN(
    LINK_WORDS.filter((w) => !answers.some((a) => a.toLowerCase() === w.toLowerCase())),
    Math.max(2, Math.min(4, 6 - answers.length)),
    `${seed}|linkbox`
  );
  return {
    type: "link",
    title: "연결어 빈칸",
    hint: "보기에서 골라 쓰기",
    box: fisherYatesShuffle([...answers, ...distractors], createSeededRng(`${seed}|linkboxorder`)),
    passage,
    items: [],
    answer: chosen.map((h, i) => `(${labels[i]}) ${h.word}`).join("  "),
  };
}

function buildSequence(p: Ready, seed: string): TestSection | null {
  const order = buildOnePageSentenceOrder(
    p.sentences.map((s) => s.english),
    `${p.id}|${seed}`
  );
  if (!order) return null;
  return {
    type: "sequence",
    title: "문장 순서",
    hint: "주어진 글 다음에 이어질 순서",
    given: order.given,
    items: order.items.map((it) => ({ no: `(${it.label})`, text: [it.text], answer: "" })),
    answer: order.answer.map((l) => `(${l})`).join(" - "),
  };
}

function buildInsert(p: Ready, seed: string): TestSection | null {
  const n = p.sentences.length;
  if (n < 4) return null;
  const pool = p.material.keyIndexes.filter((si) => si > 0);
  const fromExam = p.content.examPoints?.find((e) => e.kind === "insert")?.sentenceIndex;
  const candidates = pool.length ? pool : fromExam != null && fromExam > 0 ? [fromExam] : [];
  if (!candidates.length) return null;
  const si = pickN(candidates, 1, `${seed}|insert`)[0]!;
  const rest = p.sentences.map((s, i) => ({ i, text: clean(s.english) })).filter((x) => x.i !== si);
  // 자리: 남은 문장 사이(첫 문장 뒤부터). 정답 자리를 넣고 다섯 자리까지.
  const gaps = rest.map((_, k) => k).filter((k) => k >= 1);
  const correctGap = rest.findIndex((x) => x.i > si);
  const answerGap = correctGap < 0 ? rest.length : correctGap;
  const others = pickN(gaps.filter((g) => g !== answerGap), 4, `${seed}|insertgaps`);
  const marks = [...new Set([answerGap, ...others])].sort((a, b) => a - b).slice(0, 5);
  const passage: TestSeg[] = [];
  rest.forEach((x, k) => {
    const m = marks.indexOf(k);
    if (m >= 0) passage.push(` ( ${CIRCLED[m]} ) `);
    else if (passage.length) passage.push(" ");
    passage.push(x.text);
  });
  const endMark = marks.indexOf(rest.length);
  if (endMark >= 0) passage.push(` ( ${CIRCLED[endMark]} )`);
  return {
    type: "insert",
    title: "문장 삽입",
    hint: "주어진 문장이 들어갈 곳",
    given: clean(p.sentences[si]!.english),
    passage,
    items: [],
    answer: CIRCLED[marks.indexOf(answerGap)] ?? "",
  };
}

function buildSummary(p: Ready): TestSection | null {
  const kws = p.content.summaryKeywords.slice(0, 3);
  if (!p.content.summaryEn.trim() || !kws.length) return null;
  const labels = "ABC";
  const parts = splitSummaryByKeywords(p.content.summaryEn, kws);
  const passage: TestSeg[] = parts.map((x) => (x.keywordIndex == null ? x.text : { blank: `(${labels[x.keywordIndex]})` }));
  const answers = parts.filter((x) => x.keywordIndex != null).map((x) => `(${labels[x.keywordIndex!]}) ${x.text}`);
  if (!answers.length) return null;
  return {
    type: "summary",
    title: "요약문 완성",
    hint: "지문을 한 문장으로 요약할 때 빈칸에 알맞은 말",
    passage,
    items: [],
    answer: answers.join("  "),
  };
}

function buildGrammarFix(p: Ready, seed: string, skip: Set<string>): TestSection | null {
  void seed;
  const chosen = bySentence(grammarCandidates(p).filter((c) => !skip.has(c.key)));
  if (!chosen.length) return null;
  return {
    type: "grammarFix",
    title: "어법 서술형",
    hint: "틀린 곳을 찾아 바르게 고쳐 쓰기",
    items: chosen.map((c, i) => ({ no: no(i), text: [c.before + c.wrong + c.after], lines: 1, answer: `${c.wrong} → ${c.right}` })),
  };
}

function buildWords(p: Ready, seed: string): TestSection | null {
  const rows = p.material.vocab.filter((r) => r.word && r.meaning);
  const chosen = arrange(rows, seed);
  if (!chosen.length) return null;
  return {
    type: "words",
    title: "단어 영↔한",
    hint: "영어는 뜻을, 뜻은 영어를 쓰기",
    items: chosen.map((r, i) => {
      const en2ko = hashSeedToUint32(`${seed}|w|${r.word}`) % 2 === 0;
      return { no: no(i), text: [en2ko ? r.word : r.meaning], lines: 0, answer: en2ko ? r.meaning : r.word };
    }),
  };
}

/**
 * 지문 하나로 테스트지를 조립한다. seed가 같으면 같은 시험지가 나온다(교재 견본은 "book").
 * 재료가 모자라 못 만드는 유형은 빠진다.
 */
export function buildTestSheet(
  p: Ready,
  types: TestBookTypeKey[],
  opts: { seed: string; blankMode?: BlankMode; writing?: WritingScope; lineMode?: LineMode }
): TestSheet {
  const seed = `${opts.seed}|${p.id}`;
  const on = new Set(types);
  const sections: TestSection[] = [];
  // 어법선택·어법 서술형을 함께 고르면 어법 자리를 번갈아 나눈다(같은 자리를 두 번 묻지 않게)
  const grammarPool = grammarCandidates(p);
  const both = on.has("grammar") && on.has("grammarFix") && !p.grammarChoice?.items?.length;
  const forPick = both ? grammarPool.filter((_, i) => i % 2 === 0) : grammarPool;
  const usedGrammar = new Set(on.has("grammar") ? forPick.map((c) => c.key) : []);
  for (const key of ALL_TEST_BOOK_TYPES) {
    if (!on.has(key)) continue;
    const sec =
      key === "line" ? buildLine(p, seed, opts.lineMode ?? "full")
      : key === "blank" ? buildBlank(p, seed, opts.blankMode ?? "same")
      : key === "grammar" ? (workbookGrammarSection(p, seed) ?? pickSection(p, "grammar", "어법선택", "알맞은 것에 ○", forPick, seed))
      : key === "vocab" ? pickSection(p, "vocab", "어휘선택", "문맥에 맞는 것에 ○", vocabCandidates(p), seed)
      : key === "order" ? buildOrder(p, seed)
      : key === "tf" ? buildTf(p, seed)
      : key === "writing" ? buildWriting(p, seed, opts.writing ?? "all")
      : key === "link" ? buildLink(p, seed)
      : key === "sequence" ? buildSequence(p, seed)
      : key === "insert" ? buildInsert(p, seed)
      : key === "summary" ? buildSummary(p)
      : key === "grammarFix" ? buildGrammarFix(p, seed, usedGrammar)
      : buildWords(p, seed);
    if (sec) sections.push(sec);
  }
  return { projectId: p.id, title: p.title, source: p.source, sections };
}

// ---------------------------------------------------------------- 동반의어 테스트

export type WordTest = {
  /** 뜻 쓰기 */
  meaning: Array<{ no: string; word: string; answer: string }>;
  /** 동의어(=)·반의어(↔) 고르기 */
  synonym: Array<{ no: string; word: string; rel: "=" | "↔"; choices: string[]; answer: number }>;
  /** 품사 바꾸기: ambitious (a.) → n. ______ */
  forms: Array<{ no: string; word: string; pos: string; toPos: string; answer: string }>;
};

/** 품사 이름(시험지에 「명사형」처럼 쓴다) */
export const POS_NAME: Record<string, string> = {
  "n.": "명사형",
  "v.": "동사형",
  "a.": "형용사형",
  "ad.": "부사형",
};

export function buildWordTest(p: Ready, seed: string): WordTest {
  const rows = p.material.vocab.filter((r) => r.word && r.meaning);
  // 뜻 쓰기: 핵심어를 먼저, 모자라면 나머지에서
  const keyRows = rows.filter((r) => r.key);
  const restRows = rows.filter((r) => !r.key);
  const meaningRows = [...pickN(keyRows, 10, `${seed}|m1`), ...pickN(restRows, 10, `${seed}|m2`)].slice(0, 10);
  const meaning = meaningRows.map((r, i) => ({ no: String(i + 1), word: r.word, answer: r.meaning }));

  // 고르기: 동의어나 반의어가 있는 핵심어. 오답은 다른 단어·다른 단어의 동의어에서.
  const pool = keyRows.filter((r) => r.synonyms.length || r.antonyms.length);
  const chosen = pickN(pool, 6, `${seed}|syn`);
  const fillers = [
    ...new Set(rows.flatMap((r) => [r.word, ...r.synonyms, ...r.antonyms]).map((w) => w.trim()).filter(Boolean)),
  ];
  const synonym = chosen.map((r, i) => {
    const useAnt = r.antonyms.length > 0 && (r.synonyms.length === 0 || hashSeedToUint32(`${seed}|rel|${r.word}`) % 3 === 0);
    const rel: "=" | "↔" = useAnt ? "↔" : "=";
    const correct = (useAnt ? r.antonyms : r.synonyms)[0]!;
    const banned = new Set([r.word, ...r.synonyms, ...r.antonyms].map((w) => w.toLowerCase()));
    // 정답·문제 낱말과 뿌리가 같은 말(exclusion·excluded)은 오답으로 쓰지 않는다 — 둘 다 답이 된다
    const stem = (w: string) => w.toLowerCase().replace(/[^a-z]/g, "").slice(0, 5);
    const bannedStems = new Set([r.word, correct].map(stem).filter((s) => s.length >= 4));
    const wrong = pickN(
      fillers.filter((w) => !banned.has(w.toLowerCase()) && !bannedStems.has(stem(w))),
      3,
      `${seed}|syn|${r.word}`
    );
    const choices = fisherYatesShuffle([correct, ...wrong], createSeededRng(`${seed}|synorder|${r.word}`));
    return { no: String(i + 1), word: r.word, rel, choices, answer: choices.indexOf(correct) };
  });

  // 품사 바꾸기: 파생어가 있는 단어(핵심어 먼저), 한 단어에 한 문항
  const formPool = [...keyRows, ...restRows].flatMap((r) =>
    r.forms
      .filter((f) => f.word && POS_NAME[f.pos] && f.pos !== r.pos && f.word.toLowerCase() !== r.word.toLowerCase())
      .slice(0, 1)
      .map((f) => ({ word: r.word, pos: r.pos, toPos: f.pos, answer: f.word }))
  );
  const forms = pickN(formPool, 6, `${seed}|forms`).map((f, i) => ({ no: String(i + 1), ...f }));
  return { meaning, synonym, forms };
}

export function circled(i: number): string {
  return CIRCLED[i] ?? `(${i + 1})`;
}

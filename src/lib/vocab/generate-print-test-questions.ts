import { meaningProfile, overlaps, safeFillersFor } from "@/lib/vocab/synonym-test";
import type { VocabItem } from "@/types/database";
import { buildChoices } from "@/lib/vocab/generate-test-questions";
import type {
  ExamPrintConfig,
  ExamQuestionKind,
} from "@/lib/vocab/vocab-print-exam-config";
import {
  clampExamConfigToPool,
  examConfigTotal,
} from "@/lib/vocab/vocab-print-exam-config";
import { pickPrimaryExampleSentence } from "@/lib/vocab/multi-example";
import { blankWordForms } from "@/lib/vocab/word-form-match";

export interface PrintExamQuestion {
  kind: ExamQuestionKind;
  number: number;
  prompt: string;
  choices?: string[];
  /** 정답 표시용 (객관식: ① meaning / 주관식: 정답 문자열) */
  answer: string;
  correctChoiceIndex?: number;
  /** 동의어·반의어 문항이면 단어 앞에 「동」「반」 표를 붙인다 */
  tag?: "syn" | "ant";
}

/** "period, expression, condition" → 낱말 목록 */
function splitList(raw: string | null | undefined): string[] {
  return (raw ?? "")
    .split(/[,;/]/)
    .map((w) => w.trim())
    .filter(Boolean);
}

const norm = (w: string) => w.trim().toLowerCase();

/**
 * 동의어(반의어) 객관식 보기: 정답 하나 + 다른 단어 셋.
 * 오답은 범위 안 다른 표제어에서 고르되, 이 단어의 동의어·반의어로 적힌 말이나
 * 이 단어(정답)를 동의어·반의어로 가진 단어는 빼서 정답이 둘이 되지 않게 한다. 셋이 안 되면 문항을 만들지 않는다.
 */
function buildRelationChoices(
  item: VocabItem,
  correct: string,
  pool: VocabItem[],
  rng: Rng
): string[] | null {
  const own = new Set(
    [item.word, ...splitList(item.synonyms), ...splitList(item.antonyms)].map(norm)
  );
  // 한글 뜻 낱낱(「수입」「소득」…)이 겹치는 단어도 오답으로 쓰지 않는다
  const meaningBits = (m: string | null | undefined) =>
    (m ?? "")
      .replace(/\([^)]*\)/g, " ")
      .split(/[,;·\/\s]+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 2);
  const ownMeaning = new Set(meaningBits(item.meaning));
  const seen = new Set<string>([norm(correct)]);
  const ownClasses = meaningProfile(item.meaning ?? "").classes;
  const candidates: string[] = [];
  const sameClass: string[] = [];
  for (const other of pool) {
    if (other.id === item.id) continue;
    const w = other.word?.trim();
    if (!w || own.has(norm(w)) || seen.has(norm(w))) continue;
    const rel = new Set(
      [...splitList(other.synonyms), ...splitList(other.antonyms)].map(norm)
    );
    if (rel.has(norm(item.word)) || rel.has(norm(correct))) continue;
    if (meaningBits(other.meaning).some((t) => ownMeaning.has(t))) continue;
    seen.add(norm(w));
    if (overlaps(meaningProfile(other.meaning ?? "").classes, ownClasses)) sameClass.push(w);
    else candidates.push(w);
  }
  // 품사가 같은 말은 오답이 사실상 정답이 될 수 있어(cut = divide) 쓰지 않고, 모자라면 뜻이 겹칠 수 없는 말로 채운다
  const safe = safeFillersFor(item.meaning ?? "").filter((w) => !own.has(w) && !seen.has(w));
  const wrong = [...shuffle(candidates, rng), ...shuffle(safe, rng), ...shuffle(sameClass, rng)].slice(0, 3);
  if (wrong.length < 3) return null;
  return shuffle([correct, ...wrong], rng);
}

/** 시험지 예문 문항: 대표 예문 한 줄만, 단어(변화형 포함)를 모두 빈칸으로 */
function blankExampleSentence(
  item: VocabItem
): { text: string; tokens: string[] } | null {
  const sentence = pickPrimaryExampleSentence(item.example_sentence);
  const word = item.word?.trim();
  if (!sentence || !word) return null;
  return blankWordForms(sentence, word);
}

function itemsWithBlankableExample(items: VocabItem[]): VocabItem[] {
  return items.filter((item) => blankExampleSentence(item) !== null);
}

type Rng = () => number;

/** 같은 시드면 서버·브라우저가 같은 순서를 만든다(화면과 인쇄가 어긋나지 않게). */
function seededRng(seed: number): Rng {
  let a = seed >>> 0 || 0x9e3779b9;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 시드가 없으면 단어 목록으로 정한다 — 같은 단어장·설정이면 늘 같은 시험지 */
function seedFromItems(items: VocabItem[]): number {
  let h = 2166136261;
  for (const item of items) {
    for (let i = 0; i < item.id.length; i++) {
      h ^= item.id.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
  }
  return h >>> 0;
}

function shuffle<T>(arr: T[], rng: Rng): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const CHOICE_MARKS = ["①", "②", "③", "④", "⑤", "⑥"];

function buildQuestion(
  kind: ExamQuestionKind,
  item: VocabItem,
  pool: VocabItem[],
  rng: Rng
): PrintExamQuestion | null {
  switch (kind) {
    case "word_mc": {
      const choices = buildChoices(pool, item, (i) => i.meaning, rng);
      if (!choices || choices.length < 2) return null;
      const idx = choices.findIndex((c) => c === item.meaning.trim());
      const mark = CHOICE_MARKS[idx >= 0 ? idx : 0] ?? "①";
      return {
        kind,
        number: 0,
        prompt: item.word,
        choices,
        answer: `${mark} ${item.meaning.trim()}`,
        correctChoiceIndex: idx >= 0 ? idx : 0,
      };
    }
    case "word_sa":
      return {
        kind,
        number: 0,
        prompt: item.word,
        answer: item.meaning.trim(),
      };
    case "meaning_mc": {
      const choices = buildChoices(pool, item, (i) => i.word, rng);
      if (!choices || choices.length < 2) return null;
      const idx = choices.findIndex((c) => c === item.word.trim());
      const mark = CHOICE_MARKS[idx >= 0 ? idx : 0] ?? "①";
      return {
        kind,
        number: 0,
        prompt: item.meaning,
        choices,
        answer: `${mark} ${item.word.trim()}`,
        correctChoiceIndex: idx >= 0 ? idx : 0,
      };
    }
    case "meaning_sa":
      return {
        kind,
        number: 0,
        prompt: item.meaning,
        answer: item.word.trim(),
      };
    case "example_mc": {
      const blanked = blankExampleSentence(item);
      if (!blanked) return null;
      const choices = buildChoices(pool, item, (i) => i.word, rng);
      if (!choices || choices.length < 2) return null;
      const idx = choices.findIndex((c) => c === item.word.trim());
      const mark = CHOICE_MARKS[idx >= 0 ? idx : 0] ?? "①";
      return {
        kind,
        number: 0,
        prompt: blanked.text,
        choices,
        answer: `${mark} ${item.word.trim()}`,
        correctChoiceIndex: idx >= 0 ? idx : 0,
      };
    }
    case "example_sa": {
      const blanked = blankExampleSentence(item);
      if (!blanked) return null;
      // 빈칸 자리에 들어갈 실제 표기(provides 등)가 원형과 다르면 함께 적는다
      const word = item.word.trim();
      const token = blanked.tokens[0]?.trim() ?? "";
      return {
        kind,
        number: 0,
        prompt: blanked.text,
        answer:
          token && token.toLowerCase() !== word.toLowerCase()
            ? `${token} (${word})`
            : word,
      };
    }
    case "syn_mc":
    case "ant_mc": {
      const list = splitList(kind === "syn_mc" ? item.synonyms : item.antonyms);
      if (list.length === 0) return null;
      const correct = list[Math.floor(rng() * list.length)];
      const choices = buildRelationChoices(item, correct, pool, rng);
      if (!choices) return null;
      const idx = choices.indexOf(correct);
      return {
        kind,
        number: 0,
        prompt: item.word,
        choices,
        answer: `${CHOICE_MARKS[idx] ?? "①"} ${correct}`,
        correctChoiceIndex: idx,
        tag: kind === "syn_mc" ? "syn" : "ant",
      };
    }
    case "syn_sa":
    case "ant_sa": {
      const list = splitList(kind === "syn_sa" ? item.synonyms : item.antonyms);
      if (list.length === 0) return null;
      return {
        kind,
        number: 0,
        prompt: item.word,
        // 적힌 말 중 하나면 정답
        answer: list.join(" / "),
        tag: kind === "syn_sa" ? "syn" : "ant",
      };
    }
    default:
      return null;
  }
}

const EXAMPLE_KINDS: ExamQuestionKind[] = ["example_mc", "example_sa"];
const RELATION_KINDS: ExamQuestionKind[] = ["syn_mc", "syn_sa", "ant_mc", "ant_sa"];
const BASIC_KINDS: ExamQuestionKind[] = [
  "word_mc",
  "word_sa",
  "meaning_mc",
  "meaning_sa",
];

export interface PrintExamGenerateResult {
  questions: PrintExamQuestion[];
  /** 예문이 있는 단어가 모자라 뺀 예문 문항 수 */
  skippedNoExample: number;
  /** 동의어·반의어가 적힌 단어가 모자라(또는 보기를 못 만들어) 뺀 문항 수 */
  skippedNoRelation: number;
  /** 그 밖의 이유(보기를 만들 수 없음 등)로 뺀 문항 수 */
  skipped: number;
  capped: boolean;
}

export function generatePrintExamQuestions(
  items: VocabItem[],
  config: ExamPrintConfig,
  options?: { shuffle?: boolean; shuffleSeed?: number }
): PrintExamGenerateResult {
  if (items.length < 2) {
    return { questions: [], skipped: 0, skippedNoExample: 0, skippedNoRelation: 0, capped: false };
  }

  const cappedConfig = clampExamConfigToPool(config, items.length);
  const capped = examConfigTotal(config) > examConfigTotal(cappedConfig);

  const basicQuestions: PrintExamQuestion[] = [];
  const exampleQuestions: PrintExamQuestion[] = [];
  let skipped = 0;
  let skippedNoExample = 0;
  let skippedNoRelation = 0;

  const rng = seededRng(options?.shuffleSeed || seedFromItems(items));
  const usedIds = new Set<string>();
  const doShuffle = options?.shuffle !== false;
  /** 섞지 않을 때 문항을 단어 번호 순으로 놓으려고 */
  const order = new Map<PrintExamQuestion, number>();
  const itemNo = new Map(items.map((item, i) => [item.id, i]));

  /**
   * 앞에서부터 문항을 만들고, 만들지 못한 단어는 건너뛴다.
   * 섞기면 단어도 무작위로 고르고, 섞지 않으면 단어 번호 순서대로 고른다(1~50번 순서대로 시험).
   */
  function fill(
    kind: ExamQuestionKind,
    count: number,
    pool: VocabItem[],
    bucket: PrintExamQuestion[],
    used: Set<string> = usedIds
  ): number {
    let made = 0;
    for (const item of doShuffle ? shuffle(pool, rng) : pool) {
      if (made >= count) break;
      if (used.has(item.id)) continue;
      const q = buildQuestion(kind, item, items, rng);
      if (!q) continue;
      used.add(item.id);
      order.set(q, itemNo.get(item.id) ?? 0);
      bucket.push(q);
      made += 1;
    }
    return made;
  }

  // 1) 예문 문항을 먼저 — 예문이 있는 단어가 기본 문항에 먼저 쓰여 버리지 않게
  const examplePool = itemsWithBlankableExample(items);
  for (const kind of EXAMPLE_KINDS) {
    const count = cappedConfig[kind];
    if (count <= 0) continue;
    const made = fill(kind, count, examplePool, exampleQuestions);
    skippedNoExample += count - made;
  }

  // 2) 동의어·반의어 — 뜻 쓰기에 나온 단어도 다시 물을 수 있게 따로 센다(동의어 안에서·반의어 안에서만 한 번씩)
  for (const kind of RELATION_KINDS) {
    const count = cappedConfig[kind];
    if (count <= 0) continue;
    const field = kind.startsWith("syn") ? "synonyms" : "antonyms";
    const pool = items.filter((item) => splitList(item[field]).length > 0);
    const made = fill(kind, count, pool, basicQuestions, new Set());
    skippedNoRelation += count - made;
  }

  // 3) 기본 문항은 남은 단어로
  for (const kind of BASIC_KINDS) {
    const count = cappedConfig[kind];
    if (count <= 0) continue;
    const made = fill(kind, count, items, basicQuestions);
    skipped += count - made;
  }

  // 번호순이면 유형끼리 묶어(뜻 쓰기 → 동의어 → 반의어 …) 그 안에서 단어 번호 순서로
  const kindRank = (q: PrintExamQuestion) =>
    [...BASIC_KINDS, ...RELATION_KINDS, ...EXAMPLE_KINDS].indexOf(q.kind);
  const byNo = (a: PrintExamQuestion, b: PrintExamQuestion) =>
    kindRank(a) - kindRank(b) || (order.get(a) ?? 0) - (order.get(b) ?? 0);
  // 섞어도 쓰기 문항 묶음 → 객관식 묶음으로 나눈다(한 줄에 객관식·쓰기가 섞이면 칸이 들쭉날쭉하다)
  const written = basicQuestions.filter((q) => !q.choices);
  const choice = basicQuestions.filter((q) => q.choices);
  const orderedBasic = doShuffle
    ? [...shuffle(written, rng), ...shuffle(choice, rng)]
    : [...basicQuestions].sort(byNo);
  const orderedExamples = doShuffle
    ? shuffle(exampleQuestions, rng)
    : [...exampleQuestions].sort(byNo);

  return {
    questions: [...orderedBasic, ...orderedExamples].map((q, i) => ({
      ...q,
      number: i + 1,
    })),
    skipped,
    skippedNoExample,
    skippedNoRelation,
    capped,
  };
}

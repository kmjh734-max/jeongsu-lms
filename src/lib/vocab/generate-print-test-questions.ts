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
    default:
      return null;
  }
}

const EXAMPLE_KINDS: ExamQuestionKind[] = ["example_mc", "example_sa"];
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
    return { questions: [], skipped: 0, skippedNoExample: 0, capped: false };
  }

  const cappedConfig = clampExamConfigToPool(config, items.length);
  const capped = examConfigTotal(config) > examConfigTotal(cappedConfig);

  const basicQuestions: PrintExamQuestion[] = [];
  const exampleQuestions: PrintExamQuestion[] = [];
  let skipped = 0;
  let skippedNoExample = 0;

  const rng = seededRng(options?.shuffleSeed || seedFromItems(items));
  const usedIds = new Set<string>();

  /** pool을 섞어 앞에서부터 문항을 만들고, 만들지 못한 단어는 건너뛴다 */
  function fill(
    kind: ExamQuestionKind,
    count: number,
    pool: VocabItem[],
    bucket: PrintExamQuestion[]
  ): number {
    let made = 0;
    for (const item of shuffle(pool, rng)) {
      if (made >= count) break;
      if (usedIds.has(item.id)) continue;
      const q = buildQuestion(kind, item, items, rng);
      if (!q) continue;
      usedIds.add(item.id);
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

  // 2) 기본 문항은 남은 단어로
  for (const kind of BASIC_KINDS) {
    const count = cappedConfig[kind];
    if (count <= 0) continue;
    const made = fill(kind, count, items, basicQuestions);
    skipped += count - made;
  }

  const doShuffle = options?.shuffle !== false;
  const orderedBasic = doShuffle ? shuffle(basicQuestions, rng) : basicQuestions;
  const orderedExamples = doShuffle
    ? shuffle(exampleQuestions, rng)
    : exampleQuestions;

  return {
    questions: [...orderedBasic, ...orderedExamples].map((q, i) => ({
      ...q,
      number: i + 1,
    })),
    skipped,
    skippedNoExample,
    capped,
  };
}

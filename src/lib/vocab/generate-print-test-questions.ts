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

export interface PrintExamQuestion {
  kind: ExamQuestionKind;
  number: number;
  prompt: string;
  choices?: string[];
  /** 정답 표시용 (객관식: ① meaning / 주관식: 정답 문자열) */
  answer: string;
  correctChoiceIndex?: number;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function blankExampleSentence(item: VocabItem): string | null {
  const sentence = item.example_sentence?.trim();
  const word = item.word?.trim();
  if (!sentence || !word) return null;
  const re = new RegExp(`\\b${escapeRegExp(word)}\\b`, "i");
  if (!re.test(sentence)) return null;
  return sentence.replace(
    new RegExp(`\\b${escapeRegExp(word)}\\b`, "gi"),
    "______"
  );
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

/** 재사용 없이 count개만 뽑음 (부족하면 그만큼만) */
function pickItemsNoReuse(pool: VocabItem[], count: number, rng: Rng): VocabItem[] {
  if (count <= 0 || pool.length === 0) return [];
  return shuffle(pool, rng).slice(0, Math.min(count, pool.length));
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
        prompt: blanked,
        choices,
        answer: `${mark} ${item.word.trim()}`,
        correctChoiceIndex: idx >= 0 ? idx : 0,
      };
    }
    case "example_sa": {
      const blanked = blankExampleSentence(item);
      if (!blanked) return null;
      return {
        kind,
        number: 0,
        prompt: blanked,
        answer: item.word.trim(),
      };
    }
    default:
      return null;
  }
}

const KIND_ORDER: { kind: ExamQuestionKind; configKey: keyof ExamPrintConfig }[] =
  [
    { kind: "word_mc", configKey: "word_mc" },
    { kind: "word_sa", configKey: "word_sa" },
    { kind: "meaning_mc", configKey: "meaning_mc" },
    { kind: "meaning_sa", configKey: "meaning_sa" },
    { kind: "example_mc", configKey: "example_mc" },
    { kind: "example_sa", configKey: "example_sa" },
  ];

export function generatePrintExamQuestions(
  items: VocabItem[],
  config: ExamPrintConfig,
  options?: { shuffle?: boolean; shuffleSeed?: number }
): { questions: PrintExamQuestion[]; skipped: number; capped: boolean } {
  if (items.length < 2) {
    return { questions: [], skipped: 0, capped: false };
  }

  const cappedConfig = clampExamConfigToPool(config, items.length);
  const capped = examConfigTotal(config) > examConfigTotal(cappedConfig);

  const basicQuestions: PrintExamQuestion[] = [];
  const exampleQuestions: PrintExamQuestion[] = [];
  let skipped = 0;

  const rng = seededRng(options?.shuffleSeed || seedFromItems(items));
  const examplePoolAll = itemsWithBlankableExample(items);
  const usedIds = new Set<string>();

  for (const { kind, configKey } of KIND_ORDER) {
    const count = cappedConfig[configKey];
    if (count <= 0) continue;

    const isExample = kind === "example_mc" || kind === "example_sa";
    const basePool = isExample ? examplePoolAll : items;
    const pool = basePool.filter((item) => !usedIds.has(item.id));
    if (pool.length === 0) {
      skipped += count;
      continue;
    }

    const picked = pickItemsNoReuse(pool, count, rng);
    skipped += Math.max(0, count - picked.length);
    const bucket = isExample ? exampleQuestions : basicQuestions;

    for (const item of picked) {
      usedIds.add(item.id);
      const q = buildQuestion(kind, item, items, rng);
      if (!q) {
        skipped += 1;
        usedIds.delete(item.id);
        continue;
      }
      bucket.push(q);
    }
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
    capped,
  };
}

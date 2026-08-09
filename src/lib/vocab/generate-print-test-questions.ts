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

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** 재사용 없이 count개만 뽑음 (부족하면 그만큼만) */
function pickItemsNoReuse(pool: VocabItem[], count: number): VocabItem[] {
  if (count <= 0 || pool.length === 0) return [];
  return shuffle(pool).slice(0, Math.min(count, pool.length));
}

const CHOICE_MARKS = ["①", "②", "③", "④", "⑤", "⑥"];

function buildQuestion(
  kind: ExamQuestionKind,
  item: VocabItem,
  pool: VocabItem[]
): PrintExamQuestion | null {
  switch (kind) {
    case "word_mc": {
      const choices = buildChoices(pool, item, (i) => i.meaning);
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
      const choices = buildChoices(pool, item, (i) => i.word);
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
      const choices = buildChoices(pool, item, (i) => i.word);
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

    const picked = pickItemsNoReuse(pool, count);
    skipped += Math.max(0, count - picked.length);
    const bucket = isExample ? exampleQuestions : basicQuestions;

    for (const item of picked) {
      usedIds.add(item.id);
      const q = buildQuestion(kind, item, items);
      if (!q) {
        skipped += 1;
        usedIds.delete(item.id);
        continue;
      }
      bucket.push(q);
    }
  }

  void options?.shuffleSeed;

  const doShuffle = options?.shuffle !== false;
  const orderedBasic = doShuffle ? shuffle(basicQuestions) : basicQuestions;
  const orderedExamples = doShuffle
    ? shuffle(exampleQuestions)
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

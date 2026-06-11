import type { VocabItem } from "@/types/database";
import { buildChoices, buildSpellingPrompt } from "@/lib/vocab/generate-test-questions";
import type { ExamPrintConfig, ExamQuestionKind } from "@/lib/vocab/vocab-print-exam-config";

export interface PrintExamQuestion {
  kind: ExamQuestionKind;
  number: number;
  prompt: string;
  subPrompt?: string;
  choices?: string[];
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickItems(pool: VocabItem[], count: number): VocabItem[] {
  if (count <= 0) return [];
  const shuffled = shuffle(pool);
  const out: VocabItem[] = [];
  for (let i = 0; i < count; i++) {
    out.push(shuffled[i % shuffled.length]!);
  }
  return out;
}

function buildQuestion(
  kind: ExamQuestionKind,
  item: VocabItem,
  pool: VocabItem[]
): PrintExamQuestion | null {
  switch (kind) {
    case "word_mc": {
      const choices = buildChoices(pool, item, (i) => i.meaning);
      if (!choices || choices.length < 2) return null;
      return {
        kind,
        number: 0,
        prompt: item.word,
        subPrompt: "알맞은 뜻을 고르시오.",
        choices,
      };
    }
    case "word_sa":
      return {
        kind,
        number: 0,
        prompt: item.word,
        subPrompt: "뜻을 쓰시오.",
      };
    case "meaning_mc": {
      const choices = buildChoices(pool, item, (i) => i.word);
      if (!choices || choices.length < 2) return null;
      return {
        kind,
        number: 0,
        prompt: item.meaning,
        subPrompt: "알맞은 단어를 고르시오.",
        choices,
      };
    }
    case "meaning_sa":
      return {
        kind,
        number: 0,
        prompt: item.meaning,
        subPrompt: "영어 단어를 쓰시오.",
      };
    case "example_mc": {
      const ex = item.example_sentence?.trim();
      if (!ex) return null;
      const blanked = ex.replace(
        new RegExp(`\\b${escapeRegExp(item.word)}\\b`, "gi"),
        "______"
      );
      const choices = buildChoices(pool, item, (i) => i.word);
      if (!choices || choices.length < 2) return null;
      return {
        kind,
        number: 0,
        prompt: blanked,
        subPrompt: "빈칸에 알맞은 단어를 고르시오.",
        choices,
      };
    }
    case "example_sa": {
      const blanked = buildSpellingPrompt(item).replace(/^예문:\s*/, "");
      if (!blanked) return null;
      return {
        kind,
        number: 0,
        prompt: blanked,
        subPrompt: "빈칸에 알맞은 영어 단어를 쓰시오.",
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
  config: ExamPrintConfig
): { questions: PrintExamQuestion[]; skipped: number } {
  if (items.length < 2) {
    return { questions: [], skipped: 0 };
  }

  const withExample = items.filter((i) => i.example_sentence?.trim());
  const questions: PrintExamQuestion[] = [];
  let skipped = 0;

  for (const { kind, configKey } of KIND_ORDER) {
    const count = config[configKey];
    if (count <= 0) continue;

    const pool =
      kind === "example_mc" || kind === "example_sa" ? withExample : items;
    const picked = pickItems(pool, count);

    for (const item of picked) {
      const q = buildQuestion(kind, item, items);
      if (!q) {
        skipped += 1;
        continue;
      }
      questions.push({ ...q, number: questions.length + 1 });
    }
  }

  return { questions, skipped };
}

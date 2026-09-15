import { lemmaEnglishToken } from "@/lib/question-generator/word-order-normalize";
import { gradeSpellingAnswer, normalizeSpellingAnswer } from "@/lib/vocab/grade-spelling";
import {
  pickPrimaryExampleMeaning,
  pickPrimaryExampleSentence,
} from "@/lib/vocab/multi-example";
import type { VocabItem } from "@/types/database";

export interface ExampleBlankQuestion {
  itemId: string;
  word: string;
  blankSentence: string;
  sentenceToken: string;
  exampleMeaning: string | null;
  acceptedAnswers: string[];
}

const VOWELS = new Set(["a", "e", "i", "o", "u"]);

/**
 * 단어 원형에서 나올 수 있는 규칙 변화형 (복수·3인칭·과거·진행·비교급).
 * car → cars / cared(×) 같은 과생성은 조금 있어도, career처럼 다른 단어는 만들지 않는다.
 */
function regularInflections(base: string): Set<string> {
  const forms = new Set<string>([base]);
  if (!/^[a-z][a-z'-]*$/.test(base) || base.length < 2) return forms;

  const last = base[base.length - 1]!;
  const prev = base[base.length - 2] ?? "";
  const stemNoE = base.endsWith("e") ? base.slice(0, -1) : null;

  // -s / -es
  if (/(?:s|x|z|ch|sh|o)$/.test(base)) forms.add(`${base}es`);
  else forms.add(`${base}s`);
  // -y → -ies / -ied / -ier / -iest (자음 + y)
  if (last === "y" && prev && !VOWELS.has(prev)) {
    const stem = base.slice(0, -1);
    for (const suf of ["ies", "ied", "ier", "iest"]) forms.add(`${stem}${suf}`);
  }
  // -f / -fe → -ves
  if (last === "f") forms.add(`${base.slice(0, -1)}ves`);
  if (base.endsWith("fe")) forms.add(`${base.slice(0, -2)}ves`);

  // -ed / -ing / -er / -est
  if (stemNoE) {
    // make → maked(규칙형) / maker / larger · largest
    for (const suf of ["d", "r", "st"]) forms.add(`${base}${suf}`);
    if (base.endsWith("ie")) forms.add(`${base.slice(0, -2)}ying`);
    else if (base.endsWith("ee") || base.endsWith("ye") || base.endsWith("oe")) {
      forms.add(`${base}ing`);
    } else {
      forms.add(`${stemNoE}ing`);
    }
  } else {
    for (const suf of ["ed", "ing", "er", "est"]) forms.add(`${base}${suf}`);
    // 자음 겹침 (stop → stopped, big → bigger)
    const prev2 = base[base.length - 3] ?? "";
    if (
      !VOWELS.has(last) &&
      !"wxy".includes(last) &&
      prev &&
      VOWELS.has(prev) &&
      (!prev2 || !VOWELS.has(prev2))
    ) {
      for (const suf of ["ed", "ing", "er", "est"]) forms.add(`${base}${last}${suf}`);
    }
    // panic → panicked
    if (last === "c") {
      forms.add(`${base}ked`);
      forms.add(`${base}king`);
    }
  }
  return forms;
}

/**
 * 예문 속 낱말이 단어장 단어(또는 그 변화형)인지.
 * 앞부분만 같은 다른 단어(car → career)는 맞지 않는다.
 */
export function wordsMatchForBlank(vocabWord: string, token: string): boolean {
  const w = normalizeSpellingAnswer(vocabWord);
  const t = normalizeSpellingAnswer(token);
  if (!w || !t) return false;
  if (w === t) return true;
  if (w.includes(" ") || t.includes(" ")) return false;

  if (regularInflections(w).has(t)) return true;

  // 불규칙 변화형(took → take)이나, 단어장에 변화형이 올라간 경우(allows ↔ allow)
  const lw = lemmaEnglishToken(w);
  const lt = lemmaEnglishToken(t);
  if (lw.length >= 2 && lw === lt) return true;
  if (lw !== w && lw.length >= 2 && regularInflections(lw).has(t)) return true;
  return false;
}

export function extractAcceptedAnswers(
  word: string,
  exampleSentence: string
): string[] {
  const answers = new Set<string>();
  const base = word.trim();
  if (base) answers.add(base);

  const tokens = exampleSentence.match(/[\w'-]+/g) ?? [];
  for (const token of tokens) {
    if (wordsMatchForBlank(base, token)) {
      answers.add(token);
    }
  }
  return [...answers];
}

export function buildExampleBlankQuestion(
  item: VocabItem
): ExampleBlankQuestion | null {
  const sentence = pickPrimaryExampleSentence(item.example_sentence);
  const word = item.word?.trim();
  if (!sentence || !word) return null;

  const matches = [...sentence.matchAll(/[\w'-]+/g)];
  for (const match of matches) {
    const token = match[0];
    if (!wordsMatchForBlank(word, token)) continue;

    const start = match.index ?? 0;
    const end = start + token.length;
    const blankSentence =
      sentence.slice(0, start) + "______" + sentence.slice(end);

    const exampleMeaning =
      pickPrimaryExampleMeaning(item.example_meaning) || null;

    return {
      itemId: item.id,
      word,
      blankSentence,
      sentenceToken: token,
      exampleMeaning,
      acceptedAnswers: extractAcceptedAnswers(word, sentence),
    };
  }

  return null;
}

export function buildExampleBlankQuestions(
  items: VocabItem[]
): ExampleBlankQuestion[] {
  return items
    .map(buildExampleBlankQuestion)
    .filter((q): q is ExampleBlankQuestion => q !== null);
}

export function gradeExampleBlankAnswer(
  acceptedAnswers: string[],
  studentAnswer: string
): boolean {
  const trimmed = studentAnswer.trim();
  if (!trimmed) return false;
  return acceptedAnswers.some((a) => gradeSpellingAnswer(a, trimmed));
}

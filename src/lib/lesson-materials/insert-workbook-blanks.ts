import type {
  BlankHintType,
  BlankRenderToken,
  WorkbookBlankAnswer,
} from "@/lib/lesson-materials/workbook-types";
import type { ValidatedBlankCandidate } from "@/lib/lesson-materials/validate-workbook-blank";

export function firstLetterOf(answerText: string): string {
  return answerText.charAt(0);
}

/**
 * Insert blanks into one sentence by span positions (never replaceAll).
 * Cuts are applied from left to right on the original sentence.
 */
export function buildBlankTokensForSentence(input: {
  sentence: string;
  blanks: ValidatedBlankCandidate[];
  numberByKey: Map<string, number>;
  hintType: BlankHintType;
}): BlankRenderToken[] {
  const { sentence, blanks, numberByKey, hintType } = input;

  const cuts = blanks
    .map((b) => {
      const key = `${b.sentenceId}:${b.start}`;
      const number = numberByKey.get(key);
      if (number == null) return null;
      if (sentence.slice(b.start, b.end) !== b.answerText) return null;
      return {
        start: b.start,
        end: b.end,
        blankId: b.id,
        number,
        answerText: b.answerText,
      };
    })
    .filter(Boolean) as Array<{
    start: number;
    end: number;
    blankId: string;
    number: number;
    answerText: string;
  }>;

  cuts.sort((a, b) => a.start - b.start);

  for (let i = 1; i < cuts.length; i++) {
    if (cuts[i]!.start < cuts[i - 1]!.end) {
      throw new Error("빈칸 위치가 겹칩니다.");
    }
  }

  const tokens: BlankRenderToken[] = [];
  let cursor = 0;
  for (const c of cuts) {
    if (c.start > cursor) {
      tokens.push({ type: "text", text: sentence.slice(cursor, c.start) });
    }
    tokens.push({
      type: "blank",
      blankId: c.blankId,
      number: c.number,
      answerText: c.answerText,
      firstLetter:
        hintType === "first_letter" ? firstLetterOf(c.answerText) : undefined,
    });
    cursor = c.end;
  }
  if (cursor < sentence.length) {
    tokens.push({ type: "text", text: sentence.slice(cursor) });
  }
  if (tokens.length === 0) {
    tokens.push({ type: "text", text: sentence });
  }

  const restored = restorePassageFromTokens(tokens);
  if (restored !== sentence) {
    throw new Error(
      "빈칸 삽입 후 원문 복원 검증에 실패했습니다. 원문이 훼손되지 않도록 생성을 중단합니다."
    );
  }
  return tokens;
}

export function restorePassageFromTokens(tokens: BlankRenderToken[]): string {
  return tokens
    .map((t) => (t.type === "text" ? t.text : t.answerText))
    .join("");
}

export function assignBlankNumbers(
  selected: ValidatedBlankCandidate[],
  sentenceOrder: string[]
): Map<string, number> {
  const bySentence = new Map<string, ValidatedBlankCandidate[]>();
  for (const c of selected) {
    const list = bySentence.get(c.sentenceId) ?? [];
    list.push(c);
    bySentence.set(c.sentenceId, list);
  }
  const map = new Map<string, number>();
  let n = 1;
  for (const sid of sentenceOrder) {
    const list = (bySentence.get(sid) ?? []).sort((a, b) => a.start - b.start);
    for (const c of list) {
      map.set(`${c.sentenceId}:${c.start}`, n++);
    }
  }
  return map;
}

export function buildAnswersFromSelected(
  selected: ValidatedBlankCandidate[],
  numberByKey: Map<string, number>
): WorkbookBlankAnswer[] {
  const answers: WorkbookBlankAnswer[] = [];
  for (const c of selected) {
    const number = numberByKey.get(`${c.sentenceId}:${c.start}`);
    if (number == null) continue;
    answers.push({
      number,
      answerText: c.answerText,
      lemma: c.lemma,
      meaningKo: c.meaningKo,
    });
  }
  return answers.sort((a, b) => a.number - b.number);
}

/** Flatten sentence tokens with a single space between sentences (chunk layout). */
export function flattenPassageTokens(
  sentenceTokens: BlankRenderToken[][]
): BlankRenderToken[] {
  const out: BlankRenderToken[] = [];
  sentenceTokens.forEach((tokens, i) => {
    if (i > 0) out.push({ type: "text", text: " " });
    out.push(...tokens);
  });
  return out;
}

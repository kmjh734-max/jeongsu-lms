import type {
  GrammarFixRenderSegment,
  WorkbookGrammarChoiceItem,
  WorkbookGrammarChoiceSection,
  WorkbookGrammarChoiceSkip,
  WorkbookGrammarFixAnswer,
  WorkbookGrammarFixOptions,
  WorkbookGrammarFixSection,
} from "@/lib/lesson-materials/workbook-types";

/**
 * 어법 수정은 어법 선택 결과로 만든다.
 *
 * 어법 선택의 자리마다 맞는 형태(지문 원문)와 틀린 형태가 한 쌍으로 있고, "둘 중 하나만
 * 맞다"는 검수를 이미 거쳤다. 그중 몇 곳에 틀린 형태를 넣으면, 틀린 곳은 확실히 틀리고
 * 밑줄 친 나머지는 확실히 맞는 어법 수정 문항이 된다. 모델을 다시 부르지 않는다.
 */

/** 밑줄형에서 밑줄 칠 곳 수의 상한. */
const MAX_UNDERLINES = 8;
/** 두 자리 사이 글자가 이보다 적으면 밑줄이 붙어 보여 함께 고르지 않는다. */
const MIN_GAP_CHARS = 3;

function hashSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** 같은 지문·같은 설정이면 늘 같은 문항이 나오도록 씨앗을 고정한 난수. */
function seededRandom(seed: string): () => number {
  let a = hashSeed(seed);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(list: T[], rand: () => number): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** 틀린 형태의 첫 글자 대소문자를 원문에 맞춘다(문장 첫머리 자리). */
function matchLeadingCase(text: string, like: string): string {
  const a = text.charAt(0);
  const b = like.charAt(0);
  if (!a || !b) return text;
  if (b === b.toUpperCase() && b !== b.toLowerCase()) {
    return a.toUpperCase() + text.slice(1);
  }
  if (b === b.toLowerCase() && b !== b.toUpperCase()) {
    return a.toLowerCase() + text.slice(1);
  }
  return text;
}

function tooClose(a: WorkbookGrammarChoiceItem, b: WorkbookGrammarChoiceItem): boolean {
  const gap =
    a.startCharIndex < b.startCharIndex
      ? b.startCharIndex - a.endCharIndex
      : a.startCharIndex - b.endCharIndex;
  return gap < MIN_GAP_CHARS;
}

/**
 * 순서대로 보며 고른다: 먼저 서로 다른 문장·다른 문법 항목에서, 모자라면 조건을 풀어 채운다.
 * 붙어 있는 자리는 끝까지 함께 고르지 않는다.
 */
function pickSpread(
  pool: WorkbookGrammarChoiceItem[],
  count: number,
  key: (it: WorkbookGrammarChoiceItem) => string
): WorkbookGrammarChoiceItem[] {
  const chosen: WorkbookGrammarChoiceItem[] = [];
  const usedKeys = new Set<string>();
  const fits = (it: WorkbookGrammarChoiceItem) =>
    !chosen.includes(it) && !chosen.some((c) => tooClose(c, it));
  for (const it of pool) {
    if (chosen.length >= count) break;
    if (fits(it) && !usedKeys.has(key(it))) {
      chosen.push(it);
      usedKeys.add(key(it));
    }
  }
  for (const it of pool) {
    if (chosen.length >= count) break;
    if (fits(it)) chosen.push(it);
  }
  return chosen;
}

export function buildGrammarFixSection(
  section: WorkbookGrammarChoiceSection,
  options: WorkbookGrammarFixOptions
): WorkbookGrammarFixSection | null {
  const passage = section.sourcePassage;
  const usable = section.items.filter(
    (it) =>
      it.startCharIndex >= 0 &&
      it.endCharIndex <= passage.length &&
      it.startCharIndex < it.endCharIndex &&
      passage.slice(it.startCharIndex, it.endCharIndex) === it.correctText &&
      it.incorrectText.trim() &&
      it.incorrectText.trim().toLowerCase() !== it.correctText.trim().toLowerCase()
  );
  if (usable.length === 0) return null;

  const rand = seededRandom(`${section.projectId}|${options.mode}|${options.errorCount}`);
  // 학습 가치가 높은 자리를 먼저, 같으면 무작위로.
  const pool = shuffle(usable, rand).sort((a, b) => b.learningValue - a.learningValue);

  let spots: WorkbookGrammarChoiceItem[];
  let errors: WorkbookGrammarChoiceItem[];
  if (options.mode === "underline") {
    // 맞게 쓴 밑줄이 적어도 하나는 있어야 "틀린 것 찾기"가 된다.
    const errorTarget = Math.min(options.errorCount, Math.max(1, usable.length - 1));
    const spotTarget = Math.min(usable.length, MAX_UNDERLINES, Math.max(5, errorTarget + 3));
    spots = pickSpread(pool, spotTarget, (it) => it.sentenceId);
    errors = pickSpread(
      shuffle(spots, rand),
      Math.min(errorTarget, Math.max(1, spots.length - 1)),
      (it) => it.grammarCategoryId
    );
  } else {
    errors = pickSpread(pool, Math.min(options.errorCount, usable.length), (it) => it.grammarCategoryId);
    spots = errors;
  }
  if (errors.length === 0) return null;

  const ordered = [...spots].sort((a, b) => a.startCharIndex - b.startCharIndex);
  const errorSet = new Set(errors);
  const segments: GrammarFixRenderSegment[] = [];
  const answers: WorkbookGrammarFixAnswer[] = [];
  let cursor = 0;
  ordered.forEach((it, i) => {
    if (cursor < it.startCharIndex) {
      segments.push({ type: "text", text: passage.slice(cursor, it.startCharIndex) });
    }
    const number = options.mode === "underline" ? i + 1 : null;
    const isError = errorSet.has(it);
    const shown = isError ? matchLeadingCase(it.incorrectText.trim(), it.correctText) : it.correctText;
    segments.push({ type: "spot", number, text: shown });
    if (isError) answers.push({ number, wrongText: shown, correctText: it.correctText });
    cursor = it.endCharIndex;
  });
  if (cursor < passage.length) segments.push({ type: "text", text: passage.slice(cursor) });

  return {
    projectId: section.projectId,
    title: section.title,
    source: section.source,
    mode: options.mode,
    segments,
    answers,
    spotCount: ordered.length,
  };
}

/** 어법 선택 결과 전부를 어법 수정으로 바꾼다. 만들 수 없는 지문은 건너뛴 목록에 둔다. */
export function buildGrammarFixSections(
  choiceSections: WorkbookGrammarChoiceSection[],
  options: WorkbookGrammarFixOptions
): { sections: WorkbookGrammarFixSection[]; skipped: WorkbookGrammarChoiceSkip[] } {
  const sections: WorkbookGrammarFixSection[] = [];
  const skipped: WorkbookGrammarChoiceSkip[] = [];
  for (const s of choiceSections) {
    const built = buildGrammarFixSection(s, options);
    if (built) sections.push(built);
    else {
      skipped.push({
        projectId: s.projectId,
        title: s.title,
        reason: "어법 수정으로 바꿀 자리가 없어 제외했습니다.",
      });
    }
  }
  return { sections, skipped };
}

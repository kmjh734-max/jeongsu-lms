import type { VocabItem } from "@/types/database";
import { seededRandom, shuffleWith } from "@/lib/vocab/build-stage3-questions";

/**
 * 단어학습 4단계 「동반의어 객관식」.
 *
 * 선생님 요청(2026-10-20): 4단계를 동반의어 테스트지(객관식)로, 5단계를 종합테스트로.
 * 동의어·반의어가 있는 단어만 낸다(없는 단어장은 이 단계를 건너뛴다). 80점 이상이면 통과.
 * 선생님 요청(2026-10-30): 80점이 안 되어도 한 번 보면 5단계를 열어 준다(점수는 그대로 기록).
 * 문항 만드는 법은 테스트 교재의 동반의어 고르기(test-book.ts buildWordTest)와 같다:
 * 정답은 그 단어의 첫 동의어(가끔·동의어가 없으면 반의어). 오답은 품사가 다른 단어와 그 동반의어.
 * 품사가 같으면 cut = divide처럼 오답이 사실상 정답이 된다(선생님 2026-10-30).
 * 시드가 같으면 학생 화면과 서버 채점이 같은 문항을 만든다.
 */

export const SYNONYM_PASS_SCORE = 80;
/** 한 번에 내는 문항 수 상한 */
const MAX_QUESTIONS = 30;

export type SynonymRelation = "synonym" | "antonym";

export interface SynonymQuestion {
  itemId: string;
  word: string;
  meaning: string;
  relation: SynonymRelation;
  choices: string[];
  answerIndex: number;
}

/** 학생 화면에 보내는 문항 — 정답 위치는 서버만 안다. */
export type SynonymClientQuestion = Omit<SynonymQuestion, "answerIndex">;

export type SynonymItem = Pick<VocabItem, "id" | "word" | "meaning" | "synonyms" | "antonyms">;

/** 쉼표·세미콜론·슬래시로 적힌 동반의어 목록을 나눈다 */
export function splitRelated(text: string | null | undefined): string[] {
  return String(text ?? "")
    .split(/[,;/]/)
    .map((s) => s.trim())
    .filter((s) => /[A-Za-z]/.test(s));
}

/** 같은 뿌리(exclusion·excluded)는 오답으로 쓰지 않는다 — 둘 다 답처럼 보인다 */
function stem(w: string): string {
  return w.toLowerCase().replace(/[^a-z]/g, "").slice(0, 5);
}

/** 우리말 뜻을 묶음으로 나눈다: 「함께 쓰다, 나누다」 → [함께, 쓰다], [나누다] */
function meaningPhrases(meaning: string): string[][] {
  return meaning
    .replace(/\([^)]*\)|\[[^\]]*\]/g, " ")
    .split(/[,;/·]+/)
    .map((p) => p.split(/\s+/).map((t) => t.replace(/[^가-힣]/g, "")).filter(Boolean))
    .filter((p) => p.length > 0);
}

/**
 * 뜻 끝 글자로 품사를 가른다. 단어장에 품사가 비어 있어도 쓸 수 있게.
 * 헷갈리면 둘 다로 본다(주인·행운은 명사이기도, 가게·종이는 부사 꼴이기도) — 품사가 겹치면 오답에서 빠지므로 그쪽이 안전하다.
 */
function meaningClasses(token: string): string[] {
  if (/(쁘다|프다|롭다|답다|럽다|좋다|싫다|같다|없다|있다|높다|낮다|크다|작다|많다|적다)$/.test(token)) return ["verb", "adj"];
  if (/다$/.test(token)) return ["verb"];
  if (/(한|운|은|는|인|된|던|른|린|쁜|픈|큰|긴|난)$/.test(token)) return token.length <= 2 && /(운|인|른|난)$/.test(token) ? ["adj", "noun"] : ["adj"];
  if (/(게|히|이|로)$/.test(token)) return ["adv", "noun"];
  return ["noun"];
}

/**
 * 오답이 사실상 정답이 되는 것을 막는 정보: 그 말이 속한 줄들의 품사와 뜻 앞 두 글자.
 * 품사가 같으면 cut·divide, quiet·soft처럼 뜻이 통할 수 있고, 앞 글자가 같으면 afraid(두려운)·fear(두려움)처럼 같은 뜻이다.
 */
export function meaningProfile(meaning: string): { classes: Set<string>; heads: Set<string> } {
  const phrases = meaningPhrases(meaning);
  return {
    classes: new Set(phrases.flatMap((p) => meaningClasses(p[p.length - 1]!))),
    heads: new Set(phrases.flat().filter((t) => t.length >= 2).map((t) => t.slice(0, 2))),
  };
}

export function overlaps(a: Set<string>, b: Set<string>): boolean {
  return [...a].some((x) => b.has(x));
}

export function synonymQuestionSeed(setId: string, studentId: string, attemptNumber: number): string {
  return `syn|${setId}|${studentId}|${attemptNumber}`;
}

export function buildSynonymQuestions(items: SynonymItem[], seed: string): SynonymQuestion[] {
  const rows = [...items]
    .filter((it) => it.word?.trim())
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((it) => {
      // 동의어·반의어에 같은 말이 적혀 있으면(column: row) 어느 쪽도 정답으로 믿을 수 없다
      const synonyms = splitRelated(it.synonyms);
      const antonyms = splitRelated(it.antonyms);
      const inSyn = new Set(synonyms.map((w) => w.toLowerCase()));
      const inAnt = new Set(antonyms.map((w) => w.toLowerCase()));
      return {
        id: it.id,
        word: it.word.trim(),
        meaning: (it.meaning ?? "").trim(),
        synonyms: synonyms.filter((w) => !inAnt.has(w.toLowerCase())),
        antonyms: antonyms.filter((w) => !inSyn.has(w.toLowerCase())),
      };
    });
  const pool = [
    ...new Map(
      rows.flatMap((r) => [r.word, ...r.synonyms, ...r.antonyms]).map((w) => [w.toLowerCase(), w] as const)
    ).values(),
  ];
  const profileOfWord = new Map<string, { classes: Set<string>; heads: Set<string> }>();
  for (const r of rows) {
    const own = meaningProfile(r.meaning);
    for (const w of [r.word, ...r.synonyms, ...r.antonyms].map((x) => x.toLowerCase())) {
      const cur = profileOfWord.get(w) ?? { classes: new Set<string>(), heads: new Set<string>() };
      own.classes.forEach((c) => cur.classes.add(c));
      own.heads.forEach((h) => cur.heads.add(h));
      profileOfWord.set(w, cur);
    }
  }
  const rng = seededRandom(seed);
  const eligible = shuffleWith(
    rows.filter((r) => r.synonyms.length || r.antonyms.length),
    rng
  ).slice(0, MAX_QUESTIONS);

  const out: SynonymQuestion[] = [];
  for (const r of eligible) {
    // 반의어는 세 번에 한 번쯤, 또는 동의어가 없을 때
    const useAnt = r.antonyms.length > 0 && (r.synonyms.length === 0 || rng() < 1 / 3);
    const correct = (useAnt ? r.antonyms : r.synonyms)[0]!;
    const own = new Set([r.word, ...r.synonyms, ...r.antonyms].map((w) => w.toLowerCase()));
    const banned = new Set(own);
    // 다른 단어 줄에 이 단어의 말과 함께 묶인 말(perhaps 줄의 possibly)도 뺀다 — 둘 다 정답이 된다
    for (const other of rows) {
      const group = [other.word, ...other.synonyms, ...other.antonyms].map((w) => w.toLowerCase());
      if (group.some((w) => own.has(w))) {
        group.forEach((w) => banned.add(w));
      }
    }
    const bannedStems = new Set([r.word, correct].map(stem).filter((s) => s.length >= 4));
    const target = meaningProfile(r.meaning);
    const fillers = pool.filter((w) => {
      const key = w.toLowerCase();
      if (banned.has(key) || bannedStems.has(stem(w))) return false;
      return !overlaps(profileOfWord.get(key)?.heads ?? new Set(), target.heads);
    });
    // 품사가 다른 말을 먼저 쓴다. 모자랄 때만 품사가 같은 말로 채운다
    const otherClass = fillers.filter((w) => !overlaps(profileOfWord.get(w.toLowerCase())?.classes ?? new Set(), target.classes));
    // 뜻이 여럿이면(pretty 예쁜; 꽤) 대표 뜻의 품사(형용사)와 겹치는 말을 가장 나중에
    const main = new Set(meaningClasses(meaningPhrases(r.meaning)[0]?.at(-1) ?? ""));
    const sameClass = fillers.filter((w) => !otherClass.includes(w));
    const notMain = sameClass.filter((w) => !overlaps(profileOfWord.get(w.toLowerCase())?.classes ?? new Set(), main));
    const lastResort = sameClass.filter((w) => !notMain.includes(w));
    const wrong = [...shuffleWith(otherClass, rng), ...shuffleWith(notMain, rng), ...shuffleWith(lastResort, rng)].slice(0, 3);
    if (wrong.length < 3) continue;
    const choices = shuffleWith([correct, ...wrong], rng);
    out.push({
      itemId: r.id,
      word: r.word,
      meaning: r.meaning,
      relation: useAnt ? "antonym" : "synonym",
      choices,
      answerIndex: choices.indexOf(correct),
    });
  }
  return out;
}

export function toSynonymClientQuestions(questions: SynonymQuestion[]): SynonymClientQuestion[] {
  return questions.map(({ answerIndex: _a, ...q }) => q);
}

export function scoreSynonymTest(correct: number, total: number): { score: number; passed: boolean } {
  if (total <= 0) return { score: 0, passed: false };
  const score = Math.round((correct / total) * 100);
  return { score, passed: correct * 100 >= SYNONYM_PASS_SCORE * total };
}

/** 4단계를 마쳤는지: 통과했거나 건너뛰었거나, 점수와 상관없이 한 번 봤으면 끝난 것으로 본다 */
export function synonymStepDone(p: {
  stage_syn_passed?: boolean | null;
  stage_syn_skipped?: boolean | null;
  stage_syn_attempt_count?: number | null;
}): boolean {
  return Boolean(p.stage_syn_passed || p.stage_syn_skipped || (p.stage_syn_attempt_count ?? 0) > 0);
}

/** 5단계(종합테스트)를 열어도 되는지: 동반의어를 마쳤거나, 예전에 종합테스트를 이미 본 학생 */
export function finalTestUnlocked(p: {
  stage3_completed: boolean;
  stage_syn_passed?: boolean | null;
  stage_syn_skipped?: boolean | null;
  stage_syn_attempt_count?: number | null;
  stage4_attempt_count?: number | null;
  stage4_passed?: boolean | null;
}): boolean {
  if (!p.stage3_completed) return false;
  return synonymStepDone(p) || Boolean(p.stage4_passed || (p.stage4_attempt_count ?? 0) > 0);
}

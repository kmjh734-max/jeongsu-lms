import type { VocabItem } from "@/types/database";
import { seededRandom, shuffleWith } from "@/lib/vocab/build-stage3-questions";

/**
 * 단어학습 4단계 「동반의어 객관식」.
 *
 * 선생님 요청(2026-10-20): 4단계를 동반의어 테스트지(객관식)로, 5단계를 종합테스트로.
 * 동의어·반의어가 있는 단어만 낸다(없는 단어장은 이 단계를 건너뛴다). 80점 이상이면 통과.
 * 선생님 요청(2026-10-30): 80점이 안 되어도 한 번 보면 5단계를 열어 준다(점수는 그대로 기록).
 * 문항 만드는 법은 테스트 교재의 동반의어 고르기(test-book.ts buildWordTest)와 같다:
 * 정답은 그 단어의 첫 동의어(가끔·동의어가 없으면 반의어), 오답은 단어장의 다른 단어와 그 동반의어에서.
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

export function synonymQuestionSeed(setId: string, studentId: string, attemptNumber: number): string {
  return `syn|${setId}|${studentId}|${attemptNumber}`;
}

export function buildSynonymQuestions(items: SynonymItem[], seed: string): SynonymQuestion[] {
  const rows = [...items]
    .filter((it) => it.word?.trim())
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((it) => ({
      id: it.id,
      word: it.word.trim(),
      meaning: (it.meaning ?? "").trim(),
      synonyms: splitRelated(it.synonyms),
      antonyms: splitRelated(it.antonyms),
    }));
  const pool = [
    ...new Map(
      rows.flatMap((r) => [r.word, ...r.synonyms, ...r.antonyms]).map((w) => [w.toLowerCase(), w] as const)
    ).values(),
  ];
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
    const banned = new Set([r.word, ...r.synonyms, ...r.antonyms].map((w) => w.toLowerCase()));
    // 다른 단어 줄에 정답·문제 낱말과 함께 묶인 말(perhaps 줄의 possibly)도 뺀다 — 둘 다 정답이 된다
    for (const other of rows) {
      const group = [other.word, ...other.synonyms, ...other.antonyms].map((w) => w.toLowerCase());
      if (group.includes(r.word.toLowerCase()) || group.includes(correct.toLowerCase())) {
        group.forEach((w) => banned.add(w));
      }
    }
    const bannedStems = new Set([r.word, correct].map(stem).filter((s) => s.length >= 4));
    const fillers = pool.filter((w) => !banned.has(w.toLowerCase()) && !bannedStems.has(stem(w)));
    if (fillers.length < 3) continue;
    const wrong = shuffleWith(fillers, rng).slice(0, 3);
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

import type { VocabItem } from "@/types/database";

export type Stage3QuestionType = "meaning" | "spelling";

export interface Stage3Question {
  itemId: string;
  questionType: Stage3QuestionType;
  questionText: string;
  promptExtra: string | null;
  correctAnswer: string;
}

/** 학생 화면에 보내는 문항 — 정답은 서버에서만 채점한다. */
export type Stage3ClientQuestion = Omit<Stage3Question, "correctAnswer"> & {
  /** 로그인 없는 QR 학습(기기 안에서 채점)에서만 채운다 */
  correctAnswer?: string;
};

type Rng = () => number;

/** 문자열 → 32bit 시드 (FNV-1a) */
function hashSeed(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** 같은 시드면 서버·브라우저 어디서나 같은 순서를 만든다 (mulberry32) */
export function seededRandom(seed: string): Rng {
  let a = hashSeed(seed);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleWith<T>(arr: T[], rng: Rng = Math.random): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * 종합테스트 문항 (절반 뜻 쓰기 · 절반 스펠링).
 * seed를 주면 결과가 항상 같다 — 학생 화면과 서버 채점이 같은 문항 구성을 쓴다.
 */
export function buildStage3Questions(
  items: Pick<VocabItem, "id" | "word" | "meaning">[],
  seed?: string
): Stage3Question[] {
  const rng = seed ? seededRandom(seed) : Math.random;
  // 조회 순서와 무관하게 같은 결과가 나오도록 id 순으로 고정한 뒤 섞는다
  const base = seed
    ? [...items].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    : items;
  const shuffled = shuffleWith(base, rng);
  const half = Math.ceil(shuffled.length / 2);
  const meaningItems = shuffled.slice(0, half);
  const spellingItems = shuffled.slice(half);

  const meaningQs: Stage3Question[] = meaningItems.map((item) => ({
    itemId: item.id,
    questionType: "meaning",
    questionText: item.word.trim(),
    promptExtra: "영어 단어의 뜻을 입력하세요.",
    correctAnswer: item.meaning.trim(),
  }));

  const spellingQs: Stage3Question[] = spellingItems.map((item) => ({
    itemId: item.id,
    questionType: "spelling",
    questionText: item.meaning.trim(),
    promptExtra: "한글뜻에 맞는 영어 단어를 입력하세요.",
    correctAnswer: item.word.trim(),
  }));

  return shuffleWith([...meaningQs, ...spellingQs], rng);
}

/** 학생별·응시 회차별 종합테스트 시드 (응시할 때마다 구성이 바뀐다) */
export function stage4QuestionSeed(
  setId: string,
  studentId: string,
  attemptNumber: number
): string {
  return `stage4:${setId}:${studentId}:${attemptNumber}`;
}

/** 정답 없이 화면에 보낼 문항 */
export function toClientQuestions(
  questions: Stage3Question[]
): Stage3ClientQuestion[] {
  return questions.map((q) => ({
    itemId: q.itemId,
    questionType: q.questionType,
    questionText: q.questionText,
    promptExtra: q.promptExtra,
  }));
}

/**
 * 점수(표시용)와 합격 여부.
 * 점수는 내림 — 89.66점이 90점으로 올라가 합격처럼 보이지 않게 한다.
 * 합격은 정수 비교(correct×100 ≥ 90×total)로만 판단한다.
 */
export function scoreStage4(
  correctCount: number,
  totalQuestions: number
): { score: number; passed: boolean } {
  if (totalQuestions <= 0) return { score: 0, passed: false };
  const score = Math.floor((correctCount * 100) / totalQuestions);
  const passed = correctCount * 100 >= STAGE4_PASS_SCORE * totalQuestions;
  return { score, passed };
}

export const STAGE3_PASS_SCORE = 90;
export const STAGE4_PASS_SCORE = STAGE3_PASS_SCORE;

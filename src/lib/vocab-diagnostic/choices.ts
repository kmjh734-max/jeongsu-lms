import { seededRandom, shuffleWith } from "@/lib/vocab/build-stage3-questions";

/**
 * 영어 단어 → 우리말 뜻 4지선다 보기.
 *
 * 단어장 뜻 칸은 「기간, 임기; 용어; 조건, 조항」처럼 세미콜론으로 품사 묶음을 나눈다. 보기에는 첫 묶음(대표 뜻)을 쓰고,
 * 오답이 정답과 겹치는지는 모든 뜻(통합 뜻)을 대어 본다. 기존 오답 만들기(generate-test-questions)는 글자가 똑같은
 * 것만 걸러 「아이」와 「어린이」가 함께 나올 수 있었다.
 */

export type PoolWord = { itemId: string; word: string; meaning: string };

/** 대표 뜻 — 첫 품사 묶음에서 앞의 두 뜻까지 */
export function displayMeaning(meaning: string): string {
  const first = String(meaning ?? "").split(/[;\n]/)[0] ?? "";
  const senses = first.split(/[,，、]/).map((s) => s.trim()).filter(Boolean);
  return senses.slice(0, 2).join(", ");
}

export function normalizeSense(value: string): string {
  return value
    .normalize("NFC")
    .replace(/\([^)]*\)|\[[^\]]*\]|<[^>]*>/g, "")
    .replace(/[~∼…"'“”‘’`.!?:]/g, "")
    .replace(/\s+/g, "")
    .trim();
}

/** 통합 뜻 — 모든 품사 묶음의 모든 뜻 */
export function allSenses(meaning: string): string[] {
  return String(meaning ?? "")
    .split(/[,;/·、\n]|[①-⑳]/)
    .map(normalizeSense)
    .filter((s) => s.length > 0);
}

/** 대강의 품사: 동사(…다)·꾸밈말(…한/…인/…의 등)·그 밖(명사·부사) */
export function senseClass(meaning: string): "v" | "a" | "n" {
  const s = normalizeSense(displayMeaning(meaning).split(",")[0] ?? "");
  if (/다$/.test(s)) return "v";
  if (/(한|인|은|운|된|는|큰|든|던)$/.test(s)) return "a";
  return "n";
}

/** 한 낱말이고 대표 뜻이 구 꼴(~, ..., …)이 아니며 너무 길지 않은 단어 — 문항·오답 모두 이것만 쓴다 */
export function isPlainEntry(w: { word: string; meaning: string }): boolean {
  if (!/^[A-Za-z][A-Za-z-]*$/.test(w.word.trim())) return false;
  const d = displayMeaning(w.meaning);
  return d.length > 0 && d.length <= 16 && !/[~∼…]|\.\.\./.test(d);
}

/** 두 단어의 뜻이 겹치는지 — 같은 뜻이 있거나, 한 뜻이 다른 뜻을 품으면(두 글자 이상) 겹친다고 본다 */
export function sensesOverlap(a: string, b: string): boolean {
  const sa = allSenses(a);
  const sb = allSenses(b);
  for (const x of sa) {
    for (const y of sb) {
      if (x === y) return true;
      const [short, long] = x.length <= y.length ? [x, y] : [y, x];
      if (short.length >= 2 && long.includes(short)) return true;
    }
  }
  return false;
}

/**
 * 오답 셋을 고른다. 같은 품사 → 아무 품사 순으로 찾고, 정답·서로와 뜻이 겹치는 것, 대표 뜻이 같은 것은 뺀다.
 * 모자라면 null(관리자가 단어를 바꾼다).
 */
export function pickDistractors(target: PoolWord, pool: PoolWord[], seed: string): string[] | null {
  const rng = seededRandom(seed);
  const cls = senseClass(target.meaning);
  // 숙어(be afraid of)·구 뜻(「~까지」「...할 때」)은 꼴만 보고 오답인 줄 알 수 있어 오답 후보에서 뺀다
  const shuffled = shuffleWith(
    pool.filter((p) => p.itemId !== target.itemId && p.word.toLowerCase() !== target.word.toLowerCase() && isPlainEntry(p)),
    rng,
  );
  const ordered = [...shuffled.filter((p) => senseClass(p.meaning) === cls), ...shuffled.filter((p) => senseClass(p.meaning) !== cls)];
  const picked: PoolWord[] = [];
  const shown = new Set([normalizeSense(displayMeaning(target.meaning))]);
  for (const cand of ordered) {
    if (picked.length === 3) break;
    const d = displayMeaning(cand.meaning);
    if (!d || shown.has(normalizeSense(d))) continue;
    if (sensesOverlap(cand.meaning, target.meaning)) continue;
    if (picked.some((p) => sensesOverlap(p.meaning, cand.meaning))) continue;
    picked.push(cand);
    shown.add(normalizeSense(d));
  }
  return picked.length === 3 ? picked.map((p) => displayMeaning(p.meaning)) : null;
}

/** 정답 + 오답 셋을 섞어 보기 넷과 정답 자리를 만든다 */
export function buildChoices(target: PoolWord, pool: PoolWord[], seed: string): { choices: string[]; answerIndex: number } | null {
  const wrong = pickDistractors(target, pool, seed);
  if (!wrong) return null;
  const answer = displayMeaning(target.meaning);
  const choices = shuffleWith([answer, ...wrong], seededRandom(`${seed}:order`));
  return { choices, answerIndex: choices.indexOf(answer) };
}

/** 응시자마다 문항 차례와 보기 차례를 섞는다. 정답 자리(answerIndex)도 같이 옮긴다. */
export function personalOrder<Q extends { choices: string[]; answerIndex: number }>(questions: Q[], seed: string): Q[] {
  const rng = seededRandom(seed);
  return shuffleWith(questions, rng).map((q) => {
    const order = shuffleWith(q.choices.map((_, i) => i), rng);
    return { ...q, choices: order.map((i) => q.choices[i]!), answerIndex: order.indexOf(q.answerIndex) };
  });
}

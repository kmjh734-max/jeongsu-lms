/**
 * 유형이 같아도 <b>묻는 자리</b>가 다르면 학생에게는 다른 문제다.
 *
 * 선생님 지시(2026-10-01): 「유형이 일치하면 더 세부적인 게 일치하는지도 확인해야지」.
 * 맞는 말이다. 빈칸추론이 같아도 빈칸이 다른 문장이면 못 맞춘 것이고, 어법이 같아도
 * 밑줄 친 자리가 다르면 다른 문제다.
 *
 * 시험지 쪽에는 지문 전체가 없다(앞 150자뿐). 대신 <b>answer_guess</b>에 실제로 무엇을
 * 물었는지가 들어 있다 — 「① what → that, ③ to conversing → to converse」,
 * 「② installed -- figure -- try」, 「② need to measure the size and incline…」.
 * 내 문항 쪽에서는 밑줄 안·빈칸 자리·정답이 「묻는 자리」다. 둘을 맞춰 본다.
 *
 * 모델을 부르지 않는다(글자만 본다).
 */

const STOP = new Set(
  ("the a an and or but of to in on for with as at by from is are was were be been being it its this that these those their his her they we you i not no can will would could should may might do does did have has had more most than then so such which who whom whose what when where how why about into over under between among own same other another each every all any some one two three new good well also just only very much many".split(
    " "
  ))
);

const content = (s: string): string[] =>
  (String(s ?? "").toLowerCase().match(/[a-z][a-z'-]{2,}/g) ?? []).filter((w) => !STOP.has(w));

/** 시험지가 물은 자리의 낱말 — 정답 짐작·어법 포인트에서 */
export function examAskedWords(answerGuess: string | null, grammarPoint: string | null): string[] {
  return [...new Set([...content(answerGuess ?? ""), ...content(grammarPoint ?? "")])];
}

/**
 * 시험지 쪽 글에서 그 문항이 물은 자리를 뽑는다.
 *
 * 문항표의 passage_excerpt 는 앞 150자뿐이라 빈칸·밑줄이 안 들어 있다. 쪽 글에는
 * 읽을 때 남긴 <u>…</u>·______ 가 그대로 있다(시험지 15개 모두 남아 있었다 —
 * 2026-10-01 확인). 앞부분을 실마리로 자리를 찾아 그 둘레만 본다.
 */
export function examAskedWordsFromPage(pageText: string, passageExcerpt: string): string[] {
  const hay = String(pageText ?? "");
  const head = String(passageExcerpt ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 8)
    .join(" ");
  if (head.length < 20 || hay.length < 40) return [];
  const norm = (x: string) => x.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ");
  const at = norm(hay).indexOf(norm(head));
  if (at < 0) return [];
  // 지문 하나 분량만 본다 — 더 넓히면 다른 문항의 밑줄이 섞인다
  const win = hay.slice(Math.max(0, at - 200), at + 1800);
  const out: string[] = [];
  for (const m of win.matchAll(/<u>([\s\S]*?)<\/u>/g)) out.push(...content(m[1] ?? ""));
  for (const m of win.matchAll(/_{3,}/g)) {
    if (m.index === undefined) continue;
    out.push(...content(win.slice(Math.max(0, m.index - 70), m.index)).slice(-6));
    out.push(...content(win.slice(m.index + m[0].length, m.index + m[0].length + 70)).slice(0, 6));
  }
  return [...new Set(out)];
}

/** 내 문항이 물은 자리의 낱말 — 밑줄 안, 빈칸 앞뒤, 정답 */
export function myAskedWords(q: {
  passageModified?: string | null;
  correctAnswer?: unknown;
  questionText?: string | null;
  choices?: Array<{ text?: string }> | null;
}): string[] {
  const mod = String(q.passageModified ?? "");
  const out: string[] = [];
  // 밑줄 안
  for (const m of mod.matchAll(/<u>([\s\S]*?)<\/u>/g)) out.push(...content(m[1] ?? ""));
  // 빈칸 앞뒤 여섯 낱말
  for (const m of mod.matchAll(/_{3,}/g)) {
    if (m.index === undefined) continue;
    out.push(...content(mod.slice(Math.max(0, m.index - 60), m.index)).slice(-6));
    out.push(...content(mod.slice(m.index + m[0].length, m.index + m[0].length + 60)).slice(0, 6));
  }
  // 정답
  if (typeof q.correctAnswer === "string") out.push(...content(q.correctAnswer));
  // 객관식이면 정답 보기
  const no = Number(q.correctAnswer);
  if (Number.isFinite(no) && Array.isArray(q.choices)) {
    out.push(...content(q.choices[no - 1]?.text ?? ""));
  }
  return [...new Set(out)];
}

/**
 * 같은 자리를 물었는가.
 *  - 둘 가운데 한쪽이 비면 잴 수 없다(null)
 *  - 겹치는 알맹이 낱말이 둘 이상이면 같은 자리로 본다
 *
 * 한 낱말만 겹치는 것은 우연이 잦다(the·of 같은 것은 이미 뺐지만 common·people 등은 남는다).
 */
export function askedSameSpot(exam: string[], mine: string[]): boolean | null {
  if (exam.length === 0 || mine.length === 0) return null;
  const set = new Set(exam);
  const shared = mine.filter((w) => set.has(w));
  if (shared.length === 0) return false;
  return shared.length >= 2;
}

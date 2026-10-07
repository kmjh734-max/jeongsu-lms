/**
 * 워크북 「중요문장 어순배열」에 쓸 문장 고르기 — 외울 만한 문장만.
 *
 * 선생님 요청(2026-10-07): "중요문장만 골라서 어순배열… 외울만한 문장, 주제문이거나 중요문장",
 * 이어서 "구조가 복잡한 문장(가목적어 같은 것)도 포함".
 * 새로 모델을 부르지 않고 이미 만들어 둔 표시를 먼저 쓴다.
 * [핵심 문장, 3개까지]
 *  1. 분석서 문장 꼬리표 「주제문」(원문이 그대로일 때만)
 *  2. 빈칸 후보를 만들 때 고른 핵심 문장(coreSentenceIds: 주제문·중심 주장·대조·인과·결론)
 *  3. 그래도 모자라면 결론·주장 표지어(therefore, must, it is important…)나 대조 뒤 주장(However…)이 있는 문장만
 *     — 자리(첫·끝 문장)만으로는 채우지 않는다. 개수를 채우기보다 확실한 문장만(실제 지문 대조 2026-10-07).
 * [구조 문장, 2개까지] 가목적어·가주어·강조구문·도치 같은 구문 규칙에 맞는 문장(긴 것부터),
 *   그다음 분석서 「서술형 대비」 꼬리표 가운데 15낱말 이상인 것.
 * 지문 차례대로 돌려준다.
 */

export const KEY_SENTENCE_MAX = 5;
const CORE_MAX = 3;
const STRUCTURE_MAX = 2;
const MIN_WORDS = 6;
const MAX_WORDS = 40;

/** 외워 둘 만한 복잡한 구문. 맞으면 이름을 돌려준다(여러 개면 첫 것). */
const STRUCTURES: Array<[string, RegExp]> = [
  ["가목적어", /\b(?:make|makes|made|making|find|finds|found|finding|think|thinks|thought|consider|considers|considered|believe|believes|believed|keep|keeps|kept)\s+it\s+(?:\w+\s+){0,2}(?:to\s+\w+|that\b|for\s+\w+\s+to\b)/i],
  ["강조구문", /\b[Ii]t\s+(?:is|was)\s+(?:not\s+(?:until\s+)?)?(?:only\s+)?[^,.]{1,40}?\s+(?:that|who)\s+\w+/],
  ["가주어", /\b[Ii]t\s+(?:is|was|will be|would be|can be|may be|has been|seems|seemed)\s+(?:\w+\s+){0,3}(?:to\s+\w+|that\b|whether\b|for\s+\w+(?:\s+\w+)?\s+to\b)/],
  ["도치", /^(?:Not only|Never|Rarely|Seldom|Hardly|Little|Only (?:when|after|if|by|then|in)|No sooner|Nor|Not until)\b[^,]*?\b(?:do|does|did|is|are|was|were|has|have|had|can|could|will|would|should)\b/],
  ["the 비교급", /\bthe\s+(?:more|less|\w+er)\b[^,]*,\s*the\s+(?:more|less|\w+er)\b/i],
  ["관계대명사 what", /(?:^|[,;]\s+|\b(?:is|was|of|to|in|on|by|from|for|with|about)\s+)what\s+\w+/i],
  ["so ~ that", /\bso\s+\w+(?:\s+\w+)?\s+that\b/i],
  ["분사구문", /^(?:[A-Z]\w+ing|Having\s+\w+|[A-Z]\w+ed)\b[^,]{2,60},\s+(?:the\s+|a\s+|an\s+)?\w+/],
  ["동격 that", /\b(?:fact|idea|belief|notion|evidence|news|possibility|assumption|feeling|sense|hope|truth)\s+that\b/i],
];

export function structureOf(text: string): string | null {
  for (const [name, re] of STRUCTURES) if (re.test(text)) return name;
  return null;
}

type Sentence = { id: string; english: string };

type MarkupLike = { text?: string; tags?: readonly string[] } | undefined;

const norm = (t: string) => t.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, " ").trim().toLowerCase();
const words = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;

const CLAIM_MARKER = /\b(?:therefore|thus|hence|in short|in sum|to sum up|in conclusion|as a result|consequently|this means|this shows|this suggests|in other words|the key|the point|the lesson|what matters|must|should|need to|have to|it is (?:important|essential|crucial|necessary))\b/i;
const CONTRAST_OPENER = /^(?:however|but|yet|instead|rather|in fact|actually)\b/i;

/** 규칙 점수 — 변형문제 빈칸 문장 고르기(generate-question)와 같은 기준 */
export function sentenceImportance(text: string, index: number, total: number): number {
  const n = words(text);
  let s = 0;
  if (/\b(?:therefore|thus|hence|in short|in sum|to sum up|in conclusion|as a result|consequently|this means|this shows|this suggests|in other words|the key|the point|the lesson|what matters|must|should|need to|have to|it is (?:important|essential|crucial|necessary))\b/i.test(text)) s += 3;
  if (/^(?:however|but|yet|instead|rather|in fact|actually)\b/i.test(text)) s += 2;
  if (index === total - 1) s += 2;
  if (index === 0) s += 1;
  if (/^(?:for example|for instance|such as|to illustrate|e\.g\.)\b/i.test(text)) s -= 3;
  if (/\?\s*["”’]?$/.test(text)) s -= 4;
  if (/["“”]/.test(text)) s -= 2;
  if (n >= 10 && n <= 22) s += 1;
  return s;
}

function usable(text: string): boolean {
  const n = words(text);
  if (n < MIN_WORDS || n > MAX_WORDS) return false;
  if (/\?\s*["”’]?$/.test(text)) return false; // 묻는 문장은 외울 문장이 아니다
  return true;
}

export function pickKeySentenceIds(input: {
  sentences: Sentence[];
  analysisSentences?: Array<{ itemId: string; markup?: MarkupLike }> | null;
  coreSentenceIds?: string[] | null;
  max?: number;
}): string[] {
  const max = input.max ?? KEY_SENTENCE_MAX;
  const list = input.sentences.filter((s) => s.english.trim());
  const byId = new Map(list.map((s) => [s.id, s]));
  const picked: string[] = [];
  const add = (id: string, limit: number) => {
    const s = byId.get(id);
    if (!s || picked.includes(id) || picked.length >= Math.min(limit, max) || !usable(s.english)) return;
    picked.push(id);
  };
  // 분석서 꼬리표 — 표시가 붙은 원문이 지금 문장과 같을 때만 믿는다
  const tagged = (tag: string) =>
    (input.analysisSentences ?? [])
      .filter((a) => byId.has(a.itemId) && a.markup?.tags?.includes(tag) && (!a.markup.text || norm(a.markup.text) === norm(byId.get(a.itemId)!.english)))
      .map((a) => a.itemId);

  // [핵심 문장] 1. 「주제문」 2. 빈칸 후보 핵심 문장 3. 규칙 점수(지문이 짧으면 덜 고른다)
  const coreLimit = list.length <= 4 ? 2 : CORE_MAX;
  for (const id of tagged("주제문")) add(id, coreLimit);
  for (const id of input.coreSentenceIds ?? []) add(id, coreLimit);
  if (picked.length < coreLimit) {
    const ranked = list
      .map((s, i) => ({ id: s.id, text: s.english, score: sentenceImportance(s.english, i, list.length) }))
      .filter((x) => x.score >= 2 && (CLAIM_MARKER.test(x.text) || CONTRAST_OPENER.test(x.text)))
      .sort((a, b) => b.score - a.score);
    for (const r of ranked) add(r.id, coreLimit);
  }
  // [구조 문장] 「서술형 대비」 꼬리표 → 구문 규칙(가목적어·가주어·강조·도치…), 긴 문장부터
  const structureLimit = picked.length + STRUCTURE_MAX;
  const structured = list.filter((s) => structureOf(s.english)).sort((a, b) => words(b.english) - words(a.english));
  for (const s of structured) add(s.id, structureLimit);
  for (const id of tagged("서술형 대비")) if (words(byId.get(id)!.english) >= 15) add(id, structureLimit);

  // 지문 차례대로
  const order = new Map(list.map((s, i) => [s.id, i]));
  return picked.sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0));
}

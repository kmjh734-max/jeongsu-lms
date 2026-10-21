/**
 * 단어장 여러 개를 함께 인쇄할 때의 자료 이름 — 「2개 단어세트」 대신 단어장 이름과 범위.
 * 선생님 요청(2026-10-21): 단어장 이름이 나오고 범위가 나오게.
 *
 *   ["중1 Day 1", "중1 Day 2", "중1 Day 3"]      → "중1 Day 1~3"
 *   ["EngCore 중학필수 01", "EngCore 중학필수 05"] → "EngCore 중학필수 01~05"
 *   ["수능 기출 어휘", "내신 빈출 어휘"]            → "수능 기출 어휘 ~ 내신 빈출 어휘"
 */
export function vocabSetsRangeTitle(titles: string[]): string {
  const list = titles.map((t) => t.trim()).filter(Boolean);
  if (list.length === 0) return "단어장";
  if (list.length === 1) return list[0]!;
  const first = list[0]!;
  const last = list[list.length - 1]!;

  // 모두에게 같은 앞부분(낱말 경계까지)
  let prefix = first;
  for (const t of list) {
    let i = 0;
    while (i < prefix.length && i < t.length && prefix[i] === t[i]) i++;
    prefix = prefix.slice(0, i);
  }
  // 숫자 한가운데에서 끊기면(Day 1·Day 12) 숫자 앞까지 물린다
  while (prefix && /\d/.test(prefix[prefix.length - 1]!)) prefix = prefix.slice(0, -1);
  // 모두에게 같은 뒷부분(「 모의고사 단어」「 (천재)」). 숫자 한가운데에서는 끊지 않는다.
  const rests = list.map((t) => t.slice(prefix.length));
  let suffix = rests[0]!;
  for (const r of rests) {
    let i = 0;
    while (i < suffix.length && i < r.length && suffix[suffix.length - 1 - i] === r[r.length - 1 - i]) i++;
    suffix = suffix.slice(suffix.length - i);
  }
  while (suffix && /\d/.test(suffix[0]!)) suffix = suffix.slice(1);
  const cut = (t: string) => t.slice(prefix.length, t.length - suffix.length).trim();
  const a = cut(first);
  const b = cut(last);
  const head = prefix.trimEnd();
  // 번호가 다른 묶음(Day 1~3, 3~6월)만 범위로 줄인다. 이름이 다르면 낱말 중간이 잘리므로 「처음 ~ 끝」.
  const numbered = /^\d/.test(a) && /^\d/.test(b);
  if (numbered && (head.length >= 2 || suffix.trim().length >= 2) && a.length <= 12 && b.length <= 12) {
    const sep = head && /[\s(\-·]$/.test(prefix) ? " " : "";
    return `${head}${sep}${a}~${b}${suffix}`.replace(/\s+/g, " ").trim();
  }
  return `${first} ~ ${last}`;
}

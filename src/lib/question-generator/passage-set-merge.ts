/**
 * 1지문 다문항: 표시형 문항 여럿의 지문(빈칸·밑줄을 친 꼴)을 원문 위에 겹쳐 한 지문으로 만든다.
 *
 * 선생님 결정(2026-10-11): 시험지에 지문을 한 번 더 찍지 말 것. 「제시어 배열한 문장은 빼고 어법이나 어휘
 * 같은 것을 만들면 되잖아」 — 문항마다 원문에서 바꾼 자리만 떼어 한 지문에 모은다. 문항은 저마다 원문 위에서
 * 만들고 검수하므로 각자 그대로 성립하고, 시험지에 찍을 지문만 합친다.
 *
 * 낱말 단위로 원문과 견주어(최장 공통 부분열) 바뀐 토막을 찾고, 토막끼리 겹치면 합치지 않는다(null).
 */

type Edit = { from: number; to: number; ins: string[] };

const tokens = (s: string) => String(s ?? "").trim().split(/\s+/).filter(Boolean);

/** 원문 낱말 [from, to)를 ins로 바꾸는 토막들 */
function editsBetween(orig: string[], mod: string[]): Edit[] {
  const n = orig.length;
  const m = mod.length;
  // dp[i][j] = orig[i..], mod[j..]의 최장 공통 부분열 길이
  const dp: Uint16Array[] = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i]![j] = orig[i] === mod[j] ? dp[i + 1]![j + 1]! + 1 : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
    }
  }
  const edits: Edit[] = [];
  let i = 0;
  let j = 0;
  let cur: Edit | null = null;
  const flush = () => {
    if (cur && (cur.to > cur.from || cur.ins.length > 0)) edits.push(cur);
    cur = null;
  };
  while (i < n || j < m) {
    if (i < n && j < m && orig[i] === mod[j]) {
      flush();
      i++;
      j++;
    } else if (j < m && (i >= n || dp[i]![j + 1]! >= dp[i + 1]![j]!)) {
      cur ??= { from: i, to: i, ins: [] };
      cur.ins.push(mod[j]!);
      j++;
    } else {
      cur ??= { from: i, to: i, ins: [] };
      i++;
      cur.to = i;
    }
  }
  flush();
  return edits;
}

/**
 * 원문 위에 표시형 문항들의 지문을 겹친다. 바꾼 자리가 서로 겹치거나 원문이 달라 맞출 수 없으면 null —
 * 그때는 부른 쪽이 지문을 문항마다 따로 찍는다.
 */
export function mergeMarkedPassages(original: string, modifieds: string[]): string | null {
  const orig = tokens(original);
  if (orig.length === 0 || modifieds.length === 0) return null;
  if (modifieds.length === 1) return modifieds[0]!.trim();
  const all: Edit[] = [];
  for (const mod of modifieds) {
    const edits = editsBetween(orig, tokens(mod));
    // 원문과 거의 다르면(다른 지문이거나 통째로 고쳐 씀) 합치지 않는다
    const changed = edits.reduce((s, e) => s + (e.to - e.from), 0);
    if (changed > orig.length * 0.6) return null;
    all.push(...edits);
  }
  all.sort((a, b) => a.from - b.from || a.to - b.to);
  for (let k = 1; k < all.length; k++) {
    const prev = all[k - 1]!;
    const next = all[k]!;
    // 겹치는 토막, 같은 자리에 둘 다 끼워 넣기는 합칠 수 없다
    if (next.from < prev.to) return null;
    if (next.from === prev.from && (prev.to === prev.from || next.to === next.from)) return null;
  }
  const out: string[] = [];
  let pos = 0;
  for (const e of all) {
    out.push(...orig.slice(pos, e.from), ...e.ins);
    pos = e.to;
  }
  out.push(...orig.slice(pos));
  return out.join(" ");
}

/** 이미 표시가 들어간 문장들 — 뒤에 만드는 표시형 문항이 피하게 알려 준다 */
export function markedSentences(original: string, modified: string): string[] {
  const orig = tokens(original);
  const edits = editsBetween(orig, tokens(modified));
  if (edits.length === 0) return [];
  // 원문을 문장으로 나눠 바뀐 낱말이 든 문장만 고른다
  const ends: number[] = [];
  orig.forEach((t, k) => {
    if (/[.!?]["”’)]?$/.test(t)) ends.push(k);
  });
  if (ends[ends.length - 1] !== orig.length - 1) ends.push(orig.length - 1);
  const picked = new Set<number>();
  for (const e of edits) {
    const last = Math.max(e.from, e.to - 1);
    for (let k = 0, start = 0; k < ends.length; start = ends[k]! + 1, k++) {
      if (e.from <= ends[k]! && last >= start) picked.add(k);
    }
  }
  return [...picked].sort((a, b) => a - b).map((k) => {
    const start = k === 0 ? 0 : ends[k - 1]! + 1;
    return orig.slice(start, ends[k]! + 1).join(" ");
  });
}

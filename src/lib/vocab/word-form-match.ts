/**
 * 예문 속에서 단어(와 흔한 변화형)를 찾는다 — 인쇄 강조·인쇄 시험지 빈칸 공통.
 *
 * - 단어 경계를 지킨다: state → states/stated/stating 은 찾고 statistics 는 안 찾는다.
 * - 흔한 변화형: -s/-es/-ed/-d/-ing/-er/-est/-ly, y→ies/ied, e 탈락(make→making),
 *   자음 겹침(stop→stopped), f→ves.
 * - loose: 학생 3단계 빈칸과 같은 규칙(앞부분이 같고 4글자 이내로 길어짐)도 함께 본다.
 *   시험지 빈칸에서 답이 새지 않게 할 때 쓴다.
 */

const TOKEN_RE = /[A-Za-z][A-Za-z'’-]*/g;

function norm(value: string): string {
  return value.trim().toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, " ");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function inflectedForms(word: string): Set<string> {
  const w = word;
  const out = new Set<string>([w]);
  for (const suf of ["s", "es", "ed", "d", "ing", "er", "ers", "est", "ly"]) {
    out.add(w + suf);
  }
  if (w.endsWith("e") && w.length > 2) {
    const base = w.slice(0, -1);
    for (const suf of ["ing", "ed", "er", "ers", "est", "ion", "ions"]) {
      out.add(base + suf);
    }
  }
  if (/[^aeiou]y$/.test(w)) {
    const base = w.slice(0, -1);
    for (const suf of ["ies", "ied", "ier", "iest", "ily", "iness"]) {
      out.add(base + suf);
    }
  }
  if (/[^aeiou][aeiou][bdgklmnprtvz]$/.test(w)) {
    const last = w.slice(-1);
    for (const suf of ["ing", "ed", "er", "ers", "est"]) {
      out.add(w + last + suf);
    }
  }
  if (w.endsWith("fe")) out.add(`${w.slice(0, -2)}ves`);
  else if (w.endsWith("f")) out.add(`${w.slice(0, -1)}ves`);
  if (w.endsWith("ic")) out.add(`${w}ally`);
  return out;
}

/** 학생 3단계 빈칸 규칙과 같다(src/lib/vocab/example-blank.ts 의 wordsMatchForBlank). */
function looseMatch(word: string, token: string): boolean {
  if (word === token) return true;
  const shorter = word.length <= token.length ? word : token;
  const longer = word.length <= token.length ? token : word;
  return longer.startsWith(shorter) && longer.length - shorter.length <= 4;
}

export function isWordFormMatch(
  word: string,
  token: string,
  opts?: { loose?: boolean }
): boolean {
  const w = norm(word);
  let t = norm(token);
  if (!w || !t) return false;
  if (t.endsWith("'s")) t = t.slice(0, -2);
  if (w === t) return true;
  if (inflectedForms(w).has(t)) return true;
  return opts?.loose === true && looseMatch(w, t);
}

export type WordRange = { start: number; end: number };

/** 문장 안에서 단어(변화형 포함)가 나오는 모든 위치 */
export function findWordFormRanges(
  sentence: string,
  word: string,
  opts?: { loose?: boolean }
): WordRange[] {
  const target = norm(word);
  if (!sentence || !target) return [];

  // 여러 단어로 된 표현(take part in 등) — 각 단어 뒤에 흔한 어미를 허용
  if (target.includes(" ")) {
    const parts = target.split(" ").filter(Boolean);
    const pattern = parts
      .map((p) => `${escapeRegExp(p)}(?:s|es|d|ed|ing)?`)
      .join("[\\s-]+");
    // 앞쪽 단어 경계는 lookbehind 대신 캡처로(오래된 사파리 대비)
    const re = new RegExp(`(^|[^A-Za-z])(${pattern})(?![A-Za-z])`, "gi");
    const ranges: WordRange[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(sentence)) !== null) {
      const lead = m[1] ?? "";
      const hit = m[2] ?? "";
      if (hit.length === 0) {
        re.lastIndex += 1;
        continue;
      }
      const start = m.index + lead.length;
      ranges.push({ start, end: start + hit.length });
    }
    return ranges;
  }

  const ranges: WordRange[] = [];
  for (const m of sentence.matchAll(TOKEN_RE)) {
    let token = m[0];
    // 끝에 붙은 하이픈·따옴표는 떼고 본다
    token = token.replace(/['’-]+$/, "");
    if (!token) continue;
    if (isWordFormMatch(target, token, opts)) {
      const start = m.index ?? 0;
      ranges.push({ start, end: start + token.length });
    }
  }
  return ranges;
}

/**
 * 문장 안의 단어(변화형 포함)를 모두 빈칸으로 바꾼다.
 * 찾지 못하면 null. tokens 에는 빈칸 자리에 있던 실제 표기가 담긴다.
 */
export function blankWordForms(
  sentence: string,
  word: string,
  blank = "______"
): { text: string; tokens: string[] } | null {
  let ranges = findWordFormRanges(sentence, word);
  if (ranges.length === 0) {
    ranges = findWordFormRanges(sentence, word, { loose: true });
  }
  if (ranges.length === 0) return null;
  let text = "";
  let last = 0;
  const tokens: string[] = [];
  for (const r of ranges) {
    text += sentence.slice(last, r.start) + blank;
    tokens.push(sentence.slice(r.start, r.end));
    last = r.end;
  }
  text += sentence.slice(last);
  return { text, tokens };
}

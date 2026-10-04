/**
 * 어법 문항에서 「틀린 자리」가 원문 낱말의 형태를 바꾼 것인지 본다.
 *
 * 어법 오류는 원문 낱말의 형태를 바꿔 만든다(make → making, which → what, is → are). 전혀 다른 낱말로
 * 갈아 끼우면(without → tried) 문법으로 고칠 수 없는 「원문 복원」 문제가 된다(7차 시험 2026-10-04).
 * 관계사·대명사·관사·be·have·do처럼 같은 무리 안에서 바꾼 것은 어법 오류로 본다.
 */

const CLASSES: string[][] = [
  ["what", "which", "that", "where", "when", "who", "whom", "whose", "how", "why", "whether", "if", "whatever", "whoever", "whichever"],
  ["it", "its", "they", "them", "their", "this", "these", "those", "that", "one", "ones", "itself", "themselves", "he", "him", "his", "she", "her"],
  ["a", "an", "the"],
  ["much", "many", "few", "little", "less", "fewer", "more", "most"],
  ["be", "am", "is", "are", "was", "were", "been", "being"],
  ["have", "has", "had", "having"],
  ["do", "does", "did", "done", "doing"],
  ["to", "for", "of", "with", "in", "on", "at", "by", "from", "into"],
  ["and", "or", "but", "nor", "so", "yet"],
  ["as", "like", "than"],
  ["although", "though", "despite", "because", "while", "whereas", "unless", "during", "since", "after", "before", "until"],
  ["can", "could", "will", "would", "shall", "should", "may", "might", "must"],
];

const IRREG: Record<string, string> = {
  went: "go", gone: "go", made: "make", took: "take", taken: "take", gave: "give", given: "give",
  saw: "see", seen: "see", came: "come", knew: "know", known: "know", thought: "think",
  brought: "bring", bought: "buy", found: "find", left: "leave", felt: "feel", kept: "keep",
  held: "hold", told: "tell", said: "say", began: "begin", begun: "begin", ran: "run",
  wrote: "write", written: "write", rose: "rise", risen: "rise", lay: "lie", lain: "lie",
  laid: "lay", fell: "fall", fallen: "fall", grew: "grow", grown: "grow", spoke: "speak",
  spoken: "speak", chose: "choose", chosen: "choose", better: "good", best: "good",
  worse: "bad", worst: "bad", children: "child", men: "man", women: "woman", people: "person",
  bore: "bear", born: "bear", borne: "bear", led: "lead", meant: "mean", sent: "send",
  spent: "spend", became: "become", built: "build", caught: "catch", taught: "teach", sought: "seek",
};

const clean = (w: string) => w.toLowerCase().replace(/[^a-z]/g, "");
// 앞 세 글자로 견준다(became/becoming, take/taking이 네 글자에서 갈렸다)
const stem = (w: string) => (IRREG[w] ?? w).slice(0, 3);

function related(original: string, underlined: string): boolean {
  const wa = original.split(/\s+/).map(clean).filter(Boolean);
  const wb = underlined.split(/\s+/).map(clean).filter(Boolean);
  if (wa.length === 0 || wb.length === 0) return true;
  for (const x of wa) {
    for (const y of wb) {
      if (stem(x) === stem(y)) return true;
      if ((x.length <= 3 && y.startsWith(x)) || (y.length <= 3 && x.startsWith(y))) return true;
      if (CLASSES.some((c) => c.includes(x) && c.includes(y))) return true;
    }
  }
  return false;
}

const plain = (s: string) =>
  s.replace(/<[^>]+>/g, "").replace(/[ⓐ-ⓖ①-⑤]/g, "").replace(/\s+/g, " ").trim();
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** 원문 낱말과 관계없는 낱말로 바꾼 밑줄 자리들 */
export function grammarSwapSpots(passageOriginal: string, passageModified: string): Array<{ original: string; underlined: string }> {
  const orig = plain(passageOriginal);
  const out: Array<{ original: string; underlined: string }> = [];
  const spots = passageModified.matchAll(
    /((?:[A-Za-z’'-]+[\s,;:]+){0,2})(?:[ⓐ-ⓖ①-⑤]\s*)?<u>([\s\S]*?)<\/u>((?:[\s,;:]+[A-Za-z’'-]+){0,2})/g
  );
  for (const m of spots) {
    const before = plain(m[1] ?? "");
    const under = plain(m[2] ?? "");
    const after = plain(m[3] ?? "");
    if (!under || orig.includes(plain(`${m[1] ?? ""}${m[2] ?? ""}${m[3] ?? ""}`))) continue; // 원문 그대로인 자리
    // 앞뒤 문맥이 둘 다 있어야 원문 자리를 바르게 찾는다(한쪽만 있으면 엉뚱한 자리를 잡았다)
    if (!before || !after) continue;
    const found = orig.match(new RegExp(`${esc(before)}\\s*(.{1,60}?)\\s*${esc(after)}`));
    if (!found) continue;
    const original = found[1]!.trim();
    if (original.split(/s+/).length > 3) continue; // 문장 경계를 넘어 잡은 것
    if (!related(original, under)) out.push({ original, underlined: under });
  }
  return out;
}

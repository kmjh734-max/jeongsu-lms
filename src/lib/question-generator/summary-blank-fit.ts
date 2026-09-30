/**
 * 요약문 빈칸: 정답을 끼운 문장이 어법에 맞는지 본다.
 *
 * 선생님 지적(2026-09-30): 서술형 요약 문제에서 어법 구조에 안 맞게 답이 들어간다.
 * 만들어 둔 293문항을 읽어 보니 깨지는 자리가 두 가지였다.
 *
 *  · 정답 토막이 전치사·접속사로 끝나는데 빈칸 뒤가 바로 쉼표거나 문장 끝이라
 *    붙을 말이 없다 — "gives them instant credibility with, and this is why …"
 *  · 정답을 끼우면 같은 낱말이 바로 겹친다 — "have been published and understood and understood"
 *
 * "is registered by the eyes"처럼 빈칸 뒤로 말이 이어지면 멀쩡하므로, 뒤가 끊길 때만 본다.
 */

/** 이것으로 끝나면 뒤에 붙을 말이 있어야 한다 */
const NEEDS_MORE = new Set([
  "a", "an", "the", "and", "or", "but", "of", "to", "in", "on", "at", "by", "for",
  "with", "from", "into", "than", "as", "that", "which", "who", "is", "are", "was",
  "were", "be", "been", "am", "do", "does", "did", "has", "have", "had", "their",
  "its", "his", "her", "our", "your", "my", "this", "these", "those", "not", "so",
]);

/** "ⓐ: x / ⓑ: y" → 기호별 답. 기호가 없으면 빈 map */
export function splitSummaryAnswer(answer: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const part of String(answer ?? "").split(/\s*\/\s*/)) {
    const m = part.match(/^\s*([ⓐ-ⓖ])\s*[:：]\s*(.+)$/);
    if (m) out.set(m[1]!, m[2]!.trim());
  }
  return out;
}

/**
 * 어법이 깨지면 까닭을 돌려준다. 멀쩡하면 null.
 */
export function summaryBlankFitProblem(
  summary: string,
  answer: string
): string | null {
  const byMark = splitSummaryAnswer(answer);
  if (byMark.size === 0) return null;

  for (const [mark, word] of byMark) {
    const last =
      word.toLowerCase().replace(/[^a-z']+$/, "").split(/\s+/).pop() ?? "";
    if (!NEEDS_MORE.has(last)) continue;
    const after = summary.split(new RegExp(`${mark}\\s*_+`))[1] ?? "";
    if (/^\s*($|[,.;:?!])/.test(after)) {
      return `${mark} 정답이 「${last}」로 끝나는데 빈칸 뒤가 끊깁니다. 빈칸은 말이 끝나는 자리에서 닫아야 합니다.`;
    }
  }

  let filled = summary;
  for (const [mark, word] of byMark) {
    filled = filled.replace(new RegExp(`${mark}\\s*_+`, "g"), ` ${word} `);
  }
  const ws = filled
    .toLowerCase()
    .replace(/[^a-z\s']/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  for (let i = 1; i < ws.length; i += 1) {
    if (ws[i] === ws[i - 1] && ws[i]!.length > 2) {
      return `정답을 넣으면 「${ws[i]}」가 바로 겹칩니다. 빈칸이 뒤 낱말까지 덮고 있습니다.`;
    }
  }
  return null;
}

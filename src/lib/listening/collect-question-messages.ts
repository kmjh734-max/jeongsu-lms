import type { GeneratedListeningQuestion } from "@/lib/listening/types";

/** quality_issues와 problems에 겹치는 문구를 한 번만 표시 */
export function collectUniqueQuestionMessages(
  question: Pick<
    GeneratedListeningQuestion,
    "quality_issues" | "problems" | "suggestions"
  >
): { issues: string[]; suggestions: string[] } {
  const seen = new Set<string>();
  const issues: string[] = [];

  const push = (msg: string) => {
    const t = msg.trim();
    if (!t || seen.has(t)) return;
    seen.add(t);
    issues.push(t);
  };

  for (const item of question.quality_issues ?? []) {
    push(item.message);
  }
  for (const p of question.problems ?? []) {
    push(p);
  }

  const suggestions: string[] = [];
  const seenSug = new Set<string>();
  for (const s of question.suggestions ?? []) {
    const t = s.trim();
    if (!t || seenSug.has(t)) continue;
    seenSug.add(t);
    suggestions.push(t);
  }

  return { issues, suggestions };
}

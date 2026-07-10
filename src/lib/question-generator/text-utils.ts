/** 메타 태그·군더더기 발문 제거 */
export function cleanQuestionText(text: string): string {
  return (text || "")
    .split(/\n/)
    .map((l) => l.trim())
    .filter((l) => {
      if (!l) return false;
      if (/^\[[^\]]+\]$/.test(l)) return false;
      if (l === "다음 글을 읽고 물음에 답하시오.") return false;
      if (l === "다음 글을 읽고 물음에 답하시오") return false;
      return true;
    })
    .join("\n")
    .trim();
}

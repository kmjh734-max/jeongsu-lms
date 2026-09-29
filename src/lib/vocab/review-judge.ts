/**
 * 복습 답 채점. 학생 화면(바로 알려 주기)과 서버(기록)가 같은 식을 쓴다.
 * 다른 단어학습 단계와 같게, 기록에 남는 정답 여부는 서버가 다시 매긴다.
 */
export type ReviewStage = "meaning" | "spelling" | "example";

/** 철자·예문은 대소문자와 앞뒤 공백만 무시하고, 뜻은 여러 뜻 가운데 하나만 맞아도 맞다고 본다 */
export function judgeReviewAnswer(
  stage: ReviewStage,
  word: string,
  meaning: string,
  answer: string
): boolean {
  const given = (answer ?? "").trim().toLowerCase();
  if (!given) return false;
  if (stage !== "meaning") return given === (word ?? "").trim().toLowerCase();

  const squeeze = (s: string) => s.replace(/\s+/g, "");
  const mine = squeeze(given);
  return (meaning ?? "")
    .split(/[,;/·]/)
    .map((p) => squeeze(p.toLowerCase()))
    .filter(Boolean)
    .some((p) => p === mine || (p.length > 1 && mine.includes(p)));
}

/** 예문에서 정답 단어를 빈칸으로 가린다. 단어에 정규식 기호가 있어도 안전하게. */
export function blankOutWord(sentence: string, word: string): string {
  const w = (word ?? "").trim();
  if (!sentence || !w) return sentence ?? "";
  const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return sentence.replace(new RegExp(escaped, "gi"), "______");
}

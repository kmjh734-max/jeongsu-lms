import { bothWhatThatGrammatical } from "@/lib/lesson-materials/grammar-choice-v2/choice-repair";
import { needsAuditor } from "@/lib/lesson-materials/grammar-choice-v2/local-validators";
import type { AuditResult, ExactSentence, ResolvedCandidate } from "@/lib/lesson-materials/grammar-choice-v2/types";

const ALWAYS_REVIEW = (code: string) =>
  code.startsWith("TENSE_") ||
  code.startsWith("CONDITIONAL_") ||
  code.startsWith("WISH_") ||
  code.startsWith("AS_IF_") ||
  code === "RELATIVE_WHO_WHOM" ||
  code === "RELATIVE_ADVERB_WHERE" ||
  code === "RELATIVE_WHAT" ||
  code === "RELATIVE_NONRESTRICTIVE" ||
  code === "VERB_COMPLEMENT_MEANING_CHANGE" ||
  code === "PRONOUN_ANTECEDENT" ||
  code === "DUMMY_REFERENTIAL_IT";

export function isLocalSafeReviewSkip(item: ResolvedCandidate, sentence: string): boolean {
  if (!needsAuditor(item)) return true;
  if (ALWAYS_REVIEW(item.pointCode)) return false;
  if (item.riskLevel !== "LOW") return false;
  if (item.pointCode.startsWith("VOICE_") && item.riskLevel !== "LOW") return false;
  if (item.correctAnswer.trim() !== item.sourceSpan.trim()) return false;
  if (item.sourceSpan.trim().split(/\s+/).length > 5) return false;
  const wrong = item.distractors[0] ?? "";
  if (!wrong || wrong.trim().toLowerCase() === item.correctAnswer.trim().toLowerCase()) return false;
  if (bothWhatThatGrammatical(sentence, item.correctAnswer, wrong)) return false;
  if (mayBeFabricatedDerivation(item.correctAnswer, wrong)) return false;
  return true;
}

/**
 * 오답이 정답에 접미사를 붙여 만든 파생형인지 본다. 이런 쌍은 실재하지 않는
 * 단어일 수 있고(extinct → extinctly), 실재 여부는 어휘 지식이라 로컬 규칙으로
 * 가릴 수 없다. 로컬 자동 통과에서 빼고 감사 모델이 판정하게 한다.
 */
const DERIVATION_SUFFIXES = ["ly", "ing", "ed", "er", "est", "ness", "ful"];

export function mayBeFabricatedDerivation(correct: string, wrong: string): boolean {
  const base = correct.trim().toLowerCase();
  const derived = wrong.trim().toLowerCase();
  if (!base || !derived || base === derived) return false;
  if (base.includes(" ") || derived.includes(" ")) return false;
  return DERIVATION_SUFFIXES.some(
    (suffix) =>
      derived === `${base}${suffix}` ||
      derived === `${base.replace(/e$/, "")}${suffix}` ||
      base === `${derived}${suffix}` ||
      base === `${derived.replace(/e$/, "")}${suffix}`
  );
}

export function planReviewerSubmission(
  items: ResolvedCandidate[],
  sentences: ExactSentence[]
): { send: ResolvedCandidate[]; localPass: AuditResult[] } {
  const textById = new Map(sentences.map((sentence) => [sentence.sentenceId, sentence.text]));
  const send: ResolvedCandidate[] = [];
  const localPass: AuditResult[] = [];
  for (const item of items) {
    if (!needsAuditor(item)) continue;
    const sentence = textById.get(item.sentenceId) ?? "";
    if (isLocalSafeReviewSkip(item, sentence)) {
      localPass.push({
        candidateId: item.candidateId,
        decision: "PASS",
        uniqueInContext: true,
        plausibleLearnerError: true,
        singleGrammarAxis: true,
      });
      continue;
    }
    send.push(item);
  }
  return { send, localPass };
}

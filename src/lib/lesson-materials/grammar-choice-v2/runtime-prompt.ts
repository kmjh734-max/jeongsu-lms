import {
  compactOntologyForSentences,
  ontologyCatalogText,
} from "@/lib/lesson-materials/grammar-choice-v2/trigger-router";
import type { ExactSentence } from "@/lib/lesson-materials/grammar-choice-v2/types";
import { GRAMMAR_CHOICE_V2_PROMPT } from "@/lib/lesson-materials/grammar-choice-v2/types";

const ANALYZER_INSTRUCTIONS = `You are a Korean high-school English grammar analyst and item writer.

Analyze only the exact source sentences supplied in INPUT.
Never rewrite, summarize, merge, delete, or reproduce the full passage.

For every sentence:
1. Identify relevant grammar occurrences using only GRAMMAR_ONTOLOGY codes.
   INPUT gives you highlightedBySentence.likelyCodes: the points a deterministic
   local detector already found in that exact sentence. Start from that list and
   confirm each one against the sentence before you look further afield. It is a
   shortlist, not a restriction, and it is not always right.
2. Scan MANDATORY points before CORE and BASIC points.
3. Report every detected MANDATORY occurrence even when no question can be made.
4. Create a candidate only when the exact source span is the correct answer.
5. Propose one plausible learner-error distractor that tests one grammar axis. A second distractor is allowed only when the first is unsafe.
6. A distractor may be valid elsewhere, but must be invalid in this unchanged sentence.
7. Do not create mechanical infinitive-marker, modal-base-form, short adjacent agreement, or imperative -s questions.
8. Do not create vocabulary, idiom, spelling, style, or meaning-preference questions.
9. Do not output the rewritten passage, ontology definitions, explanations, or reasoning.
10. Return only short structured JSON matching the schema. Explanations are generated locally.

Before returning:
- check every sentence against every MANDATORY ontology code;
- verify the sourceSpan is copied exactly;
- verify the correctAnswer equals sourceSpan;
- verify no important conditional, inversion, relative, participial, parallel, or clause point was silently omitted.

Output limits:
- detectedPoints: only occurrences present in that sentence. No ontology echo. No prose evidence.
- omissionReason: empty string, or one enum code when a MANDATORY occurrence has no candidate.
- candidates for this batch: at most candidateCap. Do not invent extra candidates past that cap.
- Never drop a MANDATORY occurrence from detectedPoints to satisfy the candidate cap.
- Returning fewer candidates than the cap is correct and expected. Never pad the list to reach it.
- No Korean or English explanations, no repeated grammar definitions, no full-sentence reprints.`;

/**
 * 정리된 온톨로지는 호출마다 똑같다. user 페이로드에 넣으면 문장 묶음 호출
 * 하나하나가 10KB를 다시 보내는데, system에 고정으로 실으면 접두사가 같아져
 * 프롬프트 캐시가 붙는다. 모델이 보는 내용은 f861bc8과 동일하게 코드 전체다.
 */
export const ANALYZER_SYSTEM_PROMPT = `${ANALYZER_INSTRUCTIONS}

${ontologyCatalogText()}`;

export function buildAnalyzerUserPayload(input: {
  passageId: string;
  sentences: ExactSentence[] | Array<{ sentenceId: string; text: string }>;
  analysisHints?: Array<{ targetText: string; label?: string }>;
  localMandatoryHints?: Array<{
    sentenceId: string;
    pointCode: string;
    sourceSpan: string;
  }>;
  /**
   * 이 호출에서 요구할 후보 상한. 분석은 문장 묶음 단위로 쪼개 호출하므로
   * 호출당 상한을 작게 유지해야 모델이 뒤쪽 후보를 수일치로 때우지 않는다.
   */
  candidateCap?: number;
}) {
  return {
    passageId: input.passageId,
    sentences: input.sentences.map((s) => ({
      sentenceId: s.sentenceId,
      text: s.text,
    })),
    ...compactOntologyForSentences(
      input.sentences.map((s) => ({
        sentenceId: s.sentenceId,
        text: s.text,
        passageStart: "passageStart" in s ? s.passageStart : 0,
        passageEnd: "passageEnd" in s ? s.passageEnd : s.text.length,
      }))
    ),
    analysisHints: (input.analysisHints ?? [])
      .filter((h) => h.targetText.trim())
      .slice(0, 12)
      .map((h) => ({ targetText: h.targetText, label: h.label ?? "" })),
    localMandatoryHints: input.localMandatoryHints ?? [],
    candidateCap:
      input.candidateCap ?? Math.min(32, Math.max(input.sentences.length * 2, 8)),
    promptVersion: GRAMMAR_CHOICE_V2_PROMPT,
  };
}

export function measureRuntimePrompt(payload: unknown): number {
  return ANALYZER_SYSTEM_PROMPT.length + JSON.stringify(payload).length;
}

export const AUDITOR_SYSTEM_PROMPT = `You audit Korean high-school grammar choices.
Judge each item inside its unchanged sentence.
Do not rewrite the sentence and do not write explanations.
A PASS requires exactly one grammatical choice in this sentence, a plausible learner error, and a single grammar axis.
REJECT with reasonCode FABRICATED_INFLECTION when the wrong choice is not a real English word form.
A real word used in the wrong grammatical role is a good distractor and must not be rejected for this reason:
"extraordinarily" for "extraordinary" is fine, but "extinctly" is not a word and must be rejected.
Set correctedCode when the item's grammar code names a different point than the one the choice actually tests.
Return only short structured JSON: candidateId, decision, uniqueInContext, reasonCode, correctedCode.`;

/**
 * 유일성 검증은 생성 호출과 분리된 블라인드 판정이다.
 * 어느 쪽이 출제자가 고른 정답인지 알려주지 않아야 모델이 자기 답을 추인하지 않는다.
 * 두 선택지를 optionA/optionB로만 제시하고 각각의 문법성만 묻는다.
 */
export const UNIQUENESS_SYSTEM_PROMPT = `You are a strict English grammaticality judge.

For each item you get one sentence with a bracketed slot marked [[SLOT]], plus two candidate fillers: optionA and optionB.

For each option independently, substitute it into the slot and judge the resulting sentence:
- aGrammatical: true only if the sentence with optionA is fully grammatical in standard written English.
- bGrammatical: true only if the sentence with optionB is fully grammatical in standard written English.

Rules:
- Judge grammar only. Ignore style, register, awkwardness, and which reading is more natural or more likely intended.
- Judge each option inside this exact unchanged sentence. An option that is valid in some other sentence is still ungrammatical here if it does not fit this structure.
- If a sentence is grammatical under any available reading, that option is grammatical.
- You are not told which option the item writer intended. Do not guess it and do not let symmetry influence you. Both options being grammatical is a common and acceptable verdict.
- Do not rewrite the sentence, do not explain, do not output reasoning.

Return only structured JSON: itemId, aGrammatical, bGrammatical.`;

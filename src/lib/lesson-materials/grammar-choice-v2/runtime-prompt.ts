import { FORBIDDEN_PATTERNS } from "@/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import { compactOntologyForSentences } from "@/lib/lesson-materials/grammar-choice-v2/trigger-router";
import type { ExactSentence } from "@/lib/lesson-materials/grammar-choice-v2/types";
import { GRAMMAR_CHOICE_V2_PROMPT } from "@/lib/lesson-materials/grammar-choice-v2/types";

export const ANALYZER_SYSTEM_PROMPT = `You are a Korean high-school English grammar analyst and item writer.

Analyze only the exact source sentences supplied in INPUT.
Never rewrite, summarize, merge, delete, or reproduce the full passage.

For every sentence:
1. Identify relevant grammar occurrences using only the supplied GRAMMAR_ONTOLOGY codes.
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
- candidates for the whole passage: at most candidateCap. Do not invent extra candidates past that cap.
- Never drop a MANDATORY occurrence from detectedPoints to satisfy the candidate cap.
- No Korean or English explanations, no repeated grammar definitions, no full-sentence reprints.`;

export function buildAnalyzerUserPayload(input: {
  passageId: string;
  sentences: ExactSentence[] | Array<{ sentenceId: string; text: string }>;
  analysisHints?: Array<{ targetText: string; label?: string }>;
  localMandatoryHints?: Array<{
    sentenceId: string;
    pointCode: string;
    sourceSpan: string;
  }>;
}) {
  return {
    passageId: input.passageId,
    sentences: input.sentences.map((s) => ({
      sentenceId: s.sentenceId,
      text: s.text,
    })),
    grammarOntology: compactOntologyForSentences(
      input.sentences.map((s) => ({
        sentenceId: s.sentenceId,
        text: s.text,
        passageStart: "passageStart" in s ? s.passageStart : 0,
        passageEnd: "passageEnd" in s ? s.passageEnd : s.text.length,
      }))
    ),
    forbiddenPatterns: FORBIDDEN_PATTERNS,
    analysisHints: (input.analysisHints ?? [])
      .filter((h) => h.targetText.trim())
      .slice(0, 12)
      .map((h) => ({ targetText: h.targetText, label: h.label ?? "" })),
    localMandatoryHints: input.localMandatoryHints ?? [],
    candidateCap: Math.min(32, Math.max(input.sentences.length * 2, 8)),
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
Return only short structured JSON: candidateId, decision, uniqueInContext, reasonCode, correctedCode.`;

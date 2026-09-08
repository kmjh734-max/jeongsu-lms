import {
  compactOntologyForPrompt,
  FORBIDDEN_PATTERNS,
} from "@/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import { GRAMMAR_CHOICE_V2_PROMPT } from "@/lib/lesson-materials/grammar-choice-v2/types";

export const ANALYZER_SYSTEM_PROMPT = `You are a Korean high-school English grammar analyst and item writer.

Analyze only the exact source sentences supplied in INPUT.
Never rewrite, summarize, merge, delete, or reproduce the full passage.

For every sentence:
1. Identify all grammar points using only the supplied GRAMMAR_ONTOLOGY codes.
2. Scan MANDATORY points before CORE and BASIC points.
3. Report every detected MANDATORY point even when no question can be made.
4. Create a candidate only when the exact source span is the correct answer.
5. Propose one or two plausible learner-error distractors that test one grammar axis.
6. A distractor may be valid elsewhere, but must be invalid in this unchanged sentence.
7. Do not create mechanical infinitive-marker, modal-base-form, short adjacent agreement, or imperative -s questions.
8. Do not create vocabulary, idiom, spelling, style, or meaning-preference questions.
9. Do not output the rewritten passage.
10. Return only structured JSON matching the schema.

Before returning:
- check every sentence against every MANDATORY ontology code;
- verify the sourceSpan is copied exactly;
- verify the correctAnswer equals sourceSpan;
- verify no important conditional, inversion, relative, participial, parallel, or clause point was silently omitted.

Output limits:
- detectedPoints only for points actually present in that sentence. Do not echo the ontology.
- candidates: at most 8 per sentence.
- evidence and ruleSummaryKo: one short clause each, under 80 characters.
- omissionReason: empty string unless a detected MANDATORY point has no candidate.`;

export function buildAnalyzerUserPayload(input: {
  passageId: string;
  sentences: Array<{ sentenceId: string; text: string }>;
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
    grammarOntology: compactOntologyForPrompt().map(
      (p) => `${p.code}|${p.priority}|${p.label}`
    ),
    forbiddenPatterns: FORBIDDEN_PATTERNS,
    analysisHints: (input.analysisHints ?? [])
      .filter((h) => h.targetText.trim())
      .slice(0, 12)
      .map((h) => ({ targetText: h.targetText, label: h.label ?? "" })),
    localMandatoryHints: input.localMandatoryHints ?? [],
    promptVersion: GRAMMAR_CHOICE_V2_PROMPT,
  };
}

export function measureRuntimePrompt(payload: unknown): number {
  return ANALYZER_SYSTEM_PROMPT.length + JSON.stringify(payload).length;
}

export const AUDITOR_SYSTEM_PROMPT = `You audit Korean high-school grammar choices.
Judge each item inside its unchanged sentence.
Do not rewrite the sentence.
A PASS requires exactly one grammatical choice in this sentence, a plausible learner error, and a single grammar axis.
Return only structured JSON.`;

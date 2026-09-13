import type { ExactSentence } from "@/lib/lesson-materials/grammar-choice-v2/types";
import { textbookRulesText } from "@/lib/lesson-materials/grammar-choice-v2/textbook-rules";
import { GRAMMAR_CHOICE_V2_PROMPT } from "@/lib/lesson-materials/grammar-choice-v2/types";

/**
 * 분석(문항 만들기) 시스템 프롬프트. 교재 5권의 규칙 카드(textbook-rules.ts)만 본다.
 *
 * 2026-09-13 선생님 결정: 예전 자료(231개 문법 목록 전체, 로컬 패턴 힌트, 분석서 힌트)는
 * 쓰지 않고 오늘 정리한 교재 규칙만으로, 가볍고 빠르게 출제한다. 카드는 호출마다 같아
 * 프롬프트 캐시가 붙는다. 문항의 정확성은 이 뒤의 로컬 검사와 유일성 판정이 지킨다.
 */
const ANALYZER_INSTRUCTIONS = `You write Korean high-school English grammar-choice items ([correct / wrong]) from the exact sentences in INPUT, the way Korean school grammar textbooks do.
TEXTBOOK_RULES below lists every point you may test. Use only those codes.

For each sentence:
1. Find every TEXTBOOK_RULES point the sentence really contains that can be asked, up to candidateCap. Most sentences have two or three; report each of them, but never invent one to pad the list.
2. sourceSpan is copied exactly from the sentence and equals correctAnswer. Box one or two words; a phrase only when the point needs it.
3. Give one distractor: the same word in its other form, the mistake a student actually makes (see "오답"). It changes one grammar point only, is a real English word, and is wrong in this unchanged sentence.
4. The sentence itself must contain the cue that decides the answer (the real subject, the antecedent, whether the clause is complete, the time expression). Skip anything under "출제금지" and any slot where both forms could be right.
5. Prefer points higher in TEXTBOOK_RULES (they are ordered by how often textbooks test them).
6. No spelling, vocabulary, meaning-only, or made-up word choices. No explanations, no reasoning, no reprinted sentences.

Return only JSON matching the schema.`;

const TEXTBOOK_HEADER =
  "TEXTBOOK_RULES (code: [pairs] how to decide | 오답: typical trap | 출제금지: both forms are acceptable, do not ask):";

export function analyzerSystemPrompt(): string {
  return `${ANALYZER_INSTRUCTIONS}

${TEXTBOOK_HEADER}
${textbookRulesText()}`;
}

export const ANALYZER_SYSTEM_PROMPT = analyzerSystemPrompt();

export function buildAnalyzerUserPayload(input: {
  passageId: string;
  sentences: ExactSentence[] | Array<{ sentenceId: string; text: string }>;
  /**
   * 이 호출에서 요구할 후보 상한. 분석은 문장 하나씩 호출하므로 호출당 상한을 작게 유지한다.
   */
  candidateCap?: number;
}) {
  return {
    passageId: input.passageId,
    sentences: input.sentences.map((s) => ({
      sentenceId: s.sentenceId,
      text: s.text,
    })),
    candidateCap:
      input.candidateCap ?? Math.min(32, Math.max(input.sentences.length * 2, 8)),
    promptVersion: GRAMMAR_CHOICE_V2_PROMPT,
  };
}

export function measureRuntimePrompt(payload: unknown): number {
  return analyzerSystemPrompt().length + JSON.stringify(payload).length;
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

School-grammar conventions. These are the standard of Korean high-school English exams and override "any available reading" for the cases below only:
- In adverbial clauses of time or condition (when, if, unless, before, after, until, as soon as, once, by the time), a future event takes the present tense. "will"/"shall" for a future event in such a clause is ungrammatical (ignore the volitional or polite-request reading of "will").
- A finished past time expression in the same clause (yesterday, ago, last week, in 2015, when + past clause) cannot take the present perfect.
- "since + a point in time" or "ever since" describing a state that continues to now requires the present perfect, not the simple past.
- When the context sentence (field "context", the sentence right before) or the sentence itself sets up a past-tense narrative and the slot describes an action completed before that past time, the past perfect is required and the present perfect is ungrammatical.
- For remember / forget / regret / stop / try / mean / go on followed by to-infinitive vs -ing: if the sentence contains an explicit cue that fixes the meaning (ago, no longer, tonight, before you leave, but I forgot, despite, still, if/instead), treat the option whose meaning contradicts that cue as ungrammatical.
Use "context" only to determine time reference and narrative; judge the slot sentence itself.

Also judge vocabulary, separately from grammar:
- aRealWords / bRealWords: false only if the option contains a word form that does not exist in English (extinctly, oftenly, smallly, illy, Howeverly, error-freely, outing used as a verb form of "out"). A real word in the wrong grammatical role is still a real word ("happily" for "happy" is real).

Return only structured JSON: itemId, aGrammatical, bGrammatical, aRealWords, bRealWords.`;

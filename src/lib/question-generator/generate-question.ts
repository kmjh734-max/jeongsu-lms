import { difficultyRule, targetLevelFromOverall, type TargetLevel } from "@/lib/question-generator/difficulty";
import {
  choiceCraftCommonRules,
  choiceExplanationRules,
  contentFalseChoiceCraft,
  grammarChoiceCraftNote,
  impliedMeaningChoiceCraft,
  insertionChoiceCraft,
  irrelevantChoiceCraft,
  summaryChoiceCraft,
  titleChoiceCraft,
  topicChoiceCraft,
  vocabChoiceCraft,
} from "@/lib/question-generator/choice-craft";
import {
  grammarCatalogPromptBlock,
  grammarExplanationRules,
  pickGrammarFocus,
} from "@/lib/question-generator/grammar-catalog";
import { questionGeneratorChatJsonWithRetry } from "@/lib/question-generator/openai";
import { findAingkaOption } from "@/lib/question-generator/question-types";
import {
  cleanQuestionText,
  countEnglishSentences,
  countEnglishWords,
  passageHasConsecutiveWords,
  parseSummaryTableBlocks,
  parseSummaryWritingBlocks,
  parseWordOrderBlocks,
} from "@/lib/question-generator/text-utils";
import { MIN_SENTENCES_FOR_INSERTION_IRRELEVANT } from "@/lib/question-generator/constants";
import {
  questionNeedsVocabGloss,
  normalizeHardWordsFromRaw,
} from "@/lib/question-generator/exam-vocab";
import type { QuestionTypeOption } from "@/lib/question-generator/types";
import type {
  GeneratedQuestionPayload,
  PassageAnalysis,
} from "@/lib/question-generator/types";
import {
  pickWordOrderFocus,
  wordOrderCatalogBrief,
  type WordOrderMode,
} from "@/lib/question-generator/word-order-catalog";
import { normalizeWordOrderQuestionText } from "@/lib/question-generator/word-order-normalize";
import { reconcileGrammarFixQuestion } from "@/lib/question-generator/grammar-fix-normalize";
import { plainKorean } from "@/lib/question-generator/plain-korean";
import {
  findWritingGrammar,
  objectParticle,
  WRITING_GRAMMAR_LIST,
  WRITING_GRAMMARS,
  type WritingGrammar,
} from "@/lib/question-generator/writing-grammar";
import {
  buildWordBankFromAnswer,
  joinWordBank,
  normalizeAndShuffleWordBank,
  tokenizeAnswerPhrase,
} from "@/lib/question-generator/word-order-normalize";

/** 함축의미 등 — 적합한 소재가 없으면 문항 생략 */
export class SkipQuestionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SkipQuestionError";
  }
}

/** 제목·주제·요지·일치/불일치/일치개수: 본문 표현을 그대로 베끼지 말고 paraphrase */
function paraphraseChoiceRules(
  lang: "english" | "korean" | null | undefined
): string {
  const langHint =
    lang === "korean"
      ? "Korean choices: translate the idea, then reword — never paste English phrases from the passage."
      : lang === "english"
        ? "English choices: synonym/rephrase heavily; do not lift consecutive content words from the passage."
        : "Reword ideas; do not copy passage wording.";
  return `PARAPHRASE (필수 · 학력평가형 · 어휘 다양성):
- Every choice/statement must paraphrase key content words (synonyms, different structure, reworded meaning).
- Ban copying distinctive multi-word chunks or long phrases from the passage.
- Correct items: same meaning via paraphrase; distractors: plausible but wrong via subtle meaning shifts.
- Prefer vocabulary that tests understanding of paraphrased wording (동의어·유의어·우회 표현 많이).
- Same passage → many items: DO NOT recycle the same 5–8 theme words across items. Rotate synonym sets (e.g. progress↔advance/improvement; consumer↔buyer/shopper only if needed — prefer harder alternates). Use antonyms mainly inside distractors (미세한 의미 반전).
- ${langHint}`;
}

/**
 * 조건 영작에 쓸 어법 범위. 목록은 writing-grammar.ts에 따로 둔다
 * (고르기 문항용 목록을 그대로 쓰면 「등위 병렬을 사용할 것」 같은 조건이 나온다).
 * 지문에 실제로 있는 어법만 고르게 하므로, 무작위여도 지문과 겉돌지 않는다.
 */
const GRAMMAR_FOR_WRITING = WRITING_GRAMMAR_LIST;

function typeRules(
  option: QuestionTypeOption,
  /** 지정 문법을 지문에서 찾을지, 고쳐 써서 만들지 (선생님 요청 2026-09-29) */
  writingMode: "passage" | "paraphrase" = "paraphrase"
): string {
  const code = option.aingkaCode || "";
  const en = option.choiceLanguage === "english";
  const paraphrase = paraphraseChoiceRules(option.choiceLanguage);
  const craft = choiceCraftCommonRules();

  switch (option.type) {
    case "content_false":
      return `${en ? "5 ENGLISH" : "5 Korean"} factual choices about the WHOLE passage.
Ask which does NOT match. Exactly ONE false; the other four must be true.
Style like Korean HS mock exams (효자/학력평가 내용불일치).
${craft}
${contentFalseChoiceCraft(en)}
${paraphrase}
${choiceExplanationRules()}
Difficulty: ${
        option.difficulty === "low"
          ? "LOW (하) — clearer falsehood, weaker distractors"
          : option.difficulty === "high"
            ? "HIGH (상) — subtle falsehood, close distractors, longer choices OK"
            : "standard"
      }. questionText empty.`;
    case "content_true":
      return `${en ? "5 ENGLISH" : "5 Korean"} factual choices about the WHOLE passage.
Ask which DOES match. Exactly ONE true; the other four must be false.
Style like Korean HS mock exams (효자/학력평가 내용일치).
${craft}
${contentFalseChoiceCraft(en)}
${paraphrase}
${choiceExplanationRules()}
Difficulty: ${
        option.difficulty === "low"
          ? "LOW (하) — clearer correct fact, weaker distractors"
          : option.difficulty === "high"
            ? "HIGH (상) — nuanced correct answer, competitive distractors"
            : "standard"
      }. questionText empty.`;
    case "content_count":
      return `일치개수 SHORT-ANSWER (NOT MCQ). Format like Korean school worksheets.
- instruction is fixed (count how many <보기> items do NOT match the passage).
- questionText = <보기> statements only, labeled (1) (2) (3) ... each on its own line.
- Language of statements: ${en ? "ENGLISH" : "Korean"}.
- Statement count: ${
        option.difficulty === "high" ? "exactly 8" : "exactly 6"
      }.
- Mix true and false statements; correctAnswer = the COUNT of FALSE (non-matching) statements as an integer string (e.g. "3").
- choices: omit or empty array. No ①~⑤ options.
- Do NOT change the passage; omit passageModified.
- explanation: list which numbers are false and why (Korean, brief).
${craft}
${contentFalseChoiceCraft(en)}
${paraphrase}
Difficulty: ${
        option.difficulty === "low"
          ? "LOW (하) — clearer true/false"
          : option.difficulty === "high"
            ? "HIGH (상) — subtler distinctions"
            : "standard"
      }.`;
    case "topic":
      return `${en ? "5 ENGLISH" : "5 Korean"} topic phrases. Exactly one correct.
${craft}
${topicChoiceCraft(en)}
${paraphrase}
${choiceExplanationRules()}
Difficulty: ${
        option.difficulty === "low"
          ? "LOW (하) — clearer correct answer, weaker distractors"
          : option.difficulty === "high"
            ? "HIGH (상) — competitive distractors, nuanced"
            : "standard"
      }.`;
    case "title":
      return `${en ? "5 ENGLISH Title Case titles" : "5 Korean titles"}. Exactly one correct.
${craft}
${titleChoiceCraft(en)}
${paraphrase}
${choiceExplanationRules()}
Difficulty: ${
        option.difficulty === "low"
          ? "LOW (하) — clearer correct answer, weaker distractors"
          : option.difficulty === "high"
            ? "HIGH (상) — competitive distractors, nuanced"
            : "standard"
      }.`;
    case "summary_mcq":
      // 요약문완성(빈칸 (A)(B) · …… 쌍)은 폐기됨. 요지 객관식만 허용.
      return `요지 MCQ only (NOT 요약문완성).
- 5 FULL ${en ? "ENGLISH" : "Korean"} sentence choices for the main point (요지).
- Do NOT invent a summary sentence with blanks (A)/(B).
- Do NOT use …… / ... pair choices (e.g. "성공 …… 노력").
- questionText must be empty.
${craft}
${summaryChoiceCraft(en)}
${paraphrase}
${choiceExplanationRules()}
- Exactly one correct. Difficulty: ${
        option.difficulty === "low"
          ? "LOW (하)"
          : option.difficulty === "high"
            ? "HIGH (상)"
            : "standard"
      }.`;
    case "sentence_blank":
      if (code === "연결어빈칸") {
        return `In passageModified put discourse blanks (A) and (B). 5 ENGLISH pair choices like "However …… Therefore". Exactly one correct.
LANGUAGE: passageModified + choices MUST be ENGLISH only (no Korean).`;
      }
      // 문장빈칸 (효자·학력평가형)
      if (option.difficulty === "high") {
        return `문장빈칸 HIGH (상) — 효자 기출동형:
- In passageModified, blank ONE important sentence (or key clause) with ____________________________________.
- The blanked content must be a flow-critical sentence from the passage.
- 5 ENGLISH full-sentence/phrase choices.
- CRITICAL: ALL choices (including the correct one) must PARAPHRASE the blanked sentence — synonyms/rewording, NOT copy the original wording.
- Exactly one correct. questionText empty.
LANGUAGE: passageModified + ALL choices MUST be ENGLISH only. Never write Korean in passage or choices.`;
      }
      return `문장빈칸 LOW (하) — 효자 기출동형:
- In passageModified, blank ONE important sentence (or key clause) with ____________________________________.
- The blanked content must be a flow-critical sentence from the passage (like mock-exam sentence blanks).
- 5 ENGLISH full-sentence/phrase choices that fit the blank; correct answer may stay close to the original sentence meaning/wording.
- Exactly one correct. questionText empty.
LANGUAGE: passageModified + ALL choices MUST be ENGLISH only. Never write Korean in passage or choices.`;
    case "order":
      if (option.difficulty === "high") {
        return `순서추론 HIGH (상) — 효자 기출동형:
- Format: lead-in paragraph (지시문) + paragraphs (A)(B)(C) + 5 order choices like (A)-(C)-(B).
- CRITICAL: PARAPHRASE the lead-in (지시문) only — reword synonyms/structure; do NOT copy it verbatim from the passage.
- Keep (A)(B)(C) body paragraphs as ORIGINAL wording from the passage (do not paraphrase A/B/C).
- Exactly one correct order. Put lead-in+(A)(B)(C) in passageModified. questionText empty.
LANGUAGE: passageModified + ALL choices MUST be ENGLISH only. Never write Korean in passage or choices.`;
      }
      return `순서추론 LOW (하) — 효자 기출동형:
- Format: lead-in paragraph (지시문) + paragraphs (A)(B)(C) + 5 order choices like (A)-(C)-(B).
- Keep the lead-in (지시문) as ORIGINAL wording from the passage (do not paraphrase).
- Keep (A)(B)(C) as ORIGINAL wording from the passage.
- Exactly one correct order. Put lead-in+(A)(B)(C) in passageModified. questionText empty.
LANGUAGE: passageModified + ALL choices MUST be ENGLISH only. Never write Korean in passage or choices.`;
    case "sentence_insertion":
      if (option.difficulty === "high") {
        return `문장삽입 HIGH (상) — 효자 기출동형 (PDF: 위치):
- Pick a flow-critical sentence from the passage as the sentence to insert.
- CRITICAL: questionText = PARAPHRASE of that sentence (ENGLISH), not a verbatim copy.
- passageModified = remaining ENGLISH passage with five insertion slots marked ① ② ③ ④ ⑤ in the text.
- choices: omit or empty array — slots IN the passage are the options; do NOT invent separate choice texts.
- correctAnswer 1-5. Exactly one best slot.
${insertionChoiceCraft()}
LANGUAGE: questionText + passageModified MUST be ENGLISH only.`;
      }
      return `문장삽입 LOW (하) — 효자 기출동형 (PDF: 위치):
- Pick a flow-critical sentence from the passage as the sentence to insert.
- questionText = that sentence in ORIGINAL ENGLISH wording (do not paraphrase).
- passageModified = remaining ENGLISH passage with five insertion slots marked ① ② ③ ④ ⑤ in the text.
- choices: omit or empty array — slots IN the passage are the options; do NOT invent separate choice texts.
- correctAnswer 1-5. Exactly one best slot.
${insertionChoiceCraft()}
LANGUAGE: questionText + passageModified MUST be ENGLISH only.`;
    case "irrelevant_sentence": {
      const irrelevantQuality = `IRRELEVANT SENTENCE QUALITY (효자 기출동형 — 필수):
- Do NOT invent a bizarre, random, or absurd sentence that has nothing to do with the passage vocabulary.
- The irrelevant sentence MUST reuse similar words / related content from the passage (same domain, overlapping vocabulary) so it LOOKS related at a glance.
- But it must break cohesion: different topic focus OR a different point that does not connect to the surrounding sentences.
${irrelevantChoiceCraft()}`;
      if (option.difficulty === "high") {
        return `무관한문장 HIGH (상) — 효자 기출동형:
- CRITICAL: PARAPHRASE the ENTIRE passage in passageModified (ENGLISH synonyms/rewording throughout).
- Mark five candidate sentences with ⓐ ⓑ ⓒ ⓓ ⓔ (circled letters before each).
- Exactly ONE of ⓐ~ⓔ is the irrelevant sentence.
${irrelevantQuality}
- For HIGH: the irrelevant sentence should be subtler — same keywords/theme words, but a shifted claim/point that does not follow.
- choices: omit or empty array — letters IN the passage are the options; do NOT invent bottom choice texts.
- correctAnswer 1-5 mapping ⓐ=1 … ⓔ=5. questionText empty.
LANGUAGE: passageModified MUST be ENGLISH only.`;
      }
      return `무관한문장 LOW (하) — 효자 기출동형:
- Keep most of the passage ORIGINAL ENGLISH in passageModified.
- Replace ONE sentence with an irrelevant ENGLISH sentence (or insert one among five marked sentences).
- Mark five candidate sentences with ⓐ ⓑ ⓒ ⓓ ⓔ in the passage.
- Exactly ONE of ⓐ~ⓔ is the irrelevant sentence.
${irrelevantQuality}
- For LOW: the topic shift can be clearer (still reuse similar wording; never totally weird).
- choices: omit or empty array — letters IN the passage are the options; do NOT invent bottom choice texts.
- correctAnswer 1-5 mapping ⓐ=1 … ⓔ=5. questionText empty.
LANGUAGE: passageModified MUST be ENGLISH only.`;
    }
    case "grammar": {
      const catalog = grammarCatalogPromptBlock();
      const explainRules = grammarExplanationRules();
      if (code === "어법추론" || code === "어법모두고르기") {
        const { focusBlock } = pickGrammarFocus(1);
        return `어법 추론 — 틀린 어법 하나 고르기 (어휘 추론과 동일 형식):
${focusBlock}

형식:
- passageModified = 영어 지문, 밑줄 정확히 5개 ⓐⓑⓒⓓⓔ → ⓐ<u>대상</u>
- 어법상 틀린 곳 정확히 1개 — 위 ‘이번 문항’ 문법 반영
- 나머지 4개 밑줄은 어법상 맞음 (함정처럼 보이되 옳음)
- choices: omit or empty array — 기호 IN the passage are the options; do NOT invent bottom combination choices
- correctAnswer 1-5 mapping ⓐ=1 … ⓔ=5 (= 틀린 밑줄 번호). questionText 빈칸
${explainRules}
${grammarChoiceCraftNote()}
LANGUAGE: 지문은 영어만.

${catalog}`;
      }
      if (code === "어법개수") {
        const wrongN = 1 + Math.floor(Math.random() * 5);
        const { focusBlock } = pickGrammarFocus(wrongN);
        return `어법 개수 — 교재 단원별 문법 다양 출제:
${focusBlock}

형식:
- passageModified = 영어 지문, 밑줄 정확히 6개 ⓐ~ⓕ → ⓐ<u>대상</u>
- 틀린 곳 정확히 ${wrongN}개 — 위 ‘이번 문항’ 문법 (단원 중복 없이). 나머지 맞음
- choices 고정: 1:"1개" 2:"2개" 3:"3개" 4:"4개" 5:"5개"
- correctAnswer = ${wrongN}. questionText 빈칸
${explainRules}
${grammarChoiceCraftNote()}
LANGUAGE: 지문은 영어만.

${catalog}`;
      }
      if (code === "어법연결") {
        return `In passageModified mark ⓐ, ⓑ, ⓒ with two alternatives in parentheses. 5 ENGLISH connection choices. Exactly one correct.`;
      }
      if (code === "어법고쳐쓰기") {
        return `No MCQ. Student finds one grammar error and rewrites. Model rewrite in correctAnswer.`;
      }
      if (
        code === "어법오류수정2" ||
        code === "어법오류수정3" ||
        code === "어법문장오류수정"
      ) {
        const wrongN =
          code === "어법오류수정2" ? 2 : code === "어법오류수정3" ? 3 : 2;
        const { focusBlock } = pickGrammarFocus(wrongN);
        if (code === "어법문장오류수정") {
          return `서술형 · 어법 틀린 문장 수정 (수특형):
${focusBlock}

형식:
- passageModified = 영어 지문. 문장(또는 절) 앞에 ① ② ③ ④ ⑤ 표지.
- 어법상 틀린 문장 정확히 ${wrongN}개 — 위 ‘이번 문항’ 문법을 서로 다른 단원으로 반영.
- 나머지 문장은 어법상 맞음.
- questionText:
<조건>
○ 틀린 곳의 기호와 수정한 형태를 모두 써야 정답으로 인정함

<답안행>
${wrongN}
- correctAnswer 형식: "③: why / ④: to continue" (번호 + 바르게 고친 핵심 형태)
- choices 없음. explanation 한글: 각 번호의 틀린 점 → 바른 형태 + 쉬운 이유.
CRITICAL 정합:
1) 틀린 문장 안의 오류 형태가 본문에 그대로 있어야 함.
2) correctAnswer의 기호 = 실제로 틀린 ${wrongN}개만. 맞는 문장 번호를 넣지 말 것.
3) explanation도 같은 ${wrongN}개만 틀림으로 설명. 정답과 해설이 모순되면 안 됨.
4) "are → are"처럼 고친 결과가 본문과 같은 쌍 금지.
LANGUAGE: 지문 영어만.

${catalog}`;
        }
        const marks =
          wrongN === 2
            ? "ⓐⓑⓒⓓⓔ (5개 밑줄)"
            : "ⓐⓑⓒⓓⓔⓕⓖ (7개 밑줄)";
        return `서술형 · 어법 틀린 곳 ${wrongN}개 수정 (수특형):
${focusBlock}

형식:
- passageModified = 영어 지문. 밑줄 정확히 ${marks} → ⓐ<u>틀린형태또는맞는형태</u>
- 틀린 곳 정확히 ${wrongN}개 — <u>안에는 틀린 형태</u>를 넣음. 위 ‘이번 문항’ 문법을 서로 다른 단원으로 하나씩.
- 나머지 밑줄은 어법상 맞음 (함정처럼 보이되 옳음) — <u>안에는 이미 바른 형태</u>.
- questionText:
<조건>
○ 틀린 곳의 기호와 수정한 형태를 모두 써야 정답으로 인정함

<답안행>
${wrongN}
- correctAnswer 형식 예: "ⓒ: keep / ⓓ: surprising" (기호 + 바른 형태만, ${wrongN}쌍). "are → are" 금지.
- choices 없음.
- explanation 한글: ⓐ~ⓔ(또는 ⓖ) 각각에 대해 (맞음) 또는 (틀림: 본문형 → 바른형 + 이유).
CRITICAL 정합 (필수):
1) correctAnswer에 적은 기호의 <u>본문</u>은 틀린 형태여야 하고, correctAnswer 값은 바른 형태.
2) explanation에서 틀리다고 한 기호 집합 = correctAnswer 기호 집합 (동일 ${wrongN}개).
3) explanation에서 맞다고 한 기호는 correctAnswer에 넣지 말 것.
4) 본문 밑줄 텍스트와 고친 형태가 같으면 그 기호는 정답이 될 수 없음.
LANGUAGE: 지문 영어만.

${catalog}`;
      }
      {
        const { focusBlock } = pickGrammarFocus(1);
        return `밑줄 5개 중 틀린 것 1개.
${focusBlock}
${explainRules}
${catalog}`;
      }
    }
    case "vocabulary":
      if (code === "어휘개수") {
        return `어휘 개수 — 고1 학력평가·내신 고퀄리티 (A4 변형동형):
- passageModified = FULL ENGLISH passage with exactly six vocabulary spots ① ② ③ ④ ⑤ ⑥ as ①<u>word/phrase</u>.
- Put 1~5 contextually WRONG items; rest correct and natural.
- WRONG 기법: 반의·방향 반전 / 유사 철자·형태 혼동어 / 문맥만 틀린 유의어.
${vocabChoiceCraft()}
${choiceExplanationRules()}
- choices MUST be EXACTLY and ONLY these five texts in order:
  1:"1개"  2:"2개"  3:"3개"  4:"4개"  5:"5개"
- correctAnswer = N = count of wrong spots.
- questionText empty. explanation: Korean — 틀린 번호 + 왜 반의/혼동인지 + 바른 말.
LANGUAGE: passage ENGLISH only.`;
      }
      // 어휘추론 (어색한 것 고르기) — PDF형 ①~⑤, 하단 보기 없음
      return `어휘 어색한 것 고르기 — 고1 학력평가·내신 고퀄리티 (A4 변형동형):
- passageModified = FULL ENGLISH passage with exactly five vocabulary spots ① ② ③ ④ ⑤ as ①<u>word/phrase</u>.
- Exactly ONE is contextually WRONG; the other four are clearly correct in context.
- WRONG 기법 우선: (1) 반의·방향 반전 (2) 철자·형태 유사 혼동어 (3) 문맥만 틀린 유의어형.
${vocabChoiceCraft()}
${choiceExplanationRules()}
- choices: omit or empty array — numbers IN the passage are the options; do NOT print a separate choice list.
- correctAnswer 1-5 = the wrong underlined number. questionText empty.
- explanation (Korean): which number + why opposite/lookalike/wrong-in-context + replacement word.
LANGUAGE: passage ENGLISH only.`;
    case "underlined_inference":
      if (code === "목적추론") {
        return `5 ENGLISH purpose choices (To + verb). Exactly one correct. passageModified optional. LANGUAGE: choices ENGLISH only.
${choiceCraftCommonRules()}`;
      }
      if (code === "심경추론") {
        return `5 English emotion-change choices like "worried → relieved". Exactly one correct. LANGUAGE: choices ENGLISH only.
${choiceCraftCommonRules()}`;
      }
      if (code === "함축의미추론") {
        return `함축의미추론 — A4 변형·학력평가 동형:
형식:
- passageModified = 영어 지문. 함축 표현 1곳 (A)<u>표현</u>.
- 대상 예(A4): "the arrow is as likely to point in the reverse direction", "a game of waiting for our own turn to speak"
- 없으면 {"skip":true,"reason":"적합한 함축 표현 없음"}.
- questionText "". choices: 영어 구/절 5개.
${choiceCraftCommonRules()}
${impliedMeaningChoiceCraft()}
${choiceExplanationRules()}
해설 한글: 정답 번호 + 문맥 paraphrase 이유 + 왜 직역/일반론이 아닌지.`;
      }
      return `Underline a key expression with <u>...</u> in passageModified. 5 ENGLISH meaning choices.`;
    case "writing": {
      if (code === "문법조건영작") {
        /*
         * 선생님 요청(2026-09-28): 특정 문법을 조건으로 하는 영작. 문법은 지문에 실제로
         * 있는 것 가운데 고른다(지문에 없는 문법을 억지로 시키면 답이 지문과 겉돈다).
         */
        /*
         * 칸 이름은 이미 쓰고 있는 제시어 배열 서술형과 똑같이 <조건>/<보기>/<해석>이다.
         * 선생님 지적(2026-09-28): 새 유형만 모양이 달라 한 줄 글로 붙어 나왔다.
         * 같은 칸 이름을 쓰면 기존 인쇄 틀(상자 세 개 + 답란)이 그대로 그려 준다.
         */
        /*
         * 선생님 요청(2026-09-29): 두 가지를 버튼으로 나눈다.
         * - 지문 그대로: 그 어법이 이미 쓰인 문장을 찾아 낸다. 없으면 건너뛴다.
         * - 고쳐 쓰기: 중요한 문장을 그 어법으로 바꿔 써서 낸다.
         */
        const byPassage = writingMode === "passage";
        return `서술형 · ${byPassage ? "정해진 어법이 쓰인 문장으로" : "정해진 어법으로 고쳐 써서"} 영작하기:
- 쓸 어법은 아래 목록에 있는 것만 쓴다. [이번 문항에 쓸 어법]이 따로 주어졌으면 그것을 쓴다.
${GRAMMAR_FOR_WRITING}
${
  byPassage
    ? `- 지문에서 <b>그 어법이 실제로 쓰인 문장</b>을 찾는다. 그 문장이 정답이다.
  · 지문을 고쳐 쓰지 않는다. 원문 문장 그대로 쓴다.
  · 그 어법이 쓰인 문장이 없거나 6낱말 미만이면 {"skip":true,"reason":"지문에 그 어법이 없음"}.`
    : `- 지문에서 <b>핵심을 담은 문장 하나</b>를 고른다(주장·결과·정의·대비). 사소한 연결 문장은 고르지 않는다.
  6낱말 미만이면 다른 문장을 고른다.
- 그 문장을 <b>고른 어법으로 고쳐 쓴다.</b> 뜻은 그대로 두고 구조만 바꾼다.
  · 지문에 이미 그 어법이 쓰여 있으면 그 문장을 그대로 써도 된다.
  · 없으면 <b>고쳐 쓴 문장</b>이 정답이다. 지문에 없는 문장이어도 된다.
  · 보기: 원문 "Curiosity keeps a reader turning pages."
    → It - that 강조구문 → "It is curiosity that keeps a reader turning pages."
  · 뜻이 달라지거나 어색한 영어가 되면 <b>다른 문장</b>을 골라 다시 한다.`
}
- passageModified = 영어 지문. <b>고른 문장이 있던 자리를 ⓐ__________ 빈칸으로 바꾼다.</b>
  · 그 문장은 지문에서 <b>완전히 지운다</b>. 일부라도 남기면 안 된다(베껴 쓰게 된다).
  · 나머지 지문은 원문 그대로 둔다.
- questionText 형식(필수). 태그는 각각 <b>그 줄에 혼자</b> 있어야 한다:
<조건>
○ [어법 이름]을 사용할 것

<보기>
word1 / word2 / … (정답 문장의 낱말을 원형으로 흩어 놓는다. 8~14개)

<해석>
(정답 문장의 우리말 뜻 한 줄. 자연스러운 한국어로)

- <조건>에는 <b>어법 줄 하나만</b> 쓴다. 낱말 수·대소문자 같은 나머지 조건은
  시스템이 정답에 맞춰 붙이므로 적지 않는다.
- [어법 이름]: 위 목록의 <b>이름을 그대로</b> 옮겨 적는다. 괄호 속 형태는 적지 않는다.
  보기: 「○ It - that 강조구문을 사용할 것」, 「○ 가정법 과거를 사용할 것」.
  목록에 없는 이름을 지어내거나 「어법을 사용할 것」처럼 뭉뚱그리면 안 된다.
- correctAnswer: 고쳐 쓴 영어 문장 하나. 그 어법이 <b>눈에 보이게</b> 들어 있어야 한다.
- 보기에는 정답 문장에 쓰이는 낱말만 넣는다. 관사·전치사처럼 어형이 바뀌지 않는 말은
  그대로, 동사·명사는 원형으로 적는다.
- choices 없음. explanation 한글: 어떤 어법을 묻는지와 왜 그 형태인지 한두 줄.`;
      }
      if (code === "지칭대명사서술") {
        return `서술형 · 지칭 추론 · 대명사·지시사 (수특형):
- passageModified = 영어 지문. 지시 대상이 분명한 대명사·지시사 1곳에 ⓐ<u>it</u> (또는 this/that/they/these/those/them).
- 앞선 문맥에 선행사(명사·동명사 등)가 본문에 그대로 있어야 함.
- 적합한 대명사 지칭이 없으면 {"skip":true,"reason":"명확한 대명사 지칭 없음"}.
- questionText:
<지칭답란>
ⓐ
- correctAnswer = 본문에 나오는 선행사 (보통 1단어, 필요 시 2단어). 예: Thinking / anxiety
- 정답은 밑줄 대명사 앞쪽 본문에 실제 존재하는 단어(형태 그대로).
- choices 없음. explanation 한글: 왜 그 선행사인지.
- instruction은 생성 후 시스템이 밑줄 단어에 맞게 고침 (템플릿 유지해도 됨).`;
      }
      if (code === "특정표현의미서술") {
        return `서술형 · 지칭 추론 · 특정 표현 의미 (수특형):
- passageModified = 영어 지문. 관용·비유·함축 표현 1곳을 <u>표현</u> (예: in the same boat).
- 그 표현의 문맥 의미와 같은 말이 본문 다른 곳에 연속 구로 있어야 함.
- 없으면 {"skip":true,"reason":"문맥 동의 구 없음"}.
- 정답 구 단어 수 N = 4~10 (본문 연속 단어 수와 일치).
- questionText:
<지칭답란>
ⓐ
- correctAnswer = 본문에서 찾은 연속 N단어 구 (예: dealing with internal anxiety in social situations)
- choices 없음. explanation 한글: 밑줄 표현 ↔ 본문 구 대응.
LANGUAGE: 지문·정답 영어만.`;
      }
      if (
        code === "제시어배열기본" ||
        code === "제시어배열어형변화" ||
        code === "제시어배열단어추가"
      ) {
        const mode: WordOrderMode =
          code === "제시어배열기본"
            ? "basic"
            : code === "제시어배열어형변화"
              ? "inflect"
              : "add";
        const { focusBlock, point, c } = pickWordOrderFocus(mode);
        const catalog = wordOrderCatalogBrief();
        const modeRules =
          mode === "basic"
            ? `- <조건>: 주어진 단어를 모두 한 번씩만 사용 (필요 시 어형 변화 가능)
- <보기>: 반드시 원형·기본형만 (복수·과거·3인칭 -s 금지). 생성 후 시스템이 무작위로 섞음. 8~12개
- correctAnswer = 어형·어순을 맞춘 완성 영어
- CRITICAL: <보기> 다중집합 = correctAnswer의 모든 토큰(전치사 for/to/of, 관사 the/a, 중복 pleasure 등 포함). 정답에 쓰인 단어를 보기에서 빼지 말 것.`
            : mode === "inflect"
              ? `- <조건>: 주어진 단어를 모두 한 번씩만 사용하되, 필요한 경우 어형 변화
- <보기>: 반드시 원형·기본형만 (과거·과거분사·복수 금지). 생성 후 시스템이 무작위로 섞음
- correctAnswer = 어형 변화를 적용한 완성 영어 (예: ${c.example})
- CRITICAL: <보기> 다중집합 = correctAnswer 토큰의 원형(전치사·관사·중복 포함). 누락 금지.`
              : `- <조건>은 반드시 아래 두 줄만 (한 줄에 / 로 붙이지 말 것). 조건에 <보기> 태그 금지:
○ 단어 중복·어형 변화 가능
○ 보기에 없는 단어 추가 가능
- <보기>: 핵심 어휘 원형 6~10개만 (과거형·복수형·한글·안내문 금지). 생성 후 시스템이 무작위로 섞음
- correctAnswer = 관사·전치사·접속사 추가·어형 변화 포함한 완성문 (예: ${c.example})
- CRITICAL: 정답의 내용어(명사·동사·형용사·부사)는 모두 <보기>에 넣을 것. 관사·전치사만 보기 밖에서 추가 가능.
- 금지: <보기> 본문에 '에 없는 단어'·한글 조사·문법 설명·중복 <보기> 태그`;

        return `서술형 · 제시어 배열 — 『고등영어 어법서술형』 반영
${focusBlock}

형식 (수특·내신·교재 서술형 연습 동형):
- passageModified = 영어 지문. 위 CASE에 맞는 **중요 문장/절** 한 곳을 ⓐ__________ 빈칸으로.
  · 지문의 핵심 주장·결과·정의·조건 등 ‘중요 문장’을 대상으로 할 것 (사소한 연결 문장 금지).
  · 필요하면 그 문장만 교재 구문에 맞게 다듬어 빈칸화 (나머지 지문은 유지).
- questionText 형식(필수, 태그·순서 유지):
<조건>
(모드 규칙에 맞는 ○ 조건 1~2줄)

<보기>
word1 / word2 / …

<해석>
(빈칸 정답의 자연스러운 한국어 한 문장)

${modeRules}
- acceptableAnswers: 구두점·대소문자만 다른 허용 답
- choices 없음
- explanation 한글: 정답 문장 + GP${String(point.point).padStart(2, "0")} ${c.koLabel} 포인트 (${c.koTip})
- 금지: 이번 POINT와 무관한 단순 SVO만 반복, 지문과 무관한 새 주제 문장

${catalog}`;
      }
      return `Korean prompt + <조건> + given words in questionText. Model English answer in correctAnswer. passageModified optional.`;
    }
    case "summary_short": {
      if (code === "요약문빈칸영작") {
        return `서술형 · 요약문 빈칸 영작 (수특형 · 보기 배열):
- passageModified 생략(원문 지문 사용). 지문은 영어만.
- questionText 형식(필수) — 섹션 태그는 반드시 줄 단독. 조건 문장 안에 <보기> 태그를 넣지 말 것:
<조건>
○ 보기의 단어를 모두 한 번씩만 사용할 것
○ 글의 내용에 맞게 ⓐ, ⓑ를 완성할 것
○ ⓐ는 N단어, ⓑ는 M단어로 쓸 것 (N+M = 보기 단어 수, 예: 6·5)

<보기>
word1 / word2 / … (10~14개, 정답 ⓐ+ⓑ를 섞은 단어·기능어. 원형만)

<요약문>
(영어 요약 1~2문장. 핵심만 paraphrase. 빈칸 ⓐ__________ 와 ⓑ__________ 포함)

- correctAnswer 형식: "ⓐ: … / ⓑ: …" (완성 영어 구)
- 요약문은 지문 직역이 아니라 요지 paraphrase. 빈칸은 요약 핵심어구.
- choices 없음. explanation 한글: 정답 + 왜 그 배열인지.
- 금지: 조건 줄에 "<보기>의"처럼 태그 형태로 쓰기. "보기의"로 쓸 것.`;
      }
      if (code === "요약문빈칸2단어") {
        return `서술형 · 요약문 빈칸 · 본문에서 연속 2단어 찾기 (수특형):
- passageModified 생략. 지문 영어만.
- questionText 형식(필수):
<조건>
○ 본문에서 찾아 쓸 것
○ ⓐ는 본문에 나오는 연속된 두 단어로 쓸 것
○ ⓑ(및 ⓒ가 있으면)는 본문의 한 단어로 쓸 것 (형태 변형 금지)
○ 본문에 제시된 단어의 형태를 변형하지 말 것

<요약문>
(영어 paraphrase 요약. ⓐ__________ 는 연속 2단어 자리, ⓑ__________ 는 1단어. 필요 시 ⓒ도 1단어)

- 정답 구는 반드시 원문 passage에 연속으로 그대로 존재 (대소문자만 달라도 됨).
- correctAnswer: "ⓐ: social muscle / ⓑ: compassion" 형식
- choices 없음. explanation 한글: 본문 어디 근거인지.`;
      }
      if (code === "요약표빈칸단어") {
        /*
         * 선생님 요청(2026-09-28): 지문 내용을 표로 정리하고 (A)(B)(C)를 본문 단어로
         * 채우는 유형. 학교 시험지에서 실제로 쓰는 모양 그대로 만든다.
         */
        return `서술형 · 내용을 표로 정리 · 빈칸에 본문 단어 찾아 쓰기:
- passageModified 생략. 지문 영어만.
- 지문을 <b>두 갈래로 갈라 볼 수 있어야</b> 이 유형이 된다. 없으면 만들지 말고 SKIP.
  갈래 보기: 맞서는 두 입장 / 일어난 일과 그에 대한 반응 / 예전과 지금 / 원인과 결과.
- questionText 형식(필수). <조건>과 <표>는 각각 <b>그 줄에 혼자</b> 있어야 하고,
  표는 <b>한 줄이 한 행</b>이다(줄바꿈으로 행을 나눈다. 한 줄로 이어 붙이면 안 된다):
<조건>
○ 빈칸에 들어갈 말은 본문에서 찾아 쓸 것
○ (A), (B), (C)는 각각 한 단어로 쓸 것
○ 본문에 나온 형태를 그대로 쓸 것 (형태 변형 금지)

<표>
| | 첫째 갈래 이름 | 둘째 갈래 이름 |
| 줄이름1 | 영어 서술 … (A) … | 영어 서술 … |
| 줄이름2 | 영어 서술 … | 영어 서술 … (B) … |
| 줄이름3 | 영어 서술 … (C) … | 영어 서술 … |

실제 보기(2025년 9월 고2 19번 모양). 빈칸이 두 칸에 나뉘어 있는 것을 눈여겨본다:
| | Event | Amina's response |
| Land | Men began (A) and marking the ground. | She walked closer, wanting to know what was happening. |
| Building | Her uncle said a school would be built for village children. | Her eyes (B) with joy. |
| Distance | The nearest school was (C) away on foot. | She imagined learning to read and write. |

- 표는 <b>정확히 세 칸</b>이다. 첫 줄이 머리글이고, 그 아래 세 줄이 내용이다.
  줄마다 | 로 칸을 나눈다.
- 머리글 첫 칸은 <b>비워 둔다</b>. 뒤 두 칸에 갈래 이름을 쓴다
  (보기: Event / Amina's response, Most experts / Darby Saxbe, Before / After).
- 둘째 줄부터 첫 칸은 <b>그 줄이 무엇에 관한 줄인지</b> 한두 낱말로 적는다.
  영어 명사로 짧게 쓴다(보기: Land, Building, Distance, Cost, Timing).
  「견줄 점 1」처럼 자리표시를 그대로 두면 안 된다.
- 갈래 이름과 줄 이름은 본문에서 끌어온다(지어내지 않는다).
- 같은 줄의 두 칸은 <b>같은 것을 다룬다</b>. 왼쪽이 무엇을 말하면 오른쪽은 그것에
  대한 다른 쪽 이야기를 쓴다.
- 칸 속 영어는 완결된 문장 한두 개로 쓴다(한 칸에 6~18낱말).
- 표의 영어 서술은 지문 문장을 그대로 베끼지 말고 짧게 paraphrase 한다.
- (A)(B)(C) 자리에 들어갈 낱말은 <b>반드시 지문에 그 형태 그대로</b> 있어야 한다.
  같은 낱말이 두 칸에 들어가도 된다(그때는 같은 기호를 두 번 쓴다).
- 빈칸을 <b>한쪽 칸에만 몰지 않는다</b>. 왼쪽 칸과 오른쪽 칸에 <b>나눠</b> 둔다
  (선생님 지적 2026-09-29: 보기가 한쪽 열에만 들어가는 경우가 있다).
  빈칸이 셋이면 한쪽에 둘·다른 쪽에 하나처럼 갈라 놓는다. 줄도 서로 다른 줄에 둔다.
- correctAnswer 형식: "(A): separate / (B): email / (C): boundaries"
- choices 없음. explanation 한글: 각 낱말이 본문 어디에 근거하는지 한 줄씩.`;
      }
      if (code === "요약문빈칸3단어") {
        return `서술형 · 요약문 빈칸 · 본문에서 연속 3단어 찾기 (수특형):
- passageModified 생략. 지문 영어만.
- questionText 형식(필수):
<조건>
○ 본문에서 찾아 쓸 것
○ ⓐ는 본문에 나오는 연속된 세 단어로 쓸 것
○ 다른 빈칸이 있으면 본문 단어(1~2단어)로, 형태 변형 금지
○ 본문에 제시된 단어의 형태를 변형하지 말 것

<요약문>
(영어 paraphrase 요약. 핵심 빈칸 ⓐ__________ = 연속 3단어)

- 정답 ⓐ 구는 원문에 연속 3단어로 존재해야 함.
- correctAnswer: "ⓐ: … … … / ⓑ: …" 형식
- choices 없음. explanation 한글.`;
      }
      return `요지 영작. <조건>이 있으면 questionText에 넣고, correctAnswer에 영어 한 문장.`;
    }
    case "short_title":
    case "short_topic":
      return `Short constructed response. Model answer in correctAnswer.`;
    default:
      return `Follow Korean high-school 학력평가 mock-exam variation style (고1 level).`;
  }
}

/** 지문 표지와 정답이 묶이거나 개수 보기가 고정인 유형은 셔플 금지 */
const NO_SHUFFLE_TYPES = new Set([
  "vocabulary",
  "grammar",
  "irrelevant_sentence",
  "sentence_insertion",
  "content_count",
]);

const COUNT_CHOICES = [
  { number: 1, text: "1개" },
  { number: 2, text: "2개" },
  { number: 3, text: "3개" },
  { number: 4, text: "4개" },
  { number: 5, text: "5개" },
];

const CIRCLED = ["①", "②", "③", "④", "⑤"];

function parseChoiceAnswer(raw: unknown): number | null {
  if (typeof raw === "number" && raw >= 1 && raw <= 5) return raw;
  if (typeof raw === "string") {
    const m = raw.trim().match(/^([1-5])/);
    if (m) return Number(m[1]);
    const ci = CIRCLED.indexOf(raw.trim());
    if (ci >= 0) return ci + 1;
  }
  return null;
}

/** 객관식 선택지를 섞고 정답 번호를 맞춤 (① 편향 방지) */
function shuffleObjectiveChoices(
  choices: Array<{ number: number; text: string }>,
  correctAnswer: number,
  explanation: string
): {
  choices: Array<{ number: number; text: string }>;
  correctAnswer: number;
  explanation: string;
} {
  const n = choices.length;
  if (n < 2 || correctAnswer < 1 || correctAnswer > n) {
    return { choices, correctAnswer, explanation };
  }

  const texts = choices.map((c) => c.text);
  const correctText = texts[correctAnswer - 1]!;

  for (let i = texts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = texts[i]!;
    texts[i] = texts[j]!;
    texts[j] = tmp;
  }

  const newCorrect = texts.findIndex((t) => t === correctText) + 1;
  const newChoices = texts.map((text, i) => ({ number: i + 1, text }));

  let nextExplanation = explanation;
  if (newCorrect !== correctAnswer && explanation) {
    const from = CIRCLED[correctAnswer - 1]!;
    const to = CIRCLED[newCorrect - 1]!;
    nextExplanation = explanation
      .split(from)
      .join(to)
      .replace(
        new RegExp(`정답\\s*[:：]?\\s*${correctAnswer}\\s*번?`, "g"),
        `정답: ${newCorrect}번`
      )
      .replace(
        new RegExp(`답\\s*[:：]?\\s*${correctAnswer}\\b`, "g"),
        `답: ${newCorrect}`
      );
  }

  return {
    choices: newChoices,
    correctAnswer: newCorrect || correctAnswer,
    explanation: nextExplanation,
  };
}

function hasHangul(text: string): boolean {
  return /[\uAC00-\uD7A3]/.test(text || "");
}

function normalizePayload(
  raw: Record<string, unknown>,
  option: QuestionTypeOption,
  passage: string,
  forcedInstruction: string
): GeneratedQuestionPayload {
  let choices = Array.isArray(raw.choices)
    ? raw.choices
        .map((c, i) => {
          const row = (c ?? {}) as Record<string, unknown>;
          return {
            number: typeof row.number === "number" ? row.number : i + 1,
            text: String(row.text ?? ""),
          };
        })
        .filter((c) => c.text.trim())
    : undefined;

  // 일치개수·문장삽입·무관·어휘/어법 추론: 하단 선택지 없음 (본문 표지가 보기)
  if (
    option.type === "content_count" ||
    option.type === "sentence_insertion" ||
    option.type === "irrelevant_sentence" ||
    (option.type === "vocabulary" && option.aingkaCode === "어휘추론") ||
    (option.type === "grammar" &&
      (option.aingkaCode === "어법추론" ||
        option.aingkaCode === "어법모두고르기"))
  ) {
    choices = undefined;
  }

  // 어법/어휘 개수: 보기 고정 1개~5개 (모델이 2개·5개만 내는 것 방지)
  if (
    (option.type === "grammar" && option.aingkaCode === "어법개수") ||
    (option.type === "vocabulary" && option.aingkaCode === "어휘개수")
  ) {
    choices = COUNT_CHOICES.map((c) => ({ ...c }));
  }

  let correctAnswer: string | number | number[] = raw.correctAnswer as
    | string
    | number
    | number[];
  let explanation = String(raw.explanation ?? "");

  if (option.type === "content_count") {
    const n =
      typeof correctAnswer === "number"
        ? correctAnswer
        : parseInt(String(correctAnswer ?? "").replace(/[^\d]/g, ""), 10);
    correctAnswer = Number.isFinite(n) ? String(n) : "0";
  } else if (
    (option.type === "grammar" && option.aingkaCode === "어법개수") ||
    (option.type === "vocabulary" && option.aingkaCode === "어휘개수")
  ) {
    const n =
      typeof correctAnswer === "number"
        ? correctAnswer
        : parseInt(String(correctAnswer ?? "").replace(/[^\d]/g, ""), 10);
    const clamped = Number.isFinite(n) ? Math.min(5, Math.max(1, n)) : 1;
    correctAnswer = clamped;
  } else {
    const parsed = parseChoiceAnswer(correctAnswer);
    if (
      option.isObjective &&
      choices &&
      choices.length >= 2 &&
      !NO_SHUFFLE_TYPES.has(option.type)
    ) {
      const before = parsed ?? 1;
      const shuffled = shuffleObjectiveChoices(choices, before, explanation);
      choices = shuffled.choices;
      correctAnswer = shuffled.correctAnswer;
      explanation = shuffled.explanation;
    } else if (correctAnswer == null) {
      correctAnswer = parsed ?? 1;
    } else if (parsed != null) {
      correctAnswer = parsed;
    }
  }

  let passageModified =
    typeof raw.passageModified === "string" ? raw.passageModified : undefined;

  // 함축·어법·어휘·지칭서술: markdown 밑줄을 <u>로 정규화
  if (
    (option.type === "underlined_inference" &&
      option.aingkaCode === "함축의미추론") ||
    (option.type === "grammar" &&
      (option.aingkaCode === "어법추론" ||
        option.aingkaCode === "어법모두고르기" ||
        option.aingkaCode === "어법개수")) ||
    (option.type === "vocabulary" &&
      (option.aingkaCode === "어휘추론" || option.aingkaCode === "어휘개수")) ||
    (option.type === "writing" &&
      (option.aingkaCode === "지칭대명사서술" ||
        option.aingkaCode === "특정표현의미서술")) ||
    (option.type === "grammar" &&
      (option.aingkaCode === "어법오류수정2" ||
        option.aingkaCode === "어법오류수정3" ||
        option.aingkaCode === "어법문장오류수정"))
  ) {
    if (passageModified) {
      passageModified = passageModified
        .replace(/<\/?underline>/gi, (m) =>
          m.startsWith("</") ? "</u>" : "<u>"
        )
        .replace(/__(.+?)__/g, "<u>$1</u>")
        .replace(/\*\*(.+?)\*\*/g, "<u>$1</u>");
    }
  }

  let instructionOut = forcedInstruction;
  if (
    option.type === "underlined_inference" &&
    option.aingkaCode === "함축의미추론" &&
    passageModified
  ) {
    const um = passageModified.match(/<u>([\s\S]*?)<\/u>/i);
    const phrase = (um?.[1] || "").replace(/\s+/g, " ").trim();
    if (phrase) {
      if (!/\(A\)\s*<u>/i.test(passageModified)) {
        passageModified = passageModified.replace(/<u>/i, "(A)<u>");
      }
      instructionOut = `다음 글의 밑줄 친 (A)${phrase}가 의미하는 바로 가장 적절한 것은?`;
    }
  }
  if (
    option.type === "writing" &&
    option.aingkaCode === "지칭대명사서술" &&
    passageModified
  ) {
    const um = passageModified.match(
      /ⓐ\s*<u>([\s\S]*?)<\/u>|<u>([\s\S]*?)<\/u>/i
    );
    const pronoun = (um?.[1] || um?.[2] || "it").replace(/\s+/g, " ").trim();
    if (!/ⓐ\s*<u>/i.test(passageModified) && /<u>/i.test(passageModified)) {
      passageModified = passageModified.replace(/<u>/i, "ⓐ<u>");
    }
    const ansWord = String(correctAnswer ?? "")
      .replace(/^ⓐ\s*[:：]?\s*/i, "")
      .trim();
    const n = Math.max(1, countEnglishWords(ansWord) || 1);
    instructionOut =
      n === 1
        ? `다음 글의 밑줄 친 ⓐ${pronoun}이 가리키는 바를 본문에서 정확히 찾아 한 단어의 영어로 쓰시오.`
        : `다음 글의 밑줄 친 ⓐ${pronoun}이 가리키는 바를 본문에서 정확히 찾아 ${n}단어의 영어로 쓰시오.`;
  }
  if (
    option.type === "writing" &&
    option.aingkaCode === "특정표현의미서술" &&
    passageModified
  ) {
    const um = passageModified.match(/<u>([\s\S]*?)<\/u>/i);
    const expr = (um?.[1] || "").replace(/\s+/g, " ").trim();
    const ansPhrase = String(correctAnswer ?? "")
      .replace(/^ⓐ\s*[:：]?\s*/i, "")
      .trim();
    const n = Math.max(1, countEnglishWords(ansPhrase) || 1);
    if (expr) {
      instructionOut = `다음 글의 밑줄 친 ${expr}가 문맥상 의미하는 바를 본문에서 찾아 ${n}단어의 영어로 쓰시오.`;
    }
  }

  return {
    type: option.type,
    category: option.category,
    difficulty: option.difficulty,
    choiceLanguage: option.choiceLanguage,
    passageOriginal: passage,
    passageModified,
    instruction: instructionOut,
    questionText: cleanQuestionText(String(raw.questionText ?? "")),
    choices,
    correctAnswer,
    acceptableAnswers: Array.isArray(raw.acceptableAnswers)
      ? raw.acceptableAnswers.map((x) => String(x))
      : undefined,
    /*
     * 선생님 지적(2026-09-29): 해설지에 "맞다."와 "맞습니다."가 섞여 나와 헷갈린다.
     * 프롬프트로도 시키지만 이따금 존댓말로 돌아가므로 내보내기 전에 어미를 고른다.
     */
    explanation: plainKorean(explanation),
    hardWords: questionNeedsVocabGloss({
      choices,
      questionType: option.type,
      optionKey: option.key,
      questionText: String(raw.questionText ?? ""),
      choiceLanguage: option.choiceLanguage,
    })
      ? normalizeHardWordsFromRaw(raw.hardWords)
      : [],
    evidence: [],
    scoringGuide:
      raw.scoringGuide && typeof raw.scoringGuide === "object"
        ? (raw.scoringGuide as GeneratedQuestionPayload["scoringGuide"])
        : undefined,
  };
}

export function assertBasicQuestionShape(
  q: GeneratedQuestionPayload,
  option: QuestionTypeOption,
  /** 지정 문법을 지문에서 찾았는지, 고쳐 썼는지 (선생님 요청 2026-09-29) */
  writingMode: "passage" | "paraphrase" = "paraphrase"
): string | null {
  if (!q.instruction.trim()) return "발문이 비어 있습니다.";
  if (!q.explanation.trim()) return "해설이 비어 있습니다.";

  const englishBodyTypes = new Set([
    "order",
    "sentence_blank",
    "sentence_insertion",
    "irrelevant_sentence",
    "grammar",
    "vocabulary",
  ]);
  if (englishBodyTypes.has(option.type)) {
    const body = [
      q.passageModified || "",
      option.type === "sentence_insertion" ? q.questionText || "" : "",
      ...(option.type === "grammar" || option.type === "vocabulary"
        ? []
        : (q.choices ?? []).map((c) => c.text)),
    ].join("\n");
    if (hasHangul(body)) {
      return "본문·선택지는 영어여야 합니다 (한글 포함됨).";
    }
  }

  if (option.type === "sentence_insertion") {
    if (!(q.questionText || "").trim()) {
      return "문장삽입은 주어진 문장(questionText)이 필요합니다.";
    }
    const mod = q.passageModified || "";
    if (!/[①②③④⑤]/.test(mod) && !/\(\s*[1-5]\s*\)/.test(mod)) {
      return "문장삽입 본문에 ①~⑤ 위치 표시가 필요합니다.";
    }
    q.choices = undefined;
  } else if (option.type === "irrelevant_sentence") {
    const mod = q.passageModified || "";
    if (!/[ⓐⓑⓒⓓⓔ]/.test(mod) && !/[①②③④⑤]/.test(mod) && !/\([A-E]\)/.test(mod)) {
      return "무관한 문장 본문에 ⓐ~ⓔ 표지가 필요합니다.";
    }
    q.choices = undefined;
  } else if (
    option.type === "underlined_inference" &&
    option.aingkaCode === "함축의미추론"
  ) {
    const mod = q.passageModified || "";
    if (!/<u>[\s\S]*?<\/u>/i.test(mod)) {
      return "함축의미추론은 본문에 <u>밑줄</u> 표시가 필요합니다.";
    }
    if (!/\(A\)/i.test(mod)) {
      // normalizePayload에서 보정하지만, 이중 안전
      q.passageModified = mod.replace(/<u>/i, "(A)<u>");
    }
    if (!q.choices || q.choices.length < 5) {
      return "객관식 선택지가 5개 미만입니다.";
    }
    if ((q.choices ?? []).some((c) => hasHangul(c.text))) {
      return "함축의미추론 선택지는 영어여야 합니다.";
    }
    // 발문에 밑줄 표현 반영
    const um = (q.passageModified || "").match(/<u>([\s\S]*?)<\/u>/i);
    const phrase = (um?.[1] || "").replace(/\s+/g, " ").trim();
    if (phrase && !q.instruction.includes(phrase)) {
      q.instruction = `다음 글의 밑줄 친 (A)${phrase}가 의미하는 바로 가장 적절한 것은?`;
    }
  } else if (
    option.type === "writing" &&
    (option.aingkaCode === "제시어배열기본" ||
      option.aingkaCode === "제시어배열어형변화" ||
      option.aingkaCode === "제시어배열단어추가")
  ) {
    const qt = q.questionText || "";
    if (!/<조건>/.test(qt) || !/<보기>/.test(qt) || !/<해석>/.test(qt)) {
      return "제시어 배열은 questionText에 <조건>·<보기>·<해석>이 필요합니다.";
    }
    const mod = q.passageModified || "";
    if (!/ⓐ/.test(mod) || !/_{3,}/.test(mod)) {
      return "제시어 배열 본문에 ⓐ__________ 빈칸 표시가 필요합니다.";
    }
    if (hasHangul(mod)) {
      return "제시어 배열 본문은 영어여야 합니다 (한글 포함됨).";
    }
    if (!String(q.correctAnswer ?? "").trim()) {
      return "제시어 배열 정답(영어 완성문)이 필요합니다.";
    }
    q.choices = undefined;
    const woMode =
      option.aingkaCode === "제시어배열단어추가"
        ? ("add" as const)
        : option.aingkaCode === "제시어배열어형변화"
          ? ("inflect" as const)
          : ("basic" as const);
    q.questionText = normalizeWordOrderQuestionText(q.questionText || "", {
      correctAnswer: String(q.correctAnswer ?? ""),
      mode: woMode,
    });
  } else if (
    option.type === "writing" &&
    (option.aingkaCode === "지칭대명사서술" ||
      option.aingkaCode === "특정표현의미서술")
  ) {
    const mod = q.passageModified || "";
    if (!/<u>[\s\S]*?<\/u>/i.test(mod)) {
      return "지칭 서술형은 본문에 <u>밑줄</u>이 필요합니다.";
    }
    if (hasHangul(mod)) {
      return "지칭 서술형 본문은 영어여야 합니다.";
    }
    const ans = String(q.correctAnswer ?? "")
      .replace(/^ⓐ\s*[:：]?\s*/i, "")
      .trim();
    if (!ans) {
      return "지칭 서술형 정답이 필요합니다.";
    }
    if (hasHangul(ans)) {
      return "지칭 서술형 정답은 영어여야 합니다.";
    }
    const bodyForMatch = `${q.passageOriginal || ""}\n${mod}`;
    if (option.aingkaCode === "지칭대명사서술") {
      if (!/ⓐ\s*<u>/i.test(mod)) {
        return "대명사 지칭은 본문에 ⓐ<u>…</u> 표시가 필요합니다.";
      }
      const n = countEnglishWords(ans);
      if (n < 1 || n > 3) {
        return "대명사 지칭 정답은 본문에서 찾은 1~3단어여야 합니다.";
      }
      if (!passageHasConsecutiveWords(bodyForMatch, ans, n)) {
        return "대명사 지칭 정답이 본문에 있어야 합니다.";
      }
      const um = mod.match(/ⓐ\s*<u>([\s\S]*?)<\/u>/i);
      const pronoun = (um?.[1] || "it").replace(/\s+/g, " ").trim();
      q.instruction =
        n === 1
          ? `다음 글의 밑줄 친 ⓐ${pronoun}이 가리키는 바를 본문에서 정확히 찾아 한 단어의 영어로 쓰시오.`
          : `다음 글의 밑줄 친 ⓐ${pronoun}이 가리키는 바를 본문에서 정확히 찾아 ${n}단어의 영어로 쓰시오.`;
    } else {
      const n = countEnglishWords(ans);
      if (n < 3 || n > 12) {
        return "특정 표현 의미 정답은 본문 연속 3~12단어여야 합니다.";
      }
      if (!passageHasConsecutiveWords(bodyForMatch, ans, n)) {
        return "특정 표현 의미 정답이 본문에 연속 구로 있어야 합니다.";
      }
      const um = mod.match(/<u>([\s\S]*?)<\/u>/i);
      const expr = (um?.[1] || "").replace(/\s+/g, " ").trim();
      if (expr) {
        q.instruction = `다음 글의 밑줄 친 ${expr}가 문맥상 의미하는 바를 본문에서 찾아 ${n}단어의 영어로 쓰시오.`;
      }
    }
    if (!/<지칭답란>/.test(q.questionText || "")) {
      q.questionText = "<지칭답란>\nⓐ";
    }
    q.correctAnswer = ans;
    q.choices = undefined;
  } else if (
    option.type === "grammar" &&
    (option.aingkaCode === "어법오류수정2" ||
      option.aingkaCode === "어법오류수정3" ||
      option.aingkaCode === "어법문장오류수정")
  ) {
    const wrongN =
      option.aingkaCode === "어법오류수정2"
        ? 2
        : option.aingkaCode === "어법오류수정3"
          ? 3
          : 2;
    const mod = q.passageModified || "";
    if (hasHangul(mod)) {
      return "어법 수정 본문은 영어여야 합니다.";
    }
    if (option.aingkaCode === "어법문장오류수정") {
      if (!/[①②③④⑤]/.test(mod)) {
        return "문장 단위 어법 수정은 ①~⑤ 표지가 필요합니다.";
      }
    } else if (option.aingkaCode === "어법오류수정2") {
      if (!/[ⓐⓑⓒⓓⓔ]/.test(mod) || !/<u>[\s\S]*?<\/u>/i.test(mod)) {
        return "어법 2개 수정은 ⓐ~ⓔ 밑줄이 필요합니다.";
      }
    } else if (!/[ⓐⓑⓒⓓⓔⓕⓖ]/.test(mod) || !/<u>[\s\S]*?<\/u>/i.test(mod)) {
      return "어법 3개 수정은 ⓐ~ⓖ 밑줄이 필요합니다.";
    }
    const ans = String(q.correctAnswer ?? "").trim();
    if (!ans) {
      return "어법 수정 정답(기호+바른 형태)이 필요합니다.";
    }
    const reconciled = reconcileGrammarFixQuestion({
      passageModified: mod,
      correctAnswer: ans,
      explanation: q.explanation || "",
      wrongN,
    });
    if (!reconciled.ok) {
      return reconciled.reason ?? "어법 수정 정답·해설·본문이 일치하지 않습니다.";
    }
    q.correctAnswer = reconciled.correctAnswer;
    q.explanation = reconciled.explanation;
    if (!/<조건>/.test(q.questionText || "")) {
      q.questionText = `<조건>\n○ 틀린 곳의 기호와 수정한 형태를 모두 써야 정답으로 인정함\n\n<답안행>\n${wrongN}`;
    } else if (!/<답안행>/.test(q.questionText || "")) {
      q.questionText = `${q.questionText}\n\n<답안행>\n${wrongN}`;
    }
    q.choices = undefined;
  } else if (option.aingkaCode === "요약표빈칸단어") {
    /*
     * 선생님 지적(2026-09-28): 표가 한 줄 글로 붙어 나왔다. 인쇄가 표로 그리려면
     * <조건>·<표>가 줄 단위로 서 있어야 하므로, 여기서 갈라지지 않으면 버린다.
     */
    const blocks = parseSummaryTableBlocks(q.questionText || "");
    if (!blocks) {
      return "요약표 유형은 questionText에 <조건>과 <표>가 각각 줄 단위로 필요합니다.";
    }
    if (blocks.rows.length < 3 || (blocks.rows[0]?.length ?? 0) !== 3) {
      return "요약표는 머리글 한 줄과 내용 두 줄 이상, 줄 이름 칸을 포함해 세 칸이어야 합니다.";
    }
    const bodyRows = blocks.rows.slice(1);
    if (bodyRows.some((r) => r.slice(1).some((cell) => !cell.trim()))) {
      return "요약표에 빈 칸이 있습니다.";
    }
    const keys = bodyRows.map((r) => r[0] ?? "");
    if (keys.some((k) => !k.trim() || /견줄\s*점|비교\s*점/.test(k) || k.trim().length > 20)) {
      return "표 첫 칸에는 그 줄을 가리키는 짧은 이름이 필요합니다(예: Land, Building, Distance).";
    }
    /*
     * 빈칸이 한쪽 칸에만 몰리면 표를 가로로 읽을 일이 없어진다
     * (선생님 지적 2026-09-29: 보기가 한쪽 열에만 들어간다).
     */
    const blankCols = new Set<number>();
    for (const row of bodyRows) {
      row.forEach((cell, i) => {
        if (i > 0 && /\([A-E]\)/.test(cell)) blankCols.add(i);
      });
    }
    if (blocks.blankLabels.length >= 2 && blankCols.size < 2) {
      return "빈칸이 한쪽 칸에만 몰려 있습니다. 왼쪽·오른쪽 칸에 나눠 두세요.";
    }
    if (blocks.blankLabels.length < 2) {
      return "표 안에 (A)·(B) 같은 빈칸이 두 개 이상 필요합니다.";
    }
    const passage = q.passageOriginal || "";
    for (const part of String(q.correctAnswer ?? "").split("/")) {
      const word = part.replace(/\([A-E]\)\s*[:：]?/, "").trim();
      if (!word) continue;
      if (!passageHasConsecutiveWords(passage, word, 1)) {
        return `정답 낱말 「${word}」이 지문에 그대로 없습니다.`;
      }
    }
    q.choices = undefined;
  } else if (option.aingkaCode === "문법조건영작") {
    /*
     * 기존 제시어 배열 서술형과 같은 칸(<조건>/<보기>/<해석>)이어야 인쇄가 상자로 그린다.
     * 조건에 어법 이름과 괄호 안 형태가 없으면 학생이 무엇을 쓸지 알 수 없어 버린다.
     */
    const blocks = parseWordOrderBlocks(q.questionText || "");
    if (!blocks) {
      return "조건 영작은 questionText에 <조건>·<보기>·<해석>이 각각 줄 단위로 필요합니다.";
    }
    const firstCondition = blocks.conditions.split(/\n+/)[0] ?? "";
    const grammar = findWritingGrammar(firstCondition);
    if (!grammar) {
      return "첫 조건에 어법 목록에 있는 이름이 필요합니다(예: 가정법 과거).";
    }
    const answer = String(q.correctAnswer ?? "").trim();
    if (!answer) {
      return "조건 영작 정답 문장이 필요합니다.";
    }
    /*
     * 선생님 요청(2026-09-29): 두 가지 방식이 있다.
     * - 지문 그대로: 정답이 지문에 있는 문장이어야 한다.
     * - 고쳐 쓰기: 지문에 없어도 된다. 대신 그 어법이 정답 문장에 정말 보여야 한다.
     * 어느 쪽이든 고른 어법이 안 보이면 버린다(어법을 골라 놓고 딴 게 나오던 것을 막는다).
     */
    if (writingMode === "passage") {
      if (!passageHasConsecutiveWords(q.passageOriginal || "", answer)) {
        return "「지문 그대로」로 만들 때는 정답이 지문에 있는 문장이어야 합니다.";
      }
    }
    if (grammar.check && !grammar.check.test(answer)) {
      return `정답 문장에 ${grammar.label}이 보이지 않습니다: ${answer}`;
    }
    /*
     * 선생님 지적(2026-09-28): 지문에 정답 문장이 그대로 있으면 베껴 쓰면 된다.
     * 기존 제시어 배열처럼 그 자리를 ⓐ__________ 빈칸으로 뚫어야 한다.
     */
    const modified = String(q.passageModified ?? "").trim();
    if (!modified) {
      return "조건 영작은 정답 문장을 빈칸으로 뚫은 지문(passageModified)이 필요합니다.";
    }
    if (!/ⓐ/.test(modified) || !/_{3,}/.test(modified)) {
      return "지문에 ⓐ__________ 빈칸이 필요합니다.";
    }
    if (passageHasConsecutiveWords(modified, answer)) {
      return "지문에 정답 문장이 그대로 남아 있습니다. 그 자리를 빈칸으로 바꿔야 합니다.";
    }

    /*
     * 조건은 코드가 다시 짠다 — 선생님 요청(2026-09-28): 조건을 좀 더 자세하게.
     * 모델이 쓴 문구는 어법 이름을 알아내는 데만 쓰고, 시험지에 실리는 줄은
     * 어법마다 정해 둔 것으로 채운다. 그래야 문항마다 조건이 들쭉날쭉하지 않다.
     * 낱말 수는 정답에서 세므로 늘 맞는다.
     */
    const wordCount = tokenizeAnswerPhrase(answer).length;
    const conditionLines = [
      // 선생님 요청(2026-09-28): 조건에는 문법 용어만 적는다. 괄호 속 형태는 빼 준다.
      `○ ${grammar.label}${objectParticle(grammar.label)} 사용할 것`,
      "○ <보기>에 있는 단어를 모두 한 번씩 사용할 것 (단어를 더하거나 빼지 말 것)",
      "○ 필요하면 어형을 바꿔 쓸 것 (시제·수·태에 유의할 것)",
      ...(wordCount > 0 ? [`○ 모두 ${wordCount}단어로 쓸 것`] : []),
      "○ 첫 글자는 대문자로 쓰고, 문장 끝에 알맞은 문장 부호를 쓸 것",
    ];
    /*
     * 선생님 지적(2026-09-29): 보기 단어가 정답 순서 그대로 나왔다 — 베껴 쓰면 끝나는 문항이 된다.
     * 다른 제시어 배열은 normalizeWordOrderQuestionText가 섞어 주는데, 이 유형만 그 손질을
     * 거치지 않고 모델이 쓴 줄을 그대로 실었다. 여기서도 정답에서 보기를 다시 짜고 섞는다.
     * 조건이 「필요하면 어형을 바꿔 쓸 것」이므로 원형으로 낸다.
     */
    const bank =
      normalizeAndShuffleWordBank(
        joinWordBank(buildWordBankFromAnswer(answer, "inflect", blocks.words))
      ) || normalizeAndShuffleWordBank(blocks.words);

    q.questionText = [
      "<조건>",
      conditionLines.join("\n"),
      "",
      "<보기>",
      bank,
      "",
      "<해석>",
      blocks.translation,
    ].join("\n");
    q.choices = undefined;
  } else if (
    option.type === "summary_short" &&
    (option.aingkaCode === "요약문빈칸영작" ||
      option.aingkaCode === "요약문빈칸2단어" ||
      option.aingkaCode === "요약문빈칸3단어")
  ) {
    const qt = q.questionText || "";
    const blocks = parseSummaryWritingBlocks(qt);
    if (!blocks) {
      return "요약문 서술형은 questionText에 <조건>·<요약문>이 필요합니다.";
    }
    if (option.aingkaCode === "요약문빈칸영작" && !blocks.words) {
      return "요약문 빈칸 영작은 <보기>가 필요합니다.";
    }
    if (!/[ⓐ]/.test(blocks.summary) || !/_{3,}/.test(blocks.summary)) {
      return "요약문에 ⓐ__________ 빈칸이 필요합니다.";
    }
    if (hasHangul(blocks.summary)) {
      return "요약문은 영어여야 합니다 (한글 포함됨).";
    }
    const ans = String(q.correctAnswer ?? "").trim();
    if (!ans) {
      return "요약문 빈칸 정답이 필요합니다.";
    }
    const passage = q.passageOriginal || "";
    if (
      option.aingkaCode === "요약문빈칸2단어" ||
      option.aingkaCode === "요약문빈칸3단어"
    ) {
      const n = option.aingkaCode === "요약문빈칸2단어" ? 2 : 3;
      // ⓐ: phrase 추출
      const m =
        ans.match(/ⓐ\s*[:：]?\s*([^/ⓐⓑⓒ\n]+)/i) ||
        ans.match(/^([^/]+)/);
      const phrase = (m?.[1] || "").trim();
      if (!passageHasConsecutiveWords(passage, phrase, n)) {
        return `요약문 ${n}단어 정답(ⓐ)이 본문에 연속 ${n}단어로 있어야 합니다.`;
      }
    }
    q.choices = undefined;
  } else if (option.isObjective && option.choiceLanguage) {
    if (!q.choices || q.choices.length < 5) {
      return "객관식 선택지가 5개 미만입니다.";
    }
  }

  if (option.type === "content_count") {
    const qt = (q.questionText || "").trim();
    if (!qt || !/\(1\)/.test(qt)) {
      return "일치개수 문항은 <보기> (1)(2)… 진술이 필요합니다.";
    }
    if (q.choices && q.choices.length > 0) {
      q.choices = undefined;
    }
    const ans = String(q.correctAnswer ?? "").trim();
    if (!/^\d+$/.test(ans)) {
      return "일치개수 정답은 숫자(개수)여야 합니다.";
    }
  }

  if (option.type === "order" && (!q.choices || q.choices.length < 5)) {
    return "객관식 선택지가 5개 미만입니다.";
  }

  if (option.type === "grammar" && option.isObjective) {
    const mod = q.passageModified || "";
    const isGrammarInference =
      option.aingkaCode === "어법추론" ||
      option.aingkaCode === "어법모두고르기";

    if (option.aingkaCode === "어법개수") {
      if (!q.choices || q.choices.length < 5) {
        return "객관식 선택지가 5개 미만입니다.";
      }
      if (!/[ⓐⓑⓒⓓⓔⓕ]/.test(mod) || !/<u>[\s\S]*?<\/u>/i.test(mod)) {
        return "어법 개수 문항은 ⓐ~ⓕ 밑줄 표지가 필요합니다.";
      }
    } else if (isGrammarInference) {
      // 어법 추론: 하단 조합 보기 없음 — 본문 ⓐ~ⓔ가 보기
      q.choices = undefined;
      if (!/[ⓐⓑⓒⓓⓔ]/.test(mod) || !/<u>[\s\S]*?<\/u>/i.test(mod)) {
        return "어법 추론 문항은 ⓐ~ⓔ 밑줄 표지가 필요합니다.";
      }
      const ans = parseChoiceAnswer(q.correctAnswer);
      if (ans == null) {
        return "어법 추론 정답은 1~5여야 합니다.";
      }
      q.correctAnswer = ans;
    } else if (!q.choices || q.choices.length < 5) {
      return "객관식 선택지가 5개 미만입니다.";
    }
    if (hasHangul(mod)) {
      return "본문은 영어여야 합니다 (한글 포함됨).";
    }
  }

  if (option.type === "vocabulary" && option.isObjective) {
    const mod = q.passageModified || "";
    if (option.aingkaCode === "어휘개수") {
      if (!q.choices || q.choices.length < 5) {
        return "객관식 선택지가 5개 미만입니다.";
      }
      const texts = (q.choices ?? []).map((c) => c.text.trim());
      if (texts.join("|") !== "1개|2개|3개|4개|5개") {
        return "어휘 개수 보기는 1개~5개여야 합니다.";
      }
      if (!/[①②③④⑤⑥]/.test(mod) || !/<u>[\s\S]*?<\/u>/i.test(mod)) {
        return "어휘 개수 문항은 ①~⑥ 밑줄 표지가 필요합니다.";
      }
    } else {
      // 어휘추론: 하단 보기 없음
      q.choices = undefined;
      if (!/[①②③④⑤]/.test(mod) || !/<u>[\s\S]*?<\/u>/i.test(mod)) {
        return "어휘 고르기 문항은 ①~⑤ 밑줄 표지가 필요합니다.";
      }
      const ans = parseChoiceAnswer(q.correctAnswer);
      if (ans == null) {
        return "어휘 고르기 정답은 1~5여야 합니다.";
      }
      q.correctAnswer = ans;
    }
    if (hasHangul(mod)) {
      return "본문은 영어여야 합니다 (한글 포함됨).";
    }
  }

  if (option.type === "grammar" && option.aingkaCode === "어법개수") {
    const texts = (q.choices ?? []).map((c) => c.text.trim());
    if (texts.join("|") !== "1개|2개|3개|4개|5개") {
      return "어법 개수 보기는 1개~5개여야 합니다.";
    }
  }

  return null;
}

/**
 * 모든 문항에 공통인 규칙 — 유형·지문과 무관하게 항상 같은 문자열이어야
 * 같은 지문의 여러 문항에서 프롬프트 캐시가 앞부분을 재사용한다.
 * 유형·문항별 규칙은 user 메시지 끝(ITEM RULES)에 붙인다.
 */
const QUESTION_WRITER_SHARED_SYSTEM = `Korean HS English exam writer. ONE question JSON only. Fast & concise.
- No meta tags.
- NEVER create 요약문완성 (Korean summary with (A)/(B) blanks and …… pair choices). That type is removed.
- For MCQ: correctAnswer is 1-5. Prefer varied positions (not always 1).
- hardWords: When (a) English MCQ choices or (b) 일치개수 English <보기> (or Korean <보기>→passage): include 4~6 {word, meaning}. Target ≈ 중3+ / Lexile ≥~1000L (US Grade 8 CCSS text ~1010L–1185L). Prefer the HARDER lemmas that appear in THIS item's English — skip ultra-basics (people/important/money/make/need). Include short non-basic lemmas when apt (swap, skim, grasp, yield, burden, voucher, reluctant, scrutinize, comparable, misprint, conscious). Single dictionary token only (never phrases like "national monies"). Fake plurals (monies/datas) forbidden. meaning = short Korean gloss. Rotate lemmas across same-passage slots. If none fit → []. For Korean-only MCQ / count-only / subjective without English 보기 → [].
- explanation(해설)은 "~다"로 끝나는 평서형으로 쓴다. 존댓말("맞습니다", "합니다", "해요") 금지.
  보기: "정답은 ②다.", "앞 문장과 뜻이 반대라 틀리다.", "빈칸 뒤 근거와 맞다."
- The user message gives the passage data (JSON) first, then ITEM RULES for this question. Follow every ITEM RULE exactly, with the same priority as the rules above.`;

export async function generateOneQuestion(opts: {
  passage: string;
  analysis: PassageAnalysis;
  option: QuestionTypeOption;
  grade: string;
  overallDifficulty: string;
  sourceDetail?: string;
  /** 같은 지문 내 슬롯 (어휘·paraphrase 다양화) */
  diversitySlot?: { index: number; total: number; label: string };
  /** 원래 시험지의 수준을 적은 한 문단(동형모의고사). 선택지 길이·어휘를 여기에 맞춘다 */
  levelBrief?: string;
  /** 조건 영작에서 쓸 어법 이름 목록. 비우면 교재 기준 30가지에서 고른다 */
  grammarScope?: string[];
  grammarWritingMode?: "passage" | "paraphrase";
  /** 이 문항의 목표 난이도. 없으면 overallDifficulty(내신→중, 고난도→상)를 따른다 */
  targetLevel?: TargetLevel | null;
  /** 어법·어휘에서 지문을 바꿔 써도 되는지(기본은 원문 그대로) */
  paraphraseGrammarVocab?: boolean;
}): Promise<GeneratedQuestionPayload> {
  const { option, passage, analysis } = opts;

  // 문장삽입·무관한문장: 문장 5개 이하면 출제 불가
  if (
    option.type === "sentence_insertion" ||
    option.type === "irrelevant_sentence"
  ) {
    const n = countEnglishSentences(passage);
    if (n < MIN_SENTENCES_FOR_INSERTION_IRRELEVANT) {
      throw new SkipQuestionError(
        `지문 문장이 ${n}개라 문장삽입·무관한문장을 생략합니다 (6개 이상 필요).`
      );
    }
  }

  const meta = findAingkaOption(option.key);
  if (meta?.aingkaCode && !option.aingkaCode) {
    option.aingkaCode = meta.aingkaCode;
  }
  const forcedInstruction =
    meta?.koreanStem ||
    option.koreanStem ||
    "윗글의 내용과 일치하지 않는 것은?";

  const slimAnalysis = {
    overallTopic: analysis.overallTopic,
    overallMainIdea: analysis.overallMainIdea,
    titleCandidates: (analysis.titleCandidates ?? []).slice(0, 4),
  };

  const wordOrderCodes = new Set([
    "제시어배열기본",
    "제시어배열어형변화",
    "제시어배열단어추가",
  ]);
  const isWordOrder =
    option.type === "writing" &&
    wordOrderCodes.has(option.aingkaCode || meta?.aingkaCode || "");

  const referenceCodes = new Set(["지칭대명사서술", "특정표현의미서술"]);
  const isReferenceWriting =
    option.type === "writing" &&
    referenceCodes.has(option.aingkaCode || meta?.aingkaCode || "");

  const summaryBlankCodes = new Set([
    "요약문빈칸영작",
    "요약문빈칸2단어",
    "요약문빈칸3단어",
  ]);
  const isSummaryBlank =
    option.type === "summary_short" &&
    summaryBlankCodes.has(option.aingkaCode || meta?.aingkaCode || "");

  const englishBodyTypes = new Set([
    "order",
    "sentence_blank",
    "sentence_insertion",
    "irrelevant_sentence",
    "grammar",
    "vocabulary",
  ]);
  const englishOnlyHint = isWordOrder
    ? "- CRITICAL LANGUAGE: passageModified MUST be ENGLISH only (blank ⓐ__________). questionText may include Korean in <해석>. correctAnswer ENGLISH."
    : isSummaryBlank
      ? "- CRITICAL LANGUAGE: <요약문> and correctAnswer ENGLISH only. <조건> may be Korean. Do NOT create old 요약문완성 MCQ with (A)/(B) …… pairs."
      : isReferenceWriting
        ? "- CRITICAL LANGUAGE: passageModified ENGLISH with <u>underline</u>. correctAnswer = exact words from passage. questionText = <지칭답란>."
    : englishBodyTypes.has(option.type)
    ? option.type === "grammar" || option.type === "vocabulary"
      ? "- CRITICAL LANGUAGE: passageModified MUST be ENGLISH only. Choice texts may be Korean (조합/개수) or empty numbers. Never put Hangul in the passage."
      : "- CRITICAL LANGUAGE: passageModified, questionText (if any), and choices MUST be ENGLISH only. Never put Korean Hangul in passage or choices. Only instruction/explanation may be Korean."
    : "";

  const grammarFixCodes = new Set([
    "어법오류수정2",
    "어법오류수정3",
    "어법문장오류수정",
  ]);
  const isGrammarFix =
    option.type === "grammar" &&
    grammarFixCodes.has(option.aingkaCode || meta?.aingkaCode || "");

  const needsModified =
    [
      "grammar",
      "vocabulary",
      "sentence_blank",
      "order",
      "sentence_insertion",
      "irrelevant_sentence",
      "underlined_inference",
    ].includes(option.type) ||
    isWordOrder ||
    isReferenceWriting;

  const needsQuestionText =
    option.type === "content_count" ||
    option.type === "sentence_insertion" ||
    isWordOrder ||
    isSummaryBlank ||
    isReferenceWriting ||
    isGrammarFix ||
    (option.type === "writing" && option.aingkaCode === "서술형영작");
  const paraphraseTypes = new Set([
    "title",
    "topic",
    "summary_mcq",
    "content_true",
    "content_false",
    "content_count",
  ]);
  /*
   * 선생님이 고른 어법 범위에서 <b>이번 문항에 쓸 어법 하나</b>를 여기서 정한다.
   *
   * 선생님 지적(2026-09-29): 어법을 골라도 그게 안 나온다. 예전에는 「범위 안에서
   * 지문에 있는 것을 고르라」고만 해서, 지문에 없으면 딴 어법으로 새거나 건너뛰었다.
   * 이제 한 문항에 하나를 딱 정해 주고, 지문에 없으면 문장을 그 어법으로 고쳐 쓰게 한다.
   * 여러 개를 고르면 문항마다 돌아가며 쓴다.
   */
  const pickedWritingGrammar = (() => {
    if (option.aingkaCode !== "문법조건영작") return null;
    const scope = (opts.grammarScope ?? [])
      .map((label) => WRITING_GRAMMARS.find((g) => g.label === label))
      .filter((g): g is WritingGrammar => Boolean(g));
    if (scope.length === 0) return null;
    const turn = opts.diversitySlot?.index ?? 0;
    return scope[turn % scope.length]!;
  })();

  const paraphraseSystemHint = paraphraseTypes.has(option.type)
    ? "- Choices/<보기> MUST paraphrase with ROTATING synonyms/near-synonyms (동의어·유의어). Do NOT copy passage phrases. Across same-passage items, avoid reusing the same theme-word set every time; vary wording and use antonyms mainly in distractors."
    : "";
  const craftSystemHint = option.isObjective
    ? "- 보기: 5개 모두 그럴듯하게. 정답만 눈에 띄지 않게. 강한 오답 ≥2. 황당 오답 금지. 정답 하나. 길이·구조 균형."
    : "";

  const diversityHint =
    opts.diversitySlot && opts.diversitySlot.total > 1
      ? `- DIVERSITY SLOT ${opts.diversitySlot.index + 1}/${opts.diversitySlot.total} (${opts.diversitySlot.label}): same passage has many items. Use a DISTINCT synonym/near-synonym set and DISTINCT hardWords for THIS slot. Do not reuse the most obvious passage theme words that every slot would pick. Distractors may use subtle antonym/contrast shifts.`
      : "";

  const allowSkip =
    (option.type === "underlined_inference" &&
      (option.aingkaCode === "함축의미추론" ||
        meta?.aingkaCode === "함축의미추론")) ||
    isReferenceWriting;

  const questionTextRule = needsQuestionText
    ? option.type === "sentence_insertion"
      ? "Fill questionText with the ENGLISH given sentence to insert."
      : isWordOrder
        ? "Fill questionText with <조건>, <보기>, <해석>. Blank = IMPORTANT passage sentence reflecting the sampled GRAMMAR POINT (not a trivial SVO)."
        : isSummaryBlank
          ? "Fill questionText with <조건>, optional <보기>, and <요약문> with ⓐ/ⓑ blanks."
          : isReferenceWriting
            ? "Fill questionText with <지칭답란> and ⓐ. passageModified needs <u>underline</u>."
            : isGrammarFix
              ? "Fill questionText with <조건> and <답안행>N. No MCQ choices."
              : option.type === "content_count"
                ? "Fill questionText with (1)(2)… statements."
                : "Fill questionText with <조건>/<보기> as needed."
    : 'questionText usually "".';

  const passageModifiedRule = needsModified
    ? isWordOrder
      ? "passageModified MUST include blank ⓐ__________ in the ENGLISH passage."
      : isReferenceWriting
        ? "passageModified MUST underline the pronoun/expression with <u>…</u> (대명사는 ⓐ<u>it</u>)."
        : "Use passageModified when needed."
    : "Do NOT change passage; omit passageModified.";

  const explanationRule = isWordOrder
    ? "한글: 정답 문장 + 배열/어형 포인트."
    : isReferenceWriting
      ? "한글: 정답(본문 구) + 왜 그것이 가리키는 바/문맥 의미인지."
      : isGrammarFix
        ? "학생용 한글: 각 기호/번호 + 틀린 점 → 바른 형태 + 쉬운 이유. 영어 은어 금지."
        : option.type === "grammar"
          ? "학생용 한글 답지(정답 번호 + 틀린형→바른형 + 쉬운 이유). 영어 은어·코드 금지."
          : option.type === "underlined_inference" &&
              option.aingkaCode === "함축의미추론"
            ? "학생용 한글: 정답 번호 + 밑줄의 문맥 의미 + 왜 사전적 풀이(두 가지 기능을 한다 등)가 아닌지."
            : "1-2 Korean sentences.";

  // 유형·문항별 규칙 (예전 system 중간에 있던 가변 부분 — 문구 그대로, 순서만 뒤로)
  const itemRules = [
    `- instruction EXACTLY: ${JSON.stringify(forcedInstruction)}`,
    `- ${questionTextRule}`,
    `- ${passageModifiedRule}`,
    `- explanation: ${explanationRule}`,
    englishOnlyHint,
    allowSkip
      ? isReferenceWriting
        ? '- 지칭 서술: 명확한 선행사/문맥 동의 구가 있을 때만. 없으면 {"skip":true,"reason":"..."}.'
        : '- 함축의미: 문맥 의존 표현만. 정답은 사전 뜻이 아니라 지문 구체 paraphrase (do double duty ≠ "do two things"). 없으면 {"skip":true,"reason":"..."}. 본문은 (A)<u>…</u>.'
      : "",
    option.type === "sentence_insertion"
      ? "- Do NOT return choices for 문장삽입; slots ①~⑤ in passageModified are the options."
      : "",
    option.type === "irrelevant_sentence"
      ? "- Do NOT return choices for 무관한문장; mark ⓐⓑⓒⓓⓔ IN the passage. The irrelevant sentence must reuse similar passage words but shift topic/point (not bizarre)."
      : "",
    option.aingkaCode === "어휘추론"
      ? "- Do NOT return bottom choices for 어휘 고르기; ①~⑤ in the passage are enough. correctAnswer is the wrong number."
      : "",
    option.aingkaCode === "어법추론" || option.aingkaCode === "어법모두고르기"
      ? "- Do NOT return bottom choices for 어법 추론; ⓐ~ⓔ in the passage are enough. correctAnswer is the ONE wrong underline (1-5)."
      : "",
    option.aingkaCode === "어법개수" || option.aingkaCode === "어휘개수"
      ? '- Count choices MUST be exactly ["1개","2개","3개","4개","5개"] in order — never sparse options.'
      : "",
    option.type === "grammar"
      ? "- 어법: ‘이번 문항’ 문법을 따르고, 해설은 쉬운 한글만(voice/relative/CASE id 금지)."
      : "",
    /*
     * 선생님 지적(2026-09-20): 어법·어휘가 지문을 재진술한다. 기본은 원문 그대로 두고
     * 밑줄 자리만 바꾼다. 재진술은 선생님이 켰을 때만 한다.
     */
    (option.type === "grammar" || option.type === "vocabulary") && !opts.paraphraseGrammarVocab
      ? `- KEEP THE PASSAGE VERBATIM: copy the original passage word for word into passageModified. The ONLY allowed change is the wording inside the marked spots (ⓐ~/①~). Do not reword, shorten, merge, split or reorder any sentence.
- Pick the marked spots from structures the passage ALREADY has (수일치·관계사·준동사·병렬·태·시제·비교 등 원문에 있는 것). If a target grammar point does not exist in this passage, choose another point that does — never rewrite a sentence to plant one.`
      : "",
    (option.type === "grammar" || option.type === "vocabulary") && opts.paraphraseGrammarVocab
      ? "- 지문 재진술 켜짐: 밑줄 자리를 만들기 위해 문장을 바꿔 써도 된다(원문 뜻은 지킬 것)."
      : "",
    paraphraseSystemHint,
    craftSystemHint,
    difficultyRule(option, opts.targetLevel ?? targetLevelFromOverall(opts.overallDifficulty)),
    opts.levelBrief ? `\n[원래 시험지의 수준]\n${opts.levelBrief}` : "",
    typeRules(option, opts.grammarWritingMode ?? "paraphrase"),
    // 선생님이 범위를 정해 두었으면 이번 문항에 쓸 어법 하나를 여기서 정해 준다
    option.aingkaCode === "문법조건영작" && pickedWritingGrammar
      ? `\n[이번 문항에 쓸 어법] ${pickedWritingGrammar.label}(${pickedWritingGrammar.form})\n` +
        `  — ${pickedWritingGrammar.hint}\n` +
        `  이 어법으로 <b>반드시</b> 만든다. 다른 어법으로 바꾸지 않는다.\n` +
        `  지문에 이 어법이 없으면 중요한 문장 하나를 이 어법으로 <b>고쳐 써서</b> 만든다.`
      : "",
  ]
    .filter((line) => line.trim())
    .join("\n");

  // 슬롯 정보는 같은 유형 문항끼리도 달라지므로 맨 끝에 둔다
  const slotTail = opts.diversitySlot
    ? `\n\nITEM SLOT: ${JSON.stringify({
        diversitySlot: {
          index: opts.diversitySlot.index + 1,
          total: opts.diversitySlot.total,
          label: opts.diversitySlot.label,
        },
      })}${diversityHint ? `\n${diversityHint}` : ""}`
    : "";

  // 순서: 공통 규칙(system) → 지문 → 유형·문항별 데이터/규칙 → 슬롯 (앞부분일수록 여러 문항이 공유)
  const itemData = JSON.stringify({
    grade: opts.grade,
    passage,
    difficulty: option.difficulty,
    forcedInstruction,
    hint: englishBodyTypes.has(option.type) ? undefined : slimAnalysis,
    schema: {
      ...(option.type === "sentence_insertion"
        ? {
            questionText: "ENGLISH given sentence",
            passageModified: "ENGLISH passage with ① ② ③ ④ ⑤ slots",
            choices: [],
            correctAnswer: "integer 1-5",
          }
        : option.type === "irrelevant_sentence"
          ? {
              passageModified:
                "ENGLISH passage with ⓐ ⓑ ⓒ ⓓ ⓔ; one sentence similar in wording but off-point",
              choices: [],
              correctAnswer: "integer 1-5 (ⓐ=1 … ⓔ=5)",
            }
          : option.aingkaCode === "어휘추론"
            ? {
                passageModified:
                  "ENGLISH passage with ①<u>…</u> … ⑤<u>…</u>; exactly one wrong",
                choices: [],
                correctAnswer: "integer 1-5",
              }
            : option.aingkaCode === "어법개수" ||
                option.aingkaCode === "어휘개수"
              ? {
                  passageModified: "ENGLISH passage with underlined spots",
                  choices: [
                    { number: 1, text: "1개" },
                    { number: 2, text: "2개" },
                    { number: 3, text: "3개" },
                    { number: 4, text: "4개" },
                    { number: 5, text: "5개" },
                  ],
                  correctAnswer: "integer 1-5 (= count of wrong spots)",
                }
              : allowSkip
                ? {
                    passageModified: "ENGLISH passage with <u>target</u>",
                    choices: [
                      { number: 1, text: "ENGLISH meaning paraphrase" },
                    ],
                    correctAnswer: "integer 1-5",
                    skip: "boolean optional",
                    reason: "string optional",
                  }
                : {
                    choices: [{ number: 1, text: "string" }],
                    correctAnswer: "integer 1-5 (vary; not always 1)",
                    ...(needsModified ? { passageModified: "string" } : {}),
                    ...(needsQuestionText
                      ? {
                          questionText:
                            "(1) ...\\n(2) ...\\n(3) ...\\n(4) ...\\n(5) ...\\n(6) ...",
                          correctAnswer: "integer count of FALSE statements",
                          choices: [],
                        }
                      : {}),
                  }),
      explanation: "ko",
      hardWords: [{ word: "EN", meaning: "한글뜻" }],
    },
  });

  const raw = (await questionGeneratorChatJsonWithRetry({
    system: QUESTION_WRITER_SHARED_SYSTEM,
    user: `${itemData}\n\nITEM RULES:\n${itemRules}${slotTail}`,
    temperature:
      option.type === "grammar"
        ? 0.55
        : option.type === "vocabulary"
          ? 0.4
          : 0.25,
    maxTokens:
      option.type === "grammar" || option.type === "vocabulary" ? 2800 : 1600,
  })) as Record<string, unknown>;

  if (allowSkip && raw.skip === true) {
    throw new SkipQuestionError(
      String(raw.reason || "적합한 함축 표현이 없어 문항을 생략합니다.")
    );
  }

  const payload = normalizePayload(
    raw,
    option,
    passage,
    forcedInstruction
  );
  const shapeError = assertBasicQuestionShape(
    payload,
    option,
    opts.grammarWritingMode ?? "paraphrase"
  );
  if (shapeError) throw new Error(shapeError);
  // 어법 추론은 수능처럼 지문 속 ①~⑤로 (정답 번호와 같은 기호)
  if (option.type === "grammar" && (option.aingkaCode === "어법추론" || option.aingkaCode === "어법모두고르기")) {
    const toNum: Record<string, string> = { "ⓐ": "①", "ⓑ": "②", "ⓒ": "③", "ⓓ": "④", "ⓔ": "⑤" };
    const swap = (t?: string | null) => (t ? t.replace(/[ⓐⓑⓒⓓⓔ]/g, (m) => toNum[m] ?? m) : t);
    payload.passageModified = swap(payload.passageModified) ?? payload.passageModified;
    payload.explanation = swap(payload.explanation) ?? payload.explanation;
  }
  return payload;
}

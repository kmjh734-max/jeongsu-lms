import {
  grammarCatalogPromptBlock,
  pickGrammarFocus,
} from "@/lib/question-generator/grammar-catalog";
import { questionGeneratorChatJsonWithRetry } from "@/lib/question-generator/openai";
import { findAingkaOption } from "@/lib/question-generator/question-types";
import { cleanQuestionText } from "@/lib/question-generator/text-utils";
import type { QuestionTypeOption } from "@/lib/question-generator/types";
import type {
  GeneratedQuestionPayload,
  PassageAnalysis,
} from "@/lib/question-generator/types";

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
  return `PARAPHRASE (필수 · 학력평가형):
- Every choice/statement must paraphrase key content words (synonyms, different structure, reworded meaning).
- Ban copying distinctive multi-word chunks or long phrases from the passage.
- Correct items: same meaning via paraphrase; distractors: plausible but wrong via subtle meaning shifts.
- Prefer vocabulary that tests understanding of paraphrased wording (동의어·우회 표현 많이).
- ${langHint}`;
}

function typeRules(option: QuestionTypeOption): string {
  const code = option.aingkaCode || "";
  const en = option.choiceLanguage === "english";
  const paraphrase = paraphraseChoiceRules(option.choiceLanguage);

  switch (option.type) {
    case "content_false":
      return `${en ? "5 ENGLISH" : "5 Korean"} factual choices about the WHOLE passage.
Ask which does NOT match. Exactly ONE false; the other four must be true.
Style like Korean HS mock exams (효자/학력평가 내용불일치).
${paraphrase}
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
${paraphrase}
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
${paraphrase}
Difficulty: ${
        option.difficulty === "low"
          ? "LOW (하) — clearer correct answer, weaker distractors"
          : option.difficulty === "high"
            ? "HIGH (상) — competitive distractors, nuanced"
            : "standard"
      }.`;
    case "title":
      return `${en ? "5 ENGLISH Title Case titles" : "5 Korean titles"}. Exactly one correct.
${paraphrase}
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
- 5 FULL Korean sentence/phrase choices for the main point (요지).
- Do NOT invent a summary sentence with blanks (A)/(B).
- Do NOT use …… / ... pair choices (e.g. "성공 …… 노력").
- questionText must be empty.
${paraphrase}
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
LANGUAGE: questionText + passageModified MUST be ENGLISH only.`;
      }
      return `문장삽입 LOW (하) — 효자 기출동형 (PDF: 위치):
- Pick a flow-critical sentence from the passage as the sentence to insert.
- questionText = that sentence in ORIGINAL ENGLISH wording (do not paraphrase).
- passageModified = remaining ENGLISH passage with five insertion slots marked ① ② ③ ④ ⑤ in the text.
- choices: omit or empty array — slots IN the passage are the options; do NOT invent separate choice texts.
- correctAnswer 1-5. Exactly one best slot.
LANGUAGE: questionText + passageModified MUST be ENGLISH only.`;
    case "irrelevant_sentence": {
      const irrelevantQuality = `IRRELEVANT SENTENCE QUALITY (효자 기출동형 — 필수):
- Do NOT invent a bizarre, random, or absurd sentence that has nothing to do with the passage vocabulary.
- The irrelevant sentence MUST reuse similar words / related content from the passage (same domain, overlapping vocabulary) so it LOOKS related at a glance.
- But it must break cohesion: different topic focus OR a different point that does not connect to the surrounding sentences (e.g. science-funding passage → a sentence about exercise/mental health that shares "people/discuss" style but wrong point; commitment/social life → animals/instinct that shares "social" but wrong point).
- It should feel like a plausible mock-exam distractor: thematically adjacent wording, logically unconnected.`;
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
      if (code === "어법모두고르기") {
        const wrongN = Math.random() < 0.5 ? 2 : 3;
        const { focusBlock } = pickGrammarFocus(wrongN);
        return `어법 모두 고르기 — 유닛×CASE 다양 출제:
${focusBlock}

FORMAT:
- passageModified = FULL ENGLISH with exactly five spots ⓐⓑⓒⓓⓔ as ⓐ<u>target</u>.
- Exactly ${wrongN} spots WRONG — each MUST match one FOCUS CASE above (different units).
- Remaining spots CORRECT but look like distractor unit patterns.
- choices: 5 Korean combinations; exactly ONE lists ALL and ONLY wrong letters.
- correctAnswer 1-5. questionText empty.
- explanation: Korean — each wrong letter → [unit/case id] + trap tag + reason.
LANGUAGE: passage ENGLISH only.

${catalog}`;
      }
      if (code === "어법개수") {
        const wrongN = 1 + Math.floor(Math.random() * 5);
        const { focusBlock } = pickGrammarFocus(wrongN);
        return `어법 개수 — 유닛×CASE 다양 출제:
${focusBlock}

FORMAT:
- passageModified = FULL ENGLISH with exactly six spots ⓐ~ⓕ as ⓐ<u>target</u>.
- Exactly ${wrongN} spots WRONG — each MUST match one FOCUS CASE (different units). Rest correct.
- choices MUST be EXACTLY: 1:"1개" 2:"2개" 3:"3개" 4:"4개" 5:"5개"
- correctAnswer = ${wrongN}.
- questionText empty. explanation: count + letters + [unit/case id].
LANGUAGE: passage ENGLISH only.

${catalog}`;
      }
      if (code === "어법연결") {
        return `In passageModified mark ⓐ, ⓑ, ⓒ with two alternatives in parentheses. 5 ENGLISH connection choices. Exactly one correct.`;
      }
      if (code === "어법고쳐쓰기") {
        return `No MCQ. Student finds one grammar error and rewrites. Model rewrite in correctAnswer.`;
      }
      {
        const { focusBlock } = pickGrammarFocus(1);
        return `Mark 5 underlined spots ⓐ~ⓔ. Exactly ONE wrong using FOCUS CASE.
${focusBlock}

${catalog}`;
      }
    }
    case "vocabulary":
      if (code === "어휘개수") {
        return `어휘 개수 — 고1 학력평가·내신 고퀄리티:
- passageModified = FULL ENGLISH passage with exactly six vocabulary spots ① ② ③ ④ ⑤ ⑥ as ①<u>word/phrase</u>.
- Put 1~5 contextually WRONG items; rest correct and natural.
- Wrong-item quality (필수): change meaning subtly — antonym, near-miss synonym, wrong collocation, or word that fits grammar but not sense. Must still look like a real vocabulary trap (not random/gibberish).
- Correct underlines should be important content words that could tempt students.
- choices MUST be EXACTLY and ONLY these five texts in order (never omit, never use sparse sets like only 2개 and 5개):
  1:"1개"  2:"2개"  3:"3개"  4:"4개"  5:"5개"
- correctAnswer = N = count of wrong spots (3 wrong → correctAnswer 3).
- questionText empty. explanation: Korean.
LANGUAGE: passage ENGLISH only.`;
      }
      // 어휘추론 (어색한 것 고르기) — PDF형 ①~⑤, 하단 보기 없음
      return `어휘 어색한 것 고르기 — 고1 학력평가·내신 고퀄리티:
- passageModified = FULL ENGLISH passage with exactly five vocabulary spots ① ② ③ ④ ⑤ as ①<u>word/phrase</u>.
- Exactly ONE is contextually WRONG; the other four are clearly correct in context.
- Wrong-item quality (필수): antonym / near-miss synonym / wrong collocation that looks related to the topic but breaks meaning (classic 문맥상 부적절). Not a grammar error; not a random unrelated word.
- choices: omit or empty array — numbers IN the passage are the options; do NOT print a separate choice list.
- correctAnswer 1-5 = the wrong underlined number. questionText empty.
- explanation (Korean): which number + why the word fails in context + what would fit.
LANGUAGE: passage ENGLISH only.`;
    case "underlined_inference":
      if (code === "목적추론") {
        return `5 ENGLISH purpose choices (To + verb). Exactly one correct. passageModified optional. LANGUAGE: choices ENGLISH only.`;
      }
      if (code === "심경추론") {
        return `5 English emotion-change choices like "worried → relieved". Exactly one correct. LANGUAGE: choices ENGLISH only.`;
      }
      if (code === "함축의미추론") {
        return `함축의미추론 (난이도 없음):
- passageModified = the ENGLISH passage with EXACTLY ONE target expression wrapped in HTML underline tags: <u>target phrase</u>
- The target must be a flow-critical word/phrase/clause with implied/contextual meaning.
- Do NOT use markdown, asterisks, or Korean in the passage. Only <u>...</u> for the underline.
- questionText must be empty.
- 5 ENGLISH meaning/paraphrase choices (short phrases explaining the underlined part). Exactly one correct.
- LANGUAGE: ALL choices MUST be ENGLISH only (no Korean in choices).
- If no suitable implied-meaning expression exists, return {"skip":true,"reason":"적합한 함축 표현 없음"}.`;
      }
      return `Underline a key expression with <u>...</u> in passageModified. 5 ENGLISH meaning choices.`;
    case "writing":
      return `Korean prompt + <조건> + given words. Model answer in correctAnswer.`;
    case "summary_short":
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

  // 일치개수·문장삽입·무관·어휘고르기: 하단 선택지 없음 (본문 표지가 보기)
  if (
    option.type === "content_count" ||
    option.type === "sentence_insertion" ||
    option.type === "irrelevant_sentence" ||
    (option.type === "vocabulary" && option.aingkaCode === "어휘추론")
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

  // 함축·어법·어휘: markdown 밑줄을 <u>로 정규화
  if (
    (option.type === "underlined_inference" &&
      option.aingkaCode === "함축의미추론") ||
    (option.type === "grammar" &&
      (option.aingkaCode === "어법모두고르기" ||
        option.aingkaCode === "어법개수")) ||
    (option.type === "vocabulary" &&
      (option.aingkaCode === "어휘추론" || option.aingkaCode === "어휘개수"))
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

  return {
    type: option.type,
    category: option.category,
    difficulty: option.difficulty,
    choiceLanguage: option.choiceLanguage,
    passageOriginal: passage,
    passageModified,
    instruction: forcedInstruction,
    questionText: cleanQuestionText(String(raw.questionText ?? "")),
    choices,
    correctAnswer,
    acceptableAnswers: Array.isArray(raw.acceptableAnswers)
      ? raw.acceptableAnswers.map((x) => String(x))
      : undefined,
    explanation,
    evidence: [],
    scoringGuide:
      raw.scoringGuide && typeof raw.scoringGuide === "object"
        ? (raw.scoringGuide as GeneratedQuestionPayload["scoringGuide"])
        : undefined,
  };
}

export function assertBasicQuestionShape(
  q: GeneratedQuestionPayload,
  option: QuestionTypeOption
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
    if (!q.choices || q.choices.length < 5) {
      return "객관식 선택지가 5개 미만입니다.";
    }
    if ((q.choices ?? []).some((c) => hasHangul(c.text))) {
      return "함축의미추론 선택지는 영어여야 합니다.";
    }
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
    if (!q.choices || q.choices.length < 5) {
      return "객관식 선택지가 5개 미만입니다.";
    }
    const mod = q.passageModified || "";
    if (option.aingkaCode === "어법개수") {
      if (!/[ⓐⓑⓒⓓⓔⓕ]/.test(mod) || !/<u>[\s\S]*?<\/u>/i.test(mod)) {
        return "어법 개수 문항은 ⓐ~ⓕ 밑줄 표지가 필요합니다.";
      }
    } else if (option.aingkaCode === "어법모두고르기") {
      if (!/[ⓐⓑⓒⓓⓔ]/.test(mod) || !/<u>[\s\S]*?<\/u>/i.test(mod)) {
        return "어법 모두 고르기 문항은 ⓐ~ⓔ 밑줄 표지가 필요합니다.";
      }
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

export async function generateOneQuestion(opts: {
  passage: string;
  analysis: PassageAnalysis;
  option: QuestionTypeOption;
  grade: string;
  overallDifficulty: string;
  sourceDetail?: string;
}): Promise<GeneratedQuestionPayload> {
  const { option, passage, analysis } = opts;
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

  const englishBodyTypes = new Set([
    "order",
    "sentence_blank",
    "sentence_insertion",
    "irrelevant_sentence",
    "grammar",
    "vocabulary",
  ]);
  const englishOnlyHint = englishBodyTypes.has(option.type)
    ? option.type === "grammar" || option.type === "vocabulary"
      ? "- CRITICAL LANGUAGE: passageModified MUST be ENGLISH only. Choice texts may be Korean (조합/개수) or empty numbers. Never put Hangul in the passage."
      : "- CRITICAL LANGUAGE: passageModified, questionText (if any), and choices MUST be ENGLISH only. Never put Korean Hangul in passage or choices. Only instruction/explanation may be Korean."
    : "";

  const needsModified = [
    "grammar",
    "vocabulary",
    "sentence_blank",
    "order",
    "sentence_insertion",
    "irrelevant_sentence",
    "underlined_inference",
  ].includes(option.type);

  const needsQuestionText =
    option.type === "content_count" || option.type === "sentence_insertion";
  const paraphraseTypes = new Set([
    "title",
    "topic",
    "summary_mcq",
    "content_true",
    "content_false",
    "content_count",
  ]);
  const paraphraseSystemHint = paraphraseTypes.has(option.type)
    ? "- Choices/<보기> MUST paraphrase passage wording (synonyms, rewording). Do NOT copy distinctive phrases from the passage."
    : "";

  const allowSkip =
    option.type === "underlined_inference" &&
    (option.aingkaCode === "함축의미추론" ||
      meta?.aingkaCode === "함축의미추론");

  const raw = (await questionGeneratorChatJsonWithRetry({
    system: `Korean HS English exam writer. ONE question JSON only. Fast & concise.
- instruction EXACTLY: ${JSON.stringify(forcedInstruction)}
- No meta tags. ${
      needsQuestionText
        ? option.type === "sentence_insertion"
          ? "Fill questionText with the ENGLISH given sentence to insert."
          : "Fill questionText with (1)(2)… statements."
        : 'questionText usually "".'
    }
- NEVER create 요약문완성 (Korean summary with (A)/(B) blanks and …… pair choices). That type is removed.
- ${needsModified ? "Use passageModified when needed." : "Do NOT change passage; omit passageModified."}
- explanation: 1-2 Korean sentences.
- For MCQ: correctAnswer is 1-5. Prefer varied positions (not always 1).
${englishOnlyHint}
${
  allowSkip
    ? '- If no suitable implied-meaning target exists, return {"skip":true,"reason":"..."} only. Otherwise wrap the target in <u>...</u> inside passageModified.'
    : ""
}
${
  option.type === "sentence_insertion"
    ? "- Do NOT return choices for 문장삽입; slots ①~⑤ in passageModified are the options."
    : ""
}
${
  option.type === "irrelevant_sentence"
    ? "- Do NOT return choices for 무관한문장; mark ⓐⓑⓒⓓⓔ IN the passage. The irrelevant sentence must reuse similar passage words but shift topic/point (not bizarre)."
    : ""
}
${
  option.aingkaCode === "어휘추론"
    ? "- Do NOT return bottom choices for 어휘 고르기; ①~⑤ in the passage are enough. correctAnswer is the wrong number."
    : ""
}
${
  option.aingkaCode === "어법개수" || option.aingkaCode === "어휘개수"
    ? '- Count choices MUST be exactly ["1개","2개","3개","4개","5개"] in order — never sparse options.'
    : ""
}
${
  option.type === "grammar"
    ? "- Grammar: follow THIS QUESTION FOCUS unit×CASE list. Ban adjacent trivial S-V; at most one sv trap; wrong spots must use different morphological pair families."
    : ""
}
${paraphraseSystemHint}
${typeRules(option)}`,
    user: JSON.stringify({
      grade: opts.grade,
      difficulty: option.difficulty,
      forcedInstruction,
      passage,
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
      },
    }),
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

  const payload = normalizePayload(raw, option, passage, forcedInstruction);
  const shapeError = assertBasicQuestionShape(payload, option);
  if (shapeError) throw new Error(shapeError);
  return payload;
}

/**
 * 검수 규칙이 살아 있는지 스스로 검사한다. API 를 쓰지 않는다.
 *
 * 까닭(2026-10-01): 「보기 다섯 개가 같은 말로 시작하면 버린다」를 넣었는데, 보기를
 * 문자열로 읽는 바람에 한 번도 걸리지 않았다. 규칙이 죽어 있으면 아무도 모른다 —
 * 문항은 멀쩡해 보이고 검수는 늘 통과하니 오히려 더 나쁘다.
 *
 * 그래서 규칙마다 「걸려야 하는 보기」와 「걸리면 안 되는 보기」를 하나씩 두고,
 * 둘 다 뜻대로 움직이는지 확인한다.
 *
 *   npx tsx scripts/check-rules.mts
 */
import {
  shouldRegenerate,
  validateGeneratedQuestion,
} from "../src/lib/question-generator/validate-question";
import { falseGrammarError } from "../src/lib/question-generator/grammar-false-error";
import { agreementBreakAfterFix } from "../src/lib/question-generator/agreement-check";
import { plannedWrongCount, plannedAnswerNumber } from "../src/lib/question-generator/item-variety";
import { QUESTION_TYPE_GROUPS } from "../src/lib/question-generator/question-types";
import type { GeneratedQuestionPayload, QuestionTypeOption } from "../src/lib/question-generator/types";

const ALL = QUESTION_TYPE_GROUPS.flatMap((g) => g.options);
const byCode = (code: string): QuestionTypeOption => {
  const o = ALL.find((x) => x.key.split(":").pop() === code);
  if (!o) throw new Error(`유형을 못 찾음: ${code}`);
  return o;
};

const PASSAGE =
  "Humans possess a remarkable ability to form visual images. This capacity allows us to rehearse forthcoming actions in an internal model without facing real risks. There are strong hints that imagining and viewing a scene activate similar brain regions. However, internally generated representations are never as authentic as real experiences.";

function make(part: Partial<GeneratedQuestionPayload>, option: QuestionTypeOption): GeneratedQuestionPayload {
  return {
    type: option.type,
    instruction: "발문",
    questionText: "",
    passageOriginal: PASSAGE,
    passageModified: PASSAGE,
    explanation: "해설",
    correctAnswer: 1,
    ...part,
  } as GeneratedQuestionPayload;
}

const choices = (texts: string[]) => texts.map((text, i) => ({ number: i + 1, text }));

type Case = { name: string; shouldFire: boolean; run: () => boolean };
const cases: Case[] = [];

/** 검수기를 돌려 그 경고가 나오는지 */
const fires = (part: Partial<GeneratedQuestionPayload>, code: string, needle: string) => {
  const option = byCode(code);
  const v = validateGeneratedQuestion({ passage: PASSAGE, option, question: make(part, option) });
  return v.warnings.some((w) => w.includes(needle));
};

// ── 1. 보기가 같은 말로 시작
cases.push({
  name: "보기 넷 이상이 같은 말로 시작하면 걸린다",
  shouldFire: true,
  run: () =>
    fires(
      {
        choices: choices([
          "The limits of ultrasound",
          "The prenatal emergence of a preference",
          "The influence of writing instruction",
          "The gradual shift from movement",
          "Reasons right-handers outnumber others",
        ]),
        correctAnswer: 2,
      },
      "주제추론",
      "로 시작합니다"
    ),
});
cases.push({
  name: "보기가 고루 다르면 안 걸린다",
  shouldFire: false,
  run: () =>
    fires(
      {
        choices: choices([
          "Why ultrasound cannot capture motor activity",
          "How a preference appears before birth",
          "Writing instruction as the origin of coordination",
          "From early movement to later ability",
          "Reasons right-handers outnumber others",
        ]),
        correctAnswer: 2,
      },
      "주제추론",
      "로 시작합니다"
    ),
});

// ── 2. 정답이 본문에 없는 기호
cases.push({
  name: "본문에 없는 기호를 답하면 걸린다",
  shouldFire: true,
  run: () =>
    fires(
      {
        passageModified: "Humans ⓐ<u>possess</u> a remarkable ⓑ<u>ability</u> to form images.",
        correctAnswer: "ⓐ: have / ⓕ: abilities",
        explanation: "해설",
      },
      "어법오류수정2",
      "본문에 없는 기호"
    ),
});
cases.push({
  name: "본문에 있는 기호만 답하면 안 걸린다",
  shouldFire: false,
  run: () =>
    fires(
      {
        passageModified: "Humans ⓐ<u>possess</u> a remarkable ⓑ<u>ability</u> to form images.",
        correctAnswer: "ⓐ: have / ⓑ: abilities",
        explanation: "해설",
      },
      "어법오류수정2",
      "본문에 없는 기호"
    ),
});

// ── 3. 개수와 해설이 어긋남
const countExpl = (lines: string[]) => lines.join("\n");
cases.push({
  name: "개수 유형에서 정답 숫자와 해설이 어긋나면 걸린다",
  shouldFire: true,
  run: () =>
    fires(
      {
        passageModified: "A ⓐ<u>x</u> B ⓑ<u>y</u> C ⓒ<u>z</u>",
        correctAnswer: 3,
        explanation: countExpl([
          "정답은 ③이다.",
          "· ⓐ x → a : 까닭. 「형용사·부사」",
          "· ⓑ y → b : 까닭. 「비교」",
          "· ⓒ z는 올바른 표현이다. 「분사」",
        ]),
      },
      "어법개수",
      "틀렸다고 합니다"
    ),
});
cases.push({
  name: "개수와 해설이 맞으면 안 걸린다",
  shouldFire: false,
  run: () =>
    fires(
      {
        passageModified: "A ⓐ<u>x</u> B ⓑ<u>y</u> C ⓒ<u>z</u>",
        correctAnswer: 2,
        explanation: countExpl([
          "정답은 ②이다.",
          "· ⓐ x → a : 까닭. 「형용사·부사」",
          "· ⓑ y → b : 까닭. 「비교」",
          "· ⓒ z는 올바른 표현이다. 「분사」",
        ]),
      },
      "어법개수",
      "틀렸다고 합니다"
    ),
});

// ── 4. 맞는 것을 틀렸다고 함
cases.push({
  name: "allow 뒤의 to부정사를 틀렸다고 하면 걸린다",
  shouldFire: true,
  run: () =>
    Boolean(
      falseGrammarError("This capacity allows us ⓑ<u>to rehearse</u> forthcoming actions.", [
        { mark: "ⓑ", to: "rehearse" },
      ])
    ),
});
cases.push({
  name: "make sure to check 는 안 걸린다",
  shouldFire: false,
  run: () =>
    Boolean(
      falseGrammarError("Since the date changes, make sure ⓕ<u>to check</u> before you go.", [
        { mark: "ⓕ", to: "check" },
      ])
    ),
});

// ── 5. 고쳐도 수일치가 깨짐
cases.push({
  name: "정답대로 고쳐도 주어·동사가 안 맞으면 걸린다",
  shouldFire: true,
  run: () =>
    Boolean(
      agreementBreakAfterFix("The market we ⓓ<u>suggest</u> that it become accessible.", [
        { mark: "ⓓ", to: "suggests" },
      ])
    ),
});
cases.push({
  name: "멀쩡한 문장은 안 걸린다",
  shouldFire: false,
  run: () =>
    Boolean(
      agreementBreakAfterFix("The market we ⓓ<u>suggest</u> is accessible.", [
        { mark: "ⓓ", to: "suggest" },
      ])
    ),
});

// ── 6. 개수·정답 번호가 문항마다 달라짐
cases.push({
  name: "어법오류수정2의 오류 개수가 문항마다 달라진다",
  shouldFire: true,
  run: () => new Set([0, 1, 2, 3, 4].map((t) => plannedWrongCount("어법오류수정2", t))).size >= 3,
});
cases.push({
  name: "어휘추론 정답 번호가 1~5를 모두 돈다",
  shouldFire: true,
  run: () => new Set([0, 1, 2, 3, 4].map((t) => plannedAnswerNumber("어휘추론", t))).size === 5,
});

// ── 7. 걸리면 실제로 다시 만드는가
cases.push({
  name: "걸린 문항은 다시 만들기로 넘어간다",
  shouldFire: true,
  run: () => {
    const option = byCode("주제추론");
    const v = validateGeneratedQuestion({
      passage: PASSAGE,
      option,
      question: make(
        {
          choices: choices([
            "The limits of ultrasound",
            "The prenatal emergence of a preference",
            "The influence of writing instruction",
            "The gradual shift from movement",
            "Reasons right-handers outnumber others",
          ]),
          correctAnswer: 2,
        },
        option
      ),
    });
    return shouldRegenerate(v);
  },
});

let bad = 0;
for (const c of cases) {
  let got = false;
  let err = "";
  try {
    got = c.run();
  } catch (e) {
    err = e instanceof Error ? e.message : String(e);
  }
  const ok = !err && got === c.shouldFire;
  if (!ok) bad += 1;
  const mark = ok ? "  ok  " : " 안 됨 ";
  console.log(`${mark} ${c.name}${err ? ` — ${err}` : ok ? "" : c.shouldFire ? " (걸려야 하는데 안 걸림)" : " (걸리면 안 되는데 걸림)"}`);
}
console.log(`\n${cases.length}가지 가운데 ${cases.length - bad}가지 통과${bad ? ` · ${bad}가지 안 됨` : ""}`);
if (bad > 0) process.exit(1);

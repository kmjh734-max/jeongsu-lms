/**
 * 정답지 라벨이 문항이 실제로 묻는 것과 맞는지 본다.
 *
 * 라벨은 문항의 코드에서 나오는데, 코드는 모델이나 검출기가 붙인다. 쌍의 모양과
 * 코드가 어긋나는 일이 있었다(2026-09-11 선생님 검토):
 *   [don't / not] -> [that 명사절], small [happy / happily] moments -> [분사 명사 수식],
 *   the [wise / wisely] grows -> [공통 요소 생략], the ending that [concludes / conclude]
 *   -> [주격 관계대명사], Most of the water ... [is / are] -> [전치사구 수식 수일치].
 *
 * 쌍의 모양으로 축(수일치 / 형용사·부사 / 절 표지)을 가려, 코드가 그 축에 속하지 않으면
 * 확실히 고칠 수 있는 경우만 고치고(관계절 수일치, 부분 표현 수일치) 나머지는 라벨을
 * 싣지 않는다. 틀린 라벨을 싣느니 정답만 싣는 편이 낫다.
 */
import { ontologyPoint } from "@/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import { stemVerb } from "@/lib/lesson-materials/grammar-choice-v2/local-validators";
import type { GrammarPointCode } from "@/lib/lesson-materials/grammar-choice-v2/types";

export type LabelDecision = { pointCode: GrammarPointCode; showLabel: boolean };

type Axis = "NUMBER" | "TENSE" | "ADJ_ADV" | "CLAUSE_MARKER" | null;

/** 같은 조동사·be동사의 시제만 다른 쌍. there was an athlete who [had / has] won */
const TENSE_PAIRS = new Set(["had|has", "had|have", "was|is", "were|are", "did|does", "did|do"]);

const CLAUSE_MARKERS = new Set([
  "that", "what", "which", "who", "whom", "whose", "where", "when", "why", "how",
  "whether", "if", "whatever", "whoever", "whomever", "whichever", "wherever", "whenever",
]);

const NUMBER_PAIRS = new Set(["is|are", "was|were", "has|have", "does|do", "doesn't|don't", "isn't|aren't", "wasn't|weren't"]);

function norm(text: string): string {
  return text.trim().toLowerCase().replace(/[’]/g, "'");
}

function axisOf(correct: string, wrong: string): Axis {
  const a = norm(correct);
  const b = norm(wrong);
  if (!a || !b || a.includes(" ") || b.includes(" ")) return null;
  if (NUMBER_PAIRS.has(`${a}|${b}`) || NUMBER_PAIRS.has(`${b}|${a}`)) return "NUMBER";
  if (TENSE_PAIRS.has(`${a}|${b}`) || TENSE_PAIRS.has(`${b}|${a}`)) return "TENSE";
  // conclude / concludes: 같은 동사의 3인칭 단수 대비
  if (stemVerb(a) === stemVerb(b) && (a === `${b}s` || b === `${a}s` || a === `${b}es` || b === `${a}es`)) {
    return "NUMBER";
  }
  const [short, long] = [a, b].sort((x, y) => x.length - y.length);
  if (long === `${short}ly` || long === `${short.replace(/y$/, "i")}ly` || long === `${short.replace(/le$/, "")}ly`) {
    return "ADJ_ADV";
  }
  if (CLAUSE_MARKERS.has(a) && CLAUSE_MARKERS.has(b)) return "CLAUSE_MARKER";
  return null;
}

function fitsAxis(code: string, axis: Exclude<Axis, null>): boolean {
  if (axis === "TENSE") {
    return /^(?:TENSE_|CONDITIONAL_|WISH_|AS_IF_|MODAL_|VOICE_|IF_ONLY|IT_IS_TIME|WOULD_RATHER|MANDATIVE_|INFINITIVE_PERFECT|GERUND_PERFECT|PARTICIPIAL_CLAUSE_PERFECT)/.test(code);
  }
  if (axis === "NUMBER") {
    return (
      code.startsWith("AGREEMENT_") ||
      code === "RELATIVE_AGREEMENT" ||
      code === "THERE_BE_STRUCTURE" ||
      code === "PSEUDO_CLEFT_ALL" ||
      code === "APPOSITION" ||
      code === "INSERTION" ||
      code === "SUBSTITUTE_DO" ||
      code === "ELLIPSIS_SUBSTITUTION" ||
      code === "MANDATIVE_SUBJUNCTIVE" ||
      code === "MANDATIVE_SHOULD" ||
      code === "EMPHATIC_DO"
    );
  }
  if (axis === "ADJ_ADV") {
    const transform = ontologyPoint(code)?.allowedTransforms?.[0];
    return (
      transform === "ADJ_ADV" ||
      code.startsWith("ADJECTIVE_") ||
      code.startsWith("ADVERB_") ||
      code.startsWith("PARALLEL_") ||
      code === "LINKING_VERB_COMPLEMENT" ||
      code === "SUBJECT_COMPLEMENT" ||
      code === "SENTENCE_SVC" ||
      code === "SENTENCE_SVOC" ||
      code === "OBJECT_COMPLEMENT_NOUN_ADJ" ||
      code === "AS_AS" ||
      code === "SO_SUCH" ||
      code === "TOO_ENOUGH" ||
      code === "COMPARISON_PARALLEL"
    );
  }
  return (
    code.startsWith("NOUN_CLAUSE_") ||
    code.startsWith("RELATIVE_") ||
    code.startsWith("ADVERB_CLAUSE_") ||
    code.startsWith("CORRELATIVE_") ||
    code.startsWith("CONJUNCTION_") ||
    code.startsWith("DUMMY_IT_") ||
    code === "APPOSITIVE_THAT" ||
    code === "REPEATED_THAT" ||
    code === "PARALLEL_REPEATED_THAT" ||
    code === "PARALLEL_CLAUSES" ||
    code === "CLEFT_IT_THAT" ||
    code === "INDIRECT_QUESTION_ORDER" ||
    code === "AGREEMENT_CLAUSE_SUBJECT" ||
    code === "PSEUDO_CLEFT_ALL"
  );
}

/** 주어가 부분 표현(most of, some of, half of, 30 percent of ...)인지. */
const PARTITIVE_SUBJECT =
  /\b(?:most|some|all|half|part|none|any|the rest|the majority|a lot|lots|plenty|\d+\s*(?:percent|%)|one[- ]third|two[- ]thirds|a third|a quarter)\s+of\b[^.,;!?]*$/i;

export function checkLabelContract(input: {
  pointCode: GrammarPointCode;
  correct: string;
  wrong: string;
  sentence: string;
  /** 문장 안에서 정답이 시작하는 위치 */
  at: number;
}): LabelDecision {
  const axis = axisOf(input.correct, input.wrong);
  const before = input.sentence.slice(0, Math.max(0, input.at));

  if (axis === "NUMBER") {
    // 부분 표현 주어면 무엇으로 붙어 왔든 부분 표현 수일치다.
    if (input.pointCode.startsWith("AGREEMENT_") && PARTITIVE_SUBJECT.test(before)) {
      return { pointCode: "AGREEMENT_PARTITIVE", showLabel: true };
    }
    if (fitsAxis(input.pointCode, axis)) return { pointCode: input.pointCode, showLabel: true };
    // 관계대명사 바로 뒤의 동사 수는 관계절 수일치다.
    if (/\b(?:who|which|that)\s*$/i.test(before)) return { pointCode: "RELATIVE_AGREEMENT", showLabel: true };
    return { pointCode: input.pointCode, showLabel: false };
  }
  if (axis === "TENSE" && !fitsAxis(input.pointCode, axis)) {
    // 과거 서술 속 had는 과거완료다. 나머지 시제 쌍은 코드를 확정할 수 없어 라벨을 뺀다.
    if (norm(input.correct) === "had") return { pointCode: "TENSE_PAST_PERFECT", showLabel: true };
    return { pointCode: input.pointCode, showLabel: false };
  }
  if (axis && !fitsAxis(input.pointCode, axis)) {
    return { pointCode: input.pointCode, showLabel: false };
  }
  return { pointCode: input.pointCode, showLabel: true };
}

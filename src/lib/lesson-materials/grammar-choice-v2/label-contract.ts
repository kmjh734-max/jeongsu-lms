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

/**
 * 한정사(+정도 부사) 바로 뒤: 형용사가 뒤의 명사를 꾸미는 자리다.
 * her·this·that·these·those는 목적어 대명사일 수 있어(made her [happy]) 넣지 않는다.
 */
const ATTRIBUTIVE_SLOT =
  /\b(?:a|an|the|my|your|his|its|our|their|every|each|some|any|no)\s+(?:(?:very|so|quite|rather|really|more|most|less|least|highly|extremely)\s+)?$/i;

const COMPLEMENT_CODES = new Set([
  "OBJECT_COMPLEMENT_NOUN_ADJ", "ADJECTIVE_SUBJECT_COMPLEMENT", "ADJECTIVE_OBJECT_COMPLEMENT",
  "SUBJECT_COMPLEMENT", "LINKING_VERB_COMPLEMENT", "SENTENCE_SVC", "SENTENCE_SVOC",
]);

const POSSESSIVE_PAIRS = new Set(["our|ours", "their|theirs", "your|yours", "her|hers", "my|mine"]);

/** As the Bard said, As James Oppenheim said: 이때 as는 "~처럼"이지 시간·이유 접속사가 아니다. */
const AS_SAYS = /^\s+[^,.;:!?]{1,40}?\b(?:once\s+)?(?:said|says|put it|puts it|noted|notes|wrote|writes|observed|remarked|suggested|mentioned|argued|explained|pointed out)\b/i;

const TIME_CONDITION_MARKER =
  /\b(?:when|whenever|if|unless|once|until|till|before|after|as soon as|by the time|in case|as long as|provided|the moment)\b/i;

/**
 * 쌍의 모양이 아니라 네모 앞뒤가 코드와 어긋나는 경우(2026-09-11 배포 전 점검).
 * 확실히 고칠 수 있으면 고친 코드를, 아니면 라벨을 싣지 않는다. 걸리지 않으면 null.
 */
function contextLabel(code: string, correct: string, wrong: string, before: string, after: string, sentence: string): LabelDecision | null {
  const c = norm(correct);
  const w = norm(wrong);
  const pair = [c, w].sort().join("|");
  // Music can bring us into a very [comfortable / comfortably] rhythm -> 목적격 보어가 아니라 명사 수식
  if (COMPLEMENT_CODES.has(code) && axisOf(correct, wrong) === "ADJ_ADV" && ATTRIBUTIVE_SLOT.test(before)) {
    return { pointCode: "ADJECTIVE_NOUN_MODIFIER", showLabel: true };
  }
  // As [our / ours] will attempts to digest ... -> 동격이 아니라 소유격
  // (our / ours는 -s 한 글자 차이라 아래 수일치 축으로 잘못 잡혀 라벨이 숨겨졌다.)
  if (POSSESSIVE_PAIRS.has(pair)) {
    return { pointCode: code.startsWith("PRONOUN_") ? (code as GrammarPointCode) : "POSSESSIVE", showLabel: true };
  }
  // [As / During] the Bard said -> 시간 부사절이 아님
  if (c === "as" && (code.startsWith("ADVERB_CLAUSE_") || code.startsWith("CONJUNCTION_")) && AS_SAYS.test(after)) {
    return { pointCode: code as GrammarPointCode, showLabel: false };
  }
  // set forth from the nest to [find / will find] -> 시간·조건절이 없다
  if (code === "TENSE_TIME_CONDITION_CLAUSE") {
    const clause = before.split(/[,;:—–]/).pop() ?? "";
    if (!TIME_CONDITION_MARKER.test(`${clause} ${correct}`)) return { pointCode: code as GrammarPointCode, showLabel: false };
  }
  // it's not [likely / like]: like와 likely는 형용사·부사 쌍이 아니다.
  if (pair === "like|likely") return { pointCode: code as GrammarPointCode, showLabel: false };
  // tricking everyone into [thinking / thought] -> 분사가 아니라 전치사 뒤 동명사
  if (
    code.startsWith("PARTICIPLE_") &&
    /^[a-z]+ing$/.test(c) &&
    // after·before + -ing는 접속사 분사구문으로 가르치기도 해서 넣지 않는다.
    /\b(?:into|of|by|for|from|without|about|in|on|at|besides|despite)\s+$/i.test(before)
  ) {
    return { pointCode: "GERUND_PREPOSITION_OBJECT", showLabel: true };
  }
  // cut out for [such a position / a such position] -> 명사 수식 형용사가 아니라 such의 어순
  if (/\bsuch an?\b/.test(c) && /\ban? such\b/.test(w) && code !== "SO_SUCH") {
    return { pointCode: "SO_SUCH", showLabel: true };
  }
  // The result [can be / can] a misunderstood text -> 뒤가 명사구라 수동태가 아니다
  // (정답이 be로 끝날 때만. [cannot cloy / cannot be cloyed] the hungry edge는 목적어가 있어 능동태가 맞다.)
  if (code.startsWith("VOICE_") && /\bbe$/.test(c) && /^\s+(?:a|an|the|this|that|my|your|his|her|its|our|their)\b/i.test(after)) {
    return { pointCode: code as GrammarPointCode, showLabel: false };
  }
  // listening to songs you like [and / or] songs you don't -> between A and B라 both가 없다
  if (code === "CORRELATIVE_BOTH_AND" && !/\bboth\b/i.test(before)) return { pointCode: code, showLabel: false };
  // changing needs [as / which] they arise -> as는 관계부사가 아니다
  if (code.startsWith("RELATIVE_ADVERB_") && !/^(?:when|where|why|how|whenever|wherever)\b/.test(c)) {
    return { pointCode: code as GrammarPointCode, showLabel: false };
  }
  // types of tensions, [where / which] the rhythm is ... -> 병렬이 아니라 관계사 계속적 용법
  if (code === "PARALLEL_CLAUSES" && /^(?:where|when|which|who|whom|whose)$/.test(c) && /,\s*$/.test(before)) {
    return { pointCode: "RELATIVE_NONRESTRICTIVE", showLabel: true };
  }
  // obsessed by [this / these] fear -> 가주어·지시 it이 아니라 지시형용사의 수
  if (code.startsWith("DUMMY_") && (pair === "these|this" || pair === "that|those")) {
    return { pointCode: "ADJECTIVE_NOUN_MODIFIER", showLabel: true };
  }
  // we have learned [to operate / operating], you need [to increase / increasing]
  // -> 부사적 용법·목적격 보어가 아니라 동사의 목적어(명사적 용법)
  if (
    (code === "INFINITIVE_ADVERB_ROLE" || code === "INFINITIVE_OBJECT_COMPLEMENT") &&
    /^to\s/.test(c) &&
    /\b(?:need|needs|needed|want|wants|wanted|learn|learns|learned|learnt|decide|decides|decided|hope|hopes|hoped|plan|plans|planned|agree|agreed|refuse|refused|manage|managed|fail|failed|choose|chose|promise|promised|afford|wish|wished|expect|expected)\s+$/i.test(before)
  ) {
    return { pointCode: "INFINITIVE_NOUN_ROLE", showLabel: true };
  }
  // 4차 실행
  // it's therefore [unsurprising / unsurprisingly] -> 정답이 형용사인데 부사 코드(또는 그 반대)
  if (axisOf(correct, wrong) === "ADJ_ADV") {
    const correctIsAdverb = c.length > w.length;
    if ((code.startsWith("ADVERB_") && !code.startsWith("ADVERB_CLAUSE_") && !correctIsAdverb) || (code.startsWith("ADJECTIVE_") && correctIsAdverb)) {
      return { pointCode: code as GrammarPointCode, showLabel: false };
    }
  }
  // [When / Whether] we are 'always on' -> whether/if가 아니면 whether·if 명사절이 아니다
  if (code === "NOUN_CLAUSE_WHETHER_IF" && !/^(?:whether|if)\b/.test(c)) return { pointCode: code, showLabel: false };
  // Instead, [smaller / more small] worker ants -> 명사 수식이 아니라 비교급 형태
  if (
    /^[a-z]+er$/.test(c) &&
    /^more [a-z]+$/.test(w) &&
    c.startsWith(w.slice(5).replace(/[ey]$/, "")) &&
    !code.startsWith("COMPARATIVE")
  ) {
    return { pointCode: "COMPARATIVE", showLabel: true };
  }
  // [I've been / being] nominated as a candidate ... -> 병렬할 짝(and/or/but/쉼표)이 문장에 없다
  if (code.startsWith("PARALLEL_") && !/\b(?:and|or|but|nor)\b|[,;]/i.test(sentence)) {
    return { pointCode: code as GrammarPointCode, showLabel: false };
  }
  return null;
}

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
  const after = input.sentence.slice(Math.max(0, input.at) + input.correct.length);
  const byContext = contextLabel(input.pointCode, input.correct, input.wrong, before, after, input.sentence);
  if (byContext) return byContext;

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

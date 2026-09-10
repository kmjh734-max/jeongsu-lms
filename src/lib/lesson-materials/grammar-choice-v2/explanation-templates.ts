import { ontologyPoint } from "@/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import type {
  GrammarPointCode,
  GrammarTransformCode,
} from "@/lib/lesson-materials/grammar-choice-v2/types";

export type ExplanationTemplate = {
  pointCode: GrammarPointCode;
  titleKo: string;
  structureTemplate: string;
  explanationTemplate: string;
  wrongReasonTemplate: string;
};

const SPECIAL: Partial<Record<GrammarPointCode, ExplanationTemplate>> = {
  INDIRECT_QUESTION_ORDER: {
    pointCode: "INDIRECT_QUESTION_ORDER",
    titleKo: "간접의문문",
    structureTemplate: "의문사 + 주어 + 동사",
    explanationTemplate:
      "간접의문문이므로 의문사 뒤에는 평서문 어순이 와야 한다.",
    wrongReasonTemplate: "{wrong}는 직접의문문의 어순이다.",
  },
  CONDITIONAL_SECOND: {
    pointCode: "CONDITIONAL_SECOND",
    titleKo: "가정법 과거",
    structureTemplate: "if + 과거형, S + would/could/might + 동사원형",
    explanationTemplate:
      "현재 사실과 반대되는 가정은 if절에 과거형을 쓰고, 주절에는 would/could/might + 동사원형을 쓴다.",
    wrongReasonTemplate: "{wrong}는 가정법 과거의 if절/주절 형태가 아니다.",
  },
  RELATIVE_NONRESTRICTIVE: {
    pointCode: "RELATIVE_NONRESTRICTIVE",
    titleKo: "계속적 용법의 관계대명사",
    structureTemplate: "선행사, which + 절",
    explanationTemplate:
      "콤마 뒤에서 앞 명사나 절을 부연하는 계속적 용법에는 which를 쓴다.",
    wrongReasonTemplate: "{wrong}는 계속적 용법의 관계대명사로 쓸 수 없다.",
  },
  CONJUNCTION_PREPOSITION_CONTRAST: {
    pointCode: "CONJUNCTION_PREPOSITION_CONTRAST",
    titleKo: "접속사와 전치사",
    structureTemplate: "접속사 + 절 / 전치사 + 명사구",
    explanationTemplate:
      "뒤에 오는 성분이 절이면 접속사, 명사구이면 전치사를 쓴다.",
    wrongReasonTemplate: "{wrong}는 뒤 성분의 품사와 맞지 않는다.",
  },
};

/**
 * 영어 낱말 뒤 조사를 고를 때 받침이 있다고 보는 끝 철자.
 *
 * 한국어에서 영어 낱말을 읽을 때 대부분의 끝자음에는 '으'가 붙어(states → 스테이츠,
 * extinct → 익스팅트) 모음으로 끝난 것처럼 조사가 붙는다. 받침이 남는 것은
 * ㄴ·ㅁ·ㄹ·ㅇ 계열뿐이라, 그 경우만 은/을을 쓴다.
 */
const FINAL_CONSONANT_LETTERS = new Set(["l", "m", "n"]);

/** 앞 낱말의 받침에 맞춰 목적격 조사(을/를)를 붙인다. */
function withObjectParticle(word: string): string {
  const trimmed = word.trim();
  return `${trimmed}${hasFinalConsonant(trimmed) ? "을" : "를"}`;
}

/** 낱말의 끝소리에 받침이 있는지 본다. 한글은 종성으로, 영어는 철자로 어림한다. */
function hasFinalConsonant(word: string): boolean {
  const last = word.trim().at(-1);
  if (!last) return false;
  const code = last.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) return (code - 0xac00) % 28 !== 0;
  if (/[a-zA-Z]/.test(last)) return FINAL_CONSONANT_LETTERS.has(last.toLowerCase());
  return false;
}

/** 앞 낱말의 받침에 맞춰 주제 조사(은/는)를 붙인다. */
function withTopicParticle(word: string): string {
  const trimmed = word.trim();
  const last = trimmed.at(-1);
  if (!last) return trimmed;
  const code = last.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) {
    return `${trimmed}${(code - 0xac00) % 28 === 0 ? "는" : "은"}`;
  }
  if (/[a-zA-Z]/.test(last)) {
    return `${trimmed}${FINAL_CONSONANT_LETTERS.has(last.toLowerCase()) ? "은" : "는"}`;
  }
  return `${trimmed}는`;
}

/**
 * 오답이 어긋난 문법 축을 서술한다. 세부 규칙 템플릿이 없는 point code에서도
 * "무엇이 왜 틀렸는지"를 남기기 위한 기본 서술부다.
 */
const AXIS_WRONG_REASON: Record<GrammarTransformCode, string> = {
  NUMBER_SWAP: "실제 주어의 수와 일치하지 않는다",
  TENSE_SWAP: "문맥이 가리키는 시제와 맞지 않는다",
  VOICE_SWAP: "주어와 동사의 능동·수동 관계에 맞지 않는다",
  ADJ_ADV: "수식 대상의 품사와 맞지 않는다",
  NONFINITE_SWAP: "이 자리에 올 수 있는 준동사 형태가 아니다",
  CASE_SWAP: "이 자리에서 요구되는 격이 아니다",
  PARALLEL_FORM: "병렬된 앞 요소와 형태가 다르다",
  CONDITIONAL_FORM: "이 가정법 구문이 요구하는 형태가 아니다",
  RELATIVE_CHOICE: "선행사와 뒤 절의 구조에 맞는 관계사가 아니다",
  CLAUSE_MARKER: "뒤에 이어지는 절의 형태와 맞지 않는다",
  WORD_ORDER: "이 구문이 요구하는 어순이 아니다",
  FORM_SWAP: "이 자리에서 요구되는 형태가 아니다",
};

/** 정답이 그 형태여야 하는 이유를 문법 축에 맞춰 서술한다. */
const AXIS_CORRECT_REASON: Record<GrammarTransformCode, string> = {
  NUMBER_SWAP: "동사는 실제 주어의 수에 맞춘다",
  TENSE_SWAP: "문맥이 가리키는 시점에 맞는 시제를 쓴다",
  VOICE_SWAP: "주어가 행위의 주체인지 대상인지에 따라 태를 정한다",
  ADJ_ADV: "수식 대상이 무엇인지에 따라 형용사와 부사를 가른다",
  NONFINITE_SWAP: "이 자리가 요구하는 준동사 형태를 쓴다",
  CASE_SWAP: "절 안에서 맡는 역할에 맞는 격을 쓴다",
  PARALLEL_FORM: "등위접속사로 이어진 요소는 형태를 맞춘다",
  CONDITIONAL_FORM: "가정법이 요구하는 절 형태를 맞춘다",
  RELATIVE_CHOICE: "선행사와 뒤 절의 구조에 맞는 관계사를 고른다",
  CLAUSE_MARKER: "뒤에 오는 절의 형태에 맞는 연결어를 쓴다",
  WORD_ORDER: "이 구문이 요구하는 어순을 지킨다",
  FORM_SWAP: "이 자리가 요구하는 형태를 쓴다",
};

/**
 * point code 전용 템플릿도 모델 요약도 없을 때, 온톨로지 정보와 변형 축으로
 * 정답 해설을 만든다. "규칙에 따라 원문 형태 X가 맞다"는 아무것도 알려주지 않는다.
 */
function derivedExplanation(input: {
  correct: string;
  transformCode?: GrammarTransformCode;
  allowedTransform?: GrammarTransformCode;
  titleKo: string;
  structure: string;
}): string {
  const axis = input.transformCode ?? input.allowedTransform ?? "FORM_SWAP";
  const rule = AXIS_CORRECT_REASON[axis] ?? AXIS_CORRECT_REASON.FORM_SWAP;
  // structure는 온톨로지의 탐지 힌트라서 이 문장에 맞지 않을 수 있다
  // (관측: while절 문항에 "that절 and that절"이 붙었다). 해설에는 쓰지 않는다.
  return `${input.titleKo}. ${rule}. 그래서 ${withObjectParticle(input.correct)} 쓴다.`;
}

/**
 * point code 전용 템플릿이 없을 때 온톨로지 정보(labelKo·detectionHints)와
 * 변형 축을 조합해 오답 근거를 만든다.
 */
function derivedWrongReason(input: {
  wrong: string;
  transformCode?: GrammarTransformCode;
  allowedTransform?: GrammarTransformCode;
  titleKo: string;
  structure: string;
}): string {
  const axis = input.transformCode ?? input.allowedTransform ?? "FORM_SWAP";
  const predicate = AXIS_WRONG_REASON[axis] ?? AXIS_WRONG_REASON.FORM_SWAP;
  const base = `${withTopicParticle(input.wrong)} ${predicate}.`;
  // 축 문장만으로 규칙이 드러나지 않는 경우에만 어떤 규칙인지 괄호로 덧붙인다.
  if (axis !== "FORM_SWAP") return base;
  if (input.structure) return `${base} (${input.titleKo}: ${input.structure})`;
  return `${base} (${input.titleKo})`;
}

export function explainChoice(input: {
  pointCode: GrammarPointCode;
  correct: string;
  wrong: string;
  ruleSummaryKo?: string;
  evidence?: string;
  transformCode?: GrammarTransformCode;
}): { titleKo: string; structure: string; explanationKo: string; wrongReasonKo: string } {
  if (input.pointCode === "PSEUDO_CLEFT_ALL") {
    return {
      titleKo: "의사분열문 all",
      structure: "All (that) S have to do + be + 동사원형",
      explanationKo:
        "All (that) S have to do + be + 동사원형. 여기서 all절은 ‘해야 할 전부/한 가지 일’을 나타낸다.",
      wrongReasonKo: `${input.wrong}는 all절의 be동사로 쓸 수 없다.`,
    };
  }
  if (input.pointCode === "AGREEMENT_ONE_OF") {
    return {
      titleKo: "one of 수일치",
      structure: "one of + 복수명사 + 단수 동사",
      explanationKo: `주어의 중심어는 단수 one이므로 동사는 ${input.correct}가 된다.`,
      wrongReasonKo: `${input.wrong}는 one이 아닌 복수 명사에 맞춘 형태다.`,
    };
  }
  if (
    input.pointCode === "RELATIVE_PREPOSITION_WHICH" &&
    input.correct.trim().toLowerCase() === "which" &&
    input.wrong.trim().toLowerCase() === "that"
  ) {
    return {
      titleKo: "전치사 + 관계대명사",
      structure: "전치사 + which",
      explanationKo: "전치사 바로 뒤에는 관계대명사 which를 쓰며 that은 쓸 수 없다.",
      wrongReasonKo: "that은 전치사 바로 뒤에 쓸 수 없다.",
    };
  }
  if (
    input.pointCode === "AGREEMENT_DISTANCE" &&
    /수식어|장거리/.test(input.ruleSummaryKo ?? "")
  ) {
    return {
      titleKo: "장거리 수 일치",
      structure: "주어 + 수식어 + 동사",
      explanationKo:
        input.ruleSummaryKo?.trim() ||
        "주어와 동사 사이에 수식어가 삽입된 장거리 수 일치이므로 동사는 실제 주어의 수를 따른다.",
      wrongReasonKo: `${input.wrong}는 실제 주어의 수와 일치하지 않는다.`,
    };
  }
  if (
    input.pointCode === "PARTICIPLE_ACTIVE_PASSIVE" &&
    /후치수식/.test(input.ruleSummaryKo ?? "")
  ) {
    return {
      titleKo: "후치수식 과거분사",
      structure: "명사 + 과거분사",
      explanationKo:
        input.ruleSummaryKo?.trim() ||
        `명사 뒤에서 후치수식하는 과거분사이므로 ${input.correct}가 맞다.`,
      wrongReasonKo: `${input.wrong}는 명사 뒤 후치수식 과거분사가 아니다.`,
    };
  }
  if (
    input.pointCode === "COMPARATIVE" &&
    input.correct.trim().toLowerCase() === "than" &&
    input.wrong.trim().toLowerCase() === "as"
  ) {
    return {
      titleKo: "비교급 + than",
      structure: "비교급 + than",
      explanationKo: "비교급 뒤에는 than을 쓴다. as는 as … as 원급 비교에 쓴다.",
      wrongReasonKo: "as는 비교급 뒤에 쓰지 않는다.",
    };
  }
  if (
    input.pointCode === "CORRELATIVE_EITHER_OR" &&
    input.correct.trim().toLowerCase() !== "or"
  ) {
    return {
      titleKo: "either A or B 병렬",
      structure: "either A or B",
      explanationKo: `either A or B는 같은 형태의 요소를 병렬하므로 ${input.correct}가 맞다.`,
      wrongReasonKo: `${input.wrong}는 앞 요소와 병렬 형태가 아니다.`,
    };
  }
  if (
    input.pointCode === "CONJUNCTION_PREPOSITION_CONTRAST" &&
    [input.correct, input.wrong].map((s) => s.trim().toLowerCase()).sort().join("|") === "during|when"
  ) {
    return {
      titleKo: "접속사와 전치사",
      structure: "when + 절 / during + 명사구",
      explanationKo: "뒤에 완전한 절이 오면 접속사 when을 쓰고, during 뒤에는 명사구가 온다.",
      wrongReasonKo: "during 뒤에는 완전한 절이 올 수 없다.",
    };
  }
  if (
    input.pointCode === "PARALLEL_CLAUSES" &&
    input.correct.trim().toLowerCase() === "is" &&
    input.wrong.trim().toLowerCase() === "being"
  ) {
    return {
      titleKo: "절 병렬",
      structure: "but + 완전한 절",
      explanationKo: "but은 앞의 완전한 절과 뒤의 완전한 절을 연결하므로, 뒤 절에도 정형동사 is가 필요하다.",
      wrongReasonKo: "being은 뒤 절의 정형동사를 없앤다.",
    };
  }
  if (input.pointCode === "INDIRECT_QUESTION_ORDER") {
    return {
      titleKo: "간접의문문",
      structure: "의문사 + 주어 + 동사",
      explanationKo: `간접의문문이므로 ${input.correct}처럼 평서문 어순을 쓴다.`,
      wrongReasonKo: `${input.wrong}는 직접의문문 어순이다.`,
    };
  }
  if (
    input.pointCode === "PARALLEL_CLAUSES" &&
    [input.correct, input.wrong].map((s) => s.trim().toLowerCase()).sort().join("|") === "that|what"
  ) {
    return {
      titleKo: "병렬 내용절",
      structure: "and + that + 완전한 내용절",
      explanationKo:
        "and 뒤에는 앞의 that절과 병렬을 이루는 완전한 내용절이 이어진다. 접속사 that은 문장 성분을 맡지 않지만, what은 절 안에서 주어나 목적어가 되어야 하므로 이 자리에는 쓸 수 없다.",
      wrongReasonKo: "what은 절 안에서 주어나 목적어가 되어야 하므로 완전한 절 앞에 쓸 수 없다.",
    };
  }
  if (
    input.pointCode === "PARALLEL_CLAUSES" &&
    input.correct.trim().toLowerCase() === "that" &&
    input.wrong.trim().toLowerCase() === "which"
  ) {
    return {
      titleKo: "병렬 내용절",
      structure: "states that A and that B",
      explanationKo:
        "states의 목적어로 두 개의 내용절이 and로 병렬 연결되어 있으므로 두 번째 절도 접속사 that으로 이끈다. which는 이 자리에서 완전한 내용절을 이끌 수 없다.",
      wrongReasonKo: "which는 이 자리에서 완전한 내용절을 이끌 수 없다.",
    };
  }
  if (input.pointCode === "VOICE_BE_MADE_TO") {
    return {
      titleKo: "사역 수동",
      structure: "be made to + 동사원형",
      explanationKo: "능동태 make + 목적어 + 동사원형 구조가 수동태가 되면 be made to + 동사원형으로 바뀐다.",
      wrongReasonKo: `${input.wrong}는 수동태에서 복원되어야 하는 to가 없다.`,
    };
  }
  if (
    input.pointCode === "ADVERB_ADJECTIVE_MODIFIER" &&
    input.correct.trim().toLowerCase() === "extremely" &&
    input.wrong.trim().toLowerCase() === "extreme"
  ) {
    return {
      titleKo: "형용사 수식 부사",
      structure: "부사 + 형용사",
      explanationKo: "형용사 magnetic을 수식하므로 부사 extremely가 필요하다.",
      wrongReasonKo: "extreme은 형용사라 magnetic을 수식할 수 없다.",
    };
  }
  if (input.pointCode === "NOUN_CLAUSE_DECLARATIVE_ORDER") {
    return {
      titleKo: "진술 명사절 어순",
      structure: "내용절의 S + V",
      explanationKo: "내용을 설명하는 명사절에는 평서문 어순인 주어 + 동사, 곧 S + V를 쓴다.",
      wrongReasonKo: `${input.wrong}는 의문문 어순이라 내용절에 쓸 수 없다.`,
    };
  }
  if (input.pointCode === "PREPOSITION_INSTEAD_OF") {
    return {
      titleKo: "복합전치사 instead of",
      structure: "instead of + 명사/동명사",
      explanationKo: "instead는 부사이고, 뒤에 명사나 동명사가 이어지면 복합전치사 instead of를 쓴다.",
      wrongReasonKo: "instead만으로는 뒤에 오는 명사나 동명사를 목적어로 취할 수 없다.",
    };
  }
  if (input.pointCode === "GERUND_PREPOSITION_OBJECT") {
    const moving = input.correct.trim().toLowerCase() === "moving";
    return {
      titleKo: "전치사 목적어 동명사",
      structure: "전치사 + V-ing",
      explanationKo: moving
        ? "전치사 of 뒤에는 동명사 moving을 쓴다."
        : `전치사 뒤에는 동명사 ${input.correct}을 쓴다.`,
      wrongReasonKo: `${input.wrong}는 전치사 목적어인 V-ing이 아니다.`,
    };
  }
  if (
    input.pointCode === "PARALLEL_AND_OR_BUT" &&
    input.correct.trim().toLowerCase() === "thinking" &&
    input.wrong.trim().toLowerCase() === "think"
  ) {
    return {
      titleKo: "동명사 병렬",
      structure: "between A and B",
      explanationKo: "and로 연결된 두 요소는 같은 동명사 형태를 취하므로 thinking이 맞다.",
      wrongReasonKo: "think는 앞 요소와 병렬인 동명사가 아니다.",
    };
  }
  if (
    input.pointCode === "INFINITIVE_PASSIVE" &&
    input.correct.trim().toLowerCase() === "be wiped"
  ) {
    return {
      titleKo: "to부정사 수동",
      structure: "to be p.p.",
      explanationKo: "주어가 행위의 주체가 아니라 행위의 대상이므로 to부정사의 수동형 to be p.p.를 쓴다.",
      wrongReasonKo: "wipe는 주어를 행위 주체로 만든다.",
    };
  }
  if (
    (input.pointCode === "VOICE_MODAL_PASSIVE" || input.pointCode === "VOICE_ACTIVE_PASSIVE") &&
    input.correct.trim().toLowerCase() === "wiped" &&
    input.wrong.trim().toLowerCase() === "wiping"
  ) {
    return {
      titleKo: "조동사 수동",
      structure: "modal + be p.p.",
      explanationKo: "조동사 뒤에는 수동태 modal + be p.p.를 쓴다. 주어가 행위의 주체가 아니므로 과거분사 wiped를 쓴다.",
      wrongReasonKo: "wiping은 주어를 행위 주체로 만든다.",
    };
  }
  if (input.pointCode === "ONE_OF_SUPERLATIVE" && input.correct.trim().toLowerCase() === "insights") {
    return {
      titleKo: "one of 최상급",
      structure: "one of + 최상급 + 복수명사",
      explanationKo: "one of + 최상급 + 복수명사 구조이므로 복수형 insights를 쓴다.",
      wrongReasonKo: "insight는 one of + 최상급 뒤의 복수명사가 아니다.",
    };
  }
  if (input.pointCode === "CORRELATIVE_BOTH_AND" && input.correct.trim().toLowerCase() === "and") {
    return {
      titleKo: "both A and B",
      structure: "both A and B",
      explanationKo: "both가 있으면 짝 접속사는 and이며 or를 쓰지 않는다.",
      wrongReasonKo: "or는 both와 짝을 이루지 않는다.",
    };
  }
  const def = ontologyPoint(input.pointCode);
  const special = SPECIAL[input.pointCode];
  const titleKo = special?.titleKo ?? def?.labelKo ?? input.pointCode;
  const structure = special?.structureTemplate ?? def?.detectionHints[0] ?? "";
  const explanationKo =
    special?.explanationTemplate ??
    (input.ruleSummaryKo?.trim() ||
      derivedExplanation({
        correct: input.correct,
        transformCode: input.transformCode,
        allowedTransform: def?.allowedTransforms[0],
        titleKo,
        structure,
      }));
  const wrongReasonKo = special?.wrongReasonTemplate
    ? special.wrongReasonTemplate.replaceAll("{wrong}", input.wrong)
    : derivedWrongReason({
        wrong: input.wrong,
        transformCode: input.transformCode,
        allowedTransform: def?.allowedTransforms[0],
        titleKo,
        structure,
      });
  const useEvidence =
    input.pointCode.startsWith("CONDITIONAL_") ||
    input.pointCode.startsWith("TENSE_");
  return {
    titleKo,
    structure,
    explanationKo:
      useEvidence && input.evidence
        ? `${explanationKo} ${input.evidence}`.trim()
        : explanationKo,
    wrongReasonKo,
  };
}

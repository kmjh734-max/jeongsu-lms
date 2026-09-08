import { ontologyPoint } from "@/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import type { GrammarPointCode } from "@/lib/lesson-materials/grammar-choice-v2/types";

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

export function explainChoice(input: {
  pointCode: GrammarPointCode;
  correct: string;
  wrong: string;
  ruleSummaryKo?: string;
  evidence?: string;
}): { titleKo: string; structure: string; explanationKo: string; wrongReasonKo: string } {
  const def = ontologyPoint(input.pointCode);
  const special = SPECIAL[input.pointCode];
  const titleKo = special?.titleKo ?? def?.labelKo ?? input.pointCode;
  const structure = special?.structureTemplate ?? def?.detectionHints[0] ?? "";
  const explanationKo =
    special?.explanationTemplate ??
    (input.ruleSummaryKo?.trim() ||
      `${titleKo} 규칙에 따라 원문 형태 ${input.correct}가 맞다.`);
  const wrongReasonKo = (
    special?.wrongReasonTemplate ??
    "{wrong}는 이 문장의 문법 축에서 성립하지 않는다."
  ).replaceAll("{wrong}", input.wrong);
  const useEvidence =
    input.pointCode.startsWith("CONDITIONAL_") ||
    input.pointCode.startsWith("TENSE_") ||
    input.pointCode === "INDIRECT_QUESTION_ORDER";
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

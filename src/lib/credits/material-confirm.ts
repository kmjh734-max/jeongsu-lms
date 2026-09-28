import type { CreditConfirmRequest } from "@/lib/credits/confirm-store";
import type { LessonMaterialDocumentKind } from "@/lib/lesson-materials/documents";

/**
 * 자료 종류마다 "만들까요?" 창에 보여 줄 것.
 * 값(feature)은 feature_pricing에서 읽으므로 여기서는 어떤 기능이 몇 번 나가는지만 적는다.
 */
const BY_KIND: Record<
  LessonMaterialDocumentKind,
  { title: string; description: string; contents: string[]; features: string[]; sample: CreditConfirmRequest["sample"] }
> = {
  lesson_pack: {
    title: "수업용 자료",
    description: "지문과 단어정리, 해석을 한 묶음으로 만듭니다. 수업 시간에 같이 읽을 때 씁니다.",
    contents: ["지문", "단어정리", "동의어·반의어", "해석"],
    features: ["lesson_pack"],
    sample: "lesson_pack",
  },
  analysis_report: {
    title: "지문 분석서",
    description:
      "문장을 의미 단위로 끊어 바로 밑에 해석을 붙이고, 주어와 동사, 관계사를 표시해 둡니다. 구문을 짚어 가며 읽을 때 씁니다.",
    contents: ["문장별 직독직해", "구문 표시", "전체 해석"],
    features: ["lesson_analysis_report"],
    sample: "analysis_report",
  },
  workbook: {
    title: "워크북",
    description: "학생이 직접 써 보는 연습지를 만듭니다. 고른 갈래만 값이 나갑니다.",
    contents: ["한줄해석", "통문장 영작", "어순배열 영작", "빈칸 채우기"],
    features: [],
    sample: "workbook",
  },
  one_page_summary: {
    title: "1장 요약직보자료",
    description:
      "한 장에 요약문과 중요 어법 포인트, 중요 표현, 내용 확인을 모아 둡니다. 시험 직전에 한 장만 들고 훑을 때 씁니다.",
    contents: ["요약문", "중요 어법 포인트", "중요 표현", "지칭 정리", "내용 확인", "영작"],
    features: ["lesson_one_page_summary"],
    sample: "one_page_summary",
  },
  one_page_test: {
    title: "1장 테스트",
    description: "고른 지문으로 한 장짜리 확인 시험지를 만듭니다.",
    contents: ["어법 선택", "어휘 선택", "빈칸", "영작"],
    features: ["lesson_one_page_test"],
    sample: "one_page_test",
  },
  integrated: {
    title: "최종통합자료",
    description: "이미 만들어 둔 자료를 표지와 차례를 붙여 한 권으로 묶습니다.",
    contents: ["표지", "차례", "고른 자료"],
    features: [],
    sample: "integrated",
  },
};

/** 자료 종류로 확인 창에 넘길 것을 만든다. count는 고른 지문 수. */
export function materialConfirm(kind: LessonMaterialDocumentKind, count: number): CreditConfirmRequest {
  const meta = BY_KIND[kind];
  return {
    title: meta.title,
    description: meta.description,
    subject: count > 0 ? `고른 지문 ${count}개` : undefined,
    contents: meta.contents,
    items: meta.features.map((feature) => ({ feature, quantity: Math.max(1, count) })),
    sample: meta.sample,
  };
}

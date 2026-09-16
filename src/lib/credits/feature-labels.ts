/**
 * 크레딧 내역·가격표에 보여 줄 기능 이름. DB 가격표 이름(label)에 내부 표현이 섞여 있어도
 * 화면에는 이 이름을 쓴다.
 */

type FeatureInfo = {
  label: string;
  /** "어디에 썼나" 묶음 */
  group: string;
  /** 수량 단위 (문항, 지문, 장) */
  unit?: string;
};

const FEATURES: Record<string, FeatureInfo> = {
  qg_generate_job: { label: "변형문제", group: "변형문제", unit: "문항" },
  lesson_analysis_report: { label: "지문 분석서", group: "지문 분석서", unit: "지문" },
  lesson_pack: { label: "수업용 자료", group: "수업자료", unit: "지문" },
  lesson_illustration: { label: "지문 삽화", group: "수업자료", unit: "장" },
  lesson_workbook_grammar_choice: { label: "워크북 어법 선택", group: "워크북", unit: "지문" },
  lesson_workbook_vocab_choice: { label: "워크북 어휘 선택", group: "워크북", unit: "지문" },
  lesson_workbook_tf: { label: "워크북 T/F", group: "워크북", unit: "지문" },
  lesson_one_page: { label: "1장 자료", group: "수업자료", unit: "지문" },
  vocab_student_monthly: { label: "단어학습 학생 이용", group: "단어·듣기 학생 이용" },
  listening_student_monthly: { label: "듣기학습 학생 이용", group: "단어·듣기 학생 이용" },
  listening_generate_questions: { label: "듣기 문항 만들기", group: "듣기 자료" },
  listening_generate_audio: { label: "듣기 음성 만들기", group: "듣기 자료" },
  vocab_generate_examples: { label: "단어 예문 만들기", group: "단어 자료" },
  vocab_extract_passage: { label: "지문에서 단어 뽑기", group: "단어 자료" },
  vocab_grade_meaning: { label: "단어 뜻 채점", group: "단어 자료" },
  student_record_analyze: { label: "학생부 분석", group: "학생부 분석" },
  report_ai_draft: { label: "학습 리포트 초안", group: "학습 리포트·안내문" },
  nelt_report_narratives: { label: "NELT 리포트 설명", group: "학습 리포트·안내문" },
  nelt_parent_message: { label: "NELT 학부모 안내문", group: "학습 리포트·안내문" },
};

/** 화면용으로 내부 표현을 걷어 낸다 */
export function cleanCreditText(text: string): string {
  return text
    .replace(/\(?\s*토스페이먼츠\s*(테스트\s*)?(결제)?\s*\)?/g, "")
    .replace(/\bAI\s*/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function featureLabel(featureKey: string | null, dbLabel?: string | null): string {
  if (featureKey && FEATURES[featureKey]) return FEATURES[featureKey].label;
  if (dbLabel) return cleanCreditText(dbLabel) || "기타 기능";
  return "기타 기능";
}

export function featureGroup(featureKey: string | null): string {
  return (featureKey && FEATURES[featureKey]?.group) || "기타";
}

/** "변형문제 30문항", "지문 분석서 2지문", "듣기 음성 만들기 × 3" */
export function featureUsageText(
  featureKey: string | null,
  quantity: number | null,
  dbLabel?: string | null
): string {
  const label = featureLabel(featureKey, dbLabel);
  const unit = featureKey ? FEATURES[featureKey]?.unit : undefined;
  const q = quantity && quantity > 0 ? Math.floor(quantity) : null;
  if (unit && q) return `${label} ${q.toLocaleString("ko-KR")}${unit}`;
  if (q && q > 1) return `${label} × ${q.toLocaleString("ko-KR")}`;
  return label;
}

/** 가격표 단위 문구 */
export function featurePriceUnit(featureKey: string, billingType: string): string {
  if (billingType === "monthly_seat") return "학생 1명·한 달";
  const unit = FEATURES[featureKey]?.unit;
  return unit ? `1${unit}` : "1회";
}

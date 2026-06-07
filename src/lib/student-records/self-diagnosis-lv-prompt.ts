import {
  SELF_DIAGNOSIS_LV1_EXPRESSIONS,
  SELF_DIAGNOSIS_LV2_EXPRESSIONS,
  SELF_DIAGNOSIS_LV3_EXPRESSIONS,
} from "@/lib/student-records/self-diagnosis-lexicon";

export const SELF_DIAGNOSIS_LV_RULES_PROMPT = `━━━━━━━━━━━━━━━━━━━━
추가 규칙 C. 자가진단표 LV1 / LV2 / LV3 서술어 반영
━━━━━━━━━━━━━━━━━━━━

자가진단 1번 「레벨2 이상 서술어 비율」은 단어 하나만 세지 말고, 문장 속 주도성·사고 수준·탐구 과정이 실제로 드러나는지 확인한다.

1) LV1 — 교사 관찰·태도·단순 수행 중심, 학생 주도성 거의 없음
예시: ${SELF_DIAGNOSIS_LV1_EXPRESSIONS.join(", ")}
주의: 「탐구함」이라도 과정·방법·결과·판단이 없으면 LV1 (예: 「환경 문제를 탐구함」만 있으면 LV1)

2) LV2 — 학생 주도성 드러남, 비교·분석·설계·적용·발표·개선 등 구체적 사고 과정
예시: ${SELF_DIAGNOSIS_LV2_EXPRESSIONS.join(", ")}

3) LV3 — 주도성 강함, 자기 질문·복합 자료 해석·근거 기반 주장·새 관점·심층 탐구
예시: ${SELF_DIAGNOSIS_LV3_EXPRESSIONS.join(", ")}
주의: 「발표함」은 단순 발표=LV2, 근거 분석·토론·새 관점 포함=LV3

4) 1번 점수 산정
세특·창체 핵심 문장을 활동/문장 단위로 LV1·LV2·LV3 분류

레벨2 이상 비율 = (LV2 문장 수 + LV3 문장 수) ÷ 전체 평가 문장 수 × 100
- 50% 이상: 3점 / 30% 이상 50% 미만: 2점 / 30% 미만: 1점

LV 서술어 분석표 필수 열: 구분(LV1/LV2/LV3) | 판단 기준 | 대표 표현 | 문장 수 | 비율
1번 항목 표에 포함: 전체 평가 문장 수, LV1/LV2/LV3 각 문장 수, LV2 이상 비율, 점수, 대표 근거 문장

예시:
전체 20개 중 LV2 7, LV3 3 → LV2 이상 10개, 비율 50.0% → 3점

5) LV 판단 금지
- 단어 하나만 보고 LV 결정 금지
- 「탐구함」「발표함」 무조건 LV2/LV3 금지
- 사고 과정·방법·결과·성장·교사 평가 함께 확인
- 주도성 없는 단순 참여는 LV1`;

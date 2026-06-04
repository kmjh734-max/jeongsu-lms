/** 생성 후 검수 기준 (코드 검수·향후 AI 검수 프롬프트 공용) */

export const QUALITY_PASS_THRESHOLD = 80;

export const QUALITY_CHECK_CRITERIA = `
생성 후 검수 기준:
1. 지정된 유형과 지시문(instruction)이 맞는가?
2. 대본 길이가 55~90단어 정도인가?
3. 대화형은 6~8턴(발화 수)이며, M(남)과 W(여)가 모두 등장하는가?
4. 담화형은 5~7문장인가?
5. 문장이 대체로 6~13단어인가? (14단어 초과 문장이 많으면 감점)
6. 중1 수준을 벗어난 어려운 문법·어휘가 있는가?
7. 선택지가 5개이고 정답이 하나뿐인가?
8. 정답 근거(answer_clue)가 대본에 있는가?
9. 오답이 같은 범주 안에 있는가?
10. 5번 유형: 언급하지 않은 항목이 정확히 하나인가?
11. 14번 유형: 표와 대본 불일치 항목이 정확히 하나인가?
12. 19~20번: 대본은 마지막 화자(W/M)에서 끝나고, 응답 대사·빈칸(____)은 segment에 없는가? 선택지는 영어인가?
`.trim();

export const QUALITY_CHECK_JSON_SCHEMA = `
검수 결과 JSON (참고):
{
  "quality_score": 0,
  "pass": true,
  "problems": [],
  "suggestions": []
}
quality_score 80 미만이면 검토 필요.
`.trim();

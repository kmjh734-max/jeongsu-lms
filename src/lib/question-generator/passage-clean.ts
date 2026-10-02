/**
 * 올라온 지문에 섞인 시험지 흔적을 걷어 낸다.
 *
 * 100문항 전수 대조(2026-10-02): 발곡고1 3월 모의고사 도표 지문에 정답 표기
 * 「lower(→higher)」와 문장 번호 ①~⑤가 그대로 들어 있어, 그 지문으로 만든 다섯 문항이
 * 전부 이상했다(학생 눈에 정답 표기가 보이고, 지문 번호가 보기 번호와 겹쳤다).
 * 표기는 바른 낱말로 바꾸고, 문장 앞 번호는 셋 이상 보일 때만 뗀다.
 */
export function cleanSourcePassage(text: string): string {
  let out = String(text ?? "");
  // lower(→higher) · lower (→ higher) → higher
  out = out.replace(/([A-Za-z][A-Za-z'-]*)\s*\(\s*→\s*([^)]+?)\s*\)/g, "$2");
  // 도표 문항의 문장 번호: 「①The biggest …」처럼 대문자 앞에 붙은 것이 셋 이상이면 뗀다
  const numbered = out.match(/[①②③④⑤]\s*(?=[A-Z‘“"'])/g) ?? [];
  if (numbered.length >= 3) out = out.replace(/[①②③④⑤]\s*(?=[A-Z‘“"'])/g, "");
  return out.replace(/[ \t]{2,}/g, " ").trim();
}

/** 도표·그래프 설명문인가 (The above graph shows …) */
export function isChartDescriptionPassage(text: string): boolean {
  const head = String(text ?? "").slice(0, 160);
  return (
    /\b(?:graph|chart|table|pie chart|bar graph)s?\s+(?:above|below)\b/i.test(head) ||
    /\b(?:above|following)\s+(?:graph|chart|table|pie chart|bar graph)s?\b/i.test(head)
  );
}

/**
 * 도표 설명문으로 만들면 안 되는 유형. 제목·주제·요지는 도표에 없고, 빈칸·삽입·순서·
 * 무관한문장·함축의미는 수치 사실을 그래프 없이 묻게 된다(100문항 대조에서 #17·#23·#89).
 */
export const CHART_UNFIT_TYPES = new Set([
  "title",
  "topic",
  "summary_mcq",
  "sentence_blank",
  "sentence_insertion",
  "order",
  "irrelevant_sentence",
  "underlined_inference",
]);

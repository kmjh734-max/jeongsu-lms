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
  // 소제목 꺾쇠가 깨져 남은 「<The social criticism」의 홀로 선 < 를 뗀다(<u>·<b> 태그는 둔다).
  // 2026-10-03 전수 대조에서 학생 화면에 그대로 나왔다.
  out = out.replace(/<(?!\/?[ub]>)(?=[A-Za-z])/g, "");
  out = stripTrailingJunk(out);
  return out.replace(/[ \t]{2,}/g, " ").trim();
}

/**
 * 지문 끝에 붙은 찌꺼기를 뗀다(2026-10-03 전수 대조: 지문 1,009개 가운데 수십 개).
 *  1) 다음 단원 제목 — 「… plore it. DJing, Breakdancing, and MCing」, 「… TYPE A. Festival Lover」
 *     마지막 토막이 문장부호 없이 끝나고, 2~8낱말이며 낱말이 대문자로 시작하면 제목으로 본다.
 *  2) 요약문 조각 — 「… their lives. deeds was more evident in those who recalled their」
 *     마지막 토막이 소문자로 시작하고 문장부호 없이 끝나면 뗀다.
 * 대화문(「"Hi," peeped the gosling.」)이나 편지 끝인사(「Best regards, Minjun」)는 건드리지 않는다.
 */
function stripTrailingJunk(text: string): string {
  let t = text.trim();
  for (let guard = 0; guard < 2; guard++) {
    // 「… It was fun. TYPE A.」처럼 대문자 꼬리표만 남은 짧은 토막도 뗀다
    const lastCut = Math.max(t.lastIndexOf(". ", t.length - 2), t.lastIndexOf("! "), t.lastIndexOf("? "));
    const lastSeg = lastCut >= 0 ? t.slice(lastCut + 1).trim() : "";
    if (lastSeg && lastSeg.split(/\s+/).length <= 3 && /\b[A-Z]{2,}\b/.test(lastSeg) && !/[a-z]{3,}/.test(lastSeg)) {
      t = t.slice(0, lastCut + 1).trim();
      continue;
    }
    if (/[.!?"”’)]$/.test(t)) break;
    const cut = Math.max(t.lastIndexOf(". "), t.lastIndexOf("! "), t.lastIndexOf("? "), t.lastIndexOf(".” "), t.lastIndexOf(".\" "));
    if (cut < 0 || cut < t.length * 0.5) break;
    const head = t.slice(0, cut + 1).replace(/[”"]$/, (m) => m);
    const tail = t.slice(cut + 1).trim();
    const words = tail.split(/\s+/).filter(Boolean);
    if (/^(best|kind|warm)?\s*regards|sincerely|yours/i.test(tail)) break;
    const isHeading =
      words.length >= 2 && words.length <= 8 &&
      words.filter((w) => /^[A-Z0-9]/.test(w)).length >= Math.ceil(words.length * 0.6);
    const isFragment = /^[a-z]/.test(tail) && words.length >= 3;
    if (!isHeading && !isFragment) break;
    t = t.slice(0, cut + 1 + (t[cut + 1] === "”" || t[cut + 1] === "\"" ? 1 : 0)).trim();
    void head;
  }
  return t;
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

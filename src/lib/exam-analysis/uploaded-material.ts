/**
 * 선생님이 올리신 자료(PDF·사진·글)에서 「어떤 유형을 냈는지」를 읽어 낸다.
 *
 * 까닭(선생님 지시 2026-10-01): 대조할 것이 셋이다 — 변형문제·수업자료, 그리고
 * <b>직접 올리신 자료</b>. EngCore 밖에서 만든 자료도 적중에 넣어야 뜻이 맞는다.
 *
 * 올린 자료는 문항표가 없으므로 <b>발문</b>으로 유형을 가린다. 지문이 같은 자리를
 * 찾은 다음, 그 앞뒤 가까운 곳에 있는 발문만 본다 — 파일 전체에서 아무 발문이나
 * 끌어오면 내지도 않은 유형을 맞췄다고 하게 된다.
 *
 * 모델을 부르지 않는다(글자만 본다).
 */

/** 학교 시험지 유형 이름 → 그 유형의 발문에 흔히 나오는 말 */
const STEM_PATTERNS: Array<{ type: string; re: RegExp }> = [
  { type: "주제", re: /주제로\s*가장\s*적절|주제를\s*고르/ },
  { type: "제목", re: /제목으로\s*가장\s*적절|제목을\s*고르/ },
  { type: "요지", re: /요지로\s*가장\s*적절|주장으로\s*가장\s*적절/ },
  { type: "목적", re: /목적으로\s*가장\s*적절/ },
  { type: "심경·분위기", re: /심경|분위기로\s*가장\s*적절/ },
  { type: "내용 일치", re: /내용과\s*일치하는\s*것/ },
  { type: "내용 불일치", re: /일치하지\s*않는\s*것/ },
  { type: "일치 개수", re: /일치하지\s*않는\s*것의\s*개수|일치하는\s*것의\s*개수/ },
  { type: "빈칸 추론", re: /빈칸에\s*들어갈\s*말로\s*가장\s*적절/ },
  { type: "순서 배열", re: /이어질\s*글의\s*순서|순서로\s*가장\s*적절/ },
  { type: "문장 삽입", re: /문장이\s*들어가기에\s*가장\s*적절/ },
  { type: "무관한 문장", re: /전체\s*흐름과\s*관계\s*없는|무관한\s*문장/ },
  { type: "밑줄 의미", re: /밑줄\s*친[^가-힣]{0,20}의미하는\s*바|함축적\s*의미/ },
  { type: "어법 판단", re: /어법상\s*틀린\s*것은|어법상\s*적절하지\s*않은/ },
  { type: "어법 (개수)", re: /어법상\s*틀린\s*것의\s*개수|어법상\s*어색한\s*것의\s*개수/ },
  { type: "어휘 판단", re: /낱말의\s*쓰임이\s*적절하지\s*않은\s*것은|문맥상\s*낱말/ },
  { type: "어휘 (개수)", re: /쓰임이\s*적절하지\s*않은\s*것의\s*개수/ },
  { type: "어법 오류 수정", re: /어법상\s*틀린\s*곳을\s*모두\s*찾아|바르게\s*고치시오/ },
  { type: "조건 영작(배열)", re: /배열하여\s*(?:문장을\s*)?완성|<보기>의\s*단어를\s*배열/ },
  { type: "요약문 영작", re: /요약문을\s*완성|요약하는\s*문장/ },
  { type: "본문 찾아 쓰기", re: /본문에서\s*찾아\s*쓰시오|본문에서\s*찾아\s*쓸/ },
  { type: "영영풀이", re: /영영\s*풀이|다음\s*영영\s*정의/ },
];

/** 자료 글에서 지문이 있는 자리를 찾는다 — 없으면 -1 */
export function findPassageAt(materialText: string, examPassage: string): number {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ");
  const hay = norm(materialText);
  const need = norm(examPassage).split(" ").filter(Boolean);
  if (need.length < 5 || hay.length < 40) return -1;
  
  for (let i = 0; i <= need.length - 5; i++) {
    const key = need.slice(i, i + 5).join(" ");
    if (key.length < 25) continue;
    const at = hay.indexOf(key);
    if (at >= 0) return at;
  }
  return -1;
}

/**
 * 그 자리 가까이에 있는 발문으로 유형을 읽는다.
 * 앞뒤 900자만 본다 — 멀리 있는 발문은 다른 지문의 것이다.
 */
export function typesNear(materialText: string, at: number, span = 900): string[] {
  if (at < 0) return [];
  const window = materialText.slice(Math.max(0, at - span), at + span);
  const out: string[] = [];
  for (const { type, re } of STEM_PATTERNS) if (re.test(window)) out.push(type);
  return [...new Set(out)];
}

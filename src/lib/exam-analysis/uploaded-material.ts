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

const STEM_PATTERNS: Array<{ type: string; re: RegExp }> = [
  { type: "주제", re: /주제(?:로|를)/ },
  { type: "제목", re: /제목(?:으로|을)/ },
  { type: "요지", re: /요지(?:로|를)|주장(?:하는|으로)/ },
  { type: "목적", re: /목적(?:으로|을)/ },
  { type: "심경·분위기", re: /심경|분위기/ },
  { type: "내용 일치", re: /일치하는것(?:은|을)/ },
  { type: "내용 불일치", re: /일치하지않는/ },
  { type: "일치 개수", re: /(?:일치하는|일치하지않는)[^]*개수/ },
  { type: "빈칸 추론", re: /빈칸/ },
  { type: "순서 배열", re: /순서/ },
  { type: "문장 삽입", re: /주어진문장|문장이들어가기/ },
  { type: "무관한 문장", re: /관계없는문장|무관한문장|흐름과관계없는/ },
  { type: "밑줄 의미", re: /밑줄친|의미하는바|함축/ },
  { type: "어법 판단", re: /어법상(?:틀린|적절하지|어색한|바르지)/ },
  { type: "어법 (개수)", re: /어법상(?:틀린|적절하지|어색한|바르지)[^]*개수/ },
  { type: "어휘 판단", re: /(?:낱말|어휘)(?:의쓰임이|가)|문맥상(?:낱말|어휘|적절하지|쓰임)/ },
  { type: "어휘 (개수)", re: /(?:낱말|어휘)[^]*개수/ },
  { type: "어법 오류 수정", re: /어법상틀린곳|바르게고치/ },
  { type: "조건 영작(배열)", re: /배열|조건에맞게영작/ },
  { type: "요약문 영작", re: /요약문/ },
  { type: "본문 찾아 쓰기", re: /본문에서찾아/ },
  { type: "영영풀이", re: /영영(?:풀이|정의)/ },
];

/** 자료 글에서 지문이 있는 자리를 찾는다 — 없으면 -1 */
export function findPassageAt(materialText: string, examPassage: string): number {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ");
  const need = norm(examPassage).split(" ").filter(Boolean);
  if (need.length < 5 || materialText.length < 40) return -1;
  
  for (let i = 0; i <= need.length - 5; i++) {
    const words = need.slice(i, i + 5);
    if (words.join("").length < 15) continue;
    
    // 영어 낱말 사이에 문장부호, 줄바꿈, 한글 등 영숫자가 아닌 모든 것을 허용
    const pattern = words.join("[^a-zA-Z0-9]+");
    try {
      const re = new RegExp(pattern, "i");
      const match = materialText.match(re);
      if (match && match.index !== undefined) {
        return match.index;
      }
    } catch {
      // Regex compilation error (shouldn't happen with [^a-zA-Z0-9]+)
    }
  }
  return -1;
}

/**
 * 그 자리 가까이에 있는 발문으로 유형을 읽는다.
 * 앞뒤 900자만 본다 — 멀리 있는 발문은 다른 지문의 것이다.
 */
export function typesNear(materialText: string, at: number, span = 2500): string[] {
  if (at < 0) return [];
  const window = materialText.slice(Math.max(0, at - span), at + span);
  const noSpace = window.replace(/\s+/g, "");
  const out: string[] = [];
  for (const { type, re } of STEM_PATTERNS) if (re.test(noSpace)) out.push(type);
  return [...new Set(out)];
}

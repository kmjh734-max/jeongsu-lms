/**
 * 선생님이 올리신 자료(PDF·사진·글)에서 「어떤 유형을 냈는지」를 읽어 낸다.
 *
 * 까닭(선생님 지시 2026-10-01): 대조할 것이 셋이다 — 변형문제·수업자료, 그리고
 * <b>직접 올리신 자료</b>. EngCore 밖에서 만든 자료도 적중에 넣어야 뜻이 맞는다.
 *
 * 올린 자료는 문항표가 없으므로 <b>발문</b>으로 유형을 가린다.
 *
 * 처음 만든 방식은 지문 자리의 앞뒤 2,500자 안에서 아무 발문 낱말이나 긁어 왔다.
 * 선생님이 시험지 자체를 올려 재 보니(2026-10-02, 구현고 30문항) 6문항만 적중이었다.
 *  · 창이 넓어 옆 문항의 발문까지 읽었다 — 어휘 문항 여섯이 모두 「빈칸 추론」이 됐다.
 *  · 「[1~6] 주어진 빈칸에…」처럼 묶음 발문은 각 문항 바로 앞에 없어 못 찾았다.
 *  · 발문이 하나도 안 잡히면 적중으로 쳤다 — 유형을 모르는데 맞췄다고 한 것이다.
 *  · 「<가>의 내용을 바탕으로…」같은 발문은 어느 틀에도 안 들어 늘 빗나갔다.
 *
 * 그래서 이렇게 바꿨다.
 *  1. 지문이 나오는 자리를 <b>모두</b> 찾는다(한 자료에 같은 지문이 유형별로 여러 번 나온다).
 *  2. 그 자리 바로 앞에서 가장 가까운 <b>발문 한 줄</b>만 집는다. 묶음 발문도 거슬러 올라가 찾는다.
 *  3. 시험지 문항표에 담긴 발문(stem)과 <b>발문끼리</b> 견준다 — 틀에 넣어 같은 유형이면 같고,
 *     틀에 안 들면 글자가 거의 같을 때만 같다. 발문을 못 읽으면 적중이 아니다.
 *
 * 모델을 부르지 않는다(글자만 본다).
 */

/**
 * 발문을 유형으로 가르는 틀. 위에서부터 먼저 맞는 것이 그 발문의 유형이다.
 * 띄어쓰기를 모두 지운 글에 댄다(PDF에서 뽑으면 「것은 ? [3 점 ]」처럼 띄어짐).
 *
 * 차례가 뜻을 가른다 — 「요약할 때 빈칸 (A)」는 빈칸이 아니라 요약이고,
 * 「밑줄 친 ①~⑤ 중 문맥상 낱말의 쓰임」은 밑줄 의미가 아니라 어휘다.
 */
const STEM_PATTERNS: Array<{ type: string; re: RegExp }> = [
  { type: "어법 (개수)", re: /어법.{0,14}개수/ },
  { type: "어휘 (개수)", re: /(?:낱말|어휘|문맥상).{0,24}개수/ },
  { type: "일치 개수", re: /일치.{0,14}개수/ },
  { type: "어법 오류 수정", re: /바르게고치|틀린(?:곳|부분)을.{0,8}고쳐|고쳐쓰시오|어법상틀린.{0,12}(?:찾아|고치)/ },
  { type: "어법 판단", re: /어법(?:상|적)|쓰임이서로같은|역할이같은/ },
  { type: "어휘 판단", re: /(?:낱말|어휘|표현)(?:의쓰임|가|로)|문맥상(?:낱말|어휘|쓰임|어색|표현|적절하지않은(?:낱말|어휘|것))|쓰임이(?:적절|어색)|동의어/ },
  { type: "영영풀이", re: /영영/ },
  { type: "요약문", re: /요약/ },
  { type: "문장 삽입", re: /주어진문장|들어가기에|문장이들어갈|들어갈.{0,8}곳은|적절한곳/ },
  { type: "순서 배열", re: /이어질글의순서|글의순서|순서로가장|순서대로|순서에맞게|순서(?:로|를)배열/ },
  { type: "무관한 문장", re: /관계없는문장|무관한문장|흐름과관계없는|흐름상.{0,6}어색한문장/ },
  { type: "내용 불일치", re: /일치하지않|답할수없는|알수없는(?:내용|것)/ },
  { type: "내용 일치", re: /일치하는것|답할수있는|알수있는(?:내용|것)|이해한(?:학생|사람)/ },
  { type: "지칭 추론", re: /가리키는(?:것|대상|내용)|지칭/ },
  { type: "밑줄 의미", re: /의미하는(?:바|내용|것)|함축|의미로(?:가장)?적절/ },
  { type: "예시 적용", re: /부합하는예시|예시로(?:가장)?적절|사례로/ },
  { type: "조건 영작", re: /우리말.{0,24}(?:영작|배열|쓰시오)|조건에맞게|배열하시오|영작하시오|영작한것|영작할때/ },
  { type: "본문 찾아 쓰기", re: /(?:본문|지문|글)에서찾아|그대로쓰시오/ },
  { type: "주제", re: /주제(?:로|를|는|가)/ },
  { type: "제목", re: /제목(?:으로|을|은|이)/ },
  { type: "요지", re: /요지|주장(?:하는|으로|이)/ },
  { type: "목적", re: /목적(?:으로|을|은|이)/ },
  { type: "심경·분위기", re: /심경|분위기/ },
  { type: "빈칸 추론", re: /빈칸|들어갈(?:말|단어|표현|내용|문장)/ },
];

/**
 * 시험지 문항표의 유형 이름 → 이 파일의 틀 이름.
 * 문항표는 「내용 불일치 · 영어 선지」처럼 꼬리가 붙고, 「지칭 대상」「요약문 수정」처럼
 * 분석기가 그때그때 다르게 적은 이름도 있어 핵심 낱말로 맞춘다.
 */
function examNameType(typeName: string): string {
  const name = String(typeName ?? "").split(" · ")[0]!.replace(/\s+/g, "");
  if (/지칭/.test(name)) return "지칭 추론";
  if (/요약/.test(name)) return "요약문";
  if (/영작/.test(name)) return "조건 영작";
  if (/함축|밑줄의미/.test(name)) return "밑줄 의미";
  if (/개념적용|사례/.test(name)) return "예시 적용";
  if (/동의어/.test(name)) return "어휘 판단";
  if (/일치개수/.test(name)) return "일치 개수";
  if (/불일치/.test(name)) return "내용 불일치";
  if (/일치/.test(name)) return "내용 일치";
  return String(typeName ?? "").split(" · ")[0]!.trim();
}

const noSpace = (s: string) => String(s ?? "").replace(/\s+/g, "");

/** 발문의 유형 — 틀에 안 들면 null */
export function stemType(stem: string): string | null {
  const flat = noSpace(stem);
  if (!flat) return null;
  for (const { type, re } of STEM_PATTERNS) if (re.test(flat)) return type;
  return null;
}

/** 자료 글에서 지문이 있는 자리를 찾는다 — 없으면 -1 */
export function findPassageAt(materialText: string, examPassage: string): number {
  return findPassageAll(materialText, examPassage)[0] ?? -1;
}

/**
 * 자료 글에서 지문이 나오는 자리를 <b>모두</b> 찾는다(글자 위치, 앞에서부터).
 *
 * 수업자료는 같은 지문을 어법·어휘·빈칸으로 거듭 쓰므로 첫 자리만 보면 나머지 유형을
 * 놓친다. 시험지 쪽 지문은 앞 150자뿐이고 빈칸·밑줄이 빠져 있어, 다섯 낱말 묶음 가운데
 * 하나라도 자료에 있으면 그 자리로 본다. 낱말 사이에는 무엇이 끼어도 된다(밑줄 표·줄바꿈).
 */
export function findPassageAll(materialText: string, examPassage: string): number[] {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ");
  const need = norm(examPassage).split(" ").filter(Boolean);
  if (need.length < 5 || materialText.length < 40) return [];

  const found: number[] = [];
  for (let i = 0; i <= need.length - 5; i++) {
    const ws = need.slice(i, i + 5);
    if (ws.join("").length < 15) continue;
    let re: RegExp;
    try {
      re = new RegExp(ws.join("[^a-zA-Z0-9]+"), "gi");
    } catch {
      continue;
    }
    for (const m of materialText.matchAll(re)) {
      if (m.index === undefined) continue;
      // 같은 지문 안의 다른 묶음이 잡힌 것은 한 자리로 본다(지문 하나 길이 안)
      if (found.some((at) => Math.abs(at - m.index!) < 1500)) continue;
      found.push(m.index);
    }
    /*
     * 묶음 하나로 자리가 잡혔으면 그만 본다. 더 뒤 묶음은 같은 자리를 다시 가리킬 뿐이고,
     * 짧은 묶음일수록 다른 지문에 우연히 있을 가능성이 커진다.
     */
    if (found.length > 0) break;
  }
  return found.sort((a, b) => a - b);
}

/** 발문이 아닌 안내문 — 「다음 글을 읽고 물음에 답하시오」, 답안지 주의 사항, 조건 줄 */
const NOT_A_STEM = /물음에답하시오|답안지|답지에|표기하시오|작성하시오\.?\(|채점|인쇄상태|참고하시오|마시오|변경하지|주의/;

/**
 * 묶음 머리글 — 「[6~8] 다음 글을 읽고 물음에 답하시오」. 이 뒤에는 지문이 먼저 오고
 * 문항들이 지문 <b>뒤</b>에 붙는다.
 */
const GROUP_HEADER_RE = /(?:\[[^\]\n]{1,30}\]\s*)?(?:다음|아래)\s*(?:글|대화|문장|도표|표|지문)[^?\n]{0,30}?물음에\s*답하시오/g;

/** 지문 위쪽을 가리키는 발문 — 「윗글의 제목으로」는 이미 나온 지문의 문항이다 */
const REFERS_ABOVE = /윗\s*글|위\s*글|위의\s*글|위\s*대화|위의\s*대화|위에서|위\s*지문|위의\s*빈칸|윗글|본문의|위의\s*흐름/;

/** 발문의 끝 — 물음표, 「~시오」, 「~고르면」 */
const STEM_END_RE = /[?？]|시오\.?|고르면\.?/g;
/** 발문 끝에 붙는 배점 — 「[3점]」「[3 점 ]」「(4점)」 */
const POINTS_TAIL_RE = /^\s*[\[(][^\])\n]{0,24}[\])]/;
/**
 * 발문의 머리 번호 — 「2. 」「[서답형 1] 」「[1~6] 」「Q3. 」. 바로 뒤에 한글·괄호가 와야 한다.
 * 보기 번호 ①~⑤는 번호로 치지 않는다(보기는 발문이 아니다).
 */
const NUMBERING_RE = /(?<=^|[\s)\]])\d{1,2}\s*[.)]\s*(?=[가-힣<(\[ⓐ-ⓩ①-⑳Ⓐ-Ⓩ“"])|\[\s*[^\]\n]{1,24}\]\s*(?=[가-힣<(\[ⓐ-ⓩ①-⑳Ⓐ-Ⓩ“"])|(?<=^|\s)Q\s*\d{1,2}\s*[.)]?\s*(?=[가-힣<(\[])/g;
/** 영어가 길게 이어지다 한글이 시작되는 곳 — 번호가 없을 때의 발문 머리 */
const AFTER_LATIN_RUN_RE = /[A-Za-z][^가-힣\n]{40,}(?=[가-힣])/g;

function looksKorean(s: string): boolean {
  const letters = s.replace(/[^A-Za-z가-힣]/g, "");
  const hangul = s.replace(/[^가-힣]/g, "");
  return letters.length > 0 && hangul.length / letters.length >= 0.4;
}

/** 조각 안의 발문 후보들(앞에서부터) */
/**
 * 조각 안의 발문 후보들(앞에서부터).
 *
 * 끝(물음표·「~시오」)을 먼저 찾고, 거기서 거슬러 올라가 머리를 정한다 — 가장 가까운
 * 문항 번호가 있으면 거기부터, 없으면 영어가 길게 이어지다 한글이 시작되는 곳부터.
 *
 * 처음에는 「한글로 시작해 물음표까지」를 한 덩어리로 잡았는데, PDF에서 뽑은 글은 줄바꿈이
 * 없어 앞 문항의 보기 「⑤ How Young Musicians … 2. 밑줄 친 ⓐ~ⓔ 중 어법상 틀린 것의 개수는?」
 * 이 한 덩어리로 잡혀 영어가 많다고 버려졌고, 진짜 발문은 다시 보지 않았다(2026-10-02).
 */
function stemsIn(text: string): Array<{ text: string; at: number }> {
  const out: Array<{ text: string; at: number }> = [];
  let lastEnd = 0;
  for (const m of text.matchAll(STEM_END_RE)) {
    if (m.index === undefined) continue;
    const end = m.index + m[0].length;
    const tail = text.slice(end, end + 40).match(POINTS_TAIL_RE);
    const stop = end + (tail ? tail[0].length : 0);
    const windowStart = Math.max(lastEnd, m.index - 220);
    lastEnd = stop;
    const win = text.slice(windowStart, m.index);
    if (!/[가-힣]/.test(win)) continue;

    let start = -1;
    for (const n of win.matchAll(NUMBERING_RE)) if (n.index !== undefined) start = n.index;
    if (start < 0) {
      for (const r of win.matchAll(AFTER_LATIN_RUN_RE)) if (r.index !== undefined) start = r.index + r[0].length;
      if (start < 0) start = win.search(/[가-힣<\[(ⓐ-ⓩ①-⑳Ⓐ-Ⓩ]/);
      if (start < 0) continue;
      // 번호가 없을 때 줄바꿈이 있으면 마지막 줄만 — 앞 줄은 다른 문항의 보기다
      const nl = win.lastIndexOf("\n");
      if (nl >= start) start = nl + 1;
    }
    const t = text.slice(windowStart + start, stop).trim();
    if (t.length < 6 || !looksKorean(t) || NOT_A_STEM.test(noSpace(t))) continue;
    out.push({ text: t, at: windowStart + start });
  }
  return out;
}

/** 영어 글자 수 — 지문이 새로 시작됐는지 볼 때 쓴다 */
function latinCount(s: string): number {
  return (s.match(/[A-Za-z]/g) ?? []).length;
}

/**
 * 지문 자리에 딸린 발문들.
 *
 * 시험지는 두 꼴이다.
 *  · 발문 → 지문 → 보기: 바로 앞에서 가장 가까운 발문 하나가 이 지문의 것이다.
 *    「[1~6] …고르시오」같은 묶음 발문은 그 사이에 영어 문항만 있으므로 거슬러 올라가면 잡힌다.
 *  · 「[6~8] 다음 글을 읽고 물음에 답하시오」 → 지문 → 6·7·8번 발문: 문항이 지문 <b>뒤</b>에 온다.
 *    머리글이 바로 앞에 있거나, 앞의 발문이 「윗글의 …」처럼 위를 가리키면 이 꼴로 본다.
 *    지문 뒤의 발문을 다음 머리글이나 새 지문(영어가 길게 이어지는 곳)이 나올 때까지 모은다.
 *
 * 어느 쪽에도 발문이 없으면 빈 배열 — 그 자리는 적중이 아니다.
 */
export function stemsFor(materialText: string, at: number): string[] {
  if (at < 0) return [];
  const before = materialText.slice(Math.max(0, at - 2500), at);
  const prev = stemsIn(before);
  const last = prev[prev.length - 1];
  let headerAt = -1;
  for (const m of before.matchAll(GROUP_HEADER_RE)) if (m.index !== undefined) headerAt = m.index;
  const passageFirst =
    (headerAt >= 0 && headerAt > (last?.at ?? -1) && before.length - headerAt < 600) ||
    (last != null && REFERS_ABOVE.test(last.text));

  if (!passageFirst && last) return [last.text];

  const after = materialText.slice(at, at + 7000);
  const headers = [...after.matchAll(GROUP_HEADER_RE)].map((m) => m.index ?? -1).filter((i) => i >= 0);
  const out: string[] = [];
  let cursor = 0;
  for (const s of stemsIn(after)) {
    if (headers.some((h) => h >= cursor && h < s.at)) break;
    // 첫 발문 앞은 이 지문 자체다. 그 뒤로 영어가 길게 이어지면 새 지문이 시작된 것이다.
    if (out.length > 0 && latinCount(after.slice(cursor, s.at)) >= 700) break;
    out.push(s.text);
    cursor = s.at + s.text.length;
    if (out.length >= 6) break;
  }
  if (out.length === 0 && last) return [last.text];
  return out;
}

/** 예전 호출용 — 이 지문에 딸린 첫 발문 */
export function stemNear(materialText: string, at: number): string | null {
  return stemsFor(materialText, at)[0] ?? null;
}

/** 그 자리 가까이에서 읽힌 유형들 — 예전 호출을 위해 남긴다 */
export function typesNear(materialText: string, at: number): string[] {
  const out = stemsFor(materialText, at)
    .map((s) => stemType(s))
    .filter((t): t is string => Boolean(t));
  return [...new Set(out)];
}

/** 발문에서 번호·배점·괄호 설명을 떼고 한글·영숫자만 남긴다 */
function stemCore(stem: string): string {
  return String(stem ?? "")
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/(?:다음|아래)\s*(?:글|대화)[^.?]{0,14}물음에\s*답하시오\.?/g, " ")
    .replace(/^\s*(?:\d+\s*[.)]|[①-⑳]|Q\s*\d+\s*[.)]?|서답형\s*\d+\s*[.)]?)\s*/i, "")
    .replace(/\([^)]*\)/g, " ")
    .replace(/[\d.]+\s*점/g, " ")
    .replace(/[^가-힣A-Za-z0-9]/g, "")
    .toLowerCase();
}

/** 두 발문 글자가 얼마나 겹치는가(0~1) — 두 글자 묶음으로 센다 */
function stemSimilarity(a: string, b: string): number {
  const grams = (s: string) => {
    const out = new Map<string, number>();
    for (let i = 0; i + 2 <= s.length; i++) {
      const g = s.slice(i, i + 2);
      out.set(g, (out.get(g) ?? 0) + 1);
    }
    return out;
  };
  const ga = grams(a);
  const gb = grams(b);
  if (ga.size === 0 || gb.size === 0) return 0;
  let shared = 0;
  for (const [g, n] of ga) shared += Math.min(n, gb.get(g) ?? 0);
  let total = 0;
  for (const n of ga.values()) total += n;
  for (const n of gb.values()) total += n;
  return (2 * shared) / total;
}

/**
 * 시험지 문항과 자료 발문이 같은 유형인가.
 *
 *  · 둘 다 틀에 들면: 틀이 같아야 한다(주제와 제목은 글자가 비슷해도 다른 문제다).
 *  · 자료 발문만 틀에 들면: 문항표의 유형 이름과 맞춘다(시험지 발문이 특이해도 선생님이
 *    표준 발문으로 냈으면 같은 유형이다).
 *  · 자료 발문이 틀에 안 들면: 글자가 거의 같을 때만 같다(시험지를 그대로 올린 경우,
 *    같은 자료를 베껴 쓴 경우).
 */
export function sameStem(examStem: string | null, examTypeName: string, materialStem: string): boolean {
  const mine = stemType(materialStem);
  const theirs = stemType(examStem ?? "");
  if (mine && theirs) return mine === theirs;
  if (mine) return mine === examNameType(examTypeName);
  const a = stemCore(examStem ?? "");
  const b = stemCore(materialStem);
  if (a.length < 6 || b.length < 6) return false;
  return stemSimilarity(a, b) >= 0.8;
}

export type UploadMatch = {
  /** 자료 이름 */
  name: string;
  /** 자료에서 읽은 발문 — 못 읽었으면 null */
  stem: string | null;
  /** 보여 줄 유형 이름 */
  typeName: string;
  sameType: boolean;
};

/**
 * 올리신 자료들에서 이 문항의 지문을 찾고, 자리마다 딸린 발문을 읽어 유형이 같은지 가린다.
 * 한 지문 자리에 발문이 여럿이면(지문 뒤에 6·7·8번) 그중 같은 것이 하나라도 있으면 같다.
 * 한 자료에서 같은 발문이 거듭 나오면 하나로 줄인다.
 */
export function matchUploads(
  item: { passageExcerpt: string | null; stem: string | null; typeName: string },
  uploads: Array<{ name: string; text: string }>
): UploadMatch[] {
  const excerpt = String(item.passageExcerpt ?? "").trim();
  if (excerpt.length <= 40) return [];
  const out: UploadMatch[] = [];
  for (const u of uploads) {
    const seen = new Set<string>();
    for (const at of findPassageAll(u.text, excerpt).slice(0, 8)) {
      const stems = stemsFor(u.text, at);
      const hit = stems.find((s) => sameStem(item.stem, item.typeName, s));
      const stem = hit ?? stems[0] ?? null;
      const key = stem ? stemCore(stem) : "";
      if (seen.has(key)) continue;
      seen.add(key);
      if (!stem) {
        out.push({ name: u.name, stem: null, typeName: "발문 못 읽음", sameType: false });
        continue;
      }
      out.push({
        name: u.name,
        stem,
        typeName: stemType(stem) ?? stem.replace(/\s+/g, " ").slice(0, 28),
        sameType: hit != null,
      });
    }
  }
  // 유형이 같은 것을 앞에
  return out.sort((a, b) => Number(b.sameType) - Number(a.sameType));
}

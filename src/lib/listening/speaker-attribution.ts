/**
 * 대본에서 "실제로 그 말을 한 사람"을 찾는다.
 * 모델이 적어 준 requester·target_person 같은 필드보다 대본 속 발화가 우선이다
 * (필드와 대본이 어긋나면 지시문이 반대 화자를 묻게 된다).
 */

type Seg = { speaker: string; text: string };
type Mw = "M" | "W";

function norm(s: string): string {
  return String(s ?? "")
    .toLowerCase()
    .replace(/[‘’`´]/g, "'")
    .replace(/[^a-z0-9' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isMw(s: string): s is Mw {
  return s === "M" || s === "W";
}

/** 인용문(영어)이 들어 있는 M/W 발화의 화자. 못 찾으면 null */
export function speakerOfQuote(segments: Seg[], quote: string | undefined | null): Mw | null {
  const q = norm(quote ?? "");
  if (q.length < 6) return null;
  const spoken = segments.filter((s) => isMw(s.speaker));
  const exact = spoken.filter((s) => norm(s.text).includes(q));
  if (exact.length > 0) {
    const speakers = new Set(exact.map((s) => s.speaker));
    return speakers.size === 1 ? (exact[0]!.speaker as Mw) : null;
  }
  // 인용이 발화 둘 이상을 이어 붙였거나 조금 다듬어진 경우: 앞 5단어로 다시 찾는다
  const head = q.split(" ").slice(0, 5).join(" ");
  if (head.length >= 12) {
    const hits = spoken.filter((s) => norm(s.text).includes(head));
    const speakers = new Set(hits.map((s) => s.speaker));
    if (hits.length > 0 && speakers.size === 1) return hits[0]!.speaker as Mw;
  }
  return null;
}

/** 여러 인용문 중 다수를 말한 화자 (동률이면 null) */
export function majoritySpeakerOfQuotes(
  segments: Seg[],
  quotes: Array<string | undefined | null>
): Mw | null {
  let m = 0;
  let w = 0;
  for (const quote of quotes) {
    const sp = speakerOfQuote(segments, quote);
    if (sp === "M") m++;
    if (sp === "W") w++;
  }
  if (m > w) return "M";
  if (w > m) return "W";
  return null;
}

/** 패턴에 맞는 발화를 한 화자 (여러 명이면 마지막 발화 기준) */
export function lastSpeakerMatching(segments: Seg[], pattern: RegExp): Mw | null {
  for (let i = segments.length - 1; i >= 0; i--) {
    const s = segments[i]!;
    if (isMw(s.speaker) && pattern.test(s.text)) return s.speaker;
  }
  return null;
}

/** 패턴에 맞는 발화를 한 사람이 한 명뿐일 때 그 화자 (둘 다 말했으면 null) */
export function soleSpeakerMatching(segments: Seg[], pattern: RegExp): Mw | null {
  const speakers = new Set(
    segments.filter((s) => isMw(s.speaker) && pattern.test(s.text)).map((s) => s.speaker)
  );
  return speakers.size === 1 ? ([...speakers][0] as Mw) : null;
}

export function mwToPerson(sp: Mw): "남자" | "여자" {
  return sp === "M" ? "남자" : "여자";
}

export function otherMw(sp: Mw): Mw {
  return sp === "M" ? "W" : "M";
}

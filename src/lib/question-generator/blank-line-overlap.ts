import { splitWordBank, scrubWordBankNoise, lemmaEnglishToken } from "@/lib/question-generator/word-order-normalize";

/**
 * 빈칸이 든 문장에 보기 낱말이 그대로 남아 있는지 본다.
 *
 * 선생님 지적(2026-09-29): 배열 지시문에 「____________ diverse viewpoint」가 있는데
 * 보기에도 diverse·viewpoint가 있어 중복이다. 정답 문장의 일부를 빈칸 옆에 남겨 두고
 * 그 낱말을 보기에도 넣은 것이라, 학생은 같은 말을 두 번 본다. 실제 문항의 다섯에 하나가
 * 이랬다(제시어 배열 18~20%, 지정 문법 25%).
 *
 * 관사·전치사처럼 문장을 잇는 말은 겹쳐도 그만이라 내용어만 본다.
 */
const FUNCTION_WORDS = new Set(
  ("a an the and or but for of to in on at by with from as is are was were be been being " +
    "have has had do does did will would can could should may might not no so if that this " +
    "these those it its they them their there then than we you your our my his her he she i " +
    "into over under about through during before after while because when where which who what how why")
    .split(" ")
);

/** 빈칸(ⓐ______)이 들어 있는 한 문장만 잘라 낸다. 없으면 빈 문자열. */
export function sentenceAroundBlank(passage: string): string {
  const t = String(passage ?? "").replace(/\s+/g, " ");
  const at = t.search(/[ⓐ-ⓔ㉮-㉲]\s*_{3,}|_{5,}/);
  if (at < 0) return "";
  const from = Math.max(0, t.lastIndexOf(".", at) + 1);
  let to = t.indexOf(".", at);
  if (to < 0) to = t.length;
  return t.slice(from, to + 1).trim();
}

/**
 * 빈칸 문장에 그대로 남아 있는 보기 낱말을 돌려준다(없으면 빈 배열).
 * 어형이 달라도 같은 말로 본다 — improving과 improve는 한 낱말이다.
 */
export function bankWordsLeftInBlankLine(passageModified: string, bankLine: string): string[] {
  const line = sentenceAroundBlank(passageModified);
  if (!line) return [];
  const lineLemmas = new Set(
    line
      .toLowerCase()
      .replace(/[^a-z' ]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .map(lemmaEnglishToken)
  );
  const hit: string[] = [];
  for (const raw of splitWordBank(scrubWordBankNoise(bankLine))) {
    const w = raw.trim().toLowerCase();
    if (w.length <= 2 || FUNCTION_WORDS.has(w)) continue;
    const lemma = lemmaEnglishToken(w);
    if (lemma && lineLemmas.has(lemma)) hit.push(w);
  }
  return [...new Set(hit)];
}

/**
 * 빈칸을 그 문장 전체로 넓힌다.
 *
 * 선생님 지적(2026-10-01): 만들다 버린 값도 우리가 낸다. 빈칸 문장에 보기 낱말이
 * 남았다고 통째로 버리면 그 호출 값이 그대로 날아간다. 남은 낱말까지 빈칸이 삼키면
 * 되는 일이라 다시 부를 까닭이 없다.
 *
 * 넓히지 못하면 null (그때는 버린다).
 */
export function widenBlankToSentence(passageModified: string): string | null {
  const src = String(passageModified ?? "");
  const at = src.search(/[ⓐ-ⓔ㉮-㉲]\s*_{3,}|_{5,}/);
  if (at < 0) return null;
  const from = Math.max(0, src.lastIndexOf(".", at) + 1);
  let to = src.indexOf(".", at);
  to = to < 0 ? src.length : to + 1;
  const head = src.slice(0, from);
  const tail = src.slice(to);
  const mark = src.slice(at).match(/[ⓐ-ⓔ㉮-㉲]/)?.[0] ?? "ⓐ";
  const next = `${head}${head && !head.endsWith(" ") ? " " : ""}${mark}__________${tail}`;
  // 넓힌 뒤에도 빈칸이 하나여야 한다
  if ((next.match(/_{3,}/g) ?? []).length !== 1) return null;
  return next;
}

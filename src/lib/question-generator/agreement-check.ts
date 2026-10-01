/**
 * 정답을 넣어 본 뒤에도 주어–동사 수일치가 깨지는지 본다.
 *
 * 선생님 지시(2026-10-01)로 문항을 하나하나 대조하다 찾았다. 어법 수정 문항 하나가
 * 밑줄 ⓓ를 「suggests that it become」으로 고쳐도 바로 앞의 `we`와 안 맞아 여전히
 * 틀린 문장이었다(「the particular market we suggests that it become」). 정답지대로
 * 고쳐도 틀린 문항은 선생님이 채점할 수가 없다.
 *
 * 밑줄 **안**의 수일치 오류는 일부러 심은 것이라 건드리지 않는다. 걸러야 하는 것은
 * 밑줄 밖 주어와 안 맞는 경우뿐이다. 그래서 정답의 고친 말을 밑줄 자리에 넣어
 * 완성된 문장을 만든 다음에 본다 — 그러면 심은 오류는 사라지고 남는 것만 걸린다.
 *
 * 전수 확인(2026-10-01, 문항 5,696개): 이 잣대로 걸린 것은 그 한 문항뿐이었다.
 * `let it do`·`as if it were`·`what can he do`처럼 수일치와 무관한 꼴은 아래 예외로 뺀다.
 */

/** 3인칭 단수에만 쓰는 흔한 동사 */
const SINGULAR_VERBS =
  "is has does suggests seems makes needs wants tends relies becomes provides leaves comes goes says thinks knows feels looks gives takes puts keeps finds shows helps means allows requires involves consists appears happens starts stops works lives";

const PLURAL_SUBJECT = new RegExp(
  `\\b(we|they|you)\\s+(was|${SINGULAR_VERBS.split(" ").join("|")})\\b`,
  "i"
);
/** I 는 was 가 맞으므로 뺀다 */
const FIRST_PERSON = new RegExp(`\\bI\\s+(are|${SINGULAR_VERBS.split(" ").join("|")})\\b`);
const SINGULAR_SUBJECT = /\b(he|she|it)\s+(are|were|have|do)\b/i;

/**
 * 수일치가 아닌데 그렇게 보이는 꼴.
 *  · let·make·have+목적어+원형 (let it do)
 *  · 조동사 뒤 원형 (can he do)
 *  · 가정법 were (as if it were / if it were)
 *  · 도치 뒤 (Never does it have to…)
 */
const LOOKS_WRONG_BUT_FINE: RegExp[] = [
  /\b(let|make|makes|made|have|has|had|help|helps|see|sees|saw|watch|hear|heard)\s+(him|her|it|them|us|me|you)\s+\w+/i,
  /\b(can|could|will|would|shall|should|may|might|must|do|does|did)\s+(he|she|it|we|they|you|i)\b/i,
  /\b(as\s+if|as\s+though|if|wish(?:es|ed)?(?:\s+\w+)?)\s+(he|she|it)\s+were\b/i,
  /\bdoes\s+(he|she|it)\s+have\b/i,
  /*
   * 주어와 동사 사이에 전치사구가 끼어 대명사가 주어처럼 보이는 꼴.
   * 보기: 「the evidence sitting before you is …」 — 주어는 evidence다.
   *       「the responsibility before you makes …」 — 주어는 responsibility다.
   */
  /\b(before|with|for|to|of|like|than|around|behind|beside|among|between|without|about|after|near|beyond|upon)\s+(you|us|them|me|him|her|it)\s+\w+/i,
];

/** 밑줄 자리에 정답의 고친 말을 넣는다 */
export function applyFixesToPassage(
  passageModified: string,
  pairs: Array<{ mark: string; to: string }>
): string {
  let out = String(passageModified ?? "");
  for (const p of pairs) {
    if (!p.to) continue;
    const re = new RegExp(
      `${p.mark}\\s*<u>[\\s\\S]*?<\\/u>`.replace(/[.*+?^${}()|[\]\\]/g, (c) =>
        c === "\\" ? c : `\\${c}`
      )
    );
    // 기호는 그대로 두고 밑줄 안만 고친 말로 바꾼다
    out = out.replace(new RegExp(`(${p.mark})\\s*<u>[\\s\\S]*?<\\/u>`), `$1<u>${p.to}</u>`);
    void re;
  }
  return out.replace(/<\/?u>/g, "").replace(/[ⓐ-ⓖ①-⑤]/g, "");
}

/**
 * 고친 뒤에도 남는 수일치 오류를 돌려준다(없으면 null).
 * 돌려주는 값은 걸린 구절 — 버리는 까닭에 적는다.
 */
export function agreementBreakAfterFix(
  passageModified: string,
  pairs: Array<{ mark: string; to: string }>
): string | null {
  const fixed = applyFixesToPassage(passageModified, pairs);
  for (const re of [PLURAL_SUBJECT, FIRST_PERSON, SINGULAR_SUBJECT]) {
    const m = fixed.match(re);
    if (!m || m.index === undefined) continue;
    const around = fixed.slice(Math.max(0, m.index - 30), m.index + m[0].length + 10);
    if (LOOKS_WRONG_BUT_FINE.some((ok) => ok.test(around))) continue;
    return m[0];
  }
  return null;
}

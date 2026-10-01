/**
 * 맞는 것을 틀렸다고 한 어법 문항을 거른다.
 *
 * 까닭(2026-10-01, Jayden 선생님 지적): 「This capacity allows us ⓑ<u>to rehearse</u> …」에서
 * ⓑ를 「to rehearse → rehearse」로 고치라고 했다. allow는 사역동사가 아니라 목적격보어로
 * to부정사를 받으므로 원래 문장이 맞다. 정답 개수까지 하나 틀어진다.
 *
 * 저장된 문항 5,696개로 재 보았다. 넓게 잡으면 「make sure to check」·「refuse to pay」처럼
 * 다른 구문이 함께 걸려 여섯 건 가운데 다섯이 헛경보였다. 그래서 아래 세 가지를 모두
 * 만족할 때만 거른다 — 그러면 참인 한 건만 남는다.
 *   1. 밑줄 안이 「to + 동사」이고, 고친 말이 그 동사 하나(to 만 떼는 고침)
 *   2. 밑줄 앞 한두 낱말이 목적어이고, 그 앞이 to부정사를 받는 동사
 *   3. 사이에 다른 동사가 끼어 있지 않다
 */

/** 목적격보어로 to부정사를 받는 동사 (뒤의 to V 는 맞다) */
const TO_TAKING = new Set(
  (
    "allow allows allowed enable enables enabled cause causes caused force forces forced " +
    "permit permits permitted encourage encourages encouraged expect expects expected " +
    "require requires required invite invites invited remind reminds reminded " +
    "urge urges urged advise advises advised teach teaches taught"
  ).split(" ")
);

/** 목적어로 올 수 있는 말 (대명사이거나 보통명사 한 덩어리) */
const OBJECT_LIKE = /^[a-z]+$/i;

/** 사이에 끼면 안 되는 말 — 다른 동사가 지배하고 있다는 뜻 */
const BLOCKERS = new Set(
  "sure certain able likely about refuse refuses refused manage manages managed decide decides decided promise promises promised".split(
    " "
  )
);

const stripTo = (s: string) => s.trim().replace(/^to\s+/i, "").toLowerCase();

/**
 * 맞는데 틀렸다고 한 자리를 돌려준다(없으면 null). 돌려주는 값은 걸린 구절.
 */
export function falseGrammarError(
  passageModified: string,
  pairs: Array<{ mark: string; to: string }>
): string | null {
  const mod = String(passageModified ?? "");
  for (const p of pairs) {
    if (!p.mark || !p.to) continue;
    const m = mod.match(new RegExp(`${p.mark}\\s*<u>([\\s\\S]*?)</u>`));
    if (!m || m.index === undefined) continue;
    const inside = m[1]!.trim();
    // 1) 밑줄은 to + 동사, 고친 말은 그 동사 하나
    if (!/^to\s+[a-z]+$/i.test(inside)) continue;
    if (stripTo(inside) !== p.to.trim().toLowerCase()) continue;
    // 2~3) 앞 세 낱말을 본다
    const head = mod
      .slice(0, m.index)
      .replace(/<\/?u>/g, "")
      .replace(/[ⓐ-ⓖ①-⑤]/g, " ")
      .trim()
      .split(/\s+/);
    const w1 = (head[head.length - 1] ?? "").toLowerCase().replace(/[^a-z]/g, "");
    const w2 = (head[head.length - 2] ?? "").toLowerCase().replace(/[^a-z]/g, "");
    const w3 = (head[head.length - 3] ?? "").toLowerCase().replace(/[^a-z]/g, "");
    if (BLOCKERS.has(w1) || BLOCKERS.has(w2)) continue;
    // 바로 앞이 목적어이고 그 앞이 to부정사를 받는 동사
    const objThenVerb = OBJECT_LIKE.test(w1) && TO_TAKING.has(w2);
    // 목적어가 두 낱말인 경우(the students 등)
    const obj2ThenVerb = OBJECT_LIKE.test(w1) && OBJECT_LIKE.test(w2) && TO_TAKING.has(w3);
    if (!objThenVerb && !obj2ThenVerb) continue;
    const verb = objThenVerb ? w2 : w3;
    return `${verb} ... ${inside}`;
  }
  return null;
}

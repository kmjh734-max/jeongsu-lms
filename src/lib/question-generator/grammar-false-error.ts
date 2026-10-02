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
    const before = mod
      .slice(0, m.index)
      .replace(/<\/?[ub]>/g, "")
      .replace(/[ⓐ-ⓖ①-⑤]/g, " ");
    const beforeWords = before.trim().split(/\s+/);
    const prev1 = (beforeWords[beforeWords.length - 1] ?? "").toLowerCase().replace(/[^a-z']/g, "");
    const prev2 = (beforeWords[beforeWords.length - 2] ?? "").toLowerCase().replace(/[^a-z']/g, "");
    const prev3 = (beforeWords[beforeWords.length - 3] ?? "").toLowerCase().replace(/[^a-z']/g, "");
    const toWord = p.to.trim().toLowerCase();

    /*
     * 382문항 대조(2026-10-02)에서 나온 두 꼴. 둘 다 원래 문장이 문법상 맞다.
     *
     * 4) 「The objective is <u>completing</u> a grid」를 to complete로 고치라 한 것.
     *    be동사 뒤 동명사 보어는 맞는 말이다. 주어가 objective·goal·aim·purpose·plan·job·task·
     *    key·point·idea 같은 말이고 바로 앞이 be동사이면 거른다.
     */
    if (/^[a-z]+ing$/i.test(inside) && /^to\s+[a-z]+$/i.test(toWord)) {
      const base = toWord.replace(/^to\s+/, "");
      const ingOfBase = inside.toLowerCase();
      const sameVerb =
        ingOfBase === `${base}ing` || ingOfBase === `${base.replace(/e$/, "")}ing` || ingOfBase === `${base}${base.slice(-1)}ing`;
      const isBe = /^(is|are|was|were|be|been|being|'s|'re)$/.test(prev1);
      const subjectLike = /^(objective|goal|aim|purpose|plan|job|task|key|point|idea|secret|trick|answer|solution|challenge|problem|mission|role|duty|function|strategy)$/;
      if (sameVerb && isBe && (subjectLike.test(prev2) || subjectLike.test(prev3))) {
        return `${prev2} ${prev1} ${inside} (be동사 뒤 동명사 보어는 맞다)`;
      }
    }
    /*
     * 5) 「leaf-cutter ants <u>cultivated</u> their own food」를 cultivate로 고치라 한 것.
     *    규칙동사 과거형 하나를 현재형으로 바꾸는 것뿐이고, 앞에 have·had·will·since·ago·
     *    yesterday·last·연도 같은 시제 단서가 없으면 과거형도 맞는 문장이다. 시제만 다른
     *    것은 오류로 치지 않는다.
     */
    if (/^[a-z]+ed$/i.test(inside) && /^[a-z]+$/i.test(toWord)) {
      const past = inside.toLowerCase();
      const regularPast = past === `${toWord}ed` || past === `${toWord}d` || past === `${toWord.replace(/y$/, "i")}ed` || past === `${toWord}${toWord.slice(-1)}ed`;
      const tail = before.slice(-80).toLowerCase();
      const anchored = /\b(have|has|had|will|would|shall|since|ago|yesterday|last|then|once|when|after|before|until|in \d{4}|\d{4})\b/.test(tail);
      if (regularPast && !anchored) {
        return `${inside} → ${toWord} (시제만 다른 것은 오류가 아니다)`;
      }
    }
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

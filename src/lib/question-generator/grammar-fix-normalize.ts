/**
 * 어법 오류 수정 서술형: 본문 밑줄 · 정답 · 해설 정합
 */

export type GrammarFixPair = {
  mark: string;
  /** 본문에 있는(틀린) 형태 — 모를 수 있음 */
  from?: string;
  /** 바르게 고친 형태 */
  to: string;
};

const MARK_RE = "[ⓐⓑⓒⓓⓔⓕⓖ①②③④⑤]";

function norm(s: string): string {
  return s
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/[.,;:!?]/g, "");
}

/** 본문에서 ⓐ<u>…</u> / ①<u>…</u> 추출 */
export function extractUnderlinedMarks(
  passage: string
): Map<string, string> {
  const map = new Map<string, string>();
  const re = new RegExp(
    `(${MARK_RE})\\s*<u>([\\s\\S]*?)<\\/u>`,
    "gi"
  );
  let m: RegExpExecArray | null;
  while ((m = re.exec(passage))) {
    const mark = m[1]!;
    const text = m[2]!.replace(/\s+/g, " ").trim();
    if (text) map.set(mark, text);
  }
  return map;
}

/** correctAnswer: "ⓒ: keep / ⓓ: surprising" | "ⓑ: are → are / ⓒ: keep" */
export function parseGrammarFixAnswer(answer: string): GrammarFixPair[] {
  const parts = String(answer ?? "")
    .split(/\s*\/\s*|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const out: GrammarFixPair[] = [];
  const pairRe = new RegExp(
    `^(${MARK_RE})\\s*[:：]?\\s*(.+)$`
  );

  for (const part of parts) {
    const m = part.match(pairRe);
    if (!m) continue;
    const mark = m[1]!;
    let rest = m[2]!.trim();
    // strip trailing Korean notes
    rest = rest.replace(/\s*[\(（].*$/, "").trim();

    const arrow = rest.match(
      /^(.+?)\s*(?:→|->|⇒|=)\s*(.+)$/
    );
    if (arrow) {
      const from = arrow[1]!.trim();
      const to = arrow[2]!.trim();
      if (to) out.push({ mark, from, to });
    } else if (rest) {
      out.push({ mark, to: rest });
    }
  }
  return out;
}

/**
 * 해설에서 "ⓒ: keeps → keep" / "ⓒ keeps → keep" 형태 추출
 * (실제로 바뀌는 것만 = from≠to)
 */
export function parseGrammarFixExplanation(
  explanation: string
): GrammarFixPair[] {
  const out: GrammarFixPair[] = [];
  const re = new RegExp(
    `(${MARK_RE})\\s*[:：]?\\s*([A-Za-z][A-Za-z'\\- ]{0,40}?)\\s*(?:→|->|⇒)\\s*([A-Za-z][A-Za-z'\\- ]{0,40})`,
    "g"
  );
  let m: RegExpExecArray | null;
  while ((m = re.exec(explanation))) {
    const mark = m[1]!;
    const from = m[2]!.trim();
    const to = m[3]!.trim();
    if (!to) continue;
    if (norm(from) === norm(to)) continue;
    out.push({ mark, from, to });
  }
  return out;
}

/**
 * 해설이 「맞음」이라고 못박은 기호를 모은다.
 *
 * 선생님과 함께 전수조사(2026-09-29): 어법 수정 서술형 188문항 가운데 여덟 개가
 * 정답으로 적힌 기호를 해설에서는 「맞다」고 설명하고 있었다. 어법오류수정3이 8%로
 * 가장 심했고, 기호가 한 칸씩 밀린 꼴이었다. 학생이 해설을 보면 정답을 못 믿는다.
 *
 * 기호 바로 뒤 스무 자 안만 본다. 뒤에 딸린 설명에 「…가 맞습니다」가 붙어도
 * 흔들리지 않게 하려는 것이다. 「ⓐ (맞음)」·「ⓐ reactions는 맞다」·「ⓐ는 맞다」를 잡는다.
 */
export function marksDeclaredCorrect(explanation: string): Set<string> {
  const text = String(explanation ?? "");
  const out = new Set<string>();
  const re = new RegExp(MARK_RE, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const head = text.slice(m.index + 1, m.index + 21);
    if (/^[^가-힣→]{0,14}(\(맞음\)|맞음|맞다|맞습니다|는 맞|은 맞)/.test(head)) {
      out.add(m[0]!);
    }
  }
  return out;
}

function isRealChange(
  pair: GrammarFixPair,
  underlined: Map<string, string>
): boolean {
  const surface = underlined.get(pair.mark);
  const to = pair.to;
  if (!to) return false;
  // 본문 밑줄과 고친 형태가 같으면 수정이 아님
  if (surface && norm(surface) === norm(to)) return false;
  if (pair.from && norm(pair.from) === norm(to)) return false;
  return true;
}

export function formatGrammarFixAnswer(pairs: GrammarFixPair[]): string {
  return pairs.map((p) => `${p.mark}: ${p.to}`).join(" / ");
}

/**
 * 정답·해설·본문을 맞춰 실제 오류 ${wrongN}쌍만 남긴다.
 * - 해설의 A→B(실제 변경)를 우선
 * - are→are 같은 무의미 쌍 제거
 * - 본문 밑줄이 이미 정답형이면 그 기호는 오답 목록에서 제외
 */
export function reconcileGrammarFixQuestion(opts: {
  passageModified: string;
  correctAnswer: string;
  explanation: string;
  wrongN: number;
}): {
  correctAnswer: string;
  explanation: string;
  ok: boolean;
  reason?: string;
} {
  const underlined = extractUnderlinedMarks(opts.passageModified);
  const fromAnswer = parseGrammarFixAnswer(opts.correctAnswer).filter((p) =>
    isRealChange(p, underlined)
  );
  const fromExpl = parseGrammarFixExplanation(opts.explanation).filter((p) =>
    isRealChange(p, underlined)
  );

  // mark 중복 제거 (해설 우선)
  const byMark = new Map<string, GrammarFixPair>();
  for (const p of fromAnswer) byMark.set(p.mark, p);
  for (const p of fromExpl) byMark.set(p.mark, p); // expl wins

  let pairs = [...byMark.values()];

  /*
   * 해설이 「맞다」고 못박은 기호는 정답에서 뺀다. 그러고 나서 개수가 모자라면
   * 아래에서 ok:false가 되어 다시 만든다. 정답과 해설이 맞선 채로 나가는 것보다,
   * 한 번 더 만드는 쪽이 낫다.
   */
  const declaredOk = marksDeclaredCorrect(opts.explanation);
  if (declaredOk.size) {
    pairs = pairs.filter((p) => !declaredOk.has(p.mark));
  }

  // 여전히 wrongN보다 많으면 해설에 나온 순서 우선
  if (pairs.length > opts.wrongN) {
    const explOrder = fromExpl.map((p) => p.mark);
    pairs.sort((a, b) => {
      const ia = explOrder.indexOf(a.mark);
      const ib = explOrder.indexOf(b.mark);
      if (ia >= 0 && ib >= 0) return ia - ib;
      if (ia >= 0) return -1;
      if (ib >= 0) return 1;
      return a.mark.localeCompare(b.mark);
    });
    pairs = pairs.slice(0, opts.wrongN);
  }

  /*
   * 바라던 개수보다 적어도 둘 이상이면 그대로 쓴다 — 버리지 말고 고쳐 쓴다.
   *
   * 선생님 지적(2026-10-01): 만들다 버린 값도 우리가 낸다. 빠질 것 같으면 아예
   * 만들지 말든가 다 만들든가 해야 한다.
   *
   * 셋을 요구했는데 둘만 만들어 왔다고 통째로 버리면 그 호출 값이 그대로 날아간다.
   * 「모두 고르기」 문항이라 둘이어도 문항으로 성립하고, 답칸 수는 정답에서 세므로
   * 저절로 맞는다. 하나뿐이면 「모두」라는 발문과 어긋나니 그때만 버린다.
   */
  if (pairs.length < 2) {
    return {
      correctAnswer: opts.correctAnswer,
      explanation: opts.explanation,
      ok: false,
      reason: `어법 수정: 실제 오류가 ${pairs.length}개뿐 (적어도 둘은 있어야 함). 본문·정답·해설이 어긋남${declaredOk.size ? ` (해설이 ${[...declaredOk].join(" ")}를 맞다고 함)` : ""}.`,
    };
  }

  const correctAnswer = formatGrammarFixAnswer(pairs);
  const wrongMarks = new Set(pairs.map((p) => p.mark));

  // 해설 머리글(정답 요약)이 틀리기 쉬우니, 본문 해설은 유지하되
  // 틀린 기호 목록과 모순되는 "ⓑ → ⓑ"류만 정리할 수 있으면 보정
  let explanation = opts.explanation.trim();
  // 해설에 정답 기호가 하나도 언급되지 않으면 앞에 요약 한 줄 추가
  const mentionsWrong = pairs.every(
    (p) =>
      explanation.includes(p.mark) &&
      (explanation.includes(p.to) ||
        (p.from ? explanation.includes(p.from) : true))
  );
  if (!mentionsWrong) {
    const summary = pairs
      .map((p) =>
        p.from && norm(p.from) !== norm(p.to)
          ? `${p.mark}: ${p.from} → ${p.to}`
          : `${p.mark}: ${p.to}`
      )
      .join(" / ");
    explanation = `${summary}\n\n${explanation}`;
  }

  // 해설이 특정 기호를 "맞음"이라 하면서 정답에 넣은 경우 → 이미 pairs에서 제외됨
  // 반대로 해설이 틀림인데 정답에 없던 것은 expl에서 채움

  void wrongMarks;
  return { correctAnswer, explanation, ok: true };
}

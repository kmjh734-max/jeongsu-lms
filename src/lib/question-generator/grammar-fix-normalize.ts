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

  if (pairs.length < opts.wrongN) {
    return {
      correctAnswer: opts.correctAnswer,
      explanation: opts.explanation,
      ok: false,
      reason: `어법 수정: 실제 오류가 ${pairs.length}개뿐 (필요 ${opts.wrongN}개). 본문·정답·해설이 어긋남.`,
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

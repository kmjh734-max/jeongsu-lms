/**
 * 내신 지문분석지 방식으로 문장 하나를 찍는다.
 *
 * 선생님이 주신 실물 분석지 모양을 그대로 따른다.
 *  - 문장은 둥근 빨간 테두리 상자 안에 크게, 자간을 넓혀 남색으로 찍는다.
 *  - 상자 왼쪽 위에 회색 번호 딱지, 테두리 위에 걸친 알약 꼬리표(서술형 대비·빈칸 추론은
 *    오른쪽 진빨강, 주제문은 왼쪽 파랑).
 *  - 단어 아래 문장성분(S·V·O·C), 구간 괄호([부사절] 〈명사절〉 (삽입)), 구간 위 파란 이름표,
 *    설명할 자리에는 빨간 ★와 동그라미 번호, 규칙은 파란 점선 상자(상자에서 그 자리까지
 *    점선 한 줄을 올린다).
 *  - 해석 줄과 번호 설명은 상자 바깥 아래에 두고, 번호 설명은 연회색 띠 위에 놓는다.
 * 그림은 쓰지 않고 글자와 테두리로만 만든다(인쇄에서 잘리지 않게).
 */
import {
  Fragment,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import {
  buildMarkupTree,
  type AnalysisSentenceMarkup,
  type MarkupBracketKind,
  type MarkupNode,
  type MarkupRoleLevel,
  type MarkupSpan,
} from "@/lib/lesson-materials/analysis-markup";

const CIRCLED = ["①", "②", "③", "④", "⑤", "⑥"];
const CALLOUT_MARKS = ["ⓐ", "ⓑ", "ⓒ"];
/** 종속절 성분은 S¹·V¹처럼 위첨자를 붙인다(분석지 관례). */
const LEVEL_SUP = ["", "¹", "²"];
/** 테두리 오른쪽 위에 다는 꼬리표. 그 밖의 꼬리표는 주제문처럼 왼쪽에 둔다. */
const CORNER_TAGS = new Set(["서술형 대비", "빈칸 추론", "어법 빈출"]);

/** 꼬리표마다 문장에 칠하는 색. 알약의 점도 같은 색을 쓴다. */
const TAG_MARK_CLASS: Record<string, string> = {
  "빈칸 추론": "ar-hl--blank",
  "함축 의미": "ar-hl--imply",
  "어휘 추론": "ar-hl--vocab",
  "어법 빈출": "ar-hl--grammar",
};
/** 같은 줄에 놓인 이름표 사이에 두는 최소 간격(px). */
const NOTE_GAP = 11;
/** 이름표를 쌓을 수 있는 층 수. 줄 사이 여백(line-height)이 두 층까지 받쳐 준다. */
const NOTE_LEVELS = 3;
/** 형광펜으로 칠할 수 있는 최대 길이(단어). 절 전체가 노랗게 덮이면 오히려 읽히지 않는다. */
const MAX_HIGHLIGHT_WORDS = 6;

function bracketChars(kind: MarkupBracketKind): [string, string] {
  if (kind === "adverbial") return ["[", "]"];
  if (kind === "nominal") return ["〈", "〉"];
  return ["(", ")"];
}

function circled(index: number): string {
  return CIRCLED[index - 1] ?? `(${index})`;
}

/** 형광펜 구간과 겹치는 글자만 덧칠해 내보낸다(구간 괄호·성분과 상관없이 글자 단위로 칠한다). */
/** 문장 안에서 칠할 자리. 꼬리표가 가리키는 곳마다 다른 색으로 칠한다. */
type Mark = { span: MarkupSpan; cls: string };

/**
 * 직독직해 뜻을 달 자리. 덩어리 시작 좌표 → 뜻.
 * 선생님 요청(2026-09-17): 직독직해를 아래에 따로 떼지 말고 본문에, 덩어리 바로 아래에 한글 뜻을.
 * 조각은 원문을 공백만 빼고 그대로 이은 것이라(verifiedChunks) 공백을 건너뛰며 글자를 세면 좌표가 나온다.
 */
type Glosses = Map<number, string>;

function chunkGlosses(markup: AnalysisSentenceMarkup): Glosses | null {
  const chunks = markup.chunks;
  if (!chunks?.length) return null;
  const text = markup.text;
  const out: Glosses = new Map();
  let i = 0;
  for (const c of chunks) {
    let start = -1;
    for (const ch of c.en) {
      if (/\s/.test(ch)) continue;
      while (i < text.length && /\s/.test(text[i]!)) i++;
      if (i >= text.length) return null;
      if (start < 0) start = i;
      i++;
    }
    if (start >= 0 && c.ko.trim()) out.set(start, c.ko.trim());
  }
  return out;
}

/**
 * 덩어리 첫 낱말 앞에 폭 0 닻을 두고 뜻을 그 아래(문장성분 표시 밑)에 띄운다.
 * 닻과 첫 낱말은 줄에서 떨어지지 않게 묶는다(닻만 앞줄 끝에 남으면 뜻이 엉뚱한 줄에 붙는다).
 */
function renderText(
  text: string,
  at: number,
  marks: Mark[],
  glosses: Glosses | null
): ReactNode {
  const cuts = glosses
    ? [...glosses.keys()].filter((b) => b >= at && b < at + text.length).sort((a, b) => a - b)
    : [];
  if (cuts.length === 0) return renderMarked(text, at, marks);
  const out: ReactNode[] = [];
  let cur = at;
  for (const b of cuts) {
    if (b < cur) continue;
    if (b > cur) {
      out.push(<Fragment key={`t${b}`}>{renderMarked(text.slice(cur - at, b - at), cur, marks)}</Fragment>);
    }
    const rest = text.slice(b - at);
    const wordLen = rest.search(/\s/) < 0 ? rest.length : rest.search(/\s/);
    const wordEnd = b + wordLen;
    out.push(
      <span key={`g${b}`} className="ar-gloss-start">
        <span className="ar-gloss-anchor">
          <span className="ar-gloss">{glosses!.get(b)}</span>
        </span>
        {renderMarked(text.slice(b - at, wordEnd - at), b, marks)}
      </span>
    );
    cur = wordEnd;
  }
  if (cur < at + text.length) {
    out.push(<Fragment key="tail">{renderMarked(text.slice(cur - at), cur, marks)}</Fragment>);
  }
  return <>{out}</>;
}

function renderMarked(text: string, at: number, marks: Mark[]): ReactNode {
  const hits = marks
    .map((m) => ({
      cls: m.cls,
      from: Math.max(at, m.span.start),
      to: Math.min(at + text.length, m.span.end),
    }))
    .filter((h) => h.to > h.from)
    .sort((a, b) => a.from - b.from);
  if (hits.length === 0) return text;
  const out: ReactNode[] = [];
  let cur = at;
  hits.forEach((h, i) => {
    if (h.from < cur) return;
    if (h.from > cur) out.push(text.slice(cur - at, h.from - at));
    out.push(
      <span key={`m${i}`} className={h.cls}>
        {text.slice(h.from - at, h.to - at)}
      </span>
    );
    cur = h.to;
  });
  if (cur < at + text.length) out.push(text.slice(cur - at));
  return <>{out}</>;
}

function renderNodes(
  nodes: MarkupNode[],
  marks: Mark[],
  glosses: Glosses | null = null
): ReactNode {
  return nodes.map((node, i) => {
    if (node.kind === "text") {
      return <Fragment key={i}>{renderText(node.text, node.at, marks, glosses)}</Fragment>;
    }

    // 끼워 넣는 표시: 이름표는 줄 사이 여백에 띄우고, 번호·상자 꼬리표는 그 자리에 찍는다.
    if (node.kind === "marker") {
      return (
        <Fragment key={i}>
          {node.notes.map((n, ni) => (
            <span key={`n${ni}`} className="ar-note-anchor">
              <span className="ar-note">
                {n.label}
                {n.gloss ? <span className="ar-note-gloss"> {n.gloss}</span> : null}
              </span>
            </span>
          ))}
          {node.points.map((p) => (
            <span key={`p${p.index}`} className="ar-pt-mark">
              {p.star ? <span className="ar-star">★</span> : null}
              {circled(p.index)}
            </span>
          ))}
          {node.calloutIndexes.map((ci) => (
            <span key={`c${ci}`} className="ar-callout-ref" data-callout-ref={ci}>
              {CALLOUT_MARKS[ci] ?? "◦"}
            </span>
          ))}
        </Fragment>
      );
    }

    const { deco } = node;
    const inner = renderNodes(node.children, marks, glosses);
    const [open, close] = deco.bracket ? bracketChars(deco.bracket) : ["", ""];

    const body = deco.role ? (
      <span className="ar-role-wrap">
        <span className="ar-role-text">{inner}</span>
        <span className={`ar-role-tag ar-role-tag--l${deco.role.level}`}>
          {deco.role.code}
          {LEVEL_SUP[deco.role.level as MarkupRoleLevel]}
        </span>
      </span>
    ) : (
      inner
    );

    return (
      <span key={i} className="ar-seg">
        {open ? (
          <span className={`ar-bracket ar-bracket--${deco.bracket}`}>{open}</span>
        ) : null}
        {body}
        {close ? (
          <span className={`ar-bracket ar-bracket--${deco.bracket}`}>{close}</span>
        ) : null}
      </span>
    );
  });
}

/**
 * 자리를 잡은 뒤 손봐야 하는 두 가지.
 *  1) 줄 사이에 띄운 이름표가 글상자 밖으로 나가면 인쇄에서 잘리고, 같은 줄에서 서로 겹치면
 *     둘 다 읽히지 않는다. 앞 이름표 오른쪽으로 밀고, 오른쪽으로 넘치면 넘친 만큼 되민다.
 *  2) 점선 상자에서 그 상자가 가리키는 자리까지 점선 한 줄을 올린다. 그 자리의 x는 줄바꿈에
 *     따라 달라지므로 재서 넣는다.
 * 어느 줄의 어디에 놓일지는 CSS만으로 알 수 없어 자리를 잡은 뒤에 한다.
 */
function useMarkupLayout(
  sentenceRef: React.RefObject<HTMLParagraphElement | null>,
  frameRef: React.RefObject<HTMLDivElement | null>
) {
  useLayoutEffect(() => {
    const box = sentenceRef.current;
    if (!box) return;
    const bounds = box.getBoundingClientRect();
    if (bounds.width <= 0) return;

    const notes = Array.from(box.querySelectorAll<HTMLElement>(".ar-note"));
    for (const el of notes) el.style.transform = "";
    /*
     * 이름표 자리 잡기. 예전에는 이름표의 세로 위치를 4px 단위로 반올림해 "같은 줄"을 갈랐는데,
     * 나란한 이름표끼리도 1~2px씩 달라 서로 다른 줄로 잡히는 바람에 그대로 겹쳐 찍혔다
     * (선생님 지적 2026-09-17: "이렇게 겹치게 나오는 게 있어").
     * 이제는 이미 놓은 이름표와 실제로 겹치는지 직접 재고, 겹치면 오른쪽으로 밀고,
     * 그래도 안 되면 한 층 위로 올린다.
     */
    type Box = { left: number; right: number; top: number; bottom: number };
    const placed: Box[] = [];
    const hits = (a: Box, b: Box) =>
      a.left < b.right + NOTE_GAP && b.left < a.right + NOTE_GAP && a.top < b.bottom - 1 && b.top < a.bottom - 1;

    for (const el of notes) {
      const rect = el.getBoundingClientRect();
      const height = rect.height || 11;
      let best: { shift: number; lift: number; box: Box } | null = null;

      for (let level = 0; level < NOTE_LEVELS && !best; level++) {
        const lift = -height * level;
        const top = rect.top + lift;
        const bottom = rect.bottom + lift;
        // 이 층에서 이미 놓인 것들을 피해 오른쪽으로 민다
        let shift = 0;
        for (let guard = 0; guard < notes.length + 2; guard++) {
          const cand: Box = { left: rect.left + shift, right: rect.right + shift, top, bottom };
          const clash = placed.find((p) => hits(cand, p));
          if (!clash) {
            if (cand.right <= bounds.right) best = { shift, lift, box: cand };
            break;
          }
          shift = clash.right + NOTE_GAP - rect.left;
          if (rect.right + shift > bounds.right) break;
        }
      }

      if (!best) {
        // 어느 층에도 못 넣으면 맨 위층에서 오른쪽 끝에 맞춘다(그래도 아래층과는 떨어진다)
        const lift = -height * (NOTE_LEVELS - 1);
        const shift = Math.min(0, bounds.right - rect.right);
        best = {
          shift,
          lift,
          box: { left: rect.left + shift, right: rect.right + shift, top: rect.top + lift, bottom: rect.bottom + lift },
        };
      }

      if (Math.abs(best.shift) >= 1 || best.lift !== 0) {
        el.style.transform = `translate(${Math.round(best.shift)}px, ${Math.round(best.lift)}px)`;
      }
      placed.push(best.box);
    }

    /*
     * 직독직해 뜻: 앞 뜻이 길어 같은 줄의 다음 뜻과 겹치면 오른쪽으로 민다.
     * 글상자 오른쪽 끝을 넘으면 넘친 만큼 왼쪽으로 되민다.
     */
    const glossEls = Array.from(box.querySelectorAll<HTMLElement>(".ar-gloss"));
    for (const el of glossEls) el.style.transform = "";
    let prev: { right: number; top: number } | null = null;
    for (const el of glossEls) {
      const r = el.getBoundingClientRect();
      let shift = 0;
      if (prev && Math.abs(prev.top - r.top) < 4 && r.left < prev.right + 6) {
        shift = prev.right + 6 - r.left;
      }
      if (r.right + shift > bounds.right) shift = bounds.right - r.right;
      if (Math.abs(shift) >= 1) el.style.transform = `translateX(${Math.round(shift)}px)`;
      prev = { right: r.right + shift, top: r.top };
    }

    const frame = frameRef.current;
    if (!frame) return;
    for (const stem of Array.from(frame.querySelectorAll<HTMLElement>(".ar-callout"))) {
      const ci = stem.dataset.callout;
      const anchor = box.querySelector<HTMLElement>(`[data-callout-ref="${ci}"]`);
      if (!anchor) {
        stem.style.removeProperty("--ar-stem-x");
        stem.style.removeProperty("--ar-stem-h");
        continue;
      }
      const a = anchor.getBoundingClientRect();
      const b = stem.getBoundingClientRect();
      const x = Math.round(a.left + a.width / 2 - b.left);
      const h = Math.round(b.top - a.bottom);
      if (x > 4 && x < b.width - 4 && h > 2 && h < 90) {
        stem.style.setProperty("--ar-stem-x", `${x}px`);
        stem.style.setProperty("--ar-stem-h", `${h}px`);
      } else {
        stem.style.removeProperty("--ar-stem-x");
        stem.style.removeProperty("--ar-stem-h");
      }
    }
  });
}

export function AnalysisMarkupSentence({
  markup,
  index,
  showHead = true,
  pointsFrom = 0,
  pointsTo,
  extraNote,
  translationMode = "full",
}: {
  markup: AnalysisSentenceMarkup;
  /** 전체 해석 / 직독직해. 직독직해 조각이 없으면 전체 해석으로 나간다. */
  translationMode?: "full" | "chunk";
  /** 예전 분석서의 추가 설명(부연설명). 설명 아래에 이어 붙인다. */
  extraNote?: string;
  /** 테두리 문장과 해석을 이 쪽에 찍을지. 설명만 다음 쪽으로 이어질 때 false. */
  showHead?: boolean;
  /** 이 쪽에 찍을 번호 설명의 범위 */
  pointsFrom?: number;
  pointsTo?: number;
  /** 문장 번호(0부터). 화면에는 1부터 찍는다. */
  index: number;
}) {
  const tree = buildMarkupTree(markup);
  const glosses = translationMode === "chunk" ? chunkGlosses(markup) : null;
  const sentenceRef = useRef<HTMLParagraphElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  useMarkupLayout(sentenceRef, frameRef);

  /*
   * 꼬리표가 가리키는 자리를 문장에 칠한다. 선생님 지적: "함축 의미 추론으로 나올 만한
   * 문장이면 어디가 그런 건지 표시를 해 주던가. 빈칸 추론도 마찬가지고."
   * 꼬리표마다 색이 다르고, 테두리 위 알약에도 같은 색 점을 찍어 어느 꼬리표인지 잇는다.
   * 자리를 받지 못한 예전 분석서는 예전처럼 ★ 번호 자리를 칠한다.
   */
  const marks: Mark[] = [];
  for (const ts of markup.tagSpans ?? []) {
    const words = markup.text.slice(ts.span.start, ts.span.end).split(/\s+/).length;
    if (words > MAX_HIGHLIGHT_WORDS) continue;
    marks.push({ span: ts.span, cls: `ar-hl ${TAG_MARK_CLASS[ts.tag] ?? ""}`.trim() });
  }
  if (marks.length === 0 && markup.tags.includes("빈칸 추론") && markup.points.length > 0) {
    const span = (markup.points.find((p) => p.star) ?? markup.points[0])!.span;
    if (markup.text.slice(span.start, span.end).split(/\s+/).length <= MAX_HIGHLIGHT_WORDS) {
      marks.push({ span, cls: "ar-hl ar-hl--blank" });
    }
  }

  // 쪽을 채우려고 설명은 항목 단위로 다음 쪽에 이어 붙는다
  const shownPoints = markup.points.slice(
    pointsFrom,
    pointsTo === undefined ? markup.points.length : pointsTo
  );
  // 설명이 다음 쪽으로 이어질 때는 마지막 조각에만 부연 설명을 붙인다
  const showLastSlice =
    pointsTo === undefined || pointsTo >= markup.points.length;

  const cornerTags = markup.tags.filter((t) => CORNER_TAGS.has(t));
  const leadTags = markup.tags.filter((t) => !CORNER_TAGS.has(t));

  return (
    <section data-analysis-block={`s-${index}`} className="ar-block">
      {showHead ? (
      <div data-analysis-part={`s-${index}-head`}>
      <div className="ar-frame" ref={frameRef}>
        {leadTags.length > 0 ? (
          <span className="ar-tags ar-tags--lead">
            {leadTags.map((t) => (
              <span key={t} className="ar-tag ar-tag--lead">
                {TAG_MARK_CLASS[t] && marks.some((m) => m.cls.includes(TAG_MARK_CLASS[t]!)) ? (
                  <i className={`ar-tag-dot ${TAG_MARK_CLASS[t]}`} />
                ) : null}
                {t}
              </span>
            ))}
          </span>
        ) : null}
        {cornerTags.length > 0 ? (
          <span className="ar-tags ar-tags--corner">
            {cornerTags.map((t) => (
              <span key={t} className="ar-tag ar-tag--corner">
                {TAG_MARK_CLASS[t] && marks.some((m) => m.cls.includes(TAG_MARK_CLASS[t]!)) ? (
                  <i className={`ar-tag-dot ${TAG_MARK_CLASS[t]}`} />
                ) : null}
                {t}
              </span>
            ))}
          </span>
        ) : null}

        <p className={`ar-sentence${glosses ? " ar-sentence--chunk" : ""}`} ref={sentenceRef}>
          <span className="ar-no">{String(index + 1).padStart(2, "0")}</span>
          {renderNodes(tree, marks, glosses)}
        </p>

        {markup.callouts.map((c, ci) => (
          <div key={ci} className="ar-callout" data-callout={ci}>
            <p className="ar-callout-head">
              <span className="ar-callout-mark">{CALLOUT_MARKS[ci] ?? "◦"}</span>
              <span className="ar-callout-anchor">
                {markup.text.slice(c.span.start, c.span.end)}
              </span>
            </p>
            <p className="ar-callout-title">{c.title}</p>
            <p className="ar-callout-body">{c.body}</p>
          </div>
        ))}
      </div>

      {glosses ? null : markup.translation ? (
        <p className="ar-trans">
          <span className="ar-trans-key">해석</span>
          {markup.translation}
        </p>
      ) : null}
      </div>
      ) : null}

      {shownPoints.length > 0 ? (
        <ol className="ar-points">
          {shownPoints.map((p, pi) => (
            <li
              key={p.index}
              data-analysis-part={`s-${index}-p-${pointsFrom + pi}`}
              className="ar-point"
            >
              <span className="ar-point-mark">{circled(p.index)}</span>
              <span className="ar-point-body">
                {/* 설명 머리의 ★는 실물 분석지처럼 번호마다 붙인다(문장 안 ★는 중요한 자리에만). */}
                <span className="ar-star">★</span>
                <span className="ar-point-label">{p.label}</span>
                <span className="ar-point-text">{p.explanation}</span>
                {p.rewrite ? (
                  <span className="ar-point-rewrite">{p.rewrite}</span>
                ) : null}
              </span>
            </li>
          ))}
        </ol>
      ) : null}

      {showHead
        ? (markup.tagSpans ?? [])
            .filter((t) => t.tag === "함축 의미" && t.paraphrase)
            .map((t, i) => (
              <p key={`imp${i}`} className="ar-imply">
                <span className="ar-imply-key">함축 의미</span>
                <span className="ar-imply-src">
                  {markup.text.slice(t.span.start, t.span.end)}
                </span>
                <span className="ar-imply-arrow">→</span>
                {t.paraphrase}
              </p>
            ))
        : null}

      {extraNote && showLastSlice ? (
        <p className="ar-extra">
          <span className="ar-extra-key">부연 설명</span>
          {extraNote}
        </p>
      ) : null}
    </section>
  );
}

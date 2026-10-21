"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import {
  BOOK_COVER_FONTS_HREF,
  BOOK_COVER_PALETTES,
  BOOK_COVER_PAPERS,
  BOOK_COVER_STYLES,
  bookCoverPalette,
  coverTitle,
  examLine,
  examWord,
  gradeAccent,
  gradeNumber,
  type BookCoverSeriesDesign,
  type BookCoverSpec,
  type BookCoverStyle,
} from "@/lib/lesson-materials/book-cover";
import "./book-cover.css";

/**
 * 학교 시험 대비 교재 앞표지(book-cover.ts). 판형은 A4·B5를 받는다.
 * 모든 치수는 A4 기준 mm에 --s(판 폭 ÷ 210)를 곱해 쓰므로 B5에서도 비율이 그대로다.
 * 위쪽 요소는 top, 아래쪽 요소는 bottom에 붙여서 판의 세로 비율이 달라도 아래가 잘리지 않는다.
 *
 * 제목과 큰 영문은 글꼴이 들어온 뒤 실제로 재서 칸·판 안에 들 때까지 줄인다.
 * 다 맞추면 뿌리에 data-cover-ready="1"이 붙는다 — 인쇄·PDF는 이것을 기다린다.
 */

type CoverProps = {
  spec: BookCoverSpec;
  design: BookCoverSeriesDesign;
  logoSrc?: string | null;
};

function lines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

/**
 * 제목 맞추기. 칸(box)과 제목(text)을 받아, 시안 크기(maxMm)에서 0.5mm씩 줄이며 제목이 칸의
 * 높이·폭 안에 드는 첫 크기를 쓴다. 세로쓰기 제목도 같은 방법으로 잰다. 재는 동안은 낱말
 * 가운데서 끊지 않고(「서울국제고등 / 학교」 방지), 하한까지 줄여도 넘칠 때만 끊는다.
 */
function useFitTitle(maxMm: number, minMm: number, key: string) {
  const box = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLHeadingElement>(null);
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    let alive = true;
    const fit = () => {
      const b = box.current;
      const t = text.current;
      if (!b || !t || !alive) return;
      // 칸 높이는 max-height가 있으면 그것(칸이 내용만큼 줄어드는 경우). 가로쓰기 제목은 차지하는
      // 높이(offsetHeight)로 잰다 — 한글 글꼴의 글자 몸통이 줄 간격보다 커서 scrollHeight는 늘
      // 몇 px 크다. 세로쓰기는 긴 낱말이 아래로 넘치는 것을 scrollHeight로만 알 수 있다.
      const maxH = parseFloat(getComputedStyle(b).maxHeight);
      const limit = Number.isFinite(maxH) ? maxH : b.clientHeight;
      const vertical = getComputedStyle(t).writingMode.startsWith("vertical");
      const fits = () =>
        (vertical ? t.scrollHeight : t.offsetHeight) <= limit + 0.5 && t.scrollWidth <= b.clientWidth + 0.5;
      t.style.overflowWrap = "normal";
      let size = maxMm;
      for (; size > minMm; size -= 0.5) {
        t.style.fontSize = `calc(${size}mm * var(--s))`;
        if (fits()) break;
      }
      t.style.fontSize = `calc(${Math.max(size, minMm)}mm * var(--s))`;
      if (!fits()) t.style.overflowWrap = "anywhere";
      setReady(true);
    };
    setReady(false);
    fit();
    if (typeof document !== "undefined" && document.fonts) void document.fonts.ready.then(fit);
    return () => {
      alive = false;
    };
  }, [maxMm, minMm, key]);
  return { box, text, ready };
}

function Title({ title }: { title: string }) {
  const rows = lines(title);
  return (
    <>
      {(rows.length ? rows : ["교재명"]).map((l, i) => (
        <span key={i} className="bk-line">
          {l}
        </span>
      ))}
    </>
  );
}

/** 특장점 목록. 비면 아무것도 그리지 않는다. */
function Points({ text, className }: { text: string; className: string }) {
  const rows = lines(text);
  if (!rows.length) return null;
  return (
    <ul className={className}>
      {rows.map((l, i) => (
        <li key={i}>{l}</li>
      ))}
    </ul>
  );
}

/** 브랜드 자리: 로고가 있으면 이미지, 없거나 깨지면 이름을 글자로 짠다(대신 넣는 아이콘은 없다). */
function Brand({ name, logoSrc, className }: { name: string; logoSrc?: string | null; className: string }) {
  const url = (logoSrc ?? "").trim();
  const [broken, setBroken] = useState("");
  if (url && broken !== url) {
    return (
      // 외부(스토리지) 주소가 대부분이고 인쇄용이라 next/image를 쓰지 않는다.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt={name} className={`${className} bk-logo`} onError={() => setBroken(url)} />
    );
  }
  return name ? <span className={className}>{name}</span> : null;
}

/**
 * 큰 영문 맞추기. 기울인(-8°) 낱말이 판 폭 안에 통째로 들 때까지 줄인다 — 「Midterm」이
 * 「Midterr」로 잘리던 것. 기울인 낱말이 차지하는 폭은 w·cos8° + h·sin8°로 잰다.
 */
const WORD_TILT = (8 * Math.PI) / 180;

function useFitWord(maxMm: number, minMm: number, rightMm: number, key: string) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    let alive = true;
    const fit = () => {
      const el = ref.current;
      const sheet = el?.parentElement;
      if (!el || !sheet || !alive) return;
      const s = parseFloat(getComputedStyle(el).getPropertyValue("--s")) || 1;
      const avail = sheet.clientWidth - el.offsetLeft - (rightMm * s * 96) / 25.4;
      const span = () => el.offsetWidth * Math.cos(WORD_TILT) + el.offsetHeight * Math.sin(WORD_TILT);
      let size = maxMm;
      for (; size > minMm; size -= 0.5) {
        el.style.fontSize = `calc(${size}mm * var(--s))`;
        if (span() <= avail) break;
      }
      el.style.fontSize = `calc(${Math.max(size, minMm)}mm * var(--s))`;
      setReady(true);
    };
    setReady(false);
    fit();
    if (typeof document !== "undefined" && document.fonts) void document.fonts.ready.then(fit);
    return () => {
      alive = false;
    };
  }, [maxMm, minMm, rightMm, key]);
  return { ref, ready };
}

/** "기말고사 대비 통합 테스트북" — 시험과 자료 종류를 한 줄로 */
function materialLine(spec: BookCoverSpec): string {
  const exam = spec.exam.trim();
  return [exam ? `${exam} 대비` : "", spec.material.trim()].filter(Boolean).join(" ");
}

/* ──────────────── C. 프리미엄 (D 큰 숫자 · E 분할 · F 밝은 판도 이 판에서 갈라진다) ────────────────
 * 짙은 바탕. 왼쪽 위 시리즈 띠 → 굵은 학교 · 학년 → 시험 · 자료 종류(강조색). 오른쪽 끝에 세로로
 * 연도 · 학기 · 시험. 가운데에 시험 영문을 크게 기울인 세리프로 놓되 판 안에 통째로 넣는다.
 * 아래는 기출문제집처럼 정보 띠 하나: 교과서 · 출판사 | 큰 학년 숫자 + 학기 · 시험 | 범위. */
function PremiumCover({ spec, design, logoSrc }: CoverProps) {
  const pal = bookCoverPalette(design.style, design.paletteId);
  const accent = gradeAccent(pal, spec.grade);
  const num = gradeNumber(spec.grade);
  // D 큰 숫자: 학년을 숫자로 읽을 때만 — 못 읽으면 C처럼 시험 영문이 그림이 된다.
  const bigNum = design.style === "numeral" && num != null;
  // 학교 이름이 길면(여섯 자 넘게) 학교 / 학년 두 줄로 — 한 줄에 몰면 글자가 너무 작아진다.
  const title = Array.from(spec.school.trim()).length > 5 ? coverTitle(spec).replace(" ", "\n") : coverTitle(spec);
  const fit = useFitTitle(30, 10, `${title}|${design.paper}`);
  const word = examWord(spec);
  const wordFit = useFitWord(bigNum ? 30 : 76, bigNum ? 12 : 24, 10, `${word}|${design.paper}|${bigNum}`);
  const sub = materialLine(spec);
  const exam = examLine(spec);
  const vars = { "--ink": pal.ink, "--muted": pal.muted, "--accent": accent, "--bk-bg": pal.bg, background: pal.bg } as CSSProperties;
  const hasBand = Boolean(spec.textbook || spec.publisher || num != null || spec.range);
  return (
    <div className={`bk bk-c bk-c--${design.style}`} style={vars} data-cover-ready={fit.ready && wordFit.ready ? "1" : "0"}>
      {design.style === "split" ? <div className="bk-c-panel" aria-hidden /> : null}
      <div className="bk-c-head">
        {spec.series ? <p className="bk-c-series">{spec.series}</p> : null}
        <div className="bk-c-titlebox" ref={fit.box}>
          <h1 className="bk-c-title" ref={fit.text}>
            <Title title={title} />
          </h1>
        </div>
        {sub ? <p className="bk-c-sub">{sub}</p> : null}
        {bigNum ? (
          <p className="bk-c-word bk-c-word--small" ref={wordFit.ref} aria-hidden>
            {word}
          </p>
        ) : null}
      </div>
      {exam ? <p className="bk-c-tag">{exam} 대비</p> : null}
      {bigNum ? (
        <p className="bk-c-bignum" aria-label={`${num}학년`}>
          {num}
          <small>학년</small>
        </p>
      ) : (
        <p className="bk-c-word" ref={wordFit.ref} aria-hidden>
          {word}
        </p>
      )}
      <div className="bk-c-bottom">
        {hasBand ? (
          <div className="bk-c-band">
            {spec.textbook || spec.publisher ? (
              <div className="bk-c-cell">
                <span className="bk-c-k">교과서</span>
                {spec.textbook ? <span className="bk-c-v">{spec.textbook}</span> : null}
                {spec.publisher ? <span className="bk-c-p">{spec.publisher}</span> : null}
              </div>
            ) : null}
            <div className="bk-c-cell bk-c-gradecell">
              {num != null && !bigNum ? <span className="bk-c-num">{num}</span> : null}
              <span className="bk-c-stack">
                <span>{num != null && !bigNum ? spec.semester : [bigNum ? `${num}학년` : spec.grade, spec.semester].filter(Boolean).join(" ")}</span>
                <span>{spec.exam}</span>
              </span>
            </div>
            {spec.range ? (
              <div className="bk-c-cell">
                <span className="bk-c-k">범위</span>
                <span className="bk-c-v bk-c-range">{spec.range}</span>
              </div>
            ) : null}
          </div>
        ) : null}
        <div className="bk-c-foot">
          <Points text={spec.points} className="bk-c-points" />
          <Brand name={spec.brand} logoSrc={logoSrc} className="bk-c-brand" />
        </div>
      </div>
    </div>
  );
}

/** 앞표지 한 장. 바깥 크기는 판형 그대로(mm)이고 인쇄에서 배경색까지 찍힌다. */
export function BookCover({ spec, design, logoSrc }: CoverProps) {
  const paper = BOOK_COVER_PAPERS[design.paper];
  const style = {
    width: `${paper.widthMm}mm`,
    height: `${paper.heightMm}mm`,
    "--s": String(paper.widthMm / 210),
  } as CSSProperties;
  return (
    <article className={`bk-sheet bk-paper-${design.paper.toLowerCase()}`} style={style}>
      <link rel="stylesheet" href={BOOK_COVER_FONTS_HREF} />
      <PremiumCover spec={spec} design={design} logoSrc={logoSrc} />
    </article>
  );
}

/** 작은 미리보기. 판 크기 그대로 그린 뒤 줄인다(글자 맞추기도 실제 크기로 한다). */
export function BookCoverThumb({
  spec,
  design,
  widthPx,
  logoSrc,
}: CoverProps & { widthPx: number }) {
  const paper = BOOK_COVER_PAPERS[design.paper];
  const fullPx = (paper.widthMm / 25.4) * 96;
  const scale = widthPx / fullPx;
  return (
    <div
      className="pointer-events-none relative overflow-hidden"
      style={{ width: widthPx, height: widthPx * (paper.heightMm / paper.widthMm) }}
    >
      <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: `${paper.widthMm}mm` }}>
        <BookCover spec={spec} design={design} logoSrc={logoSrc} />
      </div>
    </div>
  );
}

/**
 * 시안 비교판: 스타일 셋 × 배색 넷을 한꺼번에 보이고, 누르면 그 판을 고른다.
 * 고른 판은 같은 시리즈 교재가 함께 쓴다(BookCoverSeriesDesign).
 */
export function BookCoverCompare({
  spec,
  value,
  onChange,
  logoSrc,
  widthPx = 132,
}: {
  spec: BookCoverSpec;
  value: BookCoverSeriesDesign;
  onChange: (next: BookCoverSeriesDesign) => void;
  logoSrc?: string | null;
  widthPx?: number;
}) {
  return (
    <div className="space-y-4">
      {BOOK_COVER_STYLES.map((s) => (
        <section key={s.id} className="space-y-1.5">
          <p className="text-xs font-bold text-slate-700">
            {s.name} <span className="font-normal text-slate-400">{s.description}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {BOOK_COVER_PALETTES[s.id as BookCoverStyle].map((p) => {
              const on = value.style === s.id && value.paletteId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onChange({ ...value, style: s.id, paletteId: p.id })}
                  className={`overflow-hidden rounded-md border-2 bg-white text-left transition ${
                    on ? "border-violet-600 shadow-md" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <BookCoverThumb spec={spec} design={{ ...value, style: s.id, paletteId: p.id }} widthPx={widthPx} logoSrc={logoSrc} />
                  <p className="truncate px-1.5 py-1 text-[11px] font-bold text-slate-700">{p.name}</p>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

/** 같은 시리즈를 학년별로 나란히 — 한 줄로 꽂혔을 때 한 묶음으로 보이는지 확인한다. */
export function BookCoverSeriesStrip({
  spec,
  design,
  grades,
  logoSrc,
  widthPx = 160,
}: {
  spec: BookCoverSpec;
  design: BookCoverSeriesDesign;
  grades: string[];
  logoSrc?: string | null;
  widthPx?: number;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {grades.map((g) => (
        <BookCoverThumb key={g} spec={{ ...spec, grade: g }} design={design} widthPx={widthPx} logoSrc={logoSrc} />
      ))}
    </div>
  );
}

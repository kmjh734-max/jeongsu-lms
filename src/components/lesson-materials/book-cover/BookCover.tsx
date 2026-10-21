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

/**
 * 브랜드 자리: 로고가 있으면 흰 판 위에, 없거나 깨지면 이름을 글자로 짠다(대신 넣는 아이콘은 없다).
 * 학원 로고는 대부분 흰 바탕이 붙은 JPG이거나 짙은 글씨의 투명 PNG라, 짙은 표지에 그대로 얹으면
 * 흰 네모가 튀거나 안 보인다 — 출판사 마크처럼 작은 흰 판에 올린다(선생님 2026-10-22).
 */
function Brand({ name, logoSrc, className }: { name: string; logoSrc?: string | null; className: string }) {
  const url = (logoSrc ?? "").trim();
  const [broken, setBroken] = useState("");
  if (url && broken !== url) {
    return (
      <span className={`bk-plate ${className}-plate`}>
        {/* 외부(스토리지) 주소가 대부분이고 인쇄용이라 next/image를 쓰지 않는다. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={name} className={`${className} bk-logo`} onError={() => setBroken(url)} />
      </span>
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

/** 정보 띠(C와 같은 칸): 교과서 · 출판사 | 학년 숫자 + 학기 · 시험 | 범위. 흰 카드 안에서도 쓴다. */
function InfoBand({ spec }: { spec: BookCoverSpec }) {
  const num = gradeNumber(spec.grade);
  if (!(spec.textbook || spec.publisher || num != null || spec.range)) return null;
  return (
    <div className="bk-c-band">
      {spec.textbook || spec.publisher ? (
        <div className="bk-c-cell">
          <span className="bk-c-k">교과서</span>
          {spec.textbook ? <span className="bk-c-v">{spec.textbook}</span> : null}
          {spec.publisher ? <span className="bk-c-p">{spec.publisher}</span> : null}
        </div>
      ) : null}
      <div className="bk-c-cell bk-c-gradecell">
        {num != null ? <span className="bk-c-num">{num}</span> : null}
        <span className="bk-c-stack">
          <span>{num != null ? spec.semester : [spec.grade, spec.semester].filter(Boolean).join(" ")}</span>
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
  );
}

/**
 * 칸 맞추기: 글자(el)가 감싼 칸(부모) 안에 폭 · 높이(axis "width"면 폭만) 들 때까지 maxMm에서 0.5mm씩 줄인다.
 * 판 폭을 꽉 채우는 영문 · 세로로 세운 영문처럼 「칸에 맞춰 크게」 쓰는 글자에 쓴다.
 */
function useFitBox(maxMm: number, minMm: number, key: string, axis: "both" | "width" = "both") {
  const ref = useRef<HTMLParagraphElement>(null);
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    let alive = true;
    const fit = () => {
      const el = ref.current;
      const box = el?.parentElement;
      if (!el || !box || !alive) return;
      const fits = () =>
        el.scrollWidth <= box.clientWidth + 0.5 && (axis === "width" || el.scrollHeight <= box.clientHeight + 0.5);
      let size = maxMm;
      for (; size > minMm; size -= 0.5) {
        el.style.fontSize = `calc(${size}mm * var(--s))`;
        if (fits()) break;
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
  }, [maxMm, minMm, key, axis]);
  return { ref, ready };
}

/** 시험 이름을 두 줄로(「기말고사」 → 기말 / 고사, 「3월 모의고사」 → 3월 / 모의고사). */
function examRows(exam: string): string[] {
  const t = exam.trim();
  if (!t) return [];
  if (/\s/.test(t)) return t.split(/\s+/).slice(0, 3);
  const chars = Array.from(t);
  return chars.length === 4 ? [chars.slice(0, 2).join(""), chars.slice(2).join("")] : [t];
}

/** 시험 영문을 두 줄로(K 마스터): Final → FINAL / EXAM, Mock Test → MOCK / TEST, 모르면 ENGLISH / EXAM */
function wordRows(word: string): [string, string] {
  const parts = word.toUpperCase().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return [parts[0]!, parts.slice(1).join(" ")];
  const w = parts[0] ?? "EXAM";
  // 시험을 모르면(examWord → Exam) 「EXAM / EXAM」으로 겹치지 않게 과목을 앞에 둔다.
  if (w === "EXAM") return ["ENGLISH", "EXAM"];
  return [w, w === "PERFORMANCE" ? "TEST" : "EXAM"];
}

/** 교과서 · 출판사 · 범위 한 줄 */
function bookLine(spec: BookCoverSpec): string {
  return [spec.textbook, spec.publisher, spec.range].map((v) => v.trim()).filter(Boolean).join("  ·  ");
}

/* ──────────────── J. 미니멀 ────────────────
 * 헤더진 Final 계열. 맨 위 시험 영문을 판 폭 끝까지 가늘게 띄워 쓰고, 가운데 축 하나에
 * 연도(낱자) → 학교 · 학년 → 시험 한글 두 줄(학년색, 크게 띄워) → 학기 · 자료 종류. 영문은 맨 위 한 번만.
 * 아래도 가운데: 가는 선 · 교과서 · 범위 한 줄 · 학원명. 굵은 글자가 하나도 없다. */
function MinimalCover({ spec, design, logoSrc }: CoverProps) {
  const pal = bookCoverPalette("minimal", design.paletteId);
  const accent = gradeAccent(pal, spec.grade);
  const word = examWord(spec);
  const letters = Array.from(word.replace(/\s+/g, ""));
  const rows = examRows(spec.exam);
  const who = coverTitle(spec);
  const vars = { "--ink": pal.ink, "--muted": pal.muted, "--accent": accent, "--bk-bg": pal.bg, background: pal.bg } as CSSProperties;
  return (
    <div className="bk bk-j" style={vars} data-cover-ready="1">
      <p className="bk-j-spread" aria-hidden>
        {letters.map((c, i) => (
          <span key={i}>{c}</span>
        ))}
      </p>
      <div className="bk-j-axis">
        {spec.year ? <p className="bk-j-year">{Array.from(spec.year.trim()).join(" ")}</p> : null}
        {who ? <h1 className="bk-j-who">{who}</h1> : null}
        {rows.length ? (
          <p className="bk-j-exam">
            {rows.map((r, i) => (
              <span key={i}>{r}</span>
            ))}
          </p>
        ) : null}
        {[spec.semester, spec.material].some((v) => v.trim()) ? (
          <p className="bk-j-mat">{[spec.semester, spec.material].filter((v) => v.trim()).join("  ·  ")}</p>
        ) : null}
      </div>
      <div className="bk-j-bottom">
        <span className="bk-j-rule" />
        {bookLine(spec) ? <p className="bk-j-book">{bookLine(spec)}</p> : null}
        <Brand name={spec.brand} logoSrc={logoSrc} className="bk-j-brand" />
      </div>
    </div>
  );
}

/* ──────────────── K. 마스터 ────────────────
 * READING MASTER 계열. 왼쪽에 시험 영문 두 줄을 세로로 세워 두 색으로(FINAL 학년색 / EXAM 흰),
 * 오른쪽 위에 대상 문구와 학년 동그라미, 오른쪽 아래에 거대한 두 색 한글(학교 / 시험). */
function MasterCover({ spec, design, logoSrc }: CoverProps) {
  const pal = bookCoverPalette("master", design.paletteId);
  const accent = gradeAccent(pal, spec.grade);
  const num = gradeNumber(spec.grade);
  const [w1, w2] = wordRows(examWord(spec));
  const wordFit = useFitBox(44, 16, `${w1}${w2}|${design.paper}`);
  const big = [spec.school.trim() || coverTitle(spec), spec.exam.trim()].filter(Boolean).join("\n");
  const fit = useFitTitle(30, 12, `${big}|${design.paper}`);
  const vars = { "--ink": pal.ink, "--muted": pal.muted, "--accent": accent, "--bk-bg": pal.bg, background: pal.bg } as CSSProperties;
  return (
    <div className="bk bk-k" style={vars} data-cover-ready={fit.ready && wordFit.ready ? "1" : "0"}>
      <div className="bk-k-wordbox">
        <p className="bk-k-word" ref={wordFit.ref} aria-hidden>
          <span className="bk-k-w1">{w1}</span>
          <span className="bk-k-w2">{w2}</span>
        </p>
      </div>
      <div className="bk-k-corner">
        <div className="bk-k-copy">
          {spec.series ? <p>{spec.series}</p> : null}
          {[spec.year, spec.semester].some((v) => v.trim()) ? <p>{[spec.year, spec.semester].filter(Boolean).join(" ")}</p> : null}
        </div>
        {num != null ? (
          <p className="bk-k-badge">
            <b>{num}</b>
            <small>학년</small>
          </p>
        ) : null}
      </div>
      <div className="bk-k-bottom">
        {spec.material ? <p className="bk-k-mat">{spec.material}</p> : null}
        {bookLine(spec) ? <p className="bk-k-book">{bookLine(spec)}</p> : null}
        <div className="bk-k-titlebox" ref={fit.box}>
          <h1 className="bk-k-title" ref={fit.text}>
            <Title title={big} />
          </h1>
        </div>
      </div>
      <Brand name={spec.brand} logoSrc={logoSrc} className="bk-k-brand" />
    </div>
  );
}

/* ──────────────── M. 스트립 ────────────────
 * 2017 FINAL 계열. 왼쪽에 학년색 세로 띠(세로로 대상 · 특장점), 오른쪽 위 학원명 · 시리즈.
 * 가운데 가는 큰 연도, 그 아래 판 폭을 채우는 시험 영문과 외곽선 그림자, 시험 대비 · 자료 종류.
 * 아래는 C와 같은 정보 띠. */
function StripCover({ spec, design, logoSrc }: CoverProps) {
  const pal = bookCoverPalette("strip", design.paletteId);
  const accent = gradeAccent(pal, spec.grade);
  const word = examWord(spec).toUpperCase();
  const wordFit = useFitBox(54, 20, `${word}|${design.paper}`, "width");
  const title = coverTitle(spec);
  const side = [spec.exam ? `${spec.exam} 대비` : "", ...lines(spec.points)].filter(Boolean).join("   |   ");
  const vars = { "--ink": pal.ink, "--muted": pal.muted, "--accent": accent, "--bk-bg": pal.bg, background: pal.bg } as CSSProperties;
  return (
    <div className="bk bk-m" style={vars} data-cover-ready={wordFit.ready ? "1" : "0"}>
      <div className="bk-m-strip">{side ? <p>{side}</p> : null}</div>
      <div className="bk-m-corner">
        <Brand name={spec.brand} logoSrc={logoSrc} className="bk-m-brand" />
        {spec.series ? <p>{spec.series}</p> : null}
      </div>
      <div className="bk-m-mid">
        {spec.year ? <p className="bk-m-year">{spec.year}</p> : null}
        <div className="bk-m-wordbox">
          {/* 외곽선 그림자는 ::after(data-word) — 같은 크기로 바로 아래에 겹친다 */}
          <p className="bk-m-word" ref={wordFit.ref} data-word={word}>
            {word}
          </p>
        </div>
        {title ? <h1 className="bk-m-title">{title}</h1> : null}
        {materialLine(spec) ? <p className="bk-m-sub">{materialLine(spec)}</p> : null}
      </div>
      <div className="bk-m-bottom">
        <InfoBand spec={spec} />
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
      {design.style === "minimal" ? (
        <MinimalCover spec={spec} design={design} logoSrc={logoSrc} />
      ) : design.style === "master" ? (
        <MasterCover spec={spec} design={design} logoSrc={logoSrc} />
      ) : design.style === "strip" ? (
        <StripCover spec={spec} design={design} logoSrc={logoSrc} />
      ) : (
        <PremiumCover spec={spec} design={design} logoSrc={logoSrc} />
      )}
    </article>
  );
}

/**
 * 뒤표지(선생님 2026-10-22: 뒷면이 너무 구림). 앞표지와 같은 바탕 · 강조색.
 * 위: 시리즈 · 시험 줄 / 시험 영문 · 학교 학년 · 자료 이름. 가운데: 이 교재의 구성(목차와 쪽) · 특장점.
 * 아래: 흰 판 위 학원 로고(크게) · 학원명 · 「수업용으로 만든 교재 · 무단 복제 금지」 · 연도 · 교과서.
 */
export function BookBackCover({
  spec,
  design,
  logoSrc,
  contents,
}: CoverProps & { contents: { number: string; title: string; en: string; pages: string }[] }) {
  const paper = BOOK_COVER_PAPERS[design.paper];
  const pal = bookCoverPalette(design.style, design.paletteId);
  const accent = gradeAccent(pal, spec.grade);
  const exam = examLine(spec);
  const title = coverTitle(spec);
  const academy = spec.brand.trim();
  const book = [spec.textbook, spec.publisher].filter((v) => v.trim()).join(" ");
  const style = {
    width: `${paper.widthMm}mm`,
    height: `${paper.heightMm}mm`,
    "--s": String(paper.widthMm / 210),
  } as CSSProperties;
  const vars = { "--ink": pal.ink, "--muted": pal.muted, "--accent": accent, "--bk-bg": pal.bg, background: pal.bg } as CSSProperties;
  return (
    <article className={`bk-sheet bk-paper-${design.paper.toLowerCase()}`} style={style}>
      <link rel="stylesheet" href={BOOK_COVER_FONTS_HREF} />
      <div className="bk bk-back" style={vars} data-cover-ready="1">
        <div className="bk-back-top">
          <span>{spec.series}</span>
          <span>{exam ? `${exam} 대비` : ""}</span>
        </div>
        <div className="bk-back-main">
          <div className="bk-back-head">
            <p className="bk-back-word">{examWord(spec)}</p>
            {title ? <p className="bk-back-title">{title}</p> : null}
            {materialLine(spec) ? <p className="bk-back-mat">{materialLine(spec)}</p> : null}
          </div>
          {contents.length ? (
            <div className="bk-back-block">
              <p className="bk-back-k">이 교재의 구성</p>
              <ol className="bk-back-toc">
                {contents.map((c) => (
                  <li key={c.number}>
                    <b>{c.number}</b>
                    <span className="bk-back-t">
                      {c.title}
                      {c.en && c.en !== c.title ? <small>{c.en}</small> : null}
                    </span>
                    <span className="bk-back-p">{c.pages}</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
          {lines(spec.points).length ? (
            <div className="bk-back-block">
              <p className="bk-back-k">이 교재의 특징</p>
              <Points text={spec.points} className="bk-back-points" />
            </div>
          ) : null}
        </div>
        <div className="bk-back-foot">
          <Brand name={academy} logoSrc={logoSrc} className="bk-back-logo" />
          <div className="bk-back-legal">
            {/* 로고가 있으면 이름은 로고 안에 이미 있다 — 굵은 이름을 또 쓰지 않는다 */}
            <span>{academy ? `${academy} 수업용으로 만든 교재입니다.` : "수업용으로 만든 교재입니다."} 무단 복제 · 배포를 금합니다.</span>
            {[spec.year, book].some((v) => v.trim()) ? <span>{[spec.year, book].filter((v) => v.trim()).join("  ·  ")}</span> : null}
          </div>
        </div>
      </div>
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

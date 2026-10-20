"use client";

import { Fragment, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  POS_NAME,
  circled,
  testBookTypeLabel,
  type TestBookOptions,
  type TestBookProjectInput,
  type TestBookTypeKey,
  type TestItem,
  type TestSection,
  type TestSeg,
  type TestSheet,
  type WordTest,
} from "@/lib/lesson-materials/test-book";
import { AnalysisMarkupSentence } from "@/components/lesson-materials/AnalysisMarkupSentence";
import { readAnalysisMarkup } from "@/lib/lesson-materials/analysis-markup";

/*
 * 테스트 교재 인쇄 쪽. 모든 쪽은 A4(210×297mm)이고, 내용 덩어리(block)의 높이를 재서
 * 넘치지 않게 쪽을 나눈다(PagedSheet). 백지노트는 정해진 두 쪽이다.
 */

const MM = 96 / 25.4;
const PAGE_H_MM = 297;
const PAD_Y_MM = 13;
const PAD_X_MM = 14;
/** 쪽 아래 꼬리말 자리 */
const FOOT_MM = 6;

export const TEST_BOOK_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Archivo:wght@600;800&family=Noto+Sans+KR:wght@400;500;700;900&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap";

export const TEST_BOOK_CSS = `
.tb-sheet{position:relative;box-sizing:border-box;width:210mm;height:${PAGE_H_MM}mm;padding:${PAD_Y_MM}mm ${PAD_X_MM}mm;background:#fff;color:#15171c;overflow:hidden;font-family:"Noto Sans KR","Malgun Gothic","Apple SD Gothic Neo",sans-serif;font-size:9.5pt;line-height:1.5;word-break:keep-all;overflow-wrap:break-word;-webkit-print-color-adjust:exact;print-color-adjust:exact;break-after:page;page-break-after:always}
.tb-en{font-family:"Source Serif 4","Times New Roman",Georgia,serif}
.tb-measure{position:absolute;left:-10000px;top:0;visibility:hidden;pointer-events:none}
.tb-measure .tb-sheet{height:auto;overflow:visible}
.tb-foot{position:absolute;left:${PAD_X_MM}mm;right:${PAD_X_MM}mm;bottom:6mm;display:flex;justify-content:space-between;font-size:7.2pt;color:#8a909b}
.tb-b{display:flow-root;padding-bottom:2.6mm}
.tb-dh{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:1.6pt solid #15171c;padding-bottom:2mm;margin-bottom:3mm}
.tb-dh h2{margin:0;font-size:16pt;font-weight:900;letter-spacing:-.02em;line-height:1.15}
.tb-dh h2 small{font-size:8.5pt;font-weight:500;color:#6a707c;margin-left:2mm;letter-spacing:0}
.tb-dh .tb-k{text-align:right;font-size:7.6pt;color:#6a707c;line-height:1.35}
.tb-dh .tb-k b{display:block;color:#15171c;font-size:9pt}
.tb-who{display:grid;grid-template-columns:1.3fr 1fr .9fr;gap:5mm;font-size:8.5pt;color:#6a707c}
.tb-who span{border-bottom:.6pt solid #c9cdd4;padding-bottom:1mm}
.tb-tip{font-size:8pt;color:#6a707c}
.tb-star{color:#e8492b;font-weight:900}
/* 표를 줄마다 덩어리로 두려고 grid 줄을 쓴다 */
.tb-row{display:grid;border-bottom:.5pt solid #d3d7de;align-items:stretch}
.tb-row > div{padding:1.1mm 1.4mm;min-width:0}
.tb-row.tb-th{border-top:1.2pt solid #15171c;border-bottom:1.2pt solid #15171c;font-size:7.6pt;color:#6a707c;font-weight:500}
.tb-row.tb-th > div{padding:1mm 1.4mm}
.tb-vrow{grid-template-columns:6mm 36mm 9mm 34mm 1fr 1fr 30mm;font-size:8.3pt;line-height:1.35}
.tb-vrow .tb-w{font-weight:700;overflow-wrap:anywhere}
.tb-vrow .tb-pos{color:#6a707c;font-style:italic}
.tb-vrow .tb-nil{color:#c9cdd4}
.tb-vrow .tb-n{color:#8a909b;font-size:7.2pt;padding-top:1.5mm;white-space:nowrap}
.tb-q{display:flex;align-items:center;gap:2.2mm;border-top:1.2pt solid #15171c;padding-top:1.6mm;margin-bottom:1.6mm;font-size:10pt;font-weight:700}
.tb-q .tb-qn{display:inline-grid;place-items:center;min-width:6mm;height:6mm;padding:0 1mm;background:#15171c;color:#fff;font-size:8pt;font-weight:700}
.tb-q small{font-weight:400;color:#6a707c;font-size:8pt}
.tb-it{display:grid;grid-template-columns:7mm minmax(0,1fr);column-gap:1mm;margin-bottom:1.6mm}
.tb-it > .tb-i{color:#6a707c;font-size:8pt;padding-top:.6mm}
.tb-it .tb-txt{font-size:10pt;line-height:1.6}
.tb-ko{color:#5b616c;font-size:8.5pt;margin-top:.4mm}
.tb-line{height:7.5mm;border-bottom:.6pt solid #c9cdd4}
.tb-blank{display:inline-block;min-width:24mm;border-bottom:.8pt solid #15171c;margin:0 1mm;text-align:center;font-family:"Noto Sans KR",sans-serif;font-size:7.6pt;font-weight:700;color:#6a707c;vertical-align:-.3mm}
.tb-pick{white-space:nowrap;font-weight:600}
.tb-pn{font-weight:700;margin-right:.6mm}
.tb-sup{font-family:"Noto Sans KR",sans-serif;font-size:6.5pt;font-weight:700;margin-left:.6mm;color:#15171c}
.tb-kol{font-family:"Noto Sans KR",sans-serif;font-size:8.5pt;font-weight:800;margin:2.5mm 0 1mm}
.tb-pick i{font-style:normal;font-weight:400;color:#8a909b;margin:0 .6mm}
.tb-chunks{display:flex;flex-wrap:wrap;gap:1.5mm;margin:1mm 0}
.tb-chunks span{border:.7pt solid #15171c;padding:.3mm 2mm;font-size:9pt}
.tb-lead{font-weight:600}
.tb-tag{display:inline-block;font-size:7.4pt;font-weight:700;color:#1d4ed8;border:.6pt solid #1d4ed8;padding:0 1.6mm;margin-bottom:.6mm}
.tb-tf{display:grid;grid-template-columns:7mm minmax(0,1fr) 16mm;column-gap:1mm;align-items:baseline;border-bottom:.5pt solid #d3d7de;padding:1mm 0}
.tb-tf .tb-tfbox{text-align:right;color:#6a707c;font-size:8.5pt}
.tb-box{border:.7pt solid #15171c;padding:1.2mm 3mm;display:flex;flex-wrap:wrap;gap:1mm 6mm;font-size:9pt;margin-bottom:2mm}
.tb-given{border:.7pt solid #15171c;background:#f4f5f7;padding:1.6mm 3mm;margin-bottom:2mm;font-size:10pt;line-height:1.6}
.tb-psg{font-size:10pt;line-height:1.85;text-align:justify;margin:0 0 1.5mm}
.tb-words{display:grid;grid-template-columns:1fr 1fr;column-gap:8mm}
.tb-wq{display:grid;grid-template-columns:7.5mm 1fr;column-gap:1mm;align-items:end;border-bottom:.6pt solid #c9cdd4;height:8.2mm;font-size:9.5pt}
.tb-wq .tb-i{color:#6a707c;font-size:8pt;white-space:nowrap}
.tb-mc{display:grid;grid-template-columns:6mm minmax(0,1fr);column-gap:1mm;margin-bottom:2mm}
.tb-mc .tb-ch{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.5mm 3mm;font-size:9pt;margin-top:.5mm}
.tb-rel{display:inline-block;border:.6pt solid #6a707c;color:#6a707c;font-size:7.6pt;padding:0 1.2mm;margin-left:1.5mm}
.tb-ss{display:grid;grid-template-columns:7mm minmax(0,1fr);column-gap:1mm;margin-bottom:2.2mm}
.tb-ss .tb-i{color:#8a909b;font-size:7.6pt;padding-top:.8mm}
.tb-ss .tb-en{font-size:10.5pt;line-height:1.62}
.tb-ss .tb-ko{font-size:9pt;color:#4b515c}
/* 계획표·이수표 */
.tb-fields{display:grid;grid-template-columns:1fr .8fr 1.8fr 1fr;gap:4mm;font-size:8.5pt;color:#6a707c;margin-bottom:1mm}
.tb-fields span{border-bottom:.6pt solid #c9cdd4;padding-bottom:1mm}
.tb-sub{display:flex;align-items:baseline;gap:2mm;font-size:10.5pt;font-weight:900;margin:2mm 0 1.4mm}
.tb-sub small{font-weight:400;font-size:8pt;color:#6a707c}
.tb-prow{grid-template-columns:9mm 25mm minmax(0,1fr) 54mm 25mm 15mm;font-size:8.1pt;min-height:9mm}
.tb-prow > div{border-left:.5pt solid #d3d7de;display:flex;align-items:center}
.tb-prow > div:first-child{border-left:0;justify-content:center}
.tb-date{color:#9aa0aa;letter-spacing:.02em}
.tb-prow > div.tb-psrc{flex-direction:column;align-items:flex-start;justify-content:center;line-height:1.3}
.tb-psrc b{font-size:7.4pt;color:#4b515c;font-weight:700}
.tb-todo{display:flex;flex-wrap:wrap;gap:.6mm 2.4mm;font-size:7.6pt;color:#4b515c}
.tb-todo span::before{content:"";display:inline-block;width:2.6mm;height:2.6mm;border:.6pt solid #4b515c;margin-right:.8mm;vertical-align:-.4mm}
.tb-crow{font-size:7.6pt;min-height:8.5mm}
.tb-crow > div{border-left:.5pt solid #d3d7de;display:flex;align-items:flex-end;justify-content:flex-end;color:#c9cdd4}
.tb-crow > div:first-child{border-left:0;justify-content:flex-start;align-items:center;color:#15171c}
.tb-crow.tb-th > div{justify-content:center;align-items:center;color:#6a707c}
.tb-crow.tb-th > div:first-child{justify-content:flex-start}
.tb-rrow{grid-template-columns:24mm 30mm 25mm 18mm 1fr 1fr;font-size:8.1pt;min-height:8.5mm}
.tb-rrow > div{border-left:.5pt solid #d3d7de;display:flex;align-items:center}
.tb-rrow > div:first-child{border-left:0}
.tb-sign{display:flex;gap:8mm;font-size:8.5pt;color:#6a707c;margin-top:3mm}
.tb-sign span{flex:1;border-bottom:.6pt solid #c9cdd4;padding-bottom:1mm}
/* 백지노트 */
.tb-note{display:flex;flex-direction:column;height:100%}
/* 표지 01 색 번짐(시안 10-19 채택): 남색 위 주황·보라·청록 번짐, 낟알 */
.tb-cover{padding:0;background:#1d2a8f;color:#fff}
.tb-cover .tb-glow{position:absolute;inset:-10%;background:radial-gradient(60% 45% at 78% 22%,#ff7a45 0%,transparent 60%),radial-gradient(55% 50% at 18% 70%,#7b5cff 0%,transparent 62%),radial-gradient(50% 40% at 70% 88%,#2fd0c0 0%,transparent 60%),#1d2a8f}
.tb-cover .tb-grain{position:absolute;inset:0;opacity:.28;mix-blend-mode:overlay;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
.tb-cover .tb-in{position:absolute;inset:12.6mm;display:flex;flex-direction:column;justify-content:space-between}
.tb-cover .tb-ctop{display:flex;justify-content:space-between;font-size:8pt;letter-spacing:.1em;font-weight:500}
.tb-cover .tb-ct{font-family:Archivo,"Arial Black",sans-serif;font-weight:600;font-size:96pt;line-height:.9;letter-spacing:-.045em}
.tb-cover .tb-crows{display:grid;font-size:11pt}
.tb-cover .tb-crows div{display:flex;justify-content:space-between;gap:6mm;border-top:.6pt solid rgba(255,255,255,.45);padding:2.4mm 0}
.tb-cover .tb-crows b{font-weight:700;text-align:right}
/* 목차(통합자료 목차와 같은 꼴: 큰 세리프 CONTENTS, 색 번호, 묶음별 쪽 범위) */
.tb-contents{padding:22mm 20mm}
.tb-contents h2{margin:0;font-family:Georgia,"Times New Roman",serif;font-size:40pt;font-weight:900;line-height:1;letter-spacing:-.02em;color:#15171c}
.tb-contents .tb-cbar{margin-top:4mm;height:1.6mm;width:22mm;background:#15171c}
.tb-contents ol{list-style:none;margin:14mm 0 0;padding:0;display:grid;gap:6.5mm}
.tb-contents li{display:flex;align-items:flex-start;gap:6mm}
.tb-contents .tb-cno{width:14mm;font-family:Georgia,serif;font-size:22pt;font-weight:900;line-height:1}
.tb-contents .tb-cbody{flex:1;min-width:0;border-bottom:.5pt solid #d3d7de;padding-bottom:3.6mm}
.tb-contents .tb-crow{display:flex;justify-content:space-between;align-items:baseline;gap:4mm}
.tb-contents .tb-cen{font-family:Georgia,serif;font-size:13pt;font-weight:700;letter-spacing:.04em;text-transform:uppercase}
.tb-contents .tb-cpg{font-size:9.5pt;color:#6a707c;white-space:nowrap;font-variant-numeric:tabular-nums}
.tb-contents .tb-cko{margin-top:1mm;font-size:9.5pt;color:#6a707c}
.tb-contents .tb-cko b{color:#15171c;font-weight:700;margin-right:2mm}
.tb-contents .tb-cfoot{position:absolute;left:20mm;right:20mm;bottom:16mm;border-top:.5pt solid #c9cdd4;padding-top:3mm;text-align:right}
.tb-contents .tb-cfoot b{display:block;font-family:Georgia,serif;font-size:10pt}
.tb-contents .tb-cfoot span{font-size:8.5pt;color:#6a707c}
/* 간지: 왼쪽 색 띠, PART 번호, 영어·한글 제목, 지문별 시작 쪽 */
.tb-divider{padding:0}
.tb-divider .tb-dstrip{position:absolute;top:0;bottom:0;left:0;width:14mm;background:var(--tb-accent,#15171c)}
.tb-divider .tb-din{position:absolute;left:30mm;right:20mm;top:62mm}
.tb-divider .tb-dpart{font-size:13pt;font-weight:900;letter-spacing:.3em;color:var(--tb-accent,#15171c)}
.tb-divider h2{margin:4mm 0 0;font-family:Georgia,"Times New Roman",serif;font-size:32pt;font-weight:900;line-height:1.1;text-transform:uppercase;color:#15171c}
.tb-divider .tb-dbar{margin-top:6mm;height:1.2mm;width:30mm;background:var(--tb-accent,#15171c)}
.tb-divider .tb-dko{margin-top:6mm;font-size:19pt;font-weight:900;color:#2b2f38}
.tb-divider .tb-dsub{margin-top:2mm;font-size:10pt;color:#6a707c}
.tb-divider .tb-dlist{margin-top:12mm;display:grid;grid-template-columns:1fr 1fr;column-gap:8mm}
.tb-divider .tb-dlist div{display:grid;grid-template-columns:7mm 1fr 9mm;gap:1mm;align-items:baseline;border-bottom:.5pt solid #e1e4e9;padding:1.3mm 0;font-size:8.5pt}
.tb-divider .tb-dlist i{font-style:normal;color:var(--tb-accent,#15171c);font-weight:800;font-size:7.5pt}
.tb-divider .tb-dlist em{font-style:normal;text-align:right;font-weight:700;font-variant-numeric:tabular-nums}
.tb-divider .tb-dlist small{display:block;color:#8a909b;font-size:7pt}
.tb-divider .tb-dfoot{position:absolute;left:30mm;right:20mm;bottom:16mm;border-top:.5pt solid #e1e4e9;padding-top:3mm;text-align:right;font-size:8.5pt;color:#6a707c}
.tb-divider .tb-dfoot b{display:block;color:#2b2f38;font-size:9.5pt}
/* 지문 간지: 위쪽 색 면에 큰 지문 번호, 아래에 제목·출처·이 묶음에서 이어질 쪽 */
.tb-pdiv{padding:0}
.tb-pdiv .tb-ptop{position:absolute;left:0;right:0;top:0;height:118mm;background:var(--tb-accent,#15171c);color:#fff;overflow:hidden}
.tb-pdiv .tb-ptop::after{content:"";position:absolute;right:-30mm;bottom:-46mm;width:120mm;height:120mm;border-radius:50%;background:rgba(255,255,255,.08)}
.tb-pdiv .tb-ppart{position:absolute;left:24mm;top:22mm;font-size:9pt;font-weight:800;letter-spacing:.28em;opacity:.85}
.tb-pdiv .tb-pno{position:absolute;left:20mm;bottom:8mm;font-family:Georgia,"Times New Roman",serif;font-size:120pt;font-weight:900;line-height:.8;letter-spacing:-.04em}
.tb-pdiv .tb-pno small{display:block;font-family:"Noto Sans KR",sans-serif;font-size:9pt;font-weight:700;letter-spacing:.3em;margin:0 0 4mm 2mm;opacity:.8}
.tb-pdiv .tb-pin{position:absolute;left:24mm;right:22mm;top:136mm}
.tb-pdiv .tb-psrc{font-size:9.5pt;font-weight:700;color:var(--tb-accent,#15171c);letter-spacing:.04em}
.tb-pdiv h2{margin:3mm 0 0;font-size:24pt;font-weight:900;line-height:1.25;letter-spacing:-.02em;color:#15171c}
.tb-pdiv .tb-pen{margin-top:2mm;font-family:Georgia,serif;font-size:12pt;color:#4b515c}
.tb-pdiv .tb-pbar{margin-top:8mm;height:1mm;width:24mm;background:var(--tb-accent,#15171c)}
.tb-pdiv .tb-pnext{margin-top:7mm;display:grid;gap:2mm;font-size:10pt;color:#2b2f38}
.tb-pdiv .tb-pnext div{display:flex;align-items:center;gap:3mm;border-bottom:.5pt solid #e1e4e9;padding-bottom:2mm}
.tb-pdiv .tb-pnext i{font-style:normal;display:inline-grid;place-items:center;width:5.5mm;height:5.5mm;background:var(--tb-accent,#15171c);color:#fff;font-size:7.5pt;font-weight:800}
.tb-pdiv .tb-pfoot{position:absolute;left:24mm;right:22mm;bottom:16mm;border-top:.5pt solid #e1e4e9;padding-top:3mm;display:flex;justify-content:space-between;font-size:8.5pt;color:#6a707c}
/* 묶음 색: 바깥 가장자리 띠 + 쪽 머리 꼬리표 + 문항 번호 칸 */
.tb-sheet.tb-part::before{content:"";position:absolute;top:0;bottom:0;left:0;width:2.4mm;background:var(--tb-accent,#15171c)}
.tb-part .tb-dh{border-bottom-color:var(--tb-accent,#15171c)}
.tb-part .tb-dh h2::before{content:var(--tb-part,"");display:block;font-size:6.8pt;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:var(--tb-accent,#15171c);margin-bottom:1mm}
.tb-part .tb-q .tb-qn{background:var(--tb-accent,#15171c)}
.tb-part .tb-q{border-top-color:var(--tb-accent,#15171c)}
/* 분석 자료(분석서 문장 분석 부품을 그대로 쓴다) */
.tb-an-topic{border-left:3pt solid #15171c;padding:1mm 0 1mm 3mm;margin-bottom:2mm;font-size:9.5pt}
.tb-an-topic b{font-size:8pt;color:#6a707c;margin-right:2mm;letter-spacing:.06em}
.tb-an-s{padding:2mm 0;border-bottom:.5pt solid #e1e4e9}
.tb-an-s .tb-ko{font-size:9pt}
.tb-note .tb-psgbox{border-top:.8pt solid #15171c;padding-top:1.6mm;margin-bottom:3mm}
.tb-note .tb-lb{display:flex;justify-content:space-between;align-items:baseline;font-size:8pt;color:#6a707c;margin-bottom:1mm}
.tb-note .tb-lb b{color:#15171c;font-size:10pt}
.tb-note .tb-psgbox p{margin:0;font-size:10pt;line-height:2.05;text-align:justify}
.tb-fill{flex:1;display:flex;flex-direction:column;min-height:0;margin-bottom:3mm}
.tb-fill:last-child{margin-bottom:0}
.tb-gridlines{flex:1;border-top:1pt solid #15171c;background-image:linear-gradient(transparent calc(100% - .5pt),#c9cdd4 0);background-size:100% 7mm;position:relative}
.tb-gridlines.tb-num{background-image:linear-gradient(transparent calc(100% - .5pt),#c9cdd4 0),linear-gradient(90deg,transparent 9mm,#c9cdd4 9mm,#c9cdd4 calc(9mm + .5pt),transparent 0)}
.tb-gridlines.tb-syn{background-image:linear-gradient(transparent calc(100% - .5pt),#c9cdd4 0),linear-gradient(90deg,transparent 42mm,#c9cdd4 42mm,#c9cdd4 calc(42mm + .5pt),transparent calc(42mm + .5pt),transparent 82mm,#c9cdd4 82mm,#c9cdd4 calc(82mm + .5pt),transparent calc(82mm + .5pt),transparent 132mm,#c9cdd4 132mm,#c9cdd4 calc(132mm + .5pt),transparent 0)}
.tb-synhead{display:grid;grid-template-columns:42mm 40mm 50mm 1fr;font-size:8pt;color:#6a707c;border-top:1pt solid #15171c;padding:.8mm 0}
.tb-synhead span{padding-left:1.4mm}
.tb-ticks{display:flex;flex-wrap:wrap;gap:1mm 3.4mm;font-size:8pt;color:#4b515c;margin-bottom:1.4mm}
.tb-ticks span::before{content:"";display:inline-block;width:2.6mm;height:2.6mm;border:.6pt solid #4b515c;margin-right:.8mm;vertical-align:-.4mm}
/* 정답 */
.tb-ans{border-top:1.2pt solid #15171c;padding-top:1.6mm}
.tb-ans h3{margin:0 0 1.2mm;font-size:10.5pt;font-weight:900}
.tb-ans h3 span{color:#6a707c;font-weight:500;margin-right:2mm}
.tb-arow{display:grid;grid-template-columns:24mm minmax(0,1fr);column-gap:2mm;font-size:9pt;line-height:1.5;margin-bottom:.8mm}
.tb-arow dt{font-weight:700;color:#4b515c}
.tb-arow dd{margin:0;min-width:0}
.tb-arow dd b{color:#6a707c;font-weight:500;margin-right:1mm}
.tb-arow dd > span{display:inline-block;margin-right:4mm}
/* 인쇄: 전역 규칙(globals.css)이 body 안을 모두 숨기고 등록된 인쇄 루트만 보인다. 여기서 직접 보이게 하고
   A4 용지(app-print-a4)를 지정한다 — 빠뜨리면 빈 종이나 레터 용지로 나온다. */
@media print{
#tb-print-root,#tb-print-root *{visibility:visible}
#tb-print-root{page:app-print-a4;position:absolute;left:0;top:0;width:210mm !important;max-width:210mm !important;margin:0 !important;padding:0 !important;transform:none !important;gap:0 !important}
.tb-sheet{box-shadow:none !important}
.tb-measure{display:none !important}
}
`;

// ---------------------------------------------------------------- 쪽 나누기

export type Block = { key: string; node: ReactNode };

/**
 * 덩어리를 재서 A4 쪽으로 나눈다. head는 쪽마다 위에 붙는다(첫 쪽과 나머지 쪽을 다르게 줄 수 있다).
 * 쪽 수가 바뀌면 다시 그린다. measureKey가 바뀌면(글꼴·내용) 다시 잰다.
 */
export function PagedSheet({
  blocks,
  head,
  foot,
  measureKey,
}: {
  blocks: Block[];
  head: (page: number) => ReactNode;
  foot?: (page: number, total: number) => ReactNode;
  measureKey: string;
}) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<number[][]>(() => [blocks.map((_, i) => i)]);
  const blockKeys = blocks.map((b) => b.key).join("|");
  useLayoutEffect(() => {
    const root = measureRef.current;
    if (!root) return;
    const firstHead = (root.querySelector("[data-tb-head='0']") as HTMLElement | null)?.offsetHeight ?? 0;
    const restHead = (root.querySelector("[data-tb-head='1']") as HTMLElement | null)?.offsetHeight ?? firstHead;
    const heights = Array.from(root.querySelectorAll<HTMLElement>("[data-tb-block]")).map((el) => el.offsetHeight);
    const inner = (PAGE_H_MM - PAD_Y_MM * 2 - FOOT_MM) * MM;
    const out: number[][] = [];
    let cur: number[] = [];
    let used = firstHead;
    heights.forEach((h, i) => {
      const room = inner - used;
      if (cur.length > 0 && h > room) {
        out.push(cur);
        cur = [];
        used = restHead;
      }
      cur.push(i);
      used += h;
    });
    if (cur.length || out.length === 0) out.push(cur);
    setPages((prev) => (JSON.stringify(prev) === JSON.stringify(out) ? prev : out));
  }, [blockKeys, measureKey]);
  return (
    <>
      <div ref={measureRef} className="tb-measure" aria-hidden>
        <div className="tb-sheet tb-part">
          <div data-tb-head="0">{head(0)}</div>
          <div data-tb-head="1">{head(1)}</div>
          {blocks.map((b) => (
            <div key={b.key} data-tb-block="" style={{ display: "flow-root" }}>
              {b.node}
            </div>
          ))}
        </div>
      </div>
      {pages.map((idx, p) => (
        <div key={p} className="tb-sheet tb-part">
          {head(p)}
          {idx.map((i) => (blocks[i] ? <Fragment key={blocks[i]!.key}>{blocks[i]!.node}</Fragment> : null))}
          {foot ? <div className="tb-foot">{foot(p, pages.length)}</div> : null}
        </div>
      ))}
    </>
  );
}

// ---------------------------------------------------------------- 공용 조각

function Seg({ seg }: { seg: TestSeg }) {
  if (typeof seg === "string") return <>{seg}</>;
  if ("blank" in seg) {
    return (
      // 번호는 빈칸 안 왼쪽에 둔다 — 밖에 두면 번호만 줄 끝에 남았다(nowrap으로 감싸면 쪽 나누기 측정이 흐트러졌다)
      <span className="tb-blank" style={seg.n ? { textAlign: "left" } : undefined}>
        {seg.n ? <sup className="tb-sup">{seg.n}</sup> : null}
        {seg.blank}
      </span>
    );
  }
  return (
    <span className="tb-pick">
      {seg.n ? <b className="tb-pn">{seg.n}</b> : null}[ {seg.pick[0]} <i>/</i> {seg.pick[1]} ]
    </span>
  );
}

function Segs({ segs }: { segs: TestSeg[] }) {
  return (
    <>
      {segs.map((s, i) => (
        <Seg key={i} seg={s} />
      ))}
    </>
  );
}

function DocHead({ title, sub, label, right }: { title: string; sub?: string; label: string; right?: string }) {
  return (
    <div className="tb-b">
      <div className="tb-dh">
        <h2>
          {title}
          {sub ? <small>{sub}</small> : null}
        </h2>
        <div className="tb-k">
          <b>{label}</b>
          {right}
        </div>
      </div>
    </div>
  );
}

function Who({ total }: { total?: number }) {
  return (
    <div className="tb-b">
      <div className="tb-who">
        <span>이름</span>
        <span>날짜 &nbsp;&nbsp;&nbsp;월 &nbsp;&nbsp;&nbsp;일</span>
        <span>점수 {total ? <>&nbsp;&nbsp;&nbsp;&nbsp;/ {total}</> : null}</span>
      </div>
    </div>
  );
}

function passageLabel(index: number, p: { title: string; source: string | null }): string {
  return `${String(index + 1).padStart(2, "0")} · ${p.title}`;
}

// ---------------------------------------------------------------- 학습 계획표·이수표

const TYPE_SHORT: Record<TestBookTypeKey, string> = {
  line: "해석",
  blank: "빈칸",
  grammar: "어법",
  vocab: "어휘",
  order: "어순",
  tf: "T/F",
  writing: "영작",
  link: "연결어",
  sequence: "순서",
  insert: "삽입",
  summary: "요약",
  grammarFix: "어법서술",
  words: "단어",
};

/**
 * 계획표의 「해 올 것」과 이수표 칸은 교재에 넣기로 고른 묶음·테스트 유형을 그대로 따른다
 * (선생님 2026-10-20: 고른 테스트 종류대로 자동으로).
 */
export function PlanSheets({
  projects,
  options,
  measureKey,
}: {
  projects: TestBookProjectInput[];
  options: TestBookOptions;
  measureKey: string;
}) {
  const tests = options.tests;
  const cols = [
    ...(tests && options.wordTest ? ["단어TEST"] : []),
    ...(tests ? options.types.map((t) => TYPE_SHORT[t]) : []),
  ];
  const todo = [
    ...(options.lesson ? ["단어", "해석"] : []),
    ...(tests && options.types.length ? ["견본 풀기"] : []),
    ...(options.blankNote ? ["백지노트"] : []),
    ...(options.analysis ? ["분석 자료"] : []),
  ];
  const checkGrid = `24mm repeat(${cols.length}, minmax(0,1fr)) 12mm 15mm`;
  const allWordTestOn = tests && options.allWordTest;
  const checkOn = cols.length > 0 || allWordTestOn;
  const blocks: Block[] = [
    {
      key: "fields",
      node: (
        <div className="tb-b">
          <div className="tb-fields">
            <span>이름</span>
            <span>반</span>
            <span>기간 &nbsp;&nbsp;&nbsp;월 &nbsp;&nbsp;&nbsp;일 ~ &nbsp;&nbsp;&nbsp;월 &nbsp;&nbsp;&nbsp;일</span>
            <span>담당</span>
          </div>
        </div>
      ),
    },
    {
      key: "plan-h",
      node: (
        <div>
          <div className="tb-sub">
            수업 계획 <small>날짜를 적고, 해 온 것에 ✓ · 테스트 날짜에 통과하면 확인 칸에 서명</small>
          </div>
          <div className="tb-row tb-th tb-prow">
            <div>차시</div>
            <div>수업 날짜</div>
            <div>공부해 올 지문</div>
            <div>해 올 것</div>
            <div>테스트 날짜</div>
            <div>확인</div>
          </div>
        </div>
      ),
    },
    ...projects.map((p, i) => ({
      key: `plan-${p.id}`,
      node: (
        <div className="tb-row tb-prow">
          <div>{i + 1}</div>
          <div className="tb-date">&nbsp;&nbsp;월 &nbsp;&nbsp;&nbsp;일 (&nbsp;&nbsp;&nbsp;)</div>
          <div className="tb-psrc">
            {p.source?.trim() ? <b>{p.source}</b> : null}
            <span>{p.title}</span>
          </div>
          <div>
            <span className="tb-todo">
              {todo.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </span>
          </div>
          <div className="tb-date">&nbsp;&nbsp;월 &nbsp;&nbsp;&nbsp;일</div>
          <div />
        </div>
      ),
    })),
    ...(checkOn
      ? [
          {
            key: "check-h",
            node: (
              <div style={{ paddingTop: "3mm" }}>
                <div className="tb-sub">
                  테스트 이수 <small>칸에 점수를 쓰고, 다 통과하면 결과에 ○ · 다시 보면 「재」</small>
                </div>
                {allWordTestOn ? (
                  <div className="tb-fields" style={{ marginBottom: "2mm" }}>
                    <span>전체 단어 TEST &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/</span>
                    <span>결과</span>
                    <span>날짜 &nbsp;&nbsp;&nbsp;월 &nbsp;&nbsp;&nbsp;일</span>
                    <span>선생님</span>
                  </div>
                ) : null}
                {cols.length ? (
                  <div className="tb-row tb-th tb-crow" style={{ gridTemplateColumns: checkGrid }}>
                    <div>지문</div>
                    {cols.map((c) => (
                      <div key={c}>{c}</div>
                    ))}
                    <div>결과</div>
                    <div>선생님</div>
                  </div>
                ) : null}
              </div>
            ),
          },
          ...(cols.length
            ? projects.map((p, i) => ({
                key: `check-${p.id}`,
                node: (
                  <div className="tb-row tb-crow" style={{ gridTemplateColumns: checkGrid }}>
                    <div>{String(i + 1).padStart(2, "0")}</div>
                    {cols.map((c) => (
                      <div key={c}>/</div>
                    ))}
                    <div />
                    <div />
                  </div>
                ),
              }))
            : []),
        ]
      : []),
    ...(checkOn
      ? [
          {
            key: "re-h",
            node: (
              <div style={{ paddingTop: "3mm" }}>
                <div className="tb-sub">
                  재시험 <small>통과하지 못한 것만 · 날짜를 적고 다시 본다</small>
                </div>
                <div className="tb-row tb-th tb-rrow">
                  <div>지문</div>
                  <div>유형</div>
                  <div>날짜</div>
                  <div>점수</div>
                  <div>선생님 서명</div>
                  <div>학생 서명</div>
                </div>
              </div>
            ),
          },
          ...[0, 1, 2, 3, 4].map((n) => ({
            key: `re-${n}`,
            node: (
              <div className="tb-row tb-rrow">
                <div />
                <div />
                <div className="tb-date">&nbsp;&nbsp;월 &nbsp;&nbsp;&nbsp;일</div>
                <div />
                <div />
                <div />
              </div>
            ),
          })),
        ]
      : []),
    {
      key: "sign",
      node: (
        <div className="tb-sign">
          <span>마지막 확인 &nbsp;&nbsp;&nbsp;월 &nbsp;&nbsp;&nbsp;일</span>
          <span>선생님</span>
          <span>학생</span>
          <span>학부모</span>
        </div>
      ),
    },
  ];
  return (
    <PagedSheet
      blocks={blocks}
      measureKey={measureKey}
      head={(page) => <DocHead title="학습 계획표 · 이수표" sub={page > 0 ? "(이어서)" : undefined} label="PLAN & CHECK" />}
    />
  );
}

// ---------------------------------------------------------------- 단어 정리

export function VocabSheets({
  index,
  project,
  measureKey,
}: {
  index: number;
  project: TestBookProjectInput;
  measureKey: string;
}) {
  const rows = project.material?.vocab ?? [];
  const head = (
    <div className="tb-row tb-th tb-vrow">
      <div />
      <div>단어</div>
      <div />
      <div>지문 속 뜻</div>
      <div>= 동의어</div>
      <div>↔ 반의어</div>
      <div>파생어 · 어구</div>
    </div>
  );
  const blocks: Block[] = [
    {
      key: "tip",
      node: (
        <div className="tb-b">
          <div className="tb-tip">
            <span className="tb-star">★</span> 핵심어 · 동의어·반의어는 바꿔 쓰기로 나올 만한 단어에만 붙였습니다.
          </div>
        </div>
      ),
    },
    ...rows.map((r, i) => ({
      key: `v${i}`,
      node: (
        <div className="tb-row tb-vrow">
          <div className="tb-n">{i + 1}</div>
          <div className="tb-w tb-en">
            {r.key ? <span className="tb-star">★ </span> : null}
            {r.word}
          </div>
          <div className="tb-pos">{r.pos}</div>
          <div>{r.meaning}</div>
          <div className={r.synonyms.length ? "tb-en" : "tb-nil"}>{r.synonyms.join(", ") || "—"}</div>
          <div className={r.antonyms.length ? "tb-en" : "tb-nil"}>{r.antonyms.join(", ") || "—"}</div>
          <div className="tb-en">
            {r.forms.map((f) => `${f.word} ${f.pos}`).join(", ")}
            {r.forms.length && r.phrase ? <br /> : null}
            {r.phrase}
          </div>
        </div>
      ),
    })),
  ];
  return (
    <PagedSheet
      blocks={blocks}
      measureKey={measureKey}
      head={(page) => (
        <>
          <DocHead title="단어 정리" sub={page > 0 ? "(이어서)" : undefined} label={passageLabel(index, project)} right={project.source?.trim() || "VOCABULARY"} />
          {head}
        </>
      )}
    />
  );
}

// ---------------------------------------------------------------- 전체 단어장

/*
 * 선생님 요청(2026-10-19): 지문별 단어 정리와 별도로, 계획표 다음에 모든 지문 단어를 한데 모아
 * 전체 시험을 보기 편하게. 같은 낱말이 여러 지문에 나오면 처음 지문에만 싣는다.
 */
type AllRow = { no: number; passage: number; row: NonNullable<TestBookProjectInput["material"]>["vocab"][number] };

export function allVocabRows(projects: TestBookProjectInput[], indexOf: (id: string) => number): AllRow[] {
  const seen = new Set<string>();
  const out: AllRow[] = [];
  for (const p of projects) {
    for (const row of p.material?.vocab ?? []) {
      const k = row.word.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      out.push({ no: out.length + 1, passage: indexOf(p.id) + 1, row });
    }
  }
  return out;
}

const ALL_GRID = "9mm 8mm 29mm 8mm 33mm 1fr 1fr 1fr";

export function AllVocabSheets({
  projects,
  indexOf,
  measureKey,
}: {
  projects: TestBookProjectInput[];
  indexOf: (id: string) => number;
  measureKey: string;
}) {
  const rows = allVocabRows(projects, indexOf);
  const head = (
    <div className="tb-row tb-th tb-vrow" style={{ gridTemplateColumns: ALL_GRID }}>
      <div />
      <div>지문</div>
      <div>단어</div>
      <div />
      <div>지문 속 뜻</div>
      <div>= 동의어</div>
      <div>↔ 반의어</div>
      <div>파생어</div>
    </div>
  );
  const blocks: Block[] = rows.map((r) => ({
    key: `all${r.no}`,
    node: (
      <div className="tb-row tb-vrow" style={{ gridTemplateColumns: ALL_GRID }}>
        <div className="tb-n">{r.no}</div>
        <div className="tb-n">{String(r.passage).padStart(2, "0")}</div>
        <div className="tb-w tb-en">
          {r.row.key ? <span className="tb-star">★ </span> : null}
          {r.row.word}
        </div>
        <div className="tb-pos">{r.row.pos}</div>
        <div>{r.row.meaning}</div>
        <div className={r.row.synonyms.length ? "tb-en" : "tb-nil"}>{r.row.synonyms.join(", ") || "—"}</div>
        <div className={r.row.antonyms.length ? "tb-en" : "tb-nil"}>{r.row.antonyms.join(", ") || "—"}</div>
        <div className={r.row.forms.length ? "tb-en" : "tb-nil"}>{r.row.forms.map((f) => `${f.word} ${f.pos}`).join(", ") || "—"}</div>
      </div>
    ),
  }));
  return (
    <PagedSheet
      blocks={blocks}
      measureKey={measureKey}
      head={(page) => (
        <>
          <DocHead title="전체 단어장" sub={page > 0 ? "(이어서)" : `지문 ${projects.length}개 · ${rows.length}단어`} label="ALL WORDS" right="지문 번호는 계획표 차례" />
          {head}
        </>
      )}
    />
  );
}

/** 전체 단어 TEST: 뜻 쓰기(모든 단어, 두 단) */
export function AllWordTestSheets({
  projects,
  indexOf,
  measureKey,
}: {
  projects: TestBookProjectInput[];
  indexOf: (id: string) => number;
  measureKey: string;
}) {
  const rows = allVocabRows(projects, indexOf);
  const pairs: AllRow[][] = [];
  for (let i = 0; i < rows.length; i += 2) pairs.push(rows.slice(i, i + 2));
  const blocks: Block[] = [
    { key: "who", node: <Who total={rows.length} /> },
    ...pairs.map((pair, i) => ({
      key: `p${i}`,
      node: (
        <div className="tb-words">
          {pair.map((r) => (
            <div key={r.no} className="tb-wq">
              <span className="tb-i">{r.no}</span>
              <span className="tb-en">{r.row.word}</span>
            </div>
          ))}
        </div>
      ),
    })),
  ];
  return (
    <PagedSheet
      blocks={blocks}
      measureKey={measureKey}
      head={(page) => <DocHead title="전체 단어 TEST" sub={page > 0 ? "(이어서)" : "지문 속 뜻 쓰기"} label="ALL WORDS TEST" />}
    />
  );
}

export function AllWordAnswerSheets({
  projects,
  indexOf,
  measureKey,
}: {
  projects: TestBookProjectInput[];
  indexOf: (id: string) => number;
  measureKey: string;
}) {
  const rows = allVocabRows(projects, indexOf);
  const chunks: AllRow[][] = [];
  for (let i = 0; i < rows.length; i += 6) chunks.push(rows.slice(i, i + 6));
  const blocks: Block[] = chunks.map((c, i) => ({
    key: `wa${i}`,
    node: (
      <dl className="tb-arow">
        <dt>{i === 0 ? "전체 단어" : ""}</dt>
        <dd>
          {c.map((r) => (
            <span key={r.no}>
              <b>{r.no}</b>
              {r.row.meaning}
            </span>
          ))}
        </dd>
      </dl>
    ),
  }));
  return (
    <PagedSheet
      blocks={blocks}
      measureKey={measureKey}
      head={(page) => <DocHead title="정답 · 전체 단어 TEST" sub={page > 0 ? "(이어서)" : undefined} label="ANSWERS" right="정답만 싣습니다" />}
    />
  );
}

// ---------------------------------------------------------------- 동반의어·품사 테스트

export function wordTestTotal(t: WordTest): number {
  return t.meaning.length + t.synonym.length + t.forms.length;
}

export function WordTestSheets({
  index,
  project,
  test,
  measureKey,
}: {
  index: number;
  project: TestBookProjectInput;
  test: WordTest;
  measureKey: string;
}) {
  const blocks: Block[] = [{ key: "who", node: <Who total={wordTestTotal(test)} /> }];
  if (test.meaning.length) {
    blocks.push({
      key: "A",
      node: (
        <div className="tb-b">
          <div className="tb-q">
            <span className="tb-qn">A</span>지문 속 뜻 쓰기 <small>{test.meaning.length}문항</small>
          </div>
          <div className="tb-words">
            {test.meaning.map((m) => (
              <div key={m.no} className="tb-wq">
                <span className="tb-i">{m.no}</span>
                <span className="tb-en">{m.word}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    });
  }
  if (test.synonym.length) {
    blocks.push({
      key: "B",
      node: (
        <div className="tb-q">
          <span className="tb-qn">B</span>동의어 · 반의어 고르기 <small>= 같은 뜻 · ↔ 반대 뜻</small>
        </div>
      ),
    });
    test.synonym.forEach((s) =>
      blocks.push({
        key: `B${s.no}`,
        node: (
          <div className="tb-mc">
            <span className="tb-tip">{s.no}</span>
            <div>
              <b className="tb-en">{s.word}</b>
              <span className="tb-rel">{s.rel}</span>
              <div className="tb-ch tb-en">
                {s.choices.map((c, j) => (
                  <span key={j}>
                    {circled(j)} {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ),
      })
    );
  }
  if (test.forms.length) {
    blocks.push({
      key: "C",
      node: (
        <div className="tb-b">
          <div className="tb-q">
            <span className="tb-qn">C</span>품사 바꾸기 <small>주어진 품사로 바꿔 쓰기</small>
          </div>
          <div className="tb-words">
            {test.forms.map((f) => (
              <div key={f.no} className="tb-wq">
                <span className="tb-i">{f.no}</span>
                <span>
                  <span className="tb-en">{f.word}</span> ({f.pos}) → {POS_NAME[f.toPos] ?? f.toPos}
                </span>
              </div>
            ))}
          </div>
        </div>
      ),
    });
  }
  return (
    <PagedSheet
      blocks={blocks}
      measureKey={measureKey}
      head={(page) => (
        <DocHead title="동반의어 TEST" sub={page > 0 ? "(이어서)" : undefined} label={passageLabel(index, project)} right={project.source?.trim() || "WORD TEST"} />
      )}
    />
  );
}

// ---------------------------------------------------------------- 수업용 자료

export function LessonSheets({
  index,
  project,
  translation,
  measureKey,
}: {
  index: number;
  project: TestBookProjectInput;
  translation: TestBookOptions["translation"];
  measureKey: string;
}) {
  const blocks: Block[] = project.sentences.map((s, i) => ({
    key: `s${i}`,
    node: (
      <div className="tb-ss">
        <span className="tb-i">{String(i + 1).padStart(2, "0")}</span>
        <div>
          <div className="tb-en">{s.english}</div>
          {translation === "show" ? (
            <div className="tb-ko">{s.korean}</div>
          ) : translation === "hide" ? (
            <>
              <div className="tb-line" />
              {s.english.split(/\s+/).length > 22 ? <div className="tb-line" /> : null}
            </>
          ) : null}
        </div>
      </div>
    ),
  }));
  const sub = translation === "show" ? "해석 있음" : translation === "hide" ? "해석 쓰기" : "해석은 뒤쪽에";
  return (
    <PagedSheet
      blocks={blocks}
      measureKey={measureKey}
      head={(page) => (
        <DocHead title="수업용 자료 · 문장별 해석" sub={page > 0 ? "(이어서)" : sub} label={passageLabel(index, project)} right={project.source?.trim() || "수업용 자료"} />
      )}
    />
  );
}

/** 해석을 뒤쪽에 모을 때: 지문마다 해석만 */
export function TranslationBackSheets({ projects, measureKey }: { projects: TestBookProjectInput[]; measureKey: string }) {
  const blocks: Block[] = projects.flatMap((p, pi) => [
    {
      key: `h${p.id}`,
      node: (
        <div className="tb-q" style={{ marginTop: "1mm" }}>
          <span className="tb-qn">{String(pi + 1).padStart(2, "0")}</span>
          {p.title}
        </div>
      ),
    },
    ...p.sentences.map((s, i) => ({
      key: `${p.id}-${i}`,
      node: (
        <div className="tb-ss">
          <span className="tb-i">{String(i + 1).padStart(2, "0")}</span>
          <div className="tb-ko" style={{ fontSize: "9.5pt", marginTop: 0 }}>
            {s.korean}
          </div>
        </div>
      ),
    })),
  ]);
  return <PagedSheet blocks={blocks} measureKey={measureKey} head={() => <DocHead title="해석" label="TRANSLATION" />} />;
}

// ---------------------------------------------------------------- 테스트지

function ItemNode({ item }: { item: TestItem }) {
  if (item.tf) {
    return (
      <div className="tb-tf">
        <span className="tb-tip">{item.no}</span>
        <span className="tb-en">
          <Segs segs={item.text} />
        </span>
        <span className="tb-tfbox">T · F</span>
      </div>
    );
  }
  return (
    <div className="tb-it">
      <span className="tb-i">{item.no}</span>
      <div>
        {item.tag ? <div className="tb-tag">{item.tag}</div> : null}
        {item.ko && (item.chunks || !item.text.length) ? <div className="tb-ko" style={{ marginTop: 0 }}>{item.ko}</div> : null}
        {item.hint ? <div className="tb-tip">조건: {item.hint}</div> : null}
        {item.chunks ? (
          <div className="tb-chunks tb-en">
            {item.chunks.map((c, i) => (
              <span key={i}>{c}</span>
            ))}
          </div>
        ) : null}
        {item.text.length ? (
          <div className="tb-txt tb-en">
            <Segs segs={item.text} />
          </div>
        ) : null}
        {item.ko && !item.chunks && item.text.length ? <div className="tb-ko">{item.ko}</div> : null}
        {item.lead ? (
          <div className="tb-txt tb-en">
            <span className="tb-lead">{item.lead}</span> <span className="tb-blank" style={{ minWidth: "120mm" }} />
          </div>
        ) : null}
        {Array.from({ length: item.lines ?? 0 }).map((_, i) => (
          <div key={i} className="tb-line" />
        ))}
      </div>
    </div>
  );
}

/** 문항 하나하나를 덩어리로(발문은 첫 문항과 함께 둔다) */
function sectionBlocks(sec: TestSection, n: number, prefix: string): Block[] {
  const title = (
    <div className="tb-q">
      <span className="tb-qn">{n}</span>
      {sec.title}
      {sec.hint ? <small>{sec.hint}</small> : null}
    </div>
  );
  const top = (
    <>
      {title}
      {sec.box ? (
        <div className="tb-box tb-en">
          {sec.box.map((b) => (
            <span key={b}>{b}</span>
          ))}
        </div>
      ) : null}
      {sec.given ? <div className="tb-given tb-en">{sec.given}</div> : null}
      {sec.passage ? (
        <p className="tb-psg tb-en">
          <Segs segs={sec.passage} />
        </p>
      ) : null}
      {sec.passageKo ? (
        <>
          <div className="tb-kol">[해석]</div>
          <p className="tb-psg tb-ko">{sec.passageKo}</p>
        </>
      ) : null}
    </>
  );
  if (sec.inline) return [{ key: `${prefix}-${sec.type}`, node: <div className="tb-b">{top}</div> }];
  if (sec.type === "words") {
    return [
      {
        key: `${prefix}-${sec.type}`,
        node: (
          <div className="tb-b">
            {top}
            <div className="tb-words">
              {sec.items.map((it) => (
                <div key={it.no} className="tb-wq">
                  <span className="tb-i">{it.no}</span>
                  <span>
                    <Segs segs={it.text} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        ),
      },
    ];
  }
  if (!sec.items.length || sec.type === "sequence") {
    return [
      {
        key: `${prefix}-${sec.type}`,
        node: (
          <div className="tb-b">
            {top}
            {sec.items.map((it) => (
              <div key={it.no} className="tb-it">
                <span className="tb-i" style={{ fontWeight: 700, color: "#15171c" }}>
                  {it.no}
                </span>
                <div className="tb-txt tb-en">
                  <Segs segs={it.text} />
                </div>
              </div>
            ))}
            {sec.type === "sequence" || sec.type === "insert" ? (
              <div className="tb-txt">
                정답 <span className="tb-blank" style={{ minWidth: "50mm" }} />
              </div>
            ) : null}
          </div>
        ),
      },
    ];
  }
  return sec.items.map((it, i) => ({
    key: `${prefix}-${sec.type}-${i}`,
    node: (
      <div className={i === sec.items.length - 1 ? "tb-b" : undefined}>
        {i === 0 ? top : null}
        <ItemNode item={it} />
      </div>
    ),
  }));
}

export function sheetTotal(sheet: TestSheet): number {
  return sheet.sections.reduce((n, s) => n + (s.items.length && s.type !== "sequence" ? s.items.length : 1), 0);
}

export function TestSheets({
  index,
  project,
  sheet,
  title,
  measureKey,
}: {
  index: number;
  project: TestBookProjectInput;
  sheet: TestSheet;
  /** 「테스트 견본」·「테스트」 */
  title: string;
  measureKey: string;
}) {
  const blocks: Block[] = [
    { key: "who", node: <Who total={sheetTotal(sheet)} /> },
    ...sheet.sections.flatMap((sec, i) => sectionBlocks(sec, i + 1, project.id)),
  ];
  return (
    <PagedSheet
      blocks={blocks}
      measureKey={measureKey}
      head={(page) => <DocHead title={title} sub={page > 0 ? "(이어서)" : undefined} label={passageLabel(index, project)} right={project.source?.trim() || "TEST"} />}
      foot={(page, total) => (
        <>
          <span>{project.title}</span>
          <span>
            {page + 1} / {total}
          </span>
        </>
      )}
    />
  );
}

// ---------------------------------------------------------------- 백지노트

export function BlankNoteSheets({ index, project }: { index: number; project: TestBookProjectInput }) {
  const label = passageLabel(index, project);
  return (
    <>
      <div className="tb-sheet tb-part">
        <div className="tb-note">
          <DocHead title="백지노트" sub="1/2" label={label} right={project.source?.trim() || "BLANK NOTE"} />
          <div className="tb-psgbox">
            <div className="tb-lb">
              <span>원문</span>
              <span>표시·메모하며 읽기</span>
            </div>
            <p className="tb-en">{project.sentences.map((s) => s.english).join(" ")}</p>
          </div>
          <div className="tb-fill">
            <div className="tb-lb">
              <b>동반의어 정리</b>
              <span>단어 · 뜻 · 동의어 = · 반의어 ↔</span>
            </div>
            <div className="tb-synhead">
              <span>단어</span>
              <span>뜻</span>
              <span>= 동의어</span>
              <span>↔ 반의어</span>
            </div>
            <div className="tb-gridlines tb-syn" />
          </div>
        </div>
      </div>
      <div className="tb-sheet tb-part">
        <div className="tb-note">
          <DocHead title="백지노트" sub="2/2" label={label} right={project.source?.trim() || "BLANK NOTE"} />
          <div className="tb-fill" style={{ flex: 1.1 }}>
            <div className="tb-lb">
              <b>중요 내용 정리</b>
              <span>주제 · 흐름 · 문법 · 서술형 포인트</span>
            </div>
            <div className="tb-gridlines tb-num" />
          </div>
          <div className="tb-fill">
            <div className="tb-lb">
              <b>테스트에서 틀린 것 다시 쓰기</b>
              <span>날짜 &nbsp;&nbsp;/ &nbsp;&nbsp;· &nbsp;&nbsp;/ &nbsp;&nbsp;· &nbsp;&nbsp;/</span>
            </div>
            <div className="tb-ticks">
              {["단어", "해석", "빈칸", "어법", "어휘", "어순", "T/F", "영작", "연결어"].map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <div className="tb-gridlines tb-num" />
          </div>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------- 정답지

function sectionAnswer(sec: TestSection): ReactNode {
  if (sec.answer) return sec.answer;
  return sec.items.map((it) => (
    <span key={it.no}>
      <b>{it.no}</b>
      {it.answer}
    </span>
  ));
}

export function AnswerSheets({
  entries,
  measureKey,
  title = "정답",
}: {
  entries: Array<{ index: number; project: TestBookProjectInput; word?: WordTest; sheet?: TestSheet; heading?: string }>;
  measureKey: string;
  title?: string;
}) {
  // 지문 머리 + 단어 정답은 한 덩어리, 유형 정답은 문항마다 덩어리 — 길어지면 쪽을 넘긴다
  const blocks: Block[] = entries.flatMap((e, k) => {
    const head: Block = {
      key: `a${k}-${e.project.id}`,
      node: (
        <div className="tb-ans" style={{ marginTop: k ? "2.6mm" : 0 }}>
          <h3>
            <span>{String(e.index + 1).padStart(2, "0")}</span>
            {e.project.title}
            {e.heading ? <span style={{ marginLeft: "2mm" }}>{e.heading}</span> : null}
          </h3>
          {e.word ? (
            <>
              {e.word.meaning.length ? (
                <dl className="tb-arow">
                  <dt>단어 A</dt>
                  <dd>
                    {e.word.meaning.map((m) => (
                      <span key={m.no}>
                        <b>{m.no}</b>
                        {m.answer}
                      </span>
                    ))}
                  </dd>
                </dl>
              ) : null}
              {e.word.synonym.length ? (
                <dl className="tb-arow">
                  <dt>단어 B</dt>
                  <dd>
                    {e.word.synonym.map((x) => (
                      <span key={x.no}>
                        <b>{x.no}</b>
                        {circled(x.answer)}
                      </span>
                    ))}
                  </dd>
                </dl>
              ) : null}
              {e.word.forms.length ? (
                <dl className="tb-arow">
                  <dt>단어 C</dt>
                  <dd>
                    {e.word.forms.map((f) => (
                      <span key={f.no}>
                        <b>{f.no}</b>
                        {f.answer}
                      </span>
                    ))}
                  </dd>
                </dl>
              ) : null}
            </>
          ) : null}
        </div>
      ),
    };
    const rows: Block[] = (e.sheet?.sections ?? []).flatMap((sec, i) => {
      const label = `${i + 1} ${testBookTypeLabel(sec.type)}`;
      // 긴 답(해석·영작 문장)은 문항마다 한 줄, 짧은 답은 한 줄에 모은다
      const long = !sec.answer && sec.items.some((it) => it.answer.length > 24);
      if (!long) {
        return [
          {
            key: `a${k}-${sec.type}`,
            node: (
              <dl className="tb-arow">
                <dt>{label}</dt>
                <dd>{sectionAnswer(sec)}</dd>
              </dl>
            ),
          },
        ];
      }
      return sec.items.map((it, j) => ({
        key: `a${k}-${sec.type}-${j}`,
        node: (
          <dl className="tb-arow">
            <dt>{j === 0 ? label : ""}</dt>
            <dd>
              <b>{it.no}</b>
              {it.answer}
            </dd>
          </dl>
        ),
      }));
    });
    return [head, ...rows];
  });
  return (
    <PagedSheet
      blocks={blocks}
      measureKey={measureKey}
      head={(page) => <DocHead title={title} sub={page > 0 ? "(이어서)" : undefined} label="ANSWERS" right="정답만 싣습니다" />}
    />
  );
}

// ---------------------------------------------------------------- 표지·목차·분석 자료

/** 표지(시안 01 색 번짐). 교재 이름·범위를 싣고 이름 칸은 비운다. */
export function CoverSheet({ title, range }: { title: string; range: string }) {
  const now = new Date();
  const season = `${now.getFullYear()} ${now.getMonth() >= 7 ? "FALL" : now.getMonth() >= 2 ? "SPRING" : "WINTER"}`;
  return (
    <div className="tb-sheet tb-cover">
      <div className="tb-glow" />
      <div className="tb-grain" />
      <div className="tb-in">
        <div className="tb-ctop">
          <span>TEST BOOK</span>
          <span>{season}</span>
        </div>
        <div className="tb-ct">
          read.
          <br />
          test.
          <br />
          note.
        </div>
        <div className="tb-crows">
          <div>
            <span>교재</span>
            <b>{title}</b>
          </div>
          <div>
            <span>범위</span>
            <b>{range}</b>
          </div>
          <div>
            <span>이름</span>
            <b>&nbsp;</b>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 교재 묶음(목차·간지·쪽 색). no는 목차 번호, color는 그 묶음 색. */
export type BookPart = { id: string; no: string; en: string; ko: string; sub?: string; color: string };

/** 묶음 안 쪽에 색·꼬리표를 넘긴다(감싸개는 display:contents라 CSS 변수만 내려간다) */
export function partStyle(part: BookPart | undefined): CSSProperties | undefined {
  if (!part) return undefined;
  return { ["--tb-accent" as string]: part.color, ["--tb-part" as string]: `"PART ${part.no} · ${part.en}"` } as CSSProperties;
}

/**
 * 목차(통합자료 목차와 같은 꼴). 쪽 번호는 화면이 그린 쪽을 세어 넣는다
 * (pages: 묶음 id → 첫 쪽, total: 전체 쪽 수, 표지가 1쪽).
 */
export function ContentsSheet({
  parts,
  pages,
  total,
  title,
  range,
}: {
  parts: BookPart[];
  pages: Record<string, number>;
  total: number;
  title: string;
  range: string;
}) {
  return (
    <div className="tb-sheet tb-contents">
      <h2>CONTENTS</h2>
      <div className="tb-cbar" />
      <ol>
        {parts.map((p, i) => {
          const from = pages[p.id];
          const next = parts.slice(i + 1).map((x) => pages[x.id]).find((n) => !!n);
          const to = from ? (next ? next - 1 : total) : undefined;
          return (
            <li key={p.id}>
              <span className="tb-cno" style={{ color: p.color }}>
                {p.no}
              </span>
              <div className="tb-cbody">
                <div className="tb-crow">
                  <span className="tb-cen">{p.en}</span>
                  <span className="tb-cpg">{from ? (to && to > from ? `p. ${from} ~ ${to}` : `p. ${from}`) : ""}</span>
                </div>
                <div className="tb-cko">
                  <b>{p.ko}</b>
                  {p.sub}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="tb-cfoot">
        <b>{title}</b>
        <span>{range}</span>
      </div>
    </div>
  );
}

/** 간지: 묶음 첫 쪽. 지문마다 이 묶음에서 시작하는 쪽을 싣는다. */
export function DividerSheet({
  part,
  items,
  title,
}: {
  part: BookPart;
  items: Array<{ id: string; index: number; title: string; source: string | null; page?: number }>;
  title: string;
}) {
  return (
    <div className="tb-sheet tb-divider">
      <div className="tb-dstrip" />
      <div className="tb-din">
        <div className="tb-dpart">PART {part.no}</div>
        <h2>{part.en}</h2>
        <div className="tb-dbar" />
        <div className="tb-dko">{part.ko}</div>
        {part.sub ? <div className="tb-dsub">{part.sub}</div> : null}
        {items.length ? (
          <div className="tb-dlist">
            {items.map((it) => (
              <div key={it.id}>
                <i>{String(it.index + 1).padStart(2, "0")}</i>
                <span>
                  {it.title}
                  {it.source?.trim() ? <small>{it.source.trim()}</small> : null}
                </span>
                <em>{it.page ?? ""}</em>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <div className="tb-dfoot">
        <b>{title}</b>
        PART {part.no} · {part.ko}
      </div>
    </div>
  );
}

/** 분석 자료: 분석서의 주제·문장 분석을 테스트 교재 쪽에 싣는다(분석서가 있는 지문만). */
export function AnalysisSheets({
  index,
  project,
  translation = "full",
  measureKey,
}: {
  index: number;
  project: TestBookProjectInput;
  /** 전체 해석 · 직독직해(분석서 화면과 같은 선택) */
  translation?: "full" | "chunk";
  measureKey: string;
}) {
  const report = project.analysis;
  if (!report?.sentences?.length) return null;
  const blocks: Block[] = [];
  if (report.topicEn?.trim() || report.topicKo?.trim()) {
    blocks.push({
      key: "topic",
      node: (
        <div className="tb-an-topic">
          <b>TOPIC</b>
          <span className="tb-en">{report.topicEn?.trim()}</span>
          {report.topicKo?.trim() ? <div className="tb-ko">{report.topicKo.trim()}</div> : null}
        </div>
      ),
    });
  }
  report.sentences.forEach((s, i) => {
    const plain = s.enChunks.map((c) => c.text).join(" ").trim();
    const markup = readAnalysisMarkup(s.markup, plain);
    const extra = (s.contextNote ?? "").trim() || (s.easyUnderstanding ?? "").trim();
    blocks.push({
      key: `s${i}`,
      node: markup ? (
        <AnalysisMarkupSentence markup={markup} index={i} extraNote={extra || undefined} translationMode={translation} />
      ) : (
        <div className="tb-an-s">
          <div className="tb-ss">
            <span className="tb-i">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <div className="tb-en">{plain}</div>
              <div className="tb-ko">{s.koChunks.join(" ")}</div>
              {extra ? <div className="tb-tip">{extra}</div> : null}
            </div>
          </div>
        </div>
      ),
    });
  });
  return (
    <PagedSheet
      blocks={blocks}
      measureKey={measureKey}
      head={(page) => (
        <DocHead title="분석 자료" sub={page > 0 ? "(이어서)" : undefined} label={passageLabel(index, project)} right={project.source?.trim() || "ANALYSIS"} />
      )}
    />
  );
}

/** 지문 간지: 묶음 안에서 지문이 시작하는 쪽. 지문 번호를 크게, 이 묶음에서 이어질 쪽을 차례로 싣는다. */
export function PassageDividerSheet({
  part,
  index,
  project,
  next,
  title,
}: {
  part: BookPart;
  index: number;
  project: { title: string; titleEn: string | null; source: string | null };
  /** 이 지문에서 이어지는 쪽 이름(단어 정리 · 문장별 해석 …) */
  next: string[];
  title: string;
}) {
  const no = String(index + 1).padStart(2, "0");
  return (
    <div className="tb-sheet tb-pdiv">
      <div className="tb-ptop">
        <div className="tb-ppart">
          PART {part.no} · {part.en.toUpperCase()}
        </div>
        <div className="tb-pno">
          <small>PASSAGE</small>
          {no}
        </div>
      </div>
      <div className="tb-pin">
        {project.source?.trim() ? <div className="tb-psrc">{project.source.trim()}</div> : null}
        <h2>{project.title}</h2>
        {project.titleEn?.trim() ? <div className="tb-pen">{project.titleEn.trim()}</div> : null}
        <div className="tb-pbar" />
        {next.length ? (
          <div className="tb-pnext">
            {next.map((n, i) => (
              <div key={n}>
                <i>{i + 1}</i>
                {n}
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <div className="tb-pfoot">
        <span>{title}</span>
        <span>
          PART {part.no} · {part.ko} · 지문 {no}
        </span>
      </div>
    </div>
  );
}

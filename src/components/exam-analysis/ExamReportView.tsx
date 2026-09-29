"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Icon } from "@/components/layout/NavIcon";
import { ExamDeleteButton } from "@/components/exam-analysis/ExamDeleteButton";
import { readingBand } from "@/lib/exam-analysis/reading-level";
import {
  EXAM_CATEGORIES,
  EXAM_LEVELS,
  EXAM_TYPE_CHOICES,
  type ExamAnalysisRow,
  type ExamItemRow,
  type ExamLevel,
} from "@/lib/exam-analysis/types";

/** 보고서 색: 크림 바탕 위 주황·남색 (승인된 A4 두 쪽 시안) */
const CREAM = "#fbf7ef";
const LINE = "#e8dcc5";
const SOFT = "#6b5f4b";
const NAVY = "#29335c";
const LV_BG: Record<ExamLevel, string> = { 하: "#f1e3c6", 중: "#f3a712", 상: "#e4572e" };
const LV_INK: Record<ExamLevel, string> = { 하: SOFT, 중: "#fff", 상: "#fff" };
/** 지문 출처 색 — 난이도 색과 겹치지 않게 골랐다 */
const SRC_BG: Record<string, string> = {
  교과서: "#29335c",
  모의고사: "#669bbc",
  수업자료: "#a8c686",
  "못 찾음": "#ded3bb",
};
const CAT_COLOR: Record<string, string> = {
  "대의 파악": "#e4572e",
  "세부 정보": "#29335c",
  "논리·추론": "#f3a712",
  "어법·어휘": "#669bbc",
  서술형: "#a8c686",
  기타: "#b8ad98",
};

const r1 = (x: number) => Math.round(x * 10) / 10;
const sum = (xs: (number | null)[]) => xs.reduce<number>((s, x) => s + (Number(x) || 0), 0);

function Donut({ parts, total }: { parts: { c: string; n: number }[]; total: number }) {
  const R = 98;
  const r = 60;
  let a = -Math.PI / 2;
  const n = sum(parts.map((p) => p.n)) || 1;
  const P = (ang: number, rad: number) => `${R + rad * Math.cos(ang)} ${R + rad * Math.sin(ang)}`;
  return (
    <svg viewBox="0 0 196 196" width="196" height="196" role="img" aria-label="영역별 문항 수">
      {parts.map((p) => {
        // 한 영역만 있으면 원 하나
        if (p.n === n) {
          return (
            <g key={p.c}>
              <circle cx={R} cy={R} r={(R + r) / 2} fill="none" stroke={CAT_COLOR[p.c]} strokeWidth={R - r} />
            </g>
          );
        }
        const a2 = a + (p.n / n) * Math.PI * 2;
        const big = a2 - a > Math.PI ? 1 : 0;
        const d = `M ${P(a, R)} A ${R} ${R} 0 ${big} 1 ${P(a2, R)} L ${P(a2, r)} A ${r} ${r} 0 ${big} 0 ${P(a, r)} Z`;
        a = a2;
        return <path key={p.c} d={d} fill={CAT_COLOR[p.c]} />;
      })}
      <text x={R} y={R} textAnchor="middle" fontSize="32" fontWeight="700" fill="#1f2937">
        {total}
      </text>
      <text x={R} y={R + 20} textAnchor="middle" fontSize="11" fill={SOFT}>
        문항
      </text>
    </svg>
  );
}

/** A4 한 쪽 (화면에서도 794×1123px, 인쇄는 210×297mm) */
function A4Page({ children, footer }: { children: ReactNode; footer: string }) {
  return (
    <section
      className="exam-a4 relative flex min-h-[1123px] w-[794px] shrink-0 flex-col gap-[18px] px-[50px] pb-[52px] pt-[48px] text-[12.5px] leading-normal text-[#1f2937] shadow-[0_8px_26px_rgb(15_25_40/0.16)]"
      style={{ background: CREAM }}
    >
      {children}
      <div
        className="absolute bottom-[22px] left-[50px] right-[50px] flex justify-between border-t pt-1.5 text-[10px]"
        style={{ borderColor: LINE, color: SOFT }}
      >
        <span>{footer}</span>
      </div>
    </section>
  );
}

export function ExamReportView({
  analysis,
  items: initialItems,
  academyName,
  listHref,
  mocks = [],
  generationsHref,
}: {
  analysis: ExamAnalysisRow;
  items: ExamItemRow[];
  academyName: string;
  listHref: string;
  /** 이 시험으로 만든 동형모의고사 */
  mocks?: { id: string; title: string; created_at: string; status: string }[];
  generationsHref: string;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  // 수업자료 대조를 켜고 끄면 서버가 적중 칸을 다시 채운다 → 새 문항표로 바꾼다
  useEffect(() => setItems(initialItems), [initialItems]);
  const [matchOn, setMatchOn] = useState(analysis.match_materials);
  const [matchBusy, setMatchBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editMeta, setEditMeta] = useState(false);
  const [meta, setMeta] = useState({
    schoolName: analysis.school_name ?? "",
    grade: analysis.grade ?? "",
    subject: analysis.subject ?? "",
    examLabel: analysis.exam_label ?? "",
  });
  const [saving, setSaving] = useState(false);

  const s = useMemo(() => {
    const total = r1(sum(items.map((i) => i.points)));
    const subj = items.filter((i) => i.is_subjective);
    const hard = items.filter((i) => i.level === "상");
    const matched = items.filter((i) => i.matched_item_id);
    const cats = EXAM_CATEGORIES.map((c) => {
      const list = items.filter((i) => i.category === c);
      return { c, n: list.length, pts: r1(sum(list.map((i) => i.points))) };
    }).filter((x) => x.n > 0);
    const levels = EXAM_LEVELS.map((l) => {
      const list = items.filter((i) => i.level === l);
      return { l, n: list.length, pts: r1(sum(list.map((i) => i.points))) };
    });
    /*
     * 지문 출처별 갈래 — 이득희 선생님 요청(2026-09-29).
     * "지난번 서술형 포함하면 교과서에서 70%가 나왔습니다. 이런 데이터가 없다면
     * 70%라는 확률도 나오지 않기에 분석지가 더 꼼꼼하게 작성되어 있으면 좋겠습니다."
     *
     * 짐작하지 않고 글자로 대조해 맞은 것만 센다. 한 문항이 교과서와 모의고사에
     * 모두 걸리면 교과서를 앞세운다(학교 시험은 교과서가 먼저다).
     */
    const hasPassage = items.filter((i) => String(i.passage_excerpt ?? "").trim());
    const fromTextbook = hasPassage.filter((i) => i.matched_textbook_id);
    const fromMock = hasPassage.filter((i) => !i.matched_textbook_id && i.matched_mock_id);
    const fromMaterial = hasPassage.filter(
      (i) => !i.matched_textbook_id && !i.matched_mock_id && i.matched_item_id
    );
    const fromUnknown = hasPassage.filter(
      (i) => !i.matched_textbook_id && !i.matched_mock_id && !i.matched_item_id
    );
    const sources = [
      { key: "교과서", list: fromTextbook },
      { key: "모의고사", list: fromMock },
      { key: "수업자료", list: fromMaterial },
      { key: "못 찾음", list: fromUnknown },
    ]
      .map((x) => ({
        key: x.key,
        n: x.list.length,
        pts: r1(sum(x.list.map((i) => i.points))),
        subjPts: r1(sum(x.list.filter((i) => i.is_subjective).map((i) => i.points))),
      }))
      .filter((x) => x.n > 0);
    const passagePts = r1(sum(hasPassage.map((i) => i.points)));
    /*
     * 이 학교가 어느 교과서를 쓰는지 — 맞은 본문의 출판사·과목으로 센다.
     * 상담에서 「이 학교는 천재(조수경) 영어1을 씁니다」가 바로 나오게 하려는 것이다.
     * 출처 표시는 「천재(조수경) 영어1 1과 본문4」 꼴이라 앞 두 마디가 교재 이름이다.
     */
    const bookCount = new Map<string, number>();
    for (const i of fromTextbook) {
      const book = String(i.matched_textbook_label ?? "").split(" ").slice(0, 2).join(" ");
      if (book) bookCount.set(book, (bookCount.get(book) ?? 0) + 1);
    }
    const books = [...bookCount.entries()].sort((a, b) => b[1] - a[1]);

    const avg = items.length ? r1(sum(items.map((i) => i.difficulty)) / items.length) : 0;
    const subjPts = r1(sum(subj.map((i) => i.points)));
    const decisive = hard
      .slice()
      .sort((x, y) => (y.points ?? 0) - (x.points ?? 0) || y.difficulty - x.difficulty)
      .slice(0, 4);
    return { total, subj, subjPts, hard, matched, cats, levels, avg, decisive, sources, hasPassage, passagePts, books };
  }, [items]);
  const pct = (x: number) => (s.total ? Math.round((x / s.total) * 100) : 0);

  async function saveItem(id: string, patch: { typeName?: string; level?: ExamLevel; points?: number | null }) {
    const before = items;
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              ...(patch.typeName ? { type_name: patch.typeName } : {}),
              ...(patch.level ? { level: patch.level, difficulty: patch.level === "상" ? 4 : patch.level === "하" ? 2 : 3 } : {}),
              ...("points" in patch ? { points: patch.points ?? null } : {}),
              edited: true,
            }
          : it
      )
    );
    const res = await fetch(`/api/exam-analysis/${analysis.id}/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) setItems(before);
    else if (patch.typeName) router.refresh();
  }

  async function saveMeta() {
    setSaving(true);
    await fetch(`/api/exam-analysis/${analysis.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(meta),
    });
    setSaving(false);
    setEditMeta(false);
    router.refresh();
  }

  async function toggleMatch() {
    setMatchBusy(true);
    const next = !matchOn;
    const res = await fetch(`/api/exam-analysis/${analysis.id}/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: next }),
    });
    setMatchBusy(false);
    if (res.ok) {
      setMatchOn(next);
      router.refresh();
    }
  }

  const title = [meta.schoolName || "학교 미입력", meta.grade ? `${meta.grade}학년` : "", meta.subject].filter(Boolean).join(" ");
  const examLine = [meta.examLabel, `선택형 ${items.length - s.subj.length} · 서술형 ${s.subj.length}문항`, `${s.total}점`]
    .filter(Boolean)
    .join(" · ");
  const footer = `${academyName} · 내신 시험 분석 · ${title}`;
  const showMatched = matchOn && s.matched.length > 0;
  /*
   * 문항표를 A4 한 장에 들어갈 만큼씩 잘라 여러 쪽에 싣는다.
   *
   * 선생님 말씀(2026-09-30): 내용이 길어 한 장을 넘어가는데, 쪽이 늘어나도 좋으니
   * 한 장이 A4에 맞게 나오게 해 달라. 인쇄 CSS가 A4로 자르고 넘치는 것은 버리므로,
   * 그대로 두면 뒤쪽 문항이 아예 안 보인다.
   *
   * 줄 높이가 문항마다 다르다(난이도 근거·교과서 출처가 길면 두세 줄이 된다).
   * 그래서 개수가 아니라 글자 수로 어림한 무게를 쌓아 나눈다.
   */
  const itemPages = useMemo(() => {
    // A4(1123px)에서 위아래 여백과 머리말·표머리·합계줄을 뺀 나머지
    const ROOM = 900;
    const ROW = 27; // 한 줄짜리 문항의 높이
    const LINE = 14; // 딸린 글 한 줄
    const PER_LINE = 88; // 온 폭이라 한 줄에 여든여덟 자쯤 들어간다
    const heightOf = (i: (typeof items)[number]) => {
      const notes = [
        i.conditions && `조건: ${i.conditions}`,
        i.grammar_point && `문법: ${i.grammar_point}`,
        i.difficulty_reason,
        i.matched_textbook_label && `교과서: ${i.matched_textbook_label}`,
        i.matched_label && `수업자료: ${i.matched_label}`,
        i.matched_mock_label && `출처: ${i.matched_mock_label}`,
      ].filter(Boolean) as string[];
      const lines = notes.reduce((n, t) => n + Math.max(1, Math.ceil(t.length / PER_LINE)), 0);
      return ROW + lines * LINE;
    };
    /*
     * 마지막 장 아래에 「다음 시험 대비 전략」이 들어가므로 그만큼 자리를 비워 둔다.
     * 선생님 지적(2026-09-30): 서술형이 오른쪽에 따로 떠 있고 뒷장은 표만 길게
     * 나와 어색하다. 서술형 조건·문법은 표 안으로 넣고 전략만 끝에 붙인다.
     */
    const strategyRoom =
      analysis.strategy.length === 0
        ? 0
        : 30 +
          analysis.strategy.reduce((n, t) => n + Math.max(1, Math.ceil(t.length / 82)) * 18, 0);

    const heights = items.map(heightOf);
    const total = heights.reduce((a2, b2) => a2 + b2, 0);
    // 전략까지 마지막 장에 들어갈 수 있는지 보고 장 수를 정한다
    const pages = Math.max(1, Math.ceil((total + strategyRoom) / ROOM));
    const perPage = (total + strategyRoom) / pages;

    const out: (typeof items)[] = [];
    let cur: typeof items = [];
    let used = 0;
    items.forEach((it, idx) => {
      const h = heights[idx]!;
      const limit = out.length === pages - 1 ? ROOM - strategyRoom : Math.min(ROOM, perPage + 60);
      if (cur.length && used + h > limit) {
        out.push(cur);
        cur = [];
        used = 0;
      }
      cur.push(it);
      used += h;
    });
    if (cur.length) out.push(cur);
    return out.length ? out : [[]];
  }, [items, analysis.strategy]);

  const pageTotal = 1 + itemPages.length + (showMatched ? 1 : 0);
  const h3 = "mb-[7px] text-[13.5px] font-bold";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <Link href={listHref} className="inline-flex items-center gap-1 text-[13px] font-medium text-slate-500 hover:text-slate-900">
          <Icon name="left" size={16} />
          시험 분석 목록
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`${listHref}/${analysis.id}/mock`}
            className="inline-flex h-9 items-center rounded-lg bg-brand-600 px-3.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            동형모의고사 만들기
          </Link>
          <button
            type="button"
            onClick={() => setEditMeta((v) => !v)}
            className="h-9 rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            시험 정보 고치기
          </button>
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className={`h-9 rounded-lg border px-3.5 text-sm font-semibold ${editing ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}
          >
            {editing ? "고치기 끝" : "문항표 고치기"}
          </button>
          <button
            type="button"
            onClick={toggleMatch}
            disabled={matchBusy}
            title="시험 지문이 우리 학원 수업자료 지문과 같은지 대조해요"
            className={`h-9 rounded-lg border px-3.5 text-sm font-semibold disabled:opacity-50 ${matchOn ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"}`}
          >
            {matchBusy ? "대조 중…" : matchOn ? "수업자료 대조 켜짐" : "수업자료 대조 꺼짐"}
          </button>
          <ExamDeleteButton id={analysis.id} label={title} redirectTo={listHref} variant="button" />
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Icon name="print" size={15} /> 인쇄 / PDF
          </button>
        </div>
      </div>

      {mocks.length ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm print:hidden">
          <span className="font-semibold text-slate-700">만든 동형모의고사</span>
          {mocks.map((m) => (
            <Link key={m.id} href={`${generationsHref}/${m.id}`} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100">
              {new Date(m.created_at).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              {m.status !== "completed" ? " · 만드는 중" : ""}
            </Link>
          ))}
        </div>
      ) : null}

      {editMeta ? (
        <div className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-[repeat(4,minmax(0,1fr))_auto] print:hidden">
          {(["schoolName", "grade", "subject", "examLabel"] as const).map((k) => (
            <input
              key={k}
              id={`meta-${k}`}
              className="ui-input h-9 text-sm"
              value={meta[k]}
              placeholder={{ schoolName: "학교", grade: "학년 (예: 1)", subject: "과목", examLabel: "시험 (예: 2026 1학기 중간)" }[k]}
              onChange={(e) => setMeta({ ...meta, [k]: e.target.value })}
            />
          ))}
          <button type="button" onClick={saveMeta} disabled={saving} className="h-9 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white disabled:opacity-50">
            저장
          </button>
        </div>
      ) : null}

      {analysis.missing ? (
        <p className="rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-800 print:hidden">
          올라온 시험지에 빠진 부분이 있어요: {analysis.missing}. 빠진 문항은 보고서에 넣지 않았어요.
        </p>
      ) : null}

      <div className="overflow-x-auto print:overflow-visible">
        <div id="exam-report-print-root" className="mx-auto flex w-[794px] flex-col gap-5">
          {/* 1쪽: 요약 */}
          <A4Page footer={`${footer} · 1 / ${pageTotal}`}>
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <span className="inline-block rounded-[3px] bg-[#1f2937] px-[9px] py-1 text-[10.5px] font-bold tracking-[0.1em]" style={{ color: CREAM }}>
                  EXAM REPORT
                </span>
                <h1 className="mb-0.5 mt-2 text-[27px] font-bold leading-tight tracking-tight">{title}</h1>
                <p style={{ color: SOFT }}>{examLine}</p>
              </div>
              <div className="shrink-0 text-right text-[11px]" style={{ color: SOFT }}>
                <b className="block text-[14px] text-[#1f2937]">{academyName}</b>
                분석일 {new Date(analysis.created_at).toLocaleDateString("ko-KR")}
              </div>
            </div>

            <div className={`grid gap-[9px] ${showMatched ? "grid-cols-5" : "grid-cols-4"}`}>
              {[
                { v: `${items.length}`, l: "전체 문항" },
                { v: `${s.subjPts}`, l: `서술형 배점 · ${pct(s.subjPts)}%` },
                { v: `${s.avg}`, l: "평균 난이도 / 5" },
                { v: `${s.hard.length}`, l: `고난도 문항 · ${r1(sum(s.hard.map((i) => i.points)))}점` },
                ...(showMatched ? [{ v: `${s.matched.length}`, l: `수업자료 적중 · ${Math.round((s.matched.length / items.length) * 100)}%` }] : []),
              ].map((k) => (
                <div key={k.l} className="rounded-[14px] bg-white px-[13px] py-[11px]">
                  <b className="block text-[29px] leading-[1.1] tabular-nums">{k.v}</b>
                  <span className="text-[11.5px]" style={{ color: SOFT }}>
                    {k.l}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-[196px_1fr_1fr] items-center gap-5">
              <Donut parts={s.cats} total={items.length} />
              <div>
                <h3 className={h3} style={{ color: NAVY }}>
                  영역별
                </h3>
                {s.cats.map((c) => (
                  <div key={c.c} className="flex justify-between border-b border-dashed py-1" style={{ borderColor: LINE }}>
                    <span>
                      <i className="mr-1.5 inline-block h-[9px] w-[9px] rounded-full align-[-1px]" style={{ background: CAT_COLOR[c.c] }} />
                      {c.c}
                    </span>
                    <b className="tabular-nums">
                      {c.n}문항 · {c.pts}점
                    </b>
                  </div>
                ))}
              </div>
              <div>
                <h3 className={h3} style={{ color: NAVY }}>
                  난이도별
                </h3>
                {s.levels.map((l) => (
                  <div key={l.l} className="border-b border-dashed py-1" style={{ borderColor: LINE }}>
                    <div className="flex justify-between">
                      <span>
                        <i className="mr-1.5 inline-block h-[9px] w-[9px] rounded-full align-[-1px]" style={{ background: LV_BG[l.l] }} />
                        {l.l}
                      </span>
                      <b className="tabular-nums">
                        {l.n}문항 · {l.pts}점 ({pct(l.pts)}%)
                      </b>
                    </div>
                    <span className="mt-[3px] block h-[5px] overflow-hidden rounded-full bg-white">
                      <span className="block h-full rounded-full" style={{ width: `${pct(l.pts)}%`, background: LV_BG[l.l] }} />
                    </span>
                  </div>
                ))}
                {/*
                  Jayden 선생님 물음(2026-09-29): "상중하 분류로 나뉘는 건 기준이 있나요?"
                  기준은 있었는데 화면에 없어서 상담에서 답할 근거가 보이지 않았다.
                  문항마다 근거 한 문장도 따로 적어 두니 함께 보이게 한다.
                */}
                <p className="mt-[7px] text-[10.5px] leading-[1.5]" style={{ color: SOFT }}>
                  해당 학년 학생을 기준으로 <b>지문 길이 · 어휘 수준 · 유형 자체의 난도 ·
                  선택지의 매력도 · 서술형 조건 수</b> 다섯 가지를 보고 1~5점을 매겨 상·중·하로
                  나눕니다.
                </p>
              </div>
            </div>

            {s.sources.length ? (
              <div>
                <h3 className={h3} style={{ color: NAVY }}>
                  지문 출처별
                  {s.books.length ? (
                    <span className="ml-1.5 text-[11px] font-normal" style={{ color: SOFT }}>
                      쓰는 교재{" "}
                      <b style={{ color: NAVY }}>
                        {s.books.map(([b, n]) => `${b}(${n}문항)`).join(", ")}
                      </b>
                    </span>
                  ) : null}
                </h3>
                <div className="mb-[5px] flex h-[7px] overflow-hidden rounded-full bg-white">
                  {s.sources.map((x) => (
                    <span
                      key={x.key}
                      title={`${x.key} ${x.n}문항`}
                      style={{
                        width: `${s.passagePts ? (x.pts / s.passagePts) * 100 : 0}%`,
                        background: SRC_BG[x.key] ?? SOFT,
                      }}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-[9px]">
                  {s.sources.map((x) => (
                    <div key={x.key} className="rounded-[12px] bg-white px-[11px] py-[6px]">
                      <span className="flex items-center gap-1.5 text-[11.5px]" style={{ color: SOFT }}>
                        <i
                          className="inline-block h-[9px] w-[9px] rounded-full"
                          style={{ background: SRC_BG[x.key] ?? SOFT }}
                        />
                        {x.key}
                      </span>
                      <b className="block text-[19px] leading-[1.15] tabular-nums">
                        {s.passagePts ? Math.round((x.pts / s.passagePts) * 100) : 0}%
                      </b>
                      <span className="text-[11px] tabular-nums" style={{ color: SOFT }}>
                        {x.n}문항 · {x.pts}점
                        {x.subjPts ? ` (서술형 ${x.subjPts}점)` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div>
              <h3 className={h3} style={{ color: NAVY }}>
                문항 번호별 난이도
              </h3>
              <div className="flex flex-wrap gap-[5px]">
                {items.map((i) => (
                  <span
                    key={i.id}
                    title={`${i.item_no} ${i.type_name} · ${i.level}`}
                    className="flex h-[37px] w-[37px] items-center justify-center rounded-full text-[11px] font-bold tabular-nums"
                    style={{
                      background: LV_BG[i.level],
                      color: LV_INK[i.level],
                      boxShadow: i.is_subjective ? `0 0 0 2px ${CREAM}, 0 0 0 4px ${NAVY}` : undefined,
                    }}
                  >
                    {i.item_no.replace("서술 ", "서")}
                  </span>
                ))}
              </div>
              <p className="mt-[5px] text-[10.5px]" style={{ color: SOFT }}>
                연한색 하 · 노랑 중 · 주황 상 · 테두리 = 서술형
              </p>
            </div>

            {analysis.sentence_words || analysis.lexile || analysis.vocab_level ? (
              <div>
                <h3 className={h3} style={{ color: NAVY }}>
                  지문·보기 수준
                </h3>
                <div className="flex flex-wrap gap-x-4 gap-y-[3px]">
                  {analysis.sentence_words ? (
                    <span>평균 문장 길이 <b>{analysis.sentence_words}낱말</b></span>
                  ) : null}
                  {analysis.choice_words ? (
                    <span>영어 보기 평균 <b>{analysis.choice_words}낱말</b></span>
                  ) : null}
                  {analysis.vocab_level ? (
                    <span>어휘 수준 <b>{analysis.vocab_level}</b></span>
                  ) : null}
                  {readingBand(analysis.lexile) ? (
                    <span>읽기 수준 <b>{readingBand(analysis.lexile)} 정도</b></span>
                  ) : null}
                </div>
                {analysis.level_summary ? (
                  <p className="mt-[3px]">{analysis.level_summary}</p>
                ) : null}
                <p className="mt-[5px] text-[10.5px]" style={{ color: SOFT }}>
                  문장 길이와 보기 길이는 시험지 글자를 세어 잰 값입니다. 읽기 수준은 문장 길이와
                  낱말 난도로 어림한 것이라 참고용입니다. 동형모의고사를 만들 때 이 수준에 맞춥니다.
                </p>
              </div>
            ) : null}

            <div>
              <h3 className={h3} style={{ color: NAVY }}>
                출제 특징
              </h3>
              <ul className="list-disc space-y-[3px] pl-4">
                {analysis.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>

            {s.decisive.length ? (
              <div>
                <h3 className={h3} style={{ color: NAVY }}>
                  점수가 갈린 문항{" "}
                  <span className="text-[11px] font-semibold" style={{ color: SOFT }}>
                    난이도 상 · 배점 큰 순
                  </span>
                </h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {s.decisive.map((i) => (
                    <div key={i.id} className="rounded-[11px] bg-white px-[11px] py-2">
                      <div className="flex justify-between font-bold">
                        <span>
                          {i.item_no} · {i.type_name}
                        </span>
                        <span>{i.points ?? "–"}점</span>
                      </div>
                      <p className="mt-px text-[11px]" style={{ color: SOFT }}>
                        {(i.difficulty_reason ?? "").slice(0, 70)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </A4Page>

          {/* 2쪽부터: 문항정보표 (길면 여러 장) + 첫 장 오른쪽에 서술형·대비 전략 */}
          {itemPages.map((pageItems, pi) => (
          <A4Page key={`items-${pi}`} footer={`${footer} · ${pi + 2} / ${pageTotal}`}>
            <div className="flex items-baseline justify-between border-b-2 border-[#1f2937] pb-1.5">
              <b className="text-[15px]">
                {title} · 문항정보표
                {itemPages.length > 1 ? (
                  <span className="ml-1.5 text-[11px] font-semibold" style={{ color: SOFT }}>
                    ({pi + 1}/{itemPages.length})
                  </span>
                ) : null}
              </b>
              <span className="text-[11px]" style={{ color: SOFT }}>
                {meta.examLabel}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-[14px]">
              <div className="self-start rounded-xl bg-white px-3 py-2">
                <table className="w-full border-collapse text-[11.5px]">
                  <thead>
                    <tr className="text-left text-[10.5px]" style={{ color: SOFT }}>
                      <th className="px-1 py-1 font-semibold">번호</th>
                      <th className="px-1 py-1 font-semibold">유형</th>
                      <th className="px-1 py-1 font-semibold">난이도</th>
                      <th className="px-1 py-1 text-right font-semibold">배점</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((i) => (
                      <tr key={i.id} className="border-t align-middle" style={{ borderColor: "#f1ead9" }}>
                        <td className="whitespace-nowrap px-1 py-[3.5px] font-bold">{i.item_no}</td>
                        <td className="px-1 py-[3.5px]">
                          {editing ? (
                            <select
                              id={`type-${i.id}`}
                              className="ui-input h-7 max-w-[170px] py-0 text-[11.5px]"
                              value={i.type_name}
                              onChange={(e) => saveItem(i.id, { typeName: e.target.value })}
                            >
                              {!EXAM_TYPE_CHOICES.some((g) => g.names.includes(i.type_name)) ? <option value={i.type_name}>{i.type_name}</option> : null}
                              {EXAM_TYPE_CHOICES.map((g) => (
                                <optgroup key={g.category} label={g.category}>
                                  {g.names.map((n) => (
                                    <option key={n} value={n}>
                                      {n}
                                    </option>
                                  ))}
                                </optgroup>
                              ))}
                            </select>
                          ) : (
                            <>
                              {i.type_name}
                              {i.matched_label ? (
                                <span className="block text-[10px]" style={{ color: SOFT }}>
                                  수업자료: {i.matched_label}
                                </span>
                              ) : null}
                              {i.conditions ? (
                                <span className="block text-[10px]" style={{ color: SOFT }}>
                                  조건: {i.conditions}
                                </span>
                              ) : null}
                              {i.grammar_point ? (
                                <span className="block text-[10px]" style={{ color: NAVY }}>
                                  문법: {i.grammar_point}
                                </span>
                              ) : null}
                              {i.difficulty_reason ? (
                                <span className="block text-[10px]" style={{ color: SOFT }}>
                                  난이도 근거: {i.difficulty_reason}
                                </span>
                              ) : null}
                              {i.matched_textbook_label ? (
                                <span className="block text-[10px]" style={{ color: SOFT }}>
                                  교과서: {i.matched_textbook_label}
                                </span>
                              ) : null}
                              {i.matched_mock_label ? (
                                <span className="block text-[10px]" style={{ color: SOFT }}>
                                  출처: {i.matched_mock_label}
                                </span>
                              ) : null}
                            </>
                          )}
                        </td>
                        <td className="px-1 py-[3.5px]">
                          {editing ? (
                            <select
                              id={`level-${i.id}`}
                              className="ui-input h-7 py-0 text-[11.5px]"
                              value={i.level}
                              onChange={(e) => saveItem(i.id, { level: e.target.value as ExamLevel })}
                            >
                              {EXAM_LEVELS.map((l) => (
                                <option key={l} value={l}>
                                  {l}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="inline-block w-[22px] rounded-[3px] text-center text-[10.5px] font-bold" style={{ background: LV_BG[i.level], color: LV_INK[i.level] }}>
                              {i.level}
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-1 py-[3.5px] text-right tabular-nums">
                          {editing ? (
                            <input
                              id={`points-${i.id}`}
                              type="number"
                              step="0.1"
                              min="0"
                              className="ui-input h-7 w-14 py-0 text-right text-[11.5px]"
                              defaultValue={i.points ?? ""}
                              onBlur={(e) => {
                                const v = e.target.value === "" ? null : Number(e.target.value);
                                if (v !== i.points) saveItem(i.id, { points: v });
                              }}
                            />
                          ) : (
                            (i.points ?? "–")
                          )}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t" style={{ borderColor: "#f1ead9" }}>
                      <td className="px-1 py-[3.5px] font-bold">
                        {pi === itemPages.length - 1 ? "계" : "이어짐"}
                      </td>
                      <td className="px-1 py-[3.5px]">
                        {pi === itemPages.length - 1 ? `${items.length}문항` : `${pageItems.length}문항`}
                      </td>
                      <td />
                      <td className="px-1 py-[3.5px] text-right font-bold tabular-nums">
                        {pi === itemPages.length - 1 ? s.total : ""}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {pi === itemPages.length - 1 ? (
                <div>
                  <h3 className={h3} style={{ color: NAVY }}>
                    다음 시험 대비 전략
                  </h3>
                  <ul className="list-disc space-y-[3px] pl-4">
                    {analysis.strategy.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </A4Page>
          ))}

          {/* 3쪽: 수업자료 적중 문항 (대조를 켰고 맞은 문항이 있을 때만) */}
          {showMatched ? (
            <A4Page footer={`${footer} · ${pageTotal} / ${pageTotal}`}>
              <div className="flex items-baseline justify-between border-b-2 border-[#1f2937] pb-1.5">
                <b className="text-[15px]">{title} · 수업자료 적중 문항</b>
                <span className="text-[11px]" style={{ color: SOFT }}>
                  {meta.examLabel}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-[9px]">
                {[
                  { v: `${s.matched.length}`, l: `적중 문항 / 전체 ${items.length}` },
                  { v: `${r1(sum(s.matched.map((i) => i.points)))}`, l: `적중 배점 · 총점의 ${pct(sum(s.matched.map((i) => i.points)))}%` },
                  { v: `${new Set(s.matched.map((i) => i.matched_item_id)).size}`, l: "맞은 수업자료 지문 수" },
                ].map((k) => (
                  <div key={k.l} className="rounded-[14px] bg-white px-[13px] py-[11px]">
                    <b className="block text-[29px] leading-[1.1] tabular-nums">{k.v}</b>
                    <span className="text-[11.5px]" style={{ color: SOFT }}>
                      {k.l}
                    </span>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-white px-3 py-2">
                <table className="w-full border-collapse text-[11.5px]">
                  <thead>
                    <tr className="whitespace-nowrap text-left text-[10.5px]" style={{ color: SOFT }}>
                      <th className="px-1 py-1 font-semibold">번호</th>
                      <th className="px-1 py-1 font-semibold">유형</th>
                      <th className="px-1 py-1 font-semibold">난이도</th>
                      <th className="px-1 py-1 text-right font-semibold">배점</th>
                      <th className="px-1 py-1 font-semibold">수업자료</th>
                      <th className="px-1 py-1 font-semibold">시험지 지문 첫 부분</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.matched.map((i) => (
                      <tr key={i.id} className="border-t align-top" style={{ borderColor: "#f1ead9" }}>
                        <td className="whitespace-nowrap px-1 py-1 font-bold">{i.item_no}</td>
                        <td className="whitespace-nowrap px-1 py-1">{i.type_name}</td>
                        <td className="px-1 py-1">
                          <span className="inline-block w-[22px] rounded-[3px] text-center text-[10.5px] font-bold" style={{ background: LV_BG[i.level], color: LV_INK[i.level] }}>
                            {i.level}
                          </span>
                        </td>
                        <td className="px-1 py-1 text-right tabular-nums">{i.points ?? "–"}</td>
                        <td className="px-1 py-1 font-semibold" style={{ color: NAVY }}>
                          {i.matched_label}
                        </td>
                        <td className="px-1 py-1 text-[11px] italic" style={{ color: SOFT }}>
                          {(i.passage_excerpt ?? "").split(/\s+/).slice(0, 14).join(" ")}…
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px]" style={{ color: SOFT }}>
                시험 지문 앞부분이 학원 수업자료에 넣어 둔 지문과 같은 문항입니다. 지문을 조금 바꿔 낸 문항도 포함됩니다.
              </p>
            </A4Page>
          ) : null}
        </div>
      </div>

    </div>
  );
}

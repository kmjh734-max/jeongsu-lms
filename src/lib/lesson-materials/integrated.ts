/**
 * 최종통합자료: 수업용 자료·분석서·변형문제·워크북을 앞표지·목차·간지·뒤표지와 함께 한 파일로
 * 묶는다. 자료함 파일(lesson_material_documents, kind = integrated)의 payload에 구성을 둔다.
 */

export type IntegratedSectionKind = "lesson_pack" | "analysis_report" | "questions" | "workbook";

export const INTEGRATED_SECTION_ORDER: IntegratedSectionKind[] = [
  "lesson_pack",
  "analysis_report",
  "questions",
  "workbook",
];

export const INTEGRATED_SECTION_META: Record<
  IntegratedSectionKind,
  { title: string; en: string; sub: string; icon: string }
> = {
  lesson_pack: { title: "수업용 자료", en: "MATERIAL FOR CLASS", sub: "수업용 자료", icon: "✦" },
  analysis_report: { title: "분석서", en: "ANALYSIS & SUMMARY", sub: "지문 분석서", icon: "📄" },
  questions: { title: "변형문제", en: "PRACTICE QUESTIONS", sub: "예상 및 변형 문제", icon: "✒" },
  workbook: { title: "워크북", en: "WORKBOOK", sub: "워크북 학습 자료", icon: "📘" },
};

export type IntegratedCover = {
  /** 표지 프리셋 id(COVER_PRESETS) */
  presetId: string;
  /** 표지 상단 라벨 / 부제 (예: 호원고 기말고사) */
  label: string;
  /** 표지 메인 제목 (줄바꿈 가능) */
  title: string;
  /** 진도 표기 (줄바꿈으로 여러 줄) */
  progress: string;
  /** 표지 강사 / 학원명 */
  academy: string;
};

export type IntegratedPayload = {
  /** 구성 순서(목차·본문 순서) */
  order: IntegratedSectionKind[];
  /** 유형별로 고른 파일 id(변형문제는 작업 id) */
  selections: Record<IntegratedSectionKind, string[]>;
  cover: IntegratedCover;
  /** 자료 사이 간지를 넣는다 */
  dividers: boolean;
  /** 변형문제 정답을 맨 뒤 "정답" 부분에 모은다 */
  answerKey: boolean;
};

export const DEFAULT_INTEGRATED_COVER: IntegratedCover = {
  presetId: "navy",
  label: "",
  title: "",
  progress: "",
  academy: "",
};

export function emptyIntegratedPayload(title = ""): IntegratedPayload {
  return {
    order: [...INTEGRATED_SECTION_ORDER],
    selections: { lesson_pack: [], analysis_report: [], questions: [], workbook: [] },
    cover: { ...DEFAULT_INTEGRATED_COVER, title },
    dividers: true,
    answerKey: true,
  };
}

/** 저장된 payload가 옛 형식이거나 일부가 빠져도 쓸 수 있게 채운다. */
export function normalizeIntegratedPayload(raw: unknown): IntegratedPayload {
  const p = (raw && typeof raw === "object" ? raw : {}) as Partial<IntegratedPayload>;
  const order = (Array.isArray(p.order) ? p.order : []).filter((k): k is IntegratedSectionKind =>
    (INTEGRATED_SECTION_ORDER as string[]).includes(k)
  );
  for (const k of INTEGRATED_SECTION_ORDER) if (!order.includes(k)) order.push(k);
  const sel = (p.selections ?? {}) as Partial<Record<IntegratedSectionKind, unknown>>;
  const list = (v: unknown) => (Array.isArray(v) ? v.map(String).filter(Boolean) : []);
  return {
    order,
    selections: {
      lesson_pack: list(sel.lesson_pack),
      analysis_report: list(sel.analysis_report),
      questions: list(sel.questions),
      workbook: list(sel.workbook),
    },
    cover: { ...DEFAULT_INTEGRATED_COVER, ...(p.cover ?? {}) },
    dividers: p.dividers !== false,
    answerKey: p.answerKey !== false,
  };
}


/** 표지 배치. 네 가지 표지가 각각 하나씩 쓴다(BundleSheets.tsx). */
export type CoverLayout = "classic" | "minimal" | "gradient" | "block";

export type CoverPreset = {
  id: string;
  name: string;
  /** 고르는 창에 쓰는 한 줄 설명 */
  description: string;
  layout: CoverLayout;
  /** 앞표지 배경 */
  background: string;
  /** 제목 색 */
  ink: string;
  /** 보조 글자 색 */
  muted: string;
  /** 선·장식 색 */
  rule: string;
  /** 목차 번호·간지 글자처럼 흰 종이 위에 쓰는 강조색(흰 바탕에서 읽히는 진한 색) */
  accent: string;
  /** 간지 왼쪽 띠 */
  strip: string;
  /** 뒤표지 배경·글자 */
  backBackground: string;
  backInk: string;
  backMuted: string;
};

/**
 * 표지 네 가지. 예전 열 가지는 비슷한 원형 장식이 많아 고르기만 번거로워, 성격이 뚜렷한
 * 넷으로 줄였다. 모두 인쇄에서 배경색까지 그대로 찍힌다.
 */
export const COVER_PRESETS: CoverPreset[] = [
  {
    id: "navy",
    name: "클래식 네이비",
    description: "남색 바탕 · 금색 테두리",
    layout: "classic",
    background: "#13213c",
    ink: "#f7f1e3",
    muted: "#cdbd98",
    rule: "#d6be8c",
    accent: "#1f3a68",
    strip: "#13213c",
    backBackground: "#13213c",
    backInk: "#f7f1e3",
    backMuted: "#cdbd98",
  },
  {
    id: "minimal",
    name: "미니멀 화이트",
    description: "흰 바탕 · 굵은 제목",
    layout: "minimal",
    background: "#ffffff",
    ink: "#0f172a",
    muted: "#475569",
    rule: "#0f172a",
    accent: "#2563eb",
    strip: "#0f172a",
    backBackground: "#ffffff",
    backInk: "#0f172a",
    backMuted: "#64748b",
  },
  {
    id: "soft",
    name: "소프트 그라데이션",
    description: "연보라·하늘 · 부드러운 느낌",
    layout: "gradient",
    background: "linear-gradient(160deg,#eef2ff 0%,#faf5ff 48%,#ecfeff 100%)",
    ink: "#1e1b4b",
    muted: "#4338ca",
    rule: "#7c3aed",
    accent: "#6d28d9",
    strip: "linear-gradient(180deg,#a78bfa 0%,#67e8f9 100%)",
    backBackground: "linear-gradient(160deg,#eef2ff 0%,#faf5ff 48%,#ecfeff 100%)",
    backInk: "#1e1b4b",
    backMuted: "#4338ca",
  },
  {
    id: "block",
    name: "컬러 블록",
    description: "청록 블록 · 호박색 띠",
    layout: "block",
    background: "#f6f4ee",
    ink: "#ffffff",
    muted: "#374151",
    rule: "#f0b429",
    accent: "#0f4c43",
    strip: "#0f4c43",
    backBackground: "#0f4c43",
    backInk: "#ffffff",
    backMuted: "#b9d3cc",
  },
];

/** 저장된 표지 id가 없거나 예전 표지(열 가지 시절)면 첫 표지를 쓴다. */
export function coverPreset(id: string | undefined): CoverPreset {
  return COVER_PRESETS.find((p) => p.id === id) ?? COVER_PRESETS[0]!;
}

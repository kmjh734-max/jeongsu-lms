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
  presetId: "bold-field",
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


/** 표지 배치. 여덟 가지 표지가 각각 하나씩 쓴다(BundleSheets.tsx). */
export type CoverLayout =
  | "bold-field"
  | "circle"
  | "layers"
  | "arch"
  | "frame"
  | "initial"
  | "wave"
  | "stack";

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
 * 표지 여덟 가지. 승인된 시안 그대로다 — 바탕색 하나가 먼저 읽히고, 기하 구조 하나가 판을
 * 짜고, 제목이 표지의 3분의 1을 차지한다. 여기 색은 앞표지뿐 아니라 목차·간지·뒤표지가
 * 함께 쓴다. 모두 인쇄에서 배경색까지 그대로 찍힌다.
 */
export const COVER_PRESETS: CoverPreset[] = [
  {
    id: "bold-field",
    name: "색면 폭발",
    description: "주홍 전면 · 큰 제목 · 하단 흰 띠",
    layout: "bold-field",
    background: "#d8381b",
    ink: "#ffffff",
    muted: "#f6c6bc",
    rule: "#ffffff",
    accent: "#b62d14",
    strip: "#d8381b",
    backBackground: "#d8381b",
    backInk: "#ffffff",
    backMuted: "#f6c6bc",
  },
  {
    id: "circle",
    name: "원형 기하",
    description: "남색 바탕 · 노란 원 안의 제목",
    layout: "circle",
    background: "#0f2f5c",
    ink: "#ffffff",
    muted: "#8fb0d6",
    rule: "#f5b72c",
    accent: "#0f2f5c",
    strip: "#0f2f5c",
    backBackground: "#0f2f5c",
    backInk: "#ffffff",
    backMuted: "#8fb0d6",
  },
  {
    id: "layers",
    name: "겹친 면",
    description: "남색·주황 면 · 흰 제목 카드",
    layout: "layers",
    background: "#eceef2",
    ink: "#141c29",
    muted: "#6a7383",
    rule: "#f0693a",
    accent: "#16386f",
    strip: "#16386f",
    backBackground: "#16386f",
    backInk: "#ffffff",
    backMuted: "#b9cbe6",
  },
  {
    id: "arch",
    name: "아치 창",
    description: "자주 바탕 · 크림 아치 창",
    layout: "arch",
    background: "#63124c",
    ink: "#2c0a21",
    muted: "#8c4b34",
    rule: "#d9452a",
    accent: "#63124c",
    strip: "#63124c",
    backBackground: "#63124c",
    backInk: "#f7ecd9",
    backMuted: "#cfa6c1",
  },
  {
    id: "frame",
    name: "굵은 테두리 프레임",
    description: "노란 테두리 · 검정 면",
    layout: "frame",
    background: "#14161b",
    ink: "#fbf4e2",
    muted: "#9a8b54",
    rule: "#f3c324",
    accent: "#14161b",
    strip: "#f3c324",
    backBackground: "#14161b",
    backInk: "#f3c324",
    backMuted: "#9a8b54",
  },
  {
    id: "initial",
    name: "대형 이니셜 워터마크",
    description: "진초록 바탕 · 거대한 이니셜",
    layout: "initial",
    background: "#0b6b45",
    ink: "#ffffff",
    muted: "#cfe6da",
    rule: "#f2c230",
    accent: "#0a5637",
    strip: "#0b6b45",
    backBackground: "#0b6b45",
    backInk: "#ffffff",
    backMuted: "#a8cfbd",
  },
  {
    id: "wave",
    name: "곡선 물결 분할",
    description: "청록·크림 · 큰 곡선 분할",
    layout: "wave",
    background: "#f6f1e6",
    ink: "#0c2a32",
    muted: "#5c7077",
    rule: "#e8a33c",
    accent: "#0a6274",
    strip: "#0a6274",
    backBackground: "#0a6274",
    backInk: "#f6f1e6",
    backMuted: "#a9cbd3",
  },
  {
    id: "stack",
    name: "카드 스택",
    description: "남보라 바탕 · 포갠 카드 3장",
    layout: "stack",
    background: "#2b3690",
    ink: "#141822",
    muted: "#6b7280",
    rule: "#f5bf3e",
    accent: "#2b3690",
    strip: "#2b3690",
    backBackground: "#2b3690",
    backInk: "#ffffff",
    backMuted: "#a9b0e4",
  },
];

/**
 * 예전에 고른 표지 id를 지금 표지로 잇는다(예전에 만든 통합자료가 그대로 열리게).
 * 여기에 없는 id는 첫 표지로 떨어진다.
 */
const LEGACY_COVER_IDS: Record<string, string> = {
  // 네 가지 시절
  navy: "circle", // 클래식 네이비 → 남색 바탕에 가운데 정렬
  minimal: "layers", // 미니멀 화이트 → 밝은 바탕에 흰 제목 카드
  soft: "wave", // 소프트 그라데이션 → 부드러운 곡선 분할
  block: "bold-field", // 컬러 블록 → 색면 하나로 꽉 채운 표지
  // 열 가지 시절에 쓰던 이름들
  classic: "circle",
  gradient: "wave",
  ivory: "layers",
  emerald: "initial",
  amber: "frame",
  crimson: "bold-field",
  slate: "stack",
  mint: "wave",
  plum: "arch",
  charcoal: "frame",
};

/** 저장된 표지 id가 없거나 예전 표지면 알맞은 지금 표지(없으면 첫 표지)를 쓴다. */
export function coverPreset(id: string | undefined | null): CoverPreset {
  const key = (id ?? "").trim();
  const mapped = LEGACY_COVER_IDS[key] ?? key;
  return COVER_PRESETS.find((p) => p.id === mapped) ?? COVER_PRESETS[0]!;
}

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
  presetId: "typo",
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

export type CoverPresetCategory = "pastel" | "basic";

export type CoverPreset = {
  id: string;
  name: string;
  category: CoverPresetCategory;
  /** 표지 배경 */
  background: string;
  /** 제목 색 */
  ink: string;
  /** 보조 글자 색 */
  muted: string;
  /** 간지·목차에 쓰는 강조색 */
  accent: string;
  /** 장식 모양 */
  motif: "orb" | "typo" | "waves" | "metal" | "modern" | "classic" | "arch";
  /** 원형 장식의 그라데이션 */
  orb?: string;
};

export const COVER_PRESETS: CoverPreset[] = [
  {
    id: "orb-pink",
    name: "원형 핑크",
    category: "pastel",
    background: "linear-gradient(160deg,#fdf2f8 0%,#f5f3ff 55%,#eff6ff 100%)",
    ink: "#3b0764",
    muted: "#7c3aed",
    accent: "#db2777",
    motif: "orb",
    orb: "radial-gradient(circle at 30% 30%,#f9a8d4,#c4b5fd 55%,#93c5fd)",
  },
  {
    id: "orb-sunset",
    name: "원형 선셋",
    category: "pastel",
    background: "linear-gradient(160deg,#fff7ed 0%,#eff6ff 100%)",
    ink: "#1e3a8a",
    muted: "#c2410c",
    accent: "#ea580c",
    motif: "orb",
    orb: "linear-gradient(135deg,#60a5fa,#fb923c)",
  },
  {
    id: "orb-green",
    name: "원형 그린",
    category: "pastel",
    background: "linear-gradient(160deg,#f0fdf4 0%,#fefce8 100%)",
    ink: "#14532d",
    muted: "#15803d",
    accent: "#16a34a",
    motif: "orb",
    orb: "radial-gradient(circle at 30% 30%,#86efac,#7dd3fc 55%,#fde68a)",
  },
  {
    id: "orb-teal",
    name: "원형 틸",
    category: "pastel",
    background: "linear-gradient(160deg,#f8fafc 0%,#ecfeff 100%)",
    ink: "#134e4a",
    muted: "#0f766e",
    accent: "#0d9488",
    motif: "orb",
    orb: "linear-gradient(135deg,#cbd5e1,#2dd4bf)",
  },
  {
    id: "typo",
    name: "Typo",
    category: "basic",
    background: "#0f3b3f",
    ink: "#7ff2d4",
    muted: "#9fc7c2",
    accent: "#0f766e",
    motif: "typo",
  },
  {
    id: "blue-pink",
    name: "블루핑크",
    category: "pastel",
    background: "linear-gradient(180deg,#bfdbfe 0%,#e0f2fe 100%)",
    ink: "#1e3a8a",
    muted: "#be185d",
    accent: "#ec4899",
    motif: "waves",
  },
  {
    id: "dark-metal",
    name: "다크 메탈",
    category: "basic",
    background: "#0b0b0f",
    ink: "#f4f4f5",
    muted: "#a1a1aa",
    accent: "#52525b",
    motif: "metal",
  },
  {
    id: "modern",
    name: "Modern",
    category: "basic",
    background: "#1e2a5a",
    ink: "#ffffff",
    muted: "#c7d2fe",
    accent: "#f97316",
    motif: "modern",
  },
  {
    id: "classic",
    name: "Classic",
    category: "basic",
    background: "#faf7f0",
    ink: "#1f2937",
    muted: "#6b7280",
    accent: "#374151",
    motif: "classic",
  },
  {
    id: "arch",
    name: "Arch",
    category: "basic",
    background: "#123c3a",
    ink: "#123c3a",
    muted: "#d6b98c",
    accent: "#b08d57",
    motif: "arch",
  },
];

export function coverPreset(id: string | undefined): CoverPreset {
  return COVER_PRESETS.find((p) => p.id === id) ?? COVER_PRESETS.find((p) => p.id === "typo")!;
}

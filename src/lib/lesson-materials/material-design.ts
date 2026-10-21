import { useEffect, useState, type CSSProperties } from "react";

/**
 * 자료 디자인 하나로(선생님 2026-10-21: 최종통합자료에 넣은 디자인이 다른 자료에도 같게). 테스트 교재 내지
 * A 클래식 · B 파스텔 블룸 · C 볼드 블록 · D 매거진 가운데 하나를 고르면 수업용 자료·지문 분석서·워크북·
 * 최종통합자료·뽑은 테스트지가 모두 같은 결로 나온다. 고른 것은 이 브라우저에 하나로 기억한다.
 */
export type MaterialDesign = "a" | "b" | "c" | "d";

export const MATERIAL_DESIGNS: Array<{ id: MaterialDesign; label: string; hint: string }> = [
  { id: "a", label: "A 클래식", hint: "가는 선 · 왼쪽 색 띠" },
  { id: "b", label: "B 파스텔 블룸", hint: "화사한 번짐 · 둥근 꼬리표" },
  { id: "c", label: "C 볼드 블록", hint: "색 띠 머리 · 굵은 번호" },
  { id: "d", label: "D 매거진", hint: "세리프 · 가는 선" },
];

export const DEFAULT_MATERIAL_DESIGN: MaterialDesign = "b";
const KEY = "material-design";
const EVENT = "material-design-change";

export function isMaterialDesign(v: unknown): v is MaterialDesign {
  return v === "a" || v === "b" || v === "c" || v === "d";
}

export function readMaterialDesign(): MaterialDesign {
  try {
    const v = window.localStorage.getItem(KEY);
    return isMaterialDesign(v) ? v : DEFAULT_MATERIAL_DESIGN;
  } catch {
    return DEFAULT_MATERIAL_DESIGN;
  }
}

export function writeMaterialDesign(d: MaterialDesign) {
  try {
    window.localStorage.setItem(KEY, d);
  } catch {
    /* 저장소를 못 쓰면 이 화면에서만 */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: d }));
}

/**
 * 고른 자료 디자인. override를 주면(최종통합자료가 끼워 넣을 때) 그것을 쓴다. 다른 화면·탭에서 바꿔도 따라간다.
 */
export function useMaterialDesign(override?: MaterialDesign | null): [MaterialDesign, (d: MaterialDesign) => void] {
  const [design, setDesign] = useState<MaterialDesign>(DEFAULT_MATERIAL_DESIGN);
  useEffect(() => {
    setDesign(readMaterialDesign());
    const onChange = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (isMaterialDesign(d)) setDesign(d);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && isMaterialDesign(e.newValue)) setDesign(e.newValue);
    };
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  const choose = (d: MaterialDesign) => {
    setDesign(d);
    writeMaterialDesign(d);
  };
  return [override ?? design, choose];
}

/** 워크북·분석서 뿌리에 다는 클래스(material-design.css) */
export function materialDesignClass(d: MaterialDesign): string {
  return `md md-${d}`;
}

/** 강조색(자료마다 — 테스트 교재 묶음 색과 같다) */
export function materialAccentStyle(accent: string): CSSProperties {
  return { ["--md-accent" as string]: accent } as CSSProperties;
}

/** 각 자료의 바탕 글꼴 모양 — D 매거진은 세리프, 나머지는 산세리프, 워크북 B는 원래 파스텔 모양 */
export const WORKBOOK_BASE_STYLE: Record<MaterialDesign, "a" | "b" | "c" | "d"> = { a: "b", b: "d", c: "b", d: "a" };
export const ANALYSIS_BASE_STYLE: Record<MaterialDesign, "a" | "b" | "c"> = { a: "b", b: "b", c: "b", d: "a" };

/** 자료 묶음 색(테스트 교재와 같다) */
export const MATERIAL_ACCENT = {
  lesson: "#1d2a8f",
  analysis: "#6a4bd8",
  workbook: "#e8552e",
} as const;

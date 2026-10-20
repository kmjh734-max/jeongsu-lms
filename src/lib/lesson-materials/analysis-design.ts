/**
 * 분석서 모양 A·B·C(글꼴과 색만 다르고 표시 구성은 같다 — globals.css의 .ar-style-*).
 * 분석서 화면과 테스트 교재 「분석 자료」가 같이 쓴다.
 */
export type AnalysisDesignStyle = "base" | "a" | "b" | "c";

export const DESIGN_STYLES: Array<{ id: AnalysisDesignStyle; label: string; hint: string }> = [
  { id: "a", label: "A", hint: "교재 세리프" },
  { id: "b", label: "B", hint: "깔끔한 산세리프" },
  { id: "c", label: "C", hint: "클래식 인쇄" },
];

/** A·B·C가 쓰는 글꼴. 기본 모양에서는 불러오지 않는다. */
export const DESIGN_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,500;0,8..60,600;1,8..60,500&family=Literata:opsz,wght@7..72,500;7..72,600&family=Gowun+Batang:wght@400;700&display=swap";

export function designClass(style: AnalysisDesignStyle): string {
  return style === "base" ? "" : `ar-style ar-style-${style}`;
}

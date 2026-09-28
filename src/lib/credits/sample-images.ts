import type { CreditSampleKind } from "@/lib/credits/confirm-store";

/**
 * 만들기 전 확인 창에 보여 주는 견본 사진.
 *
 * 선생님 요청(2026-09-28): 손으로 흉내 낸 그림 말고 <b>실제 화면을 찍은 사진</b>으로.
 * 첫 화면(LandingPage)에서 쓰는 것과 같은 방식이다 — public/landing 아래 실제 서비스
 * 화면을 잘라 찍어 둔 사진을 그대로 쓴다.
 *
 * 아직 사진이 없는 갈래는 여기에 적지 않는다. 그러면 예전처럼 모양만 그린 견본이 나온다.
 * 사진을 새로 찍으면 public/samples 아래에 넣고 한 줄 보태면 된다.
 */
export interface SampleImage {
  src: string;
  /** 사진 안에서 먼저 보여 줄 자리 — 대부분 위쪽이 제목이라 top */
  position?: string;
  /** 무엇을 찍은 것인지 (화면 읽어 주는 이를 위해) */
  alt: string;
}

export const SAMPLE_IMAGES: Partial<Record<CreditSampleKind, SampleImage>> = {
  analysis_report: {
    src: "/landing/analysis.jpg",
    alt: "지문 분석서 — 문장마다 구조 표시와 해석이 붙은 실제 인쇄 화면",
  },
  workbook: {
    src: "/landing/workbook.jpg",
    alt: "워크북 — 같은 지문으로 만든 문제지 실제 인쇄 화면",
  },
  // 동형모의고사(/landing/exam-mock.jpg)는 가로로 잘라 둔 사진이라 세로 칸에서 양옆이
  // 잘린다. 세로로 다시 찍으면 여기에 넣는다.
};

export function sampleImageFor(kind: CreditSampleKind): SampleImage | null {
  return SAMPLE_IMAGES[kind] ?? null;
}

/**
 * 듣기 그림 생성 옵션 (크기·품질).
 * gpt-image의 출력 토큰은 품질·크기로 정해진다 — 1024×1024 기준 high 4,160토큰(약 233원),
 * medium 1,056토큰(약 59원), low 272토큰(약 15원). A4 시험지에서 그림이 차지하는 폭은
 * 60~90mm(약 300dpi로 700~1,000px)라 1024×1024 medium이면 인쇄에서 선·글자가 그대로 읽힌다.
 * 기본을 medium으로 내리고 환경변수로 되돌릴 수 있게 한다.
 */
export type ListeningImageQuality = "low" | "medium" | "high";
export type ListeningImageSize = "1024x1024" | "1536x1024" | "1024x1536";

const QUALITIES: ListeningImageQuality[] = ["low", "medium", "high"];
const SIZES: ListeningImageSize[] = ["1024x1024", "1536x1024", "1024x1536"];

/** 크기·품질별 출력 토큰 (OpenAI 공개 표) — 원가 계산용 */
const OUTPUT_TOKENS: Record<ListeningImageSize, Record<ListeningImageQuality, number>> = {
  "1024x1024": { low: 272, medium: 1056, high: 4160 },
  "1536x1024": { low: 408, medium: 1584, high: 6240 },
  "1024x1536": { low: 400, medium: 1568, high: 6208 },
};

/** gpt-image 출력 토큰 단가 $40/1M, 1달러 1,400원 */
const KRW_PER_OUTPUT_TOKEN = (40 / 1_000_000) * 1400;

export function listeningImageCostKrw(
  size: ListeningImageSize,
  quality: ListeningImageQuality
): number {
  return OUTPUT_TOKENS[size][quality] * KRW_PER_OUTPUT_TOKEN;
}

export function resolveListeningImageQuality(): ListeningImageQuality {
  const raw = process.env.LISTENING_IMAGE_QUALITY?.trim().toLowerCase();
  return QUALITIES.includes(raw as ListeningImageQuality)
    ? (raw as ListeningImageQuality)
    : "medium";
}

export function resolveListeningImageSize(): ListeningImageSize {
  const raw = process.env.LISTENING_IMAGE_SIZE?.trim().toLowerCase();
  return SIZES.includes(raw as ListeningImageSize) ? (raw as ListeningImageSize) : "1024x1024";
}

/** dall-e-3는 hd/standard만 받는다 */
export function dalleQuality(quality: ListeningImageQuality): "hd" | "standard" {
  return quality === "high" ? "hd" : "standard";
}

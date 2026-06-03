/** 듣기 문항 생성·검수·수정 기본 모델 (환경변수 미설정 시) */
export const LISTENING_MODEL_PRIMARY = "gpt-5.5";
export const LISTENING_MODEL_FALLBACK = "gpt-5";

/** 시도 순서: 환경변수 → 기본 gpt-5.5 → 실패 시 gpt-5 */
export function getListeningGeneratorModelCandidates(): string[] {
  const configured = process.env.OPENAI_MODEL_LISTENING_GENERATOR?.trim();
  if (configured) {
    if (configured === LISTENING_MODEL_PRIMARY) {
      return [LISTENING_MODEL_PRIMARY, LISTENING_MODEL_FALLBACK];
    }
    return [configured];
  }
  return [LISTENING_MODEL_PRIMARY, LISTENING_MODEL_FALLBACK];
}

export function getListeningGeneratorModel(): string {
  return getListeningGeneratorModelCandidates()[0]!;
}

/** GPT-5·o 시리즈 등은 temperature 커스텀 불가(기본값 1만 허용) */
export function listeningModelSupportsCustomTemperature(model: string): boolean {
  const m = model.trim().toLowerCase();
  if (m.startsWith("gpt-5")) return false;
  if (/^o\d/.test(m)) return false;
  return true;
}

export function isUnsupportedTemperatureError(bodyText: string): boolean {
  const lower = bodyText.toLowerCase();
  return (
    lower.includes("temperature") &&
    (lower.includes("unsupported") ||
      lower.includes("does not support") ||
      lower.includes("only the default"))
  );
}

export function isListeningModelUnavailableError(
  status: number,
  bodyText: string
): boolean {
  if (status === 404) return true;
  const lower = bodyText.toLowerCase();
  if (status !== 400 && status !== 403) return false;
  return (
    lower.includes("model") &&
    (lower.includes("does not exist") ||
      lower.includes("not found") ||
      lower.includes("invalid") ||
      lower.includes("unknown") ||
      lower.includes("not available") ||
      lower.includes("no longer"))
  );
}

import { LOGO_SRC } from "@/lib/branding";
import {
  ensureKakaoSdkReady,
  isKakaoShareConfigured,
} from "@/lib/kakao/kakao-init";
import { buildKakaoPasteMessage } from "@/lib/kakao/paste-message";
import {
  KAKAO_PRODUCT_LINK_HINT,
  normalizeShareUrl,
  validateShareUrlForKakao,
} from "@/lib/kakao/share-url";

export {
  ensureKakaoSdkReady,
  isKakaoShareConfigured,
  loadKakaoSdk as loadKakaoSdkForReports,
} from "@/lib/kakao/kakao-init";

export function getAbsoluteLogoUrl(
  shareUrl: string,
  logoSrc: string = LOGO_SRC
): string {
  try {
    const origin = new URL(shareUrl).origin;
    if (logoSrc.startsWith("http://") || logoSrc.startsWith("https://")) {
      return logoSrc;
    }
    return `${origin}${logoSrc}`;
  } catch {
    if (typeof window !== "undefined") {
      if (logoSrc.startsWith("http://") || logoSrc.startsWith("https://")) {
        return logoSrc;
      }
      return `${window.location.origin}${logoSrc}`;
    }
    return "";
  }
}

export interface KakaoShareParams {
  studentName: string;
  periodLabel: string;
  shareUrl: string;
  feedTitle?: string;
  feedDescription?: string;
  buttonTitle?: string;
  pasteMessage?: string;
  academyName?: string;
  logoSrc?: string;
}

export type KakaoShareResult =
  | { ok: true; method: "text" | "scrap" | "feed" }
  | { ok: false; fallback: true; message: string }
  | { ok: false; fallback: false; message: string };

export { buildKakaoPasteMessage, KAKAO_PRODUCT_LINK_HINT, validateShareUrlForKakao };

/** 카카오 기본 텍스트 템플릿 표시 한도 (초과 시 잘림 → 본문 URL 404) */
export const KAKAO_TEXT_MAX_CHARS = 200;

/**
 * 카카오 SDK text 본문용.
 * - 본문 URL은 제거(링크는 button/link 객체만 사용)
 * - 200자 초과 시 안전하게 자름 (잘린 URL 방지)
 */
export function buildKakaoSdkTextBody(
  raw: string,
  options?: { buttonTitle?: string; fallback?: string }
): string {
  const buttonLabel = (options?.buttonTitle ?? "자세히 보기").trim() || "자세히 보기";
  const fallback =
    options?.fallback?.trim() ||
    `리포트를 확인해 주세요.\n아래 「${buttonLabel}」에서 열 수 있습니다.`;

  let text = raw
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!text) text = fallback;

  // 본문에서 링크를 지웠다면 버튼으로 안내
  if (/https?:\/\/\S+/i.test(raw) && !text.includes(buttonLabel)) {
    const hint = `\n\n아래 「${buttonLabel}」에서 확인해 주세요.`;
    const chars = [...text];
    const hintChars = [...hint];
    if (chars.length + hintChars.length <= KAKAO_TEXT_MAX_CHARS) {
      text = `${text}${hint}`;
    } else {
      const keep = Math.max(0, KAKAO_TEXT_MAX_CHARS - hintChars.length - 1);
      text = `${chars.slice(0, keep).join("").trimEnd()}…${hint}`;
    }
  }

  const chars = [...text];
  if (chars.length <= KAKAO_TEXT_MAX_CHARS) return text;
  return `${chars.slice(0, KAKAO_TEXT_MAX_CHARS - 1).join("").trimEnd()}…`;
}

/** 카카오톡 채팅에 붙여넣기용 (링크가 일반 URL로 인식되어 항상 탭 가능) */
export async function copyKakaoPasteMessage(
  params: KakaoShareParams
): Promise<{ ok: boolean; message: string }> {
  const shareUrl = normalizeShareUrl(params.shareUrl);
  const text = buildKakaoPasteMessage({ ...params, shareUrl });
  try {
    await navigator.clipboard.writeText(text);
    return {
      ok: true,
      message:
        "카카오톡에 붙여넣을 메시지를 복사했습니다. 채팅창에 붙여넣으면 링크를 눌러 열 수 있습니다.",
    };
  } catch {
    return { ok: false, message: "메시지 복사에 실패했습니다." };
  }
}

function buildTextPayload(params: KakaoShareParams): Record<string, unknown> {
  const shareUrl = normalizeShareUrl(params.shareUrl);
  const buttonTitle = params.buttonTitle ?? "리포트 보기";
  const raw =
    params.pasteMessage ??
    buildKakaoPasteMessage({ ...params, shareUrl });
  const text = buildKakaoSdkTextBody(raw, { buttonTitle });
  return {
    objectType: "text",
    text,
    link: {
      mobileWebUrl: shareUrl,
      webUrl: shareUrl,
    },
    buttonTitle,
  };
}

function buildFeedPayload(
  params: KakaoShareParams,
  includeImage: boolean
): Record<string, unknown> {
  const { studentName, periodLabel } = params;
  const shareUrl = normalizeShareUrl(params.shareUrl);
  const title = params.feedTitle ?? `${studentName} 학생 학습 리포트`;
  const description =
    params.feedDescription ?? `${periodLabel} 온라인 학습 현황 리포트입니다.`;

  const content: Record<string, unknown> = {
    title,
    description,
    link: {
      mobileWebUrl: shareUrl,
      webUrl: shareUrl,
    },
  };

  if (includeImage) {
    const imageUrl = getAbsoluteLogoUrl(shareUrl, params.logoSrc);
    if (imageUrl) {
      content.imageUrl = imageUrl;
    }
  }

  return {
    objectType: "feed",
    content,
    buttons: [
      {
        title: params.buttonTitle ?? "리포트 보기",
        link: {
          mobileWebUrl: shareUrl,
          webUrl: shareUrl,
        },
      },
    ],
  };
}

function formatKakaoShareError(error: unknown): string | null {
  const text =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  if (!text) return null;
  if (text.includes("4019")) {
    return `카카오 공유 오류(4019): JavaScript 키와 Web 도메인 등록을 확인해 주세요. ${KAKAO_PRODUCT_LINK_HINT}`;
  }
  return text;
}

function trySend(fn: () => void): { ok: true } | { ok: false; error?: unknown } {
  try {
    fn();
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

/**
 * 카카오톡 공유 — feed(버튼 링크) → text(본문 URL 없음) → scrap 순.
 * 긴 안내문을 text에 넣으면 200자에서 URL이 잘려 404가 나므로,
 * 카드/버튼 링크를 우선하고 text 본문에서는 URL을 넣지 않는다.
 */
export async function shareReportViaKakao(
  params: KakaoShareParams
): Promise<KakaoShareResult> {
  const shareUrl = normalizeShareUrl(params.shareUrl);
  const validation = validateShareUrlForKakao(shareUrl);
  if (!validation.ok && validation.warning) {
    return { ok: false, fallback: false, message: validation.warning };
  }

  if (!isKakaoShareConfigured()) {
    return {
      ok: false,
      fallback: false,
      message:
        "NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY(자바스크립트 키)가 설정되어 있지 않습니다.",
    };
  }

  const ready = await ensureKakaoSdkReady();
  if (!ready.ok) {
    return copyFallback(shareUrl, `${ready.message} 리포트 링크를 복사했습니다.`);
  }

  const kakao = window.Kakao!;

  const feedImageResult = trySend(() =>
    kakao.Share.sendDefault(buildFeedPayload(params, true))
  );
  if (feedImageResult.ok) {
    return { ok: true, method: "feed" };
  }

  const feedResult = trySend(() =>
    kakao.Share.sendDefault(buildFeedPayload(params, false))
  );
  if (feedResult.ok) {
    return { ok: true, method: "feed" };
  }

  const textResult = trySend(() =>
    kakao.Share.sendDefault(buildTextPayload(params))
  );
  if (textResult.ok) {
    return { ok: true, method: "text" };
  }
  const textErr = formatKakaoShareError(textResult.error);
  if (textErr) {
    return { ok: false, fallback: false, message: textErr };
  }

  const scrapResult = trySend(() =>
    kakao.Share.sendScrap({ requestUrl: shareUrl })
  );
  if (scrapResult.ok) {
    return { ok: true, method: "scrap" };
  }

  const feedErr = formatKakaoShareError(feedImageResult.error ?? feedResult.error);
  if (feedErr) {
    return { ok: false, fallback: false, message: feedErr };
  }

  return copyFallback(
    shareUrl,
    `카카오톡보내기를 사용할 수 없어 리포트 링크를 복사했습니다. ${KAKAO_PRODUCT_LINK_HINT}`
  );
}

async function copyFallback(
  shareUrl: string,
  message: string
): Promise<KakaoShareResult> {
  try {
    await navigator.clipboard.writeText(shareUrl);
    return { ok: false, fallback: true, message };
  } catch {
    return {
      ok: false,
      fallback: false,
      message: "카카오톡 공유와 링크 복사에 실패했습니다.",
    };
  }
}

import { LOGO_SRC } from "@/lib/branding";
import {
  ensureKakaoSdkReady,
  isKakaoShareConfigured,
} from "@/lib/kakao/kakao-init";
import { buildKakaoPasteMessage } from "@/lib/kakao/paste-message";
import {
  KAKAO_PRODUCT_LINK_HINT,
  normalizeShareUrl,
  toPublicShareUrl,
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

/**
 * 카카오 텍스트 템플릿에는 길이 제한을 두지 않는다.
 *
 * 전에 200자로 적어 두고 그 값을 믿고 잘라 보냈다가 안내문구가 반 토막 났다.
 * 실제로는 NELT 성장리포트가 같은 길로 900자 넘는 글을 보내 왔고 그대로 도착한다.
 * 그러니 자르지 말고 쓴 그대로 보낸다.
 */

export function buildKakaoSdkTextBody(raw: string): string {
  const body = raw
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!body) {
    return "자세한 내용은 아래 「자세히 보기」에서 확인해 주세요.";
  }
  return body;
}

/** 카카오톡 채팅에 붙여넣기용 (링크가 일반 URL로 인식되어 항상 탭 가능) */
export async function copyKakaoPasteMessage(
  params: KakaoShareParams
): Promise<{ ok: boolean; message: string }> {
  const shareUrl = normalizeShareUrl(params.shareUrl);
  // 화면에서 미리 본 글이 있으면 그것을 그대로 복사한다
  const text = params.pasteMessage ?? buildKakaoPasteMessage({ ...params, shareUrl });
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
  const raw =
    params.pasteMessage ??
    buildKakaoPasteMessage({ ...params, shareUrl });
  const text = buildKakaoSdkTextBody(raw);
  return {
    objectType: "text",
    text,
    link: {
      mobileWebUrl: shareUrl,
      webUrl: shareUrl,
    },
    // 기본 버튼명 「자세히 보기」— 커스텀이 있을 때만 덮어씀
    ...(params.buttonTitle?.trim()
      ? { buttonTitle: params.buttonTitle.trim() }
      : {}),
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
 * 카카오톡 공유 — text(안내문+온전한 URL) → scrap → feed 순.
 */
export async function shareReportViaKakao(
  params: KakaoShareParams
): Promise<KakaoShareResult> {
  // www / apex 혼용을 NEXT_PUBLIC_SITE_URL 기준으로 맞춤 (리포트·독촉 공통)
  const shareUrl = toPublicShareUrl(params.shareUrl);
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

  const textResult = trySend(() =>
    kakao.Share.sendDefault(buildTextPayload(params))
  );
  if (textResult.ok) {
    return { ok: true, method: "text" };
  }
  // 글이 실패했다고 링크 카드(scrap·feed)로 바꿔 보내면 안내 문구가 통째로 빠진다.
  // 선생님이 미리보기에서 본 글이 안 나가느니, 보내지 않고 복사해 주는 편이 낫다.
  const textErr = formatKakaoShareError(textResult.error);
  const raw = params.pasteMessage ?? buildKakaoPasteMessage({ ...params, shareUrl });
  return copyFullText(
    raw,
    textErr
      ? `카카오톡이 글을 받지 않았어요(${textErr}). 글 전체를 복사했으니 채팅창에 붙여넣어 주세요.`
      : "카카오톡으로 글을 보내지 못해 글 전체를 복사했어요. 채팅창에 붙여넣어 주세요.",
  );
}

/** 글 전체를 복사해 두고, 붙여넣어 보내라고 알린다 */
async function copyFullText(text: string, message: string): Promise<KakaoShareResult> {
  try {
    await navigator.clipboard.writeText(text);
    return { ok: false, fallback: true, message };
  } catch {
    return {
      ok: false,
      fallback: false,
      message: "안내 문구가 너무 길어 카카오톡으로 바로 보낼 수 없어요. 글을 직접 복사해 주세요.",
    };
  }
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

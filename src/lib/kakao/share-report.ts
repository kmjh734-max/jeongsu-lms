import { LOGO_SRC } from "@/lib/branding";

export const KAKAO_SDK_URL =
  "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";

type KakaoShareApi = {
  isInitialized: () => boolean;
  init: (key: string) => void;
  Share: {
    sendDefault: (settings: Record<string, unknown>) => void;
  };
};

declare global {
  interface Window {
    Kakao?: KakaoShareApi;
  }
}

let sdkLoadPromise: Promise<void> | null = null;

export function isKakaoShareConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY?.trim());
}

function getAbsoluteLogoUrl(shareUrl: string): string {
  try {
    const origin = new URL(shareUrl).origin;
    return `${origin}${LOGO_SRC}`;
  } catch {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${LOGO_SRC}`;
    }
    return "";
  }
}

/** 리포트 화면 마운트 시 SDK 미리 로드 (선택) */
export function loadKakaoSdkForReports(): Promise<void> {
  return loadKakaoSdk();
}

function loadKakaoSdk(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("browser only"));
  }
  if (window.Kakao?.isInitialized?.()) return Promise.resolve();
  if (window.Kakao) return Promise.resolve();

  if (sdkLoadPromise) return sdkLoadPromise;

  sdkLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(
      `script[src="${KAKAO_SDK_URL}"]`
    ) as HTMLScriptElement | null;

    if (existing) {
      if (existing.getAttribute("data-loaded") === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => {
        existing.setAttribute("data-loaded", "true");
        resolve();
      });
      existing.addEventListener("error", () =>
        reject(new Error("sdk load failed"))
      );
      return;
    }

    const script = document.createElement("script");
    script.src = KAKAO_SDK_URL;
    script.async = true;
    script.onload = () => {
      script.setAttribute("data-loaded", "true");
      resolve();
    };
    script.onerror = () => reject(new Error("sdk load failed"));
    document.head.appendChild(script);
  });

  return sdkLoadPromise;
}

function ensureKakaoInit(): boolean {
  const key = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY?.trim();
  if (!key || !window.Kakao) return false;
  if (!window.Kakao.isInitialized()) {
    window.Kakao.init(key);
  }
  return window.Kakao.isInitialized();
}

export interface KakaoShareParams {
  studentName: string;
  periodLabel: string;
  shareUrl: string;
}

export type KakaoShareResult =
  | { ok: true }
  | { ok: false; fallback: true; message: string }
  | { ok: false; fallback: false; message: string };

function buildFeedPayload(
  params: KakaoShareParams,
  includeImage: boolean
): Record<string, unknown> {
  const { studentName, periodLabel, shareUrl } = params;
  const title = `${studentName} 학생 학습 리포트`;
  const description = `${periodLabel} 온라인 학습 현황 리포트입니다.`;

  const content: Record<string, unknown> = {
    title,
    description,
    link: {
      mobileWebUrl: shareUrl,
      webUrl: shareUrl,
    },
  };

  if (includeImage) {
    const imageUrl = getAbsoluteLogoUrl(shareUrl);
    if (imageUrl) {
      content.imageUrl = imageUrl;
    }
  }

  return {
    objectType: "feed",
    content,
    buttons: [
      {
        title: "리포트 보기",
        link: {
          mobileWebUrl: shareUrl,
          webUrl: shareUrl,
        },
      },
    ],
  };
}

function sendFeed(payload: Record<string, unknown>): void {
  window.Kakao!.Share.sendDefault(payload);
}

const KAKAO_DOMAIN_HINT =
  "카카오톡보내기에 실패했습니다. Kakao Developers의 Web 플랫폼 도메인에 현재 사이트 주소가 등록되어 있는지 확인해 주세요.";

/** 카카오톡 피드 공유 — 사용자가 채팅방을 선택해 링크 전송 */
export async function shareReportViaKakao(
  params: KakaoShareParams
): Promise<KakaoShareResult> {
  const { shareUrl } = params;
  const key = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY?.trim();

  if (!key) {
    return {
      ok: false,
      fallback: false,
      message: "카카오 JavaScript 키가 설정되어 있지 않습니다.",
    };
  }

  try {
    await loadKakaoSdk();
    if (!ensureKakaoInit()) {
      return copyFallback(
        shareUrl,
        "카카오 SDK 초기화에 실패했습니다. 리포트 링크를 복사했습니다."
      );
    }

    try {
      sendFeed(buildFeedPayload(params, true));
      return { ok: true };
    } catch {
      try {
        sendFeed(buildFeedPayload(params, false));
        return { ok: true };
      } catch {
        return copyFallback(
          shareUrl,
          `카카오톡보내기를 사용할 수 없어 리포트 링크를 복사했습니다. ${KAKAO_DOMAIN_HINT}`
        );
      }
    }
  } catch {
    return copyFallback(
      shareUrl,
      `카카오톡보내기를 사용할 수 없어 리포트 링크를 복사했습니다. ${KAKAO_DOMAIN_HINT}`
    );
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

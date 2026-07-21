"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  copyKakaoPasteMessage,
  isKakaoShareConfigured,
  KAKAO_PRODUCT_LINK_HINT,
  loadKakaoSdkForReports,
  shareReportViaKakao,
  validateShareUrlForKakao,
} from "@/lib/kakao/share-report";
import { extractLearningReportSection } from "@/lib/reports/parent-message-utils";
import type { StudentReport } from "@/lib/reports/types";

interface ReportShareActionsProps {
  report: StudentReport;
  parentMessage: string;
  aiReportDraft: string;
  onOpenPrint: () => void;
  academyName?: string;
  logoSrc?: string;
}

function formatExpiresLabel(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

/** 학부모용 링크 · 카카오톡보내기 · 링크 복사 · PDF */
export function ReportShareActions({
  report,
  parentMessage,
  aiReportDraft,
  onOpenPrint,
  academyName,
  logoSrc,
}: ReportShareActionsProps) {
  const kakaoConfigured = isKakaoShareConfigured();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [linkLoading, setLinkLoading] = useState(false);
  const [kakaoLoading, setKakaoLoading] = useState(false);
  const [pasteLoading, setPasteLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const shareUrlWarning = shareUrl
    ? validateShareUrlForKakao(shareUrl).warning
    : null;

  useEffect(() => {
    if (kakaoConfigured) {
      void loadKakaoSdkForReports().catch(() => {
        /* 실패 시 공유 버튼 클릭 때 재시도 */
      });
    }
  }, [kakaoConfigured]);

  function showStatus(message: string) {
    setStatusMessage(message);
    setErrorMessage(null);
    window.setTimeout(() => setStatusMessage(null), 6000);
  }

  function showError(message: string) {
    setErrorMessage(message);
    window.setTimeout(() => setErrorMessage(null), 6000);
  }

  async function createShareLink(): Promise<string | null> {
    setLinkLoading(true);
    setErrorMessage(null);
    try {
      const learningText =
        extractLearningReportSection(parentMessage) || aiReportDraft.trim();

      const res = await fetch("/api/reports/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: report.student.id,
          reportData: report,
          parentMessage,
          aiReportText: learningText,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        shareUrl?: string;
        expiresAt?: string;
        message?: string;
      };
      if (!res.ok || !data.ok || !data.shareUrl) {
        showError(data.message ?? "리포트 링크 생성에 실패했습니다.");
        return null;
      }
      setShareUrl(data.shareUrl);
      setExpiresAt(data.expiresAt ?? null);
      showStatus(
        "학부모용 리포트 링크가 생성되었습니다. 30일 동안 열람할 수 있습니다."
      );
      return data.shareUrl;
    } catch {
      showError("리포트 링크 생성에 실패했습니다.");
      return null;
    } finally {
      setLinkLoading(false);
    }
  }

  async function handleCreateLink() {
    await createShareLink();
  }

  async function handleCopyLink() {
    const url = shareUrl ?? (await createShareLink());
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      showStatus("리포트 링크가 복사되었습니다.");
    } catch {
      showError("링크 복사에 실패했습니다.");
    }
  }

  function handleOpenLink() {
    if (!shareUrl) {
      void createShareLink().then((url) => {
        if (url) window.open(url, "_blank", "noopener,noreferrer");
      });
      return;
    }
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  }

  async function handleKakaoExport() {
    if (!kakaoConfigured) {
      showError("카카오 JavaScript 키가 설정되어 있지 않습니다.");
      return;
    }

    setKakaoLoading(true);
    try {
      const url = shareUrl ?? (await createShareLink());
      if (!url) return;

      const result = await shareReportViaKakao({
        studentName: report.student.name,
        periodLabel: report.rangeLabel,
        shareUrl: url,
        academyName,
        logoSrc,
      });

      if (result.ok) {
        const hint =
          result.method === "feed"
            ? "카드 링크가 안 열리면 「카카오 붙여넣기용 복사」를 사용하거나 Kakao 제품 링크 관리에 도메인을 등록해 주세요."
            : "메시지 본문의 URL을 눌러 리포트를 열 수 있습니다.";
        showStatus(
          `카카오톡 공유 창이 열렸습니다. 보낼 채팅방을 선택해 주세요. ${hint}`
        );
      } else if (result.fallback) {
        setShareUrl(url);
        showStatus(result.message);
      } else {
        showError(result.message);
      }
    } finally {
      setKakaoLoading(false);
    }
  }

  async function handleKakaoPasteCopy() {
    setPasteLoading(true);
    try {
      const url = shareUrl ?? (await createShareLink());
      if (!url) return;

      const result = await copyKakaoPasteMessage({
        studentName: report.student.name,
        periodLabel: report.rangeLabel,
        shareUrl: url,
        academyName,
        logoSrc,
      });
      if (result.ok) {
        showStatus(result.message);
      } else {
        showError(result.message);
      }
    } finally {
      setPasteLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">학부모 공유</h2>
      <p className="mt-1 text-sm text-slate-500">
        학부모용 공개 리포트 링크를 만들고, 카카오톡 공유창에서 채팅방을
        선택해 보낼 수 있습니다.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={linkLoading || kakaoLoading}
          onClick={() => void handleCreateLink()}
        >
          {linkLoading ? "링크 생성 중..." : "학부모용 링크 생성"}
        </Button>
        <Button
          type="button"
          disabled={!kakaoConfigured || kakaoLoading || linkLoading}
          title={
            kakaoConfigured
              ? "카카오톡 공유창에서 채팅방을 선택합니다"
              : "NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY 필요"
          }
          onClick={() => void handleKakaoExport()}
        >
          {kakaoLoading ? "공유 준비 중..." : "카카오톡보내기"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={linkLoading || pasteLoading}
          onClick={() => void handleKakaoPasteCopy()}
        >
          {pasteLoading ? "복사 중..." : "카카오 붙여넣기용 복사"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={linkLoading}
          onClick={() => void handleCopyLink()}
        >
          링크 복사
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={linkLoading && !shareUrl}
          onClick={handleOpenLink}
        >
          링크 열기
        </Button>
        <Button type="button" variant="secondary" onClick={onOpenPrint}>
          PDF 저장 / 인쇄
        </Button>
      </div>

      {!kakaoConfigured && (
        <p className="mt-2 text-xs text-amber-800">
          카카오톡보내기를 사용하려면 NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY를
          설정해 주세요.
        </p>
      )}

      {kakaoConfigured && (
        <p className="mt-2 text-xs text-slate-600">
          카드만 보이고 링크가 안 열리면: {KAKAO_PRODUCT_LINK_HINT}
        </p>
      )}

      {shareUrlWarning && (
        <p className="mt-2 text-xs font-medium text-amber-800" role="alert">
          {shareUrlWarning}
        </p>
      )}

      {shareUrl && (
        <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
          <p className="font-medium text-slate-700">생성된 링크</p>
          <p className="mt-1 break-all text-slate-600">{shareUrl}</p>
          {expiresAt && (
            <p className="mt-1 text-xs text-slate-500">
              만료일: {formatExpiresLabel(expiresAt)}까지 열람 가능
            </p>
          )}
        </div>
      )}

      {statusMessage && (
        <p className="mt-3 text-sm font-medium text-emerald-700" role="status">
          {statusMessage}
        </p>
      )}
      {errorMessage && (
        <p className="mt-3 text-sm font-medium text-amber-800" role="alert">
          {errorMessage}
        </p>
      )}
    </section>
  );
}

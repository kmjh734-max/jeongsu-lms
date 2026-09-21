"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/layout/NavIcon";
import { Button } from "@/components/ui/Button";
import {
  ExternalIcon,
  KAKAO_FALLBACK_MESSAGE,
  KAKAO_UNAVAILABLE_MESSAGE,
  LinkIcon,
  ReportMenu,
  ReportMenuItem,
} from "@/components/reports/report-ui";
import {
  copyKakaoPasteMessage,
  isKakaoShareConfigured,
  ensureKakaoSdkReady,
  shareReportViaKakao,
  validateShareUrlForKakao,
} from "@/lib/kakao/share-report";
import {
  attachReportLinkToMessage,
  extractLearningReportSection,
  replaceLearningReportSection,
} from "@/lib/reports/parent-message-utils";
import type { StudentReport } from "@/lib/reports/types";

interface ReportShareActionsProps {
  report: StudentReport | null;
  parentMessage: string;
  onParentMessageChange: (value: string) => void;
  onOpenPrint: () => void;
  onPcKakaoPrepare: () => void | Promise<void>;
  /** 학부모 링크를 만들었을 때 (목록의 "보냄" 표시) */
  onShared?: (studentId: string, createdAt: string) => void;
  academyName?: string;
  logoSrc?: string;
}

/** 학습 리포트 오른쪽 「학부모께 보내기」 — 안내 문구 · 카카오톡 · 링크 · PDF */
export function ReportShareActions({
  report,
  parentMessage,
  onParentMessageChange,
  onOpenPrint,
  onPcKakaoPrepare,
  onShared,
  academyName,
  logoSrc,
}: ReportShareActionsProps) {
  const kakaoConfigured = isKakaoShareConfigured();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  /** 링크를 만든 순간의 문구 — 문구를 고치면 새 링크를 만든다 */
  const [sharedMessage, setSharedMessage] = useState<string | null>(null);
  /** 마지막으로 다시 쓴 학습 요약 (링크에 함께 저장) */
  const [draftText, setDraftText] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [kakaoLoading, setKakaoLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const liveUrl = shareUrl && sharedMessage === parentMessage ? shareUrl : null;
  const shareUrlWarning = liveUrl ? validateShareUrlForKakao(liveUrl).warning : null;
  const busy = linkLoading || kakaoLoading;

  useEffect(() => {
    if (kakaoConfigured) {
      // 미리 켜 둬야 버튼을 눌렀을 때 바로 카카오톡 창이 뜬다
      void ensureKakaoSdkReady().catch(() => {
        /* 실패 시 보내기 버튼을 누를 때 다시 시도 */
      });
    }
  }, [kakaoConfigured]);

  function showStatus(message: string) {
    setStatus(message);
    setErrorMessage(null);
    window.setTimeout(() => setStatus(null), 6000);
  }

  function showError(message: string) {
    setErrorMessage(message);
    setStatus(null);
    window.setTimeout(() => setErrorMessage(null), 6000);
  }

  async function rewriteDraft() {
    if (!report) return;
    setDrafting(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/reports/generate-report-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report }),
      });
      const data = (await res.json()) as { ok?: boolean; text?: string; message?: string };
      if (!res.ok || !data.ok || !data.text) {
        showError(data.message ?? "초안을 다시 쓰지 못했어요. 잠시 후 다시 해 주세요.");
        return;
      }
      setDraftText(data.text);
      onParentMessageChange(
        replaceLearningReportSection(parentMessage, data.text, report, academyName)
      );
      showStatus("안내 문구를 새로 썼어요.");
    } catch {
      showError("초안을 다시 쓰지 못했어요. 잠시 후 다시 해 주세요.");
    } finally {
      setDrafting(false);
    }
  }

  async function ensureShareLink(): Promise<string | null> {
    if (!report) return null;
    if (liveUrl) return liveUrl;
    setLinkLoading(true);
    try {
      const learningText = extractLearningReportSection(parentMessage) || draftText.trim();
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
        message?: string;
      };
      if (!res.ok || !data.ok || !data.shareUrl) {
        showError(data.message ?? "링크를 만들지 못했어요.");
        return null;
      }
      setShareUrl(data.shareUrl);
      setSharedMessage(parentMessage);
      onShared?.(report.student.id, new Date().toISOString());
      return data.shareUrl;
    } catch {
      showError("링크를 만들지 못했어요.");
      return null;
    } finally {
      setLinkLoading(false);
    }
  }

  async function handleKakao() {
    if (!report) return;
    if (!kakaoConfigured) {
      showError(KAKAO_UNAVAILABLE_MESSAGE);
      return;
    }
    setKakaoLoading(true);
    try {
      const url = await ensureShareLink();
      if (!url) return;
      // 화면에서 미리 본 안내 문구를 그대로 보낸다
      const paste = attachReportLinkToMessage(parentMessage, url);
      if (paste !== parentMessage) {
        onParentMessageChange(paste);
        // 링크를 덧붙인 것뿐이므로 방금 만든 링크를 그대로 쓴다
        setSharedMessage(paste);
      }
      const result = await shareReportViaKakao({
        studentName: report.student.name,
        periodLabel: report.rangeLabel,
        shareUrl: url,
        pasteMessage: paste,
        academyName,
        logoSrc,
      });
      if (result.ok) {
        // 보낸 글을 눈으로 확인할 수 있게 미리보기를 함께 띄운다
        onOpenPrint();
        showStatus("카카오톡 창이 열렸어요. 보낼 대화방을 골라 주세요. 보낸 글은 옆 미리보기와 같아요.");
      } else if (result.fallback) {
        showStatus(KAKAO_FALLBACK_MESSAGE);
      } else {
        showError(result.message);
      }
    } finally {
      setKakaoLoading(false);
    }
  }

  async function handleCopyLink() {
    const url = await ensureShareLink();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      showStatus("링크를 복사했어요.");
    } catch {
      showError("링크를 복사하지 못했어요.");
    }
  }

  async function handlePasteCopy() {
    if (!report) return;
    const url = await ensureShareLink();
    if (!url) return;
    const paste = attachReportLinkToMessage(parentMessage, url);
    if (paste !== parentMessage) {
      onParentMessageChange(paste);
      setSharedMessage(paste);
    }
    const result = await copyKakaoPasteMessage({
      studentName: report.student.name,
      periodLabel: report.rangeLabel,
      shareUrl: url,
      pasteMessage: paste,
      academyName,
      logoSrc,
    });
    if (result.ok) showStatus("안내문구 전체를 복사했어요. 카카오톡 채팅창에 붙여넣으세요(Ctrl+V).");
    else showError(result.message);
  }

  async function handleCopyMessage() {
    try {
      await navigator.clipboard.writeText(parentMessage);
      showStatus("안내 문구를 복사했어요.");
    } catch {
      showError("복사하지 못했어요. 직접 골라서 복사해 주세요.");
    }
  }

  async function handleOpenLink() {
    const url = await ensureShareLink();
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }

  const disabled = !report;

  return (
    <section className="flex flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-card xl:h-[calc(100vh-190px)] xl:min-h-[560px]">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-slate-900">학부모께 보내기</h2>
        <ReportMenu label="보내기 더 보기" disabled={disabled}>
          <ReportMenuItem icon="copy" onClick={() => void handleCopyMessage()}>
            안내 문구만 복사
          </ReportMenuItem>
          <ReportMenuItem icon="send" onClick={() => void handlePasteCopy()}>
            카카오 붙여넣기용 복사
          </ReportMenuItem>
          <ReportMenuItem icon="print" onClick={() => void onPcKakaoPrepare()}>
            PC 카톡 발송 준비
          </ReportMenuItem>
          <ReportMenuItem icon={<ExternalIcon />} onClick={() => void handleOpenLink()}>
            링크 열기
          </ReportMenuItem>
        </ReportMenu>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <label htmlFor="report-parent-message" className="text-xs font-medium text-slate-500">
          안내 문구
        </label>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled || drafting}
          onClick={() => void rewriteDraft()}
          className="-mr-2"
        >
          <Icon name="rotate" size={14} className={drafting ? "animate-spin" : ""} />
          {drafting ? "쓰는 중…" : "다시 쓰기"}
        </Button>
      </div>
      <textarea
        id="report-parent-message"
        className="ui-input mt-1 min-h-[260px] flex-1 resize-none text-sm leading-relaxed disabled:bg-slate-50"
        value={report ? parentMessage : ""}
        onChange={(e) => onParentMessageChange(e.target.value)}
        placeholder={report ? "" : "학생을 고르면 안내 문구가 들어와요."}
        disabled={disabled || drafting}
      />
      <p className="mt-1.5 text-xs text-slate-400">
        {drafting
          ? "초안을 쓰고 있어요…"
          : "학습 기록으로 초안을 만들었어요. 고쳐서 보내세요."}
      </p>

      {status ? (
        <p className="mt-2 text-xs font-medium text-green-700" role="status">
          {status}
        </p>
      ) : null}
      {errorMessage ? (
        <p className="mt-2 text-xs font-medium text-rose-700" role="alert">
          {errorMessage}
        </p>
      ) : null}
      {shareUrlWarning ? (
        <p className="mt-2 text-xs text-amber-700">{shareUrlWarning}</p>
      ) : null}

      <div className="mt-3 space-y-2">
        <Button
          className="h-10 w-full"
          disabled={disabled || busy || drafting}
          onClick={() => void handleKakao()}
          title={kakaoConfigured ? undefined : KAKAO_UNAVAILABLE_MESSAGE}
        >
          <Icon name="send" size={16} />
          {kakaoLoading ? "보낼 준비 중…" : "카카오톡으로 보내기"}
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            disabled={disabled || busy}
            onClick={() => void handleCopyLink()}
          >
            <LinkIcon size={15} />
            {linkLoading && !kakaoLoading ? "만드는 중…" : "링크 복사"}
          </Button>
          <Button variant="secondary" disabled={disabled} onClick={onOpenPrint}>
            <Icon name="download" size={15} />
            PDF 저장
          </Button>
        </div>
        <p className="text-center text-xs text-slate-400">링크는 30일 동안 열 수 있어요</p>
      </div>
    </section>
  );
}

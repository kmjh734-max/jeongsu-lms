"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/layout/NavIcon";
import {
  KAKAO_FALLBACK_MESSAGE,
  KAKAO_UNAVAILABLE_MESSAGE,
  LinkIcon,
  ReportMenu,
  ReportMenuItem,
} from "@/components/reports/report-ui";
import {
  buildStudentRecordKakaoMessage,
  formatStudentRecordReportSubject,
} from "@/lib/student-records/build-kakao-message";
import {
  isKakaoShareConfigured,
  loadKakaoSdkForReports,
  shareReportViaKakao,
  validateShareUrlForKakao,
} from "@/lib/kakao/share-report";
import type { StudentRecordAnalysisResult } from "@/lib/student-records/types";

interface StudentRecordShareActionsProps {
  result: StudentRecordAnalysisResult;
  onOpenPrint: () => void;
  onPcKakaoPrepare: () => void | Promise<void>;
  /** 결과 알림 (보고서 머리 아래에 표시) */
  onMessage: (text: string, tone: "ok" | "error") => void;
  academyName?: string;
  logoSrc?: string;
}

/** 학생부 분석 보고서 「보내기」 메뉴 — PDF · 링크 · 카카오톡 */
export function StudentRecordShareActions({
  result,
  onOpenPrint,
  onPcKakaoPrepare,
  onMessage,
  academyName,
  logoSrc,
}: StudentRecordShareActionsProps) {
  const { studentName } = result;
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState<"link" | "kakao" | "paste" | null>(null);
  const kakaoConfigured = isKakaoShareConfigured();

  useEffect(() => {
    if (kakaoConfigured) {
      void loadKakaoSdkForReports().catch(() => undefined);
    }
  }, [kakaoConfigured]);

  async function ensureShareLink(): Promise<string | null> {
    if (shareUrl) return shareUrl;
    try {
      const res = await fetch("/api/student-records/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: result.studentId,
          studentName: result.studentName,
          html: result.html,
          generatedAt: result.generatedAt,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        shareUrl?: string;
        message?: string;
      };
      if (!res.ok || !data.ok || !data.shareUrl) {
        onMessage(data.message ?? "링크를 만들지 못했어요.", "error");
        return null;
      }
      setShareUrl(data.shareUrl);
      const warning = validateShareUrlForKakao(data.shareUrl).warning;
      if (warning) onMessage(warning, "error");
      return data.shareUrl;
    } catch {
      onMessage("링크를 만들지 못했어요.", "error");
      return null;
    }
  }

  async function handleCopyLink() {
    setBusy("link");
    try {
      const url = await ensureShareLink();
      if (!url) return;
      await navigator.clipboard.writeText(url);
      onMessage("링크를 복사했어요. 로그인 없이 30일 동안 열 수 있어요.", "ok");
    } catch {
      onMessage("링크를 복사하지 못했어요.", "error");
    } finally {
      setBusy(null);
    }
  }

  async function handlePasteCopy() {
    setBusy("paste");
    try {
      const url = await ensureShareLink();
      if (!url) return;
      const text = buildStudentRecordKakaoMessage({
        studentName,
        shareUrl: url,
        academyName,
      });
      const copied = await navigator.clipboard.writeText(text).then(
        () => true,
        () => false
      );
      onMessage(
        copied
          ? "카카오톡에 붙여 넣을 안내 문구를 복사했어요."
          : "복사하지 못했어요. 직접 복사해 주세요.",
        copied ? "ok" : "error"
      );
    } finally {
      setBusy(null);
    }
  }

  async function handleKakaoShare() {
    if (!kakaoConfigured) {
      onMessage(KAKAO_UNAVAILABLE_MESSAGE, "error");
      return;
    }
    setBusy("kakao");
    try {
      await loadKakaoSdkForReports();
      const url = await ensureShareLink();
      if (!url) return;

      const pasteMessage = buildStudentRecordKakaoMessage({
        studentName,
        shareUrl: url,
        academyName,
      });
      const shareResult = await shareReportViaKakao({
        studentName,
        periodLabel: "학생부 분석",
        shareUrl: url,
        feedTitle: "학생부 분석 리포트",
        feedDescription: `${formatStudentRecordReportSubject(studentName)} 아래 링크에서 확인해 주세요.`,
        buttonTitle: "자세히 보기",
        pasteMessage,
        academyName,
        logoSrc,
      });
      if (shareResult.ok) {
        onMessage(
          shareResult.method === "feed"
            ? "카카오톡 창이 열렸어요. 카드 링크가 안 열리면 「카카오 붙여넣기용 복사」를 써 주세요."
            : "카카오톡 창이 열렸어요. 보낼 대화방을 골라 주세요.",
          "ok"
        );
      } else if (shareResult.fallback) {
        await navigator.clipboard.writeText(pasteMessage).catch(() => undefined);
        onMessage(KAKAO_FALLBACK_MESSAGE, "ok");
      } else {
        onMessage(shareResult.message, "error");
      }
    } catch {
      onMessage("카카오톡을 열지 못했어요. 잠시 후 다시 해 주세요.", "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <ReportMenu
      label="보내기"
      disabled={busy !== null}
      triggerClassName="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-md border border-brand-600 bg-brand-600 px-3.5 text-sm font-semibold text-white transition hover:border-brand-700 hover:bg-brand-700 disabled:opacity-60"
      trigger={
        <>
          <Icon name="send" size={15} />
          {busy ? "준비 중…" : "보내기"}
          <Icon name="down" size={14} />
        </>
      }
    >
      <ReportMenuItem icon="send" onClick={() => void handleKakaoShare()}>
        카카오톡으로 보내기
      </ReportMenuItem>
      <ReportMenuItem icon={<LinkIcon />} onClick={() => void handleCopyLink()}>
        링크 복사
      </ReportMenuItem>
      <ReportMenuItem icon="download" onClick={onOpenPrint}>
        PDF 저장
      </ReportMenuItem>
      <div className="my-1 border-t border-slate-100" />
      <ReportMenuItem icon="copy" onClick={() => void handlePasteCopy()}>
        카카오 붙여넣기용 복사
      </ReportMenuItem>
      <ReportMenuItem icon="print" onClick={() => void onPcKakaoPrepare()}>
        PC 카톡 발송 준비
      </ReportMenuItem>
    </ReportMenu>
  );
}

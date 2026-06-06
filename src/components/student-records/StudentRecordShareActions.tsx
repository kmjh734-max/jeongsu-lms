"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { buildStudentRecordKakaoMessage } from "@/lib/student-records/build-kakao-message";
import {
  isKakaoShareConfigured,
  loadKakaoSdkForReports,
  shareReportViaKakao,
} from "@/lib/kakao/share-report";

interface StudentRecordShareActionsProps {
  studentName: string;
  onOpenPrint: () => void;
  onPcKakaoPrepare: () => void | Promise<void>;
}

export function StudentRecordShareActions({
  studentName,
  onOpenPrint,
  onPcKakaoPrepare,
}: StudentRecordShareActionsProps) {
  const [pasteLoading, setPasteLoading] = useState(false);
  const [kakaoLoading, setKakaoLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const kakaoConfigured = isKakaoShareConfigured();

  async function handlePasteCopy() {
    setPasteLoading(true);
    setMessage(null);
    try {
      const text = buildStudentRecordKakaoMessage({ studentName });
      const copied = await navigator.clipboard.writeText(text).then(
        () => true,
        () => false
      );
      setMessage(
        copied
          ? "카카오톡에 붙여넣을 안내 문구를 복사했습니다."
          : "복사에 실패했습니다. 직접 복사해 주세요."
      );
    } finally {
      setPasteLoading(false);
    }
  }

  async function handleKakaoShare() {
    if (!kakaoConfigured) {
      setMessage("NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY가 필요합니다.");
      return;
    }
    setKakaoLoading(true);
    setMessage(null);
    try {
      await loadKakaoSdkForReports();
      const text = buildStudentRecordKakaoMessage({ studentName });
      const result = await shareReportViaKakao({
        studentName,
        periodLabel: "학생부 분석",
        shareUrl: window.location.origin,
      });
      if (result.ok) {
        const hint =
          result.method === "feed"
            ? "카드 링크가 안 열리면 「카카오 붙여넣기용 복사」를 사용해 주세요."
            : "메시지 본문의 URL을 눌러 보고서를 열 수 있습니다.";
        setMessage(
          `카카오톡 공유 창이 열렸습니다. 보낼 채팅방을 선택해 주세요. ${hint}`
        );
      } else if (result.fallback) {
        await navigator.clipboard.writeText(text).catch(() => undefined);
        setMessage(result.message);
      } else {
        setMessage(result.message);
      }
    } finally {
      setKakaoLoading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-900">보내기</p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={onOpenPrint}>
          PDF 저장 / 인쇄
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={pasteLoading}
          onClick={() => void handlePasteCopy()}
        >
          {pasteLoading ? "복사 중..." : "카카오 붙여넣기용 복사"}
        </Button>
        <Button
          type="button"
          disabled={!kakaoConfigured || kakaoLoading}
          onClick={() => void handleKakaoShare()}
        >
          {kakaoLoading ? "공유 준비 중..." : "카카오톡보내기"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => void onPcKakaoPrepare()}>
          PC 카카오 발송 준비
        </Button>
      </div>
      {message && (
        <p className="text-sm text-slate-600" role="status">
          {message}
        </p>
      )}
    </div>
  );
}

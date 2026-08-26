"use client";

import { useEffect, useMemo, useState } from "react";
import { buildListeningMissedNudgeMessage } from "@/lib/listening/build-missed-nudge-message";
import {
  isKakaoShareConfigured,
  loadKakaoSdkForReports,
  shareReportViaKakao,
} from "@/lib/kakao/share-report";
import type { ListeningStatusRow } from "@/lib/learning-status/types";

interface ListeningMissedNudgeButtonProps {
  row: ListeningStatusRow;
  year: number;
  month: number;
}

export function ListeningMissedNudgeButton({
  row,
  year,
  month,
}: ListeningMissedNudgeButtonProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const kakaoConfigured = isKakaoShareConfigured();

  const monthLabel = `${year}년 ${month}월`;
  const siteUrl =
    typeof window !== "undefined" ? window.location.origin : undefined;

  const message = useMemo(
    () =>
      buildListeningMissedNudgeMessage({
        studentName: row.studentName,
        monthLabel,
        missedDates: row.missedDates,
        completedCount: row.completedCount,
        totalCount: row.totalCount,
        correctCount: row.correctCount,
        answeredCount: row.answeredCount,
        siteUrl,
      }),
    [row, monthLabel, siteUrl]
  );

  useEffect(() => {
    if (!open || !kakaoConfigured) return;
    void loadKakaoSdkForReports().catch(() => undefined);
  }, [open, kakaoConfigured]);

  if (row.missedDates.length === 0) {
    return <span className="text-xs text-slate-400">—</span>;
  }

  async function copyMessage() {
    setBusy(true);
    setStatus(null);
    try {
      await navigator.clipboard.writeText(message);
      setStatus("메시지를 복사했습니다. 카카오톡에 붙여넣으세요.");
    } catch {
      setStatus("복사에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function shareKakao() {
    if (!kakaoConfigured) {
      setStatus("카카오 키가 없어 붙여넣기 복사를 사용해 주세요.");
      return;
    }
    setBusy(true);
    setStatus(null);
    const shareUrl = `${window.location.origin}/student/listening`;
    try {
      const result = await shareReportViaKakao({
        studentName: row.studentName,
        periodLabel: monthLabel,
        shareUrl,
        pasteMessage: message,
        feedTitle: `${row.studentName} 학생 듣기학습 안내`,
        feedDescription: `미완료 ${row.missedDates.length}일 · 수행 ${row.completedCount}/${row.totalCount}`,
        buttonTitle: "학습 바로가기",
      });
      if (result.ok) {
        setStatus("카카오톡 공유 창이 열렸습니다. 채팅방을 선택해 주세요.");
      } else if (result.fallback) {
        try {
          await navigator.clipboard.writeText(message);
          setStatus(
            result.message ||
              "공유가 어려워 문구를 복사했습니다. 카카오톡에 붙여넣으세요."
          );
        } catch {
          setStatus(result.message);
        }
      } else {
        setStatus(result.message);
      }
    } catch {
      setStatus("공유에 실패했습니다. 붙여넣기 복사를 사용해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setStatus(null);
        }}
        className="rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-900 hover:bg-amber-100"
        title={`미완료 ${row.missedDates.length}일 · 학부모 독촉`}
      >
        독촉
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900">
              미학습 학부모 안내 · {row.studentName}
            </h3>
            <p className="mt-1 text-xs text-slate-600">
              미완료 {row.missedDates.length}일 · 수행 {row.completedCount}/
              {row.totalCount}
              {row.answeredCount > 0
                ? ` · 정답 ${row.correctCount}/${row.answeredCount}`
                : ""}
            </p>
            <textarea
              readOnly
              value={message}
              rows={14}
              className="mt-3 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800"
            />
            {status && (
              <p className="mt-2 text-xs text-indigo-700">{status}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void shareKakao()}
                className="rounded-lg bg-[#FEE500] px-3 py-2 text-sm font-medium text-slate-900 disabled:opacity-50"
              >
                {busy ? "준비 중…" : "카카오톡보내기"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void copyMessage()}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 disabled:opacity-50"
              >
                문구 복사
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="ml-auto rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
              >
                닫기
              </button>
            </div>
            {!kakaoConfigured && (
              <p className="mt-2 text-[11px] text-slate-500">
                카카오 JavaScript 키가 없으면 「문구 복사」 후 PC 카카오톡에
                붙여넣으면 됩니다.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

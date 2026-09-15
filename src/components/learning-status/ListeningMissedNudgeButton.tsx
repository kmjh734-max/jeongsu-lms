"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/layout/NavIcon";
import { Button } from "@/components/ui/Button";
import { buildListeningMissedNudgeMessage } from "@/lib/listening/build-missed-nudge-message";
import {
  isKakaoShareConfigured,
  loadKakaoSdkForReports,
  shareReportViaKakao,
} from "@/lib/kakao/share-report";
import { getPublicSiteUrl, toPublicShareUrl } from "@/lib/kakao/share-url";
import type { ListeningStatusRow } from "@/lib/learning-status/types";

/**
 * 학부모 알림은 카카오톡 공유 창에서 선생님이 받는 분을 직접 고른다.
 * 여러 학생 이름을 한 메시지에 넣지 않도록 학생마다 따로 보낸다.
 */

interface NudgeContext {
  year: number;
  month: number;
  /** 안내 문구의 학원 이름(접속한 학원). 없으면 문구 쪽 기본값. */
  academyName?: string;
}

function useNudge(row: ListeningStatusRow, { year, month, academyName }: NudgeContext) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const kakaoConfigured = isKakaoShareConfigured();
  const monthLabel = `${year}년 ${month}월`;
  const siteUrl = getPublicSiteUrl();

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
        ...(academyName ? { academyName } : {}),
      }),
    [row, monthLabel, siteUrl, academyName]
  );

  async function copyMessage(): Promise<boolean> {
    setBusy(true);
    setStatus(null);
    try {
      await navigator.clipboard.writeText(message);
      setStatus("문구를 복사했어요. 카카오톡에 붙여 넣어 주세요.");
      return true;
    } catch {
      setStatus("복사하지 못했어요.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  /** 공유 창이 열리거나 문구를 복사했으면 true */
  async function shareKakao(): Promise<boolean> {
    if (!kakaoConfigured) return copyMessage();
    setBusy(true);
    setStatus(null);
    try {
      const result = await shareReportViaKakao({
        studentName: row.studentName,
        periodLabel: monthLabel,
        shareUrl: toPublicShareUrl("/student/listening"),
        pasteMessage: message,
        feedTitle: `${row.studentName} 학생 듣기학습 안내`,
        feedDescription: `안 한 날 ${row.missedDates.length}일 · 수행 ${row.completedCount}/${row.totalCount}`,
        buttonTitle: "학습 바로가기",
      });
      if (result.ok) {
        setStatus("카카오톡 창에서 받는 분을 골라 보내 주세요.");
        return true;
      }
      if (result.fallback) {
        try {
          await navigator.clipboard.writeText(message);
          setStatus("공유 창을 열 수 없어 문구를 복사했어요. 카카오톡에 붙여 넣어 주세요.");
          return true;
        } catch {
          setStatus("공유 창을 열 수 없어요. 「문구 복사」를 써 주세요.");
          return false;
        }
      }
      setStatus("공유 창을 열 수 없어요. 「문구 복사」를 써 주세요.");
      return false;
    } catch {
      setStatus("보내지 못했어요. 「문구 복사」를 써 주세요.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  return { message, busy, status, kakaoConfigured, copyMessage, shareKakao };
}

function useKakaoPreload() {
  useEffect(() => {
    if (!isKakaoShareConfigured()) return;
    void loadKakaoSdkForReports().catch(() => undefined);
  }, []);
}

function useEscape(onClose: () => void) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
}

function DialogFrame({
  title,
  description,
  onClose,
  children,
  footer,
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEscape(onClose);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-[90vh] w-full max-w-md flex-col rounded-lg border border-slate-200 bg-white shadow-card-hover"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            {description ? <p className="mt-1 text-xs text-slate-500">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? <div className="border-t border-slate-100 px-5 py-3">{footer}</div> : null}
      </div>
    </div>
  );
}

/** 학생 한 명에게 알림 (현황표에서 이름을 눌렀을 때) */
export function ListeningNudgeDialog({
  row,
  onClose,
  ...ctx
}: NudgeContext & { row: ListeningStatusRow; onClose: () => void }) {
  useKakaoPreload();
  const nudge = useNudge(row, ctx);
  const hasMissed = row.missedDates.length > 0;

  return (
    <DialogFrame
      title={`${row.studentName} 학부모께 알림`}
      description={`${row.classLabel} · 수행 ${row.completedCount}/${row.totalCount}일${
        row.answeredCount > 0 ? ` · 정답 ${row.correctCount}/${row.answeredCount}` : ""
      }`}
      onClose={onClose}
      footer={
        hasMissed ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button disabled={nudge.busy} onClick={() => void nudge.shareKakao()}>
              <Icon name="send" size={15} />
              {nudge.busy ? "준비 중…" : "카카오톡으로 보내기"}
            </Button>
            <Button variant="secondary" disabled={nudge.busy} onClick={() => void nudge.copyMessage()}>
              <Icon name="copy" size={15} />
              문구 복사
            </Button>
          </div>
        ) : undefined
      }
    >
      {hasMissed ? (
        <>
          <textarea
            readOnly
            value={nudge.message}
            rows={12}
            aria-label="보낼 문구"
            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] leading-relaxed text-slate-800"
          />
          {nudge.status ? <p className="mt-2 text-xs text-brand-700">{nudge.status}</p> : null}
          {!nudge.kakaoConfigured ? (
            <p className="mt-2 text-xs text-slate-500">
              카카오톡 공유를 쓸 수 없어 문구를 복사해요. 카카오톡에 붙여 넣어 주세요.
            </p>
          ) : null}
        </>
      ) : (
        <p className="text-sm text-slate-600">이번 달에 안 한 날이 없어요. 보낼 알림이 없어요.</p>
      )}
    </DialogFrame>
  );
}

function QueueRow({
  row,
  ctx,
  current,
  sent,
  onSent,
  onToggleSent,
}: {
  row: ListeningStatusRow;
  ctx: NudgeContext;
  current: boolean;
  sent: boolean;
  onSent: () => void;
  onToggleSent: () => void;
}) {
  const nudge = useNudge(row, ctx);

  return (
    <li
      className={`rounded-lg border px-3 py-2.5 transition ${
        current ? "border-brand-600 ring-[3px] ring-brand-50" : "border-slate-200"
      } ${sent ? "bg-slate-50" : "bg-white"}`}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSent}
          aria-pressed={sent}
          aria-label={sent ? `${row.studentName} 보냄 표시 지우기` : `${row.studentName} 보냄으로 표시`}
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] ${
            sent ? "border-green-700 bg-green-700 text-white" : "border-slate-300 bg-white"
          }`}
        >
          {sent ? <Icon name="check" size={12} strokeWidth={3} /> : null}
        </button>
        <div className="min-w-0 flex-1">
          <p className={`truncate text-sm font-semibold ${sent ? "text-slate-500" : "text-slate-900"}`}>
            {row.studentName}
            {sent ? <span className="ml-1.5 text-xs font-medium text-green-700">보냄</span> : null}
          </p>
          <p className="truncate text-xs text-slate-500">
            {row.classLabel} · 안 한 날 {row.missedDates.length}일
          </p>
        </div>
        <Button
          variant={current ? "primary" : "secondary"}
          size="sm"
          disabled={nudge.busy}
          onClick={async () => {
            if (await nudge.shareKakao()) onSent();
          }}
          data-nudge-current={current ? "true" : undefined}
        >
          {nudge.busy ? "준비 중…" : sent ? "다시 보내기" : "카카오톡으로 보내기"}
        </Button>
        <button
          type="button"
          onClick={async () => {
            if (await nudge.copyMessage()) onSent();
          }}
          disabled={nudge.busy}
          title="문구 복사"
          aria-label={`${row.studentName} 문구 복사`}
          className="shrink-0 rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
        >
          <Icon name="copy" size={15} />
        </button>
      </div>
      {nudge.status ? <p className="mt-1.5 pl-8 text-xs text-brand-700">{nudge.status}</p> : null}
    </li>
  );
}

/** 오늘 안 한 학생들에게 한 명씩 차례로 알림 */
export function ListeningNudgeQueueDialog({
  rows,
  onClose,
  ...ctx
}: NudgeContext & { rows: ListeningStatusRow[]; onClose: () => void }) {
  useKakaoPreload();
  const [sent, setSent] = useState<Set<string>>(() => new Set());
  const listRef = useRef<HTMLUListElement>(null);
  const currentId = rows.find((r) => !sent.has(r.studentId))?.studentId ?? null;

  // 한 명을 보내면 다음 학생 버튼으로 초점을 옮긴다
  useEffect(() => {
    const btn = listRef.current?.querySelector<HTMLButtonElement>(
      'button[data-nudge-current="true"]'
    );
    btn?.focus();
  }, [currentId]);

  function markSent(id: string) {
    setSent((prev) => new Set(prev).add(id));
  }

  function toggleSent(id: string) {
    setSent((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const doneCount = rows.filter((r) => sent.has(r.studentId)).length;

  return (
    <DialogFrame
      title="학부모께 알림 보내기"
      description="학생마다 따로 보내요. 카카오톡 창에서 그 학생의 학부모를 골라 보내면 다음 학생으로 넘어가요."
      onClose={onClose}
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            {rows.length}명 중 <b className="text-slate-900">{doneCount}명</b> 보냈어요
          </span>
          <Button variant={currentId ? "secondary" : "primary"} onClick={onClose}>
            {currentId ? "나중에 하기" : "다 보냈어요"}
          </Button>
        </div>
      }
    >
      <ul ref={listRef} className="space-y-2">
        {rows.map((row) => (
          <QueueRow
            key={row.studentId}
            row={row}
            ctx={ctx}
            current={row.studentId === currentId}
            sent={sent.has(row.studentId)}
            onSent={() => markSent(row.studentId)}
            onToggleSent={() => toggleSent(row.studentId)}
          />
        ))}
      </ul>
    </DialogFrame>
  );
}

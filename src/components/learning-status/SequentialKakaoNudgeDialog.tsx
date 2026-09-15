"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/layout/NavIcon";
import { Button } from "@/components/ui/Button";
import {
  isKakaoShareConfigured,
  loadKakaoSdkForReports,
  shareReportViaKakao,
  type KakaoShareParams,
} from "@/lib/kakao/share-report";

/**
 * 학부모 알림은 카카오톡 공유 창에서 선생님이 받는 분을 직접 고른다.
 * 여러 학생 이름을 한 메시지에 넣지 않도록 학생마다 따로 보낸다.
 */

/** 학생 한 명에게 보낼 알림 — 문구와 카카오 공유 카드 */
export interface KakaoNudge {
  message: string;
  share: Omit<KakaoShareParams, "pasteMessage">;
}

export interface KakaoNudgeItem extends KakaoNudge {
  id: string;
  name: string;
  /** 이름 아래 한 줄 (반 · 안 한 날 등) */
  sub: string;
}

export interface KakaoNudgeGroup {
  /** 두 묶음 이상일 때 머리글 */
  label?: string;
  items: KakaoNudgeItem[];
}

export function useKakaoNudge({ message, share }: KakaoNudge) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const kakaoConfigured = isKakaoShareConfigured();

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
      const result = await shareReportViaKakao({ ...share, pasteMessage: message });
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

  return { busy, status, kakaoConfigured, copyMessage, shareKakao };
}

export function useKakaoPreload() {
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

export function KakaoNudgeDialogFrame({
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

function SingleNudgeContent({
  title,
  description,
  nudge,
  onClose,
}: {
  title: string;
  description?: string;
  nudge: KakaoNudge;
  onClose: () => void;
}) {
  const state = useKakaoNudge(nudge);
  return (
    <KakaoNudgeDialogFrame
      title={title}
      description={description}
      onClose={onClose}
      footer={
        <div className="flex flex-wrap items-center gap-2">
          <Button disabled={state.busy} onClick={() => void state.shareKakao()}>
            <Icon name="send" size={15} />
            {state.busy ? "준비 중…" : "카카오톡으로 보내기"}
          </Button>
          <Button variant="secondary" disabled={state.busy} onClick={() => void state.copyMessage()}>
            <Icon name="copy" size={15} />
            문구 복사
          </Button>
        </div>
      }
    >
      <textarea
        readOnly
        value={nudge.message}
        rows={12}
        aria-label="보낼 문구"
        className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] leading-relaxed text-slate-800"
      />
      {state.status ? <p className="mt-2 text-xs text-brand-700">{state.status}</p> : null}
      {!state.kakaoConfigured ? (
        <p className="mt-2 text-xs text-slate-500">
          카카오톡 공유를 쓸 수 없어 문구를 복사해요. 카카오톡에 붙여 넣어 주세요.
        </p>
      ) : null}
    </KakaoNudgeDialogFrame>
  );
}

/** 학생 한 명에게 알림 (현황표에서 이름을 눌렀을 때). 보낼 게 없으면 nudge를 null로. */
export function SingleKakaoNudgeDialog({
  title,
  description,
  nudge,
  emptyText,
  onClose,
}: {
  title: string;
  description?: string;
  nudge: KakaoNudge | null;
  emptyText: string;
  onClose: () => void;
}) {
  useKakaoPreload();
  if (nudge) {
    return (
      <SingleNudgeContent title={title} description={description} nudge={nudge} onClose={onClose} />
    );
  }
  return (
    <KakaoNudgeDialogFrame title={title} description={description} onClose={onClose}>
      <p className="text-sm text-slate-600">{emptyText}</p>
    </KakaoNudgeDialogFrame>
  );
}

function QueueRow({
  item,
  current,
  sent,
  onSent,
  onToggleSent,
}: {
  item: KakaoNudgeItem;
  current: boolean;
  sent: boolean;
  onSent: () => void;
  onToggleSent: () => void;
}) {
  const nudge = useKakaoNudge(item);

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
          aria-label={sent ? `${item.name} 보냄 표시 지우기` : `${item.name} 보냄으로 표시`}
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] ${
            sent ? "border-green-700 bg-green-700 text-white" : "border-slate-300 bg-white"
          }`}
        >
          {sent ? <Icon name="check" size={12} strokeWidth={3} /> : null}
        </button>
        <div className="min-w-0 flex-1">
          <p className={`truncate text-sm font-semibold ${sent ? "text-slate-500" : "text-slate-900"}`}>
            {item.name}
            {sent ? <span className="ml-1.5 text-xs font-medium text-green-700">보냄</span> : null}
          </p>
          <p className="truncate text-xs text-slate-500">{item.sub}</p>
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
          aria-label={`${item.name} 문구 복사`}
          className="shrink-0 rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
        >
          <Icon name="copy" size={15} />
        </button>
      </div>
      {nudge.status ? <p className="mt-1.5 pl-8 text-xs text-brand-700">{nudge.status}</p> : null}
    </li>
  );
}

/** 여러 학생에게 한 명씩 차례로 알림 — 보내면 다음 학생 버튼으로 초점이 넘어간다 */
export function SequentialKakaoNudgeDialog({
  groups,
  onClose,
  title = "학부모께 알림 보내기",
  description = "학생마다 따로 보내요. 카카오톡 창에서 그 학생의 학부모를 골라 보내면 다음 학생으로 넘어가요.",
}: {
  groups: KakaoNudgeGroup[];
  onClose: () => void;
  title?: string;
  description?: string;
}) {
  useKakaoPreload();
  const [sent, setSent] = useState<Set<string>>(() => new Set());
  const listRef = useRef<HTMLDivElement>(null);
  const allItems = groups.flatMap((g) => g.items);
  const currentId = allItems.find((it) => !sent.has(it.id))?.id ?? null;

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

  const doneCount = allItems.filter((it) => sent.has(it.id)).length;
  const shownGroups = groups.filter((g) => g.items.length > 0);

  return (
    <KakaoNudgeDialogFrame
      title={title}
      description={description}
      onClose={onClose}
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            {allItems.length}명 중 <b className="text-slate-900">{doneCount}명</b> 보냈어요
          </span>
          <Button variant={currentId ? "secondary" : "primary"} onClick={onClose}>
            {currentId ? "나중에 하기" : "다 보냈어요"}
          </Button>
        </div>
      }
    >
      <div ref={listRef} className="space-y-4">
        {shownGroups.map((group, gi) => (
          <section key={group.label ?? gi}>
            {group.label ? (
              <p className="mb-2 text-xs font-semibold text-slate-500">
                {group.label} · {group.items.length}명
              </p>
            ) : null}
            <ul className="space-y-2">
              {group.items.map((item) => (
                <QueueRow
                  key={item.id}
                  item={item}
                  current={item.id === currentId}
                  sent={sent.has(item.id)}
                  onSent={() => markSent(item.id)}
                  onToggleSent={() => toggleSent(item.id)}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </KakaoNudgeDialogFrame>
  );
}

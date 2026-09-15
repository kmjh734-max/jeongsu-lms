"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Icon } from "@/components/layout/NavIcon";
import type { StageCell, StageDot } from "@/lib/vocab/stage-cell";

/* ---------- 작은 표시 조각 ---------- */

type PillTone = "good" | "bad" | "warn" | "brand" | "neutral";

const PILL_TONES: Record<PillTone, string> = {
  good: "bg-green-50 text-green-700",
  bad: "bg-rose-50 text-rose-700",
  warn: "bg-amber-50 text-amber-700",
  brand: "bg-brand-50 text-brand-700",
  neutral: "bg-slate-100 text-slate-600",
};

export function Pill({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: PillTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex h-[22px] shrink-0 items-center gap-1 whitespace-nowrap rounded px-2 text-xs font-semibold ${PILL_TONES[tone]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}

export function ProgressBar({ pct }: { pct: number }) {
  const w = Math.max(0, Math.min(100, pct));
  return (
    <div className="h-[5px] w-full overflow-hidden rounded-full bg-slate-100">
      <div className="h-full rounded-full bg-brand-600" style={{ width: `${w}%` }} />
    </div>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
  disabled,
  indeterminate = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  indeterminate?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate && !checked;
  }, [indeterminate, checked]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
      aria-label={label}
      className="h-4 w-4 shrink-0 cursor-pointer rounded accent-brand-600 disabled:cursor-not-allowed"
    />
  );
}

/** [반] [학생] 같은 두세 칸 전환 */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="inline-flex self-start overflow-hidden rounded-md border border-slate-200">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`px-5 py-2 text-[13px] font-semibold transition ${
            value === o.value
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- 창 ---------- */

export function ModalShell({
  open,
  onClose,
  title,
  subtitle,
  widthClass = "max-w-lg",
  children,
  footer,
  busy = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: ReactNode;
  widthClass?: string;
  children: ReactNode;
  footer?: ReactNode;
  busy?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, busy]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="닫기"
        onClick={() => !busy && onClose()}
      />
      <div
        className={`relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-xl bg-white shadow-2xl sm:rounded-xl ${widthClass}`}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-[22px]">
          <div className="min-w-0">
            <h2 className="text-[17px] font-bold text-slate-900">{title}</h2>
            {subtitle ? (
              <p className="mt-0.5 truncate text-[13px] text-slate-500">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="-mr-1 rounded-md p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
            aria-label="닫기"
          >
            <Icon name="x" size={20} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer ? (
          <div className="shrink-0 border-t border-slate-200 px-5 py-3.5 sm:px-[22px]">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ---------- 알림 ---------- */

export type ToastTone = "good" | "bad" | "info";

export function useToast(): [ReactNode, (text: string, tone?: ToastTone) => void] {
  const [toast, setToast] = useState<{ text: string; tone: ToastTone; key: number } | null>(
    null
  );
  const timer = useRef<number | null>(null);

  const show = useCallback((text: string, tone: ToastTone = "good") => {
    if (timer.current) window.clearTimeout(timer.current);
    setToast({ text, tone, key: Date.now() });
    timer.current = window.setTimeout(() => setToast(null), tone === "bad" ? 5000 : 3000);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    []
  );

  const node = toast ? (
    <div
      key={toast.key}
      className="pointer-events-none fixed inset-x-0 top-5 z-[60] flex justify-center px-4 lg:left-[244px]"
      role="status"
    >
      <div
        className={`pointer-events-auto flex max-w-md items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-medium shadow-lg ${
          toast.tone === "bad"
            ? "border-rose-200 text-rose-700"
            : toast.tone === "info"
              ? "border-slate-200 text-slate-700"
              : "border-green-200 text-green-700"
        }`}
      >
        <Icon name={toast.tone === "bad" ? "alert" : "check"} size={16} strokeWidth={2.2} />
        <span>{toast.text}</span>
      </div>
    </div>
  ) : null;

  return [node, show];
}

/* ---------- 줄 끝 ⋯ 메뉴 (표 밖으로 떠서 잘리지 않음) ---------- */

export interface MenuItem {
  label: string;
  icon?: string;
  onSelect: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export function RowMenu({
  items,
  label,
  className = "",
  onOpenChange,
}: {
  items: MenuItem[];
  label: string;
  className?: string;
  onOpenChange?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const openChangeRef = useRef(onOpenChange);
  openChangeRef.current = onOpenChange;
  useEffect(() => {
    openChangeRef.current?.(open);
  }, [open]);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const menuW = 176;
    const menuH = items.length * 36 + 8;
    const below = r.bottom + 4 + menuH < window.innerHeight;
    setPos({
      top: below ? r.bottom + 4 : Math.max(8, r.top - menuH - 4),
      left: Math.max(8, Math.min(r.right - menuW, window.innerWidth - menuW - 8)),
    });
  }, [open, items.length]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 ${className}`.trim()}
      >
        <Icon name="more" size={18} strokeWidth={2.4} />
      </button>
      {open && pos ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="메뉴 닫기"
            onClick={() => setOpen(false)}
          />
          <ul
            role="menu"
            className="fixed z-50 w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
            style={{ top: pos.top, left: pos.left }}
          >
            {items.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    setOpen(false);
                    item.onSelect();
                  }}
                  className={`flex h-9 w-full items-center gap-2.5 px-3 text-left text-[13px] font-medium disabled:cursor-not-allowed disabled:opacity-40 ${
                    item.danger
                      ? "text-rose-700 hover:bg-rose-50"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {item.icon ? <Icon name={item.icon} size={15} /> : null}
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </>
  );
}

/* ---------- 4단계 점 ---------- */

const DOT_CLASS: Record<StageDot, string> = {
  done: "bg-green-700",
  current: "bg-brand-600",
  failed: "bg-rose-700",
  none: "bg-slate-200",
};

export function StageDots({ dots }: { dots: StageDot[] }) {
  return (
    <span className="flex gap-[3px]" aria-hidden>
      {dots.map((d, i) => (
        <span key={i} className={`h-2 w-2 rounded-full ${DOT_CLASS[d]}`} />
      ))}
    </span>
  );
}

export function StageLegend() {
  const items: [StageDot, string][] = [
    ["done", "끝낸 단계·합격"],
    ["current", "지금 단계"],
    ["failed", "불합격"],
    ["none", "안 함"],
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-slate-500">
      {items.map(([d, label]) => (
        <span key={d} className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${DOT_CLASS[d]}`} />
          {label}
        </span>
      ))}
    </div>
  );
}

/** 점 네 개 + 점수(합격 초록·불합격 빨강) 또는 "2단계"·"시작 전" */
export function StageCellView({ cell }: { cell: StageCell }) {
  return (
    <span className="flex items-center gap-2">
      <StageDots dots={cell.dots} />
      {cell.score !== null ? (
        <span
          className={`text-xs font-bold tabular-nums ${
            cell.passed ? "text-green-700" : "text-rose-700"
          }`}
        >
          {cell.score}
        </span>
      ) : (
        <span className="text-xs text-slate-400">{cell.label}</span>
      )}
    </span>
  );
}


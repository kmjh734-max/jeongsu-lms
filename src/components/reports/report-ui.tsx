"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Icon } from "@/components/layout/NavIcon";

/* 리포트 화면(학습 리포트·학생부 분석·NELT)에서 같이 쓰는 작은 조각들 */

const CloseContext = createContext<() => void>(() => undefined);

/**
 * ⋯ 같은 버튼을 누르면 열리는 작은 메뉴.
 * 표 안(가로 스크롤 영역)에서도 잘리지 않게 화면 기준(fixed)으로 띄운다.
 */
export function ReportMenu({
  label,
  children,
  align = "right",
  trigger,
  triggerClassName,
  disabled = false,
}: {
  /** 화면 읽기용 이름 */
  label: string;
  children: ReactNode;
  align?: "left" | "right";
  /** 기본 ⋯ 대신 보일 버튼 내용 */
  trigger?: ReactNode;
  triggerClassName?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<CSSProperties>({ visibility: "hidden" });
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open) return;
    function place() {
      const btn = buttonRef.current;
      const menu = menuRef.current;
      if (!btn || !menu) return;
      const r = btn.getBoundingClientRect();
      const h = menu.offsetHeight;
      const w = menu.offsetWidth;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const top = r.bottom + 4 + h > vh - 8 && r.top - 4 - h > 8 ? r.top - 4 - h : r.bottom + 4;
      let left = align === "right" ? r.right - w : r.left;
      left = Math.max(8, Math.min(left, vw - w - 8));
      setPos({ top, left, visibility: "visible" });
    }
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, align]);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          setPos({ visibility: "hidden" });
          setOpen((v) => !v);
        }}
        className={
          triggerClassName ??
          "flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
        }
      >
        {trigger ?? <Icon name="more" size={18} />}
      </button>
      {open ? (
        <div
          ref={menuRef}
          role="menu"
          style={{ position: "fixed", ...pos }}
          className="z-[60] min-w-[11rem] rounded-lg border border-slate-200 bg-white py-1 shadow-card-hover"
        >
          <CloseContext.Provider value={() => setOpen(false)}>
            {children}
          </CloseContext.Provider>
        </div>
      ) : null}
    </div>
  );
}

export function ReportMenuItem({
  icon,
  children,
  onClick,
  danger = false,
  disabled = false,
}: {
  icon?: ReactNode;
  children: ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  const close = useContext(CloseContext);
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        close();
        onClick();
      }}
      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? "text-rose-700 hover:bg-rose-50"
          : "text-slate-700 hover:bg-slate-50"
      }`}
    >
      {typeof icon === "string" ? (
        <Icon name={icon} size={16} className="opacity-70" />
      ) : (
        icon
      )}
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </button>
  );
}

/** 짧은 선택지 묶음 (예: 이번 달 / 최근 30일 …) */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: ReactNode }[];
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex max-w-full overflow-x-auto rounded-md border border-slate-200 bg-white p-0.5 shadow-card"
    >
      {options.map((opt) => {
        const on = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(opt.value)}
            className={`h-8 shrink-0 whitespace-nowrap rounded px-3 text-sm transition ${
              on
                ? "bg-side font-semibold text-white"
                : "font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/** 이름 첫 글자 동그라미 */
export function NameAvatar({
  name,
  size = "sm",
  active = false,
}: {
  name: string;
  size?: "sm" | "lg";
  active?: boolean;
}) {
  const initial = name.trim().charAt(0) || "?";
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${
        size === "lg" ? "h-10 w-10 text-base" : "h-7 w-7 text-xs"
      } ${active ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-500"}`}
    >
      {initial}
    </span>
  );
}

/** NavIcon에 없는 선 아이콘 */
export function LinkIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0"
    >
      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
    </svg>
  );
}

export function EyeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0"
    >
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function ExternalIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0 opacity-70"
    >
      <path d="M14 4h6v6" />
      <path d="M20 4 11 13" />
      <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  );
}

/** 카카오 공유 키가 없을 때 쓰는 문구 */
export const KAKAO_UNAVAILABLE_MESSAGE =
  "카카오톡 보내기를 쓸 수 없어요. 관리자에게 문의해 주세요.";

/** 카카오 공유창 대신 링크를 복사했을 때 */
export const KAKAO_FALLBACK_MESSAGE =
  "카카오톡을 열지 못해 링크를 복사했어요. 대화창에 붙여 넣어 보내 주세요.";

/** 2026-09-15 → 9/15 */
export function formatMonthDay(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/** 2026-09-15 → 9월 15일 */
export function formatKoreanDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

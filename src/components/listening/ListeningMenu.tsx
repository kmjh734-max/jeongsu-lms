"use client";

import Link from "next/link";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Icon } from "@/components/layout/NavIcon";

const CloseContext = createContext<() => void>(() => undefined);

/** ⋯ 버튼을 누르면 열리는 작은 메뉴 */
export function ListeningMenu({
  label,
  children,
  align = "right",
  trigger,
  triggerClassName,
}: {
  /** 화면 읽기용 이름 (예: "고1 듣기 1회 메뉴") */
  label: string;
  children: ReactNode;
  align?: "left" | "right";
  /** 기본 ⋯ 대신 보일 버튼 내용 */
  trigger?: ReactNode;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={
          triggerClassName ??
          "flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        }
      >
        {trigger ?? <Icon name="more" size={18} />}
      </button>
      {open ? (
        <div
          role="menu"
          className={`absolute top-full z-30 mt-1 min-w-[11rem] rounded-lg border border-slate-200 bg-white py-1 shadow-card-hover ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <CloseContext.Provider value={() => setOpen(false)}>
            {children}
          </CloseContext.Provider>
        </div>
      ) : null}
    </div>
  );
}

const ITEM_CLASS =
  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-40";

export function ListeningMenuItem({
  icon,
  children,
  onClick,
  href,
  danger = false,
  disabled = false,
  active = false,
}: {
  icon?: string;
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
  disabled?: boolean;
  /** 지금 선택된 항목 (예: 지금 들어 있는 폴더) */
  active?: boolean;
}) {
  const close = useContext(CloseContext);
  const tone = danger
    ? "text-rose-700 hover:bg-rose-50"
    : active
      ? "font-semibold text-brand-700 hover:bg-brand-50"
      : "text-slate-700 hover:bg-slate-50";
  const inner = (
    <>
      {icon ? <Icon name={icon} size={16} className="opacity-70" /> : null}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {active ? <Icon name="check" size={14} /> : null}
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} role="menuitem" className={`${ITEM_CLASS} ${tone}`} onClick={close}>
        {inner}
      </Link>
    );
  }
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        close();
        onClick?.();
      }}
      className={`${ITEM_CLASS} ${tone}`}
    >
      {inner}
    </button>
  );
}

export function ListeningMenuLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-3 pb-1 pt-2 text-[11px] font-semibold text-slate-400">{children}</p>
  );
}

export function ListeningMenuDivider() {
  return <div className="my-1 h-px bg-slate-100" />;
}

"use client";

import { useEffect, type ReactNode } from "react";
import { Icon } from "@/components/layout/NavIcon";

/** 반 화면에서 쓰는 가운데 창 (바깥 클릭·Esc로 닫힘) */
export function ClassModal({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 px-4 py-16 sm:items-center sm:py-8"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal
        aria-label={title}
        className="w-full max-w-md rounded-lg border border-slate-200 bg-white shadow-card-hover"
      >
        <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-5">
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="px-5 pb-5 pt-2">{children}</div>
        {footer ? (
          <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

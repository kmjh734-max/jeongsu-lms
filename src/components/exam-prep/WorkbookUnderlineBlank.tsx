"use client";

import type { KeyboardEvent, Ref } from "react";

/** 인천 워크북 밑줄 빈칸 스타일 입력 */
export function WorkbookUnderlineBlank({
  value,
  disabled,
  ariaLabel,
  sizeCh = 10,
  status,
  inputRef,
  onChange,
  onKeyDown,
}: {
  value: string;
  disabled?: boolean;
  ariaLabel?: string;
  sizeCh?: number;
  status?: boolean | null;
  inputRef?: Ref<HTMLInputElement>;
  onChange: (value: string) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
}) {
  const tone =
    status === true
      ? "border-emerald-600 text-emerald-800"
      : status === false
        ? "border-rose-500 text-rose-800"
        : "border-slate-800 text-slate-900";

  return (
    <input
      ref={inputRef}
      type="text"
      disabled={disabled}
      autoCapitalize="off"
      autoCorrect="off"
      spellCheck={false}
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      className={`workbook-underline-blank mx-0.5 inline-block border-0 border-b-2 bg-transparent px-0.5 py-0 text-center text-[14px] outline-none focus:border-brand-600 disabled:opacity-70 ${tone}`}
      style={{ width: `${Math.max(sizeCh, 4)}ch`, minWidth: "4ch" }}
    />
  );
}

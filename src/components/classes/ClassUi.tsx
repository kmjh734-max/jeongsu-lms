import { Icon } from "@/components/layout/NavIcon";

/** 가는 진행 막대 + 숫자. 50% 아래는 주황으로 눈에 띄게. */
export function MiniBar({
  percent,
  label,
  warnBelow = 50,
  className = "",
}: {
  percent: number;
  /** 막대 오른쪽 글 (기본: n%) */
  label?: string;
  warnBelow?: number;
  className?: string;
}) {
  const clamped = Math.min(100, Math.max(0, Math.round(percent)));
  const warn = clamped < warnBelow;
  return (
    <div className={`flex items-center gap-2 ${className}`.trim()}>
      <div className="h-[5px] min-w-[48px] flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${warn ? "bg-amber-700" : "bg-brand-600"}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span
        className={`shrink-0 text-xs font-semibold tabular-nums ${
          warn ? "text-amber-700" : "text-slate-900"
        }`}
      >
        {label ?? `${clamped}%`}
      </span>
    </div>
  );
}

/** 흰 바탕 위 짙은 칸이 켜지는 구분 버튼 줄 (활성/보관, 정렬 등) */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex shrink-0 overflow-hidden rounded-md border border-slate-200 bg-white"
    >
      {options.map((opt) => {
        const on = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(opt.value)}
            className={`whitespace-nowrap px-3.5 py-[7px] text-[13px] font-semibold transition ${
              on ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/** 돋보기 달린 검색 칸 */
export function SearchBox({
  value,
  onChange,
  placeholder,
  className = "",
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  id?: string;
}) {
  return (
    <div className={`relative ${className}`.trim()}>
      <Icon
        name="search"
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        autoComplete="off"
        className="ui-input h-9 pl-9"
      />
    </div>
  );
}

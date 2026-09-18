"use client";

/** 처음 쓰는 학원에도 고를 거리가 있게 보여 주는 기본 카테고리 */
const DEFAULT_CATEGORIES = ["문법", "독해", "어휘", "내신", "수능", "특강"];

/** 강좌 카테고리: 이미 쓴 것·기본값을 눌러 고르거나 직접 적는다 */
export function CourseCategoryInput({
  value,
  onChange,
  existing = [],
  disabled,
  compact,
}: {
  value: string;
  onChange: (v: string) => void;
  /** 학원에서 이미 쓰는 카테고리 */
  existing?: string[];
  disabled?: boolean;
  compact?: boolean;
}) {
  const options = [...new Set([...existing, ...DEFAULT_CATEGORIES])].filter(Boolean);
  return (
    <div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, 20))}
        disabled={disabled}
        placeholder="예: 문법 (비우면 ‘기타’)"
        className={compact ? "ui-input h-9 w-full text-sm" : "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"}
      />
      <div className="mt-1.5 flex flex-wrap gap-1">
        {options.map((c) => (
          <button
            key={c}
            type="button"
            disabled={disabled}
            onClick={() => onChange(value === c ? "" : c)}
            className={`rounded-full border px-2 py-0.5 text-xs font-semibold transition ${
              value === c
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

/** 저장할 값: 앞뒤 공백 정리, 비면 null */
export function normalizeCourseCategory(v: string): string | null {
  const t = v.trim().replace(/\s+/g, " ");
  return t ? t.slice(0, 20) : null;
}

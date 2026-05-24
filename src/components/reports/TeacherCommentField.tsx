"use client";

interface TeacherCommentFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

/** 강사 코멘트 입력 (향후 report_comments 테이블 저장용 분리 컴포넌트) */
export function TeacherCommentField({
  value,
  onChange,
  disabled,
}: TeacherCommentFieldProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">강사 코멘트</h2>
      <p className="mt-1 text-sm text-slate-500">
        입력한 내용은 학부모 발송용 문구에 포함됩니다. (현재는 저장되지 않습니다)
      </p>
      <textarea
        className="ui-input mt-4 min-h-[120px] w-full resize-y text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="이번 주 학습 태도와 보완할 점을 입력해주세요."
        disabled={disabled}
        aria-label="강사 코멘트"
      />
    </section>
  );
}

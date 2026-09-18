export default function PrintLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center gap-2 text-sm text-slate-500">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
      인쇄 미리보기 준비 중…
    </div>
  );
}

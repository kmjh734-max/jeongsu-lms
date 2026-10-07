/** 어휘 진단 공개 화면의 안내(잘못된·만료·회수 링크) */
export function DiagNotice({ academyName, text }: { academyName: string; text: string }) {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-white px-4 pt-10 text-slate-900">
      {academyName && <p className="text-xs font-semibold text-brand-700">{academyName}</p>}
      <h1 className="mt-1 text-lg font-bold">어휘 진단</h1>
      <p className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700" role="alert">
        {text}
      </p>
    </main>
  );
}

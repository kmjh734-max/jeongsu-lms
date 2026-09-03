export function LessonMaterialComicFrame({
  imageUrl,
  captions,
  emptyHint,
}: {
  imageUrl?: string | null;
  captions?: string[] | null;
  emptyHint?: string;
}) {
  const caps = (captions ?? []).filter((c) => c.trim().length > 0).slice(0, 4);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      {imageUrl ? (
        <div className="relative aspect-square bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="수업자료 4컷 삽화"
            className="h-full w-full object-contain"
          />
          {caps.length > 0 ? (
            <div className="pointer-events-none absolute inset-0 grid grid-cols-2 grid-rows-2 p-[3%]">
              {caps.map((text, i) => (
                <div key={i} className="flex items-start justify-center p-[6%]">
                  <div
                    className="max-w-[95%] rounded-[1.25rem] border border-slate-200 bg-white/95 px-2 py-1.5 text-center text-[11px] font-medium leading-snug text-slate-800 shadow-sm sm:text-xs"
                    style={{
                      fontFamily:
                        '"Malgun Gothic","Apple SD Gothic Neo","Noto Sans KR",sans-serif',
                    }}
                  >
                    {text}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="flex aspect-square flex-col items-center justify-center gap-3 p-4">
          <div className="text-center text-xs text-slate-400">
            {emptyHint ?? "아직 삽화가 없습니다."}
          </div>
        </div>
      )}
    </div>
  );
}

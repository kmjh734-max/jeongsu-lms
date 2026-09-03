export function LessonMaterialComicFrame({
  imageUrl,
  emptyHint,
}: {
  imageUrl?: string | null;
  emptyHint?: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      {imageUrl ? (
        <div className="aspect-square bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="수업자료 4컷 삽화"
            className="h-full w-full object-contain"
          />
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

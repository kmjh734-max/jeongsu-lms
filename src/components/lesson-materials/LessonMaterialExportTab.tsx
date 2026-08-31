"use client";

import { useMemo } from "react";
import { LineInterpretationExportActions } from "@/components/lesson-materials/LineInterpretationTab";
import { LineInterpretationPreview } from "@/components/lesson-materials/LineInterpretationPreview";
import { defaultDisplaySettings } from "@/lib/lesson-materials/display-settings";
import { sanitizeFilename } from "@/lib/lesson-materials/export-line-interpretation";
import type { LessonMaterialItemDetail } from "@/lib/lesson-materials/load-items";

export function LessonMaterialExportTab({
  item,
}: {
  item: LessonMaterialItemDetail;
}) {
  const settings = item.content.displaySettings ?? defaultDisplaySettings();
  const result = item.content.lineInterpretation ?? null;

  const exportBaseName = useMemo(() => {
    const title =
      settings.headerTitle.trim() ||
      result?.passageTitle ||
      item.title ||
      "lesson-material";
    return sanitizeFilename(title);
  }, [item.title, result?.passageTitle, settings.headerTitle]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">내보내기</h2>
        <p className="mt-1 text-sm text-slate-600">
          생성된 자료를 인쇄하거나 한글·Word에서 열 수 있는 형식으로
          내려받습니다.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-slate-900">한줄해석</h3>
        {!result ? (
          <p className="mt-2 text-sm text-slate-500">
            「한줄해석」 탭에서 먼저 생성해 주세요.
          </p>
        ) : (
          <>
            <div className="mt-3">
              <LineInterpretationExportActions
                result={result}
                settings={settings}
                exportBaseName={exportBaseName}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              한글(HWP): HTML을 <strong>파일 → 불러오기</strong>로 열거나 RTF를
              더블클릭하세요.
            </p>
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <LineInterpretationPreview result={result} settings={settings} />
            </div>
            <div className="lesson-print-only" aria-hidden="true">
              <LineInterpretationPreview result={result} settings={settings} />
            </div>
          </>
        )}
      </section>
    </div>
  );
}

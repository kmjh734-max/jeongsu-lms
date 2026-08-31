"use client";

import type {
  LineInterpretationDisplaySettings,
  LineInterpretationResult,
} from "@/lib/lesson-materials/types";
import {
  BACKGROUND_COLORS,
  ENGLISH_FONT_SIZE_PX,
  FONT_FAMILY_STACK,
  KOREAN_FONT_SIZE_PX,
} from "@/lib/lesson-materials/display-settings";

function displayTitle(
  result: LineInterpretationResult,
  settings: LineInterpretationDisplaySettings
): string {
  return settings.headerTitle.trim() || result.passageTitle;
}

function displaySubtitle(
  result: LineInterpretationResult,
  settings: LineInterpretationDisplaySettings
): string {
  return settings.headerSubtitle.trim() || result.subtitle || "";
}

export function LineInterpretationPreview({
  result,
  settings,
  className = "",
}: {
  result: LineInterpretationResult;
  settings: LineInterpretationDisplaySettings;
  className?: string;
}) {
  const title = displayTitle(result, settings);
  const subtitle = displaySubtitle(result, settings);
  const bg = BACKGROUND_COLORS[settings.background];
  const font = FONT_FAMILY_STACK[settings.fontFamily];
  const enSize = ENGLISH_FONT_SIZE_PX[settings.englishFontSize];
  const koSize = KOREAN_FONT_SIZE_PX[settings.koreanFontSize];

  return (
    <div
      id="lesson-line-interpretation-preview"
      className={`lesson-print-sheet rounded-lg border border-slate-200 shadow-sm ${className}`.trim()}
      style={{
        background: bg,
        fontFamily: font,
        color: "#111",
        lineHeight: 1.55,
      }}
    >
      <div className="lesson-print-header">
        <h2
          className="lesson-print-title"
          style={{ fontSize: enSize + 4 }}
        >
          {title}
        </h2>
        {subtitle ? (
          <p className="lesson-print-subtitle" style={{ fontSize: koSize }}>
            {subtitle}
          </p>
        ) : null}
      </div>

      <table className="lesson-print-table">
        <thead>
          <tr>
            {settings.showLineNumbers ? <th>No.</th> : null}
            <th>English</th>
            {settings.showKorean ? <th>한글 해석</th> : null}
          </tr>
        </thead>
        <tbody>
          {result.lines.map((line) => (
            <tr key={line.no}>
              {settings.showLineNumbers ? (
                <td className="lesson-print-no" style={{ fontSize: koSize - 1 }}>
                  {line.no}
                </td>
              ) : null}
              <td className="lesson-print-en" style={{ fontSize: enSize }}>
                {line.english}
              </td>
              {settings.showKorean ? (
                <td className="lesson-print-ko" style={{ fontSize: koSize }}>
                  {line.korean}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

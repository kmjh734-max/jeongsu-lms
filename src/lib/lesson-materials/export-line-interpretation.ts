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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

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

export function buildLineInterpretationHtml(
  result: LineInterpretationResult,
  settings: LineInterpretationDisplaySettings,
  opts?: { forHwp?: boolean }
): string {
  const bg = BACKGROUND_COLORS[settings.background];
  const font = FONT_FAMILY_STACK[settings.fontFamily];
  const enSize = ENGLISH_FONT_SIZE_PX[settings.englishFontSize];
  const koSize = KOREAN_FONT_SIZE_PX[settings.koreanFontSize];
  const title = displayTitle(result, settings);
  const subtitle = displaySubtitle(result, settings);
  const showKo = settings.showKorean;

  const rows = result.lines
    .map((line) => {
      const noCell = settings.showLineNumbers
        ? `<td class="no">${line.no}</td>`
        : "";
      const koCell = showKo
        ? `<td class="ko">${escapeHtml(line.korean)}</td>`
        : "";
      return `<tr>
        ${noCell}
        <td class="en">${escapeHtml(line.english)}</td>
        ${koCell}
      </tr>`;
    })
    .join("\n");

  const colgroup = settings.showLineNumbers
    ? showKo
      ? `<col style="width:4%" /><col style="width:48%" /><col style="width:48%" />`
      : `<col style="width:4%" /><col style="width:96%" />`
    : showKo
      ? `<col style="width:50%" /><col style="width:50%" />`
      : "";

  const headerRow = settings.showLineNumbers
    ? showKo
      ? `<tr><th>No.</th><th>English</th><th>한글 해석</th></tr>`
      : `<tr><th>No.</th><th>English</th></tr>`
    : showKo
      ? `<tr><th>English</th><th>한글 해석</th></tr>`
      : `<tr><th>English</th></tr>`;

  const hwpNote = opts?.forHwp
    ? `<p style="font-size:11px;color:#666;margin-bottom:12px;">한글(HWP)에서 <strong>파일 → 불러오기</strong>로 이 HTML 파일을 열 수 있습니다.</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="Generator" content="EngCore Lesson Materials" />
<title>${escapeHtml(title)}</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  body {
    margin: 0;
    padding: 24px;
    background: ${bg};
    font-family: ${font};
    color: #111;
    line-height: 1.55;
  }
  .header { margin-bottom: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
  .header h1 { margin: 0 0 4px; font-size: ${enSize + 4}px; font-weight: 700; }
  .header p { margin: 0; font-size: ${koSize}px; color: #475569; }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  th, td { border: 1px solid #cbd5e1; padding: 8px 10px; vertical-align: top; word-wrap: break-word; }
  th { background: #f1f5f9; font-size: ${koSize - 1}px; font-weight: 600; }
  td.en { font-size: ${enSize}px; }
  td.ko { font-size: ${koSize}px; color: #1e293b; }
  td.no { text-align: center; font-size: ${koSize - 1}px; color: #64748b; width: 36px; }
  tr:nth-child(even) td { background: rgba(255,255,255,0.55); }
</style>
</head>
<body>
${hwpNote}
<div class="header">
  <h1>${escapeHtml(title)}</h1>
  ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ""}
</div>
<table>
  ${colgroup ? `<colgroup>${colgroup}</colgroup>` : ""}
  <thead>${headerRow}</thead>
  <tbody>
${rows}
  </tbody>
</table>
</body>
</html>`;
}

/** RTF — 한글·Word에서 열 수 있는 간단 형식 */
export function buildLineInterpretationRtf(
  result: LineInterpretationResult,
  settings: LineInterpretationDisplaySettings
): string {
  const title = displayTitle(result, settings);
  const subtitle = displaySubtitle(result, settings);
  const showKo = settings.showKorean;

  const esc = (s: string) =>
    s
      .replace(/\\/g, "\\\\")
      .replace(/{/g, "\\{")
      .replace(/}/g, "\\}")
      .replace(/\n/g, "\\line ");

  const rows: string[] = [];
  for (const line of result.lines) {
    const prefix = settings.showLineNumbers ? `${line.no}. ` : "";
    if (showKo) {
      rows.push(
        `${esc(prefix + line.english)}\\tab ${esc(line.korean)}\\line`
      );
    } else {
      rows.push(`${esc(prefix + line.english)}\\line`);
    }
  }

  const header = subtitle
    ? `${esc(title)}\\line ${esc(subtitle)}\\line\\line`
    : `${esc(title)}\\line\\line`;

  return `{\\rtf1\\ansi\\ansicpg949\\deff0
{\\fonttbl{\\f0\\fnil\\fcharset129 Malgun Gothic;}}
\\viewkind4\\uc1\\pard\\lang1042\\f0\\fs24
${header}${rows.join("\n")}
}`;
}

export function downloadTextFile(
  filename: string,
  content: string,
  mime: string
): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, "_").slice(0, 80) || "line-interpretation";
}

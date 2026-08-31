"use client";

import { useCallback, useMemo, useState } from "react";
import { LineInterpretationPreview } from "@/components/lesson-materials/LineInterpretationPreview";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  BACKGROUND_LABELS,
  defaultDisplaySettings,
  FONT_FAMILY_LABELS,
  FONT_SIZE_LABELS,
} from "@/lib/lesson-materials/display-settings";
import {
  buildLineInterpretationHtml,
  buildLineInterpretationRtf,
  downloadTextFile,
  sanitizeFilename,
} from "@/lib/lesson-materials/export-line-interpretation";
import type {
  LessonMaterialBackground,
  LessonMaterialFontFamily,
  LessonMaterialFontSize,
  LineInterpretationDisplaySettings,
  LineInterpretationResult,
} from "@/lib/lesson-materials/types";

async function fetchLineInterpretation(input: {
  passage: string;
  lessonLabel?: string;
  passageTitle?: string;
}): Promise<
  | { ok: true; result: LineInterpretationResult }
  | { ok: false; message: string }
> {
  try {
    const res = await fetch("/api/lesson-materials/line-interpretation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      credentials: "same-origin",
    });

    const data = (await res.json()) as {
      ok: boolean;
      message?: string;
      result?: LineInterpretationResult;
    };

    if (!data.ok || !data.result) {
      return {
        ok: false,
        message: data.message ?? "한줄해석 생성에 실패했습니다.",
      };
    }

    return { ok: true, result: data.result };
  } catch {
    return { ok: false, message: "한줄해석 생성에 실패했습니다." };
  }
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Record<T, string>;
  onChange: (v: T) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-slate-600">
      <span className="font-medium">{label}</span>
      <select
        className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-800"
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {(Object.entries(options) as [T, string][]).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </select>
    </label>
  );
}

export function LineInterpretationWorkbench() {
  const [passage, setPassage] = useState("");
  const [lessonLabel, setLessonLabel] = useState("");
  const [passageTitleHint, setPassageTitleHint] = useState("");
  const [result, setResult] = useState<LineInterpretationResult | null>(null);
  const [settings, setSettings] = useState<LineInterpretationDisplaySettings>(
    defaultDisplaySettings()
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const updateSettings = useCallback(
    (patch: Partial<LineInterpretationDisplaySettings>) => {
      setSettings((prev) => ({ ...prev, ...patch }));
    },
    []
  );

  const exportBaseName = useMemo(() => {
    const title =
      settings.headerTitle.trim() ||
      result?.passageTitle ||
      "line-interpretation";
    return sanitizeFilename(title);
  }, [result?.passageTitle, settings.headerTitle]);

  async function handleGenerate() {
    setError(null);
    setMessage(null);
    const text = passage.trim();
    if (text.length < 30) {
      setError("지문을 30자 이상 입력해 주세요.");
      return;
    }

    setBusy(true);
    const res = await fetchLineInterpretation({
      passage: text,
      lessonLabel: lessonLabel.trim() || undefined,
      passageTitle: passageTitleHint.trim() || undefined,
    });
    setBusy(false);

    if (!res.ok) {
      setError(res.message);
      return;
    }

    setResult(res.result);
    if (!settings.headerTitle.trim()) {
      updateSettings({ headerTitle: res.result.passageTitle });
    }
    if (!settings.headerSubtitle.trim() && res.result.subtitle) {
      updateSettings({ headerSubtitle: res.result.subtitle });
    }
    setMessage(`${res.result.lines.length}문장으로 나누었습니다.`);
  }

  function handlePrint() {
    if (!result) return;
    document.body.classList.add("lesson-print-active");
    window.print();
    window.setTimeout(() => {
      document.body.classList.remove("lesson-print-active");
    }, 500);
  }

  function handleExportHtml() {
    if (!result) return;
    const html = buildLineInterpretationHtml(result, settings, { forHwp: true });
    downloadTextFile(`${exportBaseName}.html`, html, "text/html;charset=utf-8");
  }

  function handleExportRtf() {
    if (!result) return;
    const rtf = buildLineInterpretationRtf(result, settings);
    downloadTextFile(`${exportBaseName}.rtf`, rtf, "application/rtf");
  }

  return (
    <div className="lesson-materials-workbench">
      <PageHeader
        title="한줄해석"
        description="영어 지문을 문장 단위로 나누고 한글 해석을 붙여 수업·녹화용 자료를 만듭니다. 폰트·배경·해석 표시를 조절한 뒤 인쇄하거나 HTML/RTF로 내보낼 수 있습니다."
      />

      {error ? <Alert variant="error">{error}</Alert> : null}
      {message ? (
        <Alert variant="success" className="mt-3">
          {message}
        </Alert>
      ) : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-slate-900">지문 입력</h2>

          <label className="flex flex-col gap-1 text-xs text-slate-600">
            <span className="font-medium">영어 지문</span>
            <textarea
              className="min-h-[280px] w-full rounded-md border border-slate-300 px-3 py-2 text-sm leading-relaxed text-slate-800"
              placeholder="교과서·모의고사 지문을 붙여 넣으세요."
              value={passage}
              onChange={(e) => setPassage(e.target.value)}
            />
            <span className="text-slate-400">{passage.trim().length}자</span>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs text-slate-600">
              <span className="font-medium">단원·과 라벨 (선택)</span>
              <input
                type="text"
                className="h-9 rounded-md border border-slate-300 px-2 text-sm"
                placeholder="예: 영어독해와 작문 미래엔 1과"
                value={lessonLabel}
                onChange={(e) => setLessonLabel(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-600">
              <span className="font-medium">제목 힌트 (선택)</span>
              <input
                type="text"
                className="h-9 rounded-md border border-slate-300 px-2 text-sm"
                placeholder="예: The Power of Habit"
                value={passageTitleHint}
                onChange={(e) => setPassageTitleHint(e.target.value)}
              />
            </label>
          </div>

          <Button
            type="button"
            onClick={handleGenerate}
            disabled={busy}
            className="w-full sm:w-auto"
          >
            {busy ? "생성 중…" : "한줄해석 생성"}
          </Button>
        </section>

        <section className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-slate-900">
              표시·내보내기 설정
            </h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <SelectField
                label="글꼴"
                value={settings.fontFamily}
                options={FONT_FAMILY_LABELS}
                onChange={(v: LessonMaterialFontFamily) =>
                  updateSettings({ fontFamily: v })
                }
              />
              <SelectField
                label="영어 글자 크기"
                value={settings.englishFontSize}
                options={FONT_SIZE_LABELS}
                onChange={(v: LessonMaterialFontSize) =>
                  updateSettings({ englishFontSize: v })
                }
              />
              <SelectField
                label="한글 글자 크기"
                value={settings.koreanFontSize}
                options={FONT_SIZE_LABELS}
                onChange={(v: LessonMaterialFontSize) =>
                  updateSettings({ koreanFontSize: v })
                }
              />
              <SelectField
                label="배경색"
                value={settings.background}
                options={BACKGROUND_LABELS}
                onChange={(v: LessonMaterialBackground) =>
                  updateSettings({ background: v })
                }
              />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs text-slate-600">
                <span className="font-medium">자료 제목</span>
                <input
                  type="text"
                  className="h-9 rounded-md border border-slate-300 px-2 text-sm"
                  placeholder="생성 후 자동 입력"
                  value={settings.headerTitle}
                  onChange={(e) =>
                    updateSettings({ headerTitle: e.target.value })
                  }
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-slate-600">
                <span className="font-medium">부제</span>
                <input
                  type="text"
                  className="h-9 rounded-md border border-slate-300 px-2 text-sm"
                  value={settings.headerSubtitle}
                  onChange={(e) =>
                    updateSettings({ headerSubtitle: e.target.value })
                  }
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-700">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.showKorean}
                  onChange={(e) =>
                    updateSettings({ showKorean: e.target.checked })
                  }
                />
                한글 해석 표시
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.showLineNumbers}
                  onChange={(e) =>
                    updateSettings({ showLineNumbers: e.target.checked })
                  }
                />
                줄 번호 표시
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!result}
                onClick={handlePrint}
              >
                인쇄 / PDF
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!result}
                onClick={handleExportHtml}
              >
                HTML (한글 불러오기)
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!result}
                onClick={handleExportRtf}
              >
                RTF (한글·Word)
              </Button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              한글(HWP): HTML 파일을{" "}
              <strong>파일 → 불러오기</strong>로 열거나, RTF를 더블클릭해
              열 수 있습니다. HWPX 전용 변환은 2단계에서 검토합니다.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              미리보기
            </h2>
            {result ? (
              <LineInterpretationPreview result={result} settings={settings} />
            ) : (
              <p className="text-sm text-slate-500">
                지문을 입력하고 생성하면 여기에 미리보기가 표시됩니다.
              </p>
            )}
          </div>
        </section>
      </div>

      {result ? (
        <div className="lesson-print-only" aria-hidden="true">
          <LineInterpretationPreview result={result} settings={settings} />
        </div>
      ) : null}
    </div>
  );
}

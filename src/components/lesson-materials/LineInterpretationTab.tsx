"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import * as adminActions from "@/app/admin/lesson-materials/actions";
import * as teacherActions from "@/app/teacher/lesson-materials/actions";
import { LineInterpretationPreview } from "@/components/lesson-materials/LineInterpretationPreview";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import {
  defaultDisplaySettings,
  FONT_FAMILY_LABELS,
  FONT_SIZE_LABELS,
  BACKGROUND_LABELS,
} from "@/lib/lesson-materials/display-settings";
import {
  buildLineInterpretationHtml,
  buildLineInterpretationRtf,
  downloadTextFile,
} from "@/lib/lesson-materials/export-line-interpretation";
import type { LessonMaterialProjectDetail } from "@/lib/lesson-materials/load-project";
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

export function LineInterpretationTab({
  role,
  project,
}: {
  role: "admin" | "teacher";
  project: LessonMaterialProjectDetail;
}) {
  const router = useRouter();
  const actions = role === "admin" ? adminActions : teacherActions;

  const initialSettings =
    project.content.displaySettings ?? defaultDisplaySettings();

  const [passageTitleHint, setPassageTitleHint] = useState(
    project.content.passageTitleHint ?? ""
  );
  const [result, setResult] = useState<LineInterpretationResult | null>(
    project.content.lineInterpretation ?? null
  );
  const [settings, setSettings] =
    useState<LineInterpretationDisplaySettings>(initialSettings);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const passage = project.source_passage?.trim() ?? "";
  const lessonLabel = project.lesson_label?.trim() ?? "";

  const updateSettings = useCallback(
    (patch: Partial<LineInterpretationDisplaySettings>) => {
      setSettings((prev) => ({ ...prev, ...patch }));
    },
    []
  );

  async function persistContent(patch: {
    lineInterpretation?: LineInterpretationResult | null;
    displaySettings?: LineInterpretationDisplaySettings;
    passageTitleHint?: string;
  }) {
    return actions.updateLessonMaterialProject(project.id, {
      contentPatch: patch,
    });
  }

  async function handleSaveSettings() {
    setSaving(true);
    setError(null);
    const res = await persistContent({
      displaySettings: settings,
      passageTitleHint,
      lineInterpretation: result,
    });
    setSaving(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setMessage("표시 설정이 저장되었습니다.");
    router.refresh();
  }

  async function handleGenerate() {
    setError(null);
    setMessage(null);
    if (passage.length < 30) {
      setError("먼저 「자료」 탭에서 지문을 30자 이상 입력·저장해 주세요.");
      return;
    }

    setBusy(true);
    const res = await fetchLineInterpretation({
      passage,
      lessonLabel: lessonLabel || undefined,
      passageTitle: passageTitleHint.trim() || undefined,
    });
    if (!res.ok) {
      setBusy(false);
      setError(res.message);
      return;
    }

    const nextSettings = { ...settings };
    if (!nextSettings.headerTitle.trim()) {
      nextSettings.headerTitle = res.result.passageTitle;
    }
    if (!nextSettings.headerSubtitle.trim() && res.result.subtitle) {
      nextSettings.headerSubtitle = res.result.subtitle;
    } else if (
      !nextSettings.headerSubtitle.trim() &&
      lessonLabel
    ) {
      nextSettings.headerSubtitle = lessonLabel;
    }

    const saveRes = await persistContent({
      lineInterpretation: res.result,
      displaySettings: nextSettings,
      passageTitleHint,
    });
    setBusy(false);

    if (!saveRes.ok) {
      setError(saveRes.message);
      return;
    }

    setResult(res.result);
    setSettings(nextSettings);
    setMessage(`${res.result.lines.length}문장으로 나누어 저장했습니다.`);
    router.refresh();
  }

  return (
    <div className="lesson-materials-workbench space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">한줄해석</h2>
        <p className="mt-1 text-sm text-slate-600">
          「자료」 탭에 저장된 지문을 문장 단위로 나누고 한글 해석을 붙입니다.
        </p>
      </div>

      {error ? <Alert variant="error">{error}</Alert> : null}
      {message ? <Alert variant="success">{message}</Alert> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <p className="text-sm text-slate-600">
            지문: {passage ? `${passage.length}자` : "없음 — 자료 탭에서 입력"}
          </p>

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

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => void handleGenerate()} disabled={busy}>
              {busy ? "생성 중…" : result ? "다시 생성" : "한줄해석 생성"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={saving}
              onClick={() => void handleSaveSettings()}
            >
              {saving ? "저장 중…" : "표시 설정 저장"}
            </Button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-slate-900">표시 설정</h3>
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
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">미리보기</h3>
            {result ? (
              <LineInterpretationPreview result={result} settings={settings} />
            ) : (
              <p className="text-sm text-slate-500">
                생성하면 여기에 미리보기가 표시됩니다.
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

export function LineInterpretationExportActions({
  result,
  settings,
  exportBaseName,
}: {
  result: LineInterpretationResult | null;
  settings: LineInterpretationDisplaySettings;
  exportBaseName: string;
}) {
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
    <div className="flex flex-wrap gap-2">
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
  );
}

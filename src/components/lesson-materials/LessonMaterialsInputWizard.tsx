"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { LessonMaterialsStepTop } from "@/components/lesson-materials/LessonMaterialsStepTop";

type PassageDraft = {
  english: string;
  korean: string;
};

const EN_MAX = 2320;

function clampTextCount(text: string, max: number) {
  return Math.min(text.length, max);
}

export function LessonMaterialsInputWizard({
  role,
}: {
  role: "admin" | "teacher";
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [passages, setPassages] = useState<PassageDraft[]>([
    { english: "", korean: "" },
  ]);

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const totalEnCount = useMemo(
    () => passages.reduce((sum, p) => sum + (p.english?.length ?? 0), 0),
    [passages]
  );

  function updatePassage(index: number, patch: Partial<PassageDraft>) {
    setPassages((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  function addPassage() {
    setPassages((prev) => [...prev, { english: "", korean: "" }]);
  }

  function removeLastPassage() {
    setPassages((prev) => (prev.length <= 1 ? prev : prev.slice(0, -1)));
  }

  function canGoNext() {
    const validEnglish = passages.some(
      (p) => (p.english ?? "").trim().length >= 30
    );
    return validEnglish;
  }

  function handleNext() {
    setError(null);
    if (!canGoNext()) {
      setError("영어 지문을 최소 30자 이상 입력해 주세요.");
      return;
    }
    setStep(2);
  }

  async function handleSave() {
    // 현재 단계는 UI 골격만 구현
    setSaving(true);
    try {
      // TODO: DB 저장/생성으로 연결
      await new Promise((r) => setTimeout(r, 600));
      setStep(3);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-4">
      <LessonMaterialsStepTop current={step} />

      {step === 1 ? (
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                자료 입력
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                영어 지문을 넣고, 필요하면 한글 해석도 직접 입력하세요.
              </p>
            </div>
            <div className="shrink-0 text-right text-xs text-slate-500">
              총 {totalEnCount}자
            </div>
          </div>

          {error ? <Alert variant="error">{error}</Alert> : null}

          {passages.map((p, idx) => {
            const enCount = clampTextCount(p.english ?? "", EN_MAX);
            return (
              <section
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-sm font-bold text-slate-700">
                    Passage {idx + 1}
                  </h2>
                  <div className="flex items-center gap-2">
                    {passages.length > 1 ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeLastPassage()}
                      >
                        마지막 제거
                      </Button>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <div className="mb-2 text-xs font-semibold text-slate-600">
                      영어 지문
                    </div>
                    <textarea
                      className="min-h-[240px] w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-800"
                      placeholder="영어 텍스트를 입력하세요. (이미지/PDF 드래그는 다음 단계에서 추가)"
                      value={p.english}
                      onChange={(e) =>
                        updatePassage(idx, {
                          english: e.target.value.slice(0, EN_MAX),
                        })
                      }
                    />
                    <div className="mt-2 text-right text-xs text-slate-400">
                      {enCount} / {EN_MAX}자
                    </div>
                  </label>

                  <label className="block">
                    <div className="mb-2 text-xs font-semibold text-slate-600">
                      한글 해석 (선택)
                    </div>
                    <textarea
                      className="min-h-[240px] w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-800"
                      placeholder="없다면 비워두세요. 이후에 한줄해석을 생성할 수 있습니다."
                      value={p.korean}
                      onChange={(e) =>
                        updatePassage(idx, { korean: e.target.value })
                      }
                    />
                  </label>
                </div>
              </section>
            );
          })}

          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={addPassage}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-white py-3 text-sm font-semibold text-slate-500 hover:border-slate-300 hover:text-slate-700"
            >
              <span aria-hidden>+</span> 지문 추가하기
            </button>

            <div className="shrink-0">
              <Button
                type="button"
                size="md"
                variant="secondary"
                onClick={handleNext}
                disabled={!canGoNext()}
              >
                다음 단계로 →
              </Button>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            role={role} 기준으로 UI만 우선 구성합니다. (생성/저장은 다음 단계에서 연결)
          </p>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            자료 정리하기
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            지금은 “다음 단계로” 동작만 열어둔 상태입니다. (다음에 참고 UI대로 라벨/목록/선택 바를 붙일게요.)
          </p>

          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-700">
              준비된 Passage
            </div>
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              {passages.map((p, idx) => (
                <li key={idx} className="flex items-center justify-between gap-4">
                  <span>Passage {idx + 1}</span>
                  <span className="text-slate-500">
                    EN {p.english.trim().length}자 / KO{" "}
                    {p.korean.trim().length}자
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <Button type="button" variant="ghost" onClick={() => setStep(1)}>
              ← 이전
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={saving}
              onClick={() => void handleSave()}
            >
              {saving ? "저장 중…" : "자료 저장하기 →"}
            </Button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">저장 완료</h2>
          <p className="mt-2 text-sm text-slate-600">
            이제 다음에 “한줄해석 생성” 화면(생성 버튼/미리보기/내보내기)을
            이 자료에 연결하면 됩니다.
          </p>
          <div className="mt-5">
            <Button type="button" variant="secondary" onClick={() => setStep(1)}>
              처음으로
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}


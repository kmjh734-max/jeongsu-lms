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
  const [selected, setSelected] = useState<Set<number>>(new Set([0]));

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
            아래 UI는 참고 화면 흐름에 맞춰 “문장 단위 정리” 형태로 구성했습니다. (AI/저장 로직은 다음 단계에서 연결)
          </p>

          {/* 상단: 분석&요약 / 삽화(placeholder) */}
          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_420px]">
            <section className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-slate-900">
                  분석 &amp; 요약
                </h3>
                <div className="text-xs text-slate-400">논리 흐름(예)</div>
              </div>
              <div className="mt-3 space-y-4">
                {[
                  {
                    title: "구성의 이유에 대한 요해",
                    desc: "유용한 개념 요소를 구상하며 전체를 단락 단위로 정리한 뒤, 강조 지점을 잡아갑니다.",
                  },
                  {
                    title: "상황과 요거주 핵심 결합의 관계",
                    desc: "구선에 간 인용과 관련된 내용을 분석하고, 핵심 요소를 요약해 단락의 역할을 정리합니다.",
                  },
                  {
                    title: "전체 관계의 중요성",
                    desc: "상황정리/표현 전개를 통해 전체적 스토리 흐름과 의미 연결을 이해합니다.",
                  },
                ].map((row, i) => (
                  <div key={i} className="rounded-lg bg-slate-50 p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded bg-brand-100 text-xs font-bold text-brand-700">
                        {i + 1}
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        {row.title}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-slate-600">
                      {row.desc}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-bold text-slate-900">
                삽화(placeholder)
              </h3>
              <div className="mt-3 aspect-[4/3] rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
                <div className="flex h-full flex-col items-center justify-center gap-3">
                  <div className="text-xs text-slate-400">이미지 없음</div>
                  <Button type="button" size="sm" className="bg-brand-600 hover:bg-brand-700">
                    삽화 재생성(샘플)
                  </Button>
                </div>
              </div>

              <div className="mt-3">
                <div className="text-xs font-semibold text-slate-600">
                  프롬프트 편집 후 엔터 (예: A cute cat reading,…)
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    className="ui-input flex-1"
                    placeholder="여기에 삽화 프롬프트를 입력하세요."
                  />
                  <Button type="button" size="sm" variant="secondary">
                    편집
                  </Button>
                </div>
              </div>
            </section>
          </div>

          {/* 하단: 문장 카드 목록 */}
          <section className="mt-5 space-y-3">
            {passages.map((p, idx) => {
              const isChecked = selected.has(idx);
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                          문장 {idx + 1}
                        </span>
                        <span className="text-xs text-slate-500">
                          영어/한글 입력
                        </span>
                      </div>

                      <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
                        <div className="rounded-xl bg-rose-50 p-3">
                          <div className="text-xs font-bold text-rose-600">
                            영어
                          </div>
                          <div className="mt-1 whitespace-pre-wrap text-sm text-rose-900">
                            {p.english?.trim() ? p.english : "영어 지문이 비어 있습니다."}
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-3">
                          <div className="text-xs font-bold text-slate-600">
                            한국어 해석
                          </div>
                          <textarea
                            className="mt-2 min-h-[72px] w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-relaxed text-slate-800"
                            placeholder="자동 번역 버튼을 누르거나 직접 입력"
                            value={p.korean}
                            onChange={(e) =>
                              updatePassage(idx, { korean: e.target.value })
                            }
                          />
                        </div>

                        <div className="flex items-start justify-end">
                          <input
                            type="checkbox"
                            className="mt-2 h-4 w-4"
                            checked={isChecked}
                            onChange={() => {
                              setSelected((prev) => {
                                const next = new Set(prev);
                                if (next.has(idx)) next.delete(idx);
                                else next.add(idx);
                                return next;
                              });
                            }}
                          />
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
                          onClick={() => {}}
                        >
                          ✏️ 영어 편집하기
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
                          onClick={() => {}}
                        >
                          ✂️ 영어 나누기
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs text-brand-700"
                          onClick={() => {}}
                        >
                          🇰🇷 한글 해석 (자동)
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
                          onClick={() => {}}
                        >
                          🧩 정리 추가하기
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          {/* 하단 액션 바 */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <Button type="button" variant="ghost" onClick={() => setStep(1)}>
              ← 이전 단계
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={saving || selected.size === 0}
              onClick={() => void handleSave()}
              className="min-w-[220px]"
            >
              {saving ? "저장 중…" : "자료 저장 완료 →"}
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


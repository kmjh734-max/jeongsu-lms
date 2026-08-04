"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  ensureDefaultStage4SettingsAction,
  listPendingStage4ReviewsAction,
  saveStage4SettingsAction,
  setStage4PublishedAction,
  teacherGradeStage4AttemptAction,
} from "@/lib/exam-prep/stage4-staff-actions";
import {
  meaningWeightSum,
  parseKeyMeaningPoints,
  type ExamStage4Setting,
  type KeyMeaningPoint,
  type Stage4SettingDraft,
} from "@/lib/exam-prep/stage4-types";
import type { ExamPassageSentence } from "@/lib/exam-prep/types";

type LocalSetting = Stage4SettingDraft & { localKey: string };

function toLocal(
  sentences: ExamPassageSentence[],
  settings: ExamStage4Setting[]
): LocalSetting[] {
  const bySid = new Map(settings.map((s) => [s.sentence_id, s]));
  return [...sentences]
    .sort((a, b) => a.sentence_order - b.sentence_order)
    .map((s) => {
      const st = bySid.get(s.id);
      return {
        localKey: s.id,
        sentence_id: s.id,
        override_model_translation: st?.override_model_translation ?? "",
        key_meaning_points: st
          ? parseKeyMeaningPoints(st.key_meaning_points)
          : [],
        accepted_expressions: st?.accepted_expressions ?? [],
        common_errors: st?.common_errors ?? [],
        teacher_explanation: st?.teacher_explanation ?? "",
        max_score: st?.max_score ?? 100,
        minimum_pass_score: st?.minimum_pass_score ?? 70,
        grading_mode: st?.grading_mode ?? "ai_assisted",
        manual_review_required: st?.manual_review_required ?? false,
        is_required: st?.is_required ?? Boolean(s.korean_text?.trim()),
      };
    });
}

export function Stage4SettingsEditor({
  passageId,
  sentences,
  initialSettings,
  initiallyPublished,
}: {
  passageId: string;
  sentences: ExamPassageSentence[];
  initialSettings: ExamStage4Setting[];
  initiallyPublished: boolean;
}) {
  const ordered = useMemo(
    () => [...sentences].sort((a, b) => a.sentence_order - b.sentence_order),
    [sentences]
  );
  const [rows, setRows] = useState(() => toLocal(ordered, initialSettings));
  const [published, setPublished] = useState(initiallyPublished);
  const [activeId, setActiveId] = useState(ordered[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [pending, setPending] = useState<
    Array<{
      id: string;
      sentence_id: string;
      answer_text: string;
      ai_score: number | null;
      attempt_number: number;
    }>
  >([]);

  useEffect(() => {
    setRows(toLocal(ordered, initialSettings));
  }, [ordered, initialSettings]);

  const activeSentence = ordered.find((s) => s.id === activeId);
  const activeRow = rows.find((r) => r.sentence_id === activeId);

  async function handleEnsure() {
    setLoading(true);
    const r = await ensureDefaultStage4SettingsAction(passageId);
    setLoading(false);
    if (!r.ok) {
      setMessage(r.message);
      return;
    }
    setMessage(`${r.created}개 기본 설정을 준비했습니다. 페이지를 새로고침합니다.`);
    window.location.reload();
  }

  async function handleSave() {
    setLoading(true);
    setMessage(null);
    const result = await saveStage4SettingsAction(passageId, rows);
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setMessage(
      `저장됨 (${result.count}문장)${
        result.warnings?.length ? ` · 경고 ${result.warnings.length}건` : ""
      }`
    );
  }

  async function handlePublish(next: boolean) {
    setLoading(true);
    const result = await setStage4PublishedAction(passageId, next);
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setPublished(next);
    setMessage(next ? "4단계를 공개했습니다." : "4단계를 비공개로 전환했습니다.");
  }

  async function loadPending() {
    const r = await listPendingStage4ReviewsAction(passageId);
    if (r.ok) {
      setPending(
        (r.attempts as typeof pending).map((a) => ({
          id: a.id as string,
          sentence_id: a.sentence_id as string,
          answer_text: a.answer_text as string,
          ai_score: a.ai_score != null ? Number(a.ai_score) : null,
          attempt_number: Number(a.attempt_number) || 1,
        }))
      );
    }
  }

  function updateActive(patch: Partial<LocalSetting>) {
    setRows((prev) =>
      prev.map((r) =>
        r.sentence_id === activeId ? { ...r, ...patch } : r
      )
    );
  }

  function addMeaning() {
    if (!activeRow) return;
    const points: KeyMeaningPoint[] = [
      ...activeRow.key_meaning_points,
      {
        id: `meaning-${Date.now()}`,
        description: "",
        weight: 0,
      },
    ];
    updateActive({ key_meaning_points: points });
  }

  const weightSum = activeRow
    ? meaningWeightSum(activeRow.key_meaning_points)
    : 0;

  return (
    <div className="ui-section-card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold text-slate-900">
            4단계 · 해석 연습하기
          </h3>
          <p className="text-xs text-slate-500">
            모범 해석은 1단계 우리말을 기본 사용합니다. 원문을 AI가 바꾸지 않습니다.
            {published ? " · 공개됨" : " · 비공개"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={loading}
            onClick={() => setPreview((v) => !v)}
          >
            {preview ? "편집으로" : "학생 미리보기"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={loading}
            onClick={() => void handleEnsure()}
          >
            기본 설정 준비
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={loading}
            onClick={() => void handleSave()}
          >
            설정 저장
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={loading}
            onClick={() => void handlePublish(!published)}
          >
            {published ? "비공개" : "4단계 공개"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void loadPending()}
          >
            검토 대기 불러오기
          </Button>
        </div>
      </div>

      {message && (
        <p className="text-sm text-slate-700" role="status">
          {message}
        </p>
      )}

      {preview ? (
        <div className="space-y-3 rounded-xl border border-violet-100 bg-violet-50/40 p-4">
          <p className="text-sm font-semibold text-violet-900">
            학생 화면 미리보기 (모범 해석 비공개)
          </p>
          {ordered.map((s) => (
            <div
              key={s.id}
              className="rounded-lg border border-white bg-white/80 p-3 text-sm"
            >
              <p className="text-xs text-slate-400">{s.sentence_order}.</p>
              <p className="mt-1 text-slate-900">{s.english_text}</p>
              <div className="mt-2 min-h-[4rem] rounded border border-dashed border-slate-300 bg-slate-50 px-2 py-1 text-xs text-slate-400">
                우리말 해석 입력창
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
          <ul className="max-h-[32rem] space-y-1 overflow-auto">
            {ordered.map((s) => {
              const r = rows.find((x) => x.sentence_id === s.id);
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                      activeId === s.id
                        ? "border-brand-500 bg-brand-50"
                        : "border-slate-200 bg-white"
                    }`}
                    onClick={() => setActiveId(s.id)}
                  >
                    {s.sentence_order}번
                    {r?.is_required ? " · 필수" : ""}
                  </button>
                </li>
              );
            })}
          </ul>

          {activeSentence && activeRow && (
            <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm">
              <p className="text-xs font-medium text-slate-500">영어 원문</p>
              <p className="text-slate-900">{activeSentence.english_text}</p>
              <p className="text-xs font-medium text-slate-500">
                1단계 모범 해석 (기본)
              </p>
              <p className="text-slate-700">
                {activeSentence.korean_text || (
                  <span className="text-amber-700">해석 없음</span>
                )}
              </p>

              <label className="block text-xs text-slate-600">
                4단계 전용 모범 해석 (비우면 1단계 해석 사용)
                <textarea
                  className="mt-1 w-full rounded border border-slate-200 px-2 py-1 text-sm"
                  rows={2}
                  value={activeRow.override_model_translation ?? ""}
                  onChange={(e) =>
                    updateActive({
                      override_model_translation: e.target.value,
                    })
                  }
                />
              </label>

              <div className="flex flex-wrap gap-3 text-xs">
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={Boolean(activeRow.is_required)}
                    onChange={(e) =>
                      updateActive({ is_required: e.target.checked })
                    }
                  />
                  필수 문장
                </label>
                <label className="flex items-center gap-1">
                  통과 점수
                  <input
                    type="number"
                    className="w-16 rounded border px-1"
                    value={activeRow.minimum_pass_score ?? 70}
                    onChange={(e) =>
                      updateActive({
                        minimum_pass_score: Number(e.target.value) || 70,
                      })
                    }
                  />
                </label>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-600">
                    핵심 의미 요소 (가중치 합 {weightSum}
                    {weightSum !== 100 && activeRow.key_meaning_points.length > 0
                      ? " · 100이 아닙니다"
                      : ""}
                    )
                  </p>
                  <Button type="button" size="sm" variant="secondary" onClick={addMeaning}>
                    추가
                  </Button>
                </div>
                <ul className="space-y-2">
                  {activeRow.key_meaning_points.map((p, i) => (
                    <li key={p.id} className="flex gap-2">
                      <input
                        className="flex-1 rounded border px-2 py-1 text-xs"
                        placeholder="의미 설명"
                        value={p.description}
                        onChange={(e) => {
                          const pts = [...activeRow.key_meaning_points];
                          pts[i] = { ...p, description: e.target.value };
                          updateActive({ key_meaning_points: pts });
                        }}
                      />
                      <input
                        type="number"
                        className="w-16 rounded border px-1 text-xs"
                        value={p.weight}
                        onChange={(e) => {
                          const pts = [...activeRow.key_meaning_points];
                          pts[i] = {
                            ...p,
                            weight: Number(e.target.value) || 0,
                          };
                          updateActive({ key_meaning_points: pts });
                        }}
                      />
                      <button
                        type="button"
                        className="text-xs text-red-600"
                        onClick={() =>
                          updateActive({
                            key_meaning_points:
                              activeRow.key_meaning_points.filter(
                                (x) => x.id !== p.id
                              ),
                          })
                        }
                      >
                        삭제
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <label className="block text-xs text-slate-600">
                허용 표현 (쉼표 구분)
                <input
                  className="mt-1 w-full rounded border px-2 py-1"
                  value={(activeRow.accepted_expressions ?? []).join(", ")}
                  onChange={(e) =>
                    updateActive({
                      accepted_expressions: e.target.value
                        .split(",")
                        .map((x) => x.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </label>
              <label className="block text-xs text-slate-600">
                자주 발생하는 오역 (쉼표 구분)
                <input
                  className="mt-1 w-full rounded border px-2 py-1"
                  value={(activeRow.common_errors ?? []).join(", ")}
                  onChange={(e) =>
                    updateActive({
                      common_errors: e.target.value
                        .split(",")
                        .map((x) => x.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </label>
              <label className="block text-xs text-slate-600">
                강사 해설
                <textarea
                  className="mt-1 w-full rounded border px-2 py-1"
                  rows={2}
                  value={activeRow.teacher_explanation ?? ""}
                  onChange={(e) =>
                    updateActive({ teacher_explanation: e.target.value })
                  }
                />
              </label>
            </div>
          )}
        </div>
      )}

      {pending.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="mb-2 text-sm font-semibold text-amber-900">
            검토 대기 {pending.length}건
          </p>
          <ul className="space-y-3">
            {pending.map((a) => (
              <li
                key={a.id}
                className="rounded-lg border border-amber-100 bg-white p-3 text-sm"
              >
                <p className="text-xs text-slate-500">
                  시도 {a.attempt_number} · AI {a.ai_score ?? "-"}점
                </p>
                <p className="mt-1">{a.answer_text}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      void teacherGradeStage4AttemptAction({
                        attemptId: a.id,
                        teacherScore: a.ai_score ?? 70,
                        teacherFeedback: "통과합니다.",
                        passed: true,
                      }).then((r) => {
                        setMessage(r.ok ? "통과 처리됨" : r.message);
                        void loadPending();
                      })
                    }
                  >
                    통과
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      void teacherGradeStage4AttemptAction({
                        attemptId: a.id,
                        teacherScore: Math.min(60, a.ai_score ?? 60),
                        teacherFeedback: "핵심 의미를 다시 확인해 보세요.",
                        passed: false,
                      }).then((r) => {
                        setMessage(r.ok ? "재도전 처리됨" : r.message);
                        void loadPending();
                      })
                    }
                  >
                    재도전
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

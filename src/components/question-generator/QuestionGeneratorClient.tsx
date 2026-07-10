"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  GRADES,
  MAX_SETS_PER_TYPE,
  MAX_TOTAL_QUESTIONS,
  OVERALL_DIFFICULTIES,
  SOURCE_TYPES,
} from "@/lib/question-generator/constants";
import { SYSTEM_PRESETS } from "@/lib/question-generator/presets";
import {
  emptyCounts,
  QUESTION_TYPE_GROUPS,
  sumCounts,
} from "@/lib/question-generator/question-types";
import type { GenerationRequestConfig } from "@/lib/question-generator/types";

type Role = "admin" | "teacher";

interface PresetRow {
  id: string;
  name: string;
  description: string | null;
  config: { counts?: Record<string, number> };
  is_system: boolean;
  slug?: string | null;
}

export function QuestionGeneratorClient({
  role,
  basePath,
}: {
  role: Role;
  basePath: string;
}) {
  const [title, setTitle] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [grade, setGrade] = useState("고1");
  const [sourceType, setSourceType] = useState("모의고사");
  const [sourceDetail, setSourceDetail] = useState("");
  const [overallDifficulty, setOverallDifficulty] = useState("내신");
  const [passage, setPassage] = useState("");
  const [counts, setCounts] = useState<Record<string, number>>(emptyCounts);
  const [modeTab, setModeTab] = useState<string>("custom");
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({
    main_idea: true,
    details: true,
    inference: true,
    grammar_vocabulary: true,
    subjective: true,
  });
  const [previewKey, setPreviewKey] = useState<string | null>(null);
  const [presets, setPresets] = useState<PresetRow[]>([]);
  const [passageId, setPassageId] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [presetName, setPresetName] = useState("");
  const [presetDesc, setPresetDesc] = useState("");
  const [showPresetForm, setShowPresetForm] = useState(false);

  const totals = useMemo(() => sumCounts(counts), [counts]);

  const config: GenerationRequestConfig = useMemo(
    () => ({
      title,
      schoolName,
      grade,
      sourceType,
      sourceDetail,
      overallDifficulty,
      passage,
      mode: modeTab === "custom" ? "custom" : "preset",
      presetId: modeTab.startsWith("preset:") ? modeTab.slice(7) : null,
      counts,
    }),
    [
      title,
      schoolName,
      grade,
      sourceType,
      sourceDetail,
      overallDifficulty,
      passage,
      modeTab,
      counts,
    ]
  );

  useEffect(() => {
    fetch("/api/question-generator/presets")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setPresets(d.presets ?? []);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    setDirty(true);
  }, [config]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const saveDraft = useCallback(async () => {
    setMessage(null);
    setError(null);
    const res = await fetch("/api/question-generator/drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passageId, config }),
    });
    const data = await res.json();
    if (!data.ok) {
      setError(data.message ?? "임시 저장 실패");
      return;
    }
    setPassageId(data.passageId);
    setSavedAt(data.savedAt);
    setDirty(false);
    setMessage("임시 저장되었습니다.");
  }, [passageId, config]);

  useEffect(() => {
    if (!dirty) return;
    const t = window.setTimeout(() => {
      void saveDraft();
    }, 2500);
    return () => window.clearTimeout(t);
  }, [dirty, saveDraft]);

  function setCount(key: string, value: number) {
    const n = Math.max(0, Math.min(MAX_SETS_PER_TYPE, Math.floor(value || 0)));
    setCounts((prev) => ({ ...prev, [key]: n }));
  }

  function applyCounts(next: Record<string, number>) {
    const base = emptyCounts();
    for (const [k, v] of Object.entries(next)) {
      if (k in base) base[k] = Math.max(0, Math.min(MAX_SETS_PER_TYPE, v));
    }
    setCounts(base);
  }

  function applySystemPreset(slug: string) {
    const p = SYSTEM_PRESETS.find((x) => x.slug === slug);
    if (!p) return;
    applyCounts(p.config.counts);
    setModeTab(slug);
  }

  function applyDbPreset(p: PresetRow) {
    applyCounts(p.config?.counts ?? {});
    setModeTab(`preset:${p.id}`);
  }

  function resetAll() {
    setCounts(emptyCounts());
    setModeTab("custom");
    setMessage(null);
    setError(null);
  }

  async function savePreset() {
    if (!presetName.trim()) {
      setError("프리셋 이름을 입력해 주세요.");
      return;
    }
    const res = await fetch("/api/question-generator/presets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: presetName,
        description: presetDesc,
        config: { counts },
        isSystem: false,
      }),
    });
    const data = await res.json();
    if (!data.ok) {
      setError(data.message ?? "프리셋 저장 실패");
      return;
    }
    setPresets((prev) => [data.preset, ...prev]);
    setShowPresetForm(false);
    setPresetName("");
    setPresetDesc("");
    setMessage("프리셋이 저장되었습니다.");
  }

  async function startGenerate() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      if (totals.total <= 0) {
        setError("생성할 문항을 1개 이상 선택해 주세요.");
        return;
      }
      if (totals.total > MAX_TOTAL_QUESTIONS) {
        setError(`최대 ${MAX_TOTAL_QUESTIONS}문항까지 생성할 수 있습니다.`);
        return;
      }
      if (!passage.trim()) {
        setError("영어 지문을 입력해 주세요.");
        return;
      }

      const res = await fetch("/api/question-generator/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message ?? "생성 요청 실패");
        return;
      }
      setDirty(false);
      // start processing in background request
      void fetch(`/api/question-generator/jobs/${data.jobId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "process" }),
      });
      window.location.href = `${basePath}/generations/${data.jobId}`;
    } finally {
      setBusy(false);
    }
  }

  const personalPresets = presets.filter((p) => !p.is_system);

  return (
    <div className="pb-28">
      <PageHeader
        title="영어 변형문제 생성"
        description="고1 학력평가 수준의 유형·난이도로 변형문제를 만듭니다. 생성 후 바로 문제·해설지 PDF를 받을 수 있습니다."
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href={`${basePath}/generations`}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              생성 기록
            </Link>
            <Link
              href={`${basePath}/review`}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              검수 대기
            </Link>
            <Link
              href={`${basePath}/approved`}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              승인된 문제
            </Link>
            <Link
              href={`${basePath}/sets`}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              문제 세트
            </Link>
          </div>
        }
      />

      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}
      {message && (
        <div className="mb-4">
          <Alert variant="success">{message}</Alert>
        </div>
      )}

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">기본 정보</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block sm:col-span-2 lg:col-span-3">
            <span className="ui-label">자료 제목</span>
            <input
              className="ui-input mt-1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 2026년 3월 고1 모의고사 32번 변형"
            />
          </label>
          <label className="block">
            <span className="ui-label">학교명 (선택)</span>
            <input
              className="ui-input mt-1"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="ui-label">학년</span>
            <select
              className="ui-select mt-1"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            >
              {GRADES.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="ui-label">출처</span>
            <select
              className="ui-select mt-1"
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
            >
              {SOURCE_TYPES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="ui-label">출처 상세</span>
            <input
              className="ui-input mt-1"
              value={sourceDetail}
              onChange={(e) => setSourceDetail(e.target.value)}
              placeholder="예: 2026년 3월 고1 모의고사 32번"
            />
          </label>
          <label className="block">
            <span className="ui-label">전체 난이도 기준</span>
            <select
              className="ui-select mt-1"
              value={overallDifficulty}
              onChange={(e) => setOverallDifficulty(e.target.value)}
            >
              {OVERALL_DIFFICULTIES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2 lg:col-span-3">
            <span className="ui-label">영어 지문</span>
            <textarea
              className="ui-input mt-1 min-h-[220px] font-serif text-[15px] leading-relaxed"
              value={passage}
              onChange={(e) => setPassage(e.target.value)}
              placeholder="영어 지문을 그대로 붙여넣으세요. 줄바꿈·문장부호·따옴표는 임의로 바꾸지 않습니다."
              spellCheck={false}
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {savedAt
            ? `마지막 임시 저장: ${new Date(savedAt).toLocaleString("ko-KR")}`
            : "변경 사항은 자동으로 임시 저장됩니다."}
          {role === "admin" ? " · 관리자" : " · 강사"}
        </p>
      </section>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">생성 방식</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { id: "custom", label: "유형 직접 설정" },
            { id: "standard_mixed", label: "표준 종합 (고1)" },
            { id: "main_idea_focus", label: "대의·내용 집중" },
            { id: "blank_order_focus", label: "빈칸·배열 집중" },
            { id: "grammar_vocab_focus", label: "어법·어휘 집중" },
            { id: "advanced_full", label: "고난도 통합" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (tab.id === "custom") setModeTab("custom");
                else applySystemPreset(tab.id);
              }}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                modeTab === tab.id ||
                (tab.id !== "custom" && modeTab === tab.id)
                  ? "bg-brand-700 text-white"
                  : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
          {personalPresets.length > 0 && (
            <select
              className="ui-select w-auto"
              value={modeTab.startsWith("preset:") ? modeTab : ""}
              onChange={(e) => {
                const id = e.target.value.replace("preset:", "");
                const p = personalPresets.find((x) => x.id === id);
                if (p) applyDbPreset(p);
              }}
            >
              <option value="">저장한 프리셋…</option>
              {personalPresets.map((p) => (
                <option key={p.id} value={`preset:${p.id}`}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          프리셋을 선택하면 아래 세트 수가 자동 입력되며, 이후 직접 수정할 수
          있습니다.
        </p>
      </section>

      <section className="mb-6 space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">유형별 세트 수</h2>
        {QUESTION_TYPE_GROUPS.map((group) => {
          const selectedInGroup = group.options.reduce(
            (acc, o) => acc + (counts[o.key] ?? 0),
            0
          );
          const open = openCats[group.category] ?? true;
          return (
            <div
              key={group.category}
              className="rounded-2xl border border-slate-200 bg-white shadow-card"
            >
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-3 text-left"
                onClick={() =>
                  setOpenCats((prev) => ({
                    ...prev,
                    [group.category]: !open,
                  }))
                }
              >
                <span className="font-semibold text-slate-900">
                  {group.label}
                  {selectedInGroup > 0 && (
                    <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-800">
                      {selectedInGroup}
                    </span>
                  )}
                </span>
                <span className="text-slate-400">{open ? "▲" : "▼"}</span>
              </button>
              {open && (
                <div className="border-t border-slate-100 px-4 py-3">
                  <div className="grid gap-2 lg:grid-cols-2">
                    {group.options.map((opt) => (
                      <div
                        key={opt.key}
                        className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/80 px-2 py-1.5"
                      >
                        <span className="min-w-0 flex-1 text-sm text-slate-800">
                          {opt.label}
                        </span>
                        <button
                          type="button"
                          className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600"
                          title={opt.preview}
                          onClick={() =>
                            setPreviewKey(
                              previewKey === opt.key ? null : opt.key
                            )
                          }
                        >
                          미리보기
                        </button>
                        <button
                          type="button"
                          className="h-8 w-8 rounded border border-slate-200 bg-white text-slate-700"
                          onClick={() =>
                            setCount(opt.key, (counts[opt.key] ?? 0) - 1)
                          }
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min={0}
                          max={MAX_SETS_PER_TYPE}
                          className="ui-input w-14 py-1 text-center"
                          value={counts[opt.key] ?? 0}
                          onChange={(e) =>
                            setCount(opt.key, Number(e.target.value))
                          }
                        />
                        <button
                          type="button"
                          className="h-8 w-8 rounded border border-slate-200 bg-white text-slate-700"
                          onClick={() =>
                            setCount(opt.key, (counts[opt.key] ?? 0) + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                    ))}
                  </div>
                  {previewKey &&
                    group.options.some((o) => o.key === previewKey) && (
                      <p className="mt-3 rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-900">
                        {
                          group.options.find((o) => o.key === previewKey)
                            ?.preview
                        }
                      </p>
                    )}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {showPresetForm && (
        <section className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-900">
            현재 설정을 프리셋으로 저장
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              className="ui-input"
              placeholder="프리셋 이름"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
            />
            <input
              className="ui-input"
              placeholder="설명 (선택)"
              value={presetDesc}
              onChange={(e) => setPresetDesc(e.target.value)}
            />
          </div>
          <div className="mt-3 flex gap-2">
            <Button type="button" onClick={() => void savePreset()}>
              저장
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowPresetForm(false)}
            >
              취소
            </Button>
          </div>
        </section>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="text-sm text-slate-700">
            <span className="font-semibold text-slate-900">
              총 {totals.total}문항
            </span>
            <span className="mx-2 text-slate-300">|</span>
            객관식 {totals.objective}
            <span className="mx-2 text-slate-300">|</span>
            주관식 {totals.subjective}
            <span className="mx-2 text-slate-300">|</span>
            유형 {totals.selectedTypes}종
            {totals.total > MAX_TOTAL_QUESTIONS && (
              <span className="ml-2 text-red-600">
                (최대 {MAX_TOTAL_QUESTIONS} 초과)
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => void saveDraft()}
            >
              임시 저장
            </Button>
            <Button type="button" variant="ghost" onClick={resetAll}>
              전체 초기화
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowPresetForm(true)}
            >
              프리셋 저장
            </Button>
            <Button
              type="button"
              disabled={busy || totals.total === 0}
              onClick={() => void startGenerate()}
            >
              {busy ? "요청 중…" : "변형문제 생성"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

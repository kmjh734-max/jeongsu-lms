"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import * as adminActions from "@/app/admin/lesson-materials/actions";
import * as teacherActions from "@/app/teacher/lesson-materials/actions";
import { LessonMaterialStepper } from "@/components/lesson-materials/LessonMaterialStepper";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { defaultProjectTitle } from "@/lib/lesson-materials/project-content";
import type { LessonMaterialProjectDetail } from "@/lib/lesson-materials/load-project";

type InputMode = "single" | "batch" | "exam" | null;

const METHODS = [
  {
    id: "single" as const,
    icon: "📋",
    title: "개별 입력 (직접/이미지)",
    description:
      "지문을 하나씩 직접 입력하거나, 이미지 파일을 가져와 인식합니다.",
    ready: true,
  },
  {
    id: "batch" as const,
    icon: "📄",
    title: "일괄 입력 (자동 구분)",
    description:
      "여러 지문이 섞인 텍스트를 한 번에 붙여넣으면 문맥을 파악해 자동으로 분류합니다.",
    ready: false,
  },
  {
    id: "exam" as const,
    icon: "📝",
    title: "지문 가져오기 (수능·모의)",
    description: "수능·모의고사 형식의 지문을 불러와 자료로 등록합니다.",
    ready: false,
  },
];

export function LessonMaterialNewItemWizard({
  role,
  project,
}: {
  role: "admin" | "teacher";
  project: LessonMaterialProjectDetail;
}) {
  const router = useRouter();
  const base =
    role === "admin" ? "/admin/lesson-materials" : "/teacher/lesson-materials";
  const actions = role === "admin" ? adminActions : teacherActions;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mode, setMode] = useState<InputMode>(null);
  const [label, setLabel] = useState("");
  const [title, setTitle] = useState("");
  const [passage, setPassage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pickMode(next: InputMode) {
    if (!next) return;
    const meta = METHODS.find((m) => m.id === next);
    if (!meta?.ready) {
      setError("해당 입력 방식은 준비 중입니다.");
      return;
    }
    setError(null);
    setMode(next);
    setStep(2);
  }

  async function handleSave() {
    setBusy(true);
    setError(null);
    const res = await actions.createLessonMaterialItem(project.id, {
      label: label || project.title,
      title: title.trim() || (passage.trim() ? defaultProjectTitle(passage) : "새 지문"),
      sourcePassage: passage,
    });
    setBusy(false);
    if (!res.ok || !res.itemId) {
      setError(res.message);
      return;
    }
    router.push(`${base}/project/${project.id}/item/${res.itemId}?tab=passage`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-4">
      <LessonMaterialStepper current={step} />

      {step === 1 ? (
        <div className="space-y-6 text-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              자료 입력 방식 선택
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              원하시는 자료 입력 방식을 선택해 주세요.
            </p>
          </div>
          {error ? <Alert variant="error">{error}</Alert> : null}
          <div className="grid gap-4 sm:grid-cols-3">
            {METHODS.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => pickMode(method.id)}
                className={`rounded-2xl border bg-white p-6 text-left shadow-sm transition hover:border-brand-300 hover:shadow-md ${
                  method.ready ? "border-slate-200" : "border-slate-100 opacity-80"
                }`}
              >
                <span className="text-3xl" aria-hidden>
                  {method.icon}
                </span>
                <h2 className="mt-4 text-base font-bold text-slate-900">
                  {method.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {method.description}
                </p>
                {!method.ready ? (
                  <span className="mt-3 inline-block text-xs font-medium text-slate-400">
                    준비 중
                  </span>
                ) : null}
              </button>
            ))}
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push(`${base}/project/${project.id}?tab=materials`)}
          >
            ← 자료 목록으로
          </Button>
        </div>
      ) : null}

      {step === 2 && mode === "single" ? (
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">지문 입력</h1>
            <p className="mt-1 text-sm text-slate-600">
              {project.title}에 추가할 지문을 입력하세요.
            </p>
          </div>
          {error ? <Alert variant="error">{error}</Alert> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs text-slate-600">
              <span className="font-medium">구분 라벨</span>
              <input
                className="h-10 rounded-md border border-slate-300 px-3 text-sm"
                placeholder={`예: ${project.title} 5과 본문1-1`}
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-600">
              <span className="font-medium">제목</span>
              <input
                className="h-10 rounded-md border border-slate-300 px-3 text-sm"
                placeholder="비우면 지문 첫 줄로 자동 입력"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-xs text-slate-600">
            <span className="font-medium">영어 지문</span>
            <textarea
              className="min-h-[280px] w-full rounded-md border border-slate-300 px-3 py-2 text-sm leading-relaxed"
              value={passage}
              onChange={(e) => setPassage(e.target.value)}
              placeholder="교과서·모의고사 지문을 붙여 넣으세요."
            />
            <span className="text-slate-400">{passage.trim().length}자</span>
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => setStep(1)}>
              이전
            </Button>
            <Button
              type="button"
              disabled={passage.trim().length < 30}
              onClick={() => {
                setError(null);
                setStep(3);
              }}
            >
              다음 — 정리하기
            </Button>
          </div>
        </div>
      ) : null}

      {step === 3 && mode === "single" ? (
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">저장 확인</h1>
            <p className="mt-1 text-sm text-slate-600">
              입력 내용을 확인한 뒤 저장하세요.
            </p>
          </div>
          {error ? <Alert variant="error">{error}</Alert> : null}
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="font-medium text-slate-500">구분</dt>
              <dd className="mt-0.5 text-slate-900">{label || project.title}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">제목</dt>
              <dd className="mt-0.5 text-slate-900">
                {title.trim() || defaultProjectTitle(passage)}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">지문 미리보기</dt>
              <dd className="mt-1 max-h-48 overflow-y-auto rounded-lg bg-slate-50 p-3 text-slate-800 whitespace-pre-wrap">
                {passage.trim().slice(0, 600)}
                {passage.length > 600 ? "…" : ""}
              </dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => setStep(2)}>
              이전
            </Button>
            <Button type="button" disabled={busy} onClick={() => void handleSave()}>
              {busy ? "저장 중…" : "저장하기"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

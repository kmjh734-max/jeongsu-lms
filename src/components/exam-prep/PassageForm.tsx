"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  createPassageAction,
  updatePassageAction,
} from "@/lib/exam-prep/staff-actions";
import type { ExamPassage, ExamPassageStatus } from "@/lib/exam-prep/types";

type PassageFormFields = {
  title: string;
  grade: string;
  school_level: string;
  source: string;
  exam_name: string;
  exam_year: string;
  exam_month: string;
  original_text: string;
  school_name: string;
  textbook_name: string;
  publisher: string;
  unit_name: string;
  exam_range: string;
  passage_number: string;
  passage_type: string;
  difficulty: string;
  full_translation: string;
  teacher_note: string;
  exam_points: string;
  status: ExamPassageStatus;
};

function emptyFields(initial?: Partial<ExamPassage>): PassageFormFields {
  return {
    title: initial?.title ?? "",
    grade: initial?.grade ?? "",
    school_level: initial?.school_level ?? "",
    source: initial?.source ?? "",
    exam_name: initial?.exam_name ?? "",
    exam_year: initial?.exam_year != null ? String(initial.exam_year) : "",
    exam_month: initial?.exam_month != null ? String(initial.exam_month) : "",
    original_text: initial?.original_text ?? "",
    school_name: initial?.school_name ?? "",
    textbook_name: initial?.textbook_name ?? "",
    publisher: initial?.publisher ?? "",
    unit_name: initial?.unit_name ?? "",
    exam_range: initial?.exam_range ?? "",
    passage_number: initial?.passage_number ?? "",
    passage_type: initial?.passage_type ?? "",
    difficulty: initial?.difficulty ?? "",
    full_translation: initial?.full_translation ?? "",
    teacher_note: initial?.teacher_note ?? "",
    exam_points: initial?.exam_points ?? "",
    status: initial?.status ?? "draft",
  };
}

export function PassageForm({
  mode,
  basePath,
  initial,
  passageId,
}: {
  mode: "create" | "edit";
  basePath: string;
  initial?: Partial<ExamPassage>;
  passageId?: string;
}) {
  const router = useRouter();
  const [fields, setFields] = useState(() => emptyFields(initial));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function setField<K extends keyof PassageFormFields>(
    key: K,
    value: PassageFormFields[K]
  ) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const payload = {
      title: fields.title,
      grade: fields.grade || null,
      school_level: fields.school_level || null,
      source: fields.source || null,
      exam_name: fields.exam_name || null,
      exam_year: fields.exam_year ? Number(fields.exam_year) : null,
      exam_month: fields.exam_month ? Number(fields.exam_month) : null,
      original_text: fields.original_text,
      school_name: fields.school_name || null,
      textbook_name: fields.textbook_name || null,
      publisher: fields.publisher || null,
      unit_name: fields.unit_name || null,
      exam_range: fields.exam_range || null,
      passage_number: fields.passage_number || null,
      passage_type: fields.passage_type || null,
      difficulty: fields.difficulty || null,
      full_translation: fields.full_translation || null,
      teacher_note: fields.teacher_note || null,
      exam_points: fields.exam_points || null,
      status: fields.status,
    };

    const result =
      mode === "create"
        ? await createPassageAction(payload)
        : passageId
          ? await updatePassageAction(passageId, payload)
          : { ok: false as const, message: "지문 ID가 없습니다." };

    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    if (mode === "create" && "id" in result) {
      router.push(`${basePath}/passages/${result.id}`);
      return;
    }
    setMessage("저장되었습니다.");
    router.refresh();
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
  const labelClass = "block text-sm font-medium text-slate-700";

  return (
    <form onSubmit={handleSubmit} className="ui-section-card space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          제목 <span className="text-red-500">*</span>
          <input
            required
            className={inputClass}
            value={fields.title}
            onChange={(e) => setField("title", e.target.value)}
          />
        </label>
        <label className={labelClass}>
          학년 <span className="text-red-500">*</span>
          <input
            required
            className={inputClass}
            value={fields.grade}
            onChange={(e) => setField("grade", e.target.value)}
            placeholder="예: 중2, 고1"
          />
        </label>
        <label className={labelClass}>
          학교급
          <select
            className={inputClass}
            value={fields.school_level}
            onChange={(e) => setField("school_level", e.target.value)}
          >
            <option value="">선택</option>
            <option value="중학교">중학교</option>
            <option value="고등학교">고등학교</option>
          </select>
        </label>
        <label className={labelClass}>
          출처
          <input
            className={inputClass}
            value={fields.source}
            onChange={(e) => setField("source", e.target.value)}
            placeholder="예: 인천광역시교육청 학력평가"
          />
        </label>
        <label className={labelClass}>
          시험명
          <input
            className={inputClass}
            value={fields.exam_name}
            onChange={(e) => setField("exam_name", e.target.value)}
          />
        </label>
        <label className={labelClass}>
          시험 연도
          <input
            type="number"
            className={inputClass}
            value={fields.exam_year}
            onChange={(e) => setField("exam_year", e.target.value)}
            placeholder="2026"
          />
        </label>
        <label className={labelClass}>
          시험 월
          <input
            type="number"
            min={1}
            max={12}
            className={inputClass}
            value={fields.exam_month}
            onChange={(e) => setField("exam_month", e.target.value)}
            placeholder="7"
          />
        </label>
        <label className={labelClass}>
          학교
          <input
            className={inputClass}
            value={fields.school_name}
            onChange={(e) => setField("school_name", e.target.value)}
          />
        </label>
        <label className={labelClass}>
          교과서
          <input
            className={inputClass}
            value={fields.textbook_name}
            onChange={(e) => setField("textbook_name", e.target.value)}
          />
        </label>
        <label className={labelClass}>
          출판사
          <input
            className={inputClass}
            value={fields.publisher}
            onChange={(e) => setField("publisher", e.target.value)}
          />
        </label>
        <label className={labelClass}>
          단원
          <input
            className={inputClass}
            value={fields.unit_name}
            onChange={(e) => setField("unit_name", e.target.value)}
          />
        </label>
        <label className={labelClass}>
          시험 범위
          <input
            className={inputClass}
            value={fields.exam_range}
            onChange={(e) => setField("exam_range", e.target.value)}
          />
        </label>
        <label className={labelClass}>
          지문 번호
          <input
            className={inputClass}
            value={fields.passage_number}
            onChange={(e) => setField("passage_number", e.target.value)}
          />
        </label>
        <label className={labelClass}>
          유형
          <input
            className={inputClass}
            value={fields.passage_type}
            onChange={(e) => setField("passage_type", e.target.value)}
            placeholder="예: 본문, 대화"
          />
        </label>
        <label className={labelClass}>
          난이도
          <select
            className={inputClass}
            value={fields.difficulty}
            onChange={(e) => setField("difficulty", e.target.value)}
          >
            <option value="">선택</option>
            <option value="easy">쉬움</option>
            <option value="medium">보통</option>
            <option value="hard">어려움</option>
          </select>
        </label>
        <label className={labelClass}>
          상태
          <select
            className={inputClass}
            value={fields.status}
            onChange={(e) =>
              setField("status", e.target.value as ExamPassageStatus)
            }
          >
            <option value="draft">초안</option>
            <option value="ready">준비완료</option>
            <option value="archived">보관</option>
          </select>
        </label>
      </div>

      <label className={labelClass}>
        원문 <span className="text-red-500">*</span>
        <textarea
          required
          rows={8}
          className={inputClass}
          value={fields.original_text}
          onChange={(e) => setField("original_text", e.target.value)}
        />
      </label>

      <label className={labelClass}>
        전체 해석
        <textarea
          rows={5}
          className={inputClass}
          value={fields.full_translation}
          onChange={(e) => setField("full_translation", e.target.value)}
        />
      </label>

      <label className={labelClass}>
        교사 메모
        <textarea
          rows={3}
          className={inputClass}
          value={fields.teacher_note}
          onChange={(e) => setField("teacher_note", e.target.value)}
        />
      </label>

      <label className={labelClass}>
        시험 포인트
        <textarea
          rows={3}
          className={inputClass}
          value={fields.exam_points}
          onChange={(e) => setField("exam_points", e.target.value)}
        />
      </label>

      {message && (
        <p
          className={`text-sm ${
            message.includes("저장") ? "text-green-700" : "text-red-600"
          }`}
          role="status"
        >
          {message}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "저장 중..." : mode === "create" ? "지문 생성" : "저장"}
        </Button>
      </div>
    </form>
  );
}

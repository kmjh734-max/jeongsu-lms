"use client";

/**
 * 분석지 「고치기」에서 누른 자리를 고치는 작은 창과 「오류 신고」 창(선생님 2026-10-22 시안 승인).
 * 고친 결과를 만드는 일은 analysis-markup-edit.ts가 한다. 여기는 고를 것만 보여 준다.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  readAnalysisMarkup,
  type MarkupRoleCode,
  type MarkupRoleLevel,
} from "@/lib/lesson-materials/analysis-markup";
import { plainSentenceText, type MarkupEdit } from "@/lib/lesson-materials/analysis-markup-edit";
import type { AnalysisSentence } from "@/lib/lesson-materials/generate-analysis-report";
import { ANALYSIS_LABEL_GUIDE } from "@/lib/lesson-materials/analysis-label-guide";

export type MarkupEditTarget = {
  kind: "role" | "note" | "point" | "trans" | "sentence";
  /** 문장 번호(0부터) */
  s: number;
  /** 그 문장 표시 안의 자리 */
  i: number;
  /** 누른 자리(화면 좌표) */
  x: number;
  y: number;
};

const ROLES: MarkupRoleCode[] = ["S", "V", "O", "C", "IO", "DO", "M", "A"];
const LEVELS: Array<{ v: MarkupRoleLevel; label: string }> = [
  { v: 0, label: "주절" },
  { v: 1, label: "종속절¹" },
  { v: 2, label: "그 안의 절²" },
];
const KIND_TITLE: Record<MarkupEditTarget["kind"], string> = {
  role: "문장성분",
  note: "이름표",
  point: "번호 설명",
  trans: "해석",
  sentence: "이 문장",
};

const chip = (on: boolean) =>
  `min-w-[34px] rounded-md border px-2 py-1 text-xs font-extrabold ${
    on ? "border-[#1b4a85] bg-[#1b4a85] text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
  }`;

export function AnalysisMarkupEditPopover({
  target,
  sentence,
  onApply,
  onReport,
  onClose,
}: {
  target: MarkupEditTarget;
  sentence: AnalysisSentence;
  onApply: (edit: MarkupEdit) => void;
  onReport: () => void;
  onClose: () => void;
}) {
  const shown = useMemo(() => readAnalysisMarkup(sentence.markup, plainSentenceText(sentence)), [sentence]);
  const role = target.kind === "role" ? shown?.roles[target.i] : undefined;
  const note = target.kind === "note" ? shown?.notes[target.i] : undefined;
  const point = target.kind === "point" ? shown?.points[target.i] : undefined;
  const [pickRole, setPickRole] = useState<MarkupRoleCode>(role?.role ?? "S");
  const [pickLevel, setPickLevel] = useState<MarkupRoleLevel>(role?.level ?? 0);
  const [pickLabel, setPickLabel] = useState(note?.label ?? "");
  const [text, setText] = useState(
    target.kind === "point" ? point?.explanation ?? "" : target.kind === "trans" ? shown?.translation ?? "" : ""
  );
  // 이름표 규칙서 목록(지금 붙은 이름이 목록 밖이면 맨 위에)
  const labels = useMemo(() => {
    const guide = ANALYSIS_LABEL_GUIDE.map(([l]) => l);
    return note?.label && !guide.includes(note.label) ? [note.label, ...guide] : guide;
  }, [note?.label]);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
    };
  }, [onClose]);

  // 화면 밖으로 나가지 않게
  const width = target.kind === "point" || target.kind === "trans" ? 360 : 260;
  const left = Math.max(12, Math.min(target.x, (typeof window !== "undefined" ? window.innerWidth : 1200) - width - 12));
  const top = Math.min(target.y + 6, (typeof window !== "undefined" ? window.innerHeight : 800) - 260);
  const subject = shown ? shown.text.slice(
    (role ?? note ?? point)?.span.start ?? 0,
    (role ?? note ?? point)?.span.end ?? 0
  ) : "";

  return (
    <div
      ref={box}
      role="dialog"
      aria-label={`${KIND_TITLE[target.kind]} 고치기`}
      className="fixed z-50 rounded-lg border border-slate-200 bg-white p-3 text-slate-800 shadow-xl print:hidden"
      style={{ left, top, width }}
    >
      <p className="mb-1 text-[11px] font-bold text-slate-500">
        {target.s + 1}번 문장 · {KIND_TITLE[target.kind]}
        {subject ? <span className="ml-1 font-semibold text-[#1b4a85]">「{subject.length > 40 ? `${subject.slice(0, 40)}…` : subject}」</span> : null}
      </p>

      {target.kind === "role" && role ? (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {ROLES.map((r) => (
              <button key={r} type="button" className={chip(r === pickRole)} onClick={() => setPickRole(r)}>
                {r}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {LEVELS.map((l) => (
              <button key={l.v} type="button" className={chip(l.v === pickLevel)} onClick={() => setPickLevel(l.v)}>
                {l.label}
              </button>
            ))}
          </div>
          <div className="flex justify-between gap-2 pt-1">
            <button type="button" className="text-xs font-bold text-rose-700 hover:underline" onClick={() => onApply({ kind: "role", i: target.i, role: null, level: 0 })}>
              성분 떼기
            </button>
            <button type="button" className="rounded-md bg-[#1b4a85] px-3 py-1 text-xs font-bold text-white" onClick={() => onApply({ kind: "role", i: target.i, role: pickRole, level: pickLevel })}>
              고치기
            </button>
          </div>
        </div>
      ) : null}

      {target.kind === "note" && note ? (
        <div className="space-y-2">
          <select
            id="markup-edit-note-label"
            value={pickLabel}
            onChange={(e) => setPickLabel(e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm"
          >
            {labels.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <div className="flex justify-between gap-2">
            <button type="button" className="text-xs font-bold text-rose-700 hover:underline" onClick={() => onApply({ kind: "note", i: target.i, label: null })}>
              이름표 떼기
            </button>
            <button type="button" className="rounded-md bg-[#1b4a85] px-3 py-1 text-xs font-bold text-white" onClick={() => onApply({ kind: "note", i: target.i, label: pickLabel })}>
              고치기
            </button>
          </div>
        </div>
      ) : null}

      {target.kind === "point" || target.kind === "trans" ? (
        <div className="space-y-2">
          <textarea
            id="markup-edit-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={target.kind === "point" ? 5 : 3}
            className="w-full resize-y rounded-md border border-slate-200 px-2 py-1.5 text-[13px] leading-relaxed"
            autoFocus
          />
          <div className="flex justify-between gap-2">
            {target.kind === "point" ? (
              <button type="button" className="text-xs font-bold text-rose-700 hover:underline" onClick={() => onApply({ kind: "point", i: target.i, explanation: null })}>
                설명 빼기
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              disabled={!text.trim()}
              className="rounded-md bg-[#1b4a85] px-3 py-1 text-xs font-bold text-white disabled:opacity-40"
              onClick={() =>
                onApply(target.kind === "point" ? { kind: "point", i: target.i, explanation: text } : { kind: "trans", text })
              }
            >
              고치기
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
        <button type="button" className="text-xs font-bold text-[#a3155a] hover:underline" onClick={onReport}>
          이 문장 오류 신고
        </button>
        {sentence.teacherEdited ? (
          <button type="button" className="text-xs font-semibold text-slate-500 hover:underline" onClick={() => onApply({ kind: "reset" })}>
            이 문장 원래대로
          </button>
        ) : null}
      </div>
    </div>
  );
}

const REPORT_KINDS = ["문장성분", "이름표", "번호 설명", "해석", "기타"];

export function AnalysisErrorReportDialog({
  sentenceNo,
  sentenceText,
  onSend,
  onClose,
}: {
  sentenceNo: number;
  sentenceText: string;
  onSend: (categories: string[], memo: string) => Promise<string | null>;
  onClose: () => void;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const [memo, setMemo] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 print:hidden" role="dialog" aria-label="오류 신고">
      <form
        className="w-full max-w-md rounded-xl border border-rose-200 bg-white p-4 shadow-2xl"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setErr(null);
          const fail = await onSend(picked, memo);
          setBusy(false);
          if (fail) setErr(fail);
          else onClose();
        }}
      >
        <p className="text-sm font-extrabold text-[#a3155a]">{sentenceNo}번 문장 오류 신고</p>
        <p className="mt-1 line-clamp-2 text-xs text-slate-500">{sentenceText}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
          {REPORT_KINDS.map((k, i) => (
            <label key={k} className="flex items-center gap-1.5">
              <input
                id={`analysis-report-kind-${i}`}
                type="checkbox"
                checked={picked.includes(k)}
                onChange={(e) => setPicked((p) => (e.target.checked ? [...p, k] : p.filter((x) => x !== k)))}
              />
              {k}
            </label>
          ))}
        </div>
        <textarea
          id="analysis-report-memo"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={3}
          placeholder="예: taken에 C가 아니라 V가 붙어 있어요"
          className="mt-3 w-full resize-y rounded-md border border-slate-200 px-2 py-1.5 text-sm"
        />
        <p className="mt-1 text-[11px] text-slate-400">크레딧은 들지 않습니다. 확인하고 고쳐 드립니다.</p>
        {err ? <p className="mt-1 text-xs font-semibold text-rose-600">{err}</p> : null}
        <div className="mt-3 flex justify-end gap-2">
          <button type="button" className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600" onClick={onClose}>
            닫기
          </button>
          <button
            type="submit"
            disabled={busy || (!picked.length && !memo.trim())}
            className="rounded-md bg-[#c2185b] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"
          >
            {busy ? "보내는 중…" : "보내기"}
          </button>
        </div>
      </form>
    </div>
  );
}

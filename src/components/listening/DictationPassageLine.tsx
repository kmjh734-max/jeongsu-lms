"use client";

import { splitPassageLineByBlanks } from "@/lib/listening/dictation/split-passage-line";
import type { DictationPassageLineClient } from "@/lib/listening/dictation/types";
import type { DictationBlankScoreResult } from "@/lib/listening/dictation/types";
import { answerInputGuards, typedOnly } from "@/lib/vocab/typed-only";
import { englishKeypadProps } from "@/components/ui/EnglishKeypad";

interface DictationPassageLineProps {
  line: DictationPassageLineClient;
  answers: Record<string, string>;
  onAnswerChange: (blankId: string, value: string) => void;
  disabled: boolean;
  resultsById: Map<string, DictationBlankScoreResult>;
  showResults: boolean;
}

export function DictationPassageLineView({
  line,
  answers,
  onAnswerChange,
  disabled,
  resultsById,
  showResults,
}: DictationPassageLineProps) {
  const parts = splitPassageLineByBlanks(line.text);
  const markerCount = (line.text.match(/_{3,}/g) ?? []).length;
  const blankIds =
    markerCount > 0 ? line.blankIds.slice(0, markerCount) : [];

  return (
    <p className="text-[15px] leading-[2.3] text-slate-700">
      <b className="mr-1 font-bold text-slate-900">{line.speaker}:</b>
      {parts.map((part, idx) => (
        <span key={`${line.speaker}-${idx}`}>
          {part}
          {idx < blankIds.length && (
            <DictationInlineBlank
              blankId={blankIds[idx]!}
              value={answers[blankIds[idx]!] ?? ""}
              onChange={onAnswerChange}
              disabled={disabled}
              result={showResults ? resultsById.get(blankIds[idx]!) : undefined}
            />
          )}
        </span>
      ))}
      {blankIds.length > 0 && parts.length === 1 && !line.text.includes("________") && (
        <span className="ml-1 text-xs text-amber-700">(빈칸 위치가 어긋났어요 — 다시 하기를 눌러 주세요)</span>
      )}
    </p>
  );
}

function DictationInlineBlank({
  blankId,
  value,
  onChange,
  disabled,
  result,
}: {
  blankId: string;
  value: string;
  onChange: (id: string, v: string) => void;
  disabled: boolean;
  result?: DictationBlankScoreResult;
}) {
  const widthCh = Math.max(6, Math.min(18, (value.length || 4) + 2));
  const toneClass = result
    ? result.isCorrect
      ? "border-green-600 bg-green-50 text-green-700"
      : "border-rose-500 bg-rose-50 text-rose-700"
    : "border-slate-300 bg-white text-brand-700 focus:border-brand-600 focus:ring-4 focus:ring-brand-50";

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(blankId, typedOnly(value, e.target.value))}
      disabled={disabled}
      className={`mx-0.5 inline-block h-7 rounded border-[1.5px] px-2 align-middle text-sm font-semibold normal-case outline-none transition disabled:cursor-default disabled:opacity-100 ${toneClass}`}
      style={{ width: `${widthCh}ch`, minWidth: "4rem" }}
      {...answerInputGuards}
      {...englishKeypadProps}
      lang="en"
      aria-label="받아쓰기 빈칸"
    />
  );
}

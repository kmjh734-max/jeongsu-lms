"use client";

import { splitPassageLineByBlanks } from "@/lib/listening/dictation/split-passage-line";
import type { DictationPassageLineClient } from "@/lib/listening/dictation/types";
import type { DictationBlankScoreResult } from "@/lib/listening/dictation/types";

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
  const blankIds = line.blankIds;

  return (
    <p className="font-mono text-sm leading-relaxed text-slate-900">
      <span className="mr-2 font-semibold text-violet-700">{line.speaker}:</span>
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
        <span className="ml-1 text-xs text-amber-700">(빈칸 위치 오류 — 다시 하기)</span>
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
  const borderClass = result
    ? result.isCorrect
      ? "border-emerald-400 bg-emerald-50"
      : "border-red-400 bg-red-50"
    : "border-violet-300 bg-white focus:border-violet-500";

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(blankId, e.target.value)}
      disabled={disabled}
      className={`mx-0.5 inline-block align-baseline rounded border px-1.5 py-0.5 text-sm font-normal normal-case text-slate-900 ${borderClass}`}
      style={{ width: `${widthCh}ch`, minWidth: "4rem" }}
      autoComplete="off"
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      inputMode="text"
      lang="en"
      aria-label="Dictation 빈칸"
    />
  );
}

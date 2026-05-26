import type { ReactNode } from "react";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

interface QuestionQualityBadgesProps {
  question: Pick<
    GeneratedListeningQuestion,
    | "needs_review"
    | "quality_score"
    | "answer_clarity_score"
    | "is_answer_clear"
    | "has_multiple_possible_answers"
    | "has_answer_clue"
  >;
}

function Badge({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "green" | "amber" | "red" | "slate";
}) {
  const tones = {
    green: "bg-emerald-100 text-emerald-800",
    amber: "bg-amber-100 text-amber-800",
    red: "bg-red-100 text-red-800",
    slate: "bg-slate-100 text-slate-700",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function QuestionQualityBadges({ question }: QuestionQualityBadgesProps) {
  const passed = !question.needs_review;
  const unclear = question.is_answer_clear === false;
  const noClue = question.has_answer_clue === false;
  const multi = question.has_multiple_possible_answers === true;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {passed ? (
        <Badge tone="green">통과</Badge>
      ) : (
        <Badge tone="amber">검토 필요</Badge>
      )}
      {unclear && <Badge tone="red">정답 모호</Badge>}
      {noClue && <Badge tone="amber">근거 부족</Badge>}
      {multi && <Badge tone="red">복수 정답 가능성</Badge>}
      {typeof question.quality_score === "number" && (
        <Badge tone="slate">품질 {question.quality_score}</Badge>
      )}
      {typeof question.answer_clarity_score === "number" && (
        <Badge tone="slate">정답 명확성 {question.answer_clarity_score}</Badge>
      )}
    </div>
  );
}

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
    | "quality_issues"
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
  const tableReview = (question.quality_issues ?? []).some((i) =>
    i.code.startsWith("type14")
  );
  const type1Review = (question.quality_issues ?? []).some((i) =>
    i.code.startsWith("type1")
  );
  const type2ImageMissing = (question.quality_issues ?? []).some((i) =>
    ["type2_needs_image", "type2_image_prompts"].includes(i.code)
  );
  const type2Review = (question.quality_issues ?? []).some((i) =>
    i.code.startsWith("type2")
  );
  const type3TimeMismatch = (question.quality_issues ?? []).some((i) =>
    i.code === "type3_time_mismatch" || i.code === "type3_target_time"
  );
  const type3WeatherIcon = (question.quality_issues ?? []).some((i) =>
    ["type3_needs_image", "type3_image_prompts"].includes(i.code)
  );
  const type3Review = (question.quality_issues ?? []).some((i) =>
    i.code.startsWith("type3")
  );
  const type4SpeakerMismatch = (question.quality_issues ?? []).some((i) =>
    i.code === "type4_speaker_mismatch"
  );
  const type4VagueIntention = (question.quality_issues ?? []).some((i) =>
    i.code === "type4_vague_intention"
  );
  const type4Review = (question.quality_issues ?? []).some((i) =>
    i.code.startsWith("type4")
  );
  const type5ChoiceFormat = (question.quality_issues ?? []).some((i) =>
    i.code === "type5_choice_format"
  );
  const type5AnswerMismatch = (question.quality_issues ?? []).some((i) =>
    i.code === "type5_answer_mismatch"
  );
  const type5MultipleUnmentioned = (question.quality_issues ?? []).some((i) =>
    i.code === "type5_multiple_unmentioned"
  );
  const type5Review = (question.quality_issues ?? []).some((i) =>
    i.code.startsWith("type5")
  );
  const type6TimeTargetMismatch = (question.quality_issues ?? []).some((i) =>
    i.code === "type6_time_target_mismatch"
  );
  const type6FinalTimeUnclear = (question.quality_issues ?? []).some((i) =>
    ["type6_final_time_unclear", "type6_final_time_mismatch"].includes(i.code)
  );
  const type6ChoiceFormat = (question.quality_issues ?? []).some((i) =>
    i.code === "type6_choice_format"
  );
  const type6Review = (question.quality_issues ?? []).some((i) =>
    i.code.startsWith("type6")
  );
  const type7TargetMismatch = (question.quality_issues ?? []).some((i) =>
    i.code === "type7_target_person_mismatch"
  );
  const type7DreamUnclear = (question.quality_issues ?? []).some((i) =>
    ["type7_dream_job_unclear", "type7_dream_job_mismatch"].includes(i.code)
  );
  const type7ChoiceFormat = (question.quality_issues ?? []).some((i) =>
    i.code === "type7_choice_format"
  );
  const type7Review = (question.quality_issues ?? []).some((i) =>
    i.code.startsWith("type7")
  );
  const type8TargetMismatch = (question.quality_issues ?? []).some((i) =>
    i.code === "type8_target_person_mismatch"
  );
  const type8WeakClue = (question.quality_issues ?? []).some((i) =>
    ["type8_weak_clue", "type8_emotion_unclear"].includes(i.code)
  );
  const type8ChoiceFormat = (question.quality_issues ?? []).some((i) =>
    i.code === "type8_choice_format"
  );
  const type8Review = (question.quality_issues ?? []).some((i) =>
    i.code.startsWith("type8")
  );

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
      {tableReview && <Badge tone="amber">표 검토 필요</Badge>}
      {type1Review && <Badge tone="amber">1번 검토 필요</Badge>}
      {type2ImageMissing && <Badge tone="red">그림 선택지 필요</Badge>}
      {type2Review && !type2ImageMissing && (
        <Badge tone="amber">2번 검토 필요</Badge>
      )}
      {type3TimeMismatch && <Badge tone="red">시점 불일치</Badge>}
      {type3WeatherIcon && <Badge tone="red">날씨 아이콘 필요</Badge>}
      {type3Review && !type3TimeMismatch && !type3WeatherIcon && (
        <Badge tone="amber">3번 검토 필요</Badge>
      )}
      {type4SpeakerMismatch && <Badge tone="red">화자 불일치</Badge>}
      {type4VagueIntention && <Badge tone="red">의도 모호</Badge>}
      {type4Review &&
        !type4SpeakerMismatch &&
        !type4VagueIntention && (
        <Badge tone="amber">4번 검토 필요</Badge>
      )}
      {type5ChoiceFormat && <Badge tone="red">보기 형식 오류</Badge>}
      {type5AnswerMismatch && <Badge tone="red">정답 불일치</Badge>}
      {type5MultipleUnmentioned && <Badge tone="red">복수 정답 가능</Badge>}
      {type5Review &&
        !type5ChoiceFormat &&
        !type5AnswerMismatch &&
        !type5MultipleUnmentioned && (
        <Badge tone="amber">5번 검토 필요</Badge>
      )}
      {type6TimeTargetMismatch && <Badge tone="red">시각 대상 불일치</Badge>}
      {type6FinalTimeUnclear && <Badge tone="red">최종 시각 불명확</Badge>}
      {type6ChoiceFormat && <Badge tone="red">보기 형식 오류</Badge>}
      {type6Review &&
        !type6TimeTargetMismatch &&
        !type6FinalTimeUnclear &&
        !type6ChoiceFormat && (
        <Badge tone="amber">6번 검토 필요</Badge>
      )}
      {type7TargetMismatch && <Badge tone="red">대상 화자 불일치</Badge>}
      {type7DreamUnclear && <Badge tone="red">장래 희망 불명확</Badge>}
      {type7ChoiceFormat && <Badge tone="red">보기 형식 오류</Badge>}
      {type7Review &&
        !type7TargetMismatch &&
        !type7DreamUnclear &&
        !type7ChoiceFormat && (
        <Badge tone="amber">7번 검토 필요</Badge>
      )}
      {type8TargetMismatch && <Badge tone="red">대상 화자 불일치</Badge>}
      {type8WeakClue && <Badge tone="red">심정 근거 부족</Badge>}
      {type8ChoiceFormat && <Badge tone="red">보기 형식 오류</Badge>}
      {type8Review &&
        !type8TargetMismatch &&
        !type8WeakClue &&
        !type8ChoiceFormat && (
        <Badge tone="amber">8번 검토 필요</Badge>
      )}
      {typeof question.quality_score === "number" && (
        <Badge tone="slate">품질 {question.quality_score}</Badge>
      )}
      {typeof question.answer_clarity_score === "number" && (
        <Badge tone="slate">정답 명확성 {question.answer_clarity_score}</Badge>
      )}
    </div>
  );
}

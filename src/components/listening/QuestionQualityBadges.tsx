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

function issueCode(i: { code?: string }): string {
  return typeof i.code === "string" ? i.code : "";
}

export function QuestionQualityBadges({ question }: QuestionQualityBadgesProps) {
  const passed = !question.needs_review;
  const unclear = question.is_answer_clear === false;
  const noClue = question.has_answer_clue === false;
  const multi = question.has_multiple_possible_answers === true;
  const tableReview = (question.quality_issues ?? []).some((i) =>
    issueCode(i).startsWith("type14")
  );
  const type14NoTable = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type14_no_table"
  );
  const type14AnswerMismatch = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type14_answer_mismatch"
  );
  const type14VisualType = (question.quality_issues ?? []).some((i) =>
    ["type14_visual_type", "type14_choices_order"].includes(issueCode(i))
  );
  const type1Review = (question.quality_issues ?? []).some((i) =>
    issueCode(i).startsWith("type1")
  );
  const type2ImageMissing = (question.quality_issues ?? []).some((i) =>
    ["type2_needs_image", "type2_image_prompts"].includes(issueCode(i))
  );
  const type2Review = (question.quality_issues ?? []).some((i) =>
    issueCode(i).startsWith("type2")
  );
  const type3TimeMismatch = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type3_time_mismatch" || issueCode(i) === "type3_target_time"
  );
  const type3WeatherIcon = (question.quality_issues ?? []).some((i) =>
    ["type3_needs_image", "type3_image_prompts"].includes(issueCode(i))
  );
  const type3Review = (question.quality_issues ?? []).some((i) =>
    issueCode(i).startsWith("type3")
  );
  const type4SpeakerMismatch = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type4_speaker_mismatch"
  );
  const type4VagueIntention = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type4_vague_intention"
  );
  const type4Review = (question.quality_issues ?? []).some((i) =>
    issueCode(i).startsWith("type4")
  );
  const type5ChoiceFormat = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type5_choice_format"
  );
  const type5AnswerMismatch = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type5_answer_mismatch"
  );
  const type5MultipleUnmentioned = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type5_multiple_unmentioned"
  );
  const type5Review = (question.quality_issues ?? []).some((i) =>
    issueCode(i).startsWith("type5")
  );
  const type6TimeTargetMismatch = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type6_time_target_mismatch"
  );
  const type6FinalTimeUnclear = (question.quality_issues ?? []).some((i) =>
    ["type6_final_time_unclear", "type6_final_time_mismatch"].includes(issueCode(i))
  );
  const type6ChoiceFormat = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type6_choice_format"
  );
  const type6Review = (question.quality_issues ?? []).some((i) =>
    issueCode(i).startsWith("type6")
  );
  const type7TargetMismatch = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type7_target_person_mismatch"
  );
  const type7DreamUnclear = (question.quality_issues ?? []).some((i) =>
    ["type7_dream_job_unclear", "type7_dream_job_mismatch"].includes(issueCode(i))
  );
  const type7ChoiceFormat = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type7_choice_format"
  );
  const type7Review = (question.quality_issues ?? []).some((i) =>
    issueCode(i).startsWith("type7")
  );
  const type8TargetMismatch = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type8_target_person_mismatch"
  );
  const type8WeakClue = (question.quality_issues ?? []).some((i) =>
    ["type8_weak_clue", "type8_emotion_unclear"].includes(issueCode(i))
  );
  const type8ChoiceFormat = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type8_choice_format"
  );
  const type8Review = (question.quality_issues ?? []).some((i) =>
    issueCode(i).startsWith("type8")
  );
  const type9TargetMismatch = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type9_target_person_mismatch"
  );
  const type9ImmediateUnclear = (question.quality_issues ?? []).some((i) =>
    ["type9_immediate_action_unclear", "type9_action_mismatch"].includes(issueCode(i))
  );
  const type9ChoiceFormat = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type9_choice_format"
  );
  const type9Review = (question.quality_issues ?? []).some((i) =>
    issueCode(i).startsWith("type9")
  );
  const type10ChoiceFormat = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type10_choice_format"
  );
  const type10MainContent = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type10_main_content_inaccurate"
  );
  const type10TopicConsistent = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type10_topic_consistent"
  );
  const type10Review = (question.quality_issues ?? []).some((i) =>
    issueCode(i).startsWith("type10")
  );
  const type11ChoiceFormat = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type11_choice_format"
  );
  const type11FinalUnclear = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type11_final_transport_unclear"
  );
  const type11TransportConfusion = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type11_transport_confusion"
  );
  const type11Review = (question.quality_issues ?? []).some((i) =>
    issueCode(i).startsWith("type11")
  );
  const type12TargetMismatch = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type12_target_person_mismatch"
  );
  const type12ReasonUnclear = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type12_reason_unclear"
  );
  const type12ChoiceFormat = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type12_choice_format"
  );
  const type12Review = (question.quality_issues ?? []).some((i) =>
    issueCode(i).startsWith("type12")
  );
  const type13PlaceDirect = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type13_place_directly_named"
  );
  const type13CluesInsufficient = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type13_place_clues_insufficient"
  );
  const type13ChoiceFormat = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type13_choice_format"
  );
  const type13PlaceUnclear = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type13_place_unclear"
  );
  const type13Review = (question.quality_issues ?? []).some((i) =>
    issueCode(i).startsWith("type13")
  );
  const type15NoRequest = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type15_no_request"
  );
  const type15SpeakerMismatch = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type15_speaker_mismatch"
  );
  const type15SuggestionConfusion = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type15_suggestion_confusion"
  );
  const type15ChoiceFormat = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type15_choice_format"
  );
  const type15Review = (question.quality_issues ?? []).some((i) =>
    issueCode(i).startsWith("type15")
  );
  const type16NoSuggestion = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type16_no_suggestion"
  );
  const type16SpeakerMismatch = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type16_speaker_mismatch"
  );
  const type16RequestConfusion = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type16_request_confusion"
  );
  const type16ChoiceFormat = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type16_choice_format"
  );
  const type16Review = (question.quality_issues ?? []).some((i) =>
    issueCode(i).startsWith("type16")
  );
  const type17TargetTimeUnclear = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type17_target_time_unclear"
  );
  const type17TargetPersonMismatch = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type17_target_person_mismatch"
  );
  const type17CanceledPlan = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type17_canceled_plan"
  );
  const type17ChoiceFormat = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type17_choice_format"
  );
  const type17Review = (question.quality_issues ?? []).some((i) =>
    issueCode(i).startsWith("type17")
  );
  const type18JobDirectlyNamed = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type18_job_directly_named"
  );
  const type18JobCluesInsufficient = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type18_job_clues_insufficient"
  );
  const type18TargetPersonMismatch = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type18_target_person_mismatch"
  );
  const type18ChoiceFormat = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type18_choice_format"
  );
  const type18Review = (question.quality_issues ?? []).some((i) =>
    issueCode(i).startsWith("type18")
  );
  const type19BlankSpeakerMismatch = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type19_blank_speaker_mismatch"
  );
  const type19ResponseContextWeak = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type19_response_context_weak" ||
    issueCode(i) === "type19_previous_turn_mismatch"
  );
  const type19ResponseTooGeneric = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type19_response_too_generic"
  );
  const type19MultipleAnswers = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type19_multiple_answers" ||
    issueCode(i) === "has_multiple_possible_answers"
  );
  const type19ChoiceFormat = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type19_choice_format" || issueCode(i) === "continuation_english"
  );
  const type19Review = (question.quality_issues ?? []).some((i) =>
    issueCode(i).startsWith("type19")
  );
  const type20BlankSpeakerMismatch = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type20_blank_speaker_mismatch"
  );
  const type20ResponseContextWeak = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type20_response_context_weak" ||
    issueCode(i) === "type20_previous_turn_mismatch"
  );
  const type20ResponseTooGeneric = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type20_response_too_generic"
  );
  const type20DuplicateWith19 = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type20_duplicate_with_19"
  );
  const type20MultipleAnswers = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type20_multiple_answers" ||
    issueCode(i) === "has_multiple_possible_answers"
  );
  const type20ChoiceFormat = (question.quality_issues ?? []).some((i) =>
    issueCode(i) === "type20_choice_format" || issueCode(i) === "continuation_english"
  );
  const type20Review = (question.quality_issues ?? []).some((i) =>
    issueCode(i).startsWith("type20")
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
      {type14NoTable && <Badge tone="red">표 데이터 없음</Badge>}
      {type14AnswerMismatch && <Badge tone="red">정답 불일치</Badge>}
      {type14VisualType && <Badge tone="red">표 표시 오류</Badge>}
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
      {type9TargetMismatch && <Badge tone="red">대상 화자 불일치</Badge>}
      {type9ImmediateUnclear && <Badge tone="red">즉시 행동 불명확</Badge>}
      {type9ChoiceFormat && <Badge tone="red">보기 형식 오류</Badge>}
      {type9Review &&
        !type9TargetMismatch &&
        !type9ImmediateUnclear &&
        !type9ChoiceFormat && (
        <Badge tone="amber">9번 검토 필요</Badge>
      )}
      {type10ChoiceFormat && <Badge tone="red">보기 형식 오류</Badge>}
      {type10MainContent && <Badge tone="red">핵심 내용 부정확</Badge>}
      {type10TopicConsistent && <Badge tone="red">맥락 검토 필요</Badge>}
      {type10Review &&
        !type10ChoiceFormat &&
        !type10MainContent &&
        !type10TopicConsistent && (
        <Badge tone="amber">10번 검토 필요</Badge>
      )}
      {type11ChoiceFormat && <Badge tone="red">보기 형식 오류</Badge>}
      {type11FinalUnclear && <Badge tone="red">최종 수단 불명확</Badge>}
      {type11TransportConfusion && <Badge tone="red">이동 수단 혼동</Badge>}
      {type11Review &&
        !type11ChoiceFormat &&
        !type11FinalUnclear &&
        !type11TransportConfusion && (
        <Badge tone="amber">11번 검토 필요</Badge>
      )}
      {type12TargetMismatch && <Badge tone="red">대상 화자 불일치</Badge>}
      {type12ReasonUnclear && <Badge tone="red">이유 불명확</Badge>}
      {type12ChoiceFormat && <Badge tone="red">보기 형식 오류</Badge>}
      {type12Review &&
        !type12TargetMismatch &&
        !type12ReasonUnclear &&
        !type12ChoiceFormat && (
        <Badge tone="amber">12번 검토 필요</Badge>
      )}
      {type13PlaceDirect && <Badge tone="red">장소 직접 언급</Badge>}
      {type13CluesInsufficient && <Badge tone="red">장소 단서 부족</Badge>}
      {type13ChoiceFormat && <Badge tone="red">보기 형식 오류</Badge>}
      {type13PlaceUnclear && !type13CluesInsufficient && !type13PlaceDirect && (
        <Badge tone="red">장소 불명확</Badge>
      )}
      {type13Review &&
        !type13PlaceDirect &&
        !type13CluesInsufficient &&
        !type13ChoiceFormat &&
        !type13PlaceUnclear && (
        <Badge tone="amber">13번 검토 필요</Badge>
      )}
      {type15NoRequest && <Badge tone="red">부탁 표현 없음</Badge>}
      {type15SpeakerMismatch && <Badge tone="red">화자 불일치</Badge>}
      {type15SuggestionConfusion && <Badge tone="red">제안 유형 혼동</Badge>}
      {type15ChoiceFormat && <Badge tone="red">보기 형식 오류</Badge>}
      {type15Review &&
        !type15NoRequest &&
        !type15SpeakerMismatch &&
        !type15SuggestionConfusion &&
        !type15ChoiceFormat && (
        <Badge tone="amber">15번 검토 필요</Badge>
      )}
      {type16NoSuggestion && <Badge tone="red">제안 표현 없음</Badge>}
      {type16SpeakerMismatch && <Badge tone="red">화자 불일치</Badge>}
      {type16RequestConfusion && <Badge tone="red">부탁 유형 혼동</Badge>}
      {type16ChoiceFormat && <Badge tone="red">보기 형식 오류</Badge>}
      {type16Review &&
        !type16NoSuggestion &&
        !type16SpeakerMismatch &&
        !type16RequestConfusion &&
        !type16ChoiceFormat && (
        <Badge tone="amber">16번 검토 필요</Badge>
      )}
      {type17TargetTimeUnclear && <Badge tone="red">시점 불명확</Badge>}
      {type17TargetPersonMismatch && <Badge tone="red">대상 화자 불일치</Badge>}
      {type17CanceledPlan && <Badge tone="red">취소된 계획 오류</Badge>}
      {type17ChoiceFormat && <Badge tone="red">보기 형식 오류</Badge>}
      {type17Review &&
        !type17TargetTimeUnclear &&
        !type17TargetPersonMismatch &&
        !type17CanceledPlan &&
        !type17ChoiceFormat && (
        <Badge tone="amber">17번 검토 필요</Badge>
      )}
      {type18JobDirectlyNamed && <Badge tone="red">직업명 직접 언급</Badge>}
      {type18JobCluesInsufficient && <Badge tone="red">직업 단서 부족</Badge>}
      {type18TargetPersonMismatch && <Badge tone="red">대상 화자 불일치</Badge>}
      {type18ChoiceFormat && <Badge tone="red">보기 형식 오류</Badge>}
      {type18Review &&
        !type18JobDirectlyNamed &&
        !type18JobCluesInsufficient &&
        !type18TargetPersonMismatch &&
        !type18ChoiceFormat && (
        <Badge tone="amber">18번 검토 필요</Badge>
      )}
      {type19BlankSpeakerMismatch && <Badge tone="red">화자 불일치</Badge>}
      {type19ResponseContextWeak && <Badge tone="red">응답 맥락 약함</Badge>}
      {type19ResponseTooGeneric && <Badge tone="red">응답 일반성 높음</Badge>}
      {type19MultipleAnswers && <Badge tone="red">복수 정답 가능</Badge>}
      {type19ChoiceFormat && <Badge tone="red">보기 형식 오류</Badge>}
      {type19Review &&
        !type19BlankSpeakerMismatch &&
        !type19ResponseContextWeak &&
        !type19ResponseTooGeneric &&
        !type19MultipleAnswers &&
        !type19ChoiceFormat && (
        <Badge tone="amber">19번 검토 필요</Badge>
      )}
      {type20BlankSpeakerMismatch && <Badge tone="red">화자 불일치</Badge>}
      {type20ResponseContextWeak && <Badge tone="red">응답 맥락 약함</Badge>}
      {type20ResponseTooGeneric && <Badge tone="red">응답 일반성 높음</Badge>}
      {type20DuplicateWith19 && <Badge tone="red">19번 중복 유형</Badge>}
      {type20MultipleAnswers && <Badge tone="red">복수 정답 가능</Badge>}
      {type20ChoiceFormat && <Badge tone="red">보기 형식 오류</Badge>}
      {type20Review &&
        !type20BlankSpeakerMismatch &&
        !type20ResponseContextWeak &&
        !type20ResponseTooGeneric &&
        !type20DuplicateWith19 &&
        !type20MultipleAnswers &&
        !type20ChoiceFormat && (
        <Badge tone="amber">20번 검토 필요</Badge>
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

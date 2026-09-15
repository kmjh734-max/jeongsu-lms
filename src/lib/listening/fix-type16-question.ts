import { buildScriptText } from "@/lib/listening/script-text";
import { targetPersonLabel } from "@/lib/listening/type7-career-choices";
import { TYPE16_QUESTION_TYPE } from "@/lib/listening/prompts/type16SuggestionPrompt";
import {
  buildType16Instruction,
  findSuggestionSpeaker,
  indexOfActionInChoices,
  normalizeActionLabel,
  normalizeMentionedActions,
  personLabelToSpeaker,
  speakerToPersonLabel,
} from "@/lib/listening/type16-suggestion-choices";
import { otherMw, speakerOfQuote } from "@/lib/listening/speaker-attribution";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

/** 제안한 사람은 대본에서 실제로 제안 표현을 말한 화자가 우선 (모델 필드는 틀릴 때가 많음) */
function resolveSuggester(q: GeneratedListeningQuestion): string {
  const fromQuote =
    speakerOfQuote(q.segments, q.suggestion_expression) ??
    speakerOfQuote(q.segments, q.answer_clue);
  if (fromQuote) return speakerToPersonLabel(fromQuote);
  const speaker = findSuggestionSpeaker(q.segments);
  if (speaker) return speakerToPersonLabel(speaker);
  if (q.suggester?.trim()) {
    return targetPersonLabel(q.suggester) ?? q.suggester.trim();
  }
  if (q.instruction.includes("여자")) return "여자";
  if (q.instruction.includes("남자")) return "남자";
  return "여자";
}

function resolveSuggestedTo(
  q: GeneratedListeningQuestion,
  suggester: string
): string {
  const sugCode = personLabelToSpeaker(suggester);
  // 두 사람 대화면 제안받은 사람은 항상 상대 화자
  if (sugCode && q.segments.some((s) => s.speaker === otherMw(sugCode))) {
    return speakerToPersonLabel(otherMw(sugCode));
  }
  if (q.suggested_to?.trim()) {
    return targetPersonLabel(q.suggested_to) ?? q.suggested_to.trim();
  }
  const sugSpeaker = personLabelToSpeaker(suggester);
  if (sugSpeaker) {
    const other = q.segments.find(
      (s) =>
        s.text.trim() &&
        s.speaker !== sugSpeaker &&
        (s.speaker === "M" || s.speaker === "W")
    );
    if (other) return speakerToPersonLabel(other.speaker as "M" | "W");
  }
  return suggester === "여자" ? "남자" : "여자";
}

function instructionMatches(
  instruction: string,
  suggester: string,
  suggestedTo: string
): boolean {
  // "남자가 여자에게"는 남자·여자를 둘 다 담고 있어 단순 포함 검사로는 반대 지시문도 통과했다
  return (
    new RegExp(`${suggester}[가이]\\s`).test(instruction) &&
    instruction.includes(`${suggestedTo}에게`)
  );
}

export function fixType16Question(
  q: GeneratedListeningQuestion,
  typeId: number
): GeneratedListeningQuestion {
  if (typeId !== 16) return q;

  const suggester = resolveSuggester(q);
  const suggested_to = resolveSuggestedTo(q, suggester);
  const suggested_action = normalizeActionLabel(
    q.suggested_action?.trim() ||
      q.choices[q.correct_answer - 1]?.trim() ||
      ""
  );
  const suggestion_expression =
    q.suggestion_expression?.trim() || q.answer_clue?.trim() || "";
  const mentioned_actions = normalizeMentionedActions(q.mentioned_actions);

  const instruction =
    q.instruction?.trim() &&
    /제안한\s*것/.test(q.instruction) &&
    instructionMatches(q.instruction, suggester, suggested_to)
      ? q.instruction
      : buildType16Instruction(suggester, suggested_to);

  const base: GeneratedListeningQuestion = {
    ...q,
    order_index: 16,
    question_type: TYPE16_QUESTION_TYPE,
    instruction,
    question_text: "",
    needs_image_choices: false,
    visual_choice_type: "none",
    choice_image_prompts: [],
    suggester,
    suggested_to,
    suggested_action,
    suggestion_expression,
    mentioned_actions,
    script_text: q.script_text || buildScriptText(q.segments),
  };

  const idx = suggested_action
    ? indexOfActionInChoices(base.choices, suggested_action)
    : -1;
  const correct_answer = idx >= 0 ? idx + 1 : base.correct_answer;

  return { ...base, correct_answer };
}

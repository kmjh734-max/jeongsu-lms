import { buildScriptText } from "@/lib/listening/script-text";
import { targetPersonLabel } from "@/lib/listening/type7-career-choices";
import { TYPE15_QUESTION_TYPE } from "@/lib/listening/prompts/type15RequestPrompt";
import {
  buildType15Instruction,
  findRequestSpeaker,
  indexOfActionInChoices,
  normalizeActionLabel,
  normalizeMentionedActions,
  personLabelToSpeaker,
  speakerToPersonLabel,
} from "@/lib/listening/type15-request-choices";
import { otherMw, speakerOfQuote } from "@/lib/listening/speaker-attribution";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

/** 부탁한 사람은 대본에서 실제로 부탁 표현을 말한 화자가 우선 (모델 필드는 틀릴 때가 많음) */
function resolveRequester(q: GeneratedListeningQuestion): string {
  const fromQuote =
    speakerOfQuote(q.segments, q.request_expression) ??
    speakerOfQuote(q.segments, q.answer_clue);
  if (fromQuote) return speakerToPersonLabel(fromQuote);
  const speaker = findRequestSpeaker(q.segments);
  if (speaker) return speakerToPersonLabel(speaker);
  if (q.requester?.trim()) {
    return targetPersonLabel(q.requester) ?? q.requester.trim();
  }
  if (q.instruction.includes("여자")) return "여자";
  if (q.instruction.includes("남자")) return "남자";
  return "여자";
}

function resolveRequestedPerson(
  q: GeneratedListeningQuestion,
  requester: string
): string {
  const reqCode = personLabelToSpeaker(requester);
  // 두 사람 대화면 부탁받은 사람은 항상 상대 화자
  if (reqCode && q.segments.some((s) => s.speaker === otherMw(reqCode))) {
    return speakerToPersonLabel(otherMw(reqCode));
  }
  if (q.requested_person?.trim()) {
    return targetPersonLabel(q.requested_person) ?? q.requested_person.trim();
  }
  const reqSpeaker = personLabelToSpeaker(requester);
  if (reqSpeaker) {
    const other = q.segments.find(
      (s) =>
        s.text.trim() &&
        s.speaker !== reqSpeaker &&
        (s.speaker === "M" || s.speaker === "W")
    );
    if (other) return speakerToPersonLabel(other.speaker as "M" | "W");
  }
  return requester === "여자" ? "남자" : "여자";
}

function instructionMatches(
  instruction: string,
  requester: string,
  requestedPerson: string
): boolean {
  // "남자가 여자에게"는 남자·여자를 둘 다 담고 있어 단순 포함 검사로는 반대 지시문도 통과했다
  return (
    new RegExp(`${requester}[가이]\\s`).test(instruction) &&
    instruction.includes(`${requestedPerson}에게`)
  );
}

export function fixType15Question(
  q: GeneratedListeningQuestion,
  typeId: number
): GeneratedListeningQuestion {
  if (typeId !== 15) return q;

  const requester = resolveRequester(q);
  const requested_person = resolveRequestedPerson(q, requester);
  const requested_action = normalizeActionLabel(
    q.requested_action?.trim() ||
      q.choices[q.correct_answer - 1]?.trim() ||
      ""
  );
  const request_expression =
    q.request_expression?.trim() || q.answer_clue?.trim() || "";
  const mentioned_actions = normalizeMentionedActions(q.mentioned_actions);

  const instruction =
    q.instruction?.trim() &&
    /부탁한\s*일/.test(q.instruction) &&
    instructionMatches(q.instruction, requester, requested_person)
      ? q.instruction
      : buildType15Instruction(requester, requested_person);

  const base: GeneratedListeningQuestion = {
    ...q,
    order_index: 15,
    question_type: TYPE15_QUESTION_TYPE,
    instruction,
    question_text: "",
    needs_image_choices: false,
    visual_choice_type: "none",
    choice_image_prompts: [],
    requester,
    requested_person,
    requested_action,
    request_expression,
    mentioned_actions,
    script_text: q.script_text || buildScriptText(q.segments),
  };

  const idx = requested_action
    ? indexOfActionInChoices(base.choices, requested_action)
    : -1;
  const correct_answer = idx >= 0 ? idx + 1 : base.correct_answer;

  return { ...base, correct_answer };
}

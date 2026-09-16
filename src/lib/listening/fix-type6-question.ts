import { buildScriptText } from "@/lib/listening/script-text";
import { TYPE6_QUESTION_TYPE } from "@/lib/listening/prompts/type6TimePrompt";
import {
  extractTimesFromScript,
  indexOfTimeInChoices,
  normalizeMentionedTimes,
  normalizeTimeLabel,
  type MentionedTimeEntry,
} from "@/lib/listening/type6-time-choices";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

function syncCorrectAnswer(
  q: GeneratedListeningQuestion,
  finalTime: string
): number {
  const idx = indexOfTimeInChoices(q.choices, finalTime);
  return idx >= 0 ? idx + 1 : q.correct_answer;
}

/**
 * mentioned_times는 묶음 생성에서 자주 빠진다. 대본에 시각이 다 들어 있으므로
 * 모델이 안 채우면 대본에서 뽑아 채운다 (마지막에 확정한 시각은 final, 나머지는 후보).
 */
function fillMentionedTimes(
  mentioned: MentionedTimeEntry[],
  scriptText: string,
  finalTime: string
): MentionedTimeEntry[] {
  if (mentioned.length >= 2) return mentioned;
  const clock = (s: string) => s.match(/\d{1,2}:\d{2}/)?.[0] ?? s.trim();
  const seen = new Set(mentioned.map((m) => clock(m.time)));
  const finalClock = clock(finalTime);
  const filled = [...mentioned];
  for (const time of extractTimesFromScript(scriptText)) {
    const key = clock(time);
    if (seen.has(key)) continue;
    seen.add(key);
    filled.push({ time, role: key === finalClock ? "final" : "candidate" });
  }
  return filled;
}

export function fixType6Question(
  q: GeneratedListeningQuestion,
  typeId: number
): GeneratedListeningQuestion {
  if (typeId !== 6) return q;

  const final_time = normalizeTimeLabel(
    q.final_time?.trim() ||
      q.choices[q.correct_answer - 1]?.trim() ||
      ""
  );

  const scriptText = q.script_text || buildScriptText(q.segments);
  const mentioned_times = fillMentionedTimes(
    normalizeMentionedTimes(q.mentioned_times),
    scriptText,
    final_time
  );

  const time_question_target = q.time_question_target?.trim() ?? "";

  const base: GeneratedListeningQuestion = {
    ...q,
    order_index: 6,
    question_type: TYPE6_QUESTION_TYPE,
    question_text: "",
    needs_image_choices: false,
    visual_choice_type: "none",
    choice_image_prompts: [],
    final_time,
    mentioned_times,
    time_question_target,
    script_text: scriptText,
  };

  const correct_answer = final_time
    ? syncCorrectAnswer(base, final_time)
    : base.correct_answer;

  return { ...base, correct_answer };
}

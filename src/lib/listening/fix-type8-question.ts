import { buildScriptText } from "@/lib/listening/script-text";
import { TYPE8_QUESTION_TYPE } from "@/lib/listening/prompts/type8EmotionPrompt";
import {
  indexOfEmotionInChoices,
  normalizeEmotionClues,
  normalizeEmotionLabel,
  targetPersonLabel,
} from "@/lib/listening/type8-emotion-choices";
import {
  soleSpeakerMatching,
  mwToPerson,
} from "@/lib/listening/speaker-attribution";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

function buildInstruction(targetPerson: string): string {
  const who = targetPersonLabel(targetPerson) ?? "남자";
  return `대화를 듣고, ${who}의 심정으로 가장 적절한 것을 고르시오.`;
}

/** 정답 감정어 → 그 감정을 스스로 말할 때 쓰는 영어 표현 */
const EMOTION_EN: Record<string, string> = {
  안도: "relieved",
  자랑스러움: "proud",
  실망: "disappointed",
  걱정: "worried",
  불안: "nervous|anxious",
  설렘: "excited",
  신남: "excited",
  기쁨: "happy|glad",
  행복: "happy",
  슬픔: "sad",
  당황: "embarrassed",
  지루함: "bored",
  놀람: "surprised",
  만족: "satisfied",
  외로움: "lonely",
  화남: "angry|upset",
  감사: "thankful|grateful",
};

/** 정답 감정을 "I'm so relieved"처럼 자기 입으로 말한 화자 (한 명일 때만) */
function selfEmotionSpeaker(q: GeneratedListeningQuestion): "M" | "W" | null {
  const answer = normalizeEmotionLabel(
    q.choices[q.correct_answer - 1]?.trim() || q.target_emotion?.trim() || ""
  );
  const en = EMOTION_EN[answer];
  if (!en) return null;
  const pattern = new RegExp(
    `\\bI(?:'m| am| feel| felt| was)\\s+(?:so |really |very |a little |much |a bit )?(?:${en})\\b`,
    "i"
  );
  return soleSpeakerMatching(q.segments, pattern);
}

function resolveTargetPerson(q: GeneratedListeningQuestion): string {
  // 정답 감정을 직접 말한 화자가 우선 (모델 필드보다 대본이 기준)
  const selfSpeaker = selfEmotionSpeaker(q);
  if (selfSpeaker) return mwToPerson(selfSpeaker);
  if (q.target_person?.trim()) {
    const label = targetPersonLabel(q.target_person);
    if (label) return label;
  }
  if (q.instruction.includes("남자")) return "남자";
  if (q.instruction.includes("여자")) return "여자";
  return "남자";
}

export function fixType8Question(
  q: GeneratedListeningQuestion,
  typeId: number
): GeneratedListeningQuestion {
  if (typeId !== 8) return q;

  const target_person = resolveTargetPerson(q);
  const target_emotion = normalizeEmotionLabel(
    q.target_emotion?.trim() ||
      q.choices[q.correct_answer - 1]?.trim() ||
      ""
  );
  const emotion_clues = normalizeEmotionClues(q.emotion_clues);

  const instruction =
    q.instruction?.trim() &&
    /심정/.test(q.instruction) &&
    ((target_person === "남자" && /남자/.test(q.instruction)) ||
      (target_person === "여자" && /여자/.test(q.instruction)))
      ? q.instruction
      : buildInstruction(target_person);

  const base: GeneratedListeningQuestion = {
    ...q,
    order_index: 8,
    question_type: TYPE8_QUESTION_TYPE,
    instruction,
    question_text: "",
    needs_image_choices: false,
    visual_choice_type: "none",
    choice_image_prompts: [],
    target_person,
    target_emotion,
    emotion_clues,
    script_text: q.script_text || buildScriptText(q.segments),
  };

  const idx = target_emotion
    ? indexOfEmotionInChoices(base.choices, target_emotion)
    : -1;
  const correct_answer = idx >= 0 ? idx + 1 : base.correct_answer;

  return { ...base, correct_answer };
}

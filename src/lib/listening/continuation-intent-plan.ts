import { listeningChatJson } from "@/lib/listening/openai-listening-chat";
import type { ContinuationScenarioAssignment } from "@/lib/listening/continuation-scenario-pool";

export interface ContinuationIntentPlan {
  scenario_summary: string;
  last_speaker: "M" | "W";
  planned_last_utterance: string;
  correct_response_function: string;
  situation_type: string;
  correct_response_sketch: string;
  not_a_whole_dialogue_topic: boolean;
}

const PLAN_SYSTEM = `You plan Korean middle-school English listening "response choice" items (types 19–20).
Output JSON only. Do NOT output a full exam question yet.

Rules:
- The item tests ONLY the best next-line response to the LAST utterance, NOT "main idea of whole dialogue".
- Type 19: last speaker W (woman), blank answer is Man (M).
- Type 20: last speaker M (man), blank answer is Woman (W).
- planned_last_utterance must be specific (not only Okay/Sure/Thanks).
- correct_response_sketch: one English sentence that would be the correct choice.
- correct_response_function: one of 감사, 수락/동의, 거절, 안도, 도움 제공, 정보 확인, 사과, 격려, 계획 확인, 제안 수락
- not_a_whole_dialogue_topic must be true.`;

export async function planContinuationIntent(
  apiKey: string,
  typeId: 19 | 20,
  previousProblems?: string[],
  assignment?: ContinuationScenarioAssignment
): Promise<ContinuationIntentPlan> {
  const lastSpeaker = typeId === 19 ? "W" : "M";
  const blankWho = typeId === 19 ? "남자(M)" : "여자(W)";
  const avoid =
    previousProblems && previousProblems.length > 0
      ? `\nAvoid repeating these past dialogues/scenarios:\n${previousProblems.map((p) => `- ${p}`).join("\n")}\n`
      : "";
  const assignmentNote = assignment
    ? `\nRequired scenario_id: ${assignment.id}\nTheme: ${assignment.theme}\nSetting: ${assignment.setting}\nDo NOT use lost notebook / homework-only / library clichés.\n`
    : "";

  return listeningChatJson<ContinuationIntentPlan>(apiKey, {
    temperature: 0.35,
    system: PLAN_SYSTEM,
    user: `Plan type ${typeId} item.
Last segment speaker: ${lastSpeaker}
Student chooses ${blankWho}'s next line only.
${assignmentNote}${avoid}

JSON shape:
{
  "scenario_summary": "한국어 1문장 상황",
  "last_speaker": "${lastSpeaker}",
  "planned_last_utterance": "English last line before blank",
  "correct_response_function": "...",
  "situation_type": "short Korean label",
  "correct_response_sketch": "English correct choice sentence",
  "not_a_whole_dialogue_topic": true
}`,
  });
}

export function formatContinuationIntentBlock(plan: ContinuationIntentPlan): string {
  return `
## 사전 설계 (반드시 준수 — 마지막 발화 응답형)
- 이 문항은 **대화 전체 주제/요지**가 아니라 **마지막 발화 직후 가장 적절한 한 줄 응답**만 고르게 한다.
- 상황: ${plan.scenario_summary}
- 마지막 발화(${plan.last_speaker}): ${plan.planned_last_utterance}
- 정답 응답 기능: ${plan.correct_response_function}
- situation_type: ${plan.situation_type}
- 정답 응답 초안(선택지 정답으로 쓸 문장): ${plan.correct_response_sketch}
`.trim();
}

import { isMiddle1OnlyTypeFix } from "@/lib/listening/dialogue-type-ids";
import type { ListeningGradeLevel } from "@/lib/listening/grade-level";
import { buildScriptText } from "@/lib/listening/script-text";
import { TYPE3_QUESTION_TYPE } from "@/lib/listening/prompts/type3WeatherPrompt";
import type {
  GeneratedListeningQuestion,
  MentionedWeatherByTime,
} from "@/lib/listening/types";

const WEATHER_KO_MAP: Record<string, string[]> = {
  맑음: ["sunny", "clear"],
  흐림: ["cloudy", "cloud"],
  비: ["rain", "rainy"],
  눈: ["snow", "snowy"],
  바람: ["wind", "windy"],
  안개: ["fog", "foggy"],
};

/** 영어 날씨 선택지 → 한국어 (다른 날씨 문항은 모두 한국어라 섞이지 않게 맞춘다) */
const WEATHER_EN_TO_KO: Record<string, string> = {
  sunny: "맑음",
  clear: "맑음",
  cloudy: "흐림",
  rainy: "비",
  rain: "비",
  snowy: "눈",
  snow: "눈",
  windy: "바람",
  foggy: "안개",
  stormy: "천둥번개",
};

function weatherToKorean(label: string): string | null {
  const key = label.trim().toLowerCase().replace(/[.!]$/, "");
  return WEATHER_EN_TO_KO[key] ?? null;
}

/** 선택지가 모두 영어 날씨어면 한국어로 바꾼다 (하나라도 모르는 말이면 그대로 둔다) */
export function koreanizeWeatherChoices(choices: string[]): string[] | null {
  if (!choices.some((c) => /[a-z]/i.test(c))) return null;
  const mapped = choices.map((c) => (/[가-힣]/.test(c) ? c.trim() : weatherToKorean(c)));
  if (mapped.some((m) => !m)) return null;
  if (new Set(mapped).size !== mapped.length) return null;
  return mapped as string[];
}

function normalizeMentioned(
  raw: unknown
): MentionedWeatherByTime[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const o = item as Record<string, unknown>;
      const time = String(o.time ?? "").trim();
      const weather = String(o.weather ?? "").trim();
      if (!time || !weather) return null;
      return { time, weather };
    })
    .filter((x): x is MentionedWeatherByTime => x !== null);
}

function normalizeSegments(
  segments: GeneratedListeningQuestion["segments"]
): GeneratedListeningQuestion["segments"] {
  const spoken = segments.filter((s) => s.speaker === "M" || s.speaker === "W");
  if (spoken.length === 0) return segments;
  const primary = spoken[0]!.speaker;
  return spoken.map((s) => ({ ...s, speaker: primary }));
}

function syncCorrectAnswerFromWeatherAnswer(
  q: GeneratedListeningQuestion
): number {
  const target = q.weather_answer?.trim();
  if (!target) return q.correct_answer;

  const idx = q.choices.findIndex((c) => {
    const choice = c.trim();
    if (choice === target) return true;
    const aliases = WEATHER_KO_MAP[target];
    if (aliases?.some((a) => choice.toLowerCase().includes(a))) return true;
    return false;
  });
  return idx >= 0 ? idx + 1 : q.correct_answer;
}

function buildInstruction(
  location: string,
  targetTime: string
): string {
  const loc = location.trim() || "○○";
  const time = targetTime.trim() || "오늘 오후";
  if (/현재/.test(time)) {
    return `다음을 듣고, ${loc}의 현재 날씨로 가장 적절한 것을 고르시오.`;
  }
  if (/내일/.test(time)) {
    return `다음을 듣고, ${loc}의 내일 날씨로 가장 적절한 것을 고르시오.`;
  }
  return `다음을 듣고, ${loc}의 ${time} 날씨로 가장 적절한 것을 고르시오.`;
}

export function fixType3Question(
  q: GeneratedListeningQuestion,
  typeId: number,
  gradeLevel?: ListeningGradeLevel
): GeneratedListeningQuestion {
  if (typeId !== 3) return q;
  if (isMiddle1OnlyTypeFix(3, gradeLevel)) return q;

  const segments = normalizeSegments(q.segments);
  const choice_image_prompts = Array.isArray(q.choice_image_prompts)
    ? q.choice_image_prompts.map((p) => String(p).trim()).slice(0, 5)
    : [];
  while (choice_image_prompts.length < 5) choice_image_prompts.push("");

  const weather_target_location = q.weather_target_location?.trim() ?? "";
  const weather_target_time = q.weather_target_time?.trim() ?? "";
  const koreanChoices = koreanizeWeatherChoices(q.choices);
  const choices = koreanChoices ?? q.choices;
  const rawAnswer = q.weather_answer?.trim() ?? "";
  const weather_answer = koreanChoices
    ? weatherToKorean(rawAnswer) ?? rawAnswer
    : rawAnswer;
  const mentioned_weather_by_time = normalizeMentioned(q.mentioned_weather_by_time);

  const instruction =
    q.instruction?.trim() && !q.instruction.includes("○○")
      ? q.instruction
      : buildInstruction(weather_target_location, weather_target_time);

  const base = {
    ...q,
    order_index: 3,
    question_type: TYPE3_QUESTION_TYPE,
    instruction,
    segments,
    choices,
    script_text: buildScriptText(segments),
    question_text: "",
    needs_image_choices: true,
    visual_choice_type: q.visual_choice_type?.trim() || "weather_icon",
    choice_image_prompts,
    weather_target_location,
    weather_target_time,
    weather_answer,
    mentioned_weather_by_time,
  };

  return {
    ...base,
    correct_answer: syncCorrectAnswerFromWeatherAnswer(base),
  };
}

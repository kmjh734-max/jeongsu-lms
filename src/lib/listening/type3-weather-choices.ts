/** 3번 날씨 선택지 검사 */

const WEATHER_TERMS_KO =
  /^(맑음|화창|흐림|구름|비|눈|바람|안개|천둥|폭우|소나기|무더위|추움|더움|맑은|흐린|비오|눈오)/i;

const WEATHER_TERMS_EN =
  /\b(sunny|clear|cloudy|cloud|rain|rainy|snow|snowy|wind|windy|fog|foggy|storm|stormy)\b/i;

const DUPLICATE_PAIRS: Array<[string, string]> = [
  ["맑음", "화창"],
  ["맑음", "화창함"],
  ["흐림", "구름"],
  ["비", "소나기"],
];

export function isWeatherChoice(choice: string): boolean {
  const c = choice.trim();
  if (!c) return false;
  if (WEATHER_TERMS_KO.test(c)) return true;
  if (WEATHER_TERMS_EN.test(c)) return true;
  return false;
}

export function checkWeatherChoicesValid(choices: string[]): {
  ok: boolean;
  message?: string;
} {
  const nonWeather = choices.filter((c) => c.trim() && !isWeatherChoice(c));
  if (nonWeather.length > 0) {
    return {
      ok: false,
      message: `날씨가 아닌 선택지가 있습니다: ${nonWeather.join(", ")}`,
    };
  }

  for (const [a, b] of DUPLICATE_PAIRS) {
    const hasA = choices.some((c) => c.includes(a));
    const hasB = choices.some((c) => c.includes(b));
    if (hasA && hasB) {
      return {
        ok: false,
        message: `비슷한 날씨 선택지가 중복됩니다 (${a}/${b}).`,
      };
    }
  }

  return { ok: true };
}

export function weatherAnswerMatchesChoice(
  weatherAnswer: string,
  choices: string[],
  correctIndex: number
): boolean {
  const answer = weatherAnswer.trim();
  if (!answer) return true;
  const choice = choices[correctIndex - 1]?.trim() ?? "";
  if (choice === answer) return true;
  if (choice.includes(answer) || answer.includes(choice)) return true;
  return false;
}

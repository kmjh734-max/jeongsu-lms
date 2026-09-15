/** 6번 시각 선택지·mentioned_times 검사 */

export interface MentionedTimeEntry {
  time: string;
  role: string;
}

const TIME_WITH_PERIOD =
  /^\s*\d{1,2}:\d{2}\s*(a\.?m\.?|p\.?m\.?)\s*$/i;

const TIME_IN_TEXT =
  /\d{1,2}:\d{2}\s*(a\.?m\.?|p\.?m\.?)/gi;

export function normalizeTimeLabel(label: string): string {
  let t = label.trim().toLowerCase();
  t = t.replace(/\s+/g, " ");
  t = t.replace(/a\.m\./g, "a.m.").replace(/p\.m\./g, "p.m.");
  t = t.replace(/\ba m\b/g, "a.m.").replace(/\bp m\b/g, "p.m.");
  const m = t.match(/^(\d{1,2}):(\d{2})\s*(a\.m\.|p\.m\.)/);
  if (!m) return t;
  const hour = String(Number(m[1]));
  return `${hour}:${m[2]} ${m[3]}`;
}

export function isTimeChoice(choice: string): boolean {
  const t = choice.trim();
  if (!t) return false;
  if (TIME_WITH_PERIOD.test(t)) return true;
  return /\d{1,2}:\d{2}/.test(t) && /(a\.?m\.?|p\.?m\.?)/i.test(t);
}

export function checkTimeChoicesValid(choices: string[]): {
  ok: boolean;
  message?: string;
} {
  const invalid = choices.filter((c) => c.trim() && !isTimeChoice(c));
  if (invalid.length > 0) {
    return {
      ok: false,
      message: `시각 형식이 아닌 선택지: ${invalid.join(", ")}`,
    };
  }
  const normalized = choices.map((c) => normalizeTimeLabel(c));
  const unique = new Set(normalized.filter(Boolean));
  if (unique.size < choices.filter((c) => c.trim()).length) {
    return { ok: false, message: "선택지에 같은 시각이 중복되었습니다." };
  }
  return { ok: true };
}

export function normalizeMentionedTimes(raw: unknown): MentionedTimeEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const time = String(o.time ?? "").trim();
      const role = String(o.role ?? "").trim();
      if (!time) return null;
      return { time, role };
    })
    .filter((x): x is MentionedTimeEntry => x !== null);
}

export function finalTimeMatchesChoice(
  finalTime: string,
  choices: string[],
  correctIndex: number
): boolean {
  const final = normalizeTimeLabel(finalTime);
  const choice = normalizeTimeLabel(choices[correctIndex - 1] ?? "");
  return !!final && !!choice && final === choice;
}

export function indexOfTimeInChoices(
  choices: string[],
  time: string
): number {
  const target = normalizeTimeLabel(time);
  return choices.findIndex((c) => normalizeTimeLabel(c) === target);
}

const HOUR_WORDS = [
  "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve",
];
const TEEN_WORDS = [
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen",
];
const TENS_WORDS: Record<string, number> = { twenty: 20, thirty: 30, forty: 40, fifty: 50 };

function minuteFromWords(words: string): number | null {
  const w = words.toLowerCase().replace(/-/g, " ").trim();
  if (w === "o'clock" || w === "o’clock") return 0;
  const oh = w.match(/^oh (\w+)$/);
  if (oh) {
    const n = HOUR_WORDS.indexOf(oh[1]!) + 1;
    return n >= 1 && n <= 9 ? n : null;
  }
  const teen = TEEN_WORDS.indexOf(w);
  if (teen >= 0) return 10 + teen;
  const [tens, ones] = w.split(" ");
  const t = TENS_WORDS[tens ?? ""];
  if (t == null) return null;
  if (!ones) return t;
  const o = HOUR_WORDS.indexOf(ones) + 1;
  return o >= 1 && o <= 9 ? t + o : null;
}

/**
 * 말로 쓴 시각("three forty", "four o'clock", "half past six", "quarter to five")을 "3:40" 꼴로.
 * 대본은 TTS용이라 숫자 대신 말로 쓰는 경우가 많은데, 숫자 시각만 찾아 "대본에 시각이 0개"로 잘못 잡았다.
 */
export function spelledTimesInText(text: string): string[] {
  const t = String(text ?? "").toLowerCase().replace(/’/g, "'");
  const out: string[] = [];
  const hour = `(${HOUR_WORDS.join("|")})`;
  const minute =
    "(o'clock|oh[- ](?:one|two|three|four|five|six|seven|eight|nine)|(?:twenty|thirty|forty|fifty)(?:[- ](?:one|two|three|four|five|six|seven|eight|nine))?|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen)";
  for (const m of t.matchAll(new RegExp(`\\b${hour}\\s+${minute}\\b`, "g"))) {
    const h = HOUR_WORDS.indexOf(m[1]!) + 1;
    const min = minuteFromWords(m[2]!);
    if (min != null) out.push(`${h}:${String(min).padStart(2, "0")}`);
  }
  for (const m of t.matchAll(new RegExp(`\\b(half|quarter) (past|to|after) ${hour}\\b`, "g"))) {
    let h = HOUR_WORDS.indexOf(m[3]!) + 1;
    let min = m[1] === "half" ? 30 : 15;
    if (m[2] === "to") {
      h = h === 1 ? 12 : h - 1;
      min = 60 - min;
    }
    out.push(`${h}:${String(min).padStart(2, "0")}`);
  }
  for (const m of t.matchAll(/\b(\d{1,2}):(\d{2})\b/g)) out.push(`${Number(m[1])}:${m[2]}`);
  return [...new Set(out)];
}

export function extractTimesFromScript(scriptText: string): string[] {
  const matches = scriptText.match(TIME_IN_TEXT) ?? [];
  const withPeriod = matches.map((m) => normalizeTimeLabel(m));
  // 오전·오후 표시가 없거나 말로 쓴 시각도 센다 (같은 시·분이면 한 번만)
  const clock = (s: string) => s.match(/\d{1,2}:\d{2}/)?.[0] ?? s;
  const seen = new Set(withPeriod.map(clock));
  const extra = spelledTimesInText(scriptText).filter((s) => !seen.has(s));
  return [...new Set([...withPeriod, ...extra])];
}

/** 지시문과 time_question_target 키워드 일치 */
export function instructionAlignsWithTarget(
  instruction: string,
  target: string
): boolean {
  const inst = instruction.trim();
  const t = target.trim();
  if (!inst || !t) return true;

  if (/만날|만나/.test(t)) return /만날|만나/.test(inst);
  if (/수업.*시작|시작하는 시각/.test(t)) {
    return /수업.*시작|시작하는 시각|class/i.test(inst);
  }
  if (/행사.*시작|음악회|축제|공연/.test(t)) {
    return /행사|음악회|축제|공연|시작/.test(inst);
  }
  if (/출발/.test(t)) return /출발|leave|집에서/.test(inst);
  return true;
}

export function hasFinalTimeConfirmation(
  scriptText: string,
  finalTime: string
): boolean {
  const norm = normalizeTimeLabel(finalTime);
  if (!norm) return false;
  const script = scriptText.toLowerCase();
  const core = norm.replace(/\./g, "").replace(/\s+/g, " ");
  if (script.includes(core)) return true;
  const hourPart = norm.split(":")[0];
  const minPart = norm.match(/:(\d{2})/)?.[1];
  if (hourPart && minPart) {
    if (
      script.includes(`${hourPart}:${minPart}`) &&
      (script.includes("a.m") || script.includes("p.m") || script.includes("am") || script.includes("pm"))
    ) {
      return true;
    }
    // "three forty"처럼 말로 쓴 시각
    return spelledTimesInText(scriptText).includes(`${Number(hourPart)}:${minPart}`);
  }
  return false;
}

export function validateType6TimeFields(
  q: {
    instruction: string;
    choices: string[];
    correct_answer: number;
    script_text: string;
    answer_clue: string;
    time_question_target?: string;
    final_time?: string;
    mentioned_times?: MentionedTimeEntry[];
  }
): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  const target = q.time_question_target?.trim() ?? "";
  const finalTime = q.final_time?.trim() ?? "";

  if (!target) {
    issues.push("time_question_target이 필요합니다.");
  } else if (!instructionAlignsWithTarget(q.instruction, target)) {
    issues.push("지시문과 time_question_target이 일치하지 않습니다.");
  }

  if (!finalTime) {
    issues.push("final_time이 필요합니다.");
  } else {
    if (!hasFinalTimeConfirmation(q.script_text, finalTime)) {
      issues.push("대본에서 final_time을 확인하기 어렵습니다.");
    }
    if (!finalTimeMatchesChoice(finalTime, q.choices, q.correct_answer)) {
      issues.push("final_time과 correct_answer 선택지가 일치하지 않습니다.");
    }
    if (q.answer_clue.trim() && !q.answer_clue.toLowerCase().includes(finalTime.split(" ")[0] ?? "")) {
      const hour = finalTime.match(/\d{1,2}:\d{2}/)?.[0];
      const spelled = hour ? spelledTimesInText(q.answer_clue).includes(hour.replace(/^0/, "")) : false;
      if (hour && !q.answer_clue.includes(hour) && !spelled) {
        issues.push("answer_clue에 final_time 관련 표현이 포함되어야 합니다.");
      }
    }
  }

  const scriptTimes = extractTimesFromScript(q.script_text);
  if (scriptTimes.length < 2) {
    issues.push(`대본에 시각이 2개 이상 필요합니다 (${scriptTimes.length}개).`);
  }

  const mentioned = q.mentioned_times ?? [];
  if (mentioned.length < 2) {
    issues.push("mentioned_times에 시각 2개 이상이 필요합니다.");
  }

  return { ok: issues.length === 0, issues };
}

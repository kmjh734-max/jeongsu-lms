/** 5번 mention_plan 검사 */

export interface MentionPlanItem {
  no: number;
  label: string;
  mentioned: boolean;
  evidence: string;
}

export interface MentionPlan {
  topic: string;
  choice_items: MentionPlanItem[];
  unmentioned_no: number;
  unmentioned_label: string;
}

/** 영어 세부정보·실제 값이 보기에 들어간 경우 */
const ENGLISH_DETAIL =
  /\b(years?\s*old|p\.?m\.?|a\.?m\.?|dollars?|@\w+)\b|[A-Z][a-z]+\s+[A-Z][a-z]+/i;

const MOSTLY_ENGLISH = /^[A-Za-z0-9\s.,'"-]+$/;

export function normalizeMentionPlan(raw: unknown): MentionPlan | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const itemsRaw = Array.isArray(o.choice_items) ? o.choice_items : [];
  const choice_items: MentionPlanItem[] = itemsRaw
    .map((item, idx) => {
      if (!item || typeof item !== "object") return null;
      const it = item as Record<string, unknown>;
      const no =
        typeof it.no === "number" && it.no >= 1 && it.no <= 5
          ? it.no
          : idx + 1;
      return {
        no,
        label: String(it.label ?? "").trim(),
        mentioned: Boolean(it.mentioned),
        evidence: String(it.evidence ?? "").trim(),
      };
    })
    .filter((x): x is MentionPlanItem => x !== null && !!x.label);

  if (choice_items.length !== 5) return null;

  const unmentioned_no =
    typeof o.unmentioned_no === "number" && o.unmentioned_no >= 1 && o.unmentioned_no <= 5
      ? o.unmentioned_no
      : choice_items.find((i) => !i.mentioned)?.no ?? 0;

  const unmentioned_label =
    String(o.unmentioned_label ?? "").trim() ||
    choice_items.find((i) => i.no === unmentioned_no)?.label ||
    "";

  return {
    topic: String(o.topic ?? "").trim(),
    choice_items,
    unmentioned_no,
    unmentioned_label,
  };
}

export function checkKoreanLabelChoices(choices: string[]): {
  ok: boolean;
  message?: string;
} {
  for (const c of choices) {
    const t = c.trim();
    if (!t) return { ok: false, message: "빈 선택지가 있습니다." };
    if (MOSTLY_ENGLISH.test(t) && /[A-Za-z]{3,}/.test(t)) {
      return {
        ok: false,
        message: `보기는 한글 정보 항목이어야 합니다: "${t}"`,
      };
    }
    if (ENGLISH_DETAIL.test(t)) {
      return {
        ok: false,
        message: `영어 세부정보가 보기에 포함되었습니다: "${t}"`,
      };
    }
  }
  return { ok: true };
}

export function countMentionFlags(plan: MentionPlan): {
  mentioned: number;
  unmentioned: number;
} {
  const mentioned = plan.choice_items.filter((i) => i.mentioned).length;
  const unmentioned = plan.choice_items.filter((i) => !i.mentioned).length;
  return { mentioned, unmentioned };
}

export function correctAnswerMatchesUnmentioned(
  correctAnswer: number,
  plan: MentionPlan
): boolean {
  return correctAnswer === plan.unmentioned_no;
}

export function choicesMatchPlanLabels(
  choices: string[],
  plan: MentionPlan
): boolean {
  const sorted = [...plan.choice_items].sort((a, b) => a.no - b.no);
  return sorted.every((item, idx) => item.label === choices[idx]?.trim());
}

/** 미언급 항목이 대본에 새면 안 되는 표현 (항목명 기준) */
export function forbiddenPatternsForLabel(label: string): RegExp[] {
  const l = label.replace(/\s/g, "");
  if (/성격/.test(l)) {
    return [/kind|friendly|nice|quiet|shy|outgoing|personality|polite|rude/i];
  }
  if (/참가비|입장료|수강료/.test(l)) {
    return [/\bfree\b|\bfee\b|pay|cost|\$\d|\d+\s*dollars?|won|price is/i];
  }
  if (/구입처|구매처/.test(l)) {
    return [/ticket office|buy.*online|on the website|at the box office|purchase at/i];
  }
  if (/신청\s*방법/.test(l)) {
    return [/sign up|register|apply on|application form/i];
  }
  if (/이름/.test(l)) {
    return [/my name is|his name is|her name is|called\s+[A-Z]/i];
  }
  if (/나이/.test(l)) {
    return [/\d+\s*years?\s*old|age is|aged\s+\d+/i];
  }
  if (/직업|신분/.test(l)) {
    return [/is a (student|teacher|doctor|nurse|pianist|singer|worker)/i];
  }
  if (/취미/.test(l)) {
    return [/hobby|enjoys? (playing|reading|swimming)/i];
  }
  if (/날짜|일자/.test(l)) {
    return [/on (January|February|March|April|May|June|July|August|September|October|November|December)|\d{1,2}(st|nd|rd|th)/i];
  }
  if (/장소/.test(l)) {
    return [/at the|in the (school|library|theater|gym|hall)/i];
  }
  if (/시각|시간/.test(l)) {
    return [/at \d|starts? at|begin(s)? at|\d:\d+\s*(a\.?m\.?|p\.?m\.?)/i];
  }
  if (/제목/.test(l)) {
    return [/title is|called|the musical is/i];
  }
  if (/티켓\s*가격|가격/.test(l)) {
    return [/ticket price|costs? \d|\d+\s*dollars?/i];
  }
  return [];
}

export function scriptMentionsForbiddenForLabel(
  scriptText: string,
  label: string
): boolean {
  const patterns = forbiddenPatternsForLabel(label);
  return patterns.some((re) => re.test(scriptText));
}

export function evidenceAppearsInScript(
  evidence: string,
  scriptText: string
): boolean {
  const e = evidence.trim();
  if (!e || e.length < 4) return false;
  const words = e
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3);
  if (words.length === 0) return true;
  const script = scriptText.toLowerCase();
  const hits = words.filter((w) => script.includes(w)).length;
  return hits >= Math.min(2, words.length);
}

export function validateMentionPlan(
  plan: MentionPlan,
  choices: string[],
  correctAnswer: number,
  scriptText: string
): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  const { mentioned, unmentioned } = countMentionFlags(plan);

  if (mentioned !== 4) {
    issues.push(`언급(mentioned:true) 항목이 4개가 아닙니다 (${mentioned}개).`);
  }
  if (unmentioned !== 1) {
    issues.push(`미언급(mentioned:false) 항목이 1개가 아닙니다 (${unmentioned}개).`);
  }
  if (!correctAnswerMatchesUnmentioned(correctAnswer, plan)) {
    issues.push("correct_answer와 unmentioned_no가 일치하지 않습니다.");
  }
  if (!choicesMatchPlanLabels(choices, plan)) {
    issues.push("choices와 mention_plan.choice_items.label이 일치하지 않습니다.");
  }

  const unmentionedItem = plan.choice_items.find((i) => !i.mentioned);
  if (unmentionedItem && scriptMentionsForbiddenForLabel(scriptText, unmentionedItem.label)) {
    issues.push(
      `미언급 항목 "${unmentionedItem.label}"에 해당할 수 있는 표현이 대본에 있습니다.`
    );
  }

  for (const item of plan.choice_items) {
    if (item.mentioned) {
      if (!item.evidence.trim()) {
        issues.push(`언급 항목 ${item.no}번(${item.label})에 evidence가 없습니다.`);
      } else if (!evidenceAppearsInScript(item.evidence, scriptText)) {
        issues.push(
          `언급 항목 ${item.no}번 evidence가 대본과 맞지 않을 수 있습니다.`
        );
      }
    } else if (item.evidence.trim()) {
      issues.push(`미언급 항목 ${item.no}번(${item.label})의 evidence는 비워야 합니다.`);
    }
  }

  return { ok: issues.length === 0, issues };
}

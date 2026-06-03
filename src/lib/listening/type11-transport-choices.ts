/** 11번 이동 방법(교통수단) 선택지 검사 */

export interface MentionedTransportEntry {
  transport: string;
  role: string;
  reason?: string;
}

export const KOREAN_TRANSPORTS = [
  "도보",
  "버스",
  "지하철",
  "택시",
  "자전거",
  "자동차",
  "기차",
  "비행기",
  "배",
] as const;

export type KoreanTransport = (typeof KOREAN_TRANSPORTS)[number];

const TRANSPORT_SET = new Set<string>(KOREAN_TRANSPORTS);

const NOT_TRANSPORT =
  /^(미술관|도서관|공원|영화관|결혼식|학교|빨리\s*가기|아빠|엄마|친구|목적지|이동)$/;

const FINAL_DECISION_CLUE =
  /let'?s\s+(?:take|walk|go)|then let'?s walk|yes\.?\s*let'?s|let us (?:take|walk|go)/i;

const PROPOSAL_ONLY_CLUE =
  /^(?:we\s+)?can\s+take|should\s+we|maybe|what about|how about|(?:the\s+)?(?:subway|bus|train|plane|boat|taxi|station|stop)\s+is/i;

const TRANSPORT_ENGLISH: Record<string, RegExp> = {
  도보: /\b(?:walk|on foot|walking)\b/i,
  버스: /\bbus(?:es)?\b/i,
  지하철: /\b(?:subway|the subway)\b/i,
  택시: /\btaxi(?:es)?\b/i,
  자전거: /\b(?:bike|bicycle|bikes|ride our bikes)\b/i,
  자동차: /\b(?:car|by car|go by car)\b/i,
  기차: /\b(?:train|take a train)\b/i,
  비행기: /\b(?:plane|take a plane|by plane|airport)\b/i,
  배: /\b(?:boat|take a boat|ferry|port)\b/i,
};

export function normalizeTransportLabel(label: string): string {
  return label.trim().replace(/\s+/g, " ");
}

export function isKoreanTransportChoice(choice: string): boolean {
  const t = normalizeTransportLabel(choice);
  if (!t) return false;
  if (NOT_TRANSPORT.test(t.replace(/\s/g, ""))) return false;
  return TRANSPORT_SET.has(t);
}

export function checkKoreanTransportChoices(choices: string[]): {
  ok: boolean;
  message?: string;
} {
  const invalid = choices.filter((c) => c.trim() && !isKoreanTransportChoice(c));
  if (invalid.length > 0) {
    return {
      ok: false,
      message: `교통수단이 아닌 선택지: ${invalid.join(", ")}`,
    };
  }
  const normalized = choices.map((c) => normalizeTransportLabel(c));
  const unique = new Set(normalized.filter(Boolean));
  if (unique.size < choices.filter((c) => c.trim()).length) {
    return { ok: false, message: "선택지에 같은 교통수단이 중복되었습니다." };
  }
  return { ok: true };
}

export function transportMatchesChoice(
  finalTransport: string,
  choices: string[],
  correctIndex: number
): boolean {
  const target = normalizeTransportLabel(finalTransport);
  const choice = normalizeTransportLabel(choices[correctIndex - 1] ?? "");
  return !!target && !!choice && target === choice;
}

export function indexOfTransportInChoices(
  choices: string[],
  transport: string
): number {
  const target = normalizeTransportLabel(transport);
  return choices.findIndex((c) => normalizeTransportLabel(c) === target);
}

export function normalizeMentionedTransportOptions(
  raw: unknown
): MentionedTransportEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const transport = String(o.transport ?? "").trim();
      const role = String(o.role ?? "").trim();
      const reason = String(o.reason ?? "").trim();
      if (!transport) return null;
      return {
        transport,
        role: role || "candidate",
        ...(reason ? { reason } : {}),
      };
    })
    .filter((x): x is MentionedTransportEntry => x !== null);
}

export function answerClueHasFinalTransportDecision(clue: string): boolean {
  const c = clue.trim();
  if (!c) return false;
  if (PROPOSAL_ONLY_CLUE.test(c) && !FINAL_DECISION_CLUE.test(c)) return false;
  return FINAL_DECISION_CLUE.test(c);
}

export function scriptHasTransportMention(
  script: string,
  transport: string
): boolean {
  const re = TRANSPORT_ENGLISH[transport];
  if (!re) return false;
  return re.test(script);
}

export function countTransportsInScript(
  script: string,
  choices: string[]
): number {
  let count = 0;
  for (const t of choices) {
    if (isKoreanTransportChoice(t) && scriptHasTransportMention(script, t)) {
      count++;
    }
  }
  return count;
}

export function validateType11TransportFields(q: {
  instruction: string;
  choices: string[];
  correct_answer: number;
  answer_clue: string;
  destination?: string;
  final_transport?: string;
  mentioned_transport_options?: MentionedTransportEntry[];
  segments: Array<{ speaker: string; text: string }>;
}): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  const dest = q.destination?.trim() ?? "";
  const finalT = q.final_transport?.trim() ?? "";

  if (!/함께\s*이동|이동할\s*방법/.test(q.instruction)) {
    issues.push("지시문이 이동 방법 파악 유형에 맞지 않을 수 있습니다.");
  }

  if (!dest) {
    issues.push("destination(목적지)이 필요합니다.");
  }

  if (!finalT) {
    issues.push("final_transport(최종 이동 수단)이 필요합니다.");
  } else {
    if (!isKoreanTransportChoice(finalT)) {
      issues.push("final_transport가 한글 교통수단이어야 합니다.");
    }
    if (!transportMatchesChoice(finalT, q.choices, q.correct_answer)) {
      issues.push("final_transport와 correct_answer 선택지가 일치하지 않습니다.");
    }
  }

  const mentioned = q.mentioned_transport_options ?? [];
  if (mentioned.length < 2) {
    issues.push("mentioned_transport_options에 교통수단 후보가 2개 이상 필요합니다.");
  }

  const script = q.segments.map((s) => s.text).join(" ");
  if (script && countTransportsInScript(script, q.choices) < 2) {
    issues.push("대화에 교통수단이 최소 2개 이상 언급되어야 합니다.");
  }

  if (q.answer_clue?.trim() && !answerClueHasFinalTransportDecision(q.answer_clue)) {
    issues.push("answer_clue에 최종 이동 결정 문장(Let's take ...)이 필요합니다.");
  } else if (!q.answer_clue?.trim()) {
    issues.push("answer_clue가 필요합니다.");
  }

  return { ok: issues.length === 0, issues };
}

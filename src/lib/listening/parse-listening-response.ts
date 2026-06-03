import type { ListeningScriptSegment } from "@/lib/listening/types";
import { isListeningSpeaker } from "@/lib/listening/speaker-voices";

export function extractQuestionsFromAiPayload(parsed: unknown): unknown[] {
  if (Array.isArray(parsed)) return parsed;
  if (!parsed || typeof parsed !== "object") return [];

  const o = parsed as Record<string, unknown>;
  if (Array.isArray(o.questions)) return o.questions;
  if (Array.isArray(o.question_list)) return o.question_list;
  if (o.question && typeof o.question === "object") return [o.question];
  if (Array.isArray(o.segments) || Array.isArray(o.choices)) return [o];

  if (o.data && typeof o.data === "object") {
    const d = o.data as Record<string, unknown>;
    if (Array.isArray(d.questions)) return d.questions;
  }

  return [];
}

export function normalizeListeningSpeaker(raw: unknown): ListeningScriptSegment["speaker"] | null {
  const s = String(raw ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
  if (isListeningSpeaker(s)) return s;
  if (s === "MAN" || s === "MALE" || s === "BOY" || s === "남" || s === "남자") return "M";
  if (s === "WOMAN" || s === "FEMALE" || s === "GIRL" || s === "여" || s === "여자") return "W";
  if (s === "NARRATOR" || s === "ANNOUNCER" || s === "ANNOUNCEMENT" || s === "안내") {
    return "ANN";
  }
  return null;
}

export function normalizeCorrectAnswerIndex(raw: unknown): number | null {
  if (typeof raw === "string") {
    const letter = raw.trim().toUpperCase();
    if (letter.length === 1 && letter >= "A" && letter <= "E") {
      return letter.charCodeAt(0) - 64;
    }
    const n = Number.parseInt(raw, 10);
    if (Number.isInteger(n) && n >= 1 && n <= 5) return n;
    return null;
  }
  const n = Number(raw);
  if (!Number.isInteger(n)) return null;
  if (n >= 1 && n <= 5) return n;
  if (n >= 0 && n <= 4) return n + 1;
  return null;
}

export function diagnoseQuestionParseFailure(
  raw: Record<string, unknown>,
  examMode: boolean
): string[] {
  const reasons: string[] = [];

  const segmentsRaw = Array.isArray(raw.segments) ? raw.segments : [];
  if (segmentsRaw.length === 0) {
    reasons.push("segments 없음");
  } else {
    let invalidSpeakers = 0;
    let emptyText = 0;
    for (const seg of segmentsRaw) {
      if (!seg || typeof seg !== "object") {
        invalidSpeakers++;
        continue;
      }
      const s = seg as { speaker?: unknown; text?: unknown };
      if (!normalizeListeningSpeaker(s.speaker)) invalidSpeakers++;
      if (!String(s.text ?? "").trim()) emptyText++;
    }
    if (invalidSpeakers > 0) {
      reasons.push(`화자는 M/W/ANN만 허용 (${invalidSpeakers}개 오류)`);
    }
    if (emptyText > 0) reasons.push(`빈 대사 ${emptyText}개`);
  }

  const choicesRaw = Array.isArray(raw.choices) ? raw.choices : [];
  const choiceCount = choicesRaw.filter((c) => String(c).trim()).length;
  if (examMode && choiceCount !== 5) {
    reasons.push(`선택지 ${choiceCount}개 (5개 필요)`);
  } else if (!examMode && (choiceCount < 4 || choiceCount > 5)) {
    reasons.push(`선택지 ${choiceCount}개 (4~5개 필요)`);
  }

  const correct = normalizeCorrectAnswerIndex(raw.correct_answer);
  if (correct == null) {
    reasons.push(`correct_answer 형식 오류 (${String(raw.correct_answer ?? "")})`);
  }

  const instruction = String(raw.instruction ?? "").trim();
  if (!instruction) reasons.push("instruction 없음");

  return reasons;
}

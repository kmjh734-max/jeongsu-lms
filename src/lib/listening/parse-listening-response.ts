import type { ListeningScriptSegment } from "@/lib/listening/types";
import { isListeningSpeaker } from "@/lib/listening/speaker-voices";
import { isDialogueExamType } from "@/lib/listening/dialogue-type-ids";
import {
  isHighSchoolListeningGrade,
  type ListeningGradeLevel,
} from "@/lib/listening/grade-level";

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function countSentences(text: string): number {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => countWords(s) > 0).length;
}

/**
 * 유형별 최소 대본 분량. 한 줄짜리 대본(중3 15회 2번)이 그대로 저장된 적이 있어
 * 파싱 단계에서 너무 짧은 대본은 실패로 보고 다시 만들게 한다.
 */
export function minimumScriptShape(
  typeId: number | undefined,
  gradeLevel: ListeningGradeLevel | undefined,
  instruction?: string
): { dialogue: boolean; minTurns: number; minSentences: number; minWords: number } {
  const high = isHighSchoolListeningGrade(gradeLevel);
  const dialogue =
    typeId != null
      ? isDialogueExamType(typeId, gradeLevel, instruction)
      : /대화/.test(instruction ?? "");
  if (dialogue) {
    // 고등 짧은 응답(11·12)은 3~4턴이 정상
    const shortResponse = high && (typeId === 11 || typeId === 12);
    return {
      dialogue: true,
      minTurns: shortResponse ? 3 : 4,
      minSentences: shortResponse ? 3 : 4,
      minWords: shortResponse ? 18 : high ? 40 : 30,
    };
  }
  return { dialogue: false, minTurns: 1, minSentences: 4, minWords: high ? 40 : 25 };
}

/** 대본이 유형 최소 분량에 못 미치면 사유 문자열, 충분하면 null */
export function scriptTooShortReason(
  segments: Array<{ speaker: string; text: string }>,
  typeId: number | undefined,
  gradeLevel: ListeningGradeLevel | undefined,
  instruction?: string
): string | null {
  const shape = minimumScriptShape(typeId, gradeLevel, instruction);
  const spoken = segments.filter((s) => String(s.text ?? "").trim());
  const words = spoken.reduce((n, s) => n + countWords(s.text), 0);
  const sentences = spoken.reduce((n, s) => n + countSentences(s.text), 0);
  if (shape.dialogue) {
    const turns = spoken.filter((s) => s.speaker === "M" || s.speaker === "W").length;
    if (turns < shape.minTurns) {
      return `대화 대본이 너무 짧음 (${turns}턴, 최소 ${shape.minTurns}턴)`;
    }
  }
  if (sentences < shape.minSentences) {
    return `대본 문장 수가 너무 적음 (${sentences}문장, 최소 ${shape.minSentences}문장)`;
  }
  if (words < shape.minWords) {
    return `대본 단어 수가 너무 적음 (${words}단어, 최소 ${shape.minWords}단어)`;
  }
  return null;
}

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
  examMode: boolean,
  shape?: { typeId?: number; gradeLevel?: ListeningGradeLevel }
): string[] {
  const reasons: string[] = [];

  const segmentsRaw = Array.isArray(raw.segments) ? raw.segments : [];
  if (segmentsRaw.length === 0) {
    reasons.push("segments 없음");
  } else {
    const short = scriptTooShortReason(
      segmentsRaw.map((s) => {
        const o = (s && typeof s === "object" ? s : {}) as { speaker?: unknown; text?: unknown };
        return {
          speaker: normalizeListeningSpeaker(o.speaker) ?? "",
          text: String(o.text ?? ""),
        };
      }),
      shape?.typeId,
      shape?.gradeLevel,
      String(raw.instruction ?? "")
    );
    if (short) reasons.push(short);
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

import type { DictationBlankItem } from "@/lib/listening/dictation/types";
import { filterWordOnlyBlankItems } from "@/lib/listening/dictation/word-only";

export function buildDictationSystemPrompt(): string {
  return `너는 중학교 1학년 영어 듣기 Dictation 문항 제작자다.
대본에서 중요한 영어 단어 하나만 빈칸(________)으로 만든다. 두 단어 이상(구, phrase)은 절대 금지한다.
answer에는 공백 없는 단어 하나만 넣는다 (예: subway, library). "take the subway" 같은 구는 금지.
무의미한 관사(a, an, the), 대명사만, be동사만 빈칸으로 만들지 마라.
ANN 안내문은 제외한다. M/W 대화·담화만 사용한다.
정답 단서·핵심 정보·문항 유형과 관련 표현을 우선한다.
M/W 대본의 모든 문장이 화면에 보이도록, 빈칸 없는 문장도 그대로 포함한다.
display_sentence는 한 문장 단위이며 speaker 접두(M: / W:)를 붙인다.
반드시 JSON만 출력한다.`;
}

export function buildDictationUserPrompt(opts: {
  questionType: string;
  scriptText: string;
  segmentsJson: string;
  answerClue: string;
  blankMin: number;
  blankMax: number;
  previousBlankWords: string[];
}): string {
  const avoid =
    opts.previousBlankWords.length > 0
      ? `\n재시도: 다음 단어는 가능하면 빈칸으로 쓰지 마라: ${opts.previousBlankWords.join(", ")}`
      : "";

  return `문항 유형: ${opts.questionType}
정답 근거: ${opts.answerClue || "(없음)"}

대본(script_text):
${opts.scriptText}

segments (ANN 제외):
${opts.segmentsJson}

빈칸 개수: ${opts.blankMin}~${opts.blankMax}개
각 빈칸 정답은 반드시 단어 1개(word)만. 구(phrase)·여러 단어 금지.
${avoid}

출력 JSON:
{
  "blank_items": [
    {
      "id": "blank_1",
      "speaker": "M",
      "original_sentence": "",
      "display_sentence": "M: Let's take the ________.",
      "answer": "subway",
      "answer_type": "word",
      "importance": "key_information"
    }
  ]
}`;
}

export function parseDictationAiResponse(raw: unknown): DictationBlankItem[] {
  if (!raw || typeof raw !== "object") return [];
  const o = raw as Record<string, unknown>;
  const list = Array.isArray(o.blank_items) ? o.blank_items : [];
  const items: DictationBlankItem[] = [];

  for (let i = 0; i < list.length; i++) {
    const row = list[i];
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const answer = String(r.answer ?? "").trim();
    const display = String(r.display_sentence ?? "").trim();
    const original = String(r.original_sentence ?? display).trim();
    if (!answer || !display.includes("________")) continue;
    const speaker = String(r.speaker ?? "M").toUpperCase();
    items.push({
      id: String(r.id ?? `blank_${i + 1}`),
      speaker: speaker === "W" ? "W" : "M",
      original_sentence: original,
      display_sentence: display.startsWith("M:") || display.startsWith("W:")
        ? display
        : `${speaker === "W" ? "W" : "M"}: ${display}`,
      answer,
      answer_type: "word",
      importance: String(r.importance ?? "key_information"),
    });
  }

  return filterWordOnlyBlankItems(items);
}

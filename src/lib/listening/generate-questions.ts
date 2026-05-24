import { buildScriptText } from "@/lib/listening/script-text";
import type { GeneratedListeningQuestion, ListeningScriptSegment } from "@/lib/listening/types";
import { isListeningSpeaker } from "@/lib/listening/speaker-voices";

function normalizeSegment(raw: { speaker?: string; text?: string }): ListeningScriptSegment | null {
  const speaker = (raw.speaker ?? "").trim().toUpperCase();
  const text = (raw.text ?? "").trim();
  if (!isListeningSpeaker(speaker) || !text) return null;
  return { speaker, text };
}

function normalizeQuestion(raw: Record<string, unknown>, index: number): GeneratedListeningQuestion | null {
  const segmentsRaw = Array.isArray(raw.segments) ? raw.segments : [];
  const segments = segmentsRaw
    .map((s) => normalizeSegment(s as { speaker?: string; text?: string }))
    .filter((s): s is ListeningScriptSegment => s !== null);

  if (segments.length === 0) return null;

  const choicesRaw = Array.isArray(raw.choices) ? raw.choices : [];
  const choices = choicesRaw.map((c) => String(c).trim()).filter(Boolean);
  if (choices.length !== 4) return null;

  const correct = Number(raw.correct_answer);
  if (!Number.isInteger(correct) || correct < 1 || correct > 4) return null;

  const script_text =
    typeof raw.script_text === "string" && raw.script_text.trim()
      ? raw.script_text.trim()
      : buildScriptText(segments);

  return {
    order_index:
      typeof raw.order_index === "number" && raw.order_index > 0
        ? raw.order_index
        : index + 1,
    question_type: String(raw.question_type ?? "내용일치").trim() || "내용일치",
    segments,
    script_text,
    script_translation: String(raw.script_translation ?? "").trim(),
    question_text: String(raw.question_text ?? "").trim(),
    choices: choices as [string, string, string, string],
    correct_answer: correct,
    explanation: String(raw.explanation ?? "").trim(),
  };
}

export async function generateListeningQuestionsWithAi(
  apiKey: string,
  count: number
): Promise<GeneratedListeningQuestion[]> {
  const prompt = `You are an English listening test item writer for Korean middle school (중1) students.

Create ${count} ORIGINAL listening comprehension items. Do NOT copy real exam questions.

Each item MUST use a multi-speaker script as segments (not one narrator reading everything):
- ANN: short announcer/instruction lines in English (e.g. "Listen and choose the best answer.")
- M: male speaker dialogue
- W: female speaker dialogue

Use ANN + M/W for dialogues; for short monologue items you may use ANN + one speaker (M or W).

Question types (vary): 내용일치, 주제찾기, 세부내용, 추론, 담화의목적, 그림/상황 (describe in question_text if no image).

Return ONLY valid JSON (no markdown):
{
  "questions": [
    {
      "order_index": 1,
      "question_type": "내용일치",
      "segments": [
        { "speaker": "ANN", "text": "..." },
        { "speaker": "M", "text": "..." }
      ],
      "script_text": "ANN: ...\\nM: ...",
      "script_translation": "Korean translation of full script",
      "question_text": "Korean question stem",
      "choices": ["choice1", "choice2", "choice3", "choice4"],
      "correct_answer": 1,
      "explanation": "Korean brief explanation"
    }
  ]
}

Rules:
- Middle school vocabulary and grammar
- 4 choices, correct_answer 1-4
- segments array is required; at least 2 segments per question
- script_text must match segments (ANN:/M:/W: lines)`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.8,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You output only valid JSON for English listening test items.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(`OpenAI 문항 생성 실패 (HTTP ${response.status}): ${bodyText.slice(0, 300)}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI 응답이 비어 있습니다.");

  const parsed = JSON.parse(content) as { questions?: unknown[] };
  const list = Array.isArray(parsed.questions) ? parsed.questions : [];

  const questions: GeneratedListeningQuestion[] = [];
  list.forEach((item, i) => {
    const q = normalizeQuestion(item as Record<string, unknown>, i);
    if (q?.question_text) questions.push(q);
  });

  if (questions.length === 0) {
    throw new Error("생성된 문항을 파싱하지 못했습니다.");
  }

  return questions;
}

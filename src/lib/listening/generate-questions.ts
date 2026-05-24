import { buildScriptText } from "@/lib/listening/script-text";
import { sanitizeSegmentTextForTts } from "@/lib/listening/sanitize-segment-text";
import {
  resolveExamTypesForGeneration,
  type ExamTypeTemplate,
} from "@/lib/listening/exam-types";
import type {
  GeneratedListeningQuestion,
  ListeningGenerationMode,
  ListeningScriptSegment,
} from "@/lib/listening/types";
import { isListeningSpeaker } from "@/lib/listening/speaker-voices";

export interface GenerateQuestionsOptions {
  mode: ListeningGenerationMode;
  count: number;
  selectedTypeIds?: number[];
}

function normalizeSegment(raw: { speaker?: string; text?: string }): ListeningScriptSegment | null {
  const speaker = (raw.speaker ?? "").trim().toUpperCase();
  const text = sanitizeSegmentTextForTts(raw.text ?? "");
  if (!isListeningSpeaker(speaker) || !text) return null;
  return { speaker, text };
}

function normalizeChoices(raw: unknown, examMode: boolean): string[] | null {
  const choicesRaw = Array.isArray(raw) ? raw : [];
  const choices = choicesRaw.map((c) => String(c).trim()).filter(Boolean);
  if (examMode) {
    if (choices.length !== 5) return null;
    return choices;
  }
  if (choices.length < 4 || choices.length > 5) return null;
  return choices;
}

function normalizeQuestion(
  raw: Record<string, unknown>,
  index: number,
  examMode: boolean,
  typeHint?: ExamTypeTemplate
): GeneratedListeningQuestion | null {
  const segmentsRaw = Array.isArray(raw.segments) ? raw.segments : [];
  const segments = segmentsRaw
    .map((s) => normalizeSegment(s as { speaker?: string; text?: string }))
    .filter((s): s is ListeningScriptSegment => s !== null);

  if (segments.length === 0) return null;

  const choices = normalizeChoices(raw.choices, examMode);
  if (!choices) return null;

  const correct = Number(raw.correct_answer);
  const maxChoice = choices.filter(Boolean).length;
  if (!Number.isInteger(correct) || correct < 1 || correct > maxChoice) return null;

  const script_text =
    typeof raw.script_text === "string" && raw.script_text.trim()
      ? raw.script_text.trim()
      : buildScriptText(segments);

  const instruction =
    typeof raw.instruction === "string" && raw.instruction.trim()
      ? raw.instruction.trim()
      : typeHint?.instruction ?? "";

  const question_type =
    typeof raw.question_type === "string" && raw.question_type.trim()
      ? raw.question_type.trim()
      : typeHint?.question_type ?? "듣기";

  return {
    order_index:
      typeof raw.order_index === "number" && raw.order_index > 0
        ? raw.order_index
        : index + 1,
    question_type,
    instruction,
    segments,
    script_text,
    script_translation: String(raw.script_translation ?? "").trim(),
    question_text: String(raw.question_text ?? "").trim(),
    choices,
    correct_answer: correct,
    explanation: String(raw.explanation ?? "").trim(),
  };
}

function buildExamTypeBlock(types: ExamTypeTemplate[]): string {
  return types
    .map(
      (t, i) => `
Item ${i + 1} — Type #${t.id}: ${t.question_type}
- instruction (Korean, use exactly or natural variant with ○○ filled in): ${t.instruction}
- format: ${t.format_guide}
- segments: ${t.segment_guide}
- choices: ${t.choice_guide}
- order_index: ${i + 1}
- question_type: ${t.question_type}`
    )
    .join("\n");
}

function buildExamPrompt(types: ExamTypeTemplate[]): string {
  return `You are writing ORIGINAL items for the Korean national middle school Grade 1 English LISTENING exam (중1 영어듣기능력평가), same STYLE as the 2026 nationwide test (20 items: description, order, weather, intent, etc.).

IMPORTANT COPYRIGHT:
- Do NOT copy sentences from real past exams, the 2026 test, or attached images.
- Match QUESTION TYPE and Korean instruction FORMAT only. All scripts and dialogs must be newly written.

Create exactly ${types.length} items, one per type below, in order.
${buildExamTypeBlock(types)}

COMMON RULES (every item):
- English level: middle school grade 1 (easy vocabulary, short clear sentences)
- Multi-speaker script with segments: ANN (calm announcer), M (male), W (female)
- ANN: brief English cue only when needed (e.g. "Listen carefully.")
- Dialogues: 4~8 turns between M and W; monologues: 3~5 sentences
- Exactly 5 choices (meaningful distractors); correct_answer is 1~5 (one clear answer)
- instruction: Korean exam-style stem (copy from type spec above; adjust ○○ if needed)
- question_text: English question stem OR Korean sub-prompt OR simple text table (for type 14)
- script_translation: Korean translation of full script
- explanation: brief Korean explanation
- Do NOT use difficult words or fast-paced speech style in writing
- segment.text = spoken dialogue only (what the listener hears), never the Korean instruction or multiple-choice options

Return ONLY valid JSON:
{
  "questions": [
    {
      "order_index": 1,
      "question_type": "묘사 듣고 대상 고르기",
      "instruction": "다음을 듣고, 'I'가 무엇인지 가장 적절한 것을 고르시오.",
      "segments": [
        { "speaker": "ANN", "text": "Listen carefully." },
        { "speaker": "M", "text": "I am small and soft..." }
      ],
      "script_text": "ANN: ...\\nM: ...",
      "script_translation": "...",
      "question_text": "...",
      "choices": ["...", "...", "...", "...", "..."],
      "correct_answer": 3,
      "explanation": "..."
    }
  ]
}`;
}

function buildFreePrompt(count: number): string {
  return `You are an English listening test item writer for Korean middle school (중1) students.

Create ${count} ORIGINAL listening items. Do NOT copy real exam questions.

Each item: multi-speaker segments (ANN / M / W), 4~5 choices, clear single answer.
- instruction: Korean exam-style direction
- Middle school vocabulary, short sentences

Return ONLY valid JSON:
{
  "questions": [
    {
      "order_index": 1,
      "question_type": "string",
      "instruction": "Korean instruction",
      "segments": [{ "speaker": "ANN|M|W", "text": "..." }],
      "script_text": "ANN: ...",
      "script_translation": "...",
      "question_text": "...",
      "choices": ["c1","c2","c3","c4","c5"],
      "correct_answer": 1,
      "explanation": "..."
    }
  ]
}`;
}

export async function generateListeningQuestionsWithAi(
  apiKey: string,
  options: GenerateQuestionsOptions
): Promise<GeneratedListeningQuestion[]> {
  const { mode, count, selectedTypeIds } = options;
  const examMode = mode === "exam";
  const examTypes = examMode
    ? resolveExamTypesForGeneration(count, selectedTypeIds)
    : undefined;
  const itemCount = examMode ? examTypes!.length : count;

  const prompt = examMode ? buildExamPrompt(examTypes!) : buildFreePrompt(itemCount);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.75,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You output only valid JSON for Korean middle school English listening test items. Never copy copyrighted exam content.",
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
    const hint = examTypes?.[i];
    const q = normalizeQuestion(
      item as Record<string, unknown>,
      i,
      examMode,
      hint
    );
    if (q && (q.instruction || q.question_text)) questions.push(q);
  });

  if (questions.length === 0) {
    throw new Error("생성된 문항을 파싱하지 못했습니다.");
  }

  return questions;
}

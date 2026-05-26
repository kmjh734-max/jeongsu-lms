import { fixContinuationQuestion } from "@/lib/listening/fix-continuation-question";
import { buildScriptText } from "@/lib/listening/script-text";
import { sanitizeSegmentTextForTts } from "@/lib/listening/sanitize-segment-text";
import {
  buildDifficultyPromptBlock,
  type ListeningDifficultyMode,
} from "@/lib/listening/exam-difficulty";
import {
  CHOICE_RULES,
  EXAM_SCRIPT_RULES,
  JSON_OUTPUT_SCHEMA,
} from "@/lib/listening/exam-script-rules";
import {
  resolveExamTypesForGeneration,
  type ExamTypeTemplate,
} from "@/lib/listening/exam-types";
import {
  attachQualityToQuestions,
  checkListeningQuestionQuality,
} from "@/lib/listening/quality-check";
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
  difficultyMode?: ListeningDifficultyMode;
}

export interface GenerateQuestionsResult {
  questions: Array<
    GeneratedListeningQuestion & {
      needs_review: boolean;
      quality_issues: Array<{ code: string; message: string }>;
    }
  >;
}

function normalizeSegment(raw: { speaker?: string; text?: string }): ListeningScriptSegment | null {
  const speaker = (raw.speaker ?? "").trim().toUpperCase();
  const text = sanitizeSegmentTextForTts(raw.text ?? "");
  if (!isListeningSpeaker(speaker) || !text) return null;
  return { speaker, text };
}

function normalizeChoices(raw: unknown, examMode: boolean): string[] | null {
  const choicesRaw = Array.isArray(raw) ? raw : [];
  const choices = choicesRaw.map((c) => {
    if (typeof c === "object" && c !== null && "label" in c) {
      const o = c as { label?: string; value?: string };
      return String(o.label ?? o.value ?? "").trim();
    }
    return String(c).trim();
  }).filter(Boolean);
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
  if (!Number.isInteger(correct) || correct < 1 || correct > 5) return null;

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

  const order_index =
    typeof raw.order_index === "number" && raw.order_index > 0
      ? raw.order_index
      : typeHint?.id ?? index + 1;

  const base: GeneratedListeningQuestion = {
    order_index,
    question_type,
    instruction,
    segments,
    script_text,
    script_translation: String(raw.script_translation ?? "").trim(),
    question_text: String(raw.question_text ?? "").trim(),
    choices,
    correct_answer: correct,
    answer_clue: String(raw.answer_clue ?? "").trim(),
    explanation: String(raw.explanation ?? "").trim(),
    needs_review: false,
    quality_issues: [],
  };

  const typeId = typeHint?.id ?? order_index;
  return fixContinuationQuestion(base, typeId);
}

function buildExamTypeBlock(types: ExamTypeTemplate[]): string {
  return types
    .map(
      (t) => `
=== Item ${t.id} (order_index MUST be ${t.id}) ===
Type: ${t.question_type}
instruction (Korean, fill ○○ only): ${t.instruction}
Script format: ${t.format_guide}
Segments: ${t.segment_guide}
Choices: ${t.choice_guide}`
    )
    .join("\n");
}

function buildExamPrompt(
  types: ExamTypeTemplate[],
  difficultyMode: ListeningDifficultyMode
): string {
  const difficultyBlock = buildDifficultyPromptBlock(types, difficultyMode);

  return `You write ORIGINAL items for the Korean national middle school Grade 1 English LISTENING exam (전국 중1 영어듣기능력평가).

COPYRIGHT (critical):
- Do NOT copy any sentence, script, question, or choice from 2024, 2025, 2026 real exams or attached PDFs.
- Match ONLY: item type, difficulty, script length, sentence structure, choice pattern.
- Every situation and sentence must be newly written.

Create exactly ${types.length} items in the order below. order_index MUST match type number (1, 2, 3...).
${buildExamTypeBlock(types)}

${EXAM_SCRIPT_RULES}

${CHOICE_RULES}

Per-item difficulty:
${difficultyBlock}

${JSON_OUTPUT_SCHEMA}`;
}

function buildFreePrompt(count: number): string {
  return `Write ${count} ORIGINAL Korean middle school grade 1 listening items.

${EXAM_SCRIPT_RULES}
${CHOICE_RULES}

${JSON_OUTPUT_SCHEMA}`;
}

export async function generateListeningQuestionsWithAi(
  apiKey: string,
  options: GenerateQuestionsOptions
): Promise<GenerateQuestionsResult> {
  const { mode, count, selectedTypeIds, difficultyMode = "auto" } = options;
  const examMode = mode === "exam";
  const examTypes = examMode
    ? resolveExamTypesForGeneration(count, selectedTypeIds)
    : undefined;
  const itemCount = examMode ? examTypes!.length : count;

  const prompt = examMode
    ? buildExamPrompt(examTypes!, difficultyMode)
    : buildFreePrompt(itemCount);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.55,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an expert writer for Korean national middle school English listening tests. Output only valid JSON. Never reuse copyrighted exam content. Follow word-count limits strictly.",
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
    const q = normalizeQuestion(item as Record<string, unknown>, i, examMode, hint);
    if (q && q.instruction) questions.push(q);
  });

  if (questions.length === 0) {
    throw new Error("생성된 문항을 파싱하지 못했습니다.");
  }

  const withQuality = attachQualityToQuestions(questions, examTypes);
  return { questions: withQuality };
}

/** 단일 유형 1문항 재생성 */
export async function generateSingleExamQuestion(
  apiKey: string,
  typeId: number,
  difficultyMode: ListeningDifficultyMode = "auto"
): Promise<GeneratedListeningQuestion & { needs_review: boolean; quality_issues: Array<{ code: string; message: string }> }> {
  const type = resolveExamTypesForGeneration(1, [typeId])[0];
  if (!type) throw new Error("유형을 찾을 수 없습니다.");

  const { questions } = await generateListeningQuestionsWithAi(apiKey, {
    mode: "exam",
    count: 1,
    selectedTypeIds: [typeId],
    difficultyMode,
  });

  const q = questions[0];
  if (!q) throw new Error("문항 생성 실패");

  const check = checkListeningQuestionQuality(q, type);
  return {
    ...q,
    order_index: typeId,
    needs_review: !check.ok,
    quality_issues: check.issues,
  };
}

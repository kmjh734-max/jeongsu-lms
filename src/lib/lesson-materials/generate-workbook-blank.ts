import {
  isGpt5FamilyModel,
  isModelUnavailableError,
  isUnsupportedParameterError,
  isUnsupportedTemperatureError,
  studentRecordModelSupportsTemperature,
} from "@/lib/student-records/model";
import {
  WORKBOOK_BLANK_SYSTEM_PROMPT,
  buildWorkbookBlankUserPrompt,
} from "@/lib/lesson-materials/workbook-blank-prompt";
import {
  assignBlankNumbers,
  buildAnswersFromSelected,
  buildBlankTokensForSentence,
  flattenPassageTokens,
} from "@/lib/lesson-materials/insert-workbook-blanks";
import { resolveWorkbookTranslations } from "@/lib/lesson-materials/refine-workbook-translation";
import {
  selectBlankCandidates,
  validateBlankCandidates,
  type ValidatedBlankCandidate,
} from "@/lib/lesson-materials/validate-workbook-blank";
import {
  computeBlankTargetCount,
  countEnglishWords,
  formatWorkbookPassage,
  getMaxBlanksForSentence,
  joinWorkbookPassageLines,
  type WorkbookBlankFillOptions,
  type WorkbookBlankSection,
  type WorkbookBlankSentence,
} from "@/lib/lesson-materials/workbook-types";

function parseJsonSafe<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function callBlankOpenAI(input: {
  passageId: string;
  title?: string;
  targetCount: number;
  maxPerSentence: number;
  sentences: Array<{ id: string; english: string }>;
}): Promise<unknown[]> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY가 설정되어 있지 않습니다.");

  const userContent = buildWorkbookBlankUserPrompt(input);
  const configured = process.env.OPENAI_MODEL_WORKBOOK?.trim();
  const candidates = configured
    ? configured === "gpt-5.5"
      ? ["gpt-5.5", "gpt-5"]
      : [configured]
    : ["gpt-5.5", "gpt-5"];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120_000);

  try {
    let bodyText = "";
    let ok = false;

    for (const model of candidates) {
      let includeTemperature = studentRecordModelSupportsTemperature(model);
      let includeReasoningEffort = isGpt5FamilyModel(model);
      let includeJsonMode = true;
      let useJsonSchema = true;

      for (let attempt = 0; attempt < 5; attempt++) {
        const body: Record<string, unknown> = {
          model,
          messages: [
            { role: "system", content: WORKBOOK_BLANK_SYSTEM_PROMPT },
            { role: "user", content: userContent },
          ],
        };

        if (useJsonSchema) {
          body.response_format = {
            type: "json_schema",
            json_schema: {
              name: "workbook_blank_candidates",
              strict: true,
              schema: {
                type: "object",
                additionalProperties: false,
                required: ["passageId", "candidates"],
                properties: {
                  passageId: { type: "string" },
                  candidates: {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: false,
                      required: [
                        "id",
                        "sentenceId",
                        "answerText",
                        "occurrenceIndex",
                        "lemma",
                        "partOfSpeech",
                        "meaningKo",
                        "selectionReasonKo",
                        "priority",
                      ],
                      properties: {
                        id: { type: "string" },
                        sentenceId: { type: "string" },
                        answerText: { type: "string" },
                        occurrenceIndex: { type: "integer" },
                        lemma: { type: "string" },
                        partOfSpeech: {
                          type: "string",
                          enum: ["noun", "verb", "adjective", "adverb"],
                        },
                        meaningKo: { type: "string" },
                        selectionReasonKo: { type: "string" },
                        priority: { type: "integer" },
                      },
                    },
                  },
                },
              },
            },
          };
        } else if (includeJsonMode) {
          body.response_format = { type: "json_object" };
        }

        if (includeTemperature) body.temperature = 0.3;
        else delete body.temperature;
        if (isGpt5FamilyModel(model)) {
          body.max_completion_tokens = 8_192;
          if (includeReasoningEffort) body.reasoning_effort = "medium";
          else delete body.reasoning_effort;
        } else {
          body.max_tokens = 4096;
        }

        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          signal: controller.signal,
          body: JSON.stringify(body),
        });
        bodyText = await res.text();
        if (res.ok) {
          ok = true;
          break;
        }
        if (
          useJsonSchema &&
          (bodyText.includes("json_schema") ||
            bodyText.includes("response_format") ||
            res.status === 400)
        ) {
          useJsonSchema = false;
          continue;
        }
        if (includeTemperature && isUnsupportedTemperatureError(bodyText)) {
          includeTemperature = false;
          continue;
        }
        if (
          includeReasoningEffort &&
          isUnsupportedParameterError(bodyText, "reasoning_effort")
        ) {
          includeReasoningEffort = false;
          continue;
        }
        if (
          includeJsonMode &&
          isUnsupportedParameterError(bodyText, "response_format")
        ) {
          includeJsonMode = false;
          continue;
        }
        if (isModelUnavailableError(res.status, bodyText)) break;
        break;
      }
      if (ok) break;
    }

    if (!ok) {
      throw new Error(
        `빈칸 후보 생성 실패: ${bodyText.slice(0, 280) || "unknown"}`
      );
    }

    const envelope = parseJsonSafe<{
      choices?: { message?: { content?: string } }[];
    }>(bodyText);
    const content = envelope?.choices?.[0]?.message?.content ?? bodyText;
    const parsed = parseJsonSafe<{
      passageId?: string;
      candidates?: unknown;
    }>(content);
    if (!parsed) throw new Error("빈칸 후보 JSON 파싱 실패");
    return Array.isArray(parsed.candidates) ? parsed.candidates : [];
  } finally {
    clearTimeout(timer);
  }
}

async function resolveKoreanLines(
  sentenceIds: string[],
  english: string[],
  existingKorean: Array<string | null | undefined>
): Promise<{
  korean: string[];
  warning?: string;
  translations: Awaited<
    ReturnType<typeof resolveWorkbookTranslations>
  >["translations"];
}> {
  return resolveWorkbookTranslations({
    sentenceIds,
    english,
    existingKorean,
  });
}

function pickCandidatesWithRetryPayload(
  passageId: string,
  sentences: Array<{ id: string; english: string }>,
  rawCandidates: unknown[],
  recommended: number,
  density: WorkbookBlankFillOptions["density"]
): { selected: ValidatedBlankCandidate[]; shortfallReason: string | null } {
  const sentenceWordCounts = new Map(
    sentences.map((s) => [s.id, countEnglishWords(s.english)] as const)
  );
  const { valid } = validateBlankCandidates({
    passageId,
    responsePassageId: passageId,
    sentences,
    generatedCandidates: rawCandidates,
    recommendedCount: recommended,
    density,
  });
  return selectBlankCandidates(valid, recommended, {
    density,
    sentenceWordCounts,
  });
}

export async function generateWorkbookBlankFill(input: {
  passages: Array<{
    projectId: string;
    title: string;
    source?: string | null;
    sentences: Array<{
      id: string;
      english: string;
      korean?: string | null;
    }>;
  }>;
  options: WorkbookBlankFillOptions;
}): Promise<WorkbookBlankSection[]> {
  const sections: WorkbookBlankSection[] = [];
  const density = input.options.density ?? "high";

  for (const p of input.passages) {
    const sentences = p.sentences
      .map((s) => ({
        id: s.id,
        english: formatWorkbookPassage(s.english),
        korean: s.korean,
      }))
      .filter((s) => s.english);

    if (sentences.length === 0) {
      throw new Error(`「${p.title}」에 영어 지문이 없습니다.`);
    }

    const sourcePassage = joinWorkbookPassageLines(
      sentences.map((s) => s.english)
    );
    const wordCount = countEnglishWords(sourcePassage);
    const recommended = computeBlankTargetCount({
      englishWordCount: wordCount,
      density,
      hintType: input.options.hintType,
      showTranslation: input.options.showTranslation,
    });
    const sentenceWordCounts = new Map(
      sentences.map((s) => [s.id, countEnglishWords(s.english)] as const)
    );
    const maxPerSentence = Math.max(
      1,
      ...[...sentenceWordCounts.values()].map((wc) =>
        getMaxBlanksForSentence(wc, density)
      )
    );

    let raw = await callBlankOpenAI({
      passageId: p.projectId,
      title: p.title,
      targetCount: recommended,
      maxPerSentence,
      sentences: sentences.map((s) => ({ id: s.id, english: s.english })),
    });

    const validatedOnce = validateBlankCandidates({
      passageId: p.projectId,
      responsePassageId: p.projectId,
      sentences,
      generatedCandidates: raw,
      recommendedCount: recommended,
      density,
    });

    let { selected, shortfallReason } = selectBlankCandidates(
      validatedOnce.valid,
      recommended,
      { density, sentenceWordCounts }
    );

    if (selected.length < Math.min(4, recommended)) {
      raw = await callBlankOpenAI({
        passageId: p.projectId,
        title: p.title,
        targetCount: recommended,
        maxPerSentence,
        sentences: sentences.map((s) => ({ id: s.id, english: s.english })),
      });
      const retried = pickCandidatesWithRetryPayload(
        p.projectId,
        sentences,
        raw,
        recommended,
        density
      );
      selected = retried.selected;
      shortfallReason = retried.shortfallReason;
    }

    if (selected.length === 0) {
      throw new Error(
        `「${p.title}」에서 유효한 빈칸 후보를 선정하지 못했습니다.`
      );
    }

    const sentenceOrder = sentences.map((s) => s.id);
    const numberByKey = assignBlankNumbers(selected, sentenceOrder);

    const blankBySentence = new Map<string, ValidatedBlankCandidate[]>();
    for (const c of selected) {
      const list = blankBySentence.get(c.sentenceId) ?? [];
      list.push(c);
      blankBySentence.set(c.sentenceId, list);
    }

    const sentenceRows: WorkbookBlankSentence[] = [];
    const tokenRows = [];
    for (const s of sentences) {
      const blanks = blankBySentence.get(s.id) ?? [];
      const tokens = buildBlankTokensForSentence({
        sentence: s.english,
        blanks,
        numberByKey,
        hintType: input.options.hintType,
      });
      sentenceRows.push({
        id: s.id,
        english: s.english,
        korean: "",
        tokens,
      });
      tokenRows.push(tokens);
    }

    let translationWarning: string | undefined;
    let translations = undefined as
      | Awaited<ReturnType<typeof resolveKoreanLines>>["translations"]
      | undefined;

    if (input.options.showTranslation) {
      const resolved = await resolveKoreanLines(
        sentences.map((s) => s.id),
        sentences.map((s) => s.english),
        sentences.map((s) => s.korean)
      );
      translationWarning = resolved.warning;
      translations = resolved.translations;
      sentenceRows.forEach((row, i) => {
        row.korean = resolved.korean[i] ?? "";
      });
      if (
        resolved.korean.length !== sentences.length ||
        resolved.korean.some((k) => !k.trim())
      ) {
        translationWarning =
          translationWarning ||
          "영어 문장과 한국어 해석 개수가 일치하지 않거나 비어 있습니다.";
      }
    } else {
      sentenceRows.forEach((row, i) => {
        row.korean = String(sentences[i]?.korean ?? "").trim();
      });
    }

    const fullKorean = sentenceRows
      .map((s) => s.korean.trim())
      .filter(Boolean)
      .join(" ");

    const answers = buildAnswersFromSelected(selected, numberByKey);
    const passageTokens = flattenPassageTokens(tokenRows);

    sections.push({
      projectId: p.projectId,
      title: p.title,
      source: p.source ?? null,
      sourcePassage,
      sentences: sentenceRows,
      passageTokens,
      answers,
      fullKorean,
      translationWarning,
      translations,
      generation: {
        englishWordCount: wordCount,
        density,
        targetBlankCount: recommended,
        actualBlankCount: selected.length,
        shortfallReason:
          selected.length < recommended ? shortfallReason : null,
      },
    });
  }

  return sections;
}

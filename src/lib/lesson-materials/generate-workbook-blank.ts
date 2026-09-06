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
import {
  selectBlankCandidates,
  validateBlankCandidates,
  type ValidatedBlankCandidate,
} from "@/lib/lesson-materials/validate-workbook-blank";
import {
  BLANK_POOL_ALGORITHM_VERSION,
  computePassageSourceHash,
  isBlankPoolFresh,
  type StoredBlankCandidate,
  type StoredBlankCandidatePool,
} from "@/lib/lesson-materials/workbook-blank-cache";
import { computeConceptScore } from "@/lib/lesson-materials/blank-concept-score";
import {
  computeBlankTargetCount,
  countEnglishWords,
  formatWorkbookPassage,
  getMaxBlanksForSentence,
  joinWorkbookPassageLines,
  type WorkbookBlankFillOptions,
  type WorkbookBlankSection,
  type WorkbookBlankSentence,
  type WorkbookGenerationTiming,
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

export async function callBlankOpenAI(input: {
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

function storedToRawCandidates(pool: StoredBlankCandidate[]): unknown[] {
  return pool.map((c, i) => ({
    id: `cached-${i + 1}`,
    sentenceId: c.sentenceId,
    answerText: c.answerText,
    occurrenceIndex: c.occurrenceIndex,
    lemma: c.lemma,
    partOfSpeech: c.partOfSpeech,
    meaningKo: c.meaningKo,
    selectionReasonKo: c.selectionReasonKo,
    priority: c.priority,
  }));
}

function validatedToStored(
  selected: ValidatedBlankCandidate[],
  passageId: string,
  sourceHash: string
): StoredBlankCandidatePool {
  return {
    passageId,
    sourceHash,
    algorithmVersion: BLANK_POOL_ALGORITHM_VERSION,
    createdAt: new Date().toISOString(),
    candidates: selected.map((c) => ({
      sentenceId: c.sentenceId,
      answerText: c.answerText,
      occurrenceIndex: c.occurrenceIndex,
      lemma: c.lemma,
      partOfSpeech: c.partOfSpeech,
      meaningKo: c.meaningKo,
      priority: c.priority,
      conceptScore: c.conceptScore,
      selectionReasonKo: c.selectionReasonKo,
    })),
  };
}

export type BlankFillPassageInput = {
  projectId: string;
  title: string;
  source?: string | null;
  sentences: Array<{
    id: string;
    english: string;
    korean?: string | null;
  }>;
  /** Cached pool from lesson_pack_json */
  blankPool?: StoredBlankCandidatePool | null;
  vocabLemmas?: string[];
};

export type BlankFillResult = {
  sections: WorkbookBlankSection[];
  /** Pools that were newly generated and should be persisted */
  poolsToSave: Array<{ projectId: string; pool: StoredBlankCandidatePool }>;
  timing: WorkbookGenerationTiming;
  statusNotes: string[];
};

export async function generateWorkbookBlankFill(input: {
  passages: BlankFillPassageInput[];
  options: WorkbookBlankFillOptions;
}): Promise<BlankFillResult> {
  const t0 = Date.now();
  let translationLookupMs = 0;
  let blankSelectionMs = 0;
  let openAiRequestCount = 0;
  const statusNotes: string[] = [];
  const poolsToSave: Array<{
    projectId: string;
    pool: StoredBlankCandidatePool;
  }> = [];
  const sections: WorkbookBlankSection[] = [];
  const density = input.options.density ?? "high";

  for (const p of input.passages) {
    const sentences = p.sentences
      .map((s) => ({
        id: s.id,
        english: formatWorkbookPassage(s.english),
        korean: String(s.korean ?? "").trim(),
      }))
      .filter((s) => s.english);

    if (sentences.length === 0) {
      throw new Error(`「${p.title}」에 영어 지문이 없습니다.`);
    }

    const tTr = Date.now();
    if (input.options.showTranslation) {
      const missing = sentences.filter((s) => !s.korean);
      if (missing.length > 0) {
        throw new Error(
          `「${p.title}」에 저장된 한글 해석이 없거나 원문이 변경되었습니다. 수업용자료에서 해석을 먼저 생성하거나 ‘해석 미제공’을 선택해 주세요.`
        );
      }
    }
    translationLookupMs += Date.now() - tTr;

    const sourcePassage = joinWorkbookPassageLines(
      sentences.map((s) => s.english)
    );
    const sourceHash = computePassageSourceHash(sentences.map((s) => s.english));
    const wordCount = countEnglishWords(sourcePassage);
    const recommended = computeBlankTargetCount({
      englishWordCount: wordCount,
      density,
      hintType: input.options.hintType,
      showTranslation: input.options.showTranslation,
    });
    // Ask AI for a richer pool than final target when generating fresh
    const poolTarget = Math.min(24, Math.max(recommended + 6, 20));
    const sentenceWordCounts = new Map(
      sentences.map((s) => [s.id, countEnglishWords(s.english)] as const)
    );
    const maxPerSentence = Math.max(
      1,
      ...[...sentenceWordCounts.values()].map((wc) =>
        getMaxBlanksForSentence(wc, density)
      )
    );
    const vocabLemmas = new Set(
      (p.vocabLemmas ?? []).map((w) => w.toLowerCase().trim()).filter(Boolean)
    );

    const tBlank = Date.now();
    let rawCandidates: unknown[] = [];
    let usedCache = false;

    if (isBlankPoolFresh(p.blankPool, p.projectId, sourceHash)) {
      rawCandidates = storedToRawCandidates(p.blankPool.candidates);
      usedCache = true;
    } else {
      statusNotes.push(
        `「${p.title}」핵심 어휘를 처음 준비하고 있습니다. 완료 후 다음 제작부터는 저장된 결과를 사용합니다.`
      );
      openAiRequestCount += 1;
      rawCandidates = await callBlankOpenAI({
        passageId: p.projectId,
        title: p.title,
        targetCount: poolTarget,
        maxPerSentence,
        sentences: sentences.map((s) => ({ id: s.id, english: s.english })),
      });
    }

    let { valid } = validateBlankCandidates({
      passageId: p.projectId,
      responsePassageId: p.projectId,
      sentences,
      generatedCandidates: rawCandidates,
      recommendedCount: poolTarget,
      density,
      vocabLemmas,
      titleText: p.title,
    });

    // Enrich concept scores if missing from cache path
    valid = valid.map((c) => ({
      ...c,
      conceptScore:
        c.conceptScore ||
        computeConceptScore({
          lemma: c.lemma,
          partOfSpeech: c.partOfSpeech,
          priority: c.priority,
          vocabLemmas,
          titleText: p.title,
        }),
    }));

    let { selected, shortfallReason } = selectBlankCandidates(
      valid,
      recommended,
      { density, sentenceWordCounts }
    );

    if (!usedCache && selected.length < Math.min(4, recommended)) {
      openAiRequestCount += 1;
      rawCandidates = await callBlankOpenAI({
        passageId: p.projectId,
        title: p.title,
        targetCount: poolTarget,
        maxPerSentence,
        sentences: sentences.map((s) => ({ id: s.id, english: s.english })),
      });
      const again = validateBlankCandidates({
        passageId: p.projectId,
        responsePassageId: p.projectId,
        sentences,
        generatedCandidates: rawCandidates,
        recommendedCount: poolTarget,
        density,
        vocabLemmas,
        titleText: p.title,
      });
      valid = again.valid;
      ({ selected, shortfallReason } = selectBlankCandidates(valid, recommended, {
        density,
        sentenceWordCounts,
      }));
    }

    if (selected.length === 0) {
      throw new Error(
        `「${p.title}」에서 유효한 빈칸 후보를 선정하지 못했습니다.`
      );
    }

    // Persist a ranked pool (prefer full valid list capped, not only selected)
    if (!usedCache) {
      const poolSelected = selectBlankCandidates(valid, poolTarget, {
        density,
        sentenceWordCounts,
      }).selected;
      const pool = validatedToStored(
        poolSelected.length ? poolSelected : selected,
        p.projectId,
        sourceHash
      );
      poolsToSave.push({ projectId: p.projectId, pool });
    }

    blankSelectionMs += Date.now() - tBlank;

    const sentenceOrder = sentences.map((s) => s.id);
    const numberByKey = assignBlankNumbers(selected, sentenceOrder);
    const blankBySentence = new Map<string, ValidatedBlankCandidate[]>();
    for (const c of selected) {
      const list = blankBySentence.get(c.sentenceId) ?? [];
      list.push(c);
      blankBySentence.set(c.sentenceId, list);
    }

    const sentenceRows: WorkbookBlankSentence[] = [];
    const tokenRows: ReturnType<typeof buildBlankTokensForSentence>[] = [];
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
        korean: s.korean,
        tokens,
      });
      tokenRows.push(tokens);
    }

    const fullKorean = sentenceRows
      .map((s) => s.korean.trim())
      .filter(Boolean)
      .join(" ");

    sections.push({
      projectId: p.projectId,
      title: p.title,
      source: p.source ?? null,
      sourcePassage,
      sentences: sentenceRows,
      passageTokens: flattenPassageTokens(tokenRows),
      answers: buildAnswersFromSelected(selected, numberByKey),
      fullKorean,
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

  const timing: WorkbookGenerationTiming = {
    dataLoadMs: 0,
    translationLookupMs,
    blankSelectionMs,
    pdfRenderMs: 0,
    totalMs: Date.now() - t0,
    openAiRequestCount,
  };

  return { sections, poolsToSave, timing, statusNotes };
}

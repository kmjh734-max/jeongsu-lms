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
import { computeBlankFinalScore } from "@/lib/lesson-materials/blank-concept-score";
import { buildBlankCandidatesFromVocab } from "@/lib/lesson-materials/build-blank-candidates-from-vocab";
import type { LessonPackVocabItem } from "@/lib/lesson-materials/generate-lesson-pack";
import {
  readTranslationMeta,
  translationsReadyForWorkbook,
} from "@/lib/lesson-materials/translation-meta";
import type { StoredSentenceTranslation } from "@/lib/lesson-materials/translation-meta";
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

/**
 * Blank-candidate OpenAI — intentionally uses a fast model (gpt-4o-mini).
 * Do NOT use gpt-5.* + reasoning here; that was the main workbook latency bottleneck.
 */
export async function callBlankOpenAI(input: {
  passageId: string;
  title?: string;
  topicKo?: string;
  summaryKo?: string;
  targetCount: number;
  maxPerSentence: number;
  sentences: Array<{ id: string; english: string }>;
  existingVocabulary?: Array<{
    word: string;
    lemma?: string;
    meaningKo?: string;
  }>;
}): Promise<{ candidates: unknown[]; coreSentenceIds: string[] }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY가 설정되어 있지 않습니다.");

  const userContent = buildWorkbookBlankUserPrompt({
    passageId: input.passageId,
    titleKo: input.title,
    topicKo: input.topicKo,
    summaryKo: input.summaryKo,
    targetCount: input.targetCount,
    maxPerSentence: input.maxPerSentence,
    sentences: input.sentences.map((s, i) => ({
      sentenceId: s.id,
      order: i + 1,
      english: s.english,
    })),
    existingVocabulary: input.existingVocabulary,
  });
  const configured = process.env.OPENAI_MODEL_WORKBOOK_BLANK?.trim();
  const modelCandidates = configured
    ? [configured]
    : ["gpt-4o-mini", "gpt-4o"];

  const scoreProps = {
    type: "object",
    additionalProperties: false,
    required: [
      "centrality",
      "learningValue",
      "contextualImportance",
      "reusability",
      "collocationValue",
      "commonnessPenalty",
      "redundancyPenalty",
    ],
    properties: {
      centrality: { type: "integer" },
      learningValue: { type: "integer" },
      contextualImportance: { type: "integer" },
      reusability: { type: "integer" },
      collocationValue: { type: "integer" },
      commonnessPenalty: { type: "integer" },
      redundancyPenalty: { type: "integer" },
    },
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60_000);

  try {
    let bodyText = "";
    let ok = false;

    for (const model of modelCandidates) {
      let includeTemperature = studentRecordModelSupportsTemperature(model);
      let includeJsonMode = true;
      let useJsonSchema = true;

      for (let attempt = 0; attempt < 4; attempt++) {
        const body: Record<string, unknown> = {
          model,
          messages: [
            { role: "system", content: WORKBOOK_BLANK_SYSTEM_PROMPT },
            { role: "user", content: userContent },
          ],
          max_tokens: 6_144,
        };

        if (useJsonSchema) {
          body.response_format = {
            type: "json_schema",
            json_schema: {
              name: "workbook_blank_candidates_v3",
              strict: true,
              schema: {
                type: "object",
                additionalProperties: false,
                required: ["passageId", "coreSentenceIds", "candidates"],
                properties: {
                  passageId: { type: "string" },
                  coreSentenceIds: {
                    type: "array",
                    items: { type: "string" },
                  },
                  candidates: {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: false,
                      required: [
                        "candidateId",
                        "sentenceId",
                        "answerText",
                        "occurrenceIndex",
                        "lemma",
                        "wordFamily",
                        "partOfSpeech",
                        "meaningKo",
                        "semanticRole",
                        "competitionGroup",
                        "scores",
                        "reasonKo",
                      ],
                      properties: {
                        candidateId: { type: "string" },
                        sentenceId: { type: "string" },
                        answerText: { type: "string" },
                        occurrenceIndex: { type: "integer" },
                        lemma: { type: "string" },
                        wordFamily: { type: "string" },
                        partOfSpeech: {
                          type: "string",
                          enum: ["noun", "verb", "adjective", "adverb"],
                        },
                        meaningKo: { type: "string" },
                        semanticRole: {
                          type: "string",
                          enum: [
                            "theme",
                            "main_claim",
                            "logic",
                            "academic",
                            "context",
                            "collocation",
                          ],
                        },
                        competitionGroup: { type: "string" },
                        scores: scoreProps,
                        reasonKo: { type: "string" },
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

        if (includeTemperature) body.temperature = 0.25;
        else delete body.temperature;

        if (isGpt5FamilyModel(model)) {
          delete body.max_tokens;
          body.max_completion_tokens = 6_144;
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
            bodyText.includes("competitionGroup") ||
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
      coreSentenceIds?: unknown;
    }>(content);
    if (!parsed) throw new Error("빈칸 후보 JSON 파싱 실패");
    const coreSentenceIds = Array.isArray(parsed.coreSentenceIds)
      ? parsed.coreSentenceIds.map((x) => String(x))
      : [];
    return {
      candidates: Array.isArray(parsed.candidates) ? parsed.candidates : [],
      coreSentenceIds,
    };
  } finally {
    clearTimeout(timer);
  }
}

function storedToRawCandidates(pool: StoredBlankCandidate[]): unknown[] {
  return pool.map((c, i) => ({
    candidateId: `cached-${i + 1}`,
    id: `cached-${i + 1}`,
    sentenceId: c.sentenceId,
    answerText: c.answerText,
    occurrenceIndex: c.occurrenceIndex,
    lemma: c.lemma,
    wordFamily: c.wordFamily,
    partOfSpeech: c.partOfSpeech,
    meaningKo: c.meaningKo,
    semanticRole: c.semanticRole ?? null,
    competitionGroup: c.competitionGroup ?? null,
    scores: c.scores,
    reasonKo: c.selectionReasonKo,
    selectionReasonKo: c.selectionReasonKo,
    priority: c.priority,
  }));
}

function validatedToStored(
  selected: ValidatedBlankCandidate[],
  passageId: string,
  sourceHash: string,
  coreSentenceIds: string[]
): StoredBlankCandidatePool {
  return {
    passageId,
    sourceHash,
    algorithmVersion: BLANK_POOL_ALGORITHM_VERSION,
    createdAt: new Date().toISOString(),
    coreSentenceIds,
    candidates: selected.map((c) => ({
      sentenceId: c.sentenceId,
      answerText: c.answerText,
      occurrenceIndex: c.occurrenceIndex,
      lemma: c.lemma,
      partOfSpeech: c.partOfSpeech,
      meaningKo: c.meaningKo,
      priority: c.priority,
      conceptScore: c.finalScore ?? c.conceptScore,
      selectionReasonKo: c.selectionReasonKo,
      wordFamily: c.wordFamily,
      semanticRole: c.semanticRole,
      competitionGroup: c.competitionGroup,
      scores: c.scores,
      finalScore: c.finalScore ?? computeBlankFinalScore(c.scores),
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
  /** Full lesson-pack vocab (preferred over OpenAI for blank pool) */
  vocab?: LessonPackVocabItem[];
  sentenceTranslations?: StoredSentenceTranslation[];
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
      const meta = readTranslationMeta({
        sentenceTranslations: p.sentenceTranslations,
      });
      const ready = translationsReadyForWorkbook({ sentences, meta });
      if (!ready.ok) {
        throw Object.assign(
          new Error(
            "저장된 한글 해석이 없거나 영어 원문이 변경되었습니다. 수업용자료에서 해석을 먼저 생성하거나 ‘해석 미제공’을 선택해 주세요."
          ),
          { code: "MISSING_TRANSLATION" as const }
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
    let coreSentenceIds: string[] = [];
    let usedCache = false;
    let fromVocabFallback = false;

    if (isBlankPoolFresh(p.blankPool, p.projectId, sourceHash)) {
      rawCandidates = storedToRawCandidates(p.blankPool.candidates);
      coreSentenceIds = p.blankPool.coreSentenceIds ?? [];
      usedCache = true;
    } else {
      // v3: always evaluate full passage via OpenAI once (vocab is reference only)
      statusNotes.push(
        `「${p.title}」핵심 어휘 후보(v3)를 준비합니다. 이후 동일 원문은 캐시를 사용합니다.`
      );
      try {
        openAiRequestCount += 1;
        const ai = await callBlankOpenAI({
          passageId: p.projectId,
          title: p.title,
          targetCount: poolTarget,
          maxPerSentence,
          sentences: sentences.map((s) => ({ id: s.id, english: s.english })),
          existingVocabulary: (p.vocab ?? []).map((v) => ({
            word: v.word,
            lemma: v.word,
            meaningKo: v.meaning,
          })),
        });
        rawCandidates = ai.candidates;
        coreSentenceIds = ai.coreSentenceIds;
      } catch {
        // Fallback: vocab-located candidates with heuristic scores
        if ((p.vocab?.length ?? 0) >= 4) {
          rawCandidates = buildBlankCandidatesFromVocab({
            sentences: sentences.map((s) => ({ id: s.id, english: s.english })),
            vocab: p.vocab!,
            titleText: p.title,
            maxCandidates: poolTarget,
          });
          fromVocabFallback = rawCandidates.length >= 4;
          if (fromVocabFallback) {
            statusNotes.push(
              `「${p.title}」AI 후보 생성 실패 → 수업용자료 어휘로 대체했습니다.`
            );
          } else {
            throw new Error(
              `「${p.title}」빈칸 후보를 생성하지 못했습니다.`
            );
          }
        } else {
          throw new Error(`「${p.title}」빈칸 후보를 생성하지 못했습니다.`);
        }
      }
    }

    const firstPass = validateBlankCandidates({
      passageId: p.projectId,
      responsePassageId: p.projectId,
      sentences,
      generatedCandidates: rawCandidates,
      recommendedCount: poolTarget,
      density,
      vocabLemmas,
      titleText: p.title,
      coreSentenceIds,
    });
    let valid = firstPass.valid;
    if (firstPass.coreSentenceIds.length) {
      coreSentenceIds = firstPass.coreSentenceIds;
    }

    let { selected, shortfallReason } = selectBlankCandidates(
      valid,
      recommended,
      {
        density,
        sentenceWordCounts,
        coreSentenceIds,
        sentenceOrder: sentences.map((s) => s.id),
      }
    );

    if (
      !usedCache &&
      !fromVocabFallback &&
      selected.length < Math.min(4, recommended)
    ) {
      openAiRequestCount += 1;
      const ai = await callBlankOpenAI({
        passageId: p.projectId,
        title: p.title,
        targetCount: poolTarget,
        maxPerSentence,
        sentences: sentences.map((s) => ({ id: s.id, english: s.english })),
        existingVocabulary: (p.vocab ?? []).map((v) => ({
          word: v.word,
          lemma: v.word,
          meaningKo: v.meaning,
        })),
      });
      rawCandidates = ai.candidates;
      coreSentenceIds = ai.coreSentenceIds;
      const again = validateBlankCandidates({
        passageId: p.projectId,
        responsePassageId: p.projectId,
        sentences,
        generatedCandidates: rawCandidates,
        recommendedCount: poolTarget,
        density,
        vocabLemmas,
        titleText: p.title,
        coreSentenceIds,
      });
      valid = again.valid;
      coreSentenceIds = again.coreSentenceIds.length
        ? again.coreSentenceIds
        : coreSentenceIds;
      ({ selected, shortfallReason } = selectBlankCandidates(valid, recommended, {
        density,
        sentenceWordCounts,
        coreSentenceIds,
        sentenceOrder: sentences.map((s) => s.id),
      }));
    }

    if (selected.length === 0) {
      throw new Error(
        `「${p.title}」에서 유효한 빈칸 후보를 선정하지 못했습니다.`
      );
    }

    // Persist ranked pool (full valid capped) for next 0-OpenAI runs
    if (!usedCache) {
      const poolSelected = selectBlankCandidates(valid, poolTarget, {
        density,
        sentenceWordCounts,
        coreSentenceIds,
        sentenceOrder: sentences.map((s) => s.id),
      }).selected;
      const pool = validatedToStored(
        poolSelected.length ? poolSelected : selected,
        p.projectId,
        sourceHash,
        coreSentenceIds
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

"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { generateWorkbookBlankFill } from "@/lib/lesson-materials/generate-workbook-blank";
import { mapLineTranslationToFullEnWriting } from "@/lib/lesson-materials/generate-workbook-full-en-writing";
import { generateWorkbookLineTranslation } from "@/lib/lesson-materials/generate-workbook-line-translation";
import { generateWorkbookSentenceOrder } from "@/lib/lesson-materials/generate-workbook-sentence-order";
import { generateWorkbookTf } from "@/lib/lesson-materials/generate-workbook-tf";
import { generateWorkbookWordOrderWriting } from "@/lib/lesson-materials/generate-workbook-word-order-writing";
import { generateWorkbookGrammarChoice } from "@/lib/lesson-materials/generate-workbook-grammar-choice";
import type { StoredGrammarChoiceCache } from "@/lib/lesson-materials/grammar-choice-cache";
import type { AnalysisReportData } from "@/lib/lesson-materials/generate-analysis-report";
import type { StoredWordOrderChunkCache } from "@/lib/lesson-materials/word-order-chunk-cache";
import { SENTENCE_ORDER_SKIP_TOO_FEW } from "@/lib/lesson-materials/sentence-order-constants";
import type { LessonPackData, LessonPackVocabItem } from "@/lib/lesson-materials/generate-lesson-pack";
import type { StoredBlankCandidatePool } from "@/lib/lesson-materials/workbook-blank-cache";
import {
  DEFAULT_WORKBOOK_TF_OPTIONS,
  READY_WORKBOOK_TYPE_IDS,
  clampTfCount,
  defaultWorkbookTitle,
  parseBlankHintType,
  parseBlankTranslationLayout,
  parseBlankDensity,
  sortWorkbookTypesByPrintOrder,
  type WorkbookBlankFillOptions,
  type WorkbookData,
  type WorkbookTfOptions,
  type WorkbookTypeId,
} from "@/lib/lesson-materials/workbook-types";

type Role = "admin" | "teacher";

async function requireRole(role: Role) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== role) {
    return { profile: null as null, error: "권한이 없습니다." };
  }
  if (role === "teacher" && profile.is_active === false) {
    return { profile: null as null, error: "비활성화된 계정입니다." };
  }
  if (!profile.academy_id) {
    return { profile: null as null, error: "소속 학원 정보가 없습니다." };
  }
  return { profile, error: null as null };
}

function normalizeSelectedTypes(raw: WorkbookTypeId[]): WorkbookTypeId[] {
  const ready = new Set(READY_WORKBOOK_TYPE_IDS);
  const filtered = [...new Set(raw)].filter((id) => ready.has(id));
  return sortWorkbookTypesByPrintOrder(filtered);
}

export async function generateWorkbookAction(
  role: Role,
  input: {
    projectIds: string[];
    selectedTypes: WorkbookTypeId[];
    tfOptions?: Partial<WorkbookTfOptions>;
    blankOptions?: Partial<WorkbookBlankFillOptions>;
    title?: string;
    /** Exclude these project IDs from one-line translation only */
    lineTranslationExcludeIds?: string[];
  }
): Promise<
  | { ok: true; workbook: WorkbookData }
  | {
      ok: false;
      message: string;
      code?: "MISSING_TRANSLATION" | "MISSING_LINE_TRANSLATION";
      lineTranslationExcludeIds?: string[];
    }
> {
  const tLoad0 = Date.now();
  const { profile, error } = await requireRole(role);
  if (error) return { ok: false, message: error };

  const ids = (input.projectIds ?? []).map((s) => s.trim()).filter(Boolean);
  if (ids.length === 0) return { ok: false, message: "선택된 자료가 없습니다." };

  const types = normalizeSelectedTypes(input.selectedTypes ?? []);
  if (types.length === 0) {
    return {
      ok: false,
      message:
        "생성 가능한 문제 유형을 선택해 주세요. (어법 선택, T/F, 빈칸 채우기, 문장 순서 배열, 한줄해석, 통문장 영작, 어순배열 영작)",
    };
  }
  const unknown = (input.selectedTypes ?? []).filter(
    (t) => !READY_WORKBOOK_TYPE_IDS.includes(t) && t
  );
  if (unknown.length) {
    return {
      ok: false,
      message:
        "준비 중인 유형이 포함되어 있습니다. 준비된 유형만 선택해 주세요.",
    };
  }

  const wantTf = types.includes("tf");
  const wantBlank = types.includes("blank_fill");
  const wantGrammarChoice = types.includes("grammar_choice");
  const wantSentenceOrder = types.includes("sentence_order");
  const wantLineKo = types.includes("one_line_ko");
  const wantFullEn = types.includes("full_en_writing");
  const wantWordOrder = types.includes("word_order_writing");
  const wantBilingual = wantLineKo || wantFullEn || wantWordOrder;
  const lineTranslationExcludeIds = [
    ...new Set(
      (input.lineTranslationExcludeIds ?? [])
        .map((s) => s.trim())
        .filter(Boolean)
    ),
  ];

  const tfOptions: WorkbookTfOptions = {
    count: clampTfCount(
      input.tfOptions?.count ?? DEFAULT_WORKBOOK_TF_OPTIONS.count
    ),
    language:
      input.tfOptions?.language === "ko"
        ? "ko"
        : DEFAULT_WORKBOOK_TF_OPTIONS.language,
    difficulty:
      input.tfOptions?.difficulty === "hard"
        ? "hard"
        : DEFAULT_WORKBOOK_TF_OPTIONS.difficulty,
  };

  const blankOptions: WorkbookBlankFillOptions = {
    hintType: parseBlankHintType(input.blankOptions?.hintType),
    showTranslation:
      input.blankOptions?.showTranslation === false ? false : true,
    translationLayout: parseBlankTranslationLayout(
      input.blankOptions?.translationLayout
    ),
    density: parseBlankDensity(input.blankOptions?.density),
  };

  const supabase = await createClient();
  let pq = supabase
    .from("lesson_material_projects")
    .select("id,title,source,lesson_pack_json,analysis_report_json,deleted_at")
    .in("id", ids)
    .eq("academy_id", profile!.academy_id!)
    .is("deleted_at", null);
  if (role === "teacher") {
    pq = pq.or(`teacher_id.eq.${profile!.id},created_by.eq.${profile!.id}`);
  }
  const { data: projects, error: pErr } = await pq;
  if (pErr) return { ok: false, message: pErr.message };

  const byId = new Map((projects ?? []).map((p) => [p.id, p] as const));
  const ordered = ids.map((id) => byId.get(id)).filter(Boolean);
  if (ordered.length === 0) {
    return { ok: false, message: "프로젝트를 찾을 수 없습니다." };
  }

  const passages: Array<{
    projectId: string;
    title: string;
    source: string | null;
    sentences: Array<{
      id: string;
      english: string;
      korean: string | null;
    }>;
    englishLines: string[];
    blankPool: StoredBlankCandidatePool | null;
    vocabLemmas: string[];
    vocab: LessonPackVocabItem[];
    sentenceTranslations: import("@/lib/lesson-materials/translation-meta").StoredSentenceTranslation[];
    packJson: Partial<LessonPackData>;
    wordOrderChunkCache: StoredWordOrderChunkCache | null;
    grammarChoiceCache: StoredGrammarChoiceCache | null;
    analysisReport: AnalysisReportData | null;
  }> = [];

  for (const p of ordered) {
    const { data: items, error: iErr } = await supabase
      .from("lesson_material_items")
      .select("id,english_text,korean_text,order_index")
      .eq("project_id", p!.id)
      .order("order_index", { ascending: true });
    if (iErr) return { ok: false, message: iErr.message };
    const sentences = (items ?? []).map((it, idx) => ({
      id: String(it.id ?? `s${idx}`),
      english: String(it.english_text ?? ""),
      korean: (it.korean_text as string | null) ?? null,
    }));
    const pack = (p!.lesson_pack_json ?? {}) as Partial<LessonPackData>;
    const analysisReport =
      (p as { analysis_report_json?: unknown }).analysis_report_json &&
      typeof (p as { analysis_report_json?: unknown }).analysis_report_json ===
        "object"
        ? ((p as { analysis_report_json: AnalysisReportData })
            .analysis_report_json as AnalysisReportData)
        : null;
    passages.push({
      projectId: p!.id,
      title: p!.title,
      source: (p!.source as string | null) ?? null,
      sentences,
      englishLines: sentences.map((s) => s.english),
      blankPool: (pack.blankCandidatePool as StoredBlankCandidatePool) ?? null,
      vocabLemmas: (pack.vocab ?? []).map((v) => v.word),
      vocab: pack.vocab ?? [],
      sentenceTranslations: pack.sentenceTranslations ?? [],
      packJson: pack,
      wordOrderChunkCache:
        (pack.wordOrderChunkCache as StoredWordOrderChunkCache) ?? null,
      grammarChoiceCache:
        (pack.grammarChoiceCache as StoredGrammarChoiceCache) ?? null,
      analysisReport,
    });
  }
  const dataLoadMs = Date.now() - tLoad0;

  const now = new Date();
  const workbook: WorkbookData = {
    metadata: {
      title: input.title?.trim() || defaultWorkbookTitle(now),
      createdAt: now.toISOString(),
    },
    selectedTypes: types,
    tfOptions,
    blankOptions,
    sections: [],
    blankSections: [],
    grammarChoiceSections: [],
    grammarChoiceSkipped: [],
    sentenceOrderQuestions: [],
    sentenceOrderSkipped: [],
    lineTranslationSections: [],
    lineTranslationSkipped: [],
    fullEnWritingSections: [],
    fullEnWritingSkipped: [],
    wordOrderWritingSections: [],
    wordOrderWritingSkipped: [],
  };
  const workbookId = `${workbook.metadata.title}|${workbook.metadata.createdAt}`;

  try {
    let openAiFromBlank = 0;
    let openAiFromGrammar = 0;

    if (wantGrammarChoice) {
      const gc = await generateWorkbookGrammarChoice({
        passages: passages.map((p) => ({
          projectId: p.projectId,
          title: p.title,
          source: p.source,
          sentences: p.sentences,
          analysisReport: p.analysisReport,
          grammarChoiceCache: p.grammarChoiceCache,
        })),
      });
      workbook.grammarChoiceSections = gc.sections;
      workbook.grammarChoiceSkipped = gc.skipped;
      openAiFromGrammar = gc.timing.openAiRequestCount;
      workbook.timing = {
        ...gc.timing,
        dataLoadMs,
        totalMs: dataLoadMs + gc.timing.totalMs,
        openAiRequestCount: openAiFromGrammar,
      };

      for (const { projectId, cache } of gc.cachesToSave) {
        const proj = byId.get(projectId);
        const prev = (proj?.lesson_pack_json ?? {}) as Partial<LessonPackData>;
        const next: LessonPackData = {
          headerLabel: prev.headerLabel || "26년도 1학기 중간고사 대비",
          vocab: prev.vocab ?? [],
          updatedAt: new Date().toISOString(),
          blankCandidatePool: prev.blankCandidatePool,
          passageSourceHash: prev.passageSourceHash,
          sentenceTranslations: prev.sentenceTranslations,
          wordOrderChunkCache: prev.wordOrderChunkCache,
          grammarChoiceCache: cache,
        };
        await supabase
          .from("lesson_material_projects")
          .update({
            lesson_pack_json: next,
            updated_at: new Date().toISOString(),
          })
          .eq("id", projectId);
      }
    }

    if (wantBlank) {
      const blankResult = await generateWorkbookBlankFill({
        passages: passages.map((p) => ({
          projectId: p.projectId,
          title: p.title,
          source: p.source,
          sentences: p.sentences,
          blankPool: p.blankPool,
          vocabLemmas: p.vocabLemmas,
          vocab: p.vocab,
          sentenceTranslations: p.sentenceTranslations,
        })),
        options: blankOptions,
      });
      workbook.blankSections = blankResult.sections;
      openAiFromBlank = blankResult.timing.openAiRequestCount;
      const prevOpenAi = workbook.timing?.openAiRequestCount ?? 0;
      workbook.timing = {
        ...blankResult.timing,
        dataLoadMs,
        totalMs:
          dataLoadMs +
          blankResult.timing.totalMs +
          (workbook.timing?.totalMs ?? dataLoadMs) -
          dataLoadMs,
        openAiRequestCount: prevOpenAi + openAiFromBlank,
      };

      // Persist newly generated pools for next time (0 OpenAI)
      for (const { projectId, pool } of blankResult.poolsToSave) {
        const proj = byId.get(projectId);
        const prev = (proj?.lesson_pack_json ?? {}) as Partial<LessonPackData>;
        const next: LessonPackData = {
          headerLabel: prev.headerLabel || "26년도 1학기 중간고사 대비",
          vocab: prev.vocab ?? [],
          updatedAt: new Date().toISOString(),
          blankCandidatePool: pool,
          passageSourceHash: pool.sourceHash,
          sentenceTranslations: prev.sentenceTranslations,
          wordOrderChunkCache: prev.wordOrderChunkCache,
          grammarChoiceCache: prev.grammarChoiceCache,
        };
        await supabase
          .from("lesson_material_projects")
          .update({
            lesson_pack_json: next,
            updated_at: new Date().toISOString(),
          })
          .eq("id", projectId);
      }

      if (blankResult.statusNotes.length && process.env.NODE_ENV !== "production") {
        console.info("[workbook-blank]", blankResult.statusNotes.join(" | "));
      }
      console.info(
        "[workbook-timing]",
        JSON.stringify({
          openAiRequestCount: openAiFromBlank,
          dataLoadMs,
          translationLookupMs: blankResult.timing.translationLookupMs,
          blankSelectionMs: blankResult.timing.blankSelectionMs,
          totalMs: workbook.timing.totalMs,
        })
      );
    }

    if (wantTf) {
      const tf = await generateWorkbookTf({
        title: workbook.metadata.title,
        passages: passages.map((p) => ({
          projectId: p.projectId,
          title: p.title,
          source: p.source,
          englishLines: p.englishLines,
        })),
        options: tfOptions,
      });
      workbook.sections = tf.sections;
      // TF still uses OpenAI — timing note only for blank path when TF absent
      if (workbook.timing && !wantBlank) {
        workbook.timing.openAiRequestCount = passages.length;
      }
    }

    if (wantSentenceOrder) {
      const so = generateWorkbookSentenceOrder({
        workbookId,
        passages: passages.map((p) => ({
          projectId: p.projectId,
          title: p.title,
          source: p.source,
          sentences: p.sentences,
        })),
      });
      workbook.sentenceOrderQuestions = so.questions;
      workbook.sentenceOrderSkipped = so.skipped;
      if (!workbook.timing) {
        workbook.timing = {
          dataLoadMs,
          translationLookupMs: 0,
          blankSelectionMs: 0,
          pdfRenderMs: 0,
          totalMs: dataLoadMs,
          openAiRequestCount: 0,
        };
      }
      if (wantSentenceOrder && !wantBlank && !wantTf) {
        workbook.timing.openAiRequestCount = 0;
      }
    }

    if (wantBilingual) {
      const bilingual = generateWorkbookLineTranslation({
        passages: passages.map((p) => ({
          projectId: p.projectId,
          title: p.title,
          source: p.source,
          sentences: p.sentences,
          sentenceTranslations: p.sentenceTranslations,
        })),
        excludeProjectIds: lineTranslationExcludeIds,
      });

      if (bilingual.blocking.length > 0) {
        const message = bilingual.blocking.map((b) => b.reason).join("\n");
        return {
          ok: false,
          message:
            message ||
            "저장된 한글 해석이 없거나 영어 원문이 변경되었습니다. 수업용자료에서 해석을 확인해 주세요.",
          code: "MISSING_LINE_TRANSLATION",
          lineTranslationExcludeIds: bilingual.blocking.map((b) => b.projectId),
        };
      }

      const skipped = bilingual.skipped.map((s) => ({
        projectId: s.projectId,
        title: s.title,
        reason: s.reason,
      }));

      if (wantLineKo) {
        workbook.lineTranslationSections = bilingual.sections;
        workbook.lineTranslationSkipped = skipped;
      }
      if (wantFullEn) {
        workbook.fullEnWritingSections =
          mapLineTranslationToFullEnWriting(bilingual.sections);
        workbook.fullEnWritingSkipped = skipped;
      }
      if (wantWordOrder) {
        const wo = await generateWorkbookWordOrderWriting({
          workbookId,
          passages: passages.map((p) => ({
            projectId: p.projectId,
            title: p.title,
            source: p.source,
            sentences: p.sentences,
            sentenceTranslations: p.sentenceTranslations,
            packJson: p.packJson,
            wordOrderChunkCache: p.wordOrderChunkCache,
          })),
          prebuiltLineSections: bilingual.sections,
          prebuiltSkipped: bilingual.skipped,
          prebuiltBlocking: [],
        });
        workbook.wordOrderWritingSections = wo.sections;
        workbook.wordOrderWritingSkipped = skipped;

        for (const { projectId, cache } of wo.cachesToSave) {
          const proj = byId.get(projectId);
          const prev = (proj?.lesson_pack_json ?? {}) as Partial<LessonPackData>;
          const next: LessonPackData = {
            headerLabel: prev.headerLabel || "26년도 1학기 중간고사 대비",
            vocab: prev.vocab ?? [],
            updatedAt: new Date().toISOString(),
            blankCandidatePool: prev.blankCandidatePool,
            passageSourceHash: prev.passageSourceHash,
            sentenceTranslations: prev.sentenceTranslations,
            wordOrderChunkCache: cache,
            grammarChoiceCache: prev.grammarChoiceCache,
          };
          await supabase
            .from("lesson_material_projects")
            .update({
              lesson_pack_json: next,
              updated_at: new Date().toISOString(),
            })
            .eq("id", projectId);
        }

        if (!workbook.timing) {
          workbook.timing = {
            dataLoadMs,
            translationLookupMs: 0,
            blankSelectionMs: 0,
            pdfRenderMs: 0,
            totalMs: dataLoadMs,
            openAiRequestCount: wo.openAiRequestCount,
          };
        } else {
          workbook.timing.openAiRequestCount =
            (workbook.timing.openAiRequestCount ?? 0) + wo.openAiRequestCount;
        }
      }

      if (!workbook.timing) {
        workbook.timing = {
          dataLoadMs,
          translationLookupMs: 0,
          blankSelectionMs: 0,
          pdfRenderMs: 0,
          totalMs: dataLoadMs,
          openAiRequestCount: 0,
        };
      }
      if (!wantBlank && !wantTf && !wantWordOrder) {
        workbook.timing.openAiRequestCount = 0;
      }
    }

    if (
      wantGrammarChoice &&
      (workbook.grammarChoiceSections?.length ?? 0) === 0
    ) {
      const detail =
        workbook.grammarChoiceSkipped
          ?.map((s) => `「${s.title}」 ${s.reason}`)
          .join(" ") ?? "";
      return {
        ok: false,
        message:
          detail ||
          "어법 선택 결과를 만들지 못했습니다. 지문의 핵심 어법 포인트를 확인해 주세요.",
      };
    }
    if (wantBlank && workbook.blankSections.length === 0) {
      return { ok: false, message: "빈칸 채우기 결과를 만들지 못했습니다." };
    }
    if (wantTf && workbook.sections.length === 0) {
      return { ok: false, message: "T/F 결과를 만들지 못했습니다." };
    }
    if (
      wantSentenceOrder &&
      (workbook.sentenceOrderQuestions?.length ?? 0) === 0
    ) {
      const detail =
        workbook.sentenceOrderSkipped
          ?.map((s) => `「${s.title}」 ${s.reason}`)
          .join(" ") ?? SENTENCE_ORDER_SKIP_TOO_FEW;
      return {
        ok: false,
        message: detail || "문장 순서 배열 결과를 만들지 못했습니다.",
      };
    }
    if (
      wantLineKo &&
      (workbook.lineTranslationSections?.length ?? 0) === 0
    ) {
      return {
        ok: false,
        message:
          "한줄해석 결과를 만들지 못했습니다. 해석이 있는 지문을 선택해 주세요.",
      };
    }
    if (
      wantFullEn &&
      (workbook.fullEnWritingSections?.length ?? 0) === 0
    ) {
      return {
        ok: false,
        message:
          "통문장 영작 결과를 만들지 못했습니다. 해석이 있는 지문을 선택해 주세요.",
      };
    }
    if (
      wantWordOrder &&
      (workbook.wordOrderWritingSections?.length ?? 0) === 0
    ) {
      return {
        ok: false,
        message:
          "어순배열 영작 결과를 만들지 못했습니다. 해석이 있는 지문을 선택해 주세요.",
      };
    }

    return { ok: true, workbook };
  } catch (e) {
    const code =
      e && typeof e === "object" && "code" in e
        ? String((e as { code?: string }).code)
        : undefined;
    return {
      ok: false,
      message: e instanceof Error ? e.message : "워크북 생성 실패",
      ...(code === "MISSING_TRANSLATION"
        ? { code: "MISSING_TRANSLATION" as const }
        : code === "MISSING_LINE_TRANSLATION"
          ? { code: "MISSING_LINE_TRANSLATION" as const }
          : {}),
    };
  }
}

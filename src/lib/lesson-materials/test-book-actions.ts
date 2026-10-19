"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isAcademyFeatureOn } from "@/lib/academies/features";
import { flushAiUsage, withAiUsage } from "@/lib/ai-usage/context";
import { debitLessonCredits, lessonCreditShortfall } from "@/lib/credits/lesson-credits";
import { generateOnePageContent } from "@/lib/lesson-materials/generate-one-page";
import type { LessonPackData } from "@/lib/lesson-materials/generate-lesson-pack";
import type { AnalysisReportData } from "@/lib/lesson-materials/generate-analysis-report";
import { generateAndSaveLessonPackVocabAction } from "@/lib/lesson-materials/lesson-pack-actions";
import { isOnePageContentFresh, onePageSentences, type OnePageContent } from "@/lib/lesson-materials/one-page";
import { patchLessonPack } from "@/lib/lesson-materials/patch-lesson-pack";
import { pickKeySentenceIds } from "@/lib/lesson-materials/key-sentences";
import { generateWorkbookLineTranslation } from "@/lib/lesson-materials/generate-workbook-line-translation";
import { generateWorkbookWordOrderWriting } from "@/lib/lesson-materials/generate-workbook-word-order-writing";
import type { StoredWordOrderChunkCache } from "@/lib/lesson-materials/word-order-chunk-cache";
import type { StoredBlankCandidatePool } from "@/lib/lesson-materials/workbook-blank-cache";
import { refineTestBookVocab } from "@/lib/lesson-materials/generate-test-book";
import {
  TEST_BOOK_MATERIAL_VERSION,
  isTestBookMaterialFresh,
  normalizeTestBookOptions,
  testBookSourceHash,
  type TestBookMaterial,
  type TestBookOptions,
} from "@/lib/lesson-materials/test-book";

type Role = "admin" | "teacher";
type Fail = { ok: false; message: string };

/** 테스트 교재 값(지문당). 같은 지문은 한 번만 받는다. */
const TEST_BOOK_FEATURE = "lesson_test_book";

async function requireTestBook(role: Role) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== role) return { profile: null, error: "권한이 없습니다." };
  if (role === "teacher" && profile.is_active === false) return { profile: null, error: "비활성화된 계정입니다." };
  if (!profile.academy_id) return { profile: null, error: "소속 학원 정보가 없습니다." };
  if (!(await isAcademyFeatureOn(createAdminClient(), profile.academy_id, "test_book"))) {
    return { profile: null, error: "이 학원에서는 테스트 교재를 쓸 수 없습니다." };
  }
  return { profile, error: null as null };
}

async function loadProject(role: Role, profile: { id: string; academy_id: string | null }, projectId: string) {
  const supabase = await createClient();
  let pq = supabase
    .from("lesson_material_projects")
    .select("id,title,source,lesson_pack_json,analysis_report_json")
    .eq("id", projectId)
    .eq("academy_id", profile.academy_id!)
    .is("deleted_at", null);
  if (role === "teacher") pq = pq.or(`teacher_id.eq.${profile.id},created_by.eq.${profile.id}`);
  const { data: project } = await pq.maybeSingle();
  if (!project) return null;
  const { data: items } = await supabase
    .from("lesson_material_items")
    .select("id,english_text,korean_text,order_index")
    .eq("project_id", projectId)
    .order("order_index", { ascending: true });
  return { supabase, project, items: items ?? [] };
}

/**
 * 지문 하나의 테스트 교재 재료를 준비한다.
 * 1. 해석·단어 목록이 없으면 수업용 자료를 먼저 만든다(수업용 자료 값은 그쪽에서 따로).
 * 2. 1장 자료 재료(동반의어·어법 포인트·T/F·요약문)가 없으면 만든다.
 * 3. 단어 정리(품사·지문 속 뜻·파생어), 중요문장(워크북과 같은 규칙), 어순 덩어리(워크북과 같은 캐시).
 * 원문이 그대로면 저장해 둔 것을 쓴다. 값은 같은 지문에 한 번만 받는다.
 */
export async function prepareTestBookPassageAction(
  role: Role,
  input: { projectId: string; forceRegenerate?: boolean }
): Promise<
  | {
      ok: true;
      content: OnePageContent;
      material: TestBookMaterial;
      sentences: Array<{ english: string; korean: string }>;
    }
  | Fail
> {
  const { profile, error } = await requireTestBook(role);
  if (error) return { ok: false, message: error };
  const projectId = String(input.projectId ?? "").trim();
  if (!projectId) return { ok: false, message: "선택된 지문이 없습니다." };

  let loaded = await loadProject(role, profile!, projectId);
  if (!loaded) return { ok: false, message: "지문을 찾을 수 없습니다." };

  const shortfall = await lessonCreditShortfall(profile!.academy_id!, TEST_BOOK_FEATURE);
  if (shortfall) return { ok: false, message: shortfall };

  // 1. 해석·단어 목록
  const pack0 = (loaded.project.lesson_pack_json ?? {}) as Partial<LessonPackData>;
  const missingKorean = loaded.items.some((it) => String(it.english_text ?? "").trim() && !String(it.korean_text ?? "").trim());
  if (missingKorean || !(pack0.vocab ?? []).length) {
    const res = await generateAndSaveLessonPackVocabAction(role, { projectId });
    if (!res.ok) return { ok: false, message: res.message };
    loaded = await loadProject(role, profile!, projectId);
    if (!loaded) return { ok: false, message: "지문을 찾을 수 없습니다." };
  }
  const { supabase, project, items } = loaded;
  const pack = (project.lesson_pack_json ?? {}) as Partial<LessonPackData>;
  const usable = items.filter((it) => String(it.english_text ?? "").trim());
  const sentences = onePageSentences(usable);
  const english = sentences.map((s) => s.english);
  const usage = {
    academyId: profile!.academy_id,
    actorId: profile!.id,
    featureKey: TEST_BOOK_FEATURE,
    usedFor: "test_book",
    projectId,
  };

  try {
    // 2. 1장 자료 재료
    let content = pack.onePageContent;
    if (input.forceRegenerate || !isOnePageContentFresh(content, english)) {
      content = (
        await withAiUsage(usage, () => generateOnePageContent({ title: project.title as string, sentences: english }))
      ).content;
      await patchLessonPack(supabase, projectId, pack, { onePageContent: content });
    }

    // 3. 테스트 교재 재료
    let material = pack.testBookMaterial;
    if (input.forceRegenerate || !isTestBookMaterialFresh(material, english)) {
      const vocab = await withAiUsage(usage, () =>
        refineTestBookVocab({
          title: project.title as string,
          sentences,
          packVocab: pack.vocab ?? [],
          keyHints: content!.vocab.map((v) => ({ surface: v.surface, synonyms: v.synonyms, antonyms: v.antonyms })),
        })
      );

      // 중요문장: 워크북 「중요문장 어순배열」과 같은 규칙(분석서 주제문 → 빈칸 후보 핵심 문장 → 규칙)
      const report = (project.analysis_report_json ?? null) as AnalysisReportData | null;
      const ids = usable.map((it) => String(it.id));
      const keyIds = pickKeySentenceIds({
        sentences: usable.map((it) => ({ id: String(it.id), english: String(it.english_text ?? "") })),
        analysisSentences: report?.sentences ?? null,
        coreSentenceIds: (pack.blankCandidatePool as StoredBlankCandidatePool | undefined)?.coreSentenceIds ?? null,
      });
      const keyIndexes = keyIds.map((id) => ids.indexOf(id)).filter((i) => i >= 0);

      // 어순 덩어리: 워크북과 같은 캐시를 쓰고, 없으면 같은 방법으로 만들어 캐시에 넣는다(워크북도 같은 덩어리를 쓴다)
      const chunks: Array<string[] | null> = sentences.map(() => null);
      const passageInput = {
        projectId,
        title: project.title as string,
        source: (project.source as string | null) ?? null,
        sentences: usable.map((it) => ({
          id: String(it.id),
          english: String(it.english_text ?? ""),
          korean: (it.korean_text as string | null) ?? null,
        })),
        sentenceTranslations: pack.sentenceTranslations ?? [],
        packJson: pack,
        wordOrderChunkCache: (pack.wordOrderChunkCache as StoredWordOrderChunkCache | undefined) ?? null,
      };
      const bilingual = generateWorkbookLineTranslation({ passages: [passageInput] });
      if (bilingual.blocking.length === 0 && keyIds.length) {
        const keySet = new Set(keyIds);
        const wo = await withAiUsage(usage, () =>
          generateWorkbookWordOrderWriting({
            workbookId: `test-book-${projectId}`,
            passages: [passageInput],
            prebuiltLineSections: bilingual.sections
              .map((sec) => ({ ...sec, items: sec.items.filter((it) => keySet.has(it.sentenceId)) }))
              .filter((sec) => sec.items.length > 0),
            prebuiltSkipped: bilingual.skipped,
            prebuiltBlocking: [],
          })
        );
        for (const sec of wo.sections) {
          for (const it of sec.items) {
            const i = ids.indexOf(it.sentenceId);
            if (i >= 0) chunks[i] = it.originalChunks.map((c) => c.text);
          }
        }
        for (const { cache } of wo.cachesToSave) {
          await patchLessonPack(supabase, projectId, pack, { wordOrderChunkCache: cache });
        }
      }

      material = {
        version: TEST_BOOK_MATERIAL_VERSION,
        sourceHash: testBookSourceHash(english),
        vocab,
        keyIndexes,
        chunks,
        createdAt: new Date().toISOString(),
      };
      await patchLessonPack(supabase, projectId, pack, { testBookMaterial: material });
    }
    await flushAiUsage();

    await debitLessonCredits({
      academyId: profile!.academy_id!,
      actorId: profile!.id,
      featureKey: TEST_BOOK_FEATURE,
      projectId,
      idempotencyKey: `${TEST_BOOK_FEATURE}:${projectId}`,
      note: `테스트 교재 · ${project.title}`,
    });
    return { ok: true, content: content!, material: material!, sentences };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "테스트 교재 재료를 만들지 못했습니다." };
  }
}

/** 교재 설정(유형·해석 보기·계획표 등)을 파일에 저장한다. */
export async function saveTestBookOptionsAction(
  role: Role,
  input: { id: string; options: unknown }
): Promise<{ ok: true; options: TestBookOptions } | Fail> {
  const { profile, error } = await requireTestBook(role);
  if (error) return { ok: false, message: error };
  const id = String(input.id ?? "").trim();
  if (!id) return { ok: false, message: "파일을 찾을 수 없습니다." };
  const options = normalizeTestBookOptions(input.options);
  const supabase = await createClient();
  const { data, error: upErr } = await supabase
    .from("lesson_material_documents")
    .update({ payload: { version: 1, options }, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("kind", "test_book")
    .eq("academy_id", profile!.academy_id!)
    .select("id")
    .maybeSingle();
  if (upErr) return { ok: false, message: upErr.message };
  if (!data) return { ok: false, message: "파일을 찾을 수 없습니다." };
  return { ok: true, options };
}

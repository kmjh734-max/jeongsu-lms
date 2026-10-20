"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { persistVocabItems, type VocabItemSaveInput } from "@/lib/vocab/save-items";
import { nextVocabSetOrderIndex } from "@/lib/vocab/reorder-sets";
import { loadTestBookProjects } from "@/lib/lesson-materials/load-material-payloads";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isAcademyFeatureOn } from "@/lib/academies/features";
import { flushAiUsage, withAiUsage } from "@/lib/ai-usage/context";
import { debitLessonCredits, lessonCreditShortfall } from "@/lib/credits/lesson-credits";
import { generateOnePageContent } from "@/lib/lesson-materials/generate-one-page";
import type { LessonPackData } from "@/lib/lesson-materials/generate-lesson-pack";
import type { AnalysisReportData } from "@/lib/lesson-materials/generate-analysis-report";
import { generateAndSaveLessonPackVocabAction } from "@/lib/lesson-materials/lesson-pack-actions";
import { findPhrase, isOnePageContentFresh, onePageSentences, type OnePageContent } from "@/lib/lesson-materials/one-page";
import { patchLessonPack } from "@/lib/lesson-materials/patch-lesson-pack";
import { pickKeySentenceIds } from "@/lib/lesson-materials/key-sentences";
import { generateWorkbookLineTranslation } from "@/lib/lesson-materials/generate-workbook-line-translation";
import { generateWorkbookWordOrderWriting } from "@/lib/lesson-materials/generate-workbook-word-order-writing";
import type { StoredWordOrderChunkCache } from "@/lib/lesson-materials/word-order-chunk-cache";
import type { StoredBlankCandidatePool } from "@/lib/lesson-materials/workbook-blank-cache";
import { glossTestBookChunks, refineTestBookVocab } from "@/lib/lesson-materials/generate-test-book";
import {
  KEY_SENTENCE_VERSION,
  analyzeKeySentences,
  keySentenceNorm,
  type KeySentence,
  type KeySentenceAnalysis,
} from "@/lib/grammar/key-sentence-analysis";
import {
  TEST_BOOK_MATERIAL_VERSION,
  TEST_BOOK_VOCAB_VERSION,
  isTestBookMaterialFresh,
  isTestBookMaterialSameSource,
  mergeTestBookVocabHints,
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

/**
 * 지문 문장 분석. 출처가 교과서 본문 이름과 같고 저장해 둔 분석이 지금 규칙이면 그것을(문장은 글자로 맞춘다),
 * 아니면 같은 규칙으로 계산한다. 돌려주는 sentences는 지문 문장 차례(못 맞춘 문장은 계산한 값).
 */
async function loadKeySentenceAnalysis(
  supabase: Awaited<ReturnType<typeof createClient>>,
  academyId: string,
  source: string | null,
  english: string[]
): Promise<KeySentenceAnalysis> {
  const live = analyzeKeySentences(english, source);
  if (!source?.trim()) return live;
  const { data } = await supabase
    .from("textbook_passages")
    .select("key_sentences")
    .eq("academy_id", academyId)
    .eq("label", source.trim())
    .limit(1)
    .maybeSingle();
  const stored = data?.key_sentences as KeySentenceAnalysis | null | undefined;
  if (!stored || stored.version !== KEY_SENTENCE_VERSION || !Array.isArray(stored.sentences)) return live;
  const byText = new Map<string, KeySentence>(stored.sentences.map((s) => [keySentenceNorm(s.english), s] as const));
  return {
    ...stored,
    sentences: english.map((e, i) => byText.get(keySentenceNorm(e)) ?? live.sentences[i]!),
  };
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
  input: {
    projectId: string;
    forceRegenerate?: boolean;
    /**
     * 기능마다 다시 만들기(선생님 2026-10-20): 단어 정리·직독직해·1장 자료 재료(동반의어·T/F·지칭 등) 가운데
     * 고른 것만 새로 만든다. 같은 지문의 테스트 교재 값은 다시 받지 않는다.
     */
    regenerate?: Array<"vocab" | "gloss" | "content">;
  }
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
    const again = new Set(input.forceRegenerate ? ["vocab", "gloss", "content"] : (input.regenerate ?? []));
    if (again.has("content") || !isOnePageContentFresh(content, english)) {
      content = (
        await withAiUsage(usage, () => generateOnePageContent({ title: project.title as string, sentences: english }))
      ).content;
      await patchLessonPack(supabase, projectId, pack, { onePageContent: content });
    }

    // 3. 테스트 교재 재료
    let material = pack.testBookMaterial;
    if (again.size || !isTestBookMaterialFresh(material, english)) {
      // 원문이 그대로면(재료 버전만 바뀌었으면) 단어 정리는 다시 쓰고 규칙으로 만드는 것만 새로
      const vocab =
        !again.has("vocab") &&
        isTestBookMaterialSameSource(material, english) &&
        material.vocabVersion === TEST_BOOK_VOCAB_VERSION
          ? material.vocab
          : await withAiUsage(usage, () =>
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
      // 어순배열 문장: 그 과 단원문법이 든 문장(꼭)과 구문이 어려운 문장. 교과서 본문은 저장해 둔
      // 분석(textbook_passages.key_sentences)을 쓰고, 없거나 옛 규칙이면 같은 규칙으로 바로 계산한다.
      const analysis = await loadKeySentenceAnalysis(
        supabase,
        profile!.academy_id!,
        (project.source as string | null) ?? null,
        sentences.map((s) => s.english)
      );
      const unitKey = analysis.unitKey;
      const usableAt = (si: number) => {
        const w = sentences[si]!.english.split(/\s+/).length;
        return w >= 6 && w <= 40 && !!sentences[si]!.korean.trim();
      };
      const unitHits = analysis.sentences
        .map((s, si) => ({ si, grammar: s?.unitGrammar ?? [] }))
        .filter((h) => h.grammar.length && usableAt(h.si))
        .slice(0, 5);
      const hardHits = analysis.sentences
        .map((s, si) => ({ si, structures: s?.structures ?? [], score: s?.score ?? 0, hard: !!s?.hard }))
        .filter((h) => h.hard && usableAt(h.si) && !unitHits.some((u) => u.si === h.si))
        .sort((a, b) => b.score - a.score)
        .slice(0, 2)
        .map(({ si, structures }) => ({ si, structures }));
      const keyIndexes = [
        ...new Set([
          ...unitHits.map((h) => h.si),
          ...hardHits.map((h) => h.si),
          ...keyIds.map((id) => ids.indexOf(id)).filter((i) => i >= 0),
        ]),
      ].sort((a, b) => a - b);
      const chunkKeySet = new Set(keyIndexes.map((i) => ids[i]!));

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
      if (bilingual.blocking.length === 0 && keyIndexes.length) {
        const keySet = chunkKeySet;
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

      // 직독직해 덩어리: 원문이 같고 이미 있으면 다시 쓰고, 없으면 만든다(gpt-4o-mini, 1원 아래)
      const oldGloss = material && isTestBookMaterialSameSource(material, english) && !again.has("gloss") ? material.chunkGloss : undefined;
      const chunkGloss = oldGloss?.length
        ? oldGloss
        : await withAiUsage(usage, () => glossTestBookChunks({ title: project.title as string, sentences })).catch(() => undefined);

      material = {
        version: TEST_BOOK_MATERIAL_VERSION,
        chunkGloss,
        vocabVersion: TEST_BOOK_VOCAB_VERSION,
        sourceHash: testBookSourceHash(english),
        vocab,
        keyIndexes,
        chunks,
        unitKey,
        unitHits: unitHits.sort((a, b) => a.si - b.si),
        hardHits: hardHits.sort((a, b) => a.si - b.si),
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
    return { ok: true, content: content!, material: mergeTestBookVocabHints(material!, content), sentences };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "테스트 교재 재료를 만들지 못했습니다." };
  }
}

/** 테스트지 뽑기 값(지문·유형당). 저장된 재료로 조립만 하므로 원가는 없다 — 마이그레이션 194. */
const TEST_DRAW_FEATURE = "lesson_test_draw";

/**
 * 테스트지를 뽑을 때 값을 받는다(선생님 2026-10-20: 새로 뽑을 때마다 기능에 따라). 뽑은 지문 수 × 유형 수.
 * 같은 뽑기(seed)는 두 번 받지 않는다. 모자라면 뽑지 않는다.
 */
export async function chargeTestDrawAction(
  role: Role,
  input: { seed: string; projectIds: string[]; typeCount: number }
): Promise<{ ok: true } | Fail> {
  const { profile, error } = await requireTestBook(role);
  if (error) return { ok: false, message: error };
  const seed = String(input.seed ?? "").trim().slice(0, 80);
  const passages = [...new Set((input.projectIds ?? []).map(String).filter(Boolean))].length;
  const types = Math.max(0, Math.floor(Number(input.typeCount) || 0));
  if (!seed || !passages || !types) return { ok: false, message: "뽑을 지문과 유형을 골라 주세요." };
  const quantity = passages * types;
  const shortfall = await lessonCreditShortfall(profile!.academy_id!, TEST_DRAW_FEATURE, quantity);
  if (shortfall) return { ok: false, message: shortfall };
  const ok = await debitLessonCredits({
    academyId: profile!.academy_id!,
    actorId: profile!.id,
    featureKey: TEST_DRAW_FEATURE,
    quantity,
    idempotencyKey: `${TEST_DRAW_FEATURE}:${seed}`,
    note: `테스트지 뽑기 · 지문 ${passages}개 × 유형 ${types}개`,
  });
  return ok ? { ok: true } : { ok: false, message: "크레딧을 차감하지 못했습니다. 잠시 뒤 다시 눌러 주세요." };
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
  const { data: cur } = await supabase.from("lesson_material_documents").select("payload").eq("id", id).maybeSingle();
  const prev = (cur?.payload as Record<string, unknown> | null) ?? {};
  const { data, error: upErr } = await supabase
    .from("lesson_material_documents")
    .update({ payload: { ...prev, version: 1, options }, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("kind", "test_book")
    .eq("academy_id", profile!.academy_id!)
    .select("id")
    .maybeSingle();
  if (upErr) return { ok: false, message: upErr.message };
  if (!data) return { ok: false, message: "파일을 찾을 수 없습니다." };
  return { ok: true, options };
}

/**
 * 교재의 전체 단어(지문마다 단어 정리, 같은 낱말은 처음 지문 것)를 단어학습 단어장으로 등록한다.
 * 단어학습 「테스트 교재」 폴더에 교재 이름으로 만들고, 다시 누르면 같은 단어장을 새 내용으로 맞춘다
 * (파일 payload.vocabSetId). 예문은 그 단어가 나온 지문 문장과 해석이다. 값은 들지 않는다.
 */
export async function registerTestBookVocabAction(
  role: Role,
  input: { docId: string | null; title: string; projectIds: string[] }
): Promise<{ ok: true; setId: string; count: number; created: boolean } | Fail> {
  const { profile, error } = await requireTestBook(role);
  if (error) return { ok: false, message: error };
  const projectIds = [...new Set((input.projectIds ?? []).map((s) => String(s).trim()).filter(Boolean))];
  if (!projectIds.length) return { ok: false, message: "선택된 지문이 없습니다." };
  const supabase = await createClient();
  const projects = await loadTestBookProjects(supabase, projectIds);

  const seen = new Set<string>();
  const items: VocabItemSaveInput[] = [];
  for (const p of projects) {
    for (const row of p.material?.vocab ?? []) {
      const k = row.word.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      const s = p.sentences.find((x) => findPhrase(x.english, row.word));
      items.push({
        word: row.word,
        meaning: row.meaning,
        part_of_speech: row.pos || null,
        synonyms: row.synonyms.join(", ") || undefined,
        antonyms: row.antonyms.join(", ") || undefined,
        example_sentence: s?.english,
        example_meaning: s?.korean || undefined,
        order_index: items.length,
      });
    }
  }
  if (!items.length) return { ok: false, message: "단어 정리가 아직 없습니다. 교재를 먼저 만들어 주세요." };

  const title = `${String(input.title ?? "").trim() || "테스트 교재"} · 전체 단어`;
  const docId = input.docId?.trim() || null;
  let payload: Record<string, unknown> = {};
  if (docId) {
    const { data } = await supabase.from("lesson_material_documents").select("payload").eq("id", docId).eq("kind", "test_book").maybeSingle();
    payload = (data?.payload as Record<string, unknown> | null) ?? {};
  }

  // 지난번 등록한 단어장이 아직 있으면 그것을 고친다
  let setId = typeof payload.vocabSetId === "string" ? payload.vocabSetId : null;
  if (setId) {
    const { data } = await supabase.from("vocab_sets").select("id").eq("id", setId).maybeSingle();
    if (!data) setId = null;
  }
  const created = !setId;
  if (!setId) {
    const { data: folder } = await supabase
      .from("vocab_folders")
      .select("id")
      .eq("academy_id", profile!.academy_id!)
      .eq("name", "테스트 교재")
      .limit(1)
      .maybeSingle();
    let folderId = (folder?.id as string | undefined) ?? null;
    if (!folderId) {
      const { data: made, error: fErr } = await supabase
        .from("vocab_folders")
        .insert({ name: "테스트 교재", teacher_id: role === "teacher" ? profile!.id : null, created_by: profile!.id, academy_id: profile!.academy_id })
        .select("id")
        .single();
      if (fErr) return { ok: false, message: fErr.message };
      folderId = made.id as string;
    }
    const { data: set, error: sErr } = await supabase
      .from("vocab_sets")
      .insert({
        title,
        description: "테스트 교재에서 등록한 단어장",
        folder_id: folderId,
        order_index: await nextVocabSetOrderIndex(supabase, folderId),
        teacher_id: profile!.id,
        created_by: profile!.id,
        is_published: true,
        academy_id: profile!.academy_id,
      })
      .select("id")
      .single();
    if (sErr) return { ok: false, message: sErr.message };
    setId = set.id as string;
  } else {
    await supabase.from("vocab_sets").update({ title }).eq("id", setId);
  }

  const saved = await persistVocabItems(supabase, setId, items);
  if (!saved.ok) return { ok: false, message: saved.message };
  if (docId) {
    await supabase
      .from("lesson_material_documents")
      .update({ payload: { ...payload, vocabSetId: setId } })
      .eq("id", docId)
      .eq("kind", "test_book");
  }
  revalidatePath(`/${role}/vocab`);
  return { ok: true, setId, count: items.length, created };
}

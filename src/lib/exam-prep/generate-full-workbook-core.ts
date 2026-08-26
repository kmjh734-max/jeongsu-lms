/**
 * API Route용 코어 — "use server" 없이 일반 서버 함수.
 * 원클릭 생성은 phase로 나눠 호출해 Vercel/CDN 504를 피한다.
 *  - shell: 규칙으로 1~10 + 워크북 (빠름)
 *  - ai56: 어법·어휘 AI 보강
 *  - ai7: 오류찾기 AI 보강
 */
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import {
  buildStage10Drafts,
  buildStage3Drafts,
  buildStage5Drafts,
  buildStage6GrammarDrafts,
  buildStage6VocabDrafts,
  buildStage7Seed,
  buildStage8Drafts,
  buildStage9Config,
  combineStage6Categories,
  mergeStage6Drafts,
  stage6AiCoverageOk,
  type SeedSentence,
} from "@/lib/exam-prep/auto-seed-stages";
import {
  generateStage6WithAi,
  generateStage7WithAi,
} from "@/lib/exam-prep/generate-stage67-grammar-ai";
import { EXAM_PREP_MODEL_PRIMARY } from "@/lib/exam-prep/exam-prep-openai";
import { createWorkbookAction, enrichPassageSentencesAction } from "@/lib/exam-prep/staff-actions";
import { setStage2PublishedAction } from "@/lib/exam-prep/stage2-staff-actions";
import { saveStage3BlanksAction, setStage3PublishedAction } from "@/lib/exam-prep/stage3-staff-actions";
import {
  ensureDefaultStage4SettingsAction,
  setStage4PublishedAction,
} from "@/lib/exam-prep/stage4-staff-actions";
import { saveStage5ItemsAction, setStage5PublishedAction } from "@/lib/exam-prep/stage5-staff-actions";
import { saveStage6ItemsAction, setStage6PublishedAction } from "@/lib/exam-prep/stage6-staff-actions";
import {
  saveStage7CandidatesAction,
  saveStage7DisplayTextsAction,
  setStage7PublishedAction,
} from "@/lib/exam-prep/stage7-staff-actions";
import { saveStage8GroupsAction, setStage8PublishedAction } from "@/lib/exam-prep/stage8-staff-actions";
import { saveStage9ConfigAction, setStage9PublishedAction } from "@/lib/exam-prep/stage9-staff-actions";
import { saveStage10ItemsAction, setStage10PublishedAction } from "@/lib/exam-prep/stage10-staff-actions";

export type WorkbookGenPhase = "shell" | "ai56" | "ai7" | "full";

export type WorkbookGenResult =
  | {
      ok: true;
      workbookId?: string;
      phase: WorkbookGenPhase;
      notes: string[];
      message: string;
    }
  | {
      ok: false;
      message: string;
      notes?: string[];
      phase?: WorkbookGenPhase;
    };

async function requireStaff() {
  if (!isExamPrepEnabled()) {
    return { ok: false as const, message: "기능을 사용할 수 없습니다." };
  }
  const profile = await getCurrentProfile();
  if (
    !profile ||
    (profile.role !== "admin" && profile.role !== "teacher") ||
    !profile.academy_id
  ) {
    return { ok: false as const, message: "권한이 없습니다." };
  }
  return { ok: true as const, profile };
}

async function loadPassageContext(passageId: string, academyId: string) {
  const supabase = await createClient();
  const { data: passage } = await supabase
    .from("exam_passages")
    .select("id, title, status")
    .eq("id", passageId)
    .eq("academy_id", academyId)
    .maybeSingle();
  if (!passage) return { ok: false as const, message: "지문을 찾을 수 없습니다." };

  const { count } = await supabase
    .from("exam_passage_sentences")
    .select("id", { count: "exact", head: true })
    .eq("passage_id", passageId);
  if (!count || count < 1) {
    return {
      ok: false as const,
      message: "문장이 없습니다. 지문 본문을 저장해 문장을 분리해 주세요.",
    };
  }

  return { ok: true as const, supabase, passage };
}

async function ensureKorean(
  passageId: string,
  notes: string[]
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createClient();
  const { data: before } = await supabase
    .from("exam_passage_sentences")
    .select("id, korean_text")
    .eq("passage_id", passageId);
  const needKo = (before ?? []).some((s) => !String(s.korean_text ?? "").trim());
  if (needKo) {
    const enrich = await enrichPassageSentencesAction(passageId);
    if (!enrich.ok) {
      return { ok: false, message: `한글 해석 생성 실패: ${enrich.message}` };
    }
    notes.push(
      `1단계 해석 AI(${EXAM_PREP_MODEL_PRIMARY}) ${
        "updated" in enrich ? enrich.updated : 0
      }문장`
    );
  } else {
    notes.push("1단계 해석 이미 있음 → AI 생략");
  }

  const { data: after } = await supabase
    .from("exam_passage_sentences")
    .select("id, korean_text")
    .eq("passage_id", passageId);
  const still = (after ?? []).filter((s) => !String(s.korean_text ?? "").trim());
  if (still.length > 0) {
    return {
      ok: false,
      message: `우리말 해석이 없는 문장이 ${still.length}개 있습니다. 해석을 채운 뒤 다시 시도해 주세요.`,
    };
  }
  return { ok: true };
}

async function loadSentences(passageId: string): Promise<SeedSentence[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("exam_passage_sentences")
    .select(
      "id, english_text, korean_text, sentence_order, paragraph_number, vocabulary, is_important_writing"
    )
    .eq("passage_id", passageId)
    .order("sentence_order", { ascending: true });
  return (data ?? []) as SeedSentence[];
}

async function tryPublish(
  publish: boolean,
  notes: string[],
  stage: number,
  fn: () => Promise<{ ok: boolean; message?: string }>
) {
  if (!publish) return;
  const r = await fn();
  if (!r.ok) notes.push(`${stage}단계 공개 보류: ${r.message ?? "조건 미충족"}`);
  else notes.push(`${stage}단계 공개 완료`);
}

function revalidateWorkbookPaths(passageId: string) {
  revalidatePath(`/admin/exam-prep/passages/${passageId}`);
  revalidatePath(`/teacher/exam-prep/passages/${passageId}`);
  revalidatePath("/admin/exam-prep/workbooks");
  revalidatePath("/teacher/exam-prep/workbooks");
}

/** 규칙만으로 2~10단계 + 워크북 생성 (AI 없음 → 504 회피) */
async function runShellPhase(input: {
  passageId: string;
  title?: string;
  publishStages?: boolean;
  academyId: string;
}): Promise<WorkbookGenResult> {
  const notes: string[] = [];
  const publish = input.publishStages !== false;
  const passageId = input.passageId;

  const ctx = await loadPassageContext(passageId, input.academyId);
  if (!ctx.ok) return { ok: false, message: ctx.message, phase: "shell", notes };

  const ko = await ensureKorean(passageId, notes);
  if (!ko.ok) return { ok: false, message: ko.message, phase: "shell", notes };

  const sentences = await loadSentences(passageId);
  notes.push("규칙 생성(shell) · 어법·어휘·오류는 이어서 AI 보강");

  await setStage2PublishedAction(passageId, false);
  notes.push("우리말 빈칸 단계 생략");

  {
    const s3 = buildStage3Drafts(sentences);
    if (s3.length > 0) {
      const r = await saveStage3BlanksAction(passageId, s3);
      if (!r.ok) return { ok: false, message: `2단계(영문빈칸): ${r.message}`, phase: "shell", notes };
      notes.push(`2단계 영문빈칸 규칙 ${s3.length}개`);
      await tryPublish(publish, notes, 3, () => setStage3PublishedAction(passageId, true));
    }
  }

  {
    const r = await ensureDefaultStage4SettingsAction(passageId);
    if (!r.ok) return { ok: false, message: `3단계(해석): ${r.message}`, phase: "shell", notes };
    notes.push(`3단계 해석 설정 ${"created" in r ? r.created : 0}개`);
    await tryPublish(publish, notes, 4, () => setStage4PublishedAction(passageId, true));
  }

  {
    const s5 = buildStage5Drafts(sentences);
    if (s5.length > 0) {
      const r = await saveStage5ItemsAction(passageId, s5);
      if (!r.ok) return { ok: false, message: `4단계(동사): ${r.message}`, phase: "shell", notes };
      notes.push(`4단계 동사 규칙 ${s5.length}문항`);
      await tryPublish(publish, notes, 5, () => setStage5PublishedAction(passageId, true));
    }
  }

  {
    const ids = sentences.map((s) => s.id);
    const plantG = buildStage6GrammarDrafts(sentences);
    const plantV = buildStage6VocabDrafts(sentences);
    const grammar = mergeStage6Drafts(plantG, plantG, ids, {
      category: "grammar",
      minPerSentence: 2,
    });
    const vocab = mergeStage6Drafts(plantV, plantV, ids, {
      category: "vocabulary",
      minPerSentence: 1,
    });
    const s6 = combineStage6Categories(grammar, vocab, ids);
    if (s6.length > 0) {
      const r = await saveStage6ItemsAction(passageId, s6);
      if (!r.ok) return { ok: false, message: `5·6단계: ${r.message}`, phase: "shell", notes };
      notes.push(
        `5·6단계 규칙 ${grammar.length}어법+${vocab.length}어휘 (문장당 복수 포인트)`
      );
      await tryPublish(publish, notes, 6, () => setStage6PublishedAction(passageId, true));
    }
  }

  {
    const seed7 = buildStage7Seed(sentences);
    const d = await saveStage7DisplayTextsAction(passageId, seed7.displays);
    if (!d.ok) return { ok: false, message: `7단계 표시문장: ${d.message}`, phase: "shell", notes };
    if (seed7.candidates.length > 0) {
      const r = await saveStage7CandidatesAction(
        passageId,
        seed7.candidates,
        seed7.requiredErrorCount
      );
      if (!r.ok) {
        notes.push(`7단계 규칙 보류: ${r.message}`);
      } else {
        notes.push(
          `7단계 규칙 오류 ${seed7.requiredErrorCount}개 (AI 보강 예정)`
        );
        await tryPublish(publish, notes, 7, () => setStage7PublishedAction(passageId, true));
      }
    }
  }

  {
    const s8 = buildStage8Drafts(sentences);
    if (s8.length > 0) {
      const r = await saveStage8GroupsAction(passageId, s8);
      if (!r.ok) notes.push(`8단계 보류: ${r.message}`);
      else {
        notes.push(`8단계 규칙 ${s8.length}문항`);
        await tryPublish(publish, notes, 8, () => setStage8PublishedAction(passageId, true));
      }
    }
  }

  const s9 = buildStage9Config(sentences);
  if (s9) {
    const r = await saveStage9ConfigAction(passageId, s9, { reshuffleLabels: true });
    if (!r.ok) notes.push(`9단계 보류: ${r.message}`);
    else {
      notes.push(`9단계 문단배열 ${s9.blocks.length}블록`);
      await tryPublish(publish, notes, 9, () => setStage9PublishedAction(passageId, true));
    }
  }

  {
    const s10 = buildStage10Drafts(sentences);
    if (s10.length > 0) {
      const r = await saveStage10ItemsAction(passageId, s10);
      if (!r.ok) notes.push(`10단계 보류: ${r.message}`);
      else {
        notes.push(`10단계 규칙 ${s10.length}문항`);
        await tryPublish(publish, notes, 10, () => setStage10PublishedAction(passageId, true));
      }
    }
  }

  const title =
    (input.title ?? "").trim() || `${ctx.passage.title} · 10단계 WORKBOOK`;
  const wb = await createWorkbookAction({
    passage_id: passageId,
    title,
    preset_type: "custom",
    step_numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  });
  if (!wb.ok) {
    return {
      ok: false,
      message: `단계 설정은 저장됐지만 워크북 생성 실패: ${wb.message}`,
      phase: "shell",
      notes,
    };
  }

  revalidateWorkbookPaths(passageId);
  return {
    ok: true,
    workbookId: wb.id,
    phase: "shell",
    notes,
    message: "규칙 워크북 생성 완료. 어법·어휘·오류 AI 보강 중…",
  };
}

async function runAi56Phase(input: {
  passageId: string;
  publishStages?: boolean;
  academyId: string;
}): Promise<WorkbookGenResult> {
  const notes: string[] = [];
  const publish = input.publishStages !== false;
  const passageId = input.passageId;

  const ctx = await loadPassageContext(passageId, input.academyId);
  if (!ctx.ok) return { ok: false, message: ctx.message, phase: "ai56", notes };

  const sentences = await loadSentences(passageId);
  if (sentences.some((s) => !String(s.korean_text ?? "").trim())) {
    return {
      ok: false,
      message: "해석이 비어 있습니다. shell 단계를 먼저 실행해 주세요.",
      phase: "ai56",
      notes,
    };
  }

  const ids = sentences.map((s) => s.id);
  const plantG = buildStage6GrammarDrafts(sentences);
  const plantV = buildStage6VocabDrafts(sentences);

  // 어법만 지문분석→AI (혼합+어휘분석은 504/장시간 원인). 어휘는 규칙 유지.
  const aiG = await generateStage6WithAi(sentences, "grammar", { quality: true });
  const useAiG = aiG.source === "ai" && aiG.drafts.length > 0;

  const grammar = mergeStage6Drafts(
    useAiG ? aiG.drafts : plantG,
    plantG,
    ids,
    { category: "grammar", minPerSentence: 2 }
  );
  const vocab = mergeStage6Drafts(plantV, plantV, ids, {
    category: "vocabulary",
    minPerSentence: 1,
  });
  const s6 = combineStage6Categories(grammar, vocab, ids);
  const gCover = new Set(grammar.map((d) => d.sentence_id)).size;
  const vCover = new Set(vocab.map((d) => d.sentence_id)).size;
  const gOk = stage6AiCoverageOk(grammar, sentences.length, "grammar");
  const vOk = stage6AiCoverageOk(vocab, sentences.length, "vocabulary");

  notes.push(
    `5단계 어법 ${useAiG ? "분석→AI" : "규칙"} ${grammar.length} · ${gCover}/${sentences.length}${gOk ? " ✓" : ""}${aiG.error && !useAiG ? ` · ${aiG.error}` : ""}`
  );
  notes.push(
    `6단계 어휘 규칙 ${vocab.length} · ${vCover}/${sentences.length}${vOk ? " ✓" : ""}`
  );

  if (s6.length > 0) {
    const r = await saveStage6ItemsAction(passageId, s6);
    if (!r.ok) return { ok: false, message: `5·6단계: ${r.message}`, phase: "ai56", notes };
    await tryPublish(publish, notes, 6, () => setStage6PublishedAction(passageId, true));
  }

  revalidateWorkbookPaths(passageId);
  return {
    ok: true,
    phase: "ai56",
    notes,
    message: "어법 AI 보강 완료",
  };
}

async function runAi7Phase(input: {
  passageId: string;
  publishStages?: boolean;
  academyId: string;
}): Promise<WorkbookGenResult> {
  const notes: string[] = [];
  const publish = input.publishStages !== false;
  const passageId = input.passageId;

  const ctx = await loadPassageContext(passageId, input.academyId);
  if (!ctx.ok) return { ok: false, message: ctx.message, phase: "ai7", notes };

  const sentences = await loadSentences(passageId);
  const ai7 = await generateStage7WithAi(sentences, { fast: true });
  const seed7 =
    ai7.source === "ai" && ai7.candidates.some((c) => c.is_error)
      ? ai7
      : buildStage7Seed(sentences);

  if (ai7.source === "ai") {
    notes.push(`7단계 AI 오류 ${seed7.requiredErrorCount}개`);
  } else if (ai7.error) {
    notes.push(`7단계 AI 실패→규칙: ${ai7.error}`);
  }

  const d = await saveStage7DisplayTextsAction(passageId, seed7.displays);
  if (!d.ok) return { ok: false, message: `7단계 표시문장: ${d.message}`, phase: "ai7", notes };

  if (seed7.candidates.length > 0) {
    const r = await saveStage7CandidatesAction(
      passageId,
      seed7.candidates,
      seed7.requiredErrorCount
    );
    if (!r.ok) {
      notes.push(`7단계 후보 저장 보류: ${r.message}`);
    } else {
      notes.push(
        `7단계 오류 ${seed7.requiredErrorCount}개 / 후보 ${seed7.candidates.length}개`
      );
      await tryPublish(publish, notes, 7, () => setStage7PublishedAction(passageId, true));
    }
  }

  revalidateWorkbookPaths(passageId);
  return {
    ok: true,
    phase: "ai7",
    notes,
    message: "7단계 AI 보강 완료",
  };
}

/**
 * phase별 생성. 클라이언트가 shell → ai56 → ai7 순으로 호출.
 * full은 하위 호환(한 요청에 전부) — 504 위험 있어 권장하지 않음.
 */
export async function generateExamPrepWorkbookPhase(input: {
  passageId: string;
  title?: string;
  publishStages?: boolean;
  phase?: WorkbookGenPhase;
}): Promise<WorkbookGenResult> {
  try {
    const auth = await requireStaff();
    if (!auth.ok) return auth;

    const phase: WorkbookGenPhase = input.phase ?? "shell";
    const base = {
      passageId: input.passageId,
      title: input.title,
      publishStages: input.publishStages !== false,
      academyId: auth.profile.academy_id!,
    };

    if (phase === "shell") return await runShellPhase(base);
    if (phase === "ai56") return await runAi56Phase(base);
    if (phase === "ai7") return await runAi7Phase(base);

    // full: shell + ai (레거시). 타임아웃 위험.
    const shell = await runShellPhase(base);
    if (!shell.ok) return shell;
    const notes = [...shell.notes];
    const ai56 = await runAi56Phase(base);
    if (ai56.ok) notes.push(...ai56.notes);
    else notes.push(`ai56 보류: ${ai56.message}`);
    const ai7 = await runAi7Phase(base);
    if (ai7.ok) notes.push(...ai7.notes);
    else notes.push(`ai7 보류: ${ai7.message}`);

    return {
      ok: true,
      workbookId: shell.workbookId,
      phase: "full",
      notes,
      message: "1~10단계 워크북을 생성했습니다.",
    };
  } catch (e) {
    console.error("[generateExamPrepWorkbookPhase]", e);
    return {
      ok: false,
      message:
        e instanceof Error
          ? e.message.slice(0, 400)
          : "워크북 생성 중 오류가 발생했습니다.",
    };
  }
}

/** @deprecated use generateExamPrepWorkbookPhase — 하위 호환 */
export async function generateFullExamPrepWorkbook(input: {
  passageId: string;
  title?: string;
  publishStages?: boolean;
}) {
  const result = await generateExamPrepWorkbookPhase({
    ...input,
    phase: "full",
  });
  if (!result.ok) return result;
  return {
    ok: true as const,
    workbookId: result.workbookId!,
    notes: result.notes,
    message: result.message,
  };
}

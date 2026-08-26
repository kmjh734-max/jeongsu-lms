/**
 * API Route용 코어 — "use server" 없이 일반 서버 함수.
 * (Route Handler에서 Server Action 모듈을 직접 import하면
 *  Vercel에서 비JSON 플랫폼 오류가 나는 경우가 있어 분리함)
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

/**
 * 지문 설정 후 원클릭:
 * 1) 한글 해석·어휘 AI 채우기(빈칸만)
 * 2) 2~10단계 문제 초안 자동 생성·저장·공개
 * 3) 1~10단계 워크북 생성
 */
export async function generateFullExamPrepWorkbook(input: {
  passageId: string;
  title?: string;
  publishStages?: boolean;
}) {
  try {
    return await generateFullExamPrepWorkbookInner(input);
  } catch (e) {
    console.error("[generateFullExamPrepWorkbook]", e);
    return {
      ok: false as const,
      message:
        e instanceof Error
          ? e.message.slice(0, 400)
          : "워크북 생성 중 오류가 발생했습니다.",
    };
  }
}

async function generateFullExamPrepWorkbookInner(input: {
  passageId: string;
  title?: string;
  publishStages?: boolean;
}) {
  const auth = await requireStaff();
  if (!auth.ok) return auth;

  const passageId = input.passageId;
  const publish = input.publishStages !== false;
  const notes: string[] = [];
  const supabase = await createClient();

  const { data: passage } = await supabase
    .from("exam_passages")
    .select("id, title, status")
    .eq("id", passageId)
    .eq("academy_id", auth.profile.academy_id)
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

  // 1) 한글 해석 — 비어 있을 때만 AI (이미 있으면 API 생략)
  const { data: before } = await supabase
    .from("exam_passage_sentences")
    .select("id, korean_text")
    .eq("passage_id", passageId);
  const needKo = (before ?? []).some((s) => !String(s.korean_text ?? "").trim());
  if (needKo) {
    const enrich = await enrichPassageSentencesAction(passageId);
    if (!enrich.ok) {
      return {
        ok: false as const,
        message: `한글 해석 생성 실패: ${enrich.message}`,
      };
    }
    notes.push(
      `1단계 해석 AI(${EXAM_PREP_MODEL_PRIMARY}) ${
        "updated" in enrich ? enrich.updated : 0
      }문장`
    );
  } else {
    notes.push("1단계 해석 이미 있음 → AI 생략");
  }

  const { data: sentenceRows } = await supabase
    .from("exam_passage_sentences")
    .select(
      "id, english_text, korean_text, sentence_order, paragraph_number, vocabulary, is_important_writing"
    )
    .eq("passage_id", passageId)
    .order("sentence_order", { ascending: true });

  const sentences = (sentenceRows ?? []) as SeedSentence[];
  const stillMissingKo = sentences.filter((s) => !String(s.korean_text ?? "").trim());
  if (stillMissingKo.length > 0) {
    return {
      ok: false as const,
      message: `우리말 해석이 없는 문장이 ${stillMissingKo.length}개 있습니다. 해석을 채운 뒤 다시 시도해 주세요.`,
    };
  }

  async function tryPublish(
    stage: number,
    fn: () => Promise<{ ok: boolean; message?: string }>
  ) {
    if (!publish) return;
    const r = await fn();
    if (!r.ok) notes.push(`${stage}단계 공개 보류: ${r.message ?? "조건 미충족"}`);
    else notes.push(`${stage}단계 공개 완료`);
  }

  // 원클릭: 규칙으로 충분한 단계는 AI 생략, 어법·어휘·오류찾기만 경량 AI(병렬)
  notes.push(
    `빠른 생성 · AI는 5·6·7단계만 (medium) · 모델 ${EXAM_PREP_MODEL_PRIMARY}`
  );

  await setStage2PublishedAction(passageId, false);
  notes.push("우리말 빈칸 단계 생략");

  {
    const s3 = buildStage3Drafts(sentences);
    if (s3.length > 0) {
      const r = await saveStage3BlanksAction(passageId, s3);
      if (!r.ok) return { ok: false as const, message: `2단계(영문빈칸): ${r.message}` };
      notes.push(`2단계 영문빈칸 규칙 ${s3.length}개`);
      await tryPublish(3, () => setStage3PublishedAction(passageId, true));
    } else {
      notes.push("2단계 영문빈칸: 생성할 빈칸 없음");
    }
  }

  {
    const r = await ensureDefaultStage4SettingsAction(passageId);
    if (!r.ok) return { ok: false as const, message: `3단계(해석): ${r.message}` };
    notes.push(`3단계 해석 설정 ${"created" in r ? r.created : 0}개`);
    await tryPublish(4, () => setStage4PublishedAction(passageId, true));
  }

  {
    const s5 = buildStage5Drafts(sentences);
    if (s5.length > 0) {
      const r = await saveStage5ItemsAction(passageId, s5);
      if (!r.ok) return { ok: false as const, message: `4단계(동사): ${r.message}` };
      notes.push(`4단계 동사 규칙 ${s5.length}문항`);
      await tryPublish(5, () => setStage5PublishedAction(passageId, true));
    }
  }

  {
    const ids = sentences.map((s) => s.id);
    const plantG = buildStage6GrammarDrafts(sentences);
    const plantV = buildStage6VocabDrafts(sentences);

    // 어법·어휘(혼합 1회) + 7단계 오류찾기 — 병렬·fast
    const [ai56, ai7] = await Promise.all([
      generateStage6WithAi(sentences, "mixed", { fast: true }),
      generateStage7WithAi(sentences, { fast: true }),
    ]);

    const aiGrammar = (ai56.drafts ?? []).filter(
      (d) => (d.question_category || "grammar") !== "vocabulary"
    );
    const aiVocab = (ai56.drafts ?? []).filter(
      (d) => d.question_category === "vocabulary"
    );
    const useAiG = ai56.source === "ai" && aiGrammar.length > 0;
    const useAiV = ai56.source === "ai" && aiVocab.length > 0;

    const grammar = mergeStage6Drafts(
      useAiG ? aiGrammar : plantG,
      plantG,
      ids,
      { category: "grammar", minPerSentence: 1 }
    );
    const vocab = mergeStage6Drafts(
      useAiV ? aiVocab : plantV,
      plantV,
      ids,
      { category: "vocabulary", minPerSentence: 1 }
    );

    const s6 = combineStage6Categories(grammar, vocab, ids);
    const gCover = new Set(grammar.map((d) => d.sentence_id)).size;
    const vCover = new Set(vocab.map((d) => d.sentence_id)).size;
    const gOk = stage6AiCoverageOk(grammar, sentences.length, "grammar");
    const vOk = stage6AiCoverageOk(vocab, sentences.length, "vocabulary");

    notes.push(
      `5단계 어법 ${useAiG ? "AI(fast)" : "규칙"} ${grammar.length}문항 · ${gCover}/${sentences.length}문장${gOk ? " ✓" : ""}${ai56.error && !useAiG ? ` · ${ai56.error}` : ""}`
    );
    notes.push(
      `6단계 어휘 ${useAiV ? "AI(fast)" : "규칙"} ${vocab.length}문항 · ${vCover}/${sentences.length}문장${vOk ? " ✓" : ""}`
    );

    if (s6.length > 0) {
      const r = await saveStage6ItemsAction(passageId, s6);
      if (!r.ok) return { ok: false as const, message: `5·6단계: ${r.message}` };
      await tryPublish(6, () => setStage6PublishedAction(passageId, true));
    }

    const seed7 =
      ai7.source === "ai" && ai7.candidates.some((c) => c.is_error)
        ? ai7
        : buildStage7Seed(sentences);
    if (ai7.source === "ai") {
      notes.push(`7단계 AI(fast) 오류 ${seed7.requiredErrorCount}개`);
    } else if (ai7.error) {
      notes.push(`7단계 AI 실패→규칙: ${ai7.error}`);
    }
    const d = await saveStage7DisplayTextsAction(passageId, seed7.displays);
    if (!d.ok) return { ok: false as const, message: `7단계 표시문장: ${d.message}` };
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
        await tryPublish(7, () => setStage7PublishedAction(passageId, true));
      }
    }
  }

  {
    const s8 = buildStage8Drafts(sentences);
    if (s8.length > 0) {
      const r = await saveStage8GroupsAction(passageId, s8);
      if (!r.ok) {
        notes.push(`8단계 보류: ${r.message}`);
      } else {
        notes.push(`8단계 규칙 ${s8.length}문항`);
        await tryPublish(8, () => setStage8PublishedAction(passageId, true));
      }
    } else {
      notes.push("8단계: 문장이 짧아 자동 생성 생략");
    }
  }

  const s9 = buildStage9Config(sentences);
  if (s9) {
    const r = await saveStage9ConfigAction(passageId, s9, { reshuffleLabels: true });
    if (!r.ok) {
      notes.push(`9단계 보류: ${r.message}`);
    } else {
      notes.push(`9단계 문단배열 ${s9.blocks.length}블록`);
      await tryPublish(9, () => setStage9PublishedAction(passageId, true));
    }
  } else {
    notes.push("9단계: 문장 수 부족으로 생략");
  }

  {
    const s10 = buildStage10Drafts(sentences);
    if (s10.length > 0) {
      const r = await saveStage10ItemsAction(passageId, s10);
      if (!r.ok) {
        notes.push(`10단계 보류: ${r.message}`);
      } else {
        notes.push(`10단계 규칙 ${s10.length}문항`);
        await tryPublish(10, () => setStage10PublishedAction(passageId, true));
      }
    }
  }

  // 3) Workbook 1~10
  const title =
    (input.title ?? "").trim() ||
    `${passage.title} · 10단계 WORKBOOK`;
  const wb = await createWorkbookAction({
    passage_id: passageId,
    title,
    preset_type: "custom",
    step_numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  });
  if (!wb.ok) {
    return {
      ok: false as const,
      message: `단계 설정은 저장됐지만 워크북 생성 실패: ${wb.message}`,
      notes,
    };
  }

  revalidatePath(`/admin/exam-prep/passages/${passageId}`);
  revalidatePath(`/teacher/exam-prep/passages/${passageId}`);
  revalidatePath("/admin/exam-prep/workbooks");
  revalidatePath("/teacher/exam-prep/workbooks");

  return {
    ok: true as const,
    workbookId: wb.id,
    notes,
    message: "1~10단계 워크북을 생성했습니다.",
  };
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import {
  buildStage10Drafts,
  buildStage2Drafts,
  buildStage3Drafts,
  buildStage5Drafts,
  buildStage6Drafts,
  buildStage7Seed,
  buildStage8Drafts,
  buildStage9Config,
  mergeStage6Drafts,
  stage6AiCoverageOk,
  type SeedSentence,
} from "@/lib/exam-prep/auto-seed-stages";
import {
  generateStage6WithAi,
  generateStage7WithAi,
} from "@/lib/exam-prep/generate-stage67-grammar-ai";
import {
  generateStage2WithAi,
  generateStage3WithAi,
  generateStage5WithAi,
  generateStage8WithAi,
  generateStage10WithAi,
  stageCoverageOk,
} from "@/lib/exam-prep/generate-workbook-stages-ai";
import { EXAM_PREP_MODEL_PRIMARY, getExamPrepReasoningEffort } from "@/lib/exam-prep/exam-prep-openai";
import { createWorkbookAction, enrichPassageSentencesAction } from "@/lib/exam-prep/staff-actions";
import { saveKoreanBlanksAction, setStage2PublishedAction } from "@/lib/exam-prep/stage2-staff-actions";
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
export async function generateFullExamPrepWorkbookAction(input: {
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

  // 1) 한글 해석·어휘 — 항상 상위 API로 지문 분석(이미 해석 있어도 어휘 보강)
  const { data: before } = await supabase
    .from("exam_passage_sentences")
    .select("id, korean_text")
    .eq("passage_id", passageId);
  const needKo = (before ?? []).some((s) => !String(s.korean_text ?? "").trim());
  {
    const enrich = await enrichPassageSentencesAction(passageId);
    if (!enrich.ok) {
      if (needKo) {
        return {
          ok: false as const,
          message: `한글 해석 생성 실패: ${enrich.message}`,
        };
      }
      notes.push(`1단계 해석 AI 보강 생략: ${enrich.message}`);
    } else {
      notes.push(
        `1단계 해석·어휘 AI(${EXAM_PREP_MODEL_PRIMARY}/${getExamPrepReasoningEffort()}) ${
          "updated" in enrich ? enrich.updated : 0
        }문장`
      );
    }
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

  // 2) Stage seeds — 전 단계 최고 상위 API 우선, 실패 시 규칙 폴백
  notes.push(
    `모델 ${EXAM_PREP_MODEL_PRIMARY} · reasoning ${getExamPrepReasoningEffort()}`
  );

  {
    const plant = buildStage2Drafts(sentences);
    const ai = await generateStage2WithAi(sentences);
    const s2 =
      ai.source === "ai" && stageCoverageOk(ai.drafts, sentences.length)
        ? ai.drafts
        : plant;
    if (s2.length > 0) {
      const r = await saveKoreanBlanksAction(passageId, s2);
      if (!r.ok) return { ok: false as const, message: `2단계: ${r.message}` };
      notes.push(
        ai.source === "ai" && s2 === ai.drafts
          ? `2단계 AI ${s2.length}개`
          : `2단계 규칙 ${s2.length}개${ai.error ? ` (AI: ${ai.error})` : ""}`
      );
      await tryPublish(2, () => setStage2PublishedAction(passageId, true));
    } else {
      notes.push("2단계: 생성할 빈칸 없음");
    }
  }

  {
    const plant = buildStage3Drafts(sentences);
    const ai = await generateStage3WithAi(sentences);
    const s3 =
      ai.source === "ai" && stageCoverageOk(ai.drafts, sentences.length)
        ? ai.drafts
        : plant;
    if (s3.length > 0) {
      const r = await saveStage3BlanksAction(passageId, s3);
      if (!r.ok) return { ok: false as const, message: `3단계: ${r.message}` };
      notes.push(
        ai.source === "ai" && s3 === ai.drafts
          ? `3단계 AI ${s3.length}개`
          : `3단계 규칙 ${s3.length}개${ai.error ? ` (AI: ${ai.error})` : ""}`
      );
      await tryPublish(3, () => setStage3PublishedAction(passageId, true));
    } else {
      notes.push("3단계: 생성할 빈칸 없음");
    }
  }

  {
    const r = await ensureDefaultStage4SettingsAction(passageId);
    if (!r.ok) return { ok: false as const, message: `4단계: ${r.message}` };
    notes.push(`4단계 설정 ${"created" in r ? r.created : 0}개`);
    await tryPublish(4, () => setStage4PublishedAction(passageId, true));
  }

  {
    const plant = buildStage5Drafts(sentences);
    const ai = await generateStage5WithAi(sentences);
    const s5 =
      ai.source === "ai" && stageCoverageOk(ai.drafts, sentences.length, 0.6)
        ? ai.drafts
        : plant;
    if (s5.length > 0) {
      const r = await saveStage5ItemsAction(passageId, s5);
      if (!r.ok) return { ok: false as const, message: `5단계: ${r.message}` };
      notes.push(
        ai.source === "ai" && s5 === ai.drafts
          ? `5단계 AI ${s5.length}문항`
          : `5단계 규칙 ${s5.length}문항${ai.error ? ` (AI: ${ai.error})` : ""}`
      );
      await tryPublish(5, () => setStage5PublishedAction(passageId, true));
    }
  }

  {
    const plant6 = buildStage6Drafts(sentences);
    const ai6 = await generateStage6WithAi(sentences);
    const ids = sentences.map((s) => s.id);
    const preferAi = stage6AiCoverageOk(ai6.drafts, sentences.length);
    const s6 = mergeStage6Drafts(
      preferAi ? ai6.drafts : plant6,
      preferAi ? plant6 : ai6.drafts,
      ids
    );
    if (ai6.source === "ai" && preferAi) {
      notes.push(`6단계 AI ${ai6.drafts.length}+규칙보충 → ${s6.length}문항`);
    } else if (ai6.source === "ai") {
      notes.push(`6단계 규칙 ${plant6.length}+AI보충 → ${s6.length}문항`);
    } else if (ai6.error) {
      notes.push(`6단계 AI 생략→규칙: ${ai6.error}`);
    }
    if (s6.length > 0) {
      const r = await saveStage6ItemsAction(passageId, s6);
      if (!r.ok) return { ok: false as const, message: `6단계: ${r.message}` };
      if (ai6.source !== "ai") notes.push(`6단계 규칙 ${s6.length}문항`);
      await tryPublish(6, () => setStage6PublishedAction(passageId, true));
    }
  }

  {
    const ai7 = await generateStage7WithAi(sentences);
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
    const plant = buildStage8Drafts(sentences);
    const ai = await generateStage8WithAi(sentences);
    const s8 =
      ai.source === "ai" && stageCoverageOk(ai.drafts, Math.max(1, plant.length), 0.5)
        ? ai.drafts
        : plant;
    if (s8.length > 0) {
      const r = await saveStage8GroupsAction(passageId, s8);
      if (!r.ok) {
        notes.push(`8단계 보류: ${r.message}`);
      } else {
        notes.push(
          ai.source === "ai" && s8 === ai.drafts
            ? `8단계 AI ${s8.length}문항`
            : `8단계 규칙 ${s8.length}문항${ai.error ? ` (AI: ${ai.error})` : ""}`
        );
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
    const plant = buildStage10Drafts(sentences);
    const ai = await generateStage10WithAi(sentences);
    const s10 =
      ai.source === "ai" && stageCoverageOk(ai.drafts, sentences.length, 0.5)
        ? ai.drafts
        : plant;
    if (s10.length > 0) {
      const r = await saveStage10ItemsAction(passageId, s10);
      if (!r.ok) {
        notes.push(`10단계 보류: ${r.message}`);
      } else {
        notes.push(
          ai.source === "ai" && s10 === ai.drafts
            ? `10단계 AI ${s10.length}문항`
            : `10단계 규칙 ${s10.length}문항${ai.error ? ` (AI: ${ai.error})` : ""}`
        );
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

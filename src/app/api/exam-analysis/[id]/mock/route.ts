import { after, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { loadOwnAnalysis, requireExamStaff } from "@/lib/exam-analysis/access";
import { buildMockSlots } from "@/lib/exam-analysis/blueprint";
import { levelBriefFor } from "@/lib/exam-analysis/reading-level";
import { loadExamAnalysis, loadExamMocks } from "@/lib/exam-analysis/load";
import { loadAcademyMaterialPassages } from "@/lib/exam-analysis/material-passages";
import { createJobFromConfig } from "@/lib/question-generator/create-job";
import { runGenerationChunkAndChain } from "@/lib/question-generator/job-chain";
import type { GenerationRequestConfig } from "@/lib/question-generator/types";
import { MIN_SENTENCES_FOR_INSERTION_IRRELEVANT } from "@/lib/question-generator/constants";
import { countEnglishSentences } from "@/lib/question-generator/text-utils";

export const runtime = "nodejs";
export const maxDuration = 300;

/** materialItemId = 수업자료(lesson_material_projects) id */
type PassageIn = { materialItemId?: string; text?: string; title?: string };

/**
 * 동형모의고사 만들기: 분석한 시험의 설계도(번호·유형·난이도·배점)에 새 지문을 배정해 변형문제 작업을 만든다.
 * { passages: [{ materialItemId } | { text, title }], assignment: [묶음마다 지문 번호], title? }
 */
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireExamStaff();
  if ("error" in auth) return auth.error;
  const { profile } = auth;
  const { id } = await context.params;
  if (!(await loadOwnAnalysis(id, profile.academy_id))) {
    return NextResponse.json({ ok: false, message: "분석을 찾을 수 없어요." }, { status: 404 });
  }
  const body = (await request.json().catch(() => ({}))) as { passages?: PassageIn[]; assignment?: number[]; title?: string; round?: number };
  const inputs = (body.passages ?? []).slice(0, 30);
  if (inputs.length === 0) {
    return NextResponse.json({ ok: false, message: "시험 범위 지문을 1개 이상 골라 주세요." }, { status: 400 });
  }

  // 수업자료에서 고른 지문은 서버에서 문장을 이어 붙여 가져온다(내 학원 것만)
  const admin = createAdminClient();
  const materialIds = inputs.map((p) => p.materialItemId).filter((x): x is string => Boolean(x));
  const materials = new Map<string, { title: string; text: string }>();
  if (materialIds.length) {
    for (const m of await loadAcademyMaterialPassages(admin, profile.academy_id, materialIds)) {
      materials.set(m.projectId, { title: `${m.folder} · ${m.title}`, text: m.text });
    }
  }
  const passages = inputs.map((p, i) => {
    const m = p.materialItemId ? materials.get(p.materialItemId) : null;
    return {
      clientId: `mock-${i}`,
      title: (m?.title ?? p.title ?? `지문 ${i + 1}`).slice(0, 80),
      sourceDetail: m?.title ?? "",
      text: (m?.text ?? p.text ?? "").trim(),
    };
  });
  const empty = passages.findIndex((p) => p.text.split(/\s+/).filter(Boolean).length < 40);
  if (empty >= 0) {
    return NextResponse.json({ ok: false, message: `${empty + 1}번 지문이 너무 짧아요. 영어 지문 전체를 넣어 주세요.` }, { status: 400 });
  }

  const data = await loadExamAnalysis(id, profile.academy_id);
  if (!data || data.items.length === 0) {
    return NextResponse.json({ ok: false, message: "분석한 문항이 없어요." }, { status: 400 });
  }
  const { slots } = buildMockSlots(data.items);
  const round = (await loadExamMocks(id, profile.academy_id)).length + 1;
  const assignment = Array.isArray(body.assignment) ? body.assignment : [];
  // 문장 삽입·무관한 문장은 6문장 이상 지문이 있어야 만들 수 있다. 짧으면 긴 지문으로 옮기고,
  // 긴 지문이 하나도 없으면 같은 난이도의 순서 배열로 바꾼다(빈 번호가 생기지 않게).
  const longEnough = passages.map((p) => countEnglishSentences(p.text) >= MIN_SENTENCES_FOR_INSERTION_IRRELEVANT);
  const blueprint = slots.map((s) => {
    const want = assignment[s.group];
    let passageIndex =
      Number.isInteger(want) && want! >= 0 && want! < passages.length ? want! : (s.group + round - 1) % passages.length;
    let optionKey = s.optionKey;
    if (/^(sentence_insertion|irrelevant_sentence):/.test(optionKey) && !longEnough[passageIndex]) {
      const alt = longEnough.findIndex(Boolean);
      if (alt >= 0) passageIndex = alt;
      else optionKey = `order:na:${s.level === "상" ? "high" : "low"}:순서추론`;
    }
    return { no: s.no, passageIndex, optionKey, level: s.level, points: s.points ?? null };
  });

  const a = data.analysis;
  const title =
    body.title?.trim().slice(0, 80) ||
    [a.school_name, a.grade ? `${a.grade}학년` : "", a.subject, "동형모의고사"].filter(Boolean).join(" ");
  const config: GenerationRequestConfig = {
    title,
    schoolName: a.school_name ?? "",
    grade: a.grade ? `고${String(a.grade).replace(/\D/g, "") || "1"}` : "고1",
    sourceType: "자체 지문",
    sourceDetail: a.exam_label ? `${a.exam_label} 동형` : "",
    overallDifficulty: "내신",
    passage: passages[0]!.text,
    passages,
    mode: "custom",
    presetId: null,
    counts: {},
    blueprint,
    examAnalysisId: id,
    // 원래 시험지에서 잰 수준을 그대로 넘긴다(선생님 요청 2026-09-28: 수준이 정말 반영되도록)
    levelBrief: levelBriefFor({
      sentenceWords: a.sentence_words,
      choiceWords: a.choice_words,
      lexile: a.lexile,
      vocabLevel: a.vocab_level,
    }),
  };

  /*
   * 선생님 지적(2026-09-29): 최다빈 선생님이 문제를 꽤 만드는데 차감이 안 된다.
   *
   * 값은 실제로 만들어진 문항 수만큼 작업이 끝날 때 받는다(billGeneratedQuestions).
   * 그런데 그쪽은 request_config에 _billing 표시가 있어야 일한다. 변형문제 화면은
   * 시작할 때 /jobs/[id]로 그 표시를 붙이는데, 동형모의고사는 여기서 바로 돌리느라
   * 붙이지 않았다. 그래서 동형모의고사로 만든 문항은 값을 한 푼도 안 받고 있었다
   * (2026-09-29까지 네 학원 1,383문항).
   */
  const supabase = await createClient();
  const result = await createJobFromConfig(supabase, profile.id, profile.academy_id, {
    ...config,
    _billing: { mode: "post", billed: 0, billedAt: new Date(0).toISOString() },
  } as typeof config);
  if ("error" in result) return NextResponse.json({ ok: false, message: result.error }, { status: result.status ?? 400 });

  const origin = new URL(request.url).origin;
  after(() => runGenerationChunkAndChain(result.jobId, origin));
  return NextResponse.json({ ok: true, jobId: result.jobId });
}

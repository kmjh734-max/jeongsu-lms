/**
 * 같은 4지문을 (a) 한꺼번에, (b) 하나씩 돌려 결과를 비교한다.
 * 배포 기본값(analyzer=low, auditor=medium)을 그대로 쓴다.
 *
 * 왜 이 테스트가 있나:
 * 검수 출력 상한이 항목 수와 무관하게 고정이던 시절, 지문을 여러 개 돌리면
 * 한 호출에 항목이 20개를 넘어가면서 응답이 잘렸고(finish_reason=length),
 * 그 예외가 검수 단계 전체를 죽였다. 지문 하나만 돌리면 임계값 아래라
 * 멀쩡했기 때문에 단건 테스트로는 절대 안 잡히는 버그였다.
 * 그래서 "배치가 단건보다 나쁘지 않은가"를 직접 재는 테스트가 필요하다.
 *
 * 보는 곳:
 *  - batch.items가 single.items보다 크게 적으면 배치 경로가 다시 새고 있다.
 *  - qualityFlags가 비어 있지 않으면 로컬 검증을 통과 못 한 문항이 나갔다.
 *  - callStats.failed > 0이면 호출이 죽고 있다(예전 TOKEN_LIMIT 재발 신호).
 *
 * 실행: npx tsx --env-file=.env.local scripts/test-grammar-choice-v2-batch-vs-single.ts
 * 실제 OpenAI 호출이 나가고 4지문 기준 5~6분 걸린다.
 */
import { writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { generateWorkbookGrammarChoiceV2 } from "../src/lib/lesson-materials/grammar-choice-v2/generate";
import { rejectCandidate } from "../src/lib/lesson-materials/grammar-choice-v2/local-validators";
import { validateMinimalPair } from "../src/lib/lesson-materials/grammar-choice-v2/minimal-pair";

const IDS = [
  ["loa", "0cd85cff-26cb-44be-ba52-824855a4170e"],
  ["movement", "ff6fa8a9-b3b6-4c0b-99d7-09b8b06efc8c"],
  ["uncertainty", "3b01c20a-c147-4d30-b062-53d4f2efd9ac"],
  ["darwin", "15887084-262f-4c77-9c90-023c2551151f"],
] as const;

const calls: Array<{ effort: string; ms: number; inTok: number | null; outTok: number | null; cached: number; ok: boolean }> = [];
const orig = globalThis.fetch.bind(globalThis);
globalThis.fetch = async (input: any, init?: any) => {
  const url = String(input);
  if (!url.includes("api.openai.com")) return orig(input, init);
  const t = Date.now();
  let effort = "";
  try { const b = JSON.parse(String(init?.body ?? "{}")); effort = b.reasoning_effort ?? b.reasoning?.effort ?? ""; } catch {}
  const res = await orig(input, init);
  const text = await res.clone().text();
  let j: any = {};
  try { j = JSON.parse(text); } catch {}
  calls.push({
    effort, ms: Date.now() - t,
    inTok: j?.usage?.prompt_tokens ?? null,
    outTok: j?.usage?.completion_tokens ?? null,
    cached: j?.usage?.prompt_tokens_details?.cached_tokens ?? 0,
    ok: res.ok,
  });
  return res;
};

async function load() {
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  const ids = IDS.map(([, id]) => id);
  const { data: projects } = await admin.from("lesson_material_projects").select("id,title").in("id", ids);
  const { data: items } = await admin.from("lesson_material_items").select("id,project_id,order_index,english_text").in("project_id", ids).order("order_index", { ascending: true });
  return IDS.map(([key, id]) => ({
    key, projectId: id,
    title: projects?.find((p: any) => p.id === id)?.title ?? key,
    source: null,
    sentences: (items ?? []).filter((r: any) => r.project_id === id).map((r: any) => ({ id: String(r.id), english: String(r.english_text ?? "") })),
  }));
}

function scoreSection(section: any, sentenceById: Map<string, string>) {
  const flags: string[] = [];
  for (const item of section.items) {
    const text = sentenceById.get(item.sentenceId) ?? "";
    const sentence = { sentenceId: item.sentenceId, text, passageStart: 0, passageEnd: text.length };
    const candidate = {
      candidateId: String(item.number),
      sentenceId: item.sentenceId,
      pointCode: item.grammarCategoryId,
      sourceSpan: item.originalText,
      occurrenceIndex: 0,
      correctAnswer: item.correctText,
      distractors: [item.incorrectText],
      transformCode: "FORM_SWAP",
      priority: "CORE",
      difficulty: "CORE",
      evidence: "",
      ruleSummaryKo: "",
      riskLevel: "MEDIUM",
    };
    const rej = rejectCandidate({ candidate: candidate as any, sentence: sentence as any });
    if (rej) flags.push(`${section.title}#${item.number}:${rej}`);
    const mp = validateMinimalPair({
      pointCode: item.grammarCategoryId,
      sourceSpan: item.originalText,
      distractor: item.incorrectText,
      sentence: text,
    });
    if (mp) flags.push(`${section.title}#${item.number}:MP_${mp}`);
  }
  return flags;
}

function digest(sections: any[]) {
  return sections.map((s) => ({
    projectId: s.projectId,
    n: s.items.length,
    pairs: s.items.map((i: any) => `${i.grammarCategoryId}|${i.correctText}/${i.incorrectText}`).sort(),
  }));
}

async function main() {
  const loaded = await load();
  const sentenceById = new Map<string, string>();
  for (const p of loaded) for (const s of p.sentences) sentenceById.set(s.id, s.english);
  const passages = loaded.map(({ key, ...rest }) => rest);

  console.log("effort defaults ->", process.env.OPENAI_GRAMMAR_V2_ANALYZER_REASONING_EFFORT ?? "(unset: low)", "/", process.env.OPENAI_GRAMMAR_V2_AUDITOR_REASONING_EFFORT ?? "(unset: medium)");

  // (a) 4지문 한꺼번에
  const t1 = Date.now(); const c1 = calls.length;
  const batch = await generateWorkbookGrammarChoiceV2({ forceRegenerate: true, passages });
  const batchMs = Date.now() - t1; const batchCalls = calls.length - c1;

  // (b) 하나씩
  const t2 = Date.now(); const c2 = calls.length;
  const singles: any[] = [];
  for (const p of passages) {
    const r = await generateWorkbookGrammarChoiceV2({ forceRegenerate: true, passages: [p] });
    singles.push(...r.sections);
  }
  const singleMs = Date.now() - t2; const singleCalls = calls.length - c2;

  const bd = digest(batch.sections), sd = digest(singles);
  const cmp = bd.map((b) => {
    const s = sd.find((x) => x.projectId === b.projectId);
    return { projectId: b.projectId, batchItems: b.n, singleItems: s?.n ?? 0, delta: b.n - (s?.n ?? 0) };
  });

  const out = {
    batch: {
      wallMs: batchMs, fetchCalls: batchCalls,
      items: batch.sections.reduce((n, s) => n + s.items.length, 0),
      qualityFlags: batch.sections.flatMap((s) => scoreSection(s, sentenceById)),
      skipped: batch.skipped,
    },
    single: {
      wallMs: singleMs, fetchCalls: singleCalls,
      items: singles.reduce((n, s) => n + s.items.length, 0),
      qualityFlags: singles.flatMap((s) => scoreSection(s, sentenceById)),
    },
    perPassage: cmp,
    callStats: {
      n: calls.length,
      failed: calls.filter((c) => !c.ok).length,
      byEffort: [...new Set(calls.map((c) => c.effort))].map((e) => {
        const rows = calls.filter((c) => c.effort === e);
        return { effort: e, n: rows.length, avgMs: Math.round(rows.reduce((a, r) => a + r.ms, 0) / rows.length), avgOut: Math.round(rows.reduce((a, r) => a + (r.outTok ?? 0), 0) / rows.length), avgIn: Math.round(rows.reduce((a, r) => a + (r.inTok ?? 0), 0) / rows.length), cachedTok: rows.reduce((a, r) => a + r.cached, 0) };
      }),
    },
  };
  writeFileSync("scripts/_gc-batch-vs-single.json", JSON.stringify({ ...out, calls }, null, 2), "utf8");
  console.log(JSON.stringify(out, null, 2));
}
main().catch((e) => { console.error("FAILED", e); process.exit(1); });

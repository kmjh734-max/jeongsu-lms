/**
 * 새로 만든 작업을 전수 대조한다. 모델을 부르지 않으므로 값이 들지 않는다.
 *
 * 까닭(2026-10-01): 선생님들이 짚어 주시기 전에 내가 먼저 찾아 규칙으로 만들기로 했다.
 * 규칙에 걸리는 것(검수가 이미 막는 것)과, 규칙으로는 못 재는 쏠림을 함께 본다.
 *
 *   npx tsx --env-file=.env.local scripts/audit-new-questions.mts          최근 3일
 *   DAYS=14 npx tsx --env-file=.env.local scripts/audit-new-questions.mts  최근 14일
 *   JOB=2f4d57 npx tsx --env-file=.env.local scripts/audit-new-questions.mts  한 작업만
 */
import { createClient } from "@supabase/supabase-js";
import {
  shouldRegenerate,
  validateGeneratedQuestion,
} from "../src/lib/question-generator/validate-question";
import { falseGrammarError } from "../src/lib/question-generator/grammar-false-error";
import { QUESTION_TYPE_GROUPS } from "../src/lib/question-generator/question-types";
import type { GeneratedQuestionPayload } from "../src/lib/question-generator/types";

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});
const OPTION = new Map(QUESTION_TYPE_GROUPS.flatMap((g) => g.options).map((o) => [o.key, o]));
const DAYS = Number(process.env.DAYS ?? 3);
const JOB = (process.env.JOB ?? "").trim().toLowerCase();

const since = new Date(Date.now() - DAYS * 86400_000).toISOString();
const { data: jobs } = await db
  .from("question_generation_jobs")
  .select("id, created_at, academy_id, request_config")
  .gte("created_at", JOB ? "1970-01-01" : since)
  .order("created_at", { ascending: false })
  .limit(JOB ? 400 : 60);
const picked = (jobs ?? []).filter((j) => (JOB ? String(j.id).toLowerCase().startsWith(JOB) : true));
if (picked.length === 0) {
  console.log(JOB ? `${JOB} 로 시작하는 작업이 없습니다.` : `최근 ${DAYS}일 안에 만든 작업이 없습니다.`);
  process.exit(0);
}

const txt = (c: unknown) => String((c as { text?: string })?.text ?? "");
const code = (key: string) => key.split(":").pop()!;

let totalQ = 0;
const allFindings: string[] = [];

for (const job of picked) {
  const { data: rows } = await db
    .from("generated_english_questions")
    .select(
      "id, option_key, instruction, question_text, passage_original, passage_modified, choices, correct_answer, explanation"
    )
    .eq("generation_job_id", job.id);
  if (!rows?.length) continue;
  totalQ += rows.length;

  const rc = (job.request_config ?? {}) as Record<string, unknown>;
  const title = String(rc.title ?? "(이름 없음)");
  const findings: string[] = [];

  // ── 1. 지금 규칙에 걸리는 것 (검수가 이미 막는 것 — 남아 있으면 그게 구멍이다)
  for (const r of rows) {
    const option = OPTION.get(String(r.option_key));
    if (!option) continue;
    const question = {
      type: option.type,
      instruction: String(r.instruction ?? ""),
      questionText: String(r.question_text ?? ""),
      passageOriginal: String(r.passage_original ?? ""),
      passageModified: String(r.passage_modified ?? ""),
      choices: (r.choices as GeneratedQuestionPayload["choices"]) ?? undefined,
      correctAnswer: r.correct_answer as GeneratedQuestionPayload["correctAnswer"],
      explanation: String(r.explanation ?? ""),
    } as GeneratedQuestionPayload;
    try {
      const v = validateGeneratedQuestion({
        passage: String(r.passage_original ?? ""),
        option,
        question,
        allowParaphrase: rc.paraphraseGrammarVocab === true,
      });
      if (shouldRegenerate(v)) {
        findings.push(`규칙에 걸림 ${String(r.id).slice(0, 8)} ${code(String(r.option_key))} — ${v.warnings[0]}`);
      }
    } catch {
      /* 검수기가 터지면 그 문항은 넘어간다 */
    }
    // 맞는 것을 틀렸다고 함
    if (option.type === "grammar") {
      const ansText = typeof r.correct_answer === "string" ? r.correct_answer : "";
      const expl = String(r.explanation ?? "");
      const pairs = [
        ...ansText.split("/").flatMap((part) => {
          const m = part.match(/([ⓐ-ⓖ①-⑤])\s*[:：]\s*(.+)/);
          return m ? [{ mark: m[1]!, to: m[2]!.replace(/.*(?:→|->|⇒)\s*/, "").trim() }] : [];
        }),
        ...[...expl.matchAll(/([ⓐ-ⓖ①-⑤])[^→\n]{0,80}?(?:→|->|⇒)\s*([A-Za-z][A-Za-z' ]{0,40})/g)].map((m) => ({
          mark: m[1]!,
          to: m[2]!.trim(),
        })),
      ];
      const bad = falseGrammarError(String(r.passage_modified ?? ""), pairs);
      if (bad) findings.push(`맞는 자리를 틀렸다고 함 ${String(r.id).slice(0, 8)} — ${bad}`);
    }
  }

  // ── 2. 규칙으로는 못 재는 쏠림 (새 규칙이 필요한지 보는 자리)
  const byType = new Map<string, typeof rows>();
  for (const r of rows) {
    const t = code(String(r.option_key));
    byType.set(t, [...(byType.get(t) ?? []), r]);
  }
  for (const [t, list] of byType) {
    if (list.length < 8) continue;
    // 정답 번호 쏠림
    const nums = list.map((r) => Number(r.correct_answer)).filter((n) => Number.isFinite(n) && n >= 1 && n <= 5);
    if (nums.length >= 8) {
      const c = new Map<number, number>();
      for (const n of nums) c.set(n, (c.get(n) ?? 0) + 1);
      const [top, n] = [...c].sort((a, b) => b[1] - a[1])[0]!;
      if (n / nums.length >= 0.45) {
        findings.push(`정답 번호 쏠림 ${t} — ${top}번이 ${Math.round((n / nums.length) * 100)}% (${n}/${nums.length})`);
      }
      if (c.size <= 2 && nums.length >= 10) {
        findings.push(`정답 번호가 ${c.size}가지뿐 ${t} — ${[...c.keys()].join(",")}번만 나온다`);
      }
    }
    // 보기 첫 낱말 쏠림
    const heads: string[] = [];
    for (const r of list) {
      const ch = r.choices as unknown[] | null;
      if (!Array.isArray(ch)) continue;
      for (const c0 of ch) {
        const w = txt(c0).trim().split(/\s+/)[0];
        if (w) heads.push(w.toLowerCase());
      }
    }
    if (heads.length >= 25) {
      const c = new Map<string, number>();
      for (const h of heads) c.set(h, (c.get(h) ?? 0) + 1);
      const [top, n] = [...c].sort((a, b) => b[1] - a[1])[0]!;
      if (n / heads.length >= 0.25) {
        findings.push(`보기 머리말 쏠림 ${t} — "${top}"가 ${Math.round((n / heads.length) * 100)}% (${n}/${heads.length})`);
      }
    }
    // 서술형 답 개수가 늘 같다
    const marks = list
      .map((r) => (typeof r.correct_answer === "string" ? [...new Set(r.correct_answer.match(/[ⓐ-ⓖ①-⑤]/g) ?? [])].length : 0))
      .filter((n) => n > 0);
    // 유형 이름에 개수가 박힌 것은 늘 같아야 맞다(요약문빈칸2단어 등)
    const countInName = /\d/.test(t);
    if (!countInName && marks.length >= 8 && new Set(marks).size === 1) {
      findings.push(`답 개수가 늘 ${marks[0]}개 ${t} — ${marks.length}문항이 모두 같다`);
    }
    // 조건 문법이 몇 가지뿐인가
    if (t === "문법조건영작") {
      const g = new Set<string>();
      for (const r of list) {
        const m = String(r.question_text ?? "").match(/○\s*([^\n]+?)(?:을|를)\s*사용할 것/);
        if (m) g.add(m[1]!.trim());
      }
      if (g.size > 0 && g.size <= Math.max(2, Math.floor(list.length / 5))) {
        findings.push(`조건 문법이 ${g.size}가지뿐 — ${list.length}문항에 ${[...g].join(" · ")}`);
      }
    }
  }

  if (findings.length) {
    allFindings.push(
      `\n══ ${String(job.id).slice(0, 8)} · ${String(job.created_at).slice(0, 16).replace("T", " ")} · ${title.slice(0, 32)} (${rows.length}문항)\n` +
        findings.map((f) => `   ${f}`).join("\n")
    );
  }
}

console.log(`작업 ${picked.length}개 · 문항 ${totalQ}개 훑음`);
if (allFindings.length === 0) {
  console.log("\n걸린 것 없음");
} else {
  console.log(allFindings.join("\n"));
  console.log(`\n── 작업 ${allFindings.length}개에서 걸렸다`);
}

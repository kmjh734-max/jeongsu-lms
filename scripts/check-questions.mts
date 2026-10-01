/**
 * 만들어 둔 문항 묶음을 규칙으로 한 번에 검수한다. 모델 안 부른다.
 *
 * 쓰기:  npx tsx --env-file=.env.local scripts/check-questions.mts
 *        JOB=앞8자 … 작업을 골라서 (없으면 가장 최근 작업)
 *
 * 보는 것
 *  1) 앱 자신의 검수기를 저장된 문항에 다시 돌린다
 *  2) 정답·해설 빈 것 / 보기 5개·번호 차례 / 정답 번호 범위 / 해설이 다른 번호를 가리킴
 *  3) 기호(ⓐⓑⓒ)·본문 번호(①②③) 차례 — 본문과 묻는 글 둘 다
 *  4) 어법 수정: 정답의 「기호: 고친 말」이 해설과 맞나, 그 기호가 본문에 있나
 *  5) 「본문에서 찾아 쓰기」 정답이 본문에 실제로 있나
 *  6) 「개수」 유형 정답 숫자 = 해설이 든 틀린 개수
 *  7) 서술형 조건 단어 수(ⓐ·ⓑ 따로) / 정답이 관사·전치사에서 끊겼나
 *  8) 제시어배열 보기 낱말이 빈칸 문장에 남았나 / 빈칸이 마침표를 삼켰나
 *  9) 해설 끝에 엉뚱한 문법 포인트(GP…)가 붙었나
 * 10) 다른 유형으로 바꿔 만든 것 / 정답 번호 쏠림
 */
import { createClient } from "@supabase/supabase-js";
import { validateGeneratedQuestion } from "../src/lib/question-generator/validate-question";
import { ALL_QUESTION_OPTIONS, findAingkaOption } from "../src/lib/question-generator/question-types";
import { bankWordsLeftInBlankLine, closeBlankSentence } from "../src/lib/question-generator/blank-line-overlap";
import { parseGrammarFixAnswer } from "../src/lib/question-generator/grammar-fix-normalize";
import { agreementBreakAfterFix } from "../src/lib/question-generator/agreement-check";
import type { GeneratedQuestionPayload } from "../src/lib/question-generator/types";

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

const { data: jobs } = await db
  .from("question_generation_jobs")
  .select("id, created_at, request_config, progress_message")
  .order("created_at", { ascending: false })
  .limit(50);
const job = process.env.JOB
  ? (jobs ?? []).find((j) => String(j.id).startsWith(process.env.JOB!))
  : (jobs ?? [])[0];
if (!job) throw new Error("작업을 못 찾았습니다.");

const { data: rows } = await db
  .from("generated_english_questions")
  .select(
    "id, option_key, category, question_type, difficulty, choice_language, passage_original, passage_modified, instruction, question_text, choices, correct_answer, acceptable_answers, explanation, hard_words, evidence, scoring_guide, validation_result",
  )
  .eq("generation_job_id", job.id)
  .order("created_at");
const qs = rows ?? [];
const cfg = job.request_config as { title?: string } | null;
console.log(`작업 ${String(job.id).slice(0, 8)} · ${String(cfg?.title ?? "").slice(0, 40)}`);
console.log(`문항 ${qs.length}개 · ${job.progress_message ?? ""}\n`);

type Flag = { id: string; type: string; kind: string; detail: string };
const flags: Flag[] = [];
const add = (r: (typeof qs)[number], kind: string, detail = "") =>
  flags.push({ id: String(r.id).slice(0, 8), type: String(r.option_key).split(":").pop()!, kind, detail });

const MARKS = "ⓐⓑⓒⓓⓔⓕⓖ";
const letters = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");
const TAIL = new Set("a an the of to in on for and or that with as by at from is are was were be".split(" "));
const byType = new Map<string, number>();
const answerNos = new Map<string, number[]>();
let substituted = 0;

for (const r of qs) {
  const name = String(r.option_key).split(":").pop()!;
  byType.set(name, (byType.get(name) ?? 0) + 1);
  if ((r.validation_result as { substitutedFrom?: string } | null)?.substitutedFrom) substituted += 1;

  const mod = String(r.passage_modified ?? "");
  const qt = String(r.question_text ?? "");
  const ans = String(r.correct_answer ?? "").trim();
  const exp = String(r.explanation ?? "");
  const choices = (r.choices as Array<{ number?: number; text?: string }> | null) ?? null;

  // 1) 앱 검수기
  const option = ALL_QUESTION_OPTIONS.find((o) => o.key === r.option_key) ?? findAingkaOption(String(r.option_key));
  if (option) {
    try {
      const v = validateGeneratedQuestion({
        passage: String(r.passage_original ?? ""),
        option: option as never,
        question: {
          type: r.question_type,
          category: r.category,
          difficulty: r.difficulty,
          choiceLanguage: r.choice_language,
          passageOriginal: String(r.passage_original ?? ""),
          passageModified: mod || undefined,
          instruction: String(r.instruction ?? ""),
          questionText: qt,
          choices: choices ?? undefined,
          correctAnswer: r.correct_answer as GeneratedQuestionPayload["correctAnswer"],
          acceptableAnswers: (r.acceptable_answers as string[] | null) ?? undefined,
          explanation: exp,
          hardWords: (r.hard_words as GeneratedQuestionPayload["hardWords"]) ?? undefined,
          evidence: (r.evidence as GeneratedQuestionPayload["evidence"]) ?? [],
          scoringGuide: (r.scoring_guide as GeneratedQuestionPayload["scoringGuide"]) ?? undefined,
        },
        allowParaphrase: false,
      });
      for (const w of v.warnings ?? []) add(r, "앱 검수", w.slice(0, 90));
    } catch (e) {
      add(r, "검수 못 돌림", e instanceof Error ? e.message.slice(0, 70) : "?");
    }
  }

  // 2) 빈 것 · 보기
  if (!ans) add(r, "정답 없음");
  if (!exp.trim()) add(r, "해설 없음");
  if (Array.isArray(choices) && choices.length > 0) {
    if (choices.length !== 5) add(r, "보기 개수", `${choices.length}개`);
    const nums = choices.map((c) => Number(c.number));
    if (nums.some((n, i) => n !== i + 1)) add(r, "보기 번호 차례", nums.join(","));
    const texts = choices.map((c) => String(c.text ?? "").trim());
    if (texts.some((t) => !t)) add(r, "빈 보기");
    const dup = texts.filter((t, i) => t && texts.indexOf(t) !== i);
    if (dup.length) add(r, "같은 보기", dup[0]!.slice(0, 40));
    const an = Number(ans);
    if (Number.isFinite(an)) {
      if (an < 1 || an > choices.length) add(r, "정답 번호 범위", `${an} / 보기 ${choices.length}`);
      answerNos.set(name, [...(answerNos.get(name) ?? []), an]);
      const said = [...exp.matchAll(/[①②③④⑤]/g)].map((m) => "①②③④⑤".indexOf(m[0]!) + 1);
      if (said.length > 0 && !said.includes(an)) {
        add(r, "해설이 다른 번호", `정답 ${an} · 해설 ${[...new Set(said)].join(",")}`);
      }
    }
  }

  // 3) 기호 차례 — 본문과 묻는 글
  for (const [src, text, re] of [
    ["본문", mod, /([ⓐ-ⓖ])\s*<u>/g],
    ["묻는 글", qt, /([ⓐ-ⓖ])\s*_{3,}/g],
  ] as const) {
    const seen: string[] = [];
    for (const m of text.matchAll(re)) if (!seen.includes(m[1]!)) seen.push(m[1]!);
    if (seen.length >= 2 && seen.join("") !== MARKS.slice(0, seen.length)) {
      add(r, `${src} 기호 차례`, seen.join(""));
    }
  }
  const circled = [...new Set([...mod.matchAll(/([①-⑤])/g)].map((m) => m[1]!))];
  if (circled.length >= 2 && circled.join("") !== "①②③④⑤".slice(0, circled.length)) {
    add(r, "본문 번호 차례", circled.join(""));
  }

  // 4) 어법 수정 정답지
  if (/오류수정/.test(name)) {
    /* 정답대로 고쳐도 주어·동사가 안 맞으면 채점을 못 한다 */
    const pairs = parseGrammarFixAnswer(ans);
    if (pairs.length > 0) {
      const stillBroken = agreementBreakAfterFix(mod, pairs);
      if (stillBroken) add(r, "고쳐도 주어·동사 안 맞음", `"${stillBroken}"`);
    }
    const inBody = new Set([...mod.matchAll(/([ⓐ-ⓖ①-⑤])\s*<u>/g)].map((m) => m[1]!));
    for (const p of parseGrammarFixAnswer(ans)) {
      if (inBody.size > 0 && !inBody.has(p.mark)) {
        add(r, "본문에 없는 기호를 정답으로", `${p.mark} (본문 ${[...inBody].join("")})`);
      }
      const said = exp.match(new RegExp(`${p.mark}[^ⓐ-ⓖ①-⑤→]{0,80}?→\\s*([A-Za-z][A-Za-z '’-]*)`, "u"))?.[1]?.trim();
      if (said && letters(said) !== letters(p.to) && !letters(p.to).startsWith(letters(said))) {
        add(r, "정답과 해설의 고친 말이 다름", `${p.mark} 정답 "${p.to.slice(0, 24)}" · 해설 "${said.slice(0, 24)}"`);
      }
    }
  }

  // 5) 찾아 쓰기 정답이 본문에 있나
  if (/본문에서 찾아|본문에 나오는|본문의 한 단어|본문에서 정확히/.test(qt)) {
    const body = letters(`${r.passage_original ?? ""} ${mod}`);
    const parts = [
      ...[...ans.matchAll(/([ⓐ-ⓖ])\s*[:：]\s*([^/]+)/g)].map((m) => [m[1]!, m[2]!.trim()] as const),
      ...[...ans.matchAll(/\(([A-G])\)\s*[:：]\s*([^/]+)/g)].map((m) => [`(${m[1]!})`, m[2]!.trim()] as const),
    ];
    for (const [mark, text] of parts.length ? parts : ([["―", ans]] as const)) {
      if (letters(text).length >= 4 && !body.includes(letters(text))) {
        add(r, "찾아 쓰기 정답이 본문에 없음", `${mark} "${text.slice(0, 36)}"`);
      }
    }
  }

  // 6) 개수 유형
  if (/개수$/.test(name)) {
    const n = Number(ans);
    const wrong = new Set<string>();
    for (const m of exp.matchAll(/([ⓐ-ⓖ①-⑤])[^가-힣]{0,12}(틀림|틀리다|어색|부적절)/g)) wrong.add(m[1]!);
    for (const m of exp.matchAll(/(틀린|어색한)[^가-힣]{0,6}([ⓐ-ⓖ①-⑤])/g)) wrong.add(m[2]!);
    if (Number.isFinite(n) && wrong.size > 0 && wrong.size !== n) {
      add(r, "개수 정답과 해설 불일치", `정답 ${n} · 해설 ${wrong.size}개 (${[...wrong].join("")})`);
    }
  }

  // 7) 서술형 단어 수 · 토막
  if (ans && !/^\d+$/.test(ans)) {
    const parts = new Map<string, string>();
    for (const m of ans.matchAll(/([ⓐ-ⓖ])\s*[:：]\s*([^/]+)/g)) parts.set(m[1]!, m[2]!.trim());
    if (parts.size === 0) parts.set("ⓐ", ans);
    const ko: Record<string, number> = { 한: 1, 두: 2, 세: 3, 네: 4, 다섯: 5, 여섯: 6 };
    for (const m of qt.matchAll(/([ⓐ-ⓖ])\s*(?:는|은)?\s*(?:본문에 나오는 연속된\s*)?([0-9]+|한|두|세|네|다섯|여섯)\s*단어/g)) {
      const want = Number(m[2]) || ko[m[2]!] || 0;
      const got = (parts.get(m[1]!) ?? "").match(/[A-Za-z'’-]+/g)?.length ?? 0;
      if (want > 0 && got > 0 && got !== want) {
        add(r, "조건 단어 수 안 맞음", `${m[1]} ${want}단어 조건 · 실제 ${got}낱말`);
      }
    }
    for (const [mark, text] of parts) {
      const ws = text.match(/[A-Za-z'’-]+/g) ?? [];
      if (ws.length < 2 || !TAIL.has(ws[ws.length - 1]!.toLowerCase())) continue;
      if (!/요약|찾아/.test(qt)) continue;
      /*
       * 빈칸 뒤에 영어 낱말이 찍혀 있으면 토막이 아니다.
       * 「promoted ⓐ______ solution」처럼 빈칸이 구 가운데 있으면 정답이 the로 끝나도 맞다.
       */
      const after = qt.match(new RegExp(`${mark}\\s*_{3,}\\s*(\\S+)`))?.[1] ?? "";
      if (/^[A-Za-z]/.test(after)) continue;
      add(r, "정답이 토막으로 끊김", `${mark} "${text.slice(0, 34)}"`);
    }
  }

  // 8) 제시어배열
  if (/제시어배열|문법조건영작/.test(name)) {
    const bank = (qt.match(/<보기>\s*\n([^\n]+)/) ?? [])[1] ?? "";
    if (bank) {
      const left = bankWordsLeftInBlankLine(mod, bank);
      if (left.length) add(r, "보기 낱말이 빈칸 문장에 남음", left.join(", "));
    }
    if (!/_{3,}/.test(mod)) add(r, "빈칸 표시 없음");
    if (/제시어배열/.test(name) && closeBlankSentence(mod) !== mod) add(r, "빈칸이 마침표 삼킴");
  }

  // 9) 엉뚱한 문법 포인트
  if (/제시어배열/.test(name)) {
    for (const p of exp.split(/(?<=[.다])\s+/)) {
      if (/^\s*GP\d{2}/.test(p)) add(r, "해설 끝에 문법 포인트 군더더기", p.slice(0, 48));
    }
  }

  // 본문에 한글
  if (mod && /[가-힣]/.test(mod.replace(/<지칭답란>[\s\S]*$/, "")) && !/요약표|요약문/.test(name)) {
    add(r, "본문에 한글", (mod.match(/[가-힣]{2,}/) ?? [""])[0]);
  }
}

// ── 내보내기 ──────────────────────────────────────────────
console.log("유형별 문항 수와 정답 번호 쏠림");
for (const [name, n] of [...byType].sort((a, b) => b[1] - a[1])) {
  const list = answerNos.get(name);
  let bias = "";
  if (list && list.length >= 5) {
    const c = [1, 2, 3, 4, 5].map((k) => list.filter((x) => x === k).length);
    const pct = Math.round((Math.max(...c) / list.length) * 100);
    bias = `정답 ${c.join("/")}${pct >= 50 ? `  ← 한 번호에 ${pct}% 쏠림` : ""}`;
  }
  console.log(`   ${name.padEnd(18)} ${String(n).padStart(3)}개  ${bias}`);
}
console.log(`\n다른 유형으로 바꿔 만든 것 ${substituted}개`);

const ids = new Set(flags.map((f) => f.id));
console.log(`\n${flags.length === 0 ? "흠 없음 ✔" : `흠 ${flags.length}건 · 걸린 문항 ${ids.size}개 / ${qs.length}개`}`);
const byKind = new Map<string, Flag[]>();
for (const f of flags) byKind.set(f.kind, [...(byKind.get(f.kind) ?? []), f]);
for (const [kind, list] of [...byKind].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n── ${kind} ${list.length}건  (${[...new Set(list.map((f) => f.type))].join(", ").slice(0, 56)})`);
  for (const f of list.slice(0, 5)) console.log(`     ${f.id} ${f.type.padEnd(16)} ${f.detail}`);
  if (list.length > 5) console.log(`     … 그 밖 ${list.length - 5}건`);
}

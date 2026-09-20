/**
 * 적어 둔 세트를 올리기 전에 규칙으로 검수한다 (모델 호출 없음).
 *
 *   node ... check-set.mts scripts/listening-build/sets/고1-11회.ts
 *
 * 보는 것: 번호·유형·지시문이 교재 형식과 맞는지, 대본 길이·발화 수가 기준에서
 * 크게 벗어나지 않는지, 정답 근거가 대본에 실제로 있는지, 보기 언어가 맞는지,
 * 정답 번호가 한쪽으로 쏠리지 않는지, 같은 학년 다른 회차와 소재가 겹치지 않는지.
 */
import { pathToFileURL } from "url";
import { resolve } from "path";
import type { SetSpec, QuestionSpec } from "./spec.ts";
import { scriptTextOf } from "./spec.ts";
import { templateAt, templateFor } from "./templates.ts";

export interface Problem {
  order: number;
  level: "막음" | "살핌";
  message: string;
}

const KO = /[가-힣]/;
const MONEY = /^\$?\d[\d,]*(\.\d+)?$/;
const TIME = /^\d{1,2}:\d{2}\s?(a\.m\.|p\.m\.)$/i;

function wordsOf(q: QuestionSpec): number {
  return q.lines.reduce((n, [, t]) => n + (t.match(/[A-Za-z']+/g)?.length ?? 0), 0);
}

function choiceLanguage(choices: string[]): "ko" | "en" | "mark" {
  if (choices.every((c) => /^[①②③④⑤]$/.test(c.trim()))) return "mark";
  const ko = choices.filter((c) => KO.test(c)).length;
  return ko > choices.length / 2 ? "ko" : "en";
}

export function checkSet(spec: SetSpec): Problem[] {
  const out: Problem[] = [];
  const tmpl = templateFor(spec.gradeLevel);
  const push = (order: number, level: Problem["level"], message: string) =>
    out.push({ order, level, message });

  // 번호가 빠지거나 겹치지 않는지
  const seen = new Set<number>();
  for (const q of spec.questions) {
    if (seen.has(q.order)) push(q.order, "막음", "번호가 두 번 나옵니다.");
    seen.add(q.order);
  }
  for (const t of tmpl) {
    if (!seen.has(t.order)) push(t.order, "막음", `${t.order}번(${t.type})이 없습니다.`);
  }

  for (const q of spec.questions) {
    const t = templateAt(spec.gradeLevel, q.order);
    if (!t) {
      push(q.order, "막음", "교재 형식에 없는 번호입니다.");
      continue;
    }

    if (q.type !== t.type) push(q.order, "살핌", `유형 이름이 다릅니다: "${q.type}" ≠ "${t.type}"`);

    // 보기 5개
    if (q.choices.length !== 5) push(q.order, "막음", `보기가 ${q.choices.length}개입니다(5개여야 함).`);
    if (q.answer < 1 || q.answer > 5) push(q.order, "막음", `정답 번호가 ${q.answer}입니다.`);

    // 보기 언어
    const lang = choiceLanguage(q.choices);
    if (t.choiceLang === "ko" && lang === "en") push(q.order, "막음", "보기가 한글이어야 합니다.");
    if (t.choiceLang === "en" && lang === "ko") push(q.order, "막음", "보기가 영어여야 합니다.");
    if (t.choiceLang === "money" && !q.choices.every((c) => MONEY.test(c.trim())))
      push(q.order, "살핌", "금액 보기 형식이 아닙니다(예: $45).");
    if (t.choiceLang === "time" && !q.choices.every((c) => TIME.test(c.trim())))
      push(q.order, "살핌", "시각 보기 형식이 아닙니다(예: 12:30 p.m.).");
    if ((t.choiceLang === "picture" || t.choiceLang === "table") && lang !== "mark" && t.visual !== "grid5")
      push(q.order, "살핌", "그림·표 문항의 보기는 ①~⑤ 표시여야 합니다.");

    // 대본 길이 — 기준의 60~150% 안
    if (t.words > 0) {
      const w = wordsOf(q);
      if (w < t.words * 0.6) push(q.order, "살핌", `대본이 짧습니다: ${w}낱말 (기준 ${t.words})`);
      if (w > t.words * 1.5) push(q.order, "살핌", `대본이 깁니다: ${w}낱말 (기준 ${t.words})`);
    }

    // 발화 수
    // 응답 유형은 답이 될 마지막 말을 대본에 넣지 않으므로 한 턴 적다
    const minTurns = t.responseLine ? 3 : 4;
    if (t.form === "대화" && q.lines.length < minTurns)
      push(q.order, "막음", `대화인데 발화가 ${q.lines.length}개입니다(${minTurns}개 이상).`);
    if (t.form === "담화" && new Set(q.lines.map(([s]) => s)).size > 1)
      push(q.order, "막음", "담화인데 화자가 둘 이상입니다.");

    // 정답 근거가 대본에 실제로 있는지
    const script = scriptTextOf(q).toLowerCase().replace(/\s+/g, " ");
    const clue = q.clue.toLowerCase().replace(/\s+/g, " ").trim();
    if (!clue) push(q.order, "막음", "정답 근거가 비어 있습니다.");
    else if (KO.test(q.clue)) {
      /* 상황 설명형은 한국어 근거를 쓰기도 한다 — 넘어간다 */
    } else {
      const head = clue.split(/[.?!]/)[0]!.slice(0, 40);
      if (head.length > 12 && !script.includes(head)) {
        push(q.order, "막음", `정답 근거가 대본에 없습니다: "${q.clue.slice(0, 50)}"`);
      }
    }

    // 해설·해석
    if (!q.explanation?.trim()) push(q.order, "막음", "해설이 없습니다.");
    if (!q.translation?.trim()) push(q.order, "막음", "해석이 없습니다.");

    // 응답 줄
    if (t.responseLine && !q.questionText?.trim())
      push(q.order, "살핌", "응답 줄(▶ Man : 같은 줄)이 없습니다.");

    // 그림·표
    if (t.visual === "table" && !q.table) push(q.order, "막음", "표가 없습니다.");
    if ((t.visual === "figure5" || t.visual === "grid5" || t.visual === "scene") && !q.figure)
      push(q.order, "막음", "그림 계획이 없습니다.");

    // 보기끼리 겹치지 않는지
    const uniq = new Set(q.choices.map((c) => c.trim()));
    if (uniq.size !== q.choices.length) push(q.order, "막음", "보기에 같은 것이 있습니다.");
  }

  // 정답 쏠림
  const tally = [0, 0, 0, 0, 0];
  for (const q of spec.questions) if (q.answer >= 1 && q.answer <= 5) tally[q.answer - 1]!++;
  const most = Math.max(...tally);
  if (most > Math.ceil(spec.questions.length / 5) + 2)
    push(0, "살핌", `정답이 한쪽으로 쏠립니다: ①~⑤ = ${tally.join(", ")}`);
  const none = tally.findIndex((n) => n === 0);
  if (none >= 0) push(0, "살핌", `${none + 1}번을 정답으로 쓴 문항이 없습니다.`);

  return out;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const specPath = process.argv[2];
  if (!specPath) throw new Error("쓰는 법: node ... check-set.mts <세트 파일>");
  const mod = (await import(pathToFileURL(resolve(specPath)).href)) as { spec: SetSpec };
  const problems = checkSet(mod.spec);
  const block = problems.filter((p) => p.level === "막음");
  const warn = problems.filter((p) => p.level === "살핌");

  console.log(`${mod.spec.title} · 문항 ${mod.spec.questions.length}개`);
  for (const p of [...block, ...warn]) {
    console.log(`  [${p.level}] ${p.order ? `${p.order}번` : "세트"}: ${p.message}`);
  }
  console.log(problems.length === 0 ? "  문제 없음" : `\n막음 ${block.length}개 · 살핌 ${warn.length}개`);
  if (block.length) process.exitCode = 1;
}

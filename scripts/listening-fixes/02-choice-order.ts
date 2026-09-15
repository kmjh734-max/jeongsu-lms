/**
 * 선택지 순서로 정답이 새는 문항 정리.
 *   1) 시각·금액 선택지: 작은 값부터 늘어놓는다 (정답만 순서를 벗어나 있어 순서만 보고 답을 알 수 있었음)
 *   2) 정답 위치가 한쪽에 몰린 유형을 고르게 재배치:
 *      - 고등 14번(긴 응답): 20문항 모두 정답 ①
 *      - 중등 5번(언급하지 않은 것): 60문항 중 57개 정답 ⑤
 *   해설 속 ①~⑤ 번호, 그림 프롬프트 순서, 5번 mention_plan 번호도 함께 옮긴다.
 *
 *   npx --yes tsx --tsconfig tsconfig.json scripts/listening-fixes/02-choice-order.ts          (미리보기)
 *   npx --yes tsx --tsconfig tsconfig.json scripts/listening-fixes/02-choice-order.ts --apply  (저장)
 */
import {
  keyOf,
  loadAll,
  runPlannedFixes,
  templateQuestions,
  type Loaded,
  type PlannedFix,
  type Row,
} from "./lib";
import {
  numericChoiceValue,
  orderNumericChoices,
  reorderQuestionChoices,
} from "../../src/lib/listening/balance-correct-answer";

function roundOf(title: string): number {
  return Number(title.match(/(\d+)\s*회/)?.[1] ?? 0);
}

function sameArray(a: unknown[], b: unknown[]): boolean {
  return a.length === b.length && a.every((x, i) => x === b[i]);
}

function reorderPatch(q: Row, targetSlot?: number): Record<string, unknown> | null {
  const next = reorderQuestionChoices(
    {
      choices: q.choices,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      choice_image_prompts: (q.choice_image_prompts as string[] | undefined) ?? undefined,
    },
    targetSlot
  );
  if (sameArray(next.choices, q.choices) && next.correct_answer === q.correct_answer) return null;
  const patch: Record<string, unknown> = {
    choices: next.choices,
    correct_answer: next.correct_answer,
  };
  if (next.explanation !== q.explanation) patch.explanation = next.explanation;
  if (
    Array.isArray(q.choice_image_prompts) &&
    next.choice_image_prompts &&
    !sameArray(next.choice_image_prompts, q.choice_image_prompts as unknown[])
  ) {
    patch.choice_image_prompts = next.choice_image_prompts;
  }
  // 5번: mention_plan 번호를 새 선택지 순서에 맞춘다
  const plan = q.mention_plan as
    | { choice_items?: Array<{ no: number; label: string; mentioned: boolean; evidence: string }>; unmentioned_no?: number; unmentioned_label?: string; topic?: string }
    | undefined;
  if (plan && Array.isArray(plan.choice_items) && plan.choice_items.length === 5) {
    const items = next.choices.map((label, i) => {
      const it = plan.choice_items!.find((x) => x.label.trim() === label.trim());
      return it ? { ...it, no: i + 1 } : null;
    });
    if (items.every(Boolean)) {
      const unmentioned = items.find((it) => it!.label === next.choices[next.correct_answer - 1]);
      patch.mention_plan = {
        ...plan,
        choice_items: items,
        unmentioned_no: next.correct_answer,
        unmentioned_label: unmentioned?.label ?? plan.unmentioned_label,
      };
    }
  }
  return patch;
}

function numericFixes(d: Loaded): PlannedFix[] {
  const out: PlannedFix[] = [];
  for (const q of templateQuestions(d)) {
    if (q.choices.length !== 5) continue;
    if (!q.choices.every((c) => numericChoiceValue(c) != null)) continue;
    if (!orderNumericChoices(q.choices, q.correct_answer)) continue;
    const patch = reorderPatch(q);
    if (!patch) continue;
    out.push({
      template: q,
      reason: "시각·금액 선택지를 작은 값부터",
      patch,
      indexMeaningChanges: true,
    });
  }
  return out;
}

/** 정해진 순서로 돌려 가며 배정 → 5칸이 똑같이 나뉜다 (다시 실행해도 같은 결과) */
const SLOT_CYCLE = [3, 1, 4, 5, 2];

function rebalanceFixes(
  d: Loaded,
  pick: (q: Row, grade: string) => boolean,
  label: string
): PlannedFix[] {
  const group = templateQuestions(d)
    .filter((q) => pick(q, d.setById.get(q.set_id)?.grade_level ?? ""))
    .sort((a, b) => {
      const ga = d.setById.get(a.set_id)!;
      const gb = d.setById.get(b.set_id)!;
      return ga.grade_level.localeCompare(gb.grade_level) || roundOf(ga.title) - roundOf(gb.title);
    });
  const counts = [0, 0, 0, 0, 0];
  for (const q of group) counts[q.correct_answer - 1]!++;
  const max = Math.max(...counts);
  // 이미 고르게 퍼져 있으면(한 칸이 절반 미만) 건드리지 않는다
  if (max < group.length / 2) {
    console.log(`  ${label}: 이미 고르게 분포 (${counts.join("/")}) — 건너뜀`);
    return [];
  }
  const out: PlannedFix[] = [];
  group.forEach((q, i) => {
    const target = SLOT_CYCLE[i % SLOT_CYCLE.length]!;
    const patch = reorderPatch(q, target);
    if (!patch) return;
    out.push({
      template: q,
      reason: `${label}: 정답 위치 ${q.correct_answer} → ${target} (분포 ${counts.join("/")})`,
      patch,
      indexMeaningChanges: true,
    });
  });
  return out;
}

async function main() {
  const d = await loadAll();
  const numeric = numericFixes(d);
  const high14 = rebalanceFixes(
    d,
    (q, grade) => grade.startsWith("high") && q.order_index === 14 && /응답/.test(q.question_type),
    "고등 14번 긴 응답"
  );
  const middle5 = rebalanceFixes(
    d,
    (q, grade) => grade.startsWith("middle") && q.order_index === 5 && /언급하지 않은/.test(q.question_type),
    "중등 5번 언급하지 않은 것"
  );
  console.log(`\n[수 선택지 정렬] ${numeric.length}문항: ${numeric.map((f) => keyOf(d, f.template)).join(", ")}`);
  console.log(`[고등 14번 재배치] ${high14.length}문항`);
  console.log(`[중등 5번 재배치] ${middle5.length}문항`);
  await runPlannedFixes("02-choice-order", d, [...numeric, ...high14, ...middle5]);
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});

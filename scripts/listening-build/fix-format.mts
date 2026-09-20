/**
 * 이미 있는 세트를 교재 형식에 맞춘다 (2026-09-21).
 *
 * - 고등 13·14·15번에 [3점]을 붙인다.
 * - 11~15번(고등)·17~20번(중등)에 응답 줄을 넣는다: "▶ Man : ____"
 * - 대본과 지시문은 건드리지 않으므로 음성을 다시 만들 필요가 없다.
 *
 *   node ... fix-format.mts            (무엇이 바뀌는지만 보여 준다)
 *   node ... fix-format.mts --적용
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { templateAt } from "./templates.ts";

const apply = process.argv.includes("--적용");
const admin = createAdminClient();

const { data: prof } = await admin
  .from("profiles")
  .select("academy_id")
  .eq("username", "js83719392")
  .single();

const { data: sets } = await admin
  .from("listening_sets")
  .select("id, title, grade_level")
  .eq("academy_id", prof!.academy_id)
  .order("grade_level")
  .order("title");

/** 대본의 마지막 화자를 보고 답할 사람을 정한다 */
function responderFrom(script: string, instruction: string): string {
  const namePick = instruction.match(/([A-Z][a-z]+)(?:이|가)\s+[^\s]+에게 할 말/);
  if (namePick) return namePick[1]!;
  const lines = script.split(/\r?\n/).filter((l) => /^\s*[MW]\s*:/.test(l));
  const last = lines[lines.length - 1]?.trim().charAt(0);
  // 마지막 말이 M이면 답하는 쪽은 W
  if (last === "M") return "Woman";
  if (last === "W") return "Man";
  return "Man";
}

let points = 0;
let lines = 0;
let untouched = 0;

for (const s of sets ?? []) {
  const { data: qs } = await admin
    .from("listening_questions")
    .select("id, order_index, instruction, question_text, script_text")
    .eq("set_id", s.id)
    .order("order_index");

  for (const q of qs ?? []) {
    const t = templateAt(String(s.grade_level), Number(q.order_index));
    if (!t) continue;
    const patch: Record<string, string> = {};

    const inst = String(q.instruction ?? "");
    if (t.points3 && !inst.includes("[3점]")) {
      patch.instruction = `${inst.trim()} [3점]`;
      points++;
    }

    const qt = String(q.question_text ?? "").trim();
    if (t.responseLine && !qt.includes("▶")) {
      const who = responderFrom(String(q.script_text ?? ""), inst);
      patch.question_text = `▶ ${who} : ________________`;
      lines++;
    }

    if (Object.keys(patch).length === 0) {
      untouched++;
      continue;
    }
    if (apply) {
      const { error } = await admin.from("listening_questions").update(patch).eq("id", q.id);
      if (error) console.log(`  ${s.title} ${q.order_index}번 실패: ${error.message}`);
    }
  }
}

console.log(
  `${apply ? "적용함" : "이렇게 바뀝니다"} — [3점] ${points}개 · 응답 줄 ${lines}개 · 그대로 ${untouched}개`
);
if (!apply) console.log("실제로 바꾸려면 --적용 을 붙여 주세요.");

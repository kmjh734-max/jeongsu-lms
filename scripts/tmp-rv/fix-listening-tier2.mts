/**
 * 문항별 검토 3차 — 듣지 않고도 답이 보이던 것과 남은 잔결함을 고친다.
 *
 *   node --env-file=.env.local --experimental-strip-types --import ./scripts/tmp-rv/register-alias.mjs \
 *     scripts/tmp-rv/fix-listening-tier2.mts [--적용]
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { generateSetQuestionAudio } from "@/lib/listening/generate-audio";
import { ensureDictationPreparedForSet } from "@/lib/listening/dictation/prebuild-question";

const apply = process.argv.includes("--적용");
const admin = createAdminClient();

/** 표 첫 칸의 사람 이름을 뗀다 — 지시문의 이름과 맞아떨어져 답이 그대로 보였다 */
const DROP_NAME_COLUMN: Array<{ set: string; no: number; instruction?: string }> = [
  { set: "중2 3회", no: 12, instruction: "다음 표를 보면서 대화를 듣고, 여자가 구입할 우산을 고르시오." },
  { set: "중2 4회", no: 12 },
  { set: "중2 5회", no: 12 },
];

/** 대본이 보기 번호를 그대로 말해 조건 대조가 필요 없던 것 — 음성도 다시 굽는다 */
const SCRIPT_EDITS: Array<{ set: string; no: number; from: string; to: string }> = [
  {
    set: "중2 6회", no: 12,
    from: "Less than fifteen dollars. I'll take the second one.",
    to: "Less than fifteen dollars. That one fits everything I need.",
  },
  {
    set: "중2 10회", no: 12,
    from: "Option two fits all my needs. I'll choose that one.",
    to: "That one fits all my needs. I'll choose it.",
  },
];

/** 그 밖의 잔결함 */
const SMALL: Array<{ set: string; no: number; questionText?: string; explanation?: string; tableLabel?: [number, string] }> = [
  { set: "중3 6회", no: 20, questionText: "▶ Soojin : ________________" },
  {
    set: "중2 9회", no: 13,
    explanation: "남학생이 마지막에 \"Can we go October 10th?\"라고 묻고 여학생이 \"Sure\"라고 답해 두 사람이 10월 10일에 가기로 했음을 확인할 수 있다.",
  },
  { set: "고3 3회", no: 10, tableLabel: [2, "Booth C"] },
  { set: "고3 10회", no: 10, tableLabel: [2, "Site C"] },
];

const { data: prof } = await admin.from("profiles").select("academy_id").eq("username", "js83719392").single();
const { data: sets } = await admin
  .from("listening_sets")
  .select("id, title, speech_speed")
  .eq("academy_id", prof!.academy_id);

const pick = async (title: string, no: number, cols: string) => {
  const s = sets!.find((x) => x.title === title);
  if (!s) return null;
  const { data } = await admin.from("listening_questions").select(cols).eq("set_id", s.id).eq("order_index", no).single();
  return data ? { set: s, q: data as Record<string, unknown> } : null;
};

let n = 0;

for (const f of DROP_NAME_COLUMN) {
  const hit = await pick(f.set, f.no, "id, instruction, table_data");
  if (!hit) continue;
  const td = hit.q.table_data as { rows?: Array<{ label: string; value: string }> } | null;
  if (!td?.rows) continue;
  const rows = td.rows.map((r) => ({
    ...r,
    // "Name: Gyuri / Style: Long / …" 에서 첫 칸만 뗀다
    value: String(r.value).split("/").slice(1).join("/").trim(),
  }));
  console.log(`${f.set} ${f.no}번 — 표에서 이름 열 뺌`);
  console.log(`   ${td.rows[0]!.value}  →  ${rows[0]!.value}`);
  if (f.instruction) console.log(`   지시: ${hit.q.instruction} → ${f.instruction}`);
  if (apply) {
    const patch: Record<string, unknown> = { table_data: { ...td, rows } };
    if (f.instruction) patch.instruction = f.instruction;
    const { error } = await admin.from("listening_questions").update(patch).eq("id", hit.q.id as string);
    if (error) throw new Error(`${f.set} ${f.no}번: ${error.message}`);
  }
  n += 1;
}

for (const f of SCRIPT_EDITS) {
  const hit = await pick(f.set, f.no, "id, script_text");
  if (!hit) continue;
  const before = String(hit.q.script_text ?? "");
  if (!before.includes(f.from)) {
    console.log(`[그 말 없음] ${f.set} ${f.no}번`);
    continue;
  }
  const after = before.split(f.from).join(f.to);
  console.log(`${f.set} ${f.no}번 — 대본에서 보기 번호를 뺌`);
  console.log(`   "${f.from}"  →  "${f.to}"`);
  if (apply) {
    const { error } = await admin
      .from("listening_questions")
      .update({ script_text: after, dictation_blank_items: null, dictation_blank_variants: null, dictation_prepared_at: null })
      .eq("id", hit.q.id as string);
    if (error) throw new Error(`${f.set} ${f.no}번: ${error.message}`);
    const res = await generateSetQuestionAudio({
      setId: hit.set.id,
      speechSpeed: hit.set.speech_speed ?? undefined,
      questionIds: [hit.q.id as string],
      skipExisting: false,
    });
    console.log(`   음성: ${res.map((x) => (x.ok ? "됨" : `실패(${x.message})`)).join(", ")}`);
    const d = await ensureDictationPreparedForSet(hit.set.id);
    console.log(`   받아쓰기: 됨 ${d.ok} · 건너뜀 ${d.skipped} · 실패 ${d.failed}`);
  }
  n += 1;
}

for (const f of SMALL) {
  const hit = await pick(f.set, f.no, "id, question_text, explanation, table_data");
  if (!hit) continue;
  const patch: Record<string, unknown> = {};
  if (f.questionText && f.questionText !== hit.q.question_text) patch.question_text = f.questionText;
  if (f.explanation) patch.explanation = f.explanation;
  if (f.tableLabel) {
    const td = hit.q.table_data as { rows?: Array<{ label: string; value: string }> } | null;
    if (td?.rows?.[f.tableLabel[0]]) {
      const rows = td.rows.map((r, i) =>
        i === f.tableLabel![0] ? { ...r, value: String(r.value).replace(/^[^/]+/, `${f.tableLabel![1]} `) } : r
      );
      patch.table_data = { ...td, rows };
      console.log(`   표 ${f.tableLabel[0] + 1}행: ${td.rows[f.tableLabel[0]]!.value.split("/")[0]} → ${f.tableLabel[1]}`);
    }
  }
  if (Object.keys(patch).length === 0) {
    console.log(`[이미 맞음] ${f.set} ${f.no}번`);
    continue;
  }
  console.log(`${f.set} ${f.no}번 손봄`);
  if (patch.question_text) console.log(`   말하는 이: ${hit.q.question_text} → ${patch.question_text}`);
  if (patch.explanation) console.log(`   해설 고침(남녀 뒤바뀜)`);
  if (apply) {
    const { error } = await admin.from("listening_questions").update(patch).eq("id", hit.q.id as string);
    if (error) throw new Error(`${f.set} ${f.no}번: ${error.message}`);
  }
  n += 1;
}

console.log(`${apply ? "적용함" : "미리보기"} — ${n}개`);
if (!apply) console.log("적용하려면 --적용 을 붙이세요.");

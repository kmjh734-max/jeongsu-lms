/**
 * 대본이 한 줄뿐인(잘린) 문항 다시 만들기 — 중3 15회 2번.
 * 앱의 "문항 1개 다시 만들기"와 같은 경로(generateSingleExamQuestion → replaceGeneratedQuestion)로
 * 대본·선택지를 새로 만들고, 음원을 만든 뒤 사본 6개 학원에 복사한다 (사본은 같은 음원 파일을 함께 쓴다).
 *
 * 단계 (유료 단계는 --apply 가 있어야 실행)
 *   1) 미리보기:           npx --yes tsx --tsconfig tsconfig.json scripts/listening-fixes/06-regen-truncated.ts
 *   2) 정수학원 문항 새로:  ... 06-regen-truncated.ts --generate --apply   (유료: 문항 생성 1회)
 *   3) 정수학원 음원:       ... 06-regen-truncated.ts --audio --apply      (유료: 음성 합성)
 *   4) 사본에 복사:         ... 06-regen-truncated.ts --propagate --apply
 */
import {
  APPLY,
  admin,
  findTemplate,
  keyOf,
  loadAll,
  slugOf,
  writeBackup,
  type Loaded,
  type Row,
} from "./lib";
import { assertListeningOpenAiEnv } from "../../src/lib/listening/assert-listening-openai";
import { generateSingleExamQuestion } from "../../src/lib/listening/generate-questions";
import { replaceGeneratedQuestion } from "../../src/lib/listening/persist-questions";
import { generateQuestionAudio } from "../../src/lib/listening/generate-audio";
import { scriptTooShortReason } from "../../src/lib/listening/parse-listening-response";
import { DICTATION_RESET_FIELDS } from "../../src/lib/listening/dictation/reset-fields";
import type { ListeningGradeLevel } from "../../src/lib/listening/grade-level";

const TITLE = "중3 15회";
const ORDER = 2;
const TYPE_ID = 2;

/** 사본에 그대로 옮길 문항 필드 (id·set_id·created_at 제외 전부) */
const SKIP_FIELDS = new Set(["id", "set_id", "created_at"]);

function describe(d: Loaded, q: Row): void {
  console.log(`■ ${keyOf(d, q)} [${q.question_type}] ${q.instruction}`);
  console.log(`  ${q.choices.map((c, i) => `${i + 1 === q.correct_answer ? "*" : " "}${i + 1}) ${c}`).join("  ")}`);
  for (const s of d.segmentsByQuestion.get(q.id) ?? []) console.log(`    ${s.speaker_type}: ${s.text}`);
  console.log(`  해설: ${q.explanation}`);
  console.log(`  음원: ${q.audio_url ?? "(없음)"}`);
  console.log(`  검토 표시: ${q.needs_review} · 규칙 점수 ${q.quality_score}`);
}

async function main() {
  const d = await loadAll({ titles: [TITLE] });
  const q = findTemplate(d, TITLE, ORDER);
  if (!q) throw new Error(`${TITLE} ${ORDER}번 없음`);
  const set = d.setById.get(q.set_id)!;
  const segs = (d.segmentsByQuestion.get(q.id) ?? []).map((s) => ({ speaker: s.speaker_type, text: s.text }));
  const short = scriptTooShortReason(segs, TYPE_ID, set.grade_level as ListeningGradeLevel, q.instruction);
  describe(d, q);
  console.log(`  대본 상태: ${short ?? "정상 분량"}`);

  if (process.argv.includes("--generate")) {
    if (!short) {
      console.log("\n이미 정상 분량 대본입니다 — 다시 만들지 않습니다.");
      return;
    }
    if (!APPLY) {
      console.log("\n(미리보기) --generate --apply 로 실행하면 새 문항을 만듭니다 (유료 1회).");
      return;
    }
    console.log(`백업: ${writeBackup("06-regen-truncated-jeongsu", d, [q])}`);
    const { apiKey } = assertListeningOpenAiEnv();
    const prevAnswer = q.choices[q.correct_answer - 1] ?? "";
    const generated = await generateSingleExamQuestion(
      apiKey,
      TYPE_ID,
      "auto",
      [`이전 문항은 대본이 한 줄("${segs.map((s) => s.text).join(" ")}")뿐이라 풀 수 없었다. 6~10턴의 완전한 대화로 새로 만든다.`],
      set.grade_level as ListeningGradeLevel,
      ORDER,
      undefined,
      { usedAnswers: prevAnswer ? [prevAnswer] : [] }
    );
    await replaceGeneratedQuestion(q.set_id, q.id, generated, set.grade_level as ListeningGradeLevel);
    const fresh = await loadAll({ titles: [TITLE] });
    describe(fresh, findTemplate(fresh, TITLE, ORDER)!);
    console.log("\n대본을 확인한 뒤 --audio --apply 로 음원을 만드세요.");
    return;
  }

  if (process.argv.includes("--audio")) {
    if (short) throw new Error("대본이 아직 잘린 상태입니다. 먼저 --generate 하세요.");
    if (!APPLY) {
      console.log("\n(미리보기) --audio --apply 로 실행하면 음원을 만듭니다 (유료).");
      return;
    }
    const { data: setRow } = await admin.from("listening_sets").select("speech_speed").eq("id", q.set_id).maybeSingle();
    const result = await generateQuestionAudio({
      setId: q.set_id,
      questionId: q.id,
      speechSpeed: typeof setRow?.speech_speed === "number" ? setRow.speech_speed : undefined,
      skipRepair: true,
    });
    console.log(`음원 저장: ${result.audioUrl}`);
    return;
  }

  if (process.argv.includes("--propagate")) {
    if (short || !String(q.audio_url ?? "").trim()) {
      throw new Error("원본이 아직 새 대본·음원을 갖지 않았습니다.");
    }
    const copies = d.questions.filter(
      (r) => r.id !== q.id && r.order_index === ORDER && d.setById.get(r.set_id)?.title === TITLE && slugOf(d, r) !== "jeongsu"
    );
    const templateSegs = d.segmentsByQuestion.get(q.id) ?? [];
    const patch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(q)) if (!SKIP_FIELDS.has(k)) patch[k] = v;
    Object.assign(patch, DICTATION_RESET_FIELDS);
    const todo = copies.filter((r) => r.script_text !== q.script_text || r.audio_url !== q.audio_url);
    console.log(`\n사본 ${todo.length}개에 복사: ${todo.map((r) => slugOf(d, r)).join(", ")}`);
    if (!APPLY) {
      console.log("(미리보기) --propagate --apply 로 저장합니다.");
      return;
    }
    if (todo.length === 0) return;
    console.log(`백업: ${writeBackup("06-regen-truncated-copies", d, todo)}`);
    for (const r of todo) {
      const { error: upErr } = await admin.from("listening_questions").update(patch).eq("id", r.id);
      if (upErr) throw new Error(upErr.message);
      await admin.from("listening_question_segments").delete().eq("question_id", r.id);
      const { error: insErr } = await admin.from("listening_question_segments").insert(
        templateSegs.map((s) => ({
          question_id: r.id,
          order_index: s.order_index,
          speaker_type: s.speaker_type,
          text: s.text,
          voice_name: s.voice_name,
          audio_url: s.audio_url,
          duration_ms: s.duration_ms,
        }))
      );
      if (insErr) throw new Error(insErr.message);
    }
    console.log(`저장 완료 ${todo.length}행`);
    return;
  }

  console.log("\n단계를 고르세요: --generate | --audio | --propagate (저장하려면 --apply)");
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});

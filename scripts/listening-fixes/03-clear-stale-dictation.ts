/**
 * 받아쓰기 빈칸 비우기 (다음 준비 때 지금 대본으로 다시 만든다).
 *   - 대본을 고친 뒤에도 예전 빈칸이 남아 새 음원과 다른 문항 (그림 불일치·표 선택 등)
 *   - "What am I?"의 What, "Yes." 같은 뻔한 빈칸이 들어간 문항
 * 판단은 앱과 같은 기준(preparedBlanksAreStale)을 쓰고, 학원마다 행을 따로 본다
 * (빈칸은 학원별로 따로 만들어졌을 수 있음).
 *
 *   npx --yes tsx --tsconfig tsconfig.json scripts/listening-fixes/03-clear-stale-dictation.ts          (미리보기)
 *   npx --yes tsx --tsconfig tsconfig.json scripts/listening-fixes/03-clear-stale-dictation.ts --apply  (저장)
 */
import { APPLY, keyOf, loadAll, slugOf, updateQuestion, writeBackup, type Row } from "./lib";
import { preparedBlanksAreStale } from "../../src/lib/listening/dictation/prebuild-question";
import { anchorDictationBlankItems } from "../../src/lib/listening/dictation/anchor-blank-items";
import {
  filterWordOnlyBlankItems,
  isClearlyTrivialDictationBlank,
} from "../../src/lib/listening/dictation/word-only";
import type { DictationBlankItem } from "../../src/lib/listening/dictation/types";
import { DICTATION_RESET_FIELDS } from "../../src/lib/listening/dictation/reset-fields";

async function main() {
  const d = await loadAll();
  const targets: Array<{ row: Row; why: string }> = [];
  const perAcademy = new Map<string, number>();
  const byWhy = { unanchored: 0, trivial: 0 };
  for (const q of d.questions) {
    const items = q.dictation_blank_items;
    if (!Array.isArray(items) || items.length === 0) continue;
    const segs = (d.segmentsByQuestion.get(q.id) ?? []).map((s) => ({ speaker: s.speaker_type, text: s.text }));
    if (!preparedBlanksAreStale(items, q.script_text, segs)) continue;
    const wordOnly = filterWordOnlyBlankItems(items as DictationBlankItem[]);
    const anchored = anchorDictationBlankItems(wordOnly, { scriptText: q.script_text, segments: segs });
    const trivial = wordOnly.filter((i) => isClearlyTrivialDictationBlank(i)).map((i) => i.answer);
    const reasons: string[] = [];
    if (anchored.length < wordOnly.length) {
      reasons.push(`대본과 안 맞는 빈칸 ${wordOnly.length - anchored.length}/${wordOnly.length}`);
      byWhy.unanchored++;
    }
    if (trivial.length) {
      reasons.push(`뻔한 빈칸: ${trivial.join(", ")}`);
      byWhy.trivial++;
    }
    targets.push({ row: q, why: reasons.join(" · ") || "빈칸 없음" });
    perAcademy.set(slugOf(d, q), (perAcademy.get(slugOf(d, q)) ?? 0) + 1);
  }

  for (const t of targets.filter((x) => slugOf(d, x.row) === "jeongsu")) {
    console.log(`  jeongsu ${keyOf(d, t.row)} — ${t.why}`);
  }
  console.log(`\n대상 ${targets.length}행 (대본 불일치 ${byWhy.unanchored}, 뻔한 빈칸 ${byWhy.trivial}; 겹칠 수 있음)`);
  console.log(`학원별: ${[...perAcademy.entries()].map(([k, v]) => `${k} ${v}`).join(", ")}`);

  if (!APPLY) {
    console.log("\n(미리보기만 했습니다. 저장하려면 --apply 를 붙여 다시 실행하세요.)");
    return;
  }
  const file = writeBackup("03-clear-stale-dictation", d, targets.map((t) => t.row));
  console.log(`백업: ${file}`);
  for (const t of targets) await updateQuestion(t.row.id, { ...DICTATION_RESET_FIELDS });
  console.log(`저장 완료: ${targets.length}행 (다음에 학생이 풀 때 새 대본으로 빈칸을 다시 만든다)`);
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});

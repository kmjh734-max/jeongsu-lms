/**
 * 음원이 없는 사본 문항에 원본(정수학원) 음원 주소를 넣는다.
 * 사본은 원본과 대본이 글자까지 같아야만 채운다 (같은 음원 파일을 함께 쓰는 기존 방식과 동일, 추가 비용 없음).
 *
 *   npx --yes tsx --tsconfig tsconfig.json scripts/listening-fixes/04-copy-missing-audio.ts          (미리보기)
 *   npx --yes tsx --tsconfig tsconfig.json scripts/listening-fixes/04-copy-missing-audio.ts --apply  (저장)
 */
import {
  APPLY,
  TEMPLATE_SLUG,
  contentSignature,
  keyOf,
  loadAll,
  slugOf,
  updateQuestion,
  writeBackup,
  type Row,
} from "./lib";

async function main() {
  const d = await loadAll();
  const targets: Array<{ row: Row; audio: string }> = [];
  for (const q of d.questions) {
    if (slugOf(d, q) === TEMPLATE_SLUG) continue;
    if (String(q.audio_url ?? "").trim()) continue;
    const title = d.setById.get(q.set_id)?.title;
    const template = d.questions.find(
      (t) =>
        slugOf(d, t) === TEMPLATE_SLUG &&
        t.order_index === q.order_index &&
        d.setById.get(t.set_id)?.title === title
    );
    const audio = String(template?.audio_url ?? "").trim();
    if (!template || !audio) {
      console.log(`  ⚠ ${slugOf(d, q)} ${keyOf(d, q)}: 원본 음원이 없어 건너뜀`);
      continue;
    }
    if (contentSignature(d, template) !== contentSignature(d, q)) {
      console.log(`  ⚠ ${slugOf(d, q)} ${keyOf(d, q)}: 원본과 대본이 달라 건너뜀`);
      continue;
    }
    console.log(`  ${slugOf(d, q)} ${keyOf(d, q)}\n    audio_url: null → ${audio}`);
    targets.push({ row: q, audio });
  }
  console.log(`\n대상 ${targets.length}행`);
  if (!APPLY) {
    console.log("(미리보기만 했습니다. 저장하려면 --apply 를 붙여 다시 실행하세요.)");
    return;
  }
  if (targets.length === 0) return;
  const file = writeBackup("04-copy-missing-audio", d, targets.map((t) => t.row));
  console.log(`백업: ${file}`);
  for (const t of targets) await updateQuestion(t.row.id, { audio_url: t.audio });
  console.log(`저장 완료: ${targets.length}행`);
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});

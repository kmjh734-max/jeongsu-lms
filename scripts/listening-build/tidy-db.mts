/**
 * 듣기 세트를 학원마다 학년 폴더 하나로 모으고, 제목·정렬·공개를 맞춘다.
 *
 * 세트는 학원마다 사본이 따로 있다. 제목이 같아 보여도 academy_id 가 다르면
 * 남의 학원 것이므로 지우지 않는다. 이 스크립트는 학원별로 따로 정리한다.
 *   node ... tidy-listening.mts          ← 무엇이 바뀌는지만 찍는다
 *   node ... tidy-listening.mts --적용   ← 실제로 고친다
 */
import { createAdminClient } from "@/lib/supabase/admin";

const apply = process.argv.includes("--적용");
const admin = createAdminClient();

const GRADES = [
  { level: "middle1", folder: "중1 듣기", order: 0 },
  { level: "middle2", folder: "중2 듣기", order: 1 },
  { level: "middle3", folder: "중3 듣기", order: 2 },
  { level: "high1", folder: "고1 듣기", order: 3 },
  { level: "high2", folder: "고2 듣기", order: 4 },
  { level: "high3", folder: "고3 듣기", order: 5 },
];

/** "고1 듣기 3회" → "고1 3회" */
function tidyTitle(title: string): string {
  return title.replace(/\s*듣기\s*/g, " ").replace(/\s+/g, " ").trim();
}
function roundOf(title: string): number {
  return Number(/(\d+)\s*회/.exec(title)?.[1] ?? 0);
}

const { data: acs } = await admin.from("academies").select("id, name");
const acName = new Map((acs ?? []).map((a) => [String(a.id), String(a.name)]));

const { data: sets } = await admin
  .from("listening_sets")
  .select("id, title, academy_id, folder_id, grade_level, is_published, order_index");
const { data: folders } = await admin.from("listening_set_folders").select("id, name, teacher_id, created_by");

/** 폴더가 어느 학원 것인지 — 안에 든 세트로 정한다 */
const folderAcademy = new Map<string, string>();
for (const f of folders ?? []) {
  const inside = (sets ?? []).filter((s) => String(s.folder_id) === String(f.id));
  if (inside.length) folderAcademy.set(String(f.id), String(inside[0]!.academy_id));
}

const plan = {
  renameTitle: [] as Array<{ id: string; from: string; to: string }>,
  publish: [] as string[],
  order: [] as Array<{ id: string; order: number }>,
  moveSet: [] as Array<{ id: string; title: string; toFolder: string; folderName: string }>,
  renameFolder: [] as Array<{ id: string; from: string; to: string; order: number }>,
  dropFolder: [] as Array<{ id: string; name: string }>,
  newFolder: [] as Array<{ academy: string; name: string; order: number }>,
};

const academies = [...new Set((sets ?? []).map((s) => String(s.academy_id)))];

for (const ac of academies) {
  const mine = (sets ?? []).filter((s) => String(s.academy_id) === ac);
  const myFolders = (folders ?? []).filter((f) => folderAcademy.get(String(f.id)) === ac);

  for (const g of GRADES) {
    const ofGrade = mine.filter((s) => String(s.grade_level) === g.level);
    if (ofGrade.length === 0) continue;

    // 이 학년 세트가 가장 많이 들어 있는 폴더를 남길 폴더로 고른다
    const tally = new Map<string, number>();
    for (const s of ofGrade) {
      if (!s.folder_id) continue;
      tally.set(String(s.folder_id), (tally.get(String(s.folder_id)) ?? 0) + 1);
    }
    const keep = [...tally].sort((a, b) => b[1] - a[1])[0]?.[0];
    if (!keep) {
      plan.newFolder.push({ academy: acName.get(ac) ?? ac, name: g.folder, order: g.order });
      continue;
    }
    const keepFolder = myFolders.find((f) => String(f.id) === keep)!;
    if (String(keepFolder.name) !== g.folder) {
      plan.renameFolder.push({ id: keep, from: String(keepFolder.name), to: g.folder, order: g.order });
    } else {
      plan.renameFolder.push({ id: keep, from: g.folder, to: g.folder, order: g.order });
    }

    for (const s of ofGrade) {
      if (String(s.folder_id) !== keep) {
        plan.moveSet.push({ id: String(s.id), title: String(s.title), toFolder: keep, folderName: g.folder });
      }
      const tidy = tidyTitle(String(s.title));
      if (tidy !== String(s.title)) plan.renameTitle.push({ id: String(s.id), from: String(s.title), to: tidy });
      const n = roundOf(String(s.title));
      if (n && Number(s.order_index) !== n) plan.order.push({ id: String(s.id), order: n });
      if (!s.is_published) plan.publish.push(String(s.id));
    }
  }
}

// 옮기고 나면 비는 폴더
const keptIds = new Set(plan.renameFolder.map((f) => f.id));
for (const f of folders ?? []) {
  if (keptIds.has(String(f.id))) continue;
  plan.dropFolder.push({ id: String(f.id), name: String(f.name) });
}

console.log(`제목 고칠 것         ${plan.renameTitle.length}개`);
console.log(`공개로 바꿀 것       ${plan.publish.length}개`);
console.log(`정렬 번호 넣을 것    ${plan.order.length}개`);
console.log(`폴더 옮길 세트       ${plan.moveSet.length}개`);
console.log(`폴더 이름 고칠 것    ${plan.renameFolder.filter((f) => f.from !== f.to).length}개`);
console.log(`지울 빈 폴더         ${plan.dropFolder.length}개`);
console.log(`새로 만들 폴더       ${plan.newFolder.length}개`);

console.log("\n-- 제목 (앞 12개)");
for (const r of plan.renameTitle.slice(0, 12)) console.log(`   ${r.from}  →  ${r.to}`);
console.log("\n-- 폴더 이름");
for (const f of plan.renameFolder.filter((x) => x.from !== x.to)) console.log(`   ${f.from}  →  ${f.to}`);
console.log("\n-- 지울 폴더");
for (const f of plan.dropFolder) console.log(`   ${f.name}  ${f.id}`);

if (!apply) {
  console.log("\n(찍어 보기만 함. 실제로 고치려면 --적용)");
  process.exit(0);
}

console.log("\n=== 고치는 중 ===");
for (const f of plan.renameFolder) {
  const { error } = await admin
    .from("listening_set_folders")
    .update({ name: f.to, order_index: f.order })
    .eq("id", f.id);
  if (error) throw new Error(`폴더 ${f.id}: ${error.message}`);
}
console.log(`폴더 ${plan.renameFolder.length}개 이름·순서 맞춤`);

for (const m of plan.moveSet) {
  const { error } = await admin.from("listening_sets").update({ folder_id: m.toFolder }).eq("id", m.id);
  if (error) throw new Error(`세트 ${m.id}: ${error.message}`);
}
console.log(`세트 ${plan.moveSet.length}개 폴더 옮김`);

for (const r of plan.renameTitle) {
  const { error } = await admin.from("listening_sets").update({ title: r.to }).eq("id", r.id);
  if (error) throw new Error(`제목 ${r.id}: ${error.message}`);
}
console.log(`제목 ${plan.renameTitle.length}개 고침`);

for (const o of plan.order) {
  const { error } = await admin.from("listening_sets").update({ order_index: o.order }).eq("id", o.id);
  if (error) throw new Error(`정렬 ${o.id}: ${error.message}`);
}
console.log(`정렬 ${plan.order.length}개 넣음`);

for (let i = 0; i < plan.publish.length; i += 50) {
  const { error } = await admin
    .from("listening_sets")
    .update({ is_published: true })
    .in("id", plan.publish.slice(i, i + 50));
  if (error) throw new Error(`공개: ${error.message}`);
}
console.log(`${plan.publish.length}개 공개로 바꿈`);

for (const f of plan.dropFolder) {
  const { count } = await admin
    .from("listening_sets")
    .select("id", { count: "exact", head: true })
    .eq("folder_id", f.id);
  if ((count ?? 0) > 0) {
    console.log(`   건너뜀 — "${f.name}"에 아직 세트 ${count}개가 있음`);
    continue;
  }
  const { error } = await admin.from("listening_set_folders").delete().eq("id", f.id);
  if (error) throw new Error(`폴더 지우기 ${f.id}: ${error.message}`);
}
console.log(`빈 폴더 ${plan.dropFolder.length}개 지움`);
console.log("끝.");

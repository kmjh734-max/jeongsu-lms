/** 세트의 빠진 음성·받아쓰기를 채우고 공개로 바꾼다 */
import { createAdminClient } from "@/lib/supabase/admin";
import { generateSetQuestionAudio } from "@/lib/listening/generate-audio";
import { ensureDictationPreparedForSet } from "@/lib/listening/dictation/prebuild-question";

const admin = createAdminClient();
const { data: prof } = await admin.from("profiles").select("academy_id").eq("username", "js83719392").single();
const { data: s } = await admin.from("listening_sets").select("id, title")
  .eq("academy_id", prof!.academy_id).eq("title", process.argv[2]!).single();
if (!s) throw new Error("세트를 못 찾았습니다.");

const res = await generateSetQuestionAudio({ setId: s.id as string, skipExisting: true });
console.log(`음성 ${res.filter((r) => r.ok !== false).length}/${res.length}개`);
await ensureDictationPreparedForSet(s.id as string, { includeVariants: false });
await admin.from("listening_sets").update({ is_published: true }).eq("id", s.id);
console.log("받아쓰기 준비·공개 끝");

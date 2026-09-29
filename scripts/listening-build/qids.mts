/** 세트의 문항 id를 번호 차례로 보여 준다.  node ... qids.mts "<세트 제목>" */
import { createAdminClient } from "@/lib/supabase/admin";
const title = process.argv[2];
const admin = createAdminClient();
const { data: set } = await admin.from("listening_sets").select("id, title").eq("title", title).single();
if (!set) throw new Error(`세트를 못 찾음: ${title}`);
const { data: qs } = await admin
  .from("listening_questions")
  .select("id, order_index, question_type")
  .eq("set_id", set.id)
  .order("order_index");
for (const q of qs ?? []) console.log(q.order_index, q.id, q.question_type);

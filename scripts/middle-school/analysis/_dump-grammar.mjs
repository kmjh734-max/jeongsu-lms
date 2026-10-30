import { createClient } from "@supabase/supabase-js";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { data } = await sb.from("ms_units").select("grammar").eq("grade", process.argv[2]).eq("publisher", "동아(윤정미)").eq("lesson_no", Number(process.argv[3])).single();
for (const g of data.grammar) { console.log(`## ${g.no}. ${g.title}`); g.points.forEach((p) => console.log("  -", p)); g.examples.slice(0, 6).forEach((x) => console.log("    ", x.en, "|", x.ko, x.fromText ? "(본문)" : "")); }

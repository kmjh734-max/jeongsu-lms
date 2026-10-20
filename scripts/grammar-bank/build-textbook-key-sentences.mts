/**
 * 교과서 본문(textbook_passages) 전부의 문장 분석을 key_sentences에 저장한다(모델 호출 없음).
 *   npx tsx --env-file=.env.local scripts/grammar-bank/build-textbook-key-sentences.mts          # 미리 보기
 *   APPLY=1 npx tsx --env-file=.env.local scripts/grammar-bank/build-textbook-key-sentences.mts  # 저장
 * 규칙(src/lib/grammar/key-sentence-analysis.ts)이나 단원문법 표가 바뀌면 다시 돌린다.
 */
import { createClient } from "@supabase/supabase-js";
import { KEY_SENTENCE_VERSION, analyzeKeySentences } from "@/lib/grammar/key-sentence-analysis";
import { splitEnglishSentences } from "@/lib/lesson-materials/split-sentences";

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});
const apply = process.env.APPLY === "1";

const rows: Array<{ id: string; label: string; english_text: string; key_sentences: { version?: string } | null }> = [];
for (let from = 0; ; from += 200) {
  const { data, error } = await db.from("textbook_passages").select("id,label,english_text,key_sentences").order("id").range(from, from + 199);
  if (error) throw error;
  rows.push(...((data ?? []) as typeof rows));
  if (!data || data.length < 200) break;
}

let sentences = 0, unit = 0, hard = 0, noUnitKey = 0, saved = 0;
for (const r of rows) {
  const a = analyzeKeySentences(splitEnglishSentences(r.english_text), r.label);
  if (!a.unitKey) noUnitKey++;
  sentences += a.sentences.length;
  unit += a.sentences.filter((s) => s.unitGrammar.length).length;
  hard += a.sentences.filter((s) => s.hard).length;
  // 같은 규칙으로 이미 저장한 것은 건너뛴다(FORCE=1이면 다시). 연결이 끊기면 세 번까지 다시.
  if (apply && (process.env.FORCE === "1" || r.key_sentences?.version !== KEY_SENTENCE_VERSION)) {
    for (let attempt = 0; ; attempt++) {
      const { error } = await db.from("textbook_passages").update({ key_sentences: a }).eq("id", r.id);
      if (!error) break;
      if (attempt >= 2) throw error;
      await new Promise((res) => setTimeout(res, 2000));
    }
    saved++;
  }
}
console.log({ passages: rows.length, sentences, unit, hard, noUnitKey, saved });

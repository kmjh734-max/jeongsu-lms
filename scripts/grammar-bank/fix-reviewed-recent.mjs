import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match && !process.env[match[1]]) {
    process.env[match[1]] = match[2].replace(/^"|"$/g, "");
  }
}

// 2026-10-02: 중학영문법 3800제 신규 적재분을 문항별로 검수한 결과.
// id와 source_file을 함께 확인해 다른 문항을 잘못 수정하지 않도록 한다.
const fixes = [
  { id: 64861, answer: "It is disappointing that she lied to me." },
  { id: 65001, answer: "must" },
  { id: 65002, answer: "The taxi is being repaired by Mom in the garage." },
  { id: 65004, answer: "Lunch was being prepared for his wife and children by him." },
  { id: 65005, answer: "I was taught English grammar by my sister. / English grammar was taught to me by my sister." },
  { id: 65007, answer: "I was given an honest opinion by him. / An honest opinion was given to me by him." },
  { id: 65008, answer: "I will be made a wooden boat by my grandmother. / A wooden boat will be made for me by my grandmother." },
  { id: 65071, answer: "alive" },
  { id: 65073, answer: "the first ten" },
  {
    id: 65160,
    body: [
      "The reason why I'm listening to this radio show is that it is educational.",
      "= The reason _____ is that it is educational.",
    ],
    answer: "for which I'm listening to this radio show / which[that] I'm listening to this radio show for",
  },
  { id: 65301, answer: "She's at home." },
  {
    id: 65453,
    prompt: "다음 문장의 빈칸에 알맞은 재귀대명사를 쓰고, 어떤 용법으로 쓰였는지 고르세요.",
    body: ["Ann wants to stay here by _____ . [ 재귀 / 강조 ]"],
    answer: "herself, 재귀",
  },
  {
    id: 65567,
    body: ["How far is it from here to the office?", "→ Do you know _____ ?"],
    answer: "how far it is from here to the office",
  },
  { id: 65631, answer: "Not all (of) my teammates" },
  {
    id: 65633,
    body: [
      "Tom and I met the counselor to talk about our son.",
      "= Tom and I met the counselor _____ .",
      "= Tom and I met the counselor _____ .",
    ],
    answer: "in order to[so as to] talk about our son, so that we could talk about our son",
  },
  {
    id: 65634,
    body: [
      "She sent me an e-mail to remind me of the plans.",
      "= She sent me an e-mail _____ .",
      "= She sent me an e-mail _____ .",
    ],
    answer: "in order to[so as to] remind me of the plans, so that she could remind me of the plans",
  },
  {
    id: 65648,
    body: [
      "그녀는 교회에서 새 친구들을 사귀느라고 바빴다.",
      "= She was _____ new friends in the church. (make)",
    ],
    answer: "busy making",
  },
  { id: 65650, answer: "my brother's[my brother] wearing my clothes" },
  { id: 65652, answer: "the woman's[the woman] entering when we were having breakfast" },
  {
    id: 65673,
    body: ["She used to like to wear these black two large shirts."],
    answer: "these two large black shirts",
  },
  {
    id: 65687,
    answer: "before",
  },
  {
    id: 65691,
    body: ["If you _____ the last person to leave the basement, turn the lights off. (be)"],
    answer: "are",
  },
  {
    id: 65698,
    body: ["As Dan saw a scary movie at night by himself, he couldn't fall asleep.", "→ _____"],
    answer: "If Dan had not seen a scary movie at night by himself, he could have fallen asleep.",
  },
  {
    id: 65734,
    answer: "in which there live various kinds of animals / which[that] various kinds of animals live in",
  },
  { id: 65746, answer: "Unless you are generous with it, you might get into trouble." },
  { id: 65749, answer: "when" },
  { id: 65750, answer: "When" },
  { id: 65752, answer: "even if" },
];

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

let changed = 0;
for (const fix of fixes) {
  const { id, ...patch } = fix;
  const { data, error } = await admin
    .from("grammar_bank_questions")
    .update(patch)
    .eq("id", id)
    .like("source_file", "중학영문법 3800제%")
    .select("id");
  if (error) throw new Error(`${id}: ${error.message}`);
  if (data?.length !== 1) throw new Error(`${id}: 수정 대상이 정확히 1개가 아닙니다.`);
  changed += 1;
}

console.log(`검수 수정 완료: ${changed}문항`);

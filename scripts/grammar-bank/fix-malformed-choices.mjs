import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^"|"$/g, "");
}

const fixes = [
  { id: 12911, choices: [
    { no: 1, text: "[[as]] documentary evidence, especially when the items were produced before photography became common. Sketches of soldiers on a battlefield, paintings of English country villages or portraits of Dutch townspeople can provide the only visual evidence of a long-ago place, person or time. But art can also carry aesthetic value," },
    { no: 2, text: "[[which]] elevates the job of evaluation into another realm. Aesthetic value and the notion of artistic beauty are important considerations," },
    { no: 3, text: "[[that]] are not what motivates archival preservation in the first instance. The best archival decisions about art do not focus on territoriality (this object belongs in my institution" },
    { no: 4, text: "[[even though]] I do not have the resources to care for it) or on questions of monetary value or prestige (this object raises the cultural standing of my institution). The best decisions focus on" },
    { no: 5, text: "[[what]] evidential value exists and what is best for the item." },
  ]},
  { id: 40751, choices: [
    { no: 1, text: "were - avoid" }, { no: 2, text: "were - avoided" },
    { no: 3, text: "had been - had avoided" }, { no: 4, text: "had been - avoid" },
    { no: 5, text: "had been - have avoided" },
  ]},
  { id: 48031, body: ["Jack was glad to find his phone.", "<보기>"], choices: [
    { no: 1, text: "It is time to go to church." }, { no: 2, text: "I have a scarf to wash." },
    { no: 3, text: "I was excited to buy a new bus." }, { no: 4, text: "His dream is to be a great actor." },
    { no: 5, text: "They decided to help poor people." },
  ]},
  { id: 48543, choices: [
    { no: 1, text: "a, d" }, { no: 2, text: "c, d" }, { no: 3, text: "a, b, d" },
    { no: 4, text: "a, b, e" }, { no: 5, text: "c, d, e" },
  ]},
  { id: 48629, body: [], choices: [
    { no: 1, text: "A: How old are you? / B: I’m fourteen years old." },
    { no: 2, text: "A: How often do you cook? / B: I never cook." },
    { no: 3, text: "A: How many cookies did you eat? / B: I ate eight." },
    { no: 4, text: "A: How long will you stay in Spain? / B: It takes ten hours by bike." },
    { no: 5, text: "A: How far is it from your cottage to the post office? / B: It’s only 300 meters." },
  ]},
  { id: 48767, choices: [
    { no: 1, text: "You had not better go out today. → had better not" },
    { no: 2, text: "I would like have a soup. → having" },
    { no: 3, text: "You will must call him first. → will have to" },
    { no: 4, text: "He is able to not swim well. → is not able to" },
    { no: 5, text: "I used going to church on foot. → to go" },
  ]},
  { id: 48819, choices: [
    { no: 1, text: "Arabic is so difficult to write. → enough difficult" },
    { no: 2, text: "I’m so sad hear about his death. → hearing" },
    { no: 3, text: "It is careless to you to break the glass. → for you" },
    { no: 4, text: "He has five sons to take care. → to take care of" },
    { no: 5, text: "I had something tell him. → to told" },
  ]},
  { id: 48949, body: [], choices: [
    { no: 1, text: "My watch was stolen." }, { no: 2, text: "Were you hit by the snowball?" },
    { no: 3, text: "The file was sent to me by Nora." },
    { no: 4, text: "The show will being finished in twenty minutes." },
    { no: 5, text: "Tom was expected to come to the contest." },
  ]},
  { id: 49134, body: [], choices: [
    { no: 1, text: "It’s the last message that she sent." }, { no: 2, text: "It’s the last message why she sent." },
    { no: 3, text: "It’s the last message what she sent." }, { no: 4, text: "It’s the last message whom she sent." },
    { no: 5, text: "It’s the last message whose she sent." },
  ]},
  { id: 49199, body: [], choices: [
    { no: 1, text: "He asked me if did I like movies." }, { no: 2, text: "She asked me who had broken the glass." },
    { no: 3, text: "Mia asked me where my hometown was." }, { no: 4, text: "Dan said that he had met Jay on the street." },
    { no: 5, text: "He told me that he was looking for his cell phone." },
  ]},
  { id: 49332, body: [], choices: [
    { no: 1, text: "He is always worried about money." }, { no: 2, text: "This tea table is made of oak wood." },
    { no: 3, text: "Jessica is interested in knitting." }, { no: 4, text: "The castle is crowded to many people." },
    { no: 5, text: "The river was covered with snow." },
  ]},
  { id: 49462, body: [], choices: [
    { no: 1, text: "Don’t touch the sleeping tiger." }, { no: 2, text: "She is writing an email to her teammate." },
    { no: 3, text: "His hobby is collecting stamps." }, { no: 4, text: "Do you know the girl standing over there?" },
    { no: 5, text: "I smelled something burning in the room." },
  ]},
  { id: 49503, body: [], choices: [
    { no: 1, text: "It is getting warmer and warmer." }, { no: 2, text: "Rebecca walked as quietly as possible." },
    { no: 3, text: "The earlier you go to bed, the earlier you’ll get up." },
    { no: 4, text: "He is one of the closest friend of mine in church." },
    { no: 5, text: "It is the most boring play I’ve ever watched." },
  ]},
  { id: 49599, body: [], choices: [
    { no: 1, text: "This is the way how I made a decision." },
    { no: 2, text: "There was a time when salt was more valuable than gold." },
    { no: 3, text: "She liked the boy whose hobby was taking pictures." },
    { no: 4, text: "A café that sells good juice is near here." }, { no: 5, text: "Whoever calls, tell them I’m sleeping." },
  ]},
  { id: 49607, body: [], choices: [
    { no: 1, text: "I like the sweater that you’re wearing." }, { no: 2, text: "I don’t know the man who is sitting behind me." },
    { no: 3, text: "This is the building in which my father works." },
    { no: 4, text: "The woman whom Alice is talking to is her secretary." },
    { no: 5, text: "A fortune hamburger is a dessert that is served in Chinese factories." },
  ]},
  { id: 49718, body: [], choices: [
    { no: 1, text: "I do agree with you about this." }, { no: 2, text: "Not all children learn the same way." },
    { no: 3, text: "Jake, my old teammate, lives near my cottage." },
    { no: 4, text: "Little I knew what the movie was about." },
    { no: 5, text: "It was a year ago that I started learning Chinese." },
  ]},
  { id: 49719, body: [], choices: [
    { no: 1, text: "It was you that cheered me up. → 날 힘이 나게 해 준 사람은 바로 너였어." },
    { no: 2, text: "Not all people like new things. → 모든 사람들은 새것을 좋아하지 않는다." },
    { no: 3, text: "None of us knew the road was under construction. → 우리 중 아무도 도로가 공사 중인 것을 몰랐다." },
    { no: 4, text: "Never have I been to a factory by myself. → 나는 혼자서 공장에 가 본 적이 없다." },
    { no: 5, text: "It was Canada that won the World Cup trophy in 2018. → 2018년에 월드컵 트로피를 수상한 것은 캐나다였다." },
  ]},
  { id: 57136, body: [], choices: [
    { no: 1, text: "_____ we have any homework?" }, { no: 2, text: "_____ your dad enjoy juice?" },
    { no: 3, text: "_____ they have lunch together?" }, { no: 4, text: "_____ you like animals?" },
    { no: 5, text: "_____ your friends usually take the bike to church?" },
  ]},
];

const deleteIds = [37602,37613,37614,40747,47784,47822,47870,47986,48133,48361,48362,48443,48571,48572,48574,48628,48630,48902,49425,50276,50805,50965,50977,50991,51022,51312,51380,57176];

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
for (const { id, ...patch } of fixes) {
  const { data, error } = await admin.from("grammar_bank_questions").update(patch).eq("id", id).select("id");
  if (error) throw new Error(`${id}: ${error.message}`);
  if (data?.length !== 1) throw new Error(`${id}: 수정 대상 오류`);
}
const { data, error } = await admin.from("grammar_bank_questions").delete().in("id", deleteIds).select("id");
if (error) throw new Error(error.message);
if (data?.length !== deleteIds.length) throw new Error(`삭제 대상 ${deleteIds.length}개 중 ${data?.length ?? 0}개 처리`);
console.log(`선택지 복원 ${fixes.length}문항 / 문항 혼합으로 제외 ${deleteIds.length}문항`);

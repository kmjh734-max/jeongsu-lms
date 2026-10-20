/**
 * 테스트 교재 단어 정리(서버). 수업용 자료 단어 목록에 품사·지문 속 뜻·파생어를 붙이고,
 * 동의어·반의어는 핵심어에만 남긴다(선생님 요청 2026-10-19: 동반의어는 내용상 중요하거나
 * 바꿔 쓰기로 나올 만한 단어에만).
 */
import { openAiFetch } from "@/lib/ai-usage/openai-fetch";
import { findPhrase } from "@/lib/lesson-materials/one-page";
import type { LessonPackVocabItem } from "@/lib/lesson-materials/generate-lesson-pack";
import type { TestBookVocabRow } from "@/lib/lesson-materials/test-book";

const MODEL = "gpt-4o-mini";
const MAX_ROWS = 18;

const SYSTEM = `너는 한국 고등학교 영어 내신 교재의 단어장 편집자다. JSON만 출력한다.
지문과 단어 목록을 받아 단어마다 아래를 채운다.
- word: 받은 그대로(목록이 없으면 지문에서 고1~고3 수준 핵심 어휘 12~16개를 골라 원형으로).
- pos: n. v. a. ad. prep. conj. 구 가운데 하나(두 낱말 이상 어구는 "구").
- meaning: 이 지문에서 쓰인 뜻만 한국어로 짧게(쉼표로 두 개까지). 사전 첫 뜻이 아니라 문맥 뜻.
- key: 지문의 주제·흐름에 중요한 말이거나, 시험에서 동의어·반의어로 바꿔 나올 만한 말이면 true. 쉬운 기능어·고유명사·흔한 말은 false. 전체의 40~60%만 true.
- synonyms, antonyms: key가 true일 때만, 이 문맥 뜻과 맞는 것을 있는 만큼 최대 3개(한 낱말이나 짧은 구, 영어). 시험에 바꿔 나올 만한 말이 여럿이면 하나로 줄이지 말고 다 쓴다. 딱 맞는 것이 없으면 빈 배열 — 억지로 만들지 않는다. key가 false면 둘 다 빈 배열.
- forms: 이 낱말과 품사가 다른 형태를 품사마다(n. v. a. ad.) 하나씩, 실제로 쓰이는 것은 모두(최대 4개, 철자 정확히 — 시험에 「명사형은? 형용사형은? 부사형은?」으로 나온다). 명사형만 쓰고 끝내지 말고 동사형·형용사형·부사형이 있으면 다 쓴다. 원래 품사와 같은 형태는 쓰지 않는다. 예: attract → [{"word":"attraction","pos":"n."},{"word":"attractive","pos":"a."},{"word":"attractively","pos":"ad."}], durable → [{"word":"durability","pos":"n."},{"word":"durably","pos":"ad."}], creation → [{"word":"create","pos":"v."},{"word":"creative","pos":"a."},{"word":"creatively","pos":"ad."}], decide → [{"word":"decision","pos":"n."},{"word":"decisive","pos":"a."},{"word":"decisively","pos":"ad."}]. 정말 없을 때만 [].
- phrase: 시험에 나올 어구 하나를 "habit formation 습관 형성"처럼. 없으면 "".
출력: {"vocab":[{"word":"","pos":"","meaning":"","key":true,"synonyms":[],"antonyms":[],"forms":[],"phrase":""}]}`;

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const a = text.indexOf("{");
    const b = text.lastIndexOf("}");
    if (a >= 0 && b > a) {
      try {
        return JSON.parse(text.slice(a, b + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

const list = (v: unknown): string[] =>
  (Array.isArray(v) ? v : typeof v === "string" ? v.split(/[,/;]/) : [])
    .map((s) => String(s ?? "").trim())
    .filter(Boolean)
    .slice(0, 3);

const POS = new Set(["n.", "v.", "a.", "ad.", "prep.", "conj.", "구"]);

/** 파생어 품사 표기를 맞춘다(모델이 adj.·noun·adv 로 주면 예전에는 버렸다) */
function formPos(raw: string): string {
  const p = raw.trim().toLowerCase().replace(/\.$/, "");
  if (["n", "noun", "명사"].includes(p)) return "n.";
  if (["v", "verb", "동사"].includes(p)) return "v.";
  if (["a", "adj", "adjective", "형용사"].includes(p)) return "a.";
  if (["ad", "adv", "adverb", "부사"].includes(p)) return "ad.";
  return "";
}

/** 지문에 처음 나오는 자리(없으면 맨 뒤). 원형이 다르면 앞 네 글자로 한 번 더 찾는다. */
function firstAt(passage: string, word: string): number {
  const hit = findPhrase(passage, word);
  if (hit) return hit.start;
  const stem = word.split(/\s+/)[0]!.slice(0, 4);
  if (stem.length >= 4) {
    const m = passage.toLowerCase().search(new RegExp(`\\b${stem.toLowerCase().replace(/[^a-z]/g, "")}`));
    if (m >= 0) return m;
  }
  return Number.MAX_SAFE_INTEGER;
}

export async function refineTestBookVocab(input: {
  title: string;
  sentences: Array<{ english: string; korean: string }>;
  packVocab: LessonPackVocabItem[];
  /** 1장 자료 재료가 고른 핵심어(동반의어 포함) — 같은 지문에서 말이 엇갈리지 않게 참고로 준다 */
  keyHints: Array<{ surface: string; synonyms: string[]; antonyms: string[] }>;
}): Promise<TestBookVocabRow[]> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY가 설정되어 있지 않습니다.");
  const passage = input.sentences.map((s) => s.english).join(" ");
  const korean = input.sentences.map((s) => s.korean).filter(Boolean).join(" ");
  const words = input.packVocab.map((v) => `${v.word} — ${v.meaning}`).join("\n");
  const hints = input.keyHints
    .map((h) => `${h.surface}: = ${h.synonyms.join(", ") || "-"} / ↔ ${h.antonyms.join(", ") || "-"}`)
    .join("\n");
  const user = `제목: ${input.title}\n\nEN:\n${passage.slice(0, 6000)}\n\nKR:\n${korean.slice(0, 3000) || "(없음)"}\n\n단어 목록:\n${words || "(없음)"}\n\n참고(이 지문 핵심어로 이미 고른 말):\n${hints || "(없음)"}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90_000);
  try {
    const res = await openAiFetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: user },
        ],
      }),
    });
    const body = await res.text();
    if (!res.ok) throw new Error(`단어 정리를 만들지 못했습니다 (HTTP ${res.status})`);
    const envelope = parseJson(body) as { choices?: Array<{ message?: { content?: string } }> } | null;
    const parsed = parseJson(envelope?.choices?.[0]?.message?.content ?? "") as { vocab?: unknown[] } | null;
    const hintWords = new Set(input.keyHints.map((h) => h.surface.toLowerCase()));
    const rows: TestBookVocabRow[] = (Array.isArray(parsed?.vocab) ? parsed!.vocab : [])
      .map((raw) => {
        const r = raw as Record<string, unknown>;
        const word = String(r.word ?? "").trim();
        const pos = String(r.pos ?? "").trim();
        const key = r.key === true || hintWords.has(word.toLowerCase());
        const rowPos = POS.has(pos) ? pos : word.includes(" ") ? "구" : pos.slice(0, 5);
        // 동반의어에 같은 낱말의 다른 꼴(experiment = experimenting)은 넣지 않는다
        const stem = word.toLowerCase().slice(0, 5);
        const notSame = (w: string) => !(stem.length >= 5 && w.toLowerCase().startsWith(stem));
        return {
          word,
          pos: rowPos,
          meaning: String(r.meaning ?? "").trim(),
          synonyms: key ? list(r.synonyms).filter(notSame) : [],
          antonyms: key ? list(r.antonyms).filter(notSame) : [],
          forms: (Array.isArray(r.forms) ? r.forms : [])
            .map((f) => {
              const x = (f ?? {}) as Record<string, unknown>;
              return { word: String(x.word ?? "").trim(), pos: formPos(String(x.pos ?? "")) };
            })
            .filter((f) => /^[A-Za-z][A-Za-z-]*$/.test(f.word) && f.word.toLowerCase() !== word.toLowerCase() && f.pos)
            // 원래 품사와 같은 것(maintain → maintaining v.)·-ing를 동사형이라 한 것은 뺀다
            .filter((f) => f.pos !== rowPos && !(f.pos === "v." && /ing$/i.test(f.word)))
            // 품사마다 하나씩
            .filter((f, i, all) => all.findIndex((x) => x.pos === f.pos) === i)
            .slice(0, 4),
          phrase: String(r.phrase ?? "").trim().slice(0, 40),
          key,
        };
      })
      .filter((r) => r.word && r.meaning);
    // 같은 낱말은 하나만, 지문에 나온 차례로
    const seen = new Set<string>();
    const unique = rows.filter((r) => {
      const k = r.word.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    if (unique.length < 3) throw new Error("단어 정리를 충분히 만들지 못했습니다. 다시 시도해 주세요.");
    return unique
      .map((r, i) => ({ r, i, at: firstAt(passage, r.word) }))
      .sort((a, b) => a.at - b.at || a.i - b.i)
      .map((x) => x.r)
      .slice(0, MAX_ROWS);
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") throw new Error("단어 정리 시간이 초과되었습니다.");
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

const CHUNK_SYSTEM = `너는 한국 고등학교 영어 교재의 직독직해 편집자다. JSON만 출력한다.
문장마다 의미 단위(보통 2~6낱말)로 끊고, 덩어리마다 그 자리의 뜻을 한국어로 짧게 쓴다(앞에서부터 읽는 차례대로, 조사는 자연스럽게).
- en: 원문 그대로 잘라 쓴다. 덩어리를 차례로 이으면 원문 문장 전체가 되어야 한다 — 따옴표 안 말과 문장 끝까지 낱말을 하나도 빼지 않는다.
- ko: 그 덩어리 영어만 보고 앞에서부터 직역한다(덩어리 하나 = 그 낱말들의 뜻). 다른 덩어리의 말을 끌어오지 않는다. 예: "for the restoration" → "복원을 위해", "of cultural assets" → "문화재의", "under the name" → "~라는 이름으로", "has topped" → "1위를 차지했다".
출력: {"items":[{"i":0,"chunks":[{"en":"","ko":""}]}]}`;

/** 낱말 비교용: 소문자, 글자·숫자만 */
function wordKey(t: string): string {
  return t.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]/g, "");
}

/** 덩어리들을 원문 낱말에 맞춰 원문 조각으로 바꾼다. 맞지 않으면 null. */
function alignChunks(sentence: string, chunks: Array<{ en: string; ko: string }>): Array<{ en: string; ko: string }> | null {
  const tokens = sentence.split(/\s+/).filter(Boolean);
  let at = 0;
  const out: Array<{ en: string; ko: string }> = [];
  for (const c of chunks) {
    const words = c.en.split(/\s+/).map(wordKey).filter(Boolean);
    if (!words.length) continue;
    const start = at;
    for (const w of words) {
      while (at < tokens.length && !wordKey(tokens[at]!)) at++; // 문장부호만 있는 토막은 건너뛴다
      if (at >= tokens.length || wordKey(tokens[at]!) !== w) return null;
      at++;
    }
    out.push({ en: tokens.slice(start, at).join(" "), ko: c.ko });
  }
  // 남은 것이 문장부호뿐이면 마지막 덩어리에 붙이고, 낱말이 남았으면 버린다
  const rest = tokens.slice(at);
  if (rest.some((t) => wordKey(t))) return null;
  if (rest.length && out.length) out[out.length - 1]!.en += " " + rest.join(" ");
  return out;
}

/** 문장마다 직독직해 덩어리(원문 조각 + 뜻). 이어 붙인 조각이 원문과 다르면 그 문장은 null. */
export async function glossTestBookChunks(input: {
  title: string;
  sentences: Array<{ english: string; korean: string }>;
}): Promise<Array<Array<{ en: string; ko: string }> | null>> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY가 설정되어 있지 않습니다.");
  // 해석 문장은 넘기지 않는다 — 넘기면 덩어리를 직역하지 않고 해석 문장의 말을 옮겨 왔다
  const lines = input.sentences.map((s, i) => `${i}. ${s.english}`).join("\n");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90_000);
  try {
    const res = await openAiFetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: CHUNK_SYSTEM },
          { role: "user", content: `제목: ${input.title}\n\n${lines.slice(0, 12000)}` },
        ],
      }),
    });
    const body = await res.text();
    if (!res.ok) throw new Error(`직독직해를 만들지 못했습니다 (HTTP ${res.status})`);
    const envelope = parseJson(body) as { choices?: Array<{ message?: { content?: string } }> } | null;
    const parsed = parseJson(envelope?.choices?.[0]?.message?.content ?? "") as { items?: unknown[] } | null;
    const out: Array<Array<{ en: string; ko: string }> | null> = input.sentences.map(() => null);
    for (const raw of Array.isArray(parsed?.items) ? parsed!.items : []) {
      const r = (raw ?? {}) as { i?: unknown; chunks?: unknown };
      const i = Number(r.i);
      if (!Number.isInteger(i) || i < 0 || i >= out.length) continue;
      const chunks = (Array.isArray(r.chunks) ? r.chunks : [])
        .map((c) => {
          const x = (c ?? {}) as Record<string, unknown>;
          return { en: String(x.en ?? "").trim(), ko: String(x.ko ?? "").trim() };
        })
        .filter((c) => c.en);
      // 덩어리를 원문 낱말에 차례로 맞춘다. 덩어리 글은 원문에서 그대로 잘라 문장부호·따옴표를 살리고,
      // 낱말이 빠지거나 바뀐 문장은 버린다(그 문장은 한줄해석을 전체 해석으로 낸다).
      const aligned = alignChunks(input.sentences[i]!.english, chunks);
      if (aligned && aligned.length >= 2 && aligned.every((c) => c.ko)) out[i] = aligned;
    }
    return out;
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") throw new Error("직독직해 시간이 초과되었습니다.");
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

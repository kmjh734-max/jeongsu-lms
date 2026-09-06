import type { StoredBlankCandidatePool } from "@/lib/lesson-materials/workbook-blank-cache";

export type LessonPackVocabItem = {
  word: string;
  meaning: string; // e.g. "a. 생산적인"
  synonyms: string[];
  antonyms: string[];
};

export type LessonPackData = {
  headerLabel: string;
  vocab: LessonPackVocabItem[];
  updatedAt?: string;
  /** Ranked blank-fill candidates for workbook reuse (no OpenAI on cache hit) */
  blankCandidatePool?: StoredBlankCandidatePool | null;
  passageSourceHash?: string;
};

function parseJsonSafe<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function toList(v: unknown): string[] {
  if (Array.isArray(v)) {
    return v.map((s) => String(s ?? "").trim()).filter(Boolean);
  }
  if (typeof v === "string" && v.trim()) {
    return v
      .split(/[,/|；;]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function parseVocabRows(raw: unknown[]): LessonPackVocabItem[] {
  return raw
    .map((row) => {
      const r = row as Record<string, unknown>;
      const word = String(r.word ?? "").trim();
      const meaning = String(r.meaning ?? "").trim();
      const synonyms = toList(r.synonyms ?? r.synonym);
      const antonyms = toList(
        r.antonyms ?? r.antonym ?? r.opposites ?? r.opposite
      );
      return { word, meaning, synonyms, antonyms };
    })
    .filter((v) => v.word && v.meaning);
}

/** True when vocab exists but antonyms look like the old empty-AI output. */
export function vocabNeedsAntonymRefresh(vocab: LessonPackVocabItem[]): boolean {
  if (!vocab.length) return true;
  const withAnt = vocab.filter((v) => v.antonyms.length > 0).length;
  const withSyn = vocab.filter((v) => v.synonyms.length > 0).length;
  // Synonyms filled but antonyms almost empty → regenerate
  if (withSyn >= 3 && withAnt < Math.max(2, Math.ceil(vocab.length * 0.4))) {
    return true;
  }
  return false;
}

const SYSTEM = `너는 한국 중·고등 영어 지문에서 수업용 어휘를 정리하는 편집자다.
반드시 JSON만 반환:
{
  "vocab": [
    {
      "word": "fallacy",
      "meaning": "n. 오류, 잘못된 생각",
      "synonyms": ["falsehood", "illusion"],
      "antonyms": ["truth", "fact"]
    }
  ]
}

규칙:
- vocab는 지문에서 실제로 나온(또는 파생형으로 나온) 단어 10~14개.
- 난이도 섞기(중요): 목록의 약 40~50%는 중·고등 수업에서 자주 다루는 쉬운/기초 단어,
  나머지는 핵심·중급 단어. 너무 어려운 단어만 모으지 말 것.
  예: advance, assume, response, strain 같은 쉬운 단어도 지문에 있으면 반드시 포함.
- 제외: 관사·대명사·be동사·아주 기초 접속사(the/a/is/and/of/to 등).
- word는 기본형(lemma) 영어 단어.
- meaning은 품사 약어(a./n./v./ad. 등) + 한국어 뜻(쉽고 짧게).
- synonyms는 각 단어마다 1~3개.
- antonyms는 각 단어마다 1~3개. 대립 개념이 분명하면 반드시 넣는다.
  예: assert↔deny, advance↔retreat, assume↔know, expect↔doubt.
- 반의어가 정말 없을 때만 []. 전체 중 최대 1~2개만 빈 배열 허용.
- synonyms / antonyms 키는 반드시 문자열 배열.`;

const ANTONYM_FILL_SYSTEM = `너는 영어 어휘 반의어를 채우는 편집자다.
입력 vocab에서 antonyms가 비어 있는 항목만 채워 JSON으로 반환:
{ "vocab": [ { "word": "...", "antonyms": ["..."] } ] }
규칙:
- 입력에 있는 word만 다룰 것.
- antonyms는 1~3개 영어 단어.
- 거의 모든 단어에 반의어를 넣을 것. 불가능하면만 [].`;

async function openAiJson(
  apiKey: string,
  system: string,
  user: string,
  signal: AbortSignal
): Promise<unknown> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    signal,
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  const bodyText = await res.text();
  if (!res.ok) throw new Error(`어휘 생성 실패 (HTTP ${res.status})`);
  const envelope = parseJsonSafe<{
    choices?: { message?: { content?: string } }[];
  }>(bodyText);
  const content = envelope?.choices?.[0]?.message?.content ?? bodyText;
  return parseJsonSafe(content);
}

async function fillEmptyAntonyms(
  apiKey: string,
  vocab: LessonPackVocabItem[],
  signal: AbortSignal
): Promise<LessonPackVocabItem[]> {
  const empty = vocab.filter((v) => v.antonyms.length === 0);
  if (empty.length === 0) return vocab;

  const parsed = (await openAiJson(
    apiKey,
    ANTONYM_FILL_SYSTEM,
    `다음 단어들의 반의어를 채워라:\n${JSON.stringify(
      empty.map((v) => ({ word: v.word, meaning: v.meaning }))
    )}`,
    signal
  )) as { vocab?: unknown } | null;

  const filled = Array.isArray(parsed?.vocab) ? parsed!.vocab : [];
  const byWord = new Map<string, string[]>();
  for (const row of filled) {
    const r = row as Record<string, unknown>;
    const word = String(r.word ?? "")
      .trim()
      .toLowerCase();
    if (!word) continue;
    byWord.set(word, toList(r.antonyms ?? r.antonym));
  }

  return vocab.map((v) => {
    if (v.antonyms.length > 0) return v;
    const extra = byWord.get(v.word.toLowerCase()) ?? [];
    return extra.length ? { ...v, antonyms: extra } : v;
  });
}

export async function generateLessonPackVocab(input: {
  englishPassage: string;
  koreanPassage?: string;
  title?: string;
}): Promise<LessonPackVocabItem[]> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY가 설정되어 있지 않습니다.");

  const passage = input.englishPassage.trim().slice(0, 6000);
  if (passage.length < 20) throw new Error("지문이 너무 짧습니다.");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90_000);

  try {
    const user = `제목: ${input.title ?? "(없음)"}\n\nEN:\n${passage}\n\nKR:\n${
      (input.koreanPassage ?? "").trim() || "(없음)"
    }\n\n위 지문으로 수업용 단어 목록을 만들어라. 쉬운 단어와 핵심 단어를 함께 넣고, synonyms와 antonyms를 모두 채워라. 반의어 빈 칸이 있으면 안 된다.`;

    let vocab: LessonPackVocabItem[] = [];
    for (let attempt = 0; attempt < 2; attempt++) {
      const parsed = (await openAiJson(
        apiKey,
        SYSTEM,
        attempt === 0
          ? user
          : `${user}\n\n이전 결과에 반의어가 너무 비어 있었다. 이번에는 각 단어 antonyms를 반드시 1개 이상 넣어라.`,
        controller.signal
      )) as { vocab?: unknown } | null;
      const raw = Array.isArray(parsed?.vocab) ? parsed!.vocab : [];
      vocab = parseVocabRows(raw);
      if (vocab.length < 3) continue;
      const withAnt = vocab.filter((v) => v.antonyms.length > 0).length;
      if (withAnt >= Math.ceil(vocab.length * 0.6)) break;
    }

    if (vocab.length < 3) {
      throw new Error("어휘를 충분히 만들지 못했습니다. 다시 시도해 주세요.");
    }

    vocab = vocab.slice(0, 16);
    if (vocabNeedsAntonymRefresh(vocab)) {
      vocab = await fillEmptyAntonyms(apiKey, vocab, controller.signal);
    }
    return vocab;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("어휘 생성 시간이 초과되었습니다.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/** Fisher–Yates shuffle (non-mutating). */
export function shuffleArray<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

/** Build mixed choices for synonym/antonym tests (order randomized).
 * Always keeps every `primary` answer in the list; fills the rest with distractors.
 */
export function buildChoiceList(
  primary: string[],
  secondary: string[],
  extra: string[] = [],
  maxChoices = 6
): string[] {
  const clean = (w: string) => w.trim();
  const answers: string[] = [];
  const answerLower = new Set<string>();
  for (const w of primary) {
    const t = clean(w);
    if (!t) continue;
    const low = t.toLowerCase();
    if (answerLower.has(low)) continue;
    answerLower.add(low);
    answers.push(t);
  }

  const distractors: string[] = [];
  const seen = new Set(answerLower);
  for (const w of [...secondary, ...extra]) {
    const t = clean(w);
    if (!t) continue;
    const low = t.toLowerCase();
    if (seen.has(low)) continue;
    seen.add(low);
    distractors.push(t);
  }

  if (answers.length === 0) {
    return shuffleArray(distractors).slice(0, maxChoices);
  }

  if (answers.length >= maxChoices) {
    return shuffleArray(answers).slice(0, maxChoices);
  }

  const filler = shuffleArray(distractors).slice(0, maxChoices - answers.length);
  return shuffleArray([...answers, ...filler]);
}

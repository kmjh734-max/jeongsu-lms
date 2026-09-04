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

const SYSTEM = `너는 한국 중·고등 영어 지문에서 수업용 어휘를 정리하는 편집자다.
반드시 JSON만 반환:
{
  "vocab": [
    {
      "word": "fallacy",
      "meaning": "n. 오류, 잘못된 생각",
      "synonyms": ["falsehood", "illusion"],
      "antonyms": ["truth"]
    }
  ]
}

규칙:
- vocab는 지문에서 실제로 나온(또는 파생형으로 나온) 단어 8~14개.
- 핵심·중급 단어뿐 아니라, 수업에서 짚을 만한 쉬운/기초 단어도 적절히 포함해도 된다. (관사·대명사·be동사·아주 기초 접속사 the/a/is/and 등은 제외)
- word는 기본형(lemma) 영어 단어.
- meaning은 품사 약어(a./n./v./ad. 등) + 한국어 뜻.
- synonyms / antonyms는 자연스러운 것만 넣는다. 없으면 빈 배열 []로 두고, 억지로 만들지 말 것.
- 동의어·반의어가 있으면 1~4개, 짧고 시험에 쓸 수 있는 단어 위주.`;

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
  const timer = setTimeout(() => controller.abort(), 60_000);

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: `제목: ${input.title ?? "(없음)"}\n\nEN:\n${passage}\n\nKR:\n${
              (input.koreanPassage ?? "").trim() || "(없음)"
            }\n\n위 지문으로 수업용 단어 목록을 만들어라.`,
          },
        ],
      }),
    });

    const bodyText = await res.text();
    if (!res.ok) throw new Error(`어휘 생성 실패 (HTTP ${res.status})`);

    const envelope = parseJsonSafe<{
      choices?: { message?: { content?: string } }[];
    }>(bodyText);
    const content = envelope?.choices?.[0]?.message?.content ?? bodyText;
    const parsed = parseJsonSafe<{ vocab?: unknown }>(content);
    const raw = Array.isArray(parsed?.vocab) ? parsed!.vocab : [];

    const vocab: LessonPackVocabItem[] = raw
      .map((row) => {
        const r = row as Record<string, unknown>;
        const word = String(r.word ?? "").trim();
        const meaning = String(r.meaning ?? "").trim();
        const synonyms = Array.isArray(r.synonyms)
          ? r.synonyms.map((s) => String(s ?? "").trim()).filter(Boolean)
          : [];
        const antonyms = Array.isArray(r.antonyms)
          ? r.antonyms.map((s) => String(s ?? "").trim()).filter(Boolean)
          : [];
        return { word, meaning, synonyms, antonyms };
      })
      .filter((v) => v.word && v.meaning);

    if (vocab.length < 3) {
      throw new Error("어휘를 충분히 만들지 못했습니다. 다시 시도해 주세요.");
    }
    return vocab.slice(0, 16);
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

/** Build mixed choices for synonym/antonym tests (order randomized). */
export function buildChoiceList(
  primary: string[],
  secondary: string[],
  extra: string[] = []
): string[] {
  const set = new Set<string>();
  for (const w of [...primary, ...secondary, ...extra]) {
    const t = w.trim();
    if (t) set.add(t);
  }
  return shuffleArray([...set]).slice(0, 6);
}

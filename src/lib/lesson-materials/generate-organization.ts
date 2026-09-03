type InputItem = { english: string; korean?: string | null };

export type LessonMaterialAnalysisCard = {
  title: string;
  desc: string;
};

export type LessonMaterialOrganizationDraft = {
  passageTitle: string;
  analysisCards: LessonMaterialAnalysisCard[];
  illustrationPrompt: string;
  comicCaptions: string[];
};

function normalizeFlowDesc(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

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

const SYSTEM_PROMPT = `너는 한국 중·고등 영어 지문의 논리 흐름(Logical Flow)을 정리하는 편집자다.
입력된 영어 지문(과 한글 해석이 있으면 함께)만 근거로 쓴다.

반드시 JSON만 반환:
{
  "passageTitle": "지문 전체를 요약한 짧은 한국어 제목",
  "analysisCards": [
    { "title": "지문에서 뽑은 짧은 제목1", "desc": "2문장 설명." },
    { "title": "지문에서 뽑은 짧은 제목2", "desc": "2문장 설명." },
    { "title": "지문에서 뽑은 짧은 제목3", "desc": "2문장 설명." }
  ],
  "comicCaptions": ["1컷", "2컷", "3컷", "4컷"],
  "illustrationPrompt": "..."
}

규칙:
- passageTitle은 지문 핵심을 담은 한국어 제목 1개(18~36자). 예: "부분의 합이 전체의 성과를 보장하지 않는 이유".
- analysisCards는 정확히 3개. 순서: 문제/오해 → 원인·전개 → 결론·전체 관점.
- title은 이 지문 내용에서 만든 짧은 한국어 제목. 예: "구성의 오류에 대한 오해".
- 금지 제목: "수업에서 짚을 포인트", "지문의 핵심 주장", "논리 전개", "분석", "요약".
- desc는 한국어 2문장 정도. 지문의 구체적 개념·예시·반례를 넣어 한 문장짜리보다 조금 자세히 쓴다. 너무 길지 않게(각 60~110자).
- comicCaptions는 정확히 4개. 각 컷 말풍선용 짧은 한국어 대사(12~22자). 자연스럽게 이어지는 대화/독백.
- illustrationPrompt는 영어. 같은 인물이 1→4컷으로 부드럽게 이어지는 장면. 그림 안에는 글자·말풍선을 넣지 말라고 명시.`;

export async function generateLessonMaterialsOrganizationDraft(input: {
  items: InputItem[];
}): Promise<LessonMaterialOrganizationDraft> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY가 설정되어 있지 않습니다.");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45_000);

  try {
    const itemsText = input.items
      .map((it, idx) => {
        const korean = (it.korean ?? "").trim();
        return `${idx + 1}. EN:\n${it.english.trim()}\nKR:\n${
          korean.length > 0 ? korean : "(없음)"
        }`;
      })
      .join("\n\n");

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.35,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `아래 지문의 논리 흐름(조금 자세히)과 부드럽게 이어지는 4컷 그림 프롬프트를 만들어라.\n\n${itemsText}`,
          },
        ],
      }),
    });

    const bodyText = await res.text();
    if (!res.ok) {
      throw new Error(`분석 생성 실패 (HTTP ${res.status})`);
    }

    const envelope = parseJsonSafe<{
      choices?: { message?: { content?: string } }[];
    }>(bodyText);
    const content = envelope?.choices?.[0]?.message?.content ?? bodyText;
    const parsed = parseJsonSafe<{
      passageTitle?: string;
      analysisCards?: LessonMaterialAnalysisCard[];
      illustrationPrompt?: string;
      comicCaptions?: unknown;
    }>(content);

    const passageTitle = String(parsed?.passageTitle ?? "").trim();

    const cards = (parsed?.analysisCards ?? [])
      .map((c) => ({
        title: String(c.title ?? "").trim(),
        desc: normalizeFlowDesc(String(c.desc ?? "").trim()),
      }))
      .filter((c) => c.title && c.desc)
      .filter(
        (c) =>
          !/수업에서 짚을 포인트|지문의 핵심 주장|^논리 전개$|^분석$|^요약$/.test(
            c.title
          )
      );

    const illustrationPrompt = String(parsed?.illustrationPrompt ?? "").trim();
    const comicCaptions = Array.isArray(parsed?.comicCaptions)
      ? parsed.comicCaptions.map((v) => String(v ?? "").trim()).filter(Boolean)
      : [];

    if (cards.length < 3) {
      throw new Error("분석 결과를 해석하지 못했습니다. 다시 시도해 주세요.");
    }

    return {
      passageTitle:
        passageTitle ||
        cards[0]?.title ||
        "지문 핵심 정리",
      analysisCards: cards.slice(0, 3),
      illustrationPrompt:
        illustrationPrompt ||
        "One continuous 2x2 educational manhwa story about the passage idea. Same characters in all panels. Soft narrative arc from misconception to understanding. No text, no speech bubbles, expressions and icons only, bright flat colors",
      comicCaptions:
        comicCaptions.length >= 4
          ? comicCaptions.slice(0, 4)
          : [
              "이게 정말 맞을까?",
              "잠깐, 문제가 보이네",
              "다시 생각해 보자",
              "이제 이해가 됐어!",
            ],
    };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("분석 생성 시간이 초과되었습니다. 다시 시도해 주세요.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

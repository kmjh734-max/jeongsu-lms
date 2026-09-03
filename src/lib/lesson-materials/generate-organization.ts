export type LessonMaterialAnalysisCard = {
  title: string;
  desc: string;
};

export type LessonMaterialOrganizationDraft = {
  analysisCards: LessonMaterialAnalysisCard[];
  illustrationPrompt: string;
};

type InputItem = { english: string; korean?: string | null };

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

const SYSTEM_PROMPT = `너는 한국 중·고등 영어 수업용 교재 편집자다.
입력된 영어 지문(과 한글 해석이 있으면 함께)을 읽고, 그 지문의 실제 내용만으로 분석한다.

반드시 JSON만 반환:
{
  "analysisCards": [
    { "title": "지문의 핵심 주장", "desc": "..." },
    { "title": "논리 전개", "desc": "..." },
    { "title": "수업에서 짚을 포인트", "desc": "..." }
  ],
  "illustrationPrompt": "..."
}

규칙:
- title은 위 3개를 그대로 쓴다.
- desc는 반드시 이 지문의 구체적 내용(인물, 개념, 주장, 반례)을 한국어로 2~3문장 쓴다.
- 일반론("핵심을 정리합니다")만 쓰지 말고, 지문에 나온 단어를 포함해 요약한다.
- illustrationPrompt는 영어 지문의 핵심을 가르치는 교육용 4컷 만화(2x2) 이미지 생성용 상세 영어 프롬프트다.
- 만화 스타일: bright clean educational manhwa/manga for students, consistent characters (a boy, a girl, optionally a scientist/teacher), speech bubbles with short Korean text, icons and diagrams, no photorealism, no watermark.
- 4컷 서사: (1) 흔한 오해/문제 제기 (2) 기존 설명 (3) 반박/과학적 교정 (4) 올바른 결론. 지문 내용에 맞춰 장면을 구체적으로 적는다.
- 한 장의 이미지 안에 2x2 패널이 모두 들어가게 지시한다.`;

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
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `아래 지문을 분석하고 4컷 만화 삽화 프롬프트를 만들어라.\n\n${itemsText}`,
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
      analysisCards?: LessonMaterialAnalysisCard[];
      illustrationPrompt?: string;
    }>(content);

    const cards = (parsed?.analysisCards ?? [])
      .map((c) => ({
        title: String(c.title ?? "").trim(),
        desc: String(c.desc ?? "").trim(),
      }))
      .filter((c) => c.title && c.desc);

    const illustrationPrompt = String(parsed?.illustrationPrompt ?? "").trim();

    if (cards.length < 3 || illustrationPrompt.length < 40) {
      throw new Error("분석 결과를 해석하지 못했습니다. 다시 시도해 주세요.");
    }

    return {
      analysisCards: cards.slice(0, 3),
      illustrationPrompt,
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

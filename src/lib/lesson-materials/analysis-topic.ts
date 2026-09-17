/**
 * 지문분석지 머리에 싣는 영어 제목·영어 주제문.
 * 선생님 요청(2026-09-17): 주제·제목이 영어로도 쓰여 있으면 좋겠다.
 * 지문 전체를 한 번만 보고 짧게 받으므로 값싼 모델로 충분하다. 실패해도 분석지는 그대로 나간다.
 */
export type AnalysisTopic = {
  /** 영어 제목(4~10 words, Title Case) */
  titleEn: string;
  /** 영어 주제문(한 문장) */
  topicEn: string;
  /** 주제문 한국어 */
  topicKo: string;
};

function model(): string {
  return process.env.OPENAI_MODEL_ANALYSIS_TOPIC?.trim() || "gpt-5-mini";
}

/** 제목 표기: 관사·짧은 전치사·접속사는 첫 낱말이 아니면 소문자로 쓴다. */
const SMALL_WORDS = new Set(["a", "an", "the", "of", "as", "in", "on", "at", "to", "for", "by", "and", "or", "but", "nor", "with", "from", "into"]);
function titleCase(title: string): string {
  return title
    .split(" ")
    .map((w, i) => (i > 0 && SMALL_WORDS.has(w.toLowerCase()) ? w.toLowerCase() : w))
    .join(" ");
}

export async function generateAnalysisTopic(input: {
  apiKey: string;
  passage: string;
  signal?: AbortSignal;
}): Promise<AnalysisTopic | null> {
  const passage = input.passage.replace(/\s+/g, " ").trim();
  if (passage.length < 40) return null;
  const body = {
    model: model(),
    reasoning_effort: "minimal",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You write the heading of a Korean high-school English reading worksheet. Answer in JSON only.",
      },
      {
        role: "user",
        content: `Passage:
${passage}

Return JSON:
{"titleEn":"an English title for this passage, 4-10 words, Title Case, no final period",
 "topicEn":"the main idea of the passage as one English sentence (12-25 words), in your own words, not copied from the passage",
 "topicKo":"topicEn의 뜻을 한국 학생이 바로 읽히는 한국어 한 문장으로(영어 어순대로 옮기지 말고 다시 씀, 45자 안팎), '~다.'로 끝냄"}`,
      },
    ],
  };
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${input.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: input.signal,
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const raw = JSON.parse(json.choices?.[0]?.message?.content ?? "{}") as Record<string, unknown>;
    const clean = (v: unknown, max: number) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);
    const out: AnalysisTopic = {
      titleEn: titleCase(clean(raw.titleEn, 120).replace(/\.$/, "")),
      topicEn: clean(raw.topicEn, 260),
      topicKo: clean(raw.topicKo, 200),
    };
    return out.titleEn || out.topicEn ? out : null;
  } catch {
    return null;
  }
}

/**
 * 지문 하나를 여섯 컷으로 나눈다.
 *
 * 예전에는 "4컷 만화를 그려라"라는 한 문장만 그림 모델에 넘겨서, 지문 뒷부분이 통째로 빠지고
 * 어느 지문이든 비슷한 교실 장면이 나왔다. 여기서 값싼 글 모델에 지문을 통째로 읽혀
 * 처음→끝을 덮는 여섯 장면(한국어 소제목 + 영어 그림 설명)을 먼저 뽑는다.
 * 그림 모델은 장면 설명만 받으므로 지문의 실제 인물·사물·장소가 컷마다 남는다.
 */

export type IllustrationBeat = {
  /** 컷 밑에 인쇄할 한국어 소제목 (6~14자) */
  title: string;
  /** 그림 모델에 줄 영어 장면 설명 */
  draw: string;
};

export type IllustrationPlan = {
  beats: IllustrationBeat[];
  /** 여섯 컷을 따로 그려도 인물이 달라지지 않게 모든 컷에 함께 붙이는 등장인물 설명 */
  cast: string;
};

export const BEAT_COUNT = 6;

function beatsModel(): string {
  return process.env.OPENAI_MODEL_ILLUSTRATION_BEATS?.trim() || "gpt-4o-mini";
}

const SYSTEM_PROMPT = `You split ONE English reading passage into exactly ${BEAT_COUNT} comic beats that cover it from the first sentence to the last.

Return JSON only:
{"cast":"...","beats":[{"title":"...","draw":"..."}]}

"cast": English, 15-30 words. The recurring figure(s) of this passage, described so any illustrator draws the same ones: age, hair, clothing colour, or — for a passage with no people — the recurring object/creature/place. Take them from the passage.

"beats": exactly ${BEAT_COUNT}, in passage order. Beat 1-2 = the opening situation, 3-4 = how it develops, 5 = the turn, evidence or example, 6 = the closing point.
- "title": KOREAN, 6-14 characters INCLUDING spaces, with normal word spacing. A plain summary of that beat, like a caption a teacher would write. No quotation marks, no ending period, no numbering.
- "draw": ENGLISH, 25-45 words, ONE drawable moment taken from THAT part of the passage. Name the concrete people, creatures, objects, place and action the passage actually mentions. Never write a generic classroom, lecture or "student studying" scene unless the passage is about one.

Every beat must be traceable to a different part of the passage. Do not repeat a beat.
Never ask for text, letters, numbers, labels or speech bubbles inside the drawing.`;

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

/** 소제목이 너무 길면 인쇄에서 줄이 넘친다 — 한 줄에 담기는 길이로 자른다 */
function tidyTitle(raw: string, index: number): string {
  const text = String(raw ?? "")
    .replace(/[""'']/g, "")
    .replace(/\s+/g, " ")
    .replace(/[.。]\s*$/, "")
    .replace(/^\d+\s*[.)컷]\s*/, "")
    .trim();
  if (!text) return `${index + 1}번째 장면`;
  return [...text].length > 18 ? [...text].slice(0, 18).join("") : text;
}

/**
 * 지문에서 여섯 컷을 뽑는다. 글 모델이 답을 못 주면 지문 자체를 여섯 토막으로 잘라 쓴다 —
 * 그림은 나오게 하고, 소제목만 밋밋해진다.
 */
export async function planIllustrationBeats(input: {
  passage: string;
  /** 지문이 없을 때 쓸 설명(예전 화면이 보내던 프롬프트) */
  fallbackHint?: string;
  signal?: AbortSignal;
}): Promise<IllustrationPlan> {
  const passage = input.passage.replace(/\s+/g, " ").trim().slice(0, 4000);
  const hint = (input.fallbackHint ?? "").replace(/\s+/g, " ").trim().slice(0, 1200);
  const source = passage.length >= 60 ? passage : hint;
  if (!source) throw new Error("삽화에 쓸 지문이 없습니다.");

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY가 설정되어 있지 않습니다.");

  const model = beatsModel();
  const body: Record<string, unknown> = {
    model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: source },
    ],
  };
  if (/^gpt-5/.test(model)) {
    body.max_completion_tokens = 2_500;
    body.reasoning_effort = "low";
  } else {
    body.temperature = 0.3;
    body.max_tokens = 1_200;
  }

  let parsed: { cast?: unknown; beats?: unknown } | null = null;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: input.signal,
    });
    const text = await res.text();
    if (res.ok) {
      const envelope = parseJsonSafe<{ choices?: { message?: { content?: string } }[] }>(text);
      parsed = parseJsonSafe(envelope?.choices?.[0]?.message?.content ?? text);
    }
  } catch {
    parsed = null;
  }

  const rawBeats = Array.isArray(parsed?.beats) ? parsed.beats : [];
  const beats: IllustrationBeat[] = rawBeats
    .slice(0, BEAT_COUNT)
    .map((raw, i) => {
      const item = (raw ?? {}) as { title?: unknown; draw?: unknown };
      return {
        title: tidyTitle(String(item.title ?? ""), i),
        draw: String(item.draw ?? "").replace(/\s+/g, " ").trim(),
      };
    })
    .filter((b) => b.draw.length >= 15);

  if (beats.length === BEAT_COUNT) {
    return { beats, cast: String(parsed?.cast ?? "").replace(/\s+/g, " ").trim().slice(0, 300) };
  }

  return { beats: fallbackBeats(source), cast: "" };
}

/** 글 모델이 실패했을 때 — 지문을 여섯 토막으로 잘라 장면 설명으로 쓴다 */
function fallbackBeats(source: string): IllustrationBeat[] {
  const sentences = source.match(/[^.!?]+[.!?]+|\S+$/g) ?? [source];
  const per = Math.max(1, Math.ceil(sentences.length / BEAT_COUNT));
  return Array.from({ length: BEAT_COUNT }, (_, i) => {
    const chunk = sentences.slice(i * per, (i + 1) * per).join(" ").trim() || source.slice(0, 200);
    return {
      title: `${i + 1}번째 장면`,
      draw: chunk.slice(0, 400),
    };
  });
}

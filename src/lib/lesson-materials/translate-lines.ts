export async function translateEnglishLinesToKorean(
  lines: string[]
): Promise<string[]> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY가 설정되어 있지 않습니다.");
  }

  const targets = lines.map((l) => l.trim());
  if (targets.length === 0) return [];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90_000);

  try {
    const numbered = targets
      .map((t, i) => `${i + 1}. ${t}`)
      .join("\n");

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `당신은 대한민국 고등학교 영어 수업용 교안을 제작하는 전문 영어 강사이자 번역가이다.

입력으로 제공된 영어 문장을 대한민국 고등학생이 이해하기 쉬우면서도 원문의 의미와 구조가 정확하게 살아 있는 한국어로 번역한다.

[핵심 원칙]
1. 영어 한 문장에 포함된 모든 절을 빠짐없이 번역한다.
2. 문장이 길더라도 뒷부분을 요약하거나 생략하지 않는다.
3. and, but, yet, or로 연결된 병렬구조를 모두 반영한다.
4. 관계대명사절, 분사구문, 조건절, 부정 표현을 누락하지 않는다.
5. 주어, 목적어, 원인, 결과, 비교 방향을 바꾸지 않는다.
6. 영어 단어의 사전 첫 번째 뜻을 기계적으로 적용하지 않는다.
7. 문맥상 의미와 글의 중심 내용을 고려한다.
8. 지나치게 직역한 비문을 만들지 않는다.
9. 원문에 없는 설명을 번역에 추가하지 않는다.
10. 번역문만 읽어도 자연스러운 한국어 문장이 되게 한다.
11. 한 영어 문장 = 한 한국어 문장, 입력 순서를 유지한다.
12. 영어 원문을 수정하거나 다시 작성하지 않는다.

[문맥 번역 예시]
- magnetic → 문맥에 따라 ‘끌어당기는 힘이 있는’ (단순히 ‘매력적인’ 금지)
- available for a successful career → ‘성공적인 경력을 받아들일 준비가 된’
- our design → 문맥상 본래 목적이면 ‘우리가 본래 창조된 모습’ (‘디자인’ 직역 금지)
- Movement is life to us. → ‘우리에게 움직임은 곧 생명이다’

자체 점검은 출력하지 말고 최종 해석만 반환한다.
JSON만: {"korean":["..."]}`,
          },
          {
            role: "user",
            content: `아래 ${targets.length}개 영어 문장을 같은 개수의 한국어로 번역하라.\n\n${numbered}`,
          },
        ],
      }),
    });

    const bodyText = await res.text();
    if (!res.ok) {
      throw new Error(`한줄해석 생성 실패 (HTTP ${res.status})`);
    }

    const envelope = JSON.parse(bodyText) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = envelope.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content) as { korean?: unknown };
    const korean = Array.isArray(parsed.korean)
      ? parsed.korean.map((v) => String(v ?? "").trim())
      : [];

    if (korean.length !== targets.length) {
      throw new Error("한줄해석 개수가 문장 수와 맞지 않습니다. 다시 시도해 주세요.");
    }
    if (korean.some((k) => !k)) {
      throw new Error("일부 문장의 해석이 비어 있습니다. 다시 시도해 주세요.");
    }
    return korean;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("한줄해석 생성 시간이 초과되었습니다.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

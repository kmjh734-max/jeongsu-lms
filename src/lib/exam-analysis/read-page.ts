import { examChat } from "@/lib/exam-analysis/openai";

/**
 * 시험지 한 쪽(또는 한 단)을 읽어 인쇄된 글자만 옮긴다.
 * 비교해 보니(2026-09-20) gpt-5.5가 뒤집힌 쪽·흐린 스캔·손글씨 섞인 쪽을 가장 잘 읽었다.
 * 다만 긴 지문을 옮기다 중간에 멈추는 일이 있어, 끝 표시가 없으면 "덜 읽음"으로 알려 준다
 * (그러면 화면이 쪽을 왼쪽·오른쪽 단으로 잘라 다시 보낸다).
 */
const END = "<<끝>>";

const SYSTEM = `한국 고등학교 영어 시험지 스캔을 옮겨 적는다. 학원 선생님이 문항 분석을 위해 학생 시험지를 올린 것이다.
- 인쇄된 글자만 옮긴다. 학생 손글씨·동그라미·체크·밑줄 긋기·채점 표시·점수·풀이 메모는 모두 무시한다.
- 쪽이 뒤집혀 있으면 바로 세워 읽는다.
- 2단 편집이면 왼쪽 단을 위에서 아래로 끝까지, 그다음 오른쪽 단.
- 문항 번호, 발문, [2.9점] 같은 배점, 지문, 보기 ①~⑤, (A)(B), 서술형 조건, 표·박스 안 글자를 원문 그대로 빠짐없이.
- 시험지 머리(학교, 학년, 과목, 문항 수·배점 안내)와 쪽 번호(예: 7-1, 2/8)도 적는다.
- 밑줄 친 부분은 <u>…</u>, 빈칸은 ______, 번호 붙은 밑줄은 ①<u>…</u>.
- 설명·요약 없이 옮긴 글자만 출력하고, 다 옮긴 뒤 마지막 줄에 ${END} 을 적는다.`;

export async function readExamImage(
  dataUrl: string,
  label: string
): Promise<{ text: string; complete: boolean }> {
  const call = (model: string, extra: Record<string, unknown>) =>
    examChat({
      model,
      ...extra,
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: [
            { type: "text", text: label },
            { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
          ],
        },
      ],
    });

  const first = await call("gpt-5.5", { reasoning_effort: "low" });
  let text = first.text;
  // 거절·빈 답이면 다른 모델로 한 번 더
  if (text.replace(END, "").trim().length < 200) {
    const second = await call("gpt-4.1", { temperature: 0 });
    if (second.text.length > text.length) text = second.text;
  }
  const complete = text.includes(END);
  return { text: text.replaceAll(END, "").trim(), complete };
}

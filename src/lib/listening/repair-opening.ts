/**
 * 담화(1인 말하기)가 앞 대화에 대답하듯 시작한 것을 그 자리에서 고친다.
 *
 * "Yes, please listen to this parking notice." 처럼 첫 마디만 대답 투인 경우가 있다.
 * 문항 전체를 다시 만들 일이 아니라 첫 마디만 떼면 되는 흠이라, 다시 만들기 전에 먼저 고친다
 * (그래야 "검토 필요"로 넘어가는 문항이 줄어든다 — 선생님이 손볼 일을 남기지 않는다).
 */
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

/** 대답하듯 여는 말 (대소문자 가리지 않음) */
const REPLY_OPENER =
  /^(that['’]s right|thats right|right|yes|yeah|no|okay|ok|sure|well|exactly|of course|i see|true|good idea)\s*,\s*/i;

function strip(text: string): string | null {
  const t = String(text ?? "");
  if (!REPLY_OPENER.test(t)) return null;
  const rest = t.replace(REPLY_OPENER, "").trimStart();
  if (rest.length < 20) return null;
  return rest.charAt(0).toUpperCase() + rest.slice(1);
}

/**
 * 담화면 첫 마디의 대답 투를 떼어 낸다. 고칠 것이 없으면 원래 문항을 그대로 돌려준다.
 * 대본 본문(script_text)과 대사 조각(segments)을 함께 고친다 — 녹음은 조각으로 만든다.
 */
export function repairMonologueOpening(
  q: GeneratedListeningQuestion
): GeneratedListeningQuestion {
  const segments = Array.isArray(q.segments) ? q.segments : [];
  if (segments.length > 1) return q;

  const first = segments[0];
  const fixedSegment = first ? strip(String(first.text ?? "")) : null;
  const fixedScript = strip(String(q.script_text ?? "").replace(/^[MW]\s*:\s*/, ""));
  if (!fixedSegment && !fixedScript) return q;

  const speaker = String(q.script_text ?? "").match(/^([MW])\s*:/)?.[1] ?? "";
  return {
    ...q,
    segments: first && fixedSegment ? [{ ...first, text: fixedSegment }] : segments,
    script_text: fixedScript ? (speaker ? `${speaker}: ${fixedScript}` : fixedScript) : q.script_text,
  };
}

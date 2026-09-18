/**
 * 대본 자체가 말이 되는지 본다(정답이 맞는지가 아니라).
 *
 * 왜 필요한가: 지금까지의 검사는 모두 "정답이 맞나"를 물었다. 정답을 가리고 풀게 하는 검사도
 * 정답만 하나로 나오면 통과시킨다. 그런데 2026-09-17~18에 실제로 나온 흠은 거의 다 대본 쪽이었다.
 *   - 한 사람을 두 이름으로 부름(Taerin이라 해 놓고 끝에서 Gyuri)
 *   - 물건과 부속이 안 맞음(램프를 주문했는데 손잡이가 왔다)
 *   - 가진 것과 해결책이 모순(현금이 없다는데 "지폐를 바꿔 주겠다")
 *   - 거리·시각 계산이 안 맞음(5분 거리인데 15분이라 하고, 거절한 시각이 정답)
 *   - 요구와 정답이 어긋남("더 짧은 문구"를 묻는데 정답이 더 김)
 *   - 담화가 대화 도중처럼 시작함("That's right, Nari, …", "Jinu, our class has …")
 * 이런 것은 답을 푸는 데 지장이 없어서 앞의 검사들을 모두 지나갔다. 그래서 대본만 따로 본다.
 *
 * 규칙으로 잡을 수 있는 것은 규칙으로(돈이 들지 않는다), 나머지만 한 번 물어본다.
 */
import { listeningChatJson } from "@/lib/listening/openai-listening-chat";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";
import { tableRuleProblems } from "@/lib/listening/table-rules";

/** 담화(1인 말하기)가 대화 도중처럼 시작하면 안 되는 말머리 */
const REPLY_OPENERS = [
  "that's right", "thats right", "right,", "yes,", "yeah,", "no,", "okay,", "ok,", "sure,",
  "well,", "exactly,", "of course,", "i see,", "true,", "good idea,",
];

/** 검사에 넘길 대본. 누가 한 말인지 표시해야 모델이 화자를 헷갈리지 않는다(실측: 두 문항이 그래서 잘못 걸렸다). */
function scriptOf(q: GeneratedListeningQuestion, withSpeakers = true): string {
  const segs = Array.isArray(q.segments) ? q.segments : [];
  const joined = segs
    .map((s) => {
      const who = String((s as { speaker?: string; speaker_type?: string })?.speaker ?? (s as { speaker_type?: string })?.speaker_type ?? "").trim();
      const text = String(s?.text ?? "").trim();
      return who && text && withSpeakers ? `${who}: ${text}` : text;
    })
    .filter(Boolean)
    .join("\n");
  return (joined.trim() || String(q.script_text ?? "")).replace(/[ \t]+/g, " ").trim();
}

/** 대본에 나오는 사람 이름(호격·주어). 흔한 문장 첫 낱말은 뺀다. */
function namesIn(text: string): string[] {
  const stop = new Set([
    "I", "You", "We", "They", "He", "She", "It", "The", "This", "That", "There", "Then", "Thanks",
    "Thank", "Hello", "Hi", "Good", "Okay", "Yes", "No", "Sure", "Well", "Attention", "Welcome",
    "Please", "Sorry", "Right", "Actually", "Maybe", "Let", "Do", "Did", "Can", "Could", "Would",
    "What", "When", "Where", "Why", "How", "Who", "My", "Your", "Our", "Their", "His", "Her", "Its",
    "Mr", "Ms", "Mrs", "Dr", "First", "Second", "Third", "Fourth", "Finally", "Room", "Monday",
    "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
  ]);
  const out = new Set<string>();
  // 호격만 본다: ", Name." / ", Name," (문장 첫머리 "Look,"처럼 이름이 아닌 말이 섞이지 않게)
  for (const m of text.matchAll(/,\s*([A-Z][a-z]{2,})\s*[.,!?]/g)) out.add(m[1]!);
  return [...out].filter((n) => !stop.has(n));
}

/** 규칙만으로 잡히는 흠. 모델을 부르지 않는다. */
/** 흑백 인쇄에서 서로 구별되지 않는 색 이름 (검정·흰색·회색은 흑백에서도 구별되므로 뺀다) */
const COLOR_WORDS =
  /\b(red|blue|green|yellow|orange|purple|pink|brown|navy|beige|violet|golden)\b/i;

/** 담화 첫머리에 올 수 있는 감탄사·인사 — 사람 이름이 아니다 */
const NOT_A_NAME_OPENER =
  /^(Hello|Hi|Hey|Good|Attention|Welcome|Thank|Thanks|Wow|Oh|Well|Look|Listen|Sorry|Excuse|Okay|OK|Yes|No|Right|Great|Nice|Congratulations|Please|Everyone|Students|Friends|Ladies|Dear|Guess|Today|Finally|First|Now)\b/;

export function scriptRuleProblems(q: GeneratedListeningQuestion): string[] {
  // 규칙은 화자 표시가 없는 대본으로 본다(담화 첫 문장 검사가 "M:"에 걸리지 않게).
  const text = scriptOf(q, false);
  if (!text) return [];
  const out: string[] = [];
  const segs = Array.isArray(q.segments) ? q.segments : [];

  // 1) 대본 본문과 대사 조각이 다르면 녹음과 인쇄가 어긋난다(실제로 그렇게 나갔다).
  const norm = (t: string) =>
    t
      .replace(/\b(?:[MW]|Man|Woman|ANN|Narrator)\s*:\s*/g, " ")
      .replace(/[“”„]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/[\s\u00a0]/g, "")
      .toLowerCase();
  const plain = norm(String(q.script_text ?? ""));
  if (segs.length > 0 && plain) {
    const joined = norm(segs.map((s) => String(s?.text ?? "")).join(" "));
    if (joined !== plain) {
      out.push("script_segments_mismatch|대본 본문(script_text)과 대사 조각(segments)의 문장이 다르다. 두 곳을 똑같이 맞춰라(음성은 대사 조각으로 만든다).");
    }
  }

  /*
   * 2) 한 화자가 상대를 두 이름으로 부르면 흠이다(Taerin이라 해 놓고 끝에서 Gyuri).
   *    두 사람이 서로 이름을 부르는 대화는 정상이므로, 화자별로 나눠 센다.
   */
  const bySpeaker = new Map<string, Set<string>>();
  for (const seg of segs) {
    const who = String((seg as { speaker?: string; speaker_type?: string }).speaker ?? (seg as { speaker_type?: string }).speaker_type ?? "?");
    const found = namesIn(String(seg?.text ?? ""));
    if (found.length === 0) continue;
    const set = bySpeaker.get(who) ?? new Set<string>();
    for (const n of found) set.add(n);
    bySpeaker.set(who, set);
  }
  for (const [who, set] of bySpeaker) {
    if (set.size > 1) {
      out.push(`name_conflict|한 사람(${who})이 상대를 ${[...set].join("·")}로 다르게 부른다. 한 이름으로만 부르라.`);
      break;
    }
  }
  if (segs.length === 0 && namesIn(text).length > 1) {
    out.push(`name_conflict|대본에 이름이 ${namesIn(text).join("·")}로 여럿 나온다. 같은 사람을 한 이름으로만 부르라.`);
  }

  // 3) 담화(1인)는 첫 문장이 대화 도중처럼 시작하면 안 된다.
  const monologue = segs.length <= 1;
  if (monologue) {
    const first = text.split(/(?<=[.!?])\s/)[0]?.toLowerCase() ?? "";
    if (REPLY_OPENERS.some((o) => first.startsWith(o))) {
      out.push("monologue_opening|담화가 앞 대화에 대한 대답처럼 시작한다. 안내·설명의 첫 문장(인사·호출)으로 시작하라.");
    }
    // 감탄사·인사로 시작하는 것은 한 사람을 부르는 것이 아니다("Wow, these dogs …")
    const vocative =
      /^[A-Z][a-z]{2,},\s/.test(text) && !NOT_A_NAME_OPENER.test(text);
    if (vocative) {
      out.push("monologue_vocative|담화가 특정 한 사람을 부르며 시작한다. 여러 사람에게 하는 안내·설명으로 시작하라.");
    }
  }

  // 4) "더 짧은 것"을 묻는데 정답이 앞서 나온 문구보다 길면 안 된다.
  const last = text.split(/(?<=[.!?])\s/).pop() ?? "";
  if (/\bshorter\b|\bbriefer\b/i.test(last)) {
    const words = (t: string) => t.trim().replace(/^[^A-Za-z]+/, "").split(/\s+/).filter(Boolean).length;
    // 앞에서 나온 문구 후보: 따옴표 안, 또는 "How about …" / "I like …" 뒤
    const proposals = [
      ...[...text.matchAll(/[“"']([^“”"']{6,70})[”"']/g)].map((m) => m[1]!),
      ...[...text.matchAll(/\b(?:How about|I like|What about)[,:]?\s+([^.?!]{6,70})[.?!]/gi)].map((m) => m[1]!),
    ]
      .map((t) => t.trim())
      // 문구 후보는 세 낱말 이상만(짧은 말토막과 견주면 멀쩡한 정답이 걸린다)
      .filter((t) => t.trim().split(/\s+/).length >= 3);
    const answer = String(q.choices?.[(q.correct_answer ?? 1) - 1] ?? "").replace(/^(?:How about|What about)[,:]?\s+/i, "");
    if (answer && proposals.some((s) => words(answer) >= words(s))) {
      out.push("shorter_but_longer|더 짧은 것을 묻는데 정답이 앞에서 나온 문구보다 길다. 정답을 실제로 더 짧게 써라.");
    }
  }

  /*
   * 5) 학원 대부분이 흑백 프린터를 쓴다(선생님 지적 2026-09-18). 그림에서 답을 고르는 유형인데
   *    정답 단서가 색이면 흑백 인쇄에서 빨강·파랑이 비슷한 회색이 되어 문제를 풀 수 없다.
   *    색 이름이 단서·해설·마지막 결정 문장에 있으면 무늬·모양·개수로 바꾸게 한다.
   */
  const imageChoices =
    q.needs_image_choices === true || String(q.visual_choice_type ?? "") === "image";
  if (imageChoices) {
    const clue = [
      String(q.answer_clue ?? ""),
      String(q.explanation ?? ""),
      last,
    ].join(" ");
    const color = clue.match(COLOR_WORDS);
    if (color) {
      out.push(
        `color_clue|그림에서 답을 고르는 문항인데 정답 단서가 색(${color[0]})이다. 시험지는 흑백으로 인쇄된다 — 무늬·모양·개수·크기·적힌 글자로 답이 갈리게 고쳐라.`
      );
    }
  }

  // 6) 표 문항의 표 자체 (사람 이름 열·엉뚱한 열·같은 행)
  out.push(...tableRuleProblems(q));

  return out;
}

export interface ScriptAuditResult {
  problems: string[];
  skipped: boolean;
}

const SYSTEM = `너는 한국 중·고등학교 영어 듣기 문항의 대본을 읽고 앞뒤가 맞는지 보는 사람이다.
정답이 맞는지는 보지 않는다. 대본 안의 사실이 서로 어긋나는지, 현실적으로 말이 되는지만 본다.
없는 흠을 만들지 않는다. 확실한 것만 적는다. 반드시 JSON만 답한다.`;

/**
 * 대본의 앞뒤 사실을 한 번 본다. 규칙으로 잡히지 않는 흠(물건과 부속, 가진 것과 해결책,
 * 거리·시각 계산, 지시문과 대본의 어긋남)을 잡는다. 호출이 실패하면 건너뛴다.
 */
/** 어색한 대화 고르기: 어긋난 짝이 정답이라, 대본 검사를 그대로 쓰면 정답 자리를 흠으로 본다. */
function isAwkwardDialogueType(q: GeneratedListeningQuestion): boolean {
  return /어색/.test(String(q.question_type ?? "")) || /어색/.test(String(q.instruction ?? ""));
}

/** 그림 상황에 맞는 대화: 그림 한 장으로 정답만 맞아야 하므로 다섯 대화가 서로 다른 장면이어야 한다. */
function isPictureSituationType(q: GeneratedListeningQuestion): boolean {
  const t = `${q.question_type ?? ""} ${q.instruction ?? ""}`;
  return /그림/.test(t) && /상황/.test(t) && /대화/.test(t);
}

export async function auditScript(
  apiKey: string,
  q: GeneratedListeningQuestion
): Promise<ScriptAuditResult> {
  const text = scriptOf(q);
  if (!text || text.length < 40) return { problems: [], skipped: true };
  if (isAwkwardDialogueType(q)) return auditAwkwardDialogue(apiKey, q, text);
  if (isPictureSituationType(q)) return auditPictureSituation(apiKey, q, text);
  const choices = Array.isArray(q.choices) ? q.choices.map((c) => String(c)) : [];
  try {
    const raw = await listeningChatJson<Record<string, unknown>>(apiKey, {
      temperature: 0.1,
      system: SYSTEM,
      user: `지시문: ${q.instruction ?? ""}
대본:
${text}
선택지:
${choices.map((c, i) => `${i + 1}) ${c}`).join("\n")}
정답: ${q.correct_answer}번

아래 다섯 가지만 본다. 해당 없으면 빈 배열.
1. 사물·상황이 안 맞음: 주문·구매한 물건에 그 부속이 실제로 딸려 있는지(그 물건에 없는 부품이 왔다고 하면 흠), 그 장소에서 할 수 없는 일을 하는지.
2. 가진 것과 해결책이 모순: 현금이 없다는데 지폐를 바꿔 준다, 시간이 없다는데 더 오래 걸리는 방법을 받아들인다.
3. 숫자·시각·거리 계산이 안 맞음: 걸리는 시간과 약속 시각이 어긋난다, 앞에서 거절한 값이 결론이 된다.
4. 사람 관계·이름이 흔들림: 같은 사람을 다르게 부른다, 말하는 사람이 바뀐다.
5. 지시문이 묻는 것을 대본이 다루지 않는다.

먼저 대본에 나온 사물·사람·숫자·시각을 머릿속으로 적어 보고, 그중 서로 부딪히는 것만 고른다.

{"problems":["한국어 한 문장으로 무엇이 어긋나는지"]}`,
    });
    const list = Array.isArray(raw.problems) ? raw.problems : [];
    const problems = list
      .map((p) => String(p ?? "").replace(/\s+/g, " ").trim())
      .filter((p) => p.length >= 8)
      .slice(0, 3)
      .map((p) => `script_fact|${p}`);
    return { problems, skipped: false };
  } catch {
    return { problems: [], skipped: true };
  }
}

/**
 * 어색한 대화 고르기 전용. 어긋난 짝의 번호를 받아 정답 번호와 맞는지 본다.
 * (대본 검사를 그대로 쓰면 일부러 어긋낸 자리를 흠으로 잡아 멀쩡한 문항이 걸린다.)
 */
/**
 * 그림 상황에 맞는 대화. 그림은 한 장이라, 정답 말고 다른 대화도 같은 그림으로 그려지면
 * 문제가 성립하지 않는다(중3 3회 6번: 다섯 대화가 모두 몸이 아픈 상황이었다).
 * 그림을 그리기 전에 대본만 보고 잡는다 — 그려 놓고 검수에서 걸리면 값과 시간이 든다.
 */
async function auditPictureSituation(
  apiKey: string,
  q: GeneratedListeningQuestion,
  text: string
): Promise<ScriptAuditResult> {
  try {
    const raw = await listeningChatJson<Record<string, unknown>>(apiKey, {
      temperature: 0.1,
      system: SYSTEM,
      user: `아래는 짧은 대화 다섯 개다. 시험지에는 ${q.correct_answer}번 대화의 장면만 그림 한 장으로 그린다.

${text}

그 그림(무엇을 하는 장면인지)을 떠올린 뒤, ${q.correct_answer}번 말고도 그 그림에 들어맞는 대화가 있는지 본다.
장소만 같고 하는 일이 다르면 들어맞는 것이 아니다. 하는 일·주고받는 물건·몸짓이 그림과 같아야 들어맞는 것이다.

{"alsoFit":[번호들],"why":"한국어 한 문장"}`,
    });
    const list = Array.isArray(raw.alsoFit) ? raw.alsoFit : [];
    const nums = list
      .map((v) => Math.floor(Number(v)))
      .filter((n) => n >= 1 && n <= 5 && n !== q.correct_answer);
    if (nums.length > 0) {
      const why = String(raw.why ?? "").replace(/\s+/g, " ").trim().slice(0, 120);
      return {
        problems: [
          `picture_situation_tie|${nums.join("·")}번도 정답 ${q.correct_answer}번과 같은 그림으로 그려진다. 다섯 대화를 서로 다른 장면(하는 일이 다른 장면)으로 쓰고, 정답만 그림으로 그릴 수 있는 뚜렷한 행동이 되게 하라. ${why}`,
        ],
        skipped: false,
      };
    }
    return { problems: [], skipped: false };
  } catch {
    return { problems: [], skipped: true };
  }
}

async function auditAwkwardDialogue(
  apiKey: string,
  q: GeneratedListeningQuestion,
  text: string
): Promise<ScriptAuditResult> {
  try {
    const raw = await listeningChatJson<Record<string, unknown>>(apiKey, {
      temperature: 0.1,
      system: SYSTEM,
      user: `아래는 짧은 대화 다섯 개다. 묻는 말과 대답이 어긋난 대화를 모두 고른다.

${text}

{"awkward":[번호들],"why":"한국어 한 문장"}`,
    });
    const list = Array.isArray(raw.awkward) ? raw.awkward : [];
    const nums = list.map((v) => Math.floor(Number(v))).filter((n) => n >= 1 && n <= 5);
    const answer = q.correct_answer;
    const why = String(raw.why ?? "").replace(/\s+/g, " ").trim().slice(0, 120);
    if (nums.length === 0) {
      return { problems: [`awkward_none|어긋난 대화를 찾지 못했다. ${answer}번이 분명히 어긋나게 다시 써라.`], skipped: false };
    }
    if (!nums.includes(answer)) {
      return { problems: [`awkward_mismatch|어긋난 대화가 ${nums.join("·")}번으로 읽힌다(정답은 ${answer}번). ${why}`], skipped: false };
    }
    if (nums.length > 1) {
      return { problems: [`awkward_extra|${nums.join("·")}번이 모두 어긋나 보인다. 정답 ${answer}번만 어긋나게 하고 나머지는 자연스럽게 고쳐라.`], skipped: false };
    }
    return { problems: [], skipped: false };
  } catch {
    return { problems: [], skipped: true };
  }
}

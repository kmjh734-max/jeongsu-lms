/**
 * 정답을 가리고 모델에게 직접 풀게 해서, 저장할 정답과 맞는지 본다.
 *
 * 왜 따로 두는가: 기존 정답 검수(validate-answer)는 모델에게 "정답은 3번인데 맞나?"라고 묻는다.
 * 모델은 보여 준 답에 끌려가 "맞다"고 답하는 쪽으로 기운다. 실제로 2026-09-17 점검에서
 * 그 검수를 모두 통과한 120문항 가운데 세 개가 틀려 있었다.
 *   - 다섯 항목이 모두 대본에 나오는 "언급되지 않은 것" 문항(정답이 없었다)
 *   - 지시문은 숙소 예약 시각을 묻는데 대본은 요리 수업을 예약하는 문항
 *   - 앞부분 걱정 때문에 다른 감정도 답이 되던 심정 문항
 * 정답을 가리고 풀게 하니 셋 다 바로 드러났다. 그래서 만들 때부터 이 검사를 지난다.
 *
 * 그림 문항은 모델이 그림을 볼 수 없으므로 그림을 시키는 설명(choice_image_prompts)을 같이 준다.
 * 이걸 빼먹으면 "그림이 없어 못 풀겠다"며 1번을 찍어 멀쩡한 문항이 걸린다.
 */
import { listeningChatJson } from "@/lib/listening/openai-listening-chat";
import { isPriceQuestion } from "@/lib/listening/price-check";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

export interface BlindSolveResult {
  /** 모델이 고른 번호(1~5). 풀지 못했으면 null */
  picked: number | null;
  /** 저장할 정답과 같은가 */
  matches: boolean;
  /** 모델이 "이것도 답이 될 수 있다"고 본 번호들 */
  alsoPossible: number[];
  /** 대본만으로 답이 분명한가 */
  confident: boolean;
  /** 지시문이 묻는 것과 대본이 어긋나는가 */
  instructionMismatch: boolean;
  /** 사람이 읽을 한 줄 설명 */
  note: string;
  /** 검사를 아예 돌리지 못했으면 true (이때는 문항을 걸지 않는다) */
  skipped: boolean;
}

const SKIPPED: BlindSolveResult = {
  picked: null,
  matches: true,
  alsoPossible: [],
  confident: true,
  instructionMismatch: false,
  note: "",
  skipped: true,
};

const SYSTEM = `너는 한국 중·고등학교 영어 듣기 시험을 푸는 사람이다.
정답은 알려 주지 않는다. 대본(과 그림 설명)만 근거로 스스로 풀어라.
근거가 대본에 없으면 찍지 말고 noBasis를 true로 두어라.
반드시 JSON만 답한다.`;

function choiceLines(q: GeneratedListeningQuestion): string {
  const choices = Array.isArray(q.choices) ? q.choices.map((c) => String(c)) : [];
  return choices.map((c, i) => `${i + 1}) ${c}`).join("\n");
}

/** 그림 문항이면 그림을 시킨 설명을 붙인다(모델은 그림 자체를 볼 수 없다). */
function pictureBlock(q: GeneratedListeningQuestion): string {
  const prompts = Array.isArray(q.choice_image_prompts)
    ? q.choice_image_prompts.map((p) => String(p ?? "").trim()).filter(Boolean)
    : [];
  if (prompts.length === 0) return "";
  const body =
    prompts.length === 1
      ? `그림: ${prompts[0]}`
      : prompts.map((p, i) => `${i + 1}) ${p}`).join("\n");
  return `\n[학생이 보는 그림 설명]\n${body}\n`;
}

function buildUser(q: GeneratedListeningQuestion): string {
  const table = q.table_data ? `\n표: ${JSON.stringify(q.table_data)}` : "";
  const prev = q.previous_turn ? `\n앞 발화: ${q.previous_turn}` : "";
  return `지시문: ${q.instruction ?? ""}
${q.question_text ? `문제: ${q.question_text}` : ""}${pictureBlock(q)}${table}${prev}
대본:
${String(q.script_text ?? "")}
선택지:
${choiceLines(q)}

다음을 JSON으로만 답하라.
- answer: 네가 고른 번호(1~5)
- confident: 대본만으로 그 답이 분명하면 true, 애매하면 false
- alsoPossible: 답이 될 수도 있다고 보는 다른 번호들(없으면 [])
- noBasis: 대본에 답의 근거가 아예 없으면 true
- instructionMismatch: 지시문이 묻는 것과 대본 내용이 어긋나면 true
- note: 문제가 있으면 한국어 한 문장, 없으면 ""

{"answer":1,"confident":true,"alsoPossible":[],"noBasis":false,"instructionMismatch":false,"note":""}`;
}

function toNumberList(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  const out: number[] = [];
  for (const v of raw) {
    const n = Math.floor(Number(v));
    if (n >= 1 && n <= 5 && !out.includes(n)) out.push(n);
  }
  return out;
}

/**
 * 한 문항을 정답 없이 풀어 보고 결과를 돌려준다.
 * 호출이 실패하면 skipped로 돌려준다 — 검사를 못 돌렸다는 이유로 멀쩡한 문항을 걸지 않는다.
 */
export async function blindSolveQuestion(
  apiKey: string,
  q: GeneratedListeningQuestion
): Promise<BlindSolveResult> {
  const choices = Array.isArray(q.choices) ? q.choices : [];
  if (choices.length < 2 || !q.script_text) return SKIPPED;
  /*
   * 금액 문항은 빼 둔다. 모델이 더하기를 틀려 멀쩡한 문항을 걸었다(실측: 두 문항 모두 저장된
   * 정답이 맞았다). 금액은 price-check.ts가 계산으로 검산하므로 그쪽이 더 정확하다.
   */
  if (isPriceQuestion(q)) return SKIPPED;
  try {
    const raw = await listeningChatJson<Record<string, unknown>>(apiKey, {
      temperature: 0.1,
      system: SYSTEM,
      user: buildUser(q),
    });
    const picked = Math.floor(Number(raw.answer));
    const valid = picked >= 1 && picked <= choices.length ? picked : null;
    const alsoPossible = toNumberList(raw.alsoPossible).filter((n) => n !== valid);
    const noBasis = Boolean(raw.noBasis);
    return {
      picked: valid,
      matches: valid === q.correct_answer,
      alsoPossible,
      confident: Boolean(raw.confident) && !noBasis,
      instructionMismatch: Boolean(raw.instructionMismatch),
      note: String(raw.note ?? "").replace(/\s+/g, " ").trim().slice(0, 200),
      skipped: false,
    };
  } catch {
    return SKIPPED;
  }
}

/**
 * 심정 문항만 한 번 더 본다. 감정은 "다 고르라"고 물어야 갈리는 것이 드러난다.
 * (실측: 앞부분에서 걱정하다가 뒤에서 놀라는 대화에 nervous와 surprised가 함께 선택지에 있었는데,
 *  하나만 고르라고 하면 모델도 surprised를 확신 있게 골라 그냥 지나갔다.)
 */
export async function emotionAmbiguityCheck(
  apiKey: string,
  q: GeneratedListeningQuestion
): Promise<{ defensible: number[]; skipped: boolean }> {
  const choices = Array.isArray(q.choices) ? q.choices.map((c) => String(c)) : [];
  if (!/심정/.test(q.question_type ?? "") && !/심정/.test(q.instruction ?? "")) {
    return { defensible: [], skipped: true };
  }
  if (choices.length < 2 || !q.script_text) return { defensible: [], skipped: true };
  try {
    const raw = await listeningChatJson<Record<string, unknown>>(apiKey, {
      temperature: 0.1,
      system: SYSTEM,
      user: `아래 대화를 읽고 ${q.instruction ?? "인물의 심정"}을 판단하라.

이 유형은 "처음엔 걱정하다 끝에 안도" 같은 흐름을 일부러 넣고, 중간 감정을 오답으로 둔다.
그러니 중간에 스쳐 간 감정은 답이 아니다. 대화가 끝날 때 그 사람의 심정이 무엇인지로 정한다.

best: 대화 끝의 심정에 가장 맞는 번호 하나.
tied: best와 **근거의 무게가 대등해서** 어느 쪽을 답으로 해도 이상하지 않은 번호들.
   - 중간에만 드러났다가 뒤에 바뀐 감정은 넣지 않는다.
   - 대화 끝 장면을 두고 정말 둘 다 맞다고 할 만할 때만 넣는다. 보통은 빈 배열이다.

대본:
${String(q.script_text ?? "")}
선택지:
${choiceLines(q)}

JSON만: {"best":1,"tied":[],"why":"한국어 한 문장"}`,
    });
    const best = Math.floor(Number(raw.best));
    const tied = toNumberList(raw.tied).filter((n) => n !== best);
    const defensible = best >= 1 && best <= 5 ? [best, ...tied] : tied;
    return { defensible, skipped: false };
  } catch {
    return { defensible: [], skipped: true };
  }
}

/** 이 결과 때문에 사람이 봐야 하는가 */
export function blindSolveNeedsReview(r: BlindSolveResult): boolean {
  if (r.skipped) return false;
  if (!r.matches) return true;
  if (r.instructionMismatch) return true;
  /*
   * "저 답도 될 수 있다"는 말만으로는 걸지 않는다. 심정 문항은 다른 감정을 하나쯤 대는 것이
   * 보통이라(실측: 심정 8문항 중 3개) 그걸로 걸면 멀쩡한 문항까지 검토 목록에 쌓인다.
   * 모델이 스스로 "분명하지 않다"고 할 때만 건다. 후보는 problems에 적어 선생님이 보게 둔다.
   */
  return !r.confident;
}

/** 검수 결과에 남길 한 줄 */
export function blindSolveProblem(
  r: BlindSolveResult,
  correctAnswer: number
): string | null {
  if (r.skipped) return null;
  if (!r.matches) {
    return `정답을 가리고 풀렸더니 ${r.picked ?? "?"}번이 나왔습니다(저장된 정답 ${correctAnswer}번).${r.note ? ` ${r.note}` : ""}`;
  }
  if (r.instructionMismatch) {
    return `지시문이 묻는 것과 대본 내용이 어긋납니다.${r.note ? ` ${r.note}` : ""}`;
  }
  if (r.alsoPossible.length > 0) {
    return `${r.alsoPossible.join("·")}번도 답이 될 수 있습니다.${r.note ? ` ${r.note}` : ""}`;
  }
  if (!r.confident) {
    return `대본만으로는 답이 분명하지 않습니다.${r.note ? ` ${r.note}` : ""}`;
  }
  return null;
}

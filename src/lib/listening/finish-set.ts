/**
 * 세트를 다 만든 뒤 스스로 손보는 자리.
 *
 * 문항 하나만 보는 검사는 이미 생성 고리 안에 있다(정답 가리고 풀기·대본 검사·표 규칙).
 * 여기서는 그것만으로는 알 수 없는 두 가지를 본다.
 *   1) 다른 회차·다른 학년과 이야기가 겹치는 문항 → 그 문항만 다시 만든다
 *   2) 정답 번호가 한쪽으로 쏠린 것 → 선택지 자리만 바꿔 고르게 편다
 * 선생님이 받아 보고 고쳐 달라고 하지 않아도 되도록, 만든 자리에서 끝낸다.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ListeningDifficultyMode } from "@/lib/listening/exam-difficulty";
import type { ListeningGradeLevel } from "@/lib/listening/grade-level";
import { generateSingleExamQuestion } from "@/lib/listening/generate-questions";
import {
  SAME_STORY,
  balanceAnswerNumbers,
  findDuplicateStories,
  topicOverlap,
  topicWords,
} from "@/lib/listening/set-gate";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

/** 한 번에 다시 만드는 문항 수 상한 (시간·값을 생각해 넉넉하지 않게) */
const MAX_REWRITES = 4;

export interface TidyResult {
  questions: GeneratedListeningQuestion[];
  /** 이야기가 겹쳐 다시 만든 문항 번호 */
  rewritten: number[];
  /** 정답 번호를 옮긴 문항 번호 */
  rebalanced: number[];
}

/** 이 세트 안에서 서로 이야기가 겹치는 문항 (뒤에 있는 것을 다시 만든다) */
function duplicatesWithinSet(questions: GeneratedListeningQuestion[]): Map<number, string> {
  const notes = new Map<number, string>();
  const words = questions.map((q) => topicWords(String(q.script_text ?? "")));
  for (let i = 0; i < questions.length; i++) {
    for (let j = i + 1; j < questions.length; j++) {
      const ratio = topicOverlap(words[i]!, words[j]!);
      if (ratio >= SAME_STORY) {
        const later = questions[j]!;
        notes.set(
          later.order_index,
          `same_story|같은 회차 ${questions[i]!.order_index}번과 이야기가 겹친다(${Math.round(
            ratio * 100
          )}%). 다른 장소·다른 소재로 새 상황을 잡아라.`
        );
      }
    }
  }
  return notes;
}

export async function tidyGeneratedSet(opts: {
  admin: SupabaseClient;
  apiKey: string;
  setId: string;
  gradeLevel: ListeningGradeLevel;
  difficultyMode: ListeningDifficultyMode;
  questions: GeneratedListeningQuestion[];
  usedAnswersByType?: Record<number, string[]>;
  rotation?: number;
  /** 이 시각(ms)을 넘기면 다시 만들기를 멈춘다 — 화면이 기다리다 끊기면 안 된다 */
  deadlineAt?: number;
}): Promise<TidyResult> {
  const questions = [...opts.questions];
  const rewritten: number[] = [];

  // 1) 이야기가 겹치는 문항 찾기 (같은 세트 안 + 다른 세트)
  const notes = duplicatesWithinSet(questions);
  const acrossSets = await findDuplicateStories(
    opts.admin,
    opts.setId,
    opts.gradeLevel,
    questions.map((q) => ({
      id: String(q.order_index),
      order_index: q.order_index,
      question_type: q.question_type ?? null,
      script_text: q.script_text ?? null,
    }))
  );
  for (const d of acrossSets) if (!notes.has(d.orderIndex)) notes.set(d.orderIndex, d.note);
  /*
   * 세 번을 고쳐도 검사에 걸려 "검토 필요"로 남은 문항은 선생님께 넘기지 않고 새 상황으로 다시 만든다.
   * 같은 상황을 붙잡고 고치면 같은 흠이 되풀이되므로, 걸린 이유와 함께 처음부터 새로 쓰게 한다.
   */
  for (const q of questions) {
    if (!q.needs_review || notes.has(q.order_index)) continue;
    const why = (q.problems ?? []).filter(Boolean).slice(0, 2).join(" / ");
    notes.set(
      q.order_index,
      `fresh_rewrite|앞서 만든 문항이 검사를 통과하지 못했다(${why || "검토 필요"}). 상황·소재를 완전히 새로 잡아 처음부터 다시 써라.`
    );
  }

  // 2) 겹친 문항만 다시 만든다 (한 번씩만 — 다시 만든 것이 또 겹치면 그대로 둔다)
  const deadlineAt = opts.deadlineAt ?? Date.now() + 90_000;
  for (const [orderIndex, note] of [...notes].slice(0, MAX_REWRITES)) {
    // 한 문항 다시 만드는 데 보통 20초쯤 걸린다 — 그만큼도 안 남았으면 그만둔다
    if (Date.now() > deadlineAt - 25_000) break;
    const i = questions.findIndex((q) => q.order_index === orderIndex);
    if (i < 0) continue;
    try {
      const fresh = await generateSingleExamQuestion(
        opts.apiKey,
        orderIndex,
        opts.difficultyMode,
        [note],
        opts.gradeLevel,
        orderIndex,
        undefined,
        {
          usedAnswers: opts.usedAnswersByType?.[orderIndex] ?? [],
          rotation: opts.rotation ?? -1,
        }
      );
      questions[i] = { ...fresh, order_index: orderIndex };
      rewritten.push(orderIndex);
    } catch {
      // 다시 만들지 못하면 원래 문항을 그대로 둔다 (만든 것을 버리지 않는다)
    }
  }

  // 3) 정답 번호 쏠림 펴기 (내용은 그대로, 선택지 자리만)
  const moves = balanceAnswerNumbers(
    questions.map((q) => ({
      order_index: q.order_index,
      question_type: q.question_type,
      choices: q.choices,
      correct_answer: q.correct_answer,
      table_data: q.table_data,
      choice_image_prompts: q.choice_image_prompts,
      choice_image_urls: q.choice_image_urls,
    }))
  );
  for (const m of moves) {
    const i = questions.findIndex((q) => q.order_index === m.order_index);
    if (i >= 0) {
      questions[i] = { ...questions[i]!, choices: m.choices, correct_answer: m.correct_answer };
    }
  }

  return { questions, rewritten, rebalanced: moves.map((m) => m.order_index) };
}

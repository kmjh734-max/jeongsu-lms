/**
 * 듣기 세트를 여기서 만들 때 쓰는 적기 틀.
 *
 * 문항은 사람이 직접 쓴다(모델 호출 없음). 그림은 라벨 없는 장면을 받아 번호를 직접 찍고,
 * 음성은 Edge 목소리로 만든다. 세 가지 모두 값이 들지 않거나 아주 적다.
 */
import type { ListeningGradeLevel } from "@/lib/listening/grade-level";

export type Speaker = "ANN" | "M" | "W";

export interface QuestionSpec {
  /** 문항 번호 (1부터) */
  order: number;
  /** 유형 이름 — 기존 세트와 같은 말을 쓴다 (예: "목적 파악", "그림 불일치") */
  type: string;
  /** 지시문 */
  instruction: string;
  /** 대본 — [화자, 대사] 차례대로 */
  lines: Array<[Speaker, string]>;
  /** 선택지 5개 */
  choices: string[];
  /** 정답 번호 1~5 */
  answer: number;
  /** 정답 근거가 되는 대본 문장(그대로 옮겨 적는다) */
  clue: string;
  /** 해설 (한국어) */
  explanation: string;
  /** 대본 해석 (한국어) */
  translation: string;
  /** 문항 위에 따로 보여 줄 글 (응답 유형의 빈칸 줄 등) */
  questionText?: string;
  /** 표 문항이면 표 내용 */
  table?: { rows: Array<{ no: number; label: string; value: string }> };
  /** 그림 문항이면 그림 계획 */
  figure?: {
    /** 그림 모델에 줄 장면 설명 — 라벨은 그리지 말라고 되어 있다 */
    scene: string;
    /** 라벨 ①~⑤를 찍을 자리 (가로·세로를 1로 본 비율). 그림을 보고 정한다. */
    spots?: Array<[number, number]>;
    /** 한 장짜리 상황 그림이면 라벨 없이 쓴다 */
    kind?: "labeled" | "plain";
  };
}

export interface SetSpec {
  title: string;
  gradeLevel: ListeningGradeLevel;
  /** 0.8 = 조금 느리게 (선생님이 정한 값, 2026-09-21) */
  speechSpeed: number;
  /** 넣을 폴더 이름 (없으면 만든다) */
  folder?: string;
  questions: QuestionSpec[];
}

export function scriptTextOf(q: QuestionSpec): string {
  return q.lines.map(([s, t]) => `${s}: ${t}`).join("\n");
}

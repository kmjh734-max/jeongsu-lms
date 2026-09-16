import type { ExamTypeTemplate } from "@/lib/listening/exam-type-template";
import { templatesFromBlueprint } from "@/lib/listening/grade-exam-types";

/**
 * 중1 20유형 — 중1~중3이 한 배치표(검증된 중3 배치)를 함께 쓰고 난이도만 학년별로 다르다.
 * 예전에는 옛 중1 표의 문구(유형 이름·format_guide)에 새 배치표의 유형 키·모듈 번호만 덧붙여서,
 * 2번은 "언급하지 않은 것"을 내면서 구입 문항 지침을 받는 식으로 자리마다 유형이 어긋났다.
 * 배치는 grade-blueprints.ts, 유형 문구는 type-catalog.ts.
 */
export const MIDDLE1_LISTENING_EXAM_TYPES: ExamTypeTemplate[] = templatesFromBlueprint("middle1");

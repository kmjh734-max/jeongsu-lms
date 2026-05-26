/**
 * @deprecated 유형별 프롬프트는 src/lib/listening/prompts/ 를 사용합니다.
 * 하위 호환용 re-export.
 */
export {
  COMMON_PROMPT as EXAM_SCRIPT_RULES,
  JSON_OUTPUT_SCHEMA,
} from "@/lib/listening/prompts/commonPrompt";

export const CHOICE_RULES = `
선택지 규칙:
- Exactly 5 choices, exactly 1 correct answer (correct_answer 1~5)
- Wrong options: same category as correct; similar length and style
- Korean instruction types → Korean choices (unless type 19~20)
- Types 19~20 → English reply sentences only
`.trim();

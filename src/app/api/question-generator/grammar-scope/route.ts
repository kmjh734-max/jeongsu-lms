import { ONE_PAGE_GRAMMAR_RULES } from "@/lib/lesson-materials/one-page-grammar-rules";
import { jsonError, jsonOk, requireStaffProfile } from "@/lib/question-generator/api-helpers";

/**
 * 조건 영작에서 고를 수 있는 어법 목록.
 * 선생님 요청(2026-09-28): 문법을 무작위로 둬도 되고, 정해 둔 범위로 좁혀도 되게.
 * 어법 표는 교재 규칙 파일(50KB 남짓)에서 만들어지므로 화면으로 직접 들여오지 않고
 * 여기서 이름만 내려 준다.
 */
export async function GET() {
  try {
    await requireStaffProfile();
    return jsonOk({
      grammars: ONE_PAGE_GRAMMAR_RULES.slice(0, 30).map((r) => r.labelKo),
    });
  } catch (e) {
    if (e instanceof Response) return e;
    return jsonError("어법 목록을 불러오지 못했습니다.", 500);
  }
}

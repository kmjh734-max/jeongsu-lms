import { jsonError, jsonOk, requireStaffProfile } from "@/lib/question-generator/api-helpers";
import { WRITING_GRAMMARS } from "@/lib/question-generator/writing-grammar";

/**
 * 조건 영작에서 고를 수 있는 어법 목록.
 * 선생님 요청(2026-09-28): 문법을 무작위로 둬도 되고, 정해 둔 범위로 좁혀도 되게.
 */
export async function GET() {
  try {
    await requireStaffProfile();
    // 이름만으로는 무엇을 쓰라는 건지 알기 어려워서 형태와 설명을 함께 내려 준다
    return jsonOk({
      grammars: WRITING_GRAMMARS.map((g) => ({
        label: g.label,
        form: g.form,
        hint: g.hint,
      })),
    });
  } catch (e) {
    if (e instanceof Response) return e;
    return jsonError("어법 목록을 불러오지 못했습니다.", 500);
  }
}

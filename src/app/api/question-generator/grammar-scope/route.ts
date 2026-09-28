import { jsonError, jsonOk, requireStaffProfile } from "@/lib/question-generator/api-helpers";
import { WRITING_GRAMMARS } from "@/lib/question-generator/writing-grammar";

/**
 * 조건 영작에서 고를 수 있는 어법 목록.
 * 선생님 요청(2026-09-28): 문법을 무작위로 둬도 되고, 정해 둔 범위로 좁혀도 되게.
 */
export async function GET() {
  try {
    await requireStaffProfile();
    /*
     * 이름만으로는 무엇을 쓰라는 건지 알기 어려워서 형태와 설명을 함께 내려 준다.
     * 고등 교과서 몇 종에 나오는지도 붙여, 여러 교과서가 공통으로 다루는 것부터 보이게 한다
     * (선생님 요청 2026-09-29: 교과서 문법 포인트를 고를 수 있게).
     */
    const sorted = [...WRITING_GRAMMARS].sort(
      (a, b) =>
        (b.textbookBooks ?? 0) - (a.textbookBooks ?? 0) ||
        a.label.localeCompare(b.label, "ko")
    );
    return jsonOk({
      grammars: sorted.map((g) => ({
        label: g.label,
        form: g.form,
        hint: g.hint,
        textbookBooks: g.textbookBooks ?? 0,
      })),
    });
  } catch (e) {
    if (e instanceof Response) return e;
    return jsonError("어법 목록을 불러오지 못했습니다.", 500);
  }
}

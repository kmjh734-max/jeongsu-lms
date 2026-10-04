/**
 * 해설에서 번호(①②… ⓐⓑ…) 뒤 조사를 읽는 소리에 맞춘다.
 * 점검 때마다 「①는」「②은」이 나왔다(2026-10-04 8·9차 시험). 모델이 번호를 글자로 보고 조사를 붙여서다.
 *   ① 일 · ③ 삼 · ⑥ 육 · ⑦ 칠 → 받침 있음 (①·⑦은 ㄹ받침이라 「로」)
 *   ② 이 · ④ 사 · ⑤ 오, ⓐ~ⓖ(에이·비·씨…) → 받침 없음
 */
const HAS_FINAL: Record<string, boolean> = {
  "①": true, "②": false, "③": true, "④": false, "⑤": false, "⑥": true, "⑦": true,
};
const RIEUL = new Set(["①", "⑦"]);

export function fixCircledParticles(text: string | null | undefined): string {
  const s = String(text ?? "");
  // 조사 뒤가 낱말의 일부(「이다」「이며」 등)가 아닌 경우만 고친다
  return s.replace(
    /([①-⑦ⓐ-ⓖ])(은|는|이|가|을|를|과|와|으로|로)(?=[\s,.)·;:」』]|$)/g,
    (_m, mark: string, josa: string) => {
      const fin = HAS_FINAL[mark] ?? false; // ⓐ~ⓖ는 받침 없음
      const pick: Record<string, [string, string]> = {
        은: ["은", "는"], 는: ["은", "는"],
        이: ["이", "가"], 가: ["이", "가"],
        을: ["을", "를"], 를: ["을", "를"],
        과: ["과", "와"], 와: ["과", "와"],
      };
      if (josa === "으로" || josa === "로") {
        return mark + (fin && !RIEUL.has(mark) ? "으로" : "로");
      }
      const pair = pick[josa]!;
      return mark + (fin ? pair[0] : pair[1]);
    }
  );
}

/**
 * 답 칸에 한 글자씩 친 것만 받는다.
 *
 * 휴대폰 키보드는 자동완성(추천 단어)을 끄라는 표시(autocomplete·autocorrect·spellcheck)를
 * 무시하는 경우가 많다(삼성·Gboard). 몇 글자만 치고 추천 단어를 누르면 답이 한 번에 채워지므로,
 * 한 번에 두 글자 넘게 늘어나는 입력(추천 단어 누르기·밀어서 쓰기·붙여넣기)은 받지 않는다.
 * 지우기·한 글자 입력·한글 조합(ㅅ→사→삿)은 그대로 받는다.
 */
export function typedOnly(prev: string, next: string): string {
  return next.length > prev.length + 1 ? prev : next;
}

/** 답 칸에 함께 거는 속성: 브라우저 자동완성·맞춤법·붙여넣기·끌어 놓기 막기 */
export const answerInputGuards = {
  autoComplete: "off",
  autoCorrect: "off",
  autoCapitalize: "none",
  spellCheck: false,
  "data-gramm": "false",
  "data-lpignore": "true",
  onPaste: (e: { preventDefault: () => void }) => e.preventDefault(),
  onDrop: (e: { preventDefault: () => void }) => e.preventDefault(),
} as const;

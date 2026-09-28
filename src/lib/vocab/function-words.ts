/**
 * 뜻을 외울 낱말이 아닌 기능어.
 *
 * 단어장은 "외울 낱말"만 담는다. the, is, of 같은 말은 어느 단어장에도 없지만
 * 몰라서 못 읽는 낱말도 아니다. 지문의 어휘 수준을 잴 때는 이 낱말들을 빼고,
 * 내용어만 가지고 센다. 그래야 "단어장 밖 낱말"이 정말 어려운 낱말을 가리킨다.
 */
export const FUNCTION_WORDS = new Set<string>(
  `a an the this that these those
   i me my mine myself you your yours yourself yourselves
   he him his himself she her hers herself it its itself
   we us our ours ourselves they them their theirs themselves
   who whom whose which what where when why how
   am is are was were be been being
   do does did done doing
   have has had having
   will would shall should can could may might must
   not no nor none neither either both all any some each every
   and or but so yet for nor because if unless although though while whereas
   as than then there here
   of in on at by to from with without within into onto over under
   above below between among through during after before about against
   across along around behind beyond beside near off out up down
   again also too very just only even still ever never always often
   more most less least much many few little
   one two three four five six seven eight nine ten
   first second next last other another same such own
   s t re ve ll d m`
    .split(/\s+/)
    .filter(Boolean)
);

export function isFunctionWord(word: string): boolean {
  return FUNCTION_WORDS.has(word.toLowerCase());
}

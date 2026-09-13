/**
 * 어법 교재 5권에서 뽑은 출제 규칙(2026-09-13).
 *
 * 선생님이 준 교재(고등영어 어법서술형, 어법끝 스타트, 처음 만나는 수능 어법 스타터 본책·워크북,
 * 첫단추 문어법)를 코드별로 요약했다. 교재 문장은 싣지 않는다: 쌍의 모양, 판단 기준, 함정,
 * "둘 다 가능해서 내면 안 되는 경우"만 짧게 적었다.
 *
 * - freq: 다섯 권에서 이 포인트를 묻는 두 선택 문항 수(교재가 얼마나 자주 묻는지)
 * - books: 이 포인트를 다룬 교재 수
 * - pairs: 교재가 대비시키는 쌍의 모양
 * - decide: 무엇을 보고 고르는지
 * - trap: 교재가 오답으로 쓰는 함정
 * - avoid: 교재가 둘 다 된다고 하거나 출제하지 않는 경우
 *
 * 분석 프롬프트(runtime-prompt.ts)에 실어 쌍과 오답을 교재처럼 만들게 하고,
 * 후보 순위(candidate-ranker.ts)에서 같은 우선순위끼리는 교재가 자주 묻는 포인트를 앞세운다.
 * 원본과 추출 과정: scratchpad/books(저장소 밖). 교재 PDF는 /참고파일(커밋하지 않는다).
 */
export type TextbookRule = {
  freq: number;
  books: number;
  pairs: string[];
  decide: string;
  trap?: string;
  avoid?: string;
};

export const TEXTBOOK_RULES: Record<string, TextbookRule> = {
  VOICE_ACTIVE_PASSIVE: { freq: 75, books: 5, pairs: ["absorbs / is absorbed","ate / was eaten","능동 / 수동"], decide: "주어가 동작을 '하는' 대상이면 능동, '당하는' 대상이면 수동(be+p.p.)을 쓴다.", trap: "자동사를 수동태로 씀" },
  AGREEMENT_LONG_SUBJECT: { freq: 69, books: 4, pairs: ["are / is","was / were","has / have"], decide: "주어와 동사 사이 긴 수식어가 있어도 동사는 진짜 주어에 일치시킨다.", trap: "수식구 안의 가장 가까운 명사에 동사를 맞춤" },
  RELATIVE_WHAT: { freq: 65, books: 5, pairs: ["that / what","that/which / what"], decide: "선행사가 없으면 what(=the thing that)을 쓰고, 선행사가 있으면 what을 쓸 수 없다.", trap: "선행사가 있는데 what을 씀" },
  CONJUNCTION_PREPOSITION_CONTRAST: { freq: 63, books: 5, pairs: ["because / because of","during / while","although / despite"], decide: "뒤에 '주어+동사'의 절이 오면 접속사, 명사(구)가 오면 전치사(구)를 쓴다.", trap: "절 앞에 전치사를 씀" },
  COMPARATIVE: { freq: 58, books: 5, pairs: ["비교급 / 원급","as popular than / more popular than","much best / much better"], decide: "두 대상을 비교할 때 형용사·부사는 비교급(-er/more)으로 쓰고 than으로 연결한다.", trap: "very로 비교급을 강조" },
  GERUND_VERB_OBJECT: { freq: 55, books: 5, pairs: ["forgetting / to forget","joining / to join","to v / v-ing"], decide: "enjoy, avoid, deny, finish, mind, spend time 등은 동명사를 목적어로 취한다.", trap: "두 그룹을 서로 바꿔 쓰는 오류" },
  AGREEMENT_RELATIVE_ANTECEDENT: { freq: 53, books: 5, pairs: ["v-단수 / v-복수","are / is","was / were"], decide: "관계절 안의 동사는 선행사의 수에 일치시킨다.", trap: "관계절 안의 다른 명사에 동사를 맞춤" },
  RELATIVE_ADVERB_WHERE: { freq: 52, books: 5, pairs: ["where / which/that","where he works / which he works","the office where / the office which"], decide: "장소를 나타내는 선행사 뒤에 완전한 절이 오면 where를 쓴다.", trap: "완전한 절 앞에 관계대명사를 씀" },
  PARTICIPLE_EMOTION: { freq: 51, books: 4, pairs: ["surprised / surprising","embarrassed / embarrassing"], decide: "감정을 일으키는 대상은 V-ing, 감정을 느끼는 사람/주체는 p.p.를 쓴다.", trap: "사물 주어에 -ed를 쓰는 오류" },
  MODAL_HAVE_PP: { freq: 50, books: 5, pairs: ["must forget / must have forgotten","should have rested / should rest","cannot break / cannot have broken"], decide: "현재 사실 부정은 cannot V, 과거 사실 부정 추측은 cannot have p.p.; not의 위치는 조동사 바로 뒤.", trap: "과거 사실인데 조동사+동사원형만 쓰는 오류" },
  MANDATIVE_SHOULD: { freq: 50, books: 5, pairs: ["studies / study","consider / considers","be / is"], decide: "suggest, insist, order, demand 등 요구·제안·명령 동사의 that절에는 (should) 동사원형을 쓴다.", trap: "일반 과거/현재 시제를 그대로 쓰는 오류", avoid: "that절이 이미 일어난 사실을 진술할 때는 should 없이 시제를 그대로 사용" },
  CONDITIONAL_SECOND: { freq: 50, books: 5, pairs: ["would/could+have p.p. / would/could+v","would/could/might+동사원형 / 과거"], decide: "if절이 과거형(현재 사실 반대)이면 주절은 'would/could/might+동사원형'을 쓴다.", trap: "if절에 현재시제를 쓰는 오류" },
  TENSE_TIME_CONDITION_CLAUSE: { freq: 49, books: 5, pairs: ["is good / will be good","comes back / will come back","v / will v"], decide: "if/when/before 등이 이끄는 시간·조건 부사절은 미래의 일이라도 현재시제로 쓴다.", trap: "부사절인데 will을 씀", avoid: "명사절(if/whether)에서는 will을 쓸 수 있음" },
  CONDITIONAL_THIRD: { freq: 47, books: 5, pairs: ["would/could+have p.p. / would/could+v","had p.p. / would have p.p.","had p.p. / 과거"], decide: "과거 사실과 반대되는 가정은 If+주어+had p.p., 주어+would/could have p.p.로 쓴다.", trap: "if절에 단순과거만 쓰는 오류" },
  AGREEMENT_PARTITIVE: { freq: 45, books: 5, pairs: ["are / is","단수동사 / 복수동사","has / have"], decide: "most/some/half/a lot of + 명사에서 동사는 of 뒤 명사의 수에 일치시킨다.", trap: "of 앞 수량표현 자체의 형태로 판단" },
  PARTICIPLE_NOUN_MODIFIER: { freq: 44, books: 3, pairs: ["p.p. / v-ing","restricted / restricting","writing / written"], decide: "수식받는 명사가 동작을 하면 V-ing(능동), 동작을 당하면 p.p.(수동)를 쓴다.", trap: "수동 관계인데 -ing를 쓰는 오류" },
  OBJECT_COMPLEMENT_TO_V: { freq: 42, books: 4, pairs: ["enter / to enter","to go / went","to-v / 동사원형"], decide: "allow, expect, ask, cause, force, enable, get 등은 목적격보어로 to부정사를 요구한다.", trap: "원형부정사를 쓰는 오류" },
  PARTICIPIAL_CLAUSE_ACTIVE: { freq: 42, books: 4, pairs: ["p.p. / v-ing","realized / realizing","studied abroad / studying abroad"], decide: "분사구문의 의미상 주어가 능동으로 동작을 하면 V-ing를 쓴다.", trap: "수동 분사(p.p.)와 혼동해서 사용" },
  RELATIVE_NONRESTRICTIVE: { freq: 40, books: 5, pairs: ["that/what / which/who",", that / , which","that / which"], decide: "콤마 뒤 계속적 용법에는 that을 쓸 수 없다.", trap: "콤마 뒤에 that을 사용" },
  PRONOUN_REFLEXIVE: { freq: 40, books: 5, pairs: ["him / himself","them / themselves","인칭대명사/소유대명사 / 재귀대명사"], decide: "주어와 목적어가 같은 대상을 가리키면 목적어 자리에 재귀대명사를 쓴다.", trap: "주어와 목적어가 달라도 재귀대명사를 씀" },
  AS_AS: { freq: 37, books: 5, pairs: ["as hard as / so hard as","as powerful as / as powerfully as","as+비교급+as / as+원급+as"], decide: "as와 as 사이에는 형용사/부사의 원급을 쓴다.", trap: "비교급을 넣는 오류" },
  QUANTIFIER: { freq: 36, books: 3, pairs: ["many / much","a few / a little","few / little"], decide: "뒤 명사의 가산/불가산 여부에 맞는 수량사를 고른다.", trap: "불가산명사에 many를 쓰는 오류", avoid: "a lot of, lots of, plenty of, some, any는 가산·불가산 모두에 사용 가능" },
  AGREEMENT_PREPOSITIONAL_MODIFIER: { freq: 35, books: 3, pairs: ["v-단수 / v-복수","are / is","단수동사 / 복수동사"], decide: "동사는 수식어구 속의 명사가 아니라 문장의 진짜 주어(핵심 명사)의 수에 일치시킨다.", trap: "전치사구 속 명사의 수를 주어로 착각" },
  USED_TO: { freq: 34, books: 5, pairs: ["used to v / would v","used to / would"], decide: "used to V는 과거의 습관·상태, be used to V-ing는 ~에 익숙하다는 뜻으로 전혀 다르다.", trap: "상태동사에 would를 쓰는 오류", avoid: "반복 동작 습관은 would/used to 모두 가능" },
  INVERSION_NEGATIVE: { freq: 34, books: 3, pairs: ["do people get / people get","had i dreamed / i had dreamed","조동사+주어+동사원형 / 주어+조동사+동사원형"], decide: "Never, Seldom, Not until 등 부정어가 문두에 오면 주어와 (조)동사가 도치된다.", trap: "도치를 하지 않고 평서문 어순을 유지" },
  INDIRECT_QUESTION_ORDER: { freq: 32, books: 5, pairs: ["의문사+동사+주어 / 의문사+주어+동사"], decide: "의문사가 다른 절 안에 들어가면 평서문 어순(의문사+주어+동사)이 된다.", trap: "의문문 어순을 그대로 유지" },
  PARALLEL_AND_OR_BUT: { freq: 32, books: 4, pairs: ["go out / going out","and live / and lives","형태 불일치 / 형태 일치"], decide: "and/or/but로 연결되는 두 요소는 같은 문법 형태(품사·시제·구조)를 유지해야 한다.", trap: "병렬 요소 중 하나만 다른 시제·형태로 쓰는 오류" },
  PRONOUN_ANTECEDENT: { freq: 32, books: 3, pairs: ["it/them / that/those","it / them","his/her / their"], decide: "대명사는 가리키는 명사(선행사)의 수와 성에 일치시킨다.", trap: "가까운 다른 명사를 선행사로 착각" },
  TENSE_PRESENT_PAST: { freq: 30, books: 2, pairs: ["bought / have bought","has been founded / was founded"], decide: "yesterday, ~ago, last~, in+과거연도처럼 명확한 과거 시점 표시어가 있으면 단순과거를 쓰고 현재완료는 쓸 수 없다.", trap: "명백한 과거 부사와 현재완료를 함께 씀" },
  COMPARISON_TARGET: { freq: 29, books: 4, pairs: ["that / those"], decide: "비교 대상으로 반복되는 명사를 대신할 때 단수는 that, 복수는 those를 쓴다.", trap: "복수명사를 that으로 받는 오류" },
  AGREEMENT_GERUND_SUBJECT: { freq: 29, books: 5, pairs: ["단수동사 / 복수동사","v-단수 / v-복수","are / is"], decide: "동명사(구)가 주어이면 항상 단수 취급한다.", trap: "주어구 안의 목적어 명사 수에 동사를 맞춤" },
  PERCEPTION_COMPLEMENT: { freq: 29, books: 4, pairs: ["rise / to rise","cried / crying","award / awarded"], decide: "지각동사(see, hear 등)+목적어+원형부정사 문장을 수동태로 바꾸면 원형부정사는 to부정사가 된다.", trap: "지각동사 뒤에 to부정사를 씀", avoid: "단순 사실이면 원형, 진행 중임을 강조하면 -ing 모두 가능" },
  ANOTHER_OTHER_THE_OTHER: { freq: 29, books: 4, pairs: ["another / the other","other / others","another / other"], decide: "여럿 중 정해지지 않은 하나 더는 another, 둘 중 나머지 하나는 the other, 남은 것 전부는 the others/others로 구분한다.", trap: "the 유무를 혼동" },
  TENSE_PRESENT_PERFECT_PAST: { freq: 28, books: 4, pairs: ["has lived / lived","have p.p. / 과거","과거형 / 현재완료형"], decide: "in 1946처럼 명백한 과거 시점 부사가 있으면 현재완료를 쓸 수 없고 과거형을 쓴다.", trap: "ago가 있는데 완료형을 쓰는 오류" },
  GERUND_FIXED_CONSTRUCTION: { freq: 28, books: 3, pairs: ["to v / v-ing","v / v-ing"], decide: "be worth, on, look forward to, object to, cannot help 같은 관용구는 반드시 동명사를 쓴다.", trap: "to부정사로 착각해 동사원형을 씀" },
  WITH_OBJECT_PARTICIPLE: { freq: 28, books: 3, pairs: ["p.p. / v-ing","with legs crossed / with legs crossing","with everyone sat / with everyone sitting"], decide: "with+목적어 뒤 분사는 목적어가 능동으로 하면 V-ing, 당하면 p.p.를 쓴다.", trap: "능동/수동 관계를 반대로 판단" },
  AGREEMENT_ONE_OF: { freq: 28, books: 4, pairs: ["are / is","was / were","단수동사 / 복수동사"], decide: "one of the + 복수명사가 주어이면 동사는 one에 맞춰 단수로 쓴다.", trap: "가까운 복수명사에 동사를 맞춤" },
  PARTICIPLE_ACTIVE_PASSIVE: { freq: 28, books: 2, pairs: ["p.p. / v-ing"], decide: "수식받는 명사가 분사의 행위를 스스로 하면 -ing(능동), 그 행위를 당하면 p.p.(수동)를 쓴다.", trap: "의미관계를 거꾸로 판단하는 오류" },
  ADJECTIVE_SUBJECT_COMPLEMENT: { freq: 28, books: 3, pairs: ["comfortable / comfortably","silent / silently","부사 / 형용사"], decide: "명사를 수식하거나 주어·목적어를 보충 설명하면 형용사를, 동사·형용사·부사·문장을 수식하면 부사를 쓴다.", trap: "명사 없이 like를 씀" },
  TENSE_PAST_PERFECT: { freq: 27, books: 3, pairs: ["had left / left","had lost / lost","had p.p. / 과거"], decide: "기준이 되는 과거 시점보다 먼저 일어난 일은 과거완료로 쓴다.", trap: "두 사건 모두 단순과거로 쓰는 오류" },
  ADVERB_VERB_MODIFIER: { freq: 26, books: 3, pairs: ["mechanical / mechanically","regular / regularly","unexpected / unexpectedly"], decide: "동사를 수식할 때는 형용사가 아니라 부사를 쓴다.", trap: "형용사로 동사를 수식하는 오류" },
  RELATIVE_COMPOUND: { freq: 25, books: 2, pairs: ["however breaks / whoever breaks","whatever you want / whichever you want"], decide: "whoever/whatever/whichever(명사절, ~하는 사람/것은 누구든)와 however/whenever/wherever(부사절, 아무리~해도/언제·어디서든)…", trap: "명사절 자리에 however를 쓰는 등 역할 혼동" },
  AGREEMENT_CLAUSE_SUBJECT: { freq: 24, books: 5, pairs: ["are / is","v-단수 / v-복수","단수동사 / 복수동사"], decide: "what절이나 that절이 주어이면 단수로 취급한다.", trap: "절 안의 명사 수에 동사를 맞춤" },
  AGREEMENT_EACH_EVERY: { freq: 23, books: 5, pairs: ["단수동사 / 복수동사","weigh / weighs","has / have"], decide: "each, every는 뒤에 단수명사와 단수동사를 취한다.", trap: "both를 단수로 착각" },
  CAUSATIVE_ACTIVE: { freq: 23, books: 3, pairs: ["clean / to clean","apologize / to apologize","to-v / 동사원형"], decide: "make, have, let + 목적어 뒤에는 동사원형을 목적격보어로 쓴다.", trap: "make/let 뒤에 to부정사를 씀", avoid: "help는 목적격보어로 원형과 to-v 둘 다 가능" },
  PARALLEL_VERBS: { freq: 23, books: 2, pairs: ["다른 형태 / 동일 형태 v","and get into / and getting into"], decide: "문장의 본동사와 and로 연결된 두 번째 동사는 같은 시제·형태로 맞춘다.", trap: "시제나 준동사 형태를 다르게 씀" },
  PARTICIPIAL_CLAUSE_PASSIVE: { freq: 22, books: 3, pairs: ["writing in english / written in english","p.p. / v-ing"], decide: "분사구문의 의미상 주어가 동작을 당하면 p.p.로 시작한다(Being 생략).", trap: "수동 관계인데 -ing를 쓰는 오류" },
  VOICE_SVOO_PASSIVE: { freq: 21, books: 5, pairs: ["gave / were given","offered / was offered","will be given / will give"], decide: "수여동사 문장은 간접목적어나 직접목적어를 주어로 하여 수동태를 만들 수 있다.", trap: "전치사 없이 간접목적어를 그대로 남김" },
  NONFINITE_MEMORY_COMPLEMENT: { freq: 21, books: 4, pairs: ["remember playing / remember to play","to v / v-ing"], decide: "remember/forget+to V는 '(앞으로) ~할 것을 기억/잊다', +V-ing는 '(과거에) ~한 것을 기억/잊다'는 뜻이다.", trap: "과거 경험을 말하면서 to V를 씀" },
  NOUN_CLAUSE_THAT: { freq: 21, books: 4, pairs: ["that / what","that+완전한 절 / 단순 명사구","of/what / that"], decide: "뒤에 주어+동사+목적어/보어가 모두 갖춰진 완전한 절이 오면 명사절 접속사 that을 쓴다.", trap: "of 뒤에 절을 그대로 연결" },
  THE_COMPARATIVE: { freq: 21, books: 5, pairs: ["the+비교급, the+비교급 / 일반 비교급","the+비교급 / 비교급 단독","the+비교급 / 비교급만"], decide: "'~할수록 더 …하다'는 the+비교급, the+비교급 구조로 쓴다.", trap: "최상급을 쓰는 오류" },
  AGREEMENT_THERE_BE: { freq: 21, books: 4, pairs: ["are / is","v-단수 / v-복수","has been / have been"], decide: "there be 뒤에 오는 진짜 주어의 수에 be동사를 일치시킨다.", trap: "there를 주어로 착각해 항상 단수로 처리" },
  ADJECTIVE_NOUN_MODIFIER: { freq: 21, books: 4, pairs: ["mechanical / mechanically","large / largely","부사 / 형용사"], decide: "명사를 앞에서 수식하는 자리에는 형용사를 쓰고 부사를 쓰지 않는다.", trap: "보어 자리에 부사를 씀" },
  AGREEMENT_CORRELATIVE: { freq: 20, books: 2, pairs: ["단수동사 / 복수동사","are / is","has / have"], decide: "both A and B는 복수, either/or·neither/nor·not only~but also는 B에 동사를 일치시킨다.", trap: "both를 단수로 착각" },
  CLEFT_IT_THAT: { freq: 20, books: 3, pairs: ["that / what"], decide: "강조하려는 말을 It is/was와 that 사이에 넣고, 사람이면 that 대신 who도 가능하다.", trap: "강조구문에 what을 쓰는 오류", avoid: "사람 강조 시 that과 who 둘 다 가능" },
  AGREEMENT_NUMBER_OF: { freq: 20, books: 5, pairs: ["are / is","a number of+복수동사 / the number of+단수동사"], decide: "the number of(~의 수)는 단수, a number of(많은 ~)는 복수 취급한다.", trap: "둘을 혼동해 반대로 수를 맞추는 오류" },
  AGREEMENT_INVERSION: { freq: 20, books: 2, pairs: ["v-단수 / v-복수","has / have","was / were"], decide: "부정어/only 도치나 장소부사구 도치로 동사가 주어 앞에 나와도, 동사는 도치된 뒤쪽 진짜 주어의 수에 맞춘다.", trap: "도치된 어순에서 문두 명사를 주어로 착각" },
  NOUN_CLAUSE_WH_WORD: { freq: 20, books: 2, pairs: ["what / which","that / what"], decide: "완전한 절을 이끌면 접속사 that, 불완전한 절(주어·목적어·보어가 빠짐)을 이끌며 '~하는 것'의 의미면 what을 쓴다.", trap: "what 자리에 which를 씀" },
  ABSOLUTE_PARTICIPLE: { freq: 19, books: 2, pairs: ["weather permitted / weather permitting"], decide: "분사구문의 의미상 주어가 주절 주어와 다르면 분사 앞에 그 주어를 남긴다.", trap: "의미상 주어를 생략해 버리는 오류(현수분사)" },
  COMPARISON_PARALLEL: { freq: 19, books: 3, pairs: ["that/those of / 명사 그대로","playing / to play","같은 품사/구조 / 다른 품사/구조"], decide: "than/as로 연결된 두 비교 대상은 같은 문법 형태여야 한다.", trap: "한쪽은 동명사, 한쪽은 원형을 씀" },
  DUMMY_IT_OBJECT: { freq: 19, books: 3, pairs: ["easy to / it easy to","essential that / it essential that"], decide: "find, make, think 등 5형식 동사의 목적어가 to부정사구이면 가목적어 it을 쓰고 진목적어는 문미로 보낸다.", trap: "가목적어 it을 생략하는 오류" },
  ONE_ONES: { freq: 19, books: 4, pairs: ["it / one","it / one/ones"], decide: "앞서 말한 것과 같은 종류의 다른 것을 가리키면 one을, 앞서 말한 바로 그것을 가리키면 it을 쓴다.", trap: "특정 대상을 가리키는데 one을 쓰는 오류" },
  NOUN_CLAUSE_WHETHER_IF: { freq: 18, books: 3, pairs: ["if / whether"], decide: "불확실한 사실을 나타낼 때는 that 대신 whether/if를 써서 완전한 절을 이끈다.", trap: "불확실한 내용에 that을 쓰는 오류", avoid: "단순 동사의 목적어 자리에서는 if와 whether 둘 다 가능" },
  APPOSITIVE_THAT: { freq: 18, books: 3, pairs: ["the reason that / the reason what","that / which/생략","명사+that+완전한 절 / 명사+which"], decide: "fact, news, idea 같은 추상명사 뒤에서 내용을 설명하는 완전한 절은 동격의 접속사 that으로 연결한다.", trap: "동격절에 which를 씀" },
  SUBSTITUTE_DO: { freq: 18, books: 2, pairs: ["am/is/are/was/were / do/does/did","did / was","does / is"], decide: "비교 구문에서 앞의 일반동사(구)를 반복하지 않으려면 do/does/did로 받고, be동사였다면 be동사로 받는다.", trap: "일반동사를 대신하는데 be동사를 씀" },
  SUPERLATIVE: { freq: 18, books: 3, pairs: ["the least painful / the less painful","원급/비교급 / 최상급","the+최상급 / 비교급/원급"], decide: "셋 이상을 비교해 하나를 정할 때는 the+최상급(-est/most)을 쓴다.", trap: "비교급 형태를 최상급 자리에 쓰는 오류" },
  INFINITIVE_PASSIVE: { freq: 17, books: 3, pairs: ["to be p.p. / to-v","to be mastered / to master","to be p.p. / to v"], decide: "to부정사의 의미상 주어가 동작을 당하면 to be p.p.로 쓴다.", trap: "수동 의미인데 능동 to-V를 그대로 씀" },
  RELATIVE_OBJECT: { freq: 17, books: 3, pairs: [], decide: "관계절 안에서 관계사가 동사나 전치사의 목적어 역할을 하면 목적격 관계대명사를 쓴다.", trap: "목적격 자리에 소유격 whose를 씀", avoid: "구어에서는 목적격 관계대명사 생략 가능" },
  LINKING_VERB_COMPLEMENT: { freq: 17, books: 3, pairs: ["부사 / 형용사"], decide: "become, remain, feel 등 연결동사는 뒤에 명사나 형용사를 보어로 취하고 부사를 쓰지 않는다.", trap: "보어 자리에 부사를 쓰는 오류" },
  INFINITIVE_LOGICAL_SUBJECT: { freq: 16, books: 2, pairs: ["for an amateur / of an amateur","for him / of him","for+목적격 / of+목적격"], decide: "사람의 성격을 나타내는 형용사(kind, wise, foolish 등) 뒤에는 of, 대부분의 형용사에는 for를 쓴다.", trap: "성격 형용사인데 for를 쓰는 오류" },
  GERUND_PASSIVE: { freq: 16, books: 3, pairs: ["being p.p. / v-ing","being offered / offering"], decide: "동명사의 의미상 주어가 동작을 당하면 being p.p.로 쓴다.", trap: "능동형 동명사를 그대로 사용" },
  RELATIVE_SUBJECT: { freq: 16, books: 3, pairs: ["who/which/that / 목적격/소유격","which / who","who/which+동사 / whom/which+명사"], decide: "선행사가 사람이면 who, 사물·동물이면 which를 쓴다.", trap: "주격 자리에 목적격이나 what을 씀" },
  RELATIVE_PREPOSITION_WHICH: { freq: 16, books: 3, pairs: ["which / 전치사+which","관계부사/생략 / 전치사+which"], decide: "관계절 안에서 관계사가 전치사의 목적어이면 '전치사+which/whom' 형태나 문미에 전치사를 남기는 형태로 쓴다.", trap: "전치사를 빠뜨리거나 중복으로 쓰는 오류", avoid: "전치사를 문미에 남기는 것도 허용됨" },
  MULTIPLICATIVE_COMPARISON: { freq: 16, books: 4, pairs: ["배수사+as+원급+as / 배수사+비교급+than","배수사+as~as / 배수사+비교급+than"], decide: "배수 표현은 '배수사+as+원급+as' 형태로 쓴다.", trap: "배수+비교급+as를 섞어 쓰는 오류", avoid: "times as~as와 times 비교급 than은 서로 바꿔 쓸 수 있음" },
  DUMMY_IT_SUBJECT: { freq: 16, books: 3, pairs: ["is thought that / is thought to","believes to / is believed to"], decide: "긴 to부정사구·that절 주어를 뒤로 보내고 그 자리에 가주어 it을 쓴다.", trap: "가주어 it을 빠뜨리고 진주어를 그대로 앞에 둠" },
  VOICE_SVOC_PASSIVE: { freq: 16, books: 4, pairs: ["considers / is considered","made / was made","made / were made"], decide: "5형식 문장을 수동태로 바꿀 때 목적격보어는 그대로 남는다.", trap: "목적격보어를 빠뜨림" },
  GERUND_SUBJECT: { freq: 15, books: 3, pairs: ["v-ing / 동사원형"], decide: "문장의 주어 자리에는 동사원형이 올 수 없고 동명사(V-ing)나 to부정사를 써야 한다.", trap: "원형 동사를 그대로 주어로 씀", avoid: "주어 자리에 동명사 대신 to부정사도 가능" },
  PARTICIPIAL_CLAUSE_PERFECT: { freq: 15, books: 3, pairs: ["having p.p. / v-ing"], decide: "분사구문이 나타내는 일이 주절보다 먼저 일어났으면 Having p.p.로 쓴다.", trap: "단순 V-ing로 시제 차이를 무시" },
  RELATIVE_POSSESSIVE: { freq: 15, books: 3, pairs: ["who/which / whose","who / whose"], decide: "선행사와 뒤 명사가 소유 관계이면 whose를 쓴다.", trap: "소유 관계인데 who를 쓰는 오류" },
  INVERSION_PLACE_DIRECTION: { freq: 15, books: 4, pairs: ["several coins were / were several coins","came the rain / the rain came","장소부사구+동사+주어 / 장소부사구+주어+동사"], decide: "장소를 나타내는 부사(구)가 문두에 오면 주어와 동사가 도치되나, 주어가 대명사면 도치하지 않는다.", trap: "대명사 주어인데도 도치함" },
  ONE_OF_SUPERLATIVE: { freq: 15, books: 3, pairs: ["one of the+비교급 / one of the+최상급+복수명사","단수명사 / 복수명사"], decide: "one of the + 최상급 뒤에는 반드시 복수명사를 쓴다.", trap: "뒤 명사를 단수로 쓰는 오류" },
  PREPOSITION_COLLOCATION: { freq: 15, books: 3, pairs: ["explained me / explained to me","discuss / discuss about","다른 전치사 / 지정된 전치사"], decide: "agree with/to, consist of/in, apply A to B 등 동사·형용사마다 정해진 전치사를 암기해서 맞춰 쓴다.", trap: "모든 수동태에 by를 쓰는 오류" },
  COUNTABLE_UNCOUNTABLE: { freq: 15, books: 2, pairs: ["many / much","a few / a little","few / little"], decide: "가산명사 복수형은 many/a few/few로, 불가산명사는 much/a little/little로 수식한다.", trap: "information, furniture 등 불가산명사에 many나 복수형을 쓰는 오류" },
  CORRELATIVE_NOT_ONLY_BUT_ALSO: { freq: 14, books: 3, pairs: ["다른 형태 / 동일 형태","병렬된 동일 형태 / 형태 불일치"], decide: "'A뿐 아니라 B도'는 not only A but also B로 쓰며 A, B는 같은 문법 형태여야 한다.", trap: "상관접속사 뒤 형태를 서로 다르게 씀" },
  PARTIAL_NEGATION: { freq: 14, books: 3, pairs: ["no/none/never / not all/every/always","always not true / not always true"], decide: "all/every/always/both 앞에 not을 붙이면 '전부/항상 ~한 것은 아니다'라는 부분 부정이 된다.", trap: "어순을 바꿔 always not처럼 쓰는 오류" },
  TOO_TO: { freq: 13, books: 2, pairs: ["so~that cannot / too~to v"], decide: "too+형용사/부사+to V는 '너무 ~해서 ~할 수 없다'는 뜻으로 so~that+주어+cannot으로 바꿀 수 있다.", trap: "enough to와 의미를 혼동" },
  NONFINITE_STOP_COMPLEMENT: { freq: 13, books: 4, pairs: ["stopped running / stopped to run"], decide: "stop V-ing는 '~하던 것을 멈추다', stop to V는 '~하기 위해 멈추다'로 뜻이 다르다.", trap: "의미 차이 없이 형태만 바꾸는 오류" },
  MODAL_PAST_INFERENCE: { freq: 12, books: 2, pairs: ["may have p.p. / must have p.p."], decide: "과거 사실에 대한 추측은 조동사+have p.p.로 쓰고, 지금 시점 추측은 조동사+동사원형을 쓴다.", trap: "확신 정도를 무시하고 have p.p. 형태만 맞으면 된다고 여기는 오류" },
  RELATIVE_ADVERB_WHY: { freq: 12, books: 4, pairs: ["the reason which / the reason why","that / why","when / why"], decide: "선행사가 reason(이유)이면 관계부사 why를 쓴다.", trap: "이유 선행사에 when을 쓰는 오류", avoid: "the reason that도 허용되는 경우가 있음" },
  RELATIVE_ADVERB_HOW: { freq: 12, books: 4, pairs: ["how / the way that"], decide: "the way와 how는 함께 쓸 수 없고 둘 중 하나만 쓴다.", trap: "the way how를 그대로 씀", avoid: "the way와 how 각각 단독 사용은 모두 가능" },
  INVERSION_ONLY: { freq: 12, books: 2, pairs: ["food has become / have food become"], decide: "Only+부사구/부사절이 문두에 오면 뒤따르는 주절이 도치된다.", trap: "Only 뒤 주절에서 도치를 하지 않음" },
  VOICE_NONFINITE_PASSIVE: { freq: 12, books: 2, pairs: ["to v / 원형"], decide: "지각동사 문장을 수동태로 바꾸면 목적격보어의 원형이 to부정사로 바뀐다.", trap: "수동태인데도 원형을 그대로 둠" },
  AS_IF_PAST: { freq: 12, books: 4, pairs: ["as if+과거 / as if+현재","과거형 / 현재형"], decide: "현재 사실과 다른 상황을 비유할 때 as if 뒤에 과거동사(were)를 쓴다.", trap: "as if 뒤에 현재형을 씀" },
  INFINITIVE_PERFECT: { freq: 11, books: 2, pairs: ["to have missed / to miss","to have p.p. / to v"], decide: "본동사보다 이전에 일어난 일을 to부정사로 나타낼 때 to have p.p.를 쓴다.", trap: "단순 to V로 시제를 동일하게 처리" },
  ENOUGH_TO: { freq: 11, books: 2, pairs: ["enough to v / so~that can"], decide: "enough는 형용사/부사 뒤에 위치하여 '~할 만큼 충분히 …한'이라는 뜻을 만든다.", trap: "enough를 형용사 앞에 놓는 어순 오류" },
  RELATIVE_ADVERB_WHEN: { freq: 11, books: 3, pairs: ["the day when / the day which","when / which/that","when / where"], decide: "선행사가 시간이면 when, 장소이면 where를 쓴다.", trap: "완전한 절 뒤에 which를 씀" },
  WITHOUT_IF_CONDITION: { freq: 11, books: 3, pairs: [], decide: "without, but for는 if절 없이도 '~이 없다면/없었다면'이라는 가정법의 의미를 만든다.", trap: "시제를 구분하지 않고 아무 형태나 씀", avoid: "Without과 But for는 서로 바꿔 쓸 수 있음" },
  AGREEMENT_DISTANCE: { freq: 11, books: 2, pairs: ["v-단수 / v-복수","단수동사 / 복수동사"], decide: "동사 바로 앞의 가까운 명사가 아니라 문장 앞부분의 진짜 주어(머리 명사)의 수에 동사를 맞춘다.", trap: "삽입어구 속 명사를 주어로 착각" },
  OBJECT_COMPLEMENT_BARE_V: { freq: 10, books: 3, pairs: ["to v / 원형부정사","to v / 원형","to v / 동사원형"], decide: "help는 원형과 to V 둘 다 가능하지만 make/let/사역·지각동사 계열은 원형을 쓴다.", trap: "to부정사를 목적격보어로 잘못 쓰는 오류", avoid: "help는 원형과 to V 모두 허용" },
  WISH_PAST: { freq: 10, books: 4, pairs: ["wish + 과거동사 / wish + 현재동사","wish+과거 / wish+현재","과거형 / 현재형"], decide: "현재 사실과 반대되는 소망은 wish+주어+과거동사로 쓴다.", trap: "현재시제를 그대로 쓰는 오류" },
  WISH_PAST_PERFECT: { freq: 10, books: 3, pairs: ["wish+had p.p. / wish+과거"], decide: "과거 사실과 반대되는 소망은 wish+주어+had p.p.로 쓴다.", trap: "단순과거로만 쓰는 오류" },
  AS_IF_PAST_PERFECT: { freq: 10, books: 4, pairs: ["as if+had p.p. / as if+과거","had p.p. / 과거"], decide: "실제보다 이전 사건과 다르게 비유할 때 as if 뒤에 had p.p.를 쓴다.", trap: "단순과거만 쓰는 오류" },
  TENSE_EXPLICIT_TIME_MARKER: { freq: 10, books: 2, pairs: ["과거시제 / 현재/현재완료시제","과거 / 현재완료"], decide: "yesterday, ago, last, in+과거연도 같은 명백한 과거 시점 부사가 있으면 반드시 과거시제를 쓴다.", trap: "ago와 현재완료를 함께 쓰는 오류" },
  INFINITIVE_NOUN_ROLE: { freq: 10, books: 2, pairs: ["to v / v-ing"], decide: "want, decide, hope, agree, promise, wish, expect, need 등은 목적어로 to부정사만 취한다.", trap: "동명사를 목적어로 잘못 쓰는 오류" },
  GERUND_PREPOSITION_OBJECT: { freq: 10, books: 2, pairs: ["by separating / by separation","v-ing / 동사원형"], decide: "전치사 뒤에는 동사원형이 올 수 없고 반드시 동명사를 쓴다.", trap: "to부정사처럼 착각해 동사원형을 쓰는 오류" },
  CONDITIONAL_MIXED: { freq: 9, books: 3, pairs: [], decide: "과거 조건이 현재까지 영향을 미치면 주절은 would+동사원형을 쓴다.", trap: "주절도 과거완료로 통일해버리는 오류" },
  OBJECT_COMPLEMENT_NOUN_ADJ: { freq: 9, books: 1, pairs: ["dependent / dependently","active / actively"], decide: "find, make, keep, leave, consider, think 등 뒤에서 목적어를 보충 설명하는 자리에는 부사가 아닌 형용사를 쓴다.", trap: "부사로 착각해 -ly형을 고름" },
  GERUND_PERFECT: { freq: 8, books: 2, pairs: ["having wasted / wasting","having p.p. / v-ing"], decide: "본동사보다 이전 시점의 일을 동명사로 나타낼 때 having p.p.를 쓴다.", trap: "단순 동명사로 시제 차이를 무시" },
  PARTICIPIAL_CLAUSE_WITH_CONJUNCTION: { freq: 8, books: 2, pairs: ["while fighting / while fought","접속사+v-ing / 접속사+원문 그대로"], decide: "의미를 분명히 하려고 when/while/if 등 접속사를 분사 앞에 남겨둘 수 있다.", trap: "능동인데 p.p.를 쓰는 오류" },
  PARTICIPLE_REDUCED_RELATIVE: { freq: 8, books: 3, pairs: ["p.p. / v-ing","관계대명사+be+분사 / 분사만","v-ing/p.p. / 관계사+be+분사"], decide: "관계대명사+be동사는 생략하고 분사만 남겨 명사를 뒤에서 수식할 수 있다.", trap: "동사 원형이나 시제형을 그대로 남겨두는 오류" },
  VERB_TRANSITIVE_INTRANSITIVE: { freq: 8, books: 1, pairs: [], decide: "occur, happen, seem, remain, appear, exist, result와 소유·상태 동사(have, resemble, cost, fit, suit, …", trap: "의미상 수동처럼 느껴져 be+p.p.로 잘못 쓰는 오류" },
  NONFINITE_TRY_COMPLEMENT: { freq: 8, books: 3, pairs: ["tried opening / tried to open"], decide: "try to V는 '~하려고 애쓰다', try V-ing는 '시험 삼아 ~해보다'라는 뜻이다.", trap: "의미와 상관없이 형태만 맞추는 오류" },
  INFINITIVE_ADVERB_ROLE: { freq: 8, books: 1, pairs: ["seems be / seems to be","what to wear / what wear"], decide: "seem to-v(~인 것 같다), be likely to-v(~할 것 같다), 의문사+to-v(~할지) 같은 부사적/명사적 to부정사 관용구의 형태를 정확히 갖춘다.", trap: "to를 빠뜨리고 동사원형만 쓰는 오류" },
  PARALLEL_NONFINITE: { freq: 8, books: 1, pairs: [], decide: "or, and로 연결된 to부정사(구)나 동명사(구)는 서로 같은 형태로 병렬되어야 한다.", trap: "하나는 to부정사, 하나는 동명사로 짝을 맞추지 않는 오류" },
  TENSE_SINCE_FOR: { freq: 7, books: 3, pairs: ["과거시제 / 현재완료","have p.p. / 과거"], decide: "since+과거시점이 있으면 현재까지 이어지는 완료(진행)형을 쓴다.", trap: "since가 있는데도 단순 과거·현재로 씀" },
  EMPHATIC_DO: { freq: 7, books: 3, pairs: ["do/does/did+동사원형 / 일반 동사","do/does/did+원형 / 일반 동사형"], decide: "동사를 강조할 때 do/does/did를 동사원형 앞에 추가한다.", trap: "do 뒤에 원형이 아닌 형태를 쓰는 오류" },
  ADVERB_CLAUSE_REASON: { freq: 7, books: 2, pairs: ["because / so that"], decide: "이유를 나타낼 때는 because, 목적/결과를 나타낼 때는 so that을 쓴다.", trap: "Giving that처럼 given의 형태를 잘못 씀", avoid: "문맥에 따라 since가 시간(~한 이후로)과 이유(~이므로) 둘 다로 해석 가능한 경우가 있어 출제 시 주의" },
  INVERSION_SO_NEITHER: { freq: 7, books: 2, pairs: ["so do / so does","neither do i / neither i do","nor/so+동사+주어 / nor/so+주어+동사"], decide: "Nor, So가 앞 문장에 대한 동의를 나타내며 문두에 오면 도치된다.", trap: "도치하지 않는 오류" },
  CONDITIONAL_INVERTED_HAD: { freq: 7, books: 2, pairs: ["had+주어+p.p. / if+주어+had+p.p."], decide: "가정법 과거완료에서 if를 생략하면 Had가 문두로 나가 주어와 도치된다.", trap: "if를 생략하고도 도치하지 않는 오류" },
  OBJECT_COMPLEMENT_VING: { freq: 7, books: 1, pairs: [], decide: "keep, find, leave, catch 등의 목적격보어로, 목적어가 동작을 스스로 계속하면 v-ing, 동작을 당하면 p.p.를 쓴다.", trap: "목적어가 동작을 당하는데도 v-ing를 씀" },
  VOICE_PHRASAL_VERB_PASSIVE: { freq: 6, books: 2, pairs: ["be looked after / look after","robbed of / was robbed of"], decide: "look after 같은 구동사는 하나의 타동사처럼 취급해 수동태에서도 분리하지 않는다.", trap: "구동사를 그대로 두고 be동사만 빠뜨림" },
  MODAL_REGRET_CRITICISM: { freq: 6, books: 2, pairs: ["should have p.p. / should v","should have said / should say"], decide: "과거에 하지 않은 일에 대한 후회·비난은 should have p.p.로 쓴다.", trap: "should+동사원형으로 현재의 의무처럼 잘못 쓰는 오류" },
  TENSE_PROGRESSIVE: { freq: 6, books: 2, pairs: ["v-ing 진행형 / 단순시제","are working / will be working"], decide: "가까운 미래에 예정된 일시적 동작은 현재진행이나 미래진행으로 표현하고 문맥의 시간 표지에 맞춘다.", trap: "단순현재/단순미래로만 표현하는 오류", avoid: "동작의 의미로 바뀌면 일부 상태동사(look, taste 등)도 진행형이 가능하다." },
  VOICE_PERFECT_PASSIVE: { freq: 6, books: 2, pairs: ["has been discussed / has discussed","has been p.p. / has p.p."], decide: "완료시제의 수동태는 have/has/had+been+p.p.로 쓴다.", trap: "been을 빠뜨리고 have+p.p.만 쓰는 오류" },
  EACH_ALL_BOTH: { freq: 6, books: 2, pairs: ["both / each","all / each/every"], decide: "each는 셋 이상 개별, both는 둘 다, all은 셋 이상 전체를 가리킬 때 쓴다.", trap: "둘을 가리키는데 each/all을 쓰는 오류" },
  DOUBLE_NEGATION: { freq: 6, books: 2, pairs: [], decide: "hardly, rarely, seldom, no one 등은 그 자체로 부정의 뜻을 가지므로 not과 함께 쓰지 않는다.", trap: "준부정어에 not을 겹쳐 쓰는 오류" },
  VOICE_BE_MADE_TO: { freq: 5, books: 1, pairs: ["to v / 원형"], decide: "make/have 사역문을 수동태로 바꾸면 목적격보어의 원형부정사가 to부정사로 바뀐다(be made to V).", trap: "수동태인데도 원형을 그대로 씀" },
  ADVERB_CLAUSE_CONCESSION: { freq: 5, books: 2, pairs: ["although/though / since/because"], decide: "문맥이 '비록 ~이지만'이면 양보 접속사를, '~때문에'면 이유 접속사를 쓴다.", trap: "의미상 양보인데 이유 접속사를 씀" },
  ADVERB_CLAUSE_TIME: { freq: 5, books: 1, pairs: ["when/while/as/since / 기타 의미"], decide: "문맥상 동시(while/as), 계기(when), 기점(since) 중 알맞은 시간 접속사를 고른다.", trap: "의미가 비슷한 시간 접속사끼리 혼동" },
  ELLIPSIS_COMMON_ELEMENT: { freq: 5, books: 1, pairs: ["반복 표기 / 생략"], decide: "부사절의 주어가 주절과 같고 동사가 be동사면 '주어+be'를 생략할 수 있다.", trap: "생략된 주어를 복원하지 못하거나 다른 주어로 착각" },
  SO_SUCH: { freq: 5, books: 1, pairs: [], decide: "such+ (a/an)+형용사+명사, so+형용사+(a/an)+명사의 어순 차이를 구분한다.", trap: "so 뒤에 관사를 형용사 뒤로 잘못 배치" },
  RELATIVE_PREPOSITION_WHOM: { freq: 5, books: 1, pairs: [], decide: "전치사 바로 뒤에는 목적격 관계대명사 whom을 쓰고 who나 that은 쓸 수 없다.", trap: "전치사 뒤에 who나 that을 쓰는 오류" },
  RELATIVE_OMISSION: { freq: 5, books: 1, pairs: [], decide: "목적격 관계대명사는 생략할 수 있지만, 전치사 바로 뒤에 있거나 계속적 용법이면 생략할 수 없다.", trap: "전치사 뒤 관계대명사까지 생략하는 오류" },
  PARTICIPIAL_CLAUSE_NEGATIVE: { freq: 4, books: 1, pairs: ["not/never+v-ing / v-ing+not/never"], decide: "분사구문을 부정할 때 not/never는 분사 바로 앞에 위치한다.", trap: "Knowing not처럼 부정어를 분사 뒤에 둠" },
  POSSESSIVE: { freq: 4, books: 1, pairs: [], decide: "'명사+'s'나 소유격을 대신하는 자리에는 소유대명사(mine, yours 등)를 쓰고, 단순 대상을 가리킬 때는 목적격을 쓴다.", trap: "소유격과 목적격 형태를 혼동" },
  VOICE_PROGRESSIVE_PASSIVE: { freq: 4, books: 2, pairs: ["has been p.p. / is being p.p.","is being p.p. / is p.p."], decide: "지금 진행 중인 수동 동작은 be being p.p.로 쓴다.", trap: "단순 수동태와 혼동하는 오류" },
  INFINITIVE_OBJECT_COMPLEMENT: { freq: 4, books: 1, pairs: ["to v / v-ing"], decide: "advise, allow, force, tell, enable, ask, cause 등은 목적격보어로 to부정사를 취한다.", trap: "원형부정사나 동명사를 목적격보어로 쓰는 오류" },
  PARTICIPLE_OBJECT_COMPLEMENT: { freq: 4, books: 2, pairs: ["p.p. / v-ing"], decide: "목적어와 분사가 능동관계면 -ing, 수동관계면 p.p.를 목적격보어로 쓴다.", trap: "의미 관계를 무시하고 형태만 맞추는 오류" },
  THERE_BE_STRUCTURE: { freq: 4, books: 1, pairs: ["there+동사+주어 / there+주어+동사"], decide: "there는 유도부사로 뒤에 동사가 먼저 오고 실제 주어가 뒤따른다.", trap: "there 뒤에 주어를 먼저 쓰는 오류" },
  CONDITIONAL_INVERTED_WERE: { freq: 4, books: 1, pairs: [], decide: "가정법 과거에서 if를 생략하면 Were+주어로 도치한다.", trap: "도치하지 않고 If가 없는 평서 어순을 쓰는 오류" },
  CONDITIONAL_INVERTED_SHOULD: { freq: 4, books: 1, pairs: [], decide: "미래에 대한 불확실한 가정에서 if를 생략하면 Should+주어+동사원형으로 도치한다.", trap: "도치하지 않는 오류" },
  SO_AS_TO: { freq: 3, books: 1, pairs: [], decide: "'~하기 위해'는 so as to 또는 in order to로 쓰며 as so to 같은 어순 오류에 주의한다.", trap: "so와 as의 순서를 바꿔 씀" },
  CORRELATIVE_BOTH_AND: { freq: 3, books: 2, pairs: [], decide: "both A and B는 항상 복수 취급하며 A, B는 같은 품사여야 한다.", trap: "both를 다른 위치에 넣어 A/B 병렬이 깨지는 오류" },
  CAUSATIVE_PASSIVE: { freq: 3, books: 1, pairs: [], decide: "사역동사 make를 수동태로 바꾸면 원형부정사였던 목적격보어 앞에 to를 반드시 붙인다.", trap: "수동태에서도 to 없이 원형을 그대로 씀" },
  PARALLEL_ADJECTIVES: { freq: 3, books: 1, pairs: ["명사/동사 / 형용사"], decide: "and로 연결된 두 보어가 형용사면 뒤에도 형용사 형태로 통일한다.", trap: "형용사 자리에 명사나 동사원형을 씀" },
  GERUND_COMPLEMENT: { freq: 3, books: 1, pairs: [], decide: "주어가 취미·습관처럼 반복적인 일을 나타내면 보어로 동명사를, 앞으로의 목표·계획을 나타내면 to부정사를 쓰는 경향이 있다.", trap: "의미 차이를 무시하고 아무 형태나 씀", avoid: "주어 보어 자리에서 의미 차이가 크지 않으면 둘 다 자연스러운 경우도 있음" },
  RELATIVE_WHO_WHOM: { freq: 3, books: 1, pairs: ["who / whom"], decide: "관계절 안에서 주어 역할이면 who, 목적어(동사/전치사) 역할이면 whom을 쓴다.", trap: "목적어 자리에 who를 쓰거나 주어 자리에 whom을 쓰는 오류" },
  ADVERB_ADJECTIVE_MODIFIER: { freq: 3, books: 1, pairs: ["부사 / 형용사"], decide: "sound, feel, look, seem 같은 연결동사 뒤에는 주격보어로 형용사를 쓴다.", trap: "연결동사 뒤에 부사를 쓰는 오류" },
  OBJECT_COMPLEMENT_PP: { freq: 3, books: 1, pairs: ["p.p. / v-ing"], decide: "목적어와 목적격보어가 수동 관계(목적어가 당하는 입장)이면 과거분사를 쓴다.", trap: "능동 관계로 착각해 V-ing를 쓰는 오류" },
  REPEATED_THAT: { freq: 3, books: 1, pairs: [], decide: "두 개의 명사절 that이 and로 연결될 때 두 번째 that도 생략하지 않고 반복해 쓴다.", trap: "두 번째 that을 생략하는 오류" },
  CONDITIONAL_IF_WERE_TO: { freq: 3, books: 1, pairs: [], decide: "실현 가능성이 거의 없는 미래의 일을 가정할 때 if+주어+were to+동사원형을 쓴다.", trap: "단순 미래 조건문과 혼동" },
  CONDITIONAL_IF_SHOULD: { freq: 3, books: 1, pairs: [], decide: "실현 가능성이 낮은 미래의 일을 가정할 때 if+주어+should+동사원형을 쓴다.", trap: "단순 조건문과 혼동" },
  HAD_BETTER: { freq: 2, books: 1, pairs: [], decide: "had better 뒤에는 동사원형이 오며, have better나 to V는 틀린 형태다.", trap: "had better to V로 to를 붙임" },
  INFINITIVE_ADJECTIVE_ROLE: { freq: 2, books: 1, pairs: ["to v / v-ing"], decide: "명사를 뒤에서 수식하며 '~할'의 의미를 더할 때는 to부정사를 쓴다.", trap: "동명사와 형태를 혼동" },
  CORRELATIVE_EITHER_OR: { freq: 2, books: 1, pairs: [], decide: "'A거나 B거나'는 either A or B로 쓰고 and로 바꿔 쓸 수 없다.", trap: "either A and B처럼 or 대신 and를 씀" },
  CORRELATIVE_NEITHER_NOR: { freq: 2, books: 1, pairs: [], decide: "'A도 B도 아니다'는 neither A nor B로 쓰고 동사 수는 B에 맞춘다.", trap: "동사 수를 A에 맞춤" },
  PRONOUN_SUBJECT_OBJECT_CASE: { freq: 2, books: 1, pairs: ["목적격 / 소유격"], decide: "명사 앞에서 '~의'라는 소유의 의미면 소유격, 동사/전치사의 대상이면 목적격을 쓴다.", trap: "소유격 자리에 목적격을 쓰는 오류" },
  DUMMY_REFERENTIAL_IT: { freq: 2, books: 1, pairs: ["it / one"], decide: "앞서 언급한 특정 대상을 다시 가리킬 때는 it, 같은 종류의 불특정 대상은 one을 쓴다.", trap: "막연한 대상에 it을 쓰는 오류" },
  NEGATION_SCOPE: { freq: 2, books: 1, pairs: ["no / not...any"], decide: "no+명사는 그 자체로 완전 부정이며, not이 이미 있는 문장에 no를 또 쓰면 이중부정이 되므로 not...any로 바꾼다.", trap: "is no any school처럼 no와 any를 함께 쓰는 오류" },
  IT_IS_TIME_SUBJUNCTIVE: { freq: 2, books: 1, pairs: [], decide: "'~할 시간이다'라는 재촉의 의미로 it is time 뒤에는 과거시제를 쓴다.", trap: "현재시제를 그대로 쓰는 오류" },
  TENSE_REPORTED_SPEECH: { freq: 1, books: 1, pairs: ["might have p.p. / might v"], decide: "화법 전환 시 원래 발화 시점보다 더 이전 사건이면 조동사+have p.p.로 시제를 한 단계 물린다.", trap: "단순히 might만 남기고 have p.p.를 빠뜨림" },
  PARALLEL_SHARED_TO: { freq: 1, books: 1, pairs: [], decide: "등위접속사로 연결된 두 to부정사 중 두 번째 to는 생략할 수 있으며 형태는 동일하게 유지한다.", trap: "두 번째 동사를 동명사로 바꿔 형태를 깨뜨림" },
  ADVERB_CLAUSE_RESULT: { freq: 1, books: 1, pairs: ["as / so~that"], decide: "'너무 ~해서 ~하다'는 so+형용사/부사+that 절로 쓴다.", trap: "that 대신 as를 씀" },
  WISH_WOULD: { freq: 1, books: 1, pairs: ["will / would"], decide: "이루어지길 바라는 미래의 일은 wish 뒤에 would+동사원형을 쓴다.", trap: "wish 뒤에 will을 쓰는 오류" },
  PARTICIPLE_SUBJECT_COMPLEMENT: { freq: 1, books: 1, pairs: [], decide: "remain, seem 같은 연결동사는 뒤에 분사나 형용사를 주격보어로 취한다.", trap: "연결동사를 완전자동사처럼 써서 보어를 생략하는 오류" },
};

/** 교재가 이 포인트를 묻는 빈도(없으면 0). */
export function textbookFrequency(code: string): number {
  return TEXTBOOK_RULES[code]?.freq ?? 0;
}

/** 분석 프롬프트에 싣는 한 줄 카드. 호출마다 같아 프롬프트 캐시가 붙는다. */
export function textbookRulesText(): string {
  return Object.entries(TEXTBOOK_RULES)
    .map(([code, r]) => {
      const parts = [`${code}: [${r.pairs.join("] [")}] ${r.decide}`];
      if (r.trap) parts.push(`오답:${r.trap}`);
      if (r.avoid) parts.push(`출제금지:${r.avoid}`);
      return parts.join(" | ");
    })
    .join("\n");
}

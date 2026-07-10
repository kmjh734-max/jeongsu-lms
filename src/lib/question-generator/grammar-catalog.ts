/**
 * 어법 출제 — 교재 유닛×CASE 뱅크 + 문항마다 다른 포커스 샘플링
 *
 * 어법끝(개정) START PART I UNIT 01–10 (Point 01–23)
 * 처음 만나는 수능 어법 스타터 UNIT 01–13
 *
 * 원칙: 단원 나열이 아니라 CASE별 ‘네모 형태·심는 법’이 달라야 함.
 * 금지: 인접 단순 수일치(such things change/changes), 같은 is/are 패턴 반복.
 */

export const GRAMMAR_TEXTBOOK_TITLES = [
  "어법끝(개정) START",
  "처음 만나는 수능 어법 스타터(입문)",
] as const;

export const GRAMMAR_HARD_BANS = [
  "주어·동사 인접 단순 수일치 (such things change/changes, people like/likes)",
  "틀린 밑줄 2개 이상이 전부 is/are·has/have 같은 동일 형태 쌍",
  "수일치만 연속 출제 (한 문항에 S-V 함정 최대 1개)",
  "철자·난센스 단어·어휘 의미만 틀린 함정",
] as const;

export type GrammarCase = {
  id: string;
  /** 어법끝 Point (없으면 null) */
  point: number | null;
  name: string;
  /** 네모에 나오는 형태 쌍 — 다양성 판별용 */
  pairForms: string;
  mechanism: string;
  /** 지문에 어떻게 심는지 */
  plant: string;
  example: string;
};

export type GrammarUnitBank = {
  key: string;
  eobeopUnit: number | null;
  cheoeumUnit: number | null;
  title: string;
  cases: GrammarCase[];
};

/** 유닛 하나씩 — CASE가 곧 출제 패턴 */
export const GRAMMAR_UNIT_BANKS: GrammarUnitBank[] = [
  {
    key: "sv",
    eobeopUnit: 1,
    cheoeumUnit: 1,
    title: "주어·동사 수일치",
    cases: [
      {
        id: "sv-prep",
        point: 1,
        name: "주어+(전명구)+동사",
        pairForms: "is/are·has/have·was/were",
        mechanism: "수식어 끝 명사 수 ≠ 주어 → 그 명사에 동사 맞춤이 오답",
        plant: "핵심 주어와 동사 사이에 of/in/by/about + 복수(또는 단수) 명사 끼우기",
        example: "The main purpose of food labels … are(×)/is / studies of big business have/has",
      },
      {
        id: "sv-ving-tov",
        point: 1,
        name: "주어+(v-ing/to-v)+동사",
        pairForms: "is/are·make/makes",
        mechanism: "분사·부정사구 속 명사로 유인",
        plant: "주어 뒤 showing/to show … + 복수명사 + 단수동사(또는 반대)",
        example: "The museum showing many paintings are(×)/is / One way to show respect … are(×)/is",
      },
      {
        id: "sv-pp",
        point: 1,
        name: "주어+(p.p.)+동사",
        pairForms: "is/are·belongs/belong",
        mechanism: "과거분사구 속 명사 유인. p.p.를 정동사로 착각하지 말 것(정답 쪽)",
        plant: "Products made from milk is(×)/are / pipes used to transport oil is(×)/are",
        example: "Gold coins found in this area belongs(×)/belong",
      },
      {
        id: "sv-rel-mod",
        point: 1,
        name: "주어+[관계사절/형용사구]+동사",
        pairForms: "is/are·improve/improves",
        mechanism: "관계절·후치 형용사구 끝 명사 유인",
        plant: "clothes that have … is(×)/are / A film full of violent scenes are(×)/is",
        example: "company which specializes in … services are(×)/is located",
      },
      {
        id: "sv-insert",
        point: 1,
        name: "주어+삽입(동격/관계/분사)+동사",
        pairForms: "has/have·is/are",
        mechanism: "콤마 삽입어 속 명사를 주어로 혼동",
        plant: "A cell, the smallest unit …, have(×)/has",
        example: "This relationship, a partnership between the countries, have(×)/has",
      },
      {
        id: "sv-rel-ante",
        point: 2,
        name: "관계절 동사 수=선행사 (직전 명사 함정)",
        pairForms: "was/were·is/are·interest/interests",
        mechanism: "선행사+수식어+관계사일 때 수식어 끝 명사 ≠ 선행사",
        plant: "food on those shelves which have(×)/has odor / photos that was(×)/were deleted",
        example: "anything to read that interest(×)/interests them",
      },
      {
        id: "sv-invert",
        point: 3,
        name: "부사·부정어 도치 — 동사 뒤 주어",
        pairForms: "was/were·is/are·does/do",
        mechanism: "앞에 나온 명사 말고 동사 뒤 주어에 일치",
        plant: "In the back seat … was/were two boys / No longer is/are cars … / Little does/do …",
        example: "Only then is(×)/are the messages removed",
      },
      {
        id: "sv-there",
        point: 3,
        name: "There + V + 실제 주어",
        pairForms: "is/are·has/have",
        mechanism: "there 뒤 동사는 뒤 주어 수",
        plant: "There has/have been some increases / There is/are mice",
        example: "There is(×)/are two emergency exits",
      },
      {
        id: "sv-form",
        point: 4,
        name: "동명사·절·each/every·부분표현 of",
        pairForms: "mean/means·is/are·has/have",
        mechanism: "비명사 주어 단수 + 근처 복수 유인; of 뒤 명사에 일치하는 부분표현",
        plant: "Accepting … problems mean(×)/means / Whether … exists is/are / majority of clients is/are",
        example: "Each of the countries have(×)/has / The young is(×)/are",
      },
    ],
  },
  {
    key: "noun",
    eobeopUnit: 2,
    cheoeumUnit: 10,
    title: "명사·대명사",
    cases: [
      {
        id: "noun-pron-num",
        point: 5,
        name: "대명사 수일치 (단수·복수 명사 혼재)",
        pairForms: "it/them·its/their",
        mechanism: "지시 후보 명사 2개(수 다름) — 잘못된 선행사에 맞춤",
        plant: "단수 총칭 주어 + 복수 세부 명사 근처에서 them/their 오류",
        example: "Plastic … allows it/them to travel / … products … it(×)/them",
      },
      {
        id: "noun-poss-refl",
        point: 5,
        name: "소유대명사·재귀대명사",
        pairForms: "his/himself·mine/my·him/himself",
        mechanism: "목적어=주어 → 재귀; 소유대명사 vs 소유격",
        plant: "dried him(×)/himself / Can I use your(×)/yours?",
        example: "I do mind him/his talking",
      },
      {
        id: "noun-count",
        point: 6,
        name: "가산/불가산 수식어",
        pairForms: "many/much·few/little·a/—",
        mechanism: "information/advice/equipment + many/a; 가산 + much",
        plant: "many informations(×) / much ideas(×) / an advice(×)",
        example: "a few equipment(×) / little books(×)",
      },
    ],
  },
  {
    key: "tense",
    eobeopUnit: 3,
    cheoeumUnit: 2,
    title: "동사 시제",
    cases: [
      {
        id: "tense-adv",
        point: 7,
        name: "단순과거 vs 현재완료 — 부사",
        pairForms: "died/has died·experienced/have experienced",
        mechanism: "in+연도/ago/yesterday→과거; since/for/already→현재완료",
        plant: "부사(구)와 충돌하는 시제 형태를 밑줄",
        example: "He has died(×)/died in 1933 / Since 2000, … experienced(×)/have experienced",
      },
      {
        id: "tense-clause",
        point: 8,
        name: "시간·조건 부사절 — will 금지",
        pairForms: "will be/are·will arrive/arrives",
        mechanism: "when/if/unless/until 절 안 미래 대신 현재",
        plant: "If you will be(×)/are careful / When he will arrive(×)/arrives",
        example: "unless it will rain(×)/rains",
      },
      {
        id: "tense-past-perf",
        point: null,
        name: "과거완료 — 기준 과거보다 앞선 일",
        pairForms: "misspelled/had misspelled·was/had been",
        mechanism: "과거 시점 이전에 완료된 동작에 단순과거 사용 오류",
        plant: "When he learned that he misspelled(×)/had misspelled …",
        example: "bones was preserved(×)/had been preserved (문맥상 과거완료·완료수동)",
      },
    ],
  },
  {
    key: "modal",
    eobeopUnit: 4,
    cheoeumUnit: 3,
    title: "조동사·법",
    cases: [
      {
        id: "modal-perf",
        point: 9,
        name: "조동사+원형 vs +have p.p.",
        pairForms: "must feel/must have felt·may be/may have been",
        mechanism: "과거 추측·후회는 have p.p.",
        plant: "과거 사건 서술 중 must feel(×)/have felt",
        example: "may even be(×)/have been a composer then",
      },
      {
        id: "modal-should-that",
        point: 10,
        name: "주장·요구·제안 that+(should+)원형",
        pairForms: "join/joined·ask/asks",
        mechanism: "request/suggest/insist that절에 과거·3인칭 -s",
        plant: "requested that she joined(×)/join / suggested that a newcomer asks(×)/ask",
        example: "insisted that we went(×)/go",
      },
      {
        id: "modal-habit",
        point: null,
        name: "과거 습관 used to / would",
        pairForms: "used to eat/eating·would/could",
        mechanism: "used to + 원형; be used to + v-ing와 구분(태 유닛과 연계 가능)",
        plant: "people used to eating(×)/eat more when…",
        example: "we would/could go nowhere (문맥 습관)",
      },
    ],
  },
  {
    key: "subjunctive",
    eobeopUnit: 4,
    cheoeumUnit: 4,
    title: "가정법",
    cases: [
      {
        id: "subj-past",
        point: 10,
        name: "가정법 과거 vs 과거완료 짝",
        pairForms: "would get/would have gotten·lived/live",
        mechanism: "현재 반대=과거+would; 과거 반대=had p.p.+would have",
        plant: "If he wrote… he would have gotten(×)/would get (시제 짝 깨기) 또는 반대",
        example: "If the check have(×)/had been enclosed, would they have responded…",
      },
      {
        id: "subj-wish-asif",
        point: null,
        name: "I wish / as if 가정법",
        pairForms: "will/would·do/did",
        mechanism: "wish/as if 뒤 가정 시제",
        plant: "I wish the drought will(×)/would end / as if competitors do(×)/did not exist",
        example: "wish … will(×)/would",
      },
    ],
  },
  {
    key: "voice",
    eobeopUnit: 5,
    cheoeumUnit: 5,
    title: "능동·수동 태",
    cases: [
      {
        id: "voice-basic",
        point: 11,
        name: "능동 vs 수동 (시제별 형태)",
        pairForms: "pick/are picked·has discussed/has been discussed·making/being made",
        mechanism: "주어가 행위자인지 대상인지. 진행·완료 수동 형태",
        plant: "Coffee beans pick(×)/are picked / concept has discussed(×)/has been discussed",
        example: "oceans are polluting(×)/being polluted / films have produced(×)/been produced",
      },
      {
        id: "voice-no-pass",
        point: 11,
        name: "수동 불가·유사수동 동사",
        pairForms: "occur/are occurred·consists/is consisted·appeared/was appeared",
        mechanism: "happen/occur/exist/consist of → 능동 유지. seem/appear 수동 혼동",
        plant: "accidents are occurred(×)/occur / Indonesia is consisted(×)/consists of",
        example: "photo was appeared(×)/appeared / Life is existed(×)/exists",
      },
      {
        id: "voice-rel",
        point: 11,
        name: "관계절 능동 vs 수동",
        pairForms: "kept/was kept·has changed/has been changed·seen/been seen",
        mechanism: "선행사와 관계절 동사의 능동/수동 관계",
        plant: "95% of which has never seen(×)/been seen / content of which kept(×)/was kept",
        example: "invention that has changed/been changed the world (문맥)",
      },
      {
        id: "voice-used-to",
        point: 11,
        name: "be used to-v vs be used to v-ing",
        pairForms: "to attract/attracting·to living/live",
        mechanism: "be used to + 명사/v-ing(익숙) vs be used to-v(목적·수단)",
        plant: "Feathers may be used to attracting(×)/attract / Sherpas are used to live(×)/living",
        example: "grapes can be used to making(×)/make wine",
      },
      {
        id: "voice-verbal",
        point: 12,
        name: "to부정사·동명사 태",
        pairForms: "to see/to be seen·leaving/being left·to receive/receiving",
        mechanism: "의미상 주어가 받으면 to be p.p. / being p.p.",
        plant: "want the letter to send(×)/to be sent / avoid being/to be injured",
        example: "imagine … injuring/injured a lot of people (의미상 주어)",
      },
    ],
  },
  {
    key: "participle",
    eobeopUnit: 6,
    cheoeumUnit: 7,
    title: "분사·분사구문",
    cases: [
      {
        id: "part-mod",
        point: 13,
        name: "수식 분사 능동(v-ing) vs 수동(p.p.)",
        pairForms: "filling/filled·walking/walked·needing/needed",
        mechanism: "피수식 명사와의 능동/수동",
        plant: "sandwich filling(×)/filled with tuna / girl walking/walked up the street",
        example: "space needing/needed to heal",
      },
      {
        id: "part-abs",
        point: 14,
        name: "분사구문 · with+명사+분사",
        pairForms: "Looking/Looked·Surprising/Surprised",
        mechanism: "주절 주어와 능동/수동",
        plant: "Looking/Looked into those eyes, I… / Surprising(×)/Surprised by the news, he…",
        example: "with the door opening/opened (문맥)",
      },
      {
        id: "part-emotion",
        point: 15,
        name: "감정동사 -ing vs -ed",
        pairForms: "tiring/tired·relaxing/relaxed·amazing/amazed",
        mechanism: "원인(사물)-ing / 경험자(사람)-ed",
        plant: "I am tiring(×)/tired / Still amazing(×)/amazed by his success, he…",
        example: "The music was very relaxed(×)/relaxing",
      },
    ],
  },
  {
    key: "verbal",
    eobeopUnit: 7,
    cheoeumUnit: 6,
    title: "동사와 준동사",
    cases: [
      {
        id: "verb-slot",
        point: 16,
        name: "정동사 자리 vs 준동사 자리",
        pairForms: "Keep/Keeping·demanded/demanding·is bring/to bring",
        mechanism: "접속사 없이 동사 2개 불가; 주어 자리 v-ing; 목적 to-V",
        plant: "Keep(×)/Keeping the lens covered … is recommended / purpose is bring(×)/to bring",
        example: "customer … demanded/demanding a refund (이미 관계절 동사 있음)",
      },
      {
        id: "verb-do-be",
        point: 16,
        name: "대동사 do vs be",
        pairForms: "do/are·did/was",
        mechanism: "앞 동사가 일반동사면 do, be동사면 be",
        plant: "spend more time … than they are(×)/do / she did/was (fall asleep)",
        example: "others do/are not (are in favor …)",
      },
      {
        id: "verb-obj",
        point: 17,
        name: "목적어 to-V / V-ing (동사별·의미차)",
        pairForms: "to apologize/apologizing·to travel/traveling·to brush/brushing",
        mechanism: "refuse/learn/need→to-V; enjoy/avoid→V-ing; remember/forget/stop/try 의미",
        plant: "refuse apologizing(×)/to apologize / enjoy to travel(×)/traveling / Remember brushing(×)/to brush",
        example: "regret to say/saying / tried to taste/tasting",
      },
      {
        id: "verb-it-obj",
        point: 17,
        name: "가목적어 it + 진목적어",
        pairForms: "make it to-V / make to-V",
        mechanism: "make/find/think it + adj + to-V",
        plant: "make possible to… → make it possible to… 형태 깨기",
        example: "find it difficult to / *find difficult to (×)",
      },
      {
        id: "verb-oc",
        point: 18,
        name: "목적격보어 원형/to-V/p.p.",
        pairForms: "kick/to kick·be/to be·examine/examined",
        mechanism: "사역·지각+원형; allow/tell+to-V; 목적어가 받으면 p.p.",
        plant: "saw me to kick(×)/kick / told students be(×)/to be ready / have teeth examine(×)/examined",
        example: "get the work finish(×)/finished / women to look/looking/look at",
      },
    ],
  },
  {
    key: "parallel",
    eobeopUnit: 8,
    cheoeumUnit: 9,
    title: "병렬구조",
    cases: [
      {
        id: "par-and",
        point: 19,
        name: "and/or/but 병렬",
        pairForms: "rescues/rescuing·find/found·sailing/to sail",
        mechanism: "등위접속사 앞뒤 형태 대등",
        plant: "defeats … and then rescuing(×)/rescues / buying … and to sail(×)/sailing",
        example: "train officers or building(×)/build housing",
      },
      {
        id: "par-correl",
        point: 19,
        name: "not only A but also B / both A and B",
        pairForms: "reduces/reducing·carry/to carry",
        mechanism: "상관접속사 A·B 형태 일치",
        plant: "not only improves … but also reducing(×)/reduces / both confusing and cost(×)/costly",
        example: "not only taste good but also to carry(×)/carry",
      },
    ],
  },
  {
    key: "compare",
    eobeopUnit: 8,
    cheoeumUnit: 12,
    title: "비교구문",
    cases: [
      {
        id: "cmp-form",
        point: 20,
        name: "원급·비교급·최상급 형태",
        pairForms: "greater/great·faster/fastest·as difficult as/than·more/most",
        mechanism: "as…as / -er than / the -est. as … than(×)",
        plant: "desire … should be great(×)/greater than / not as difficult as/than(×) learning",
        example: "the more(×)/most amazing city / as free/freely as possible",
      },
      {
        id: "cmp-parallel",
        point: 20,
        name: "비교 대상 병렬",
        pairForms: "getting/to get·that of / those of",
        mechanism: "A than B에서 B 형태·대명사 일치",
        plant: "more important than to get(×)/getting married / taller than me/I (문맥)",
        example: "better than that of / *better than of (×)",
      },
      {
        id: "cmp-very",
        point: null,
        name: "비교급 강조 — very 불가",
        pairForms: "very/much·very/far",
        mechanism: "much/even/far/still + 비교급. very+비교급(×)",
        plant: "very better(×)/much better",
        example: "very more important(×)/far more important",
      },
    ],
  },
  {
    key: "adjadv",
    eobeopUnit: 9,
    cheoeumUnit: 11,
    title: "형용사·부사",
    cases: [
      {
        id: "adj-slot",
        point: 21,
        name: "형용사 vs 부사 자리",
        pairForms: "official/officially·easy/easily·powerful/powerfully",
        mechanism: "명수식=형; 동·형 수식=부. 목적격보어 자리 주의",
        plant: "are official(×)/officially recognized / makes a child easy/easily distracted",
        example: "are powerful/powerfully influences (명수식→형용사)",
      },
      {
        id: "adj-ly-meaning",
        point: 21,
        name: "hard/hardly·high/highly·late/lately",
        pairForms: "high/highly·hard/hardly·late/lately",
        mechanism: "-ly 붙이면 뜻 달라지는 쌍",
        plant: "flying high/highly(×) / hard/hardly ever remember / late/lately",
        example: "experiment is high(×)/highly educational",
      },
      {
        id: "adj-complement",
        point: 21,
        name: "보어 형용사 취하는 동사",
        pairForms: "calm/calmly·gray/grayly",
        mechanism: "remain/become/seem/make + 형용사 보어",
        plant: "stay calm/calmly(×) / grows gray / makes me crazy",
        example: "looks happy/happily(×)",
      },
    ],
  },
  {
    key: "prepconj",
    eobeopUnit: 9,
    cheoeumUnit: 9,
    title: "전치사·접속사",
    cases: [
      {
        id: "pc-pair",
        point: 22,
        name: "during/while·despite/although·because of/because",
        pairForms: "During/While·despite/though·Because/Because of",
        mechanism: "전치사+명사구 vs 접속사+S+V",
        plant: "During/While the past summer… / despite/though he was… / Because/Because of the rain…",
        example: "while he played / during the vacation",
      },
      {
        id: "pc-to-ving",
        point: 22,
        name: "전치사 to + v-ing",
        pairForms: "to meet/meeting·to live/living",
        mechanism: "look forward to / be used to / object to + v-ing",
        plant: "look forward to meet(×)/meeting",
        example: "object to be(×)/being treated",
      },
      {
        id: "pc-like",
        point: 22,
        name: "like vs alike",
        pairForms: "like/alike",
        mechanism: "like 전치사/접속사; alike 형·부 (보어)",
        plant: "Just like/alike people, no two places… / They look like/alike",
        example: "alike people(×) at the start of sentence needing like",
      },
    ],
  },
  {
    key: "relative",
    eobeopUnit: 10,
    cheoeumUnit: 8,
    title: "관계사·that/what",
    cases: [
      {
        id: "rel-that-what",
        point: 23,
        name: "that vs what (완전/불완전·선행사)",
        pairForms: "that/what",
        mechanism: "완전 명사절→that; 불완전·선행사 없음→what; 선행사 있으면 관계 that",
        plant: "The truth is that/what most people… / get that/what they need / table that/what is made",
        example: "This car is that(×)/what my brother plans to buy",
      },
      {
        id: "rel-case",
        point: 23,
        name: "관계대명사 격·whose",
        pairForms: "who/whom·whose/which·who/which",
        mechanism: "주격/목적격/소유격. whose vs its",
        plant: "historian whose/which work… / person whose/whom you want / animal its(×)/whose brain",
        example: "man who/which robbed / machine whom(×)/that I broke",
      },
      {
        id: "rel-cont",
        point: 23,
        name: "계속적 용법 — that 불가",
        pairForms: "which/that·who/that",
        mechanism: "콤마 뒤 보충 설명에 that(×)",
        plant: "Pyeongchang, that(×)/which is a city… / John, that(×)/who is the captain",
        example: "feathers, which/that(×) keep out",
      },
      {
        id: "rel-vs-adv",
        point: 23,
        name: "관계대명사 vs 관계부사 / 전치사+관계대명사",
        pairForms: "which/where·that/where·which/to which",
        mechanism: "불완전절→관계대명사; 완전절→관계부사. to which 등",
        plant: "park which/where we love(불완전 love의 목적어) / place which/where we played(완전)",
        example: "questions which/to which I forgot to give an answer / the way how(×)",
      },
      {
        id: "rel-vs-pron",
        point: 23,
        name: "관계대명사 vs 인칭대명사",
        pairForms: "he/who·they/which·it/that",
        mechanism: "절을 이끌어야 하는데 he/they",
        plant: "the doctor he(×)/who examined me / places they(×)/which have history",
        example: "blender, and it/that works (콤마+and면 대명사 OK — 문맥)",
      },
    ],
  },
  {
    key: "special",
    eobeopUnit: null,
    cheoeumUnit: 13,
    title: "특수구문 (강조·도치·부정·간접의문)",
    cases: [
      {
        id: "sp-cleft",
        point: null,
        name: "It ~ that 강조",
        pairForms: "that/what·It is/This is",
        mechanism: "It is/was + 강조요소 + that …",
        plant: "It is this fact … what(×)/that causes…",
        example: "It was in 1990 that…",
      },
      {
        id: "sp-indirect",
        point: null,
        name: "간접의문 어순",
        pairForms: "he went/did he go·I could/could I",
        mechanism: "의문사+S+V. 도치 유지(×)",
        plant: "don’t know why did he go(×)/he went / doubted whether could I(×)/I could",
        example: "how much disclosure is / is disclosure(×) appropriate",
      },
      {
        id: "sp-partial-neg",
        point: null,
        name: "부분부정 not always/all",
        pairForms: "not always/always not·not all/all not",
        mechanism: "not + all/every/always/both = 부분부정",
        plant: "always not(×)/not always be able / Humans have always not(×)/not always had",
        example: "All students do not… (부분부정 문맥)",
      },
    ],
  },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export type GrammarFocusPick = {
  wrongCases: Array<{ unit: GrammarUnitBank; c: GrammarCase }>;
  distractorCases: Array<{ unit: GrammarUnitBank; c: GrammarCase }>;
  focusBlock: string;
};

/**
 * 문항마다 다른 유닛·CASE·형태 쌍을 강제.
 * wrongCount: 어법모두고르기 2~3, 어법개수 1~5
 */
export function pickGrammarFocus(wrongCount: number): GrammarFocusPick {
  const n = Math.max(1, Math.min(wrongCount, 5));
  const units = shuffle(GRAMMAR_UNIT_BANKS);

  // S-V는 최대 1유닛만
  const pickedUnits: GrammarUnitBank[] = [];
  let usedSv = false;
  for (const u of units) {
    if (pickedUnits.length >= n) break;
    if (u.key === "sv") {
      if (usedSv) continue;
      usedSv = true;
    }
    pickedUnits.push(u);
  }
  // 부족하면 나머지에서 채움 (sv 제외 우선)
  if (pickedUnits.length < n) {
    for (const u of units) {
      if (pickedUnits.length >= n) break;
      if (pickedUnits.includes(u)) continue;
      if (u.key === "sv" && usedSv) continue;
      pickedUnits.push(u);
    }
  }

  const wrongCases = pickedUnits.map((unit) => {
    const c = shuffle(unit.cases)[0];
    return { unit, c };
  });

  // 정답 밑줄용 — 다른 유닛에서 ‘맞아 보이는’ CASE
  const distractorCases: GrammarFocusPick["distractorCases"] = [];
  for (const u of shuffle(GRAMMAR_UNIT_BANKS)) {
    if (distractorCases.length >= 3) break;
    if (pickedUnits.includes(u)) continue;
    distractorCases.push({ unit: u, c: shuffle(u.cases)[0] });
  }

  const pairSet = new Set(wrongCases.map((x) => x.c.pairForms.split("·")[0]));
  const lines: string[] = [
    "=== THIS QUESTION FOCUS (필수 · 다른 문항과 패턴 다르게) ===",
    `Wrong spots MUST implement these ${wrongCases.length} DIFFERENT unit CASEs (one each):`,
  ];
  wrongCases.forEach((x, i) => {
    const tag = [
      x.unit.eobeopUnit != null
        ? `어법끝U${String(x.unit.eobeopUnit).padStart(2, "0")}`
        : null,
      x.unit.cheoeumUnit != null
        ? `처음U${String(x.unit.cheoeumUnit).padStart(2, "0")}`
        : null,
      x.c.point != null ? `P${String(x.c.point).padStart(2, "0")}` : null,
    ]
      .filter(Boolean)
      .join("/");
    lines.push(
      `${i + 1}) [${x.unit.key}/${x.c.id}] ${tag} ${x.unit.title} · ${x.c.name}`
    );
    lines.push(`   네모형태: ${x.c.pairForms}`);
    lines.push(`   메커니즘: ${x.c.mechanism}`);
    lines.push(`   심는법: ${x.c.plant}`);
    lines.push(`   예: ${x.c.example}`);
  });
  lines.push("");
  lines.push("Correct underlines: look like these other units but be actually right:");
  for (const x of distractorCases) {
    lines.push(
      `  · [${x.unit.key}/${x.c.id}] ${x.c.name} (${x.c.pairForms}) — keep CORRECT`
    );
  }
  lines.push("");
  lines.push("DIVERSITY CHECK:");
  lines.push(
    `  · pair-form families used: ${[...pairSet].join(", ")} — do NOT make all wrongs the same family`
  );
  lines.push("  · At most ONE sv-* trap in the whole question");
  lines.push(
    "  · NEVER adjacent S-V (such things change/changes); S-V only with long modifier lure"
  );
  lines.push(
    "  · Morphological shapes of wrong targets must differ (e.g. voice p.p. + relative that/what + to-V/V-ing), not three number-agreement verbs"
  );

  return { wrongCases, distractorCases, focusBlock: lines.join("\n") };
}

/** 전체 뱅크 요약 (포커스 외 참고) */
export function grammarCatalogPromptBlock(): string {
  const lines: string[] = [
    "FULL UNIT×CASE BANK (reference; THIS QUESTION FOCUS above overrides for wrong spots):",
    `Sources: ${GRAMMAR_TEXTBOOK_TITLES.join(" · ")}`,
    "",
    "HARD BANS:",
    ...GRAMMAR_HARD_BANS.map((b) => `  ✗ ${b}`),
    "",
  ];
  for (const u of GRAMMAR_UNIT_BANKS) {
    const tag = [
      u.eobeopUnit != null ? `어법끝U${u.eobeopUnit}` : null,
      u.cheoeumUnit != null ? `처음U${u.cheoeumUnit}` : null,
    ]
      .filter(Boolean)
      .join("/");
    lines.push(`■ ${u.key} ${u.title} (${tag})`);
    for (const c of u.cases) {
      lines.push(
        `  - ${c.id}: ${c.name} [${c.pairForms}] | ${c.mechanism}`
      );
    }
  }
  return lines.join("\n");
}

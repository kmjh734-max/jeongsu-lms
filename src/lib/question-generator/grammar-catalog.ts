/**
 * 어법 출제 카탈로그 — 교재가 가르치는 ‘출제 메커니즘’ 기준
 *
 * 근거 교재:
 *  - 『어법끝(개정) START』 PART I Point 01–23 (네모) + PART II 밑줄 적용
 *  - 『처음 만나는 수능 어법』 스타터(입문) UNIT 01–13 ‘결정적 출제 어법’
 *
 * 핵심 원칙 (교재 원문):
 *  - 수일치: 「주어+(수식어구)+동사」로 출제되는 것이 대부분.
 *    수식어 안 명사 수가 주어와 달라 오답을 유도한다.
 *  - 금지: 주어·동사가 바로 붙어 있는 단순 수일치
 *    (예: such things change/changes) — 시험 함정이 아님.
 */

export const GRAMMAR_TEXTBOOK_TITLES = [
  "어법끝(개정) START",
  "처음 만나는 수능 어법 스타터(입문)",
] as const;

export const GRAMMAR_TEXTBOOK_TITLE = GRAMMAR_TEXTBOOK_TITLES.join(" · ");

/** 절대 만들지 말 것 — 교재/기출 함정이 아닌 가짜 오류 */
export const GRAMMAR_HARD_BANS = [
  "주어와 동사가 바로 인접한 단순 수일치 (such things change/changes, people like/likes, students study/studies)",
  "철자·오타·존재하지 않는 단어로 ‘틀린 척’하기",
  "의미만 어색하고 문법적으로는 맞는 어휘 교체(그건 어휘 문항)",
  "교재 Point에 없는 희귀 구문·작위적 도치 남발",
  "밑줄 하나만 보고도 답이 보이는 초근접 함정 (수식어 없이 S+V만)",
] as const;

export type ExamTrap = {
  /** 어법끝 Point 번호 (없으면 null) */
  eobeopPoint: number | null;
  /** 처음만나는 UNIT */
  cheoeumUnit: number | null;
  id: string;
  title: string;
  /** 교재가 말하는 출제 메커니즘 */
  mechanism: string;
  /** 반드시 지문에 심어야 하는 구조 */
  requiredShape: string;
  /** 좋은 함정 예시 (패턴) */
  goodPattern: string;
  /** 나쁜/금지 예시 */
  badPattern: string;
};

/**
 * 실제 출제되는 함정만 — 빈도·교재 ‘결정적 출제’·CASE 기준
 * (단순 인접 수일치 같은 Warm-up 수준은 제외)
 */
export const EXAM_TRAPS: ExamTrap[] = [
  // ─── 수일치 (어법끝 P01–04 / 처음만나는 U01) ───
  {
    eobeopPoint: 1,
    cheoeumUnit: 1,
    id: "sv-modifier",
    title: "주어 + (긴 수식어) + 동사 — 수식어 끝 명사 혼동",
    mechanism:
      "「주어+(수식어구)+동사」가 대부분. 수식어(전명구·v-ing·to-v·p.p.·관계사절·형용사구·삽입) 안 명사 수가 주어와 달라 오답 유도.",
    requiredShape:
      "핵심 주어와 동사 사이에 수식어가 끼고, 동사 직전(수식어 끝) 명사 수 ≠ 주어 수. 틀린 동사는 수식어 끝 명사에 맞춘 형태.",
    goodPattern:
      "The main purpose of food labels on products are… (× are←products) / One CEO in … companies have… (× have←companies) / People living in … facilities use…",
    badPattern:
      "Such things change/changes — 수식어 없음, 인접 수일치. 출제 가치 없음.",
  },
  {
    eobeopPoint: 2,
    cheoeumUnit: 1,
    id: "sv-relative-antecedent",
    title: "관계사절 동사 수 = 선행사 (선행사≠직전 명사)",
    mechanism:
      "주격 관계대명사 뒤 동사는 선행사와 일치. 선행사+수식어+관계사일 때 수식어 끝 명사를 선행사로 착각.",
    requiredShape:
      "… N1 (수식어 … N2) which/that/who + V … 에서 V를 N2에 맞춘 오류, 또는 단순 선행사 수 불일치.",
    goodPattern:
      "any food on those shelves which have an unusual odor (× have←shelves, 선행사 food) / photos that was deleted (× was←photos)",
    badPattern: "the dogs that bark/barks — 선행사 직후·혼동 명사 없음.",
  },
  {
    eobeopPoint: 3,
    cheoeumUnit: 1,
    id: "sv-inversion-there",
    title: "도치·There — 동사 뒤 진짜 주어",
    mechanism:
      "부사(구)/부정어 도치, There+V+S. 앞에 나온 명사나 there를 주어로 착각하지 말고 동사 뒤 주어에 수 일치.",
    requiredShape:
      "In/On/Behind… + V + 복수주어, Not until/Only/Little… + aux + S, There is/are + 실제 주어.",
    goodPattern:
      "In the back seat … was/were two boys / There has/have been some increases / No longer is/are self-driving cars…",
    badPattern: "There are books / There is a book — 함정 없이 정답만 보이는 인접형.",
  },
  {
    eobeopPoint: 4,
    cheoeumUnit: 1,
    id: "sv-subject-form",
    title: "주어 형태 — 동명사·절·each/every·부분표현 of",
    mechanism:
      "v-ing/to-v/명사절 주어→단수(동사 근처 복수 명사로 유인). each/every→단수, both→복수, the+형용사→복수. 부분표현+of+N은 of 뒤 N에 일치.",
    requiredShape:
      "주어가 비명사(절·준동사)이거나 수량표현이고, 동사 근처에 다른 수의 명사가 있어 유인.",
    goodPattern:
      "Accepting … in your problems mean/means (× mean←problems) / Whether … exists is/are… / The majority of our clients is/are… / Each of the countries have/has…",
    badPattern: "Running is/are fun — 유인 명사 없는 단순형.",
  },

  // ─── 명사·대명사 (P05–06 / U10) ───
  {
    eobeopPoint: 5,
    cheoeumUnit: 10,
    id: "pronoun-agree",
    title: "대명사 수·격 — 문장 안 단수/복수 명사 혼재",
    mechanism:
      "대명사 수일치 출제 비중 최고. 단수·복수 명사가 같이 있어 지시 대상을 헷갈리게 함. 소유대명사·재귀도.",
    requiredShape:
      "지시대명사/인칭대명사가 가리킬 후보 명사가 2개 이상(수 다름). 틀린 쪽은 잘못된 선행사에 맞춤.",
    goodPattern:
      "Plastic … allows it/them to travel… (× them←plastics 복수 유인, 선행사 Plastic) / dried him/himself",
    badPattern: "The boy lost his/her book — 성만 틀린 작위적 함정.",
  },
  {
    eobeopPoint: 6,
    cheoeumUnit: 10,
    id: "noun-count",
    title: "가산/불가산 수식어",
    mechanism: "information/advice/equipment 등 불가산에 many/a few/a; 가산에 much/little.",
    requiredShape: "전형적 불가산·가산 명사 + 잘못된 수량 수식어.",
    goodPattern: "many informations (×) / much ideas (×) / an advice (×)",
    badPattern: "a book / books — 함정 없는 기본형.",
  },

  // ─── 시제 (P07–08 / U02) ───
  {
    eobeopPoint: 7,
    cheoeumUnit: 2,
    id: "tense-past-perfect",
    title: "단순과거 vs 현재완료 — 부사(구)로 구분",
    mechanism:
      "yesterday/ago/last/in+연도 → 과거. since/for/already/just/recently(계속·결과) → 현재완료. 부사와 시제 불일치가 함정.",
    requiredShape: "시제 판별 부사(구)가 있고, 동사 시제가 그와 충돌.",
    goodPattern:
      "He died/has died in 1933 (× has died) / Since 2000, businesses experienced/have experienced (× experienced)",
    badPattern: "I go/went to school yesterday — 너무 초보·부사 없이 시제만.",
  },
  {
    eobeopPoint: 8,
    cheoeumUnit: 2,
    id: "tense-adverbial-future",
    title: "시간·조건 부사절 — 미래 대신 현재",
    mechanism: "when/if/unless/until/before/after 부사절에 will 쓰지 않음. 네모는 현재/미래 형태.",
    requiredShape: "시간·조건 종속절 안에 will/be going to가 들어간 오류.",
    goodPattern: "If you will be/are not careful… (× will be) / When he will arrive/arrives…",
    badPattern: "I will go tomorrow — 주절 미래는 정상.",
  },

  // ─── 조동사·가정법 (P09–10 / U03–04) ───
  {
    eobeopPoint: 9,
    cheoeumUnit: 3,
    id: "modal-perfect",
    title: "조동사+원형 vs 조동사+have p.p.",
    mechanism: "과거 추측·후회는 modal+have p.p. 현재·미래 의무·능력은 modal+원형.",
    requiredShape: "과거 맥락인데 modal+원형, 또는 그 반대.",
    goodPattern:
      "must feel/have felt (과거 사건 후회·추측) / may even be/have been",
    badPattern: "can swim/swims — 조동사 뒤 원형만 건드리는 초보 함정.",
  },
  {
    eobeopPoint: 10,
    cheoeumUnit: 4,
    id: "subjunctive",
    title: "가정법 과거 vs 과거완료 · that절 (should+)원형",
    mechanism:
      "현재 반대=과거형/were+would. 과거 반대=had p.p.+would have. suggest/insist/request that+(should+)원형.",
    requiredShape: "가정 if/wish/as if 시제 불일치, 또는 that절에 joined/asks 같은 일반 시제.",
    goodPattern:
      "If he wrote… he would get/have gotten (시제 짝) / requested that she join/joined (× joined)",
    badPattern: "If I am rich I will… — 직설만 있는 작위문.",
  },

  // ─── 태 (P11–12 / U05) — 출제 빈도 매우 높음 ───
  {
    eobeopPoint: 11,
    cheoeumUnit: 5,
    id: "voice-verb",
    title: "능동 vs 수동 — 주어가 행위자인지 대상인지",
    mechanism:
      "태 구별은 출제 빈도 매우 높음. 주어-동사 의미 관계. 관계절 능동/수동, consist of 등 수동처럼 보이는 능동, appear/seem 수동 불가.",
    requiredShape:
      "타동사인데 목적어 없이 능동, 또는 자동사·상태동사를 수동으로. 관계절에서 선행사와의 능동/수동 오류.",
    goodPattern:
      "problems solved/were solved / This concept has discussed/has been discussed / photo appeared/was appeared (× was appeared) / consist of → *is consisted of (×)",
    badPattern: "He eats/is eaten an apple — 의미상 말도 안 되는 작위 수동.",
  },
  {
    eobeopPoint: 12,
    cheoeumUnit: 5,
    id: "voice-verbal",
    title: "to부정사·동명사 태 — 의미상 주어부터",
    mechanism: "의미상 주어가 동작을 받으면 to be p.p. / being p.p.",
    requiredShape: "의미상 주어가 수동인데 to-V/V-ing 능동형(또는 반대).",
    goodPattern: "want the letter to send/to be sent / avoid being / to be caught",
    badPattern: "I want to go/to be gone — 의미상 주어가 능동인데 수동.",
  },

  // ─── 분사 (P13–15 / U07) ───
  {
    eobeopPoint: 13,
    cheoeumUnit: 7,
    id: "participle-modify",
    title: "수식 분사 — 명사와의 능동/수동",
    mechanism: "명사를 수식하는 v-ing(능동) vs p.p.(수동). filling/filled, needing/needed.",
    requiredShape: "피수식 명사가 행위자면 p.p. 오류, 대상이면 v-ing 오류.",
    goodPattern:
      "a sandwich filling/filled with tuna / girl walking/walked up the street / space needing/needed to heal",
    badPattern: "the running/runned boy — 비표준·작위.",
  },
  {
    eobeopPoint: 14,
    cheoeumUnit: 7,
    id: "participle-absolute",
    title: "분사구문 — 주절 주어와의 능동/수동 (+ with+명사+분사)",
    mechanism: "분사구문 의미상 주어=주절 주어. Looking/Looked into those eyes…",
    requiredShape: "주절 주어가 수동인데 현재분사(또는 반대). with+O+V-ing/p.p. 혼동.",
    goodPattern:
      "Looking/Looked into those eyes, I knew… / Surprising/Surprised by the news, he…",
    badPattern: "Walking to school, the rain fell — 의미상 주어 불일치만(현학)보다 능동/수동 우선.",
  },
  {
    eobeopPoint: 15,
    cheoeumUnit: 7,
    id: "participle-emotion",
    title: "감정동사 -ing(원인) vs -ed(경험자)",
    mechanism: "보어·수식에서 interesting(사물) / interested(사람).",
    requiredShape: "사람 주어에 -ing, 사물·원인에 -ed.",
    goodPattern: "I am tiring/tired / The music was relaxing/relaxed (보어 대상 확인)",
    badPattern: "an interesting/interested book — 너무 초보만 단독 출제 지양(가능하면 긴 문장).",
  },

  // ─── 준동사 (P16–18 / U06) ───
  {
    eobeopPoint: 16,
    cheoeumUnit: 6,
    id: "verb-vs-verbal",
    title: "동사 자리 vs 준동사 자리",
    mechanism:
      "접속사·관계사 없이 동사 2개 불가. p.p.를 동사로 착각, 명사·동사 겸용 단어 주의. do vs be 대동사.",
    requiredShape:
      "이미 정동사가 있는데 또 정동사, 또는 정동사 자리에 v-ing만. used to transport oil에서 used를 동사로 착각하는 유형과 연계.",
    goodPattern:
      "keep to search/searching / decide do/to do / Volunteering helps/helping to reduce…",
    badPattern: "He going to school — 초등 수준 비문.",
  },
  {
    eobeopPoint: 17,
    cheoeumUnit: 6,
    id: "object-form",
    title: "목적어 to-V / V-ing · 가·진목적어",
    mechanism:
      "동사별 목적어 형태. remember/forget/stop/try 의미 차이. make/find it + to-V.",
    requiredShape: "목적어 자리에 원형·잘못된 to-V/V-ing.",
    goodPattern:
      "keep searching / agreed to transport / forgot to give/giving / begin to accept/accepting",
    badPattern: "want going — 너무 노골적; 가능하면 빈출 동사 목록 사용.",
  },
  {
    eobeopPoint: 18,
    cheoeumUnit: 6,
    id: "object-complement",
    title: "목적격보어 — 능동(원형/to-V) vs 수동(p.p.)",
    mechanism: "사역·지각+원형, allow/force+to-V. 목적어가 받으면 p.p.",
    requiredShape: "make/let/see/hear + O + V / to-V / p.p. 중 관계 오류.",
    goodPattern:
      "saw me kick/to kick / told students be/to be ready / get the work finish/finished",
    badPattern: "make him to go — 가능하나, 능동/수동 관계형과 섞어 출제 권장.",
  },

  // ─── 병렬·비교 (P19–20 / U09·12) ───
  {
    eobeopPoint: 19,
    cheoeumUnit: 9,
    id: "parallel",
    title: "등위·상관접속사 병렬 — 형태 일치",
    mechanism: "and/or/but, not only A but also B — A·B 문법 형태 대등.",
    requiredShape: "접속사로 이어진 두 항의 품사·시제·to-V/V-ing 불일치.",
    goodPattern:
      "turned off the light and goes/went… / not only cleaned but also washes/washed…",
    badPattern: "I like apples and orange — 단수복수만(약함).",
  },
  {
    eobeopPoint: 20,
    cheoeumUnit: 12,
    id: "comparison",
    title: "비교 — 원급/비교급/최상급 · 비교대상 병렬",
    mechanism: "as…as / -er than / the -est. 비교 대상 형태 일치. very+비교급 불가.",
    requiredShape: "비교 형태 깨짐 또는 A than B에서 B 형태 불일치.",
    goodPattern:
      "more important than getting married / as old as… / much/very better (× very)",
    badPattern: "bigger/more bigger — 가능하나 비교대상 병렬과 함께 쓰면 더 교재형.",
  },

  // ─── 형용사·부사 / 전치사·접속사 (P21–22 / U11·09) ───
  {
    eobeopPoint: 21,
    cheoeumUnit: 11,
    id: "adj-adv",
    title: "형용사 vs 부사 자리 (긴 문장·보어)",
    mechanism:
      "명수식=형용사, 동·형·부 수식=부사. makes a child easy/easily distracted. hard/hardly·late/lately.",
    requiredShape: "보어·목적격보어·동사수식 자리에서 형/부 교체. 가능하면 수식 대상이 멀리 있음.",
    goodPattern:
      "makes a child easy/easily distracted / The disorder… / hard/hardly worked",
    badPattern: "She runs quick/quickly — 초보 단독형 지양.",
  },
  {
    eobeopPoint: 22,
    cheoeumUnit: 9,
    id: "prep-conj",
    title: "전치사 vs 접속사 · to+v-ing · like/alike",
    mechanism:
      "전치사+명사(구)/v-ing, 접속사+S+V. despite/although, during/while, because of/because. look forward to + v-ing.",
    requiredShape: "절이 필요한데 전치사, 명사구인데 접속사. to 뒤 원형 오류.",
    goodPattern:
      "during/while he played / because of/because he was… / look forward to meet/meeting / like/alike",
    badPattern: "in the room / in he room — 비문.",
  },

  // ─── 관계사·that/what (P23 / U08·09) ───
  {
    eobeopPoint: 23,
    cheoeumUnit: 8,
    id: "relative-role",
    title: "that/what · 관계대명사 격 · 관계대명사 vs 관계부사",
    mechanism:
      "완전절→접속사 that, 불완전절·선행사 없음→what. 격(who/whom/whose). 불완전→관계대명사, 완전→관계부사. 전치사+관계대명사.",
    requiredShape:
      "절 완전/불완전을 깨는 which/that/what/where 교체, 또는 격 오류. 선행사 역할 확인.",
    goodPattern:
      "Tell me the story that/what you like / can’t believe that/what you’re saying / park which/where we love / questions to which… / who/whose heart…",
    badPattern: "the man who/which — 가능하나 격·완전/불완전형 우선.",
  },

  // ─── 처음만나는 추가 (U13) — 어법끝 네모 23포인트 밖이지만 교재 결정적 출제 ───
  {
    eobeopPoint: null,
    cheoeumUnit: 13,
    id: "special-cleft-indirect",
    title: "It~that 강조 · 간접의문 어순",
    mechanism: "강조구문 It is/was…that. 간접의문=의문사+S+V (도치 유지 금지).",
    requiredShape: "강조구문 깨짐, 또는 간접의문에 do/does/did+S 도치.",
    goodPattern:
      "It was in 1990 that… / ask what time it is / *ask what time is it (× 간접)",
    badPattern: "단순 Yes/No 의문만 도치 — 간접의문 맥락 필요.",
  },
];

/** @deprecated — EXAM_TRAPS 사용. 호환용 빈 껍데기 유지하지 않음 */
export type GrammarUnit = {
  unit: number;
  title: string;
  points: Array<{ id: string; title: string; traps: string[] }>;
  examFocus: string[];
};

/** 프롬프트용 — 메커니즘·금지·패턴 중심 (토큰은 길지만 정확도 우선) */
export function grammarCatalogPromptBlock(): string {
  const lines: string[] = [
    "GRAMMAR EXAM TRAPS — from 어법끝 START P01–23 + 처음 만나는 수능 어법 ‘결정적 출제’.",
    "Plant WRONG underlines ONLY using mechanisms below. Correct underlines = same family but actually right.",
    "",
    "HARD BANS (위반 시 문항 실패):",
    ...GRAMMAR_HARD_BANS.map((b) => `  ✗ ${b}`),
    "",
    "S-V AGREEMENT RULE (교재 원문 요지):",
    "  ✓ MUST: Subject + (modifier phrase/clause) + Verb, and the noun at the END of the modifier has a DIFFERENT number from the real subject; the wrong verb agrees with that nearby noun.",
    "  ✗ NEVER: adjacent S+V number swap with no intervening modifier (such things change/changes).",
    "",
    "ALLOWED TRAPS:",
  ];

  for (const t of EXAM_TRAPS) {
    const tag = [
      t.eobeopPoint != null ? `어법끝P${String(t.eobeopPoint).padStart(2, "0")}` : null,
      t.cheoeumUnit != null
        ? `처음U${String(t.cheoeumUnit).padStart(2, "0")}`
        : null,
    ]
      .filter(Boolean)
      .join("/");
    lines.push(`• [${tag}] ${t.title}`);
    lines.push(`    메커니즘: ${t.mechanism}`);
    lines.push(`    필수구조: ${t.requiredShape}`);
    lines.push(`    ✓ ${t.goodPattern}`);
    lines.push(`    ✗ ${t.badPattern}`);
  }

  lines.push("");
  lines.push(
    "Coverage: use 2+ different trap IDs across ⓐ~ⓔ/ⓕ (e.g. sv-modifier + voice-verb + relative-role)."
  );
  lines.push(
    "explanation (Korean): for each wrong letter cite trap id/tag + one line (e.g. 「어법끝P01 수식어 끝 companies에 동사 맞춤」)."
  );

  return lines.join("\n");
}

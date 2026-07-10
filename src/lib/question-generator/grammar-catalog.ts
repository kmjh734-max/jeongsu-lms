/**
 * 어법 출제 카탈로그 — 두 교재 통합
 * 1) 『처음 만나는 수능 어법』 스타터(입문) UNIT 01–13
 * 2) 『어법끝(개정) START』 PART I 네모어법 Point 01–23 (+ PART II 밑줄 적용)
 *
 * 어법 문항의 오류·정답 포인트는 이 목록만 사용한다.
 */

export const GRAMMAR_TEXTBOOK_TITLES = [
  "처음 만나는 수능 어법 스타터(입문)",
  "어법끝(개정) START",
] as const;

/** @deprecated use GRAMMAR_TEXTBOOK_TITLES */
export const GRAMMAR_TEXTBOOK_TITLE = GRAMMAR_TEXTBOOK_TITLES.join(" · ");

export type GrammarUnit = {
  unit: number;
  title: string;
  points: Array<{ id: string; title: string; traps: string[] }>;
  examFocus: string[];
};

/** 어법끝 START — PART I 네모어법 23포인트 (기출 핵심) */
export type EobeopPoint = {
  id: number;
  unit: number;
  title: string;
  cases: string[];
};

export const EOBEOP_START_POINTS: EobeopPoint[] = [
  {
    id: 1,
    unit: 1,
    title: "주어와 수식어를 구분하라",
    cases: [
      "주어+(전치사+명사)+동사",
      "주어+(v-ing/to-v/p.p.)+동사",
      "주어+[관계사절]/동사",
      "주어+삽입어+동사",
    ],
  },
  {
    id: 2,
    unit: 1,
    title: "관계사절 내 동사의 수는 선행사를 찾아라",
    cases: [
      "선행사+관계대명사+동사",
      "선행사+수식어구+관계대명사+동사",
    ],
  },
  {
    id: 3,
    unit: 1,
    title: "주어가 동사 뒤에 나오는 구문에 주의하라",
    cases: [
      "부사(구)+동사+주어",
      "부정어(구)+(조)동사+주어",
      "There+동사+주어",
    ],
  },
  {
    id: 4,
    unit: 1,
    title: "주어 형태에 주목하라",
    cases: [
      "v-ing/to-v/명사절 주어 → 단수동사",
      "each/every → 단수, both → 복수",
      "the+형용사 → 복수동사",
      "부분표현+of+명사 (of 뒤 명사에 수 일치)",
    ],
  },
  {
    id: 5,
    unit: 2,
    title: "대명사의 형태에 주의하라",
    cases: [
      "명사-대명사 수일치",
      "인칭대명사 vs 소유대명사",
      "인칭대명사 vs 재귀대명사",
    ],
  },
  {
    id: 6,
    unit: 2,
    title: "명사의 종류에 따라 수식어를 구별하라",
    cases: [
      "가산 vs 불가산 수식어 (many/much, a/an 등)",
      "공통 수식어(구) 오용",
    ],
  },
  {
    id: 7,
    unit: 3,
    title: "단순과거와 현재완료의 구별은 부사를 찾아라",
    cases: ["단순과거 vs 현재완료(계속) — yesterday/ago vs since/for/already"],
  },
  {
    id: 8,
    unit: 3,
    title: "현재시제가 미래를 나타내는 부사절에 주의하라",
    cases: ["시간 부사절", "조건 부사절 — will 대신 현재"],
  },
  {
    id: 9,
    unit: 4,
    title: "조동사+have p.p.는 가리키는 때와 의미에 주의하라",
    cases: [
      "조동사+원형 vs 조동사+have p.p.",
      "should/must/could have p.p. 의미 차이",
    ],
  },
  {
    id: 10,
    unit: 4,
    title: "가정법의 핵심은 시제이다",
    cases: [
      "가정법 과거 vs 과거완료",
      "that절 should(주장·요구·제안·명령)",
    ],
  },
  {
    id: 11,
    unit: 5,
    title: "동사의 태는 주어와의 의미 관계를 파악하라",
    cases: [
      "능동 vs 수동",
      "수동태+명사 구조",
      "관계대명사절 능동 vs 수동",
      "be used to-v vs be used to v-ing",
    ],
  },
  {
    id: 12,
    unit: 5,
    title: "to부정사/동명사의 태는 의미상 주어부터 찾아라",
    cases: ["to부정사의 태 (to be p.p.)", "동명사의 태 (being p.p.)"],
  },
  {
    id: 13,
    unit: 6,
    title: "수식받는 명사와의 의미 관계를 파악하라 (분사)",
    cases: ["능동(v-ing) vs 수동(p.p.) 수식"],
  },
  {
    id: 14,
    unit: 6,
    title: "분사구문의 의미상 주어를 찾아라",
    cases: ["분사구문 능동 vs 수동", "with+(대)명사+분사"],
  },
  {
    id: 15,
    unit: 6,
    title: "감정동사의 의미상 주어를 찾아라",
    cases: ["interesting/interested류 능동(v-ing) vs 수동(p.p.)"],
  },
  {
    id: 16,
    unit: 7,
    title: "동사부터 찾아라",
    cases: ["문장 동사 vs 준동사", "do vs be"],
  },
  {
    id: 17,
    unit: 7,
    title: "동사별로 취하는 목적어 형태를 알아두라",
    cases: [
      "목적어 to-V 또는 V-ing",
      "둘 다 가능·의미 구분",
      "가목적어 it + 진목적어 to-V",
    ],
  },
  {
    id: 18,
    unit: 7,
    title: "목적격보어는 동사와 목적어를 동시에 고려하라",
    cases: [
      "목적어-목적격보어 능동(원형/to-V) vs 수동(p.p.)",
      "사역·지각동사 원형 vs to-V",
    ],
  },
  {
    id: 19,
    unit: 8,
    title: "등위접속사+네모는 병렬구조를 묻는다",
    cases: ["and/or/but 병렬 — 품사·형태 일치"],
  },
  {
    id: 20,
    unit: 8,
    title: "비교구문의 종류별 의미와 표현에 주목하라",
    cases: [
      "원급 vs 비교급 vs 최상급",
      "as 형용사/부사 as",
      "비교 대상 병렬구조",
    ],
  },
  {
    id: 21,
    unit: 9,
    title: "형용사와 부사 역할을 구분하라",
    cases: [
      "형용사 vs 부사 자리",
      "hard/hardly·late/lately 등 주의 부사",
      "보어로 형용사를 취하는 동사",
    ],
  },
  {
    id: 22,
    unit: 9,
    title: "전치사와 접속사를 혼동하지 마라",
    cases: [
      "전치사 자리 vs 접속사 자리",
      "to + v-ing vs to + v",
      "like vs alike",
    ],
  },
  {
    id: 23,
    unit: 10,
    title: "접속사·관계대명사·관계부사의 역할을 구분하라",
    cases: [
      "that vs what (명사절)",
      "that 관계대명사",
      "계속적(보충설명) 관계사절",
      "관계대명사 격·선행사",
      "관계대명사 vs 대명사",
      "관계대명사 vs 관계부사 / 전치사+관계대명사",
    ],
  },
];

/**
 * 『처음 만나는 수능 어법』 UNIT 맵 + 어법끝 CASE로 보강한 통합 주제 목록
 */
export const GRAMMAR_UNITS: GrammarUnit[] = [
  {
    unit: 1,
    title: "주어 동사 수 일치",
    examFocus: [
      "주어↔수식어 구분 (어법끝 P01)",
      "관계사절 동사↔선행사 (P02)",
      "도치·There 구문 주어 (P03)",
      "v-ing/each/every/the+형용사/부분표현 of (P04)",
    ],
    points: [
      {
        id: "1-1",
        title: "단수/복수 주어 + 수식어구 + 동사",
        traps: [
          "전치사구·v-ing·to-v·p.p.·관계사절·삽입어 끝 명사에 동사 맞춤",
        ],
      },
      {
        id: "1-2",
        title: "관계사절 내 동사 수 = 선행사",
        traps: ["관계사 직전 명사(수식어 끝)에 동사 맞춤"],
      },
      {
        id: "1-3",
        title: "주어가 동사 뒤 (도치·There)",
        traps: ["부사/부정어 도치, There are/is 주어 수 오류"],
      },
      {
        id: "1-4",
        title: "주어 형태 (단수/복수 취급)",
        traps: [
          "동명사·to-V·명사절 주어 단수",
          "each/every 단수, both 복수, the+형용사 복수",
          "부분표현+of+명사",
          "A and B, -thing/-one/-body",
        ],
      },
    ],
  },
  {
    unit: 2,
    title: "동사의 시제",
    examFocus: [
      "단순과거 vs 현재완료 — 부사 (어법끝 P07)",
      "시간·조건 부사절 현재시제 (P08)",
    ],
    points: [
      {
        id: "2-1",
        title: "단순시제·진행·완료",
        traps: ["시점과 안 맞는 시제, 상태동사 진행"],
      },
      {
        id: "2-2",
        title: "과거 vs 현재완료",
        traps: ["yesterday/ago/last vs since/for/already/just"],
      },
      {
        id: "2-3",
        title: "시간·조건 부사절의 현재시제",
        traps: ["when/if/unless/until 절에 will"],
      },
    ],
  },
  {
    unit: 3,
    title: "조동사·가정법",
    examFocus: [
      "조동사+have p.p. (어법끝 P09)",
      "가정법 과거 vs 과거완료 · that절 should (P10)",
    ],
    points: [
      {
        id: "3-1",
        title: "조동사 + 원형 / + have p.p.",
        traps: ["시제·의미 혼동 (should have / must have 등)"],
      },
      {
        id: "3-2",
        title: "가정법 과거·과거완료",
        traps: ["현재 반대 were/would vs 과거 반대 had/would have"],
      },
      {
        id: "3-3",
        title: "주장·요구·제안 that절 should",
        traps: ["insist/suggest that절 일반 시제·인칭변화"],
      },
      {
        id: "3-4",
        title: "I wish / as if 가정법",
        traps: ["wish·as if 뒤 시제 오류"],
      },
    ],
  },
  {
    unit: 4,
    title: "태 (능동/수동)",
    examFocus: [
      "주어-동사 의미 관계 (어법끝 P11)",
      "to부정사·동명사 태 (P12)",
      "be used to-v vs be used to v-ing",
    ],
    points: [
      {
        id: "4-1",
        title: "능동태 vs 수동태",
        traps: ["관계절 능동/수동, 수동+명사, 수동 불가 동사"],
      },
      {
        id: "4-2",
        title: "진행·완료 수동 / 4·5형식 수동",
        traps: ["is being / has been + p.p. 형태"],
      },
      {
        id: "4-3",
        title: "to부정사·동명사의 태",
        traps: ["to be p.p. / being p.p. 누락·오용"],
      },
    ],
  },
  {
    unit: 5,
    title: "분사·분사구문",
    examFocus: [
      "수식 분사 능동/수동 (어법끝 P13)",
      "분사구문·with+명사+분사 (P14)",
      "감정동사 -ing/-ed (P15)",
    ],
    points: [
      {
        id: "5-1",
        title: "명사 수식 현재분사 vs 과거분사",
        traps: ["수식 대상과의 능동/수동 혼동"],
      },
      {
        id: "5-2",
        title: "분사구문",
        traps: ["주절 주어와 능동/수동, with+명사+분사"],
      },
      {
        id: "5-3",
        title: "감정동사 분사",
        traps: ["interesting/interested, boring/bored"],
      },
    ],
  },
  {
    unit: 6,
    title: "동사와 준동사 (to부정사·동명사)",
    examFocus: [
      "동사 vs 준동사 자리 (어법끝 P16)",
      "목적어 to-V / V-ing · 가·진목적어 (P17)",
      "목적격보어 능동/수동 (P18)",
    ],
    points: [
      {
        id: "6-1",
        title: "문장 동사 vs 준동사",
        traps: ["동사 자리에 v-ing만, 준동사 자리에 시제동사"],
      },
      {
        id: "6-2",
        title: "목적어 to-V / V-ing",
        traps: ["동사별 목적어 형태, remember/stop/try 의미"],
      },
      {
        id: "6-3",
        title: "가목적어·진목적어",
        traps: ["make it + to-V / that절 형태"],
      },
      {
        id: "6-4",
        title: "목적격보어",
        traps: ["사역·지각 원형, ask/force to-V, 목적어-보어 수동 p.p."],
      },
    ],
  },
  {
    unit: 7,
    title: "병렬구조와 비교",
    examFocus: [
      "등위접속사 병렬 (어법끝 P19)",
      "원급·비교급·최상급 · 비교대상 병렬 (P20)",
    ],
    points: [
      {
        id: "7-1",
        title: "등위접속사 병렬구조",
        traps: ["and/or/but, both A and B, not only A but also B"],
      },
      {
        id: "7-2",
        title: "비교구문 형태",
        traps: ["as…as / -er than / the -est, more+-er 중복"],
      },
      {
        id: "7-3",
        title: "비교급 강조·비교대상 병렬",
        traps: ["very+비교급, 비교 대상 형태 불일치"],
      },
    ],
  },
  {
    unit: 8,
    title: "형용사·부사 / 전치사·접속사",
    examFocus: [
      "형용사 vs 부사 자리 (어법끝 P21)",
      "전치사 vs 접속사 · to v-ing · like/alike (P22)",
    ],
    points: [
      {
        id: "8-1",
        title: "형용사 vs 부사",
        traps: ["보어 형용사, 동사 수식 부사, hard/hardly류"],
      },
      {
        id: "8-2",
        title: "부정 의미 부사",
        traps: ["hardly/rarely + not 이중부정"],
      },
      {
        id: "8-3",
        title: "전치사 vs 접속사",
        traps: [
          "despite/although, during/while, because of/because",
          "look forward to + v-ing",
          "like vs alike",
        ],
      },
    ],
  },
  {
    unit: 9,
    title: "관계사·접속사 that/what",
    examFocus: [
      "that vs what · 관계사 격 · 관계대명사 vs 관계부사 (어법끝 P23)",
    ],
    points: [
      {
        id: "9-1",
        title: "that vs what",
        traps: ["선행사 있는 what, 완전절 what / 불완전절 that 혼동"],
      },
      {
        id: "9-2",
        title: "관계대명사 격·계속적 용법",
        traps: ["who/whom/whose, 계속적 용법에 that"],
      },
      {
        id: "9-3",
        title: "관계대명사 vs 관계부사 / 전치사+관계대명사",
        traps: ["완전절에 which, 불완전절에 where, 전치사 뒤 who/that"],
      },
      {
        id: "9-4",
        title: "관계대명사 vs 대명사",
        traps: ["절을 이끌지 않는 which/that 오용"],
      },
    ],
  },
  {
    unit: 10,
    title: "명사·대명사",
    examFocus: ["대명사 형태·수일치 (어법끝 P05)", "가산/불가산 수식어 (P06)"],
    points: [
      {
        id: "10-1",
        title: "가산 vs 불가산",
        traps: ["information/advice에 a/many"],
      },
      {
        id: "10-2",
        title: "명사-대명사 일치·인칭·소유·재귀",
        traps: ["수·성 불일치, him/himself, mine/my"],
      },
      {
        id: "10-3",
        title: "지시·부정대명사",
        traps: ["this/these, one/ones, another/other/others"],
      },
    ],
  },
  {
    unit: 11,
    title: "특수구문 (처음 만나는 수능 어법 UNIT 13)",
    examFocus: [
      "It ~ that 강조",
      "도치",
      "부분부정",
      "간접의문문 어순",
    ],
    points: [
      {
        id: "11-1",
        title: "강조구문 It ~ that",
        traps: ["강조구문 형태 오류"],
      },
      {
        id: "11-2",
        title: "도치·부분부정·간접의문",
        traps: [
          "부정어 도치 어순",
          "not all / all not",
          "간접의문문에 조동사+주어 도치 유지",
        ],
      },
    ],
  },
];

/** 프롬프트용 압축 카탈로그 */
export function grammarCatalogPromptBlock(): string {
  const lines: string[] = [
    `GRAMMAR SOURCES (둘 다 허용 · 이 범위만):`,
    `  A) ${GRAMMAR_TEXTBOOK_TITLES[1]} — Point 01–23 (네모·밑줄 어법 핵심)`,
    `  B) ${GRAMMAR_TEXTBOOK_TITLES[0]} — UNIT 01–13 (동일 범위 + 강조·간접의문 등)`,
    "Every WRONG underline MUST map to one Point/CASE below. Correct underlines may look like the same points but be actually right.",
    "Ban nonsense words, spelling tricks, and grammar outside this list.",
    "In explanation (Korean): cite e.g. 「어법끝 P01 주어·수식어」 or 「처음만나는 UNIT08 관계사」.",
    "",
    "=== 어법끝 START Point 01–23 ===",
  ];

  for (const p of EOBEOP_START_POINTS) {
    lines.push(
      `P${String(p.id).padStart(2, "0")} ${p.title} — ${p.cases.join("; ")}`
    );
  }

  lines.push("");
  lines.push("=== 통합 주제 (처음만나는 + 어법끝 보강) ===");
  for (const u of GRAMMAR_UNITS) {
    lines.push(`T${String(u.unit).padStart(2, "0")} ${u.title}`);
    lines.push(`  초점: ${u.examFocus.join(" / ")}`);
    for (const pt of u.points) {
      lines.push(`  · ${pt.title} — ${pt.traps.join("; ")}`);
    }
  }

  lines.push("");
  lines.push(
    "Coverage tip: across ⓐ~ⓔ/ⓕ prefer 2+ different Points (e.g. P01 수일치 + P23 관계사 + P11 태)."
  );
  lines.push(
    "High-frequency traps: S-V with modifiers; relative-clause verb↔antecedent; There/inversion; past vs present perfect; time/condition clause tense; modal+have p.p.; subjunctive; active/passive (+ to-V/gerund voice); participle -ing/-ed; verb vs verbal; to-V vs V-ing; object complement; parallel; comparison; adj vs adv; prep vs conj; that vs what / relative vs adverb."
  );

  return lines.join("\n");
}

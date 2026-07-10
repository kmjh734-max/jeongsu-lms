/**
 * 『처음 만나는 수능 어법』 스타터(입문) 교재 기반 어법 출제 카탈로그.
 * 어법 문항의 오류·정답 포인트는 이 목록의 UNIT/Point만 사용한다.
 */

export const GRAMMAR_TEXTBOOK_TITLE =
  "처음 만나는 수능 어법 스타터(입문)";

export type GrammarUnit = {
  unit: number;
  title: string;
  points: Array<{ id: string; title: string; traps: string[] }>;
  /** 교재 ‘결정적 출제 어법’ */
  examFocus: string[];
};

export const GRAMMAR_UNITS: GrammarUnit[] = [
  {
    unit: 1,
    title: "주어 동사 수 일치",
    examFocus: [
      "단수/복수 주어 + 수식어구 + 단수/복수 동사 (수식어 끝 명사와 혼동 금지)",
      "단수/복수 취급 주어 (동명사 주어 단수, -thing/-one/-body, A and B, There are 등)",
    ],
    points: [
      {
        id: "1-1",
        title: "단수 주어 + (수식어구) + 단수 동사",
        traps: [
          "전치사구·분사구·관계사절 끝 복수 명사에 동사를 맞추는 오류",
        ],
      },
      {
        id: "1-2",
        title: "복수 주어 + (수식어구) + 복수 동사",
        traps: ["수식어 끝 단수 명사에 동사를 맞추는 오류"],
      },
      {
        id: "1-3",
        title: "단수 취급하는 주어와 동사",
        traps: [
          "동명사/to부정사 주어, 학과·국가명, 시간·거리·금액, -thing/-one/-body → 단수",
        ],
      },
      {
        id: "1-4",
        title: "복수 취급하는 주어와 동사",
        traps: ["A and B, 쌍을 이루는 명사, There are + 복수"],
      },
    ],
  },
  {
    unit: 2,
    title: "동사의 시제",
    examFocus: [
      "시간·조건 부사절에서 미래 대신 현재시제",
      "과거 vs 현재완료 (yesterday/ago/last vs just/already/since/for)",
    ],
    points: [
      {
        id: "2-1",
        title: "단순시제 - 현재 / 과거 / 미래",
        traps: ["when/if/unless 등 부사절에 will 사용"],
      },
      {
        id: "2-2",
        title: "진행시제 - 현재진행 / 과거진행 / 미래진행",
        traps: ["상태동사 진행형, 시점과 안 맞는 진행"],
      },
      {
        id: "2-3",
        title: "완료시제 - 현재완료 / 과거완료",
        traps: ["과거완료 필요 시점에 단순과거, 또는 그 반대"],
      },
      {
        id: "2-4",
        title: "과거 vs. 현재완료",
        traps: ["과거 부사와 현재완료, 완료 부사와 단순과거"],
      },
    ],
  },
  {
    unit: 3,
    title: "조동사",
    examFocus: [
      "능력·허가·의무 조동사 의미",
      "과거 습관 used to / would",
      "조동사 + have p.p.",
      "주장·요구·명령·제안 that절의 should (또는 원형)",
    ],
    points: [
      {
        id: "3-1",
        title: "능력, 허가, 의무 등의 조동사",
        traps: ["can/may/must/should/have to 혼동, 조동사 뒤 원형 위반"],
      },
      {
        id: "3-2",
        title: "과거 습관의 조동사",
        traps: ["used to / would 형태·의미 오류"],
      },
      {
        id: "3-3",
        title: "조동사 + have p.p.",
        traps: ["should have / must have / could have 형태 오류"],
      },
      {
        id: "3-4",
        title: "주장, 요구, 명령, 제안의 should",
        traps: ["suggest/insist/demand that절에 일반 시제·인칭변화"],
      },
    ],
  },
  {
    unit: 4,
    title: "가정법",
    examFocus: [
      "가정법 과거 vs 과거완료 구분",
      "I wish / as if 가정법",
    ],
    points: [
      {
        id: "4-1",
        title: "가정법 과거",
        traps: ["현재 반대 사실에 were/과거형 + would 형태 오류"],
      },
      {
        id: "4-2",
        title: "가정법 과거완료",
        traps: ["과거 반대 사실에 had p.p. + would have p.p. 오류"],
      },
      {
        id: "4-3",
        title: "I wish 가정법",
        traps: ["wish 뒤 시제·가정법 형태 오류"],
      },
      {
        id: "4-4",
        title: "as if 가정법",
        traps: ["as if 뒤 가정법 vs 직설법 혼동"],
      },
    ],
  },
  {
    unit: 5,
    title: "태",
    examFocus: [
      "능동태 vs 수동태 (주어가 행위자인지 대상인지)",
      "4·5형식 수동, 진행·완료 수동",
      "수동 불가 동사·혼동 동사",
    ],
    points: [
      {
        id: "5-1",
        title: "능동태 vs. 수동태",
        traps: ["타동사 목적어가 주어인데 능동, 또는 그 반대"],
      },
      {
        id: "5-2",
        title: "4형식과 5형식의 수동태",
        traps: ["간·직목 수동, 목적격보어 유지 오류"],
      },
      {
        id: "5-3",
        title: "진행시제와 완료시제의 수동태",
        traps: ["is being / has been + p.p. 형태 오류"],
      },
      {
        id: "5-4",
        title: "주의해야 할 수동태",
        traps: ["자동사·상태·소유 동사 수동, happen/occur/belong 등"],
      },
    ],
  },
  {
    unit: 6,
    title: "to부정사와 동명사",
    examFocus: [
      "동사 목적어 자리의 to-V / V-ing",
      "to-V vs V-ing 의미 구분 (remember/stop/try 등)",
      "5형식 목적격보어 to-V vs 원형부정사",
    ],
    points: [
      {
        id: "6-1",
        title: "동사와 준동사",
        traps: ["목적어 자리에 동사 원형·시제 동사 사용"],
      },
      {
        id: "6-2",
        title: "동사의 목적어: to부정사 / 동명사",
        traps: ["want/hope → to-V, enjoy/avoid → V-ing 혼동"],
      },
      {
        id: "6-3",
        title: "to부정사/동명사 형태의 의미 구분",
        traps: ["remember/forget/stop/try/regret 의미 혼동"],
      },
      {
        id: "6-4",
        title: "목적격보어로 쓰이는 to부정사와 원형부정사",
        traps: ["make/let/have + 원형, ask/want/force + to-V 혼동"],
      },
    ],
  },
  {
    unit: 7,
    title: "분사와 분사구문",
    examFocus: [
      "수식·보어·분사구문에서 능동(현재분사) vs 수동(과거분사)",
    ],
    points: [
      {
        id: "7-1",
        title: "명사를 수식하는 현재분사와 과거분사",
        traps: ["수식 대상과의 능동/수동 관계 오류 (interesting/interested 류)"],
      },
      {
        id: "7-2",
        title: "보어로 사용되는 현재분사와 과거분사",
        traps: ["보어 분사의 능동/수동 혼동"],
      },
      {
        id: "7-3",
        title: "분사구문(현재분사)",
        traps: ["주절 주어와 능동 관계인데 과거분사"],
      },
      {
        id: "7-4",
        title: "분사구문(과거분사)",
        traps: ["주절 주어와 수동 관계인데 현재분사"],
      },
    ],
  },
  {
    unit: 8,
    title: "관계사",
    examFocus: [
      "관계대명사 격 (주격/목적격/소유격)",
      "that vs what",
      "관계대명사(불완전절) vs 관계부사(완전절)",
    ],
    points: [
      {
        id: "8-1",
        title: "관계대명사의 격",
        traps: ["who/whom/whose/which 격 오류"],
      },
      {
        id: "8-2",
        title: "관계대명사의 계속적 용법",
        traps: ["계속적 용법에 that, 콤마 뒤 which/who 혼동"],
      },
      {
        id: "8-3",
        title: "전치사 + 관계대명사",
        traps: ["전치사 뒤 who/that, 전치사 탈락·중복"],
      },
      {
        id: "8-4",
        title: "관계대명사 that vs. what",
        traps: ["선행사 있는 what, 선행사 없는 that"],
      },
      {
        id: "8-5",
        title: "관계부사",
        traps: ["where/when/why/how 선택 오류"],
      },
      {
        id: "8-6",
        title: "관계대명사 vs. 관계부사",
        traps: ["완전절에 which, 불완전절에 where"],
      },
    ],
  },
  {
    unit: 9,
    title: "접속사",
    examFocus: [
      "명사절 that vs 관계대명사 what",
      "부사절 종속접속사",
      "접속사 vs 전치사",
      "등위·상관접속사 병렬구조",
    ],
    points: [
      {
        id: "9-1",
        title: "명사절을 이끄는 접속사 that / 관계대명사 what",
        traps: ["완전절에 what, 불완전절에 that"],
      },
      {
        id: "9-2",
        title: "부사절을 이끄는 종속접속사",
        traps: ["although/despite, because/because of 혼동 전조"],
      },
      {
        id: "9-3",
        title: "접속사와 전치사",
        traps: ["during/while, despite/although, because of/because"],
      },
      {
        id: "9-4",
        title: "접속사의 병렬구조",
        traps: ["and/or/but, both A and B, not only A but also B 형태 불일치"],
      },
    ],
  },
  {
    unit: 10,
    title: "명사와 대명사",
    examFocus: [
      "가산 vs 불가산",
      "명사-대명사 수·성 일치",
      "지시·부정대명사, 인칭·재귀대명사",
    ],
    points: [
      {
        id: "10-1",
        title: "셀 수 있는 명사, 셀 수 없는 명사",
        traps: ["정보·조언 등 불가산에 a/many, 가산에 much"],
      },
      {
        id: "10-2",
        title: "명사와 대명사의 일치",
        traps: ["단수 명사 → they, 복수 → it"],
      },
      {
        id: "10-3",
        title: "지시대명사, 부정대명사",
        traps: ["this/that/these/those, one/ones, another/other/others"],
      },
      {
        id: "10-4",
        title: "인칭대명사, 재귀대명사",
        traps: ["목적격/소유격 혼동, 재귀대명사 불필요·누락"],
      },
    ],
  },
  {
    unit: 11,
    title: "형용사와 부사",
    examFocus: [
      "보어 자리 형용사 vs 동사 수식 부사",
      "형태 동일·-ly로 뜻 달라지는 형용사/부사",
      "부정 의미 부사와 not 중복",
    ],
    points: [
      {
        id: "11-1",
        title: "형용사",
        traps: ["보어·명사 수식 자리에 부사"],
      },
      {
        id: "11-2",
        title: "부사",
        traps: ["동사·형용사·부사 수식 자리에 형용사"],
      },
      {
        id: "11-3",
        title: "주의해야 할 형용사 / 부사",
        traps: ["hard/hardly, late/lately, high/highly 등 의미 혼동"],
      },
      {
        id: "11-4",
        title: "부정의 의미가 있는 부사",
        traps: ["hardly/rarely/seldom + not 이중부정"],
      },
    ],
  },
  {
    unit: 12,
    title: "비교",
    examFocus: [
      "원급 as…as / 비교급 -er than / 최상급 the -est",
      "비교급 강조 (much/even/far — very 불가)",
      "비교 대상 병렬구조",
    ],
    points: [
      {
        id: "12-1",
        title: "형용사/부사의 원급",
        traps: ["as + 원급 + as 형태 오류"],
      },
      {
        id: "12-2",
        title: "형용사/부사의 비교급",
        traps: ["more + -er 중복, than 누락"],
      },
      {
        id: "12-3",
        title: "형용사/부사의 최상급",
        traps: ["the 누락, most + -est 중복"],
      },
      {
        id: "12-4",
        title: "비교급의 강조 표현",
        traps: ["very + 비교급"],
      },
      {
        id: "12-5",
        title: "비교구문의 병렬구조",
        traps: ["비교 대상 품사·구조 불일치"],
      },
    ],
  },
  {
    unit: 13,
    title: "특수구문",
    examFocus: [
      "It ~ that 강조구문",
      "도치",
      "부정어 + 전체 표현",
      "간접의문문 어순 (의문사 + 주어 + 동사)",
    ],
    points: [
      {
        id: "13-1",
        title: "강조",
        traps: ["It is/was … that 강조구문 형태 오류"],
      },
      {
        id: "13-2",
        title: "도치",
        traps: ["부정어 앞세움 뒤 어순 오류"],
      },
      {
        id: "13-3",
        title: "부정",
        traps: ["not all / all … not 부분부정 혼동"],
      },
      {
        id: "13-4",
        title: "간접의문문",
        traps: ["간접의문문에 도치(조동사+주어) 유지"],
      },
    ],
  },
];

/** 프롬프트에 넣을 압축 카탈로그 (토큰 절약) */
export function grammarCatalogPromptBlock(): string {
  const lines: string[] = [
    `GRAMMAR SOURCE: ${GRAMMAR_TEXTBOOK_TITLE} — ONLY these units/points.`,
    "Every WRONG underline MUST map to one Point below. Correct underlines may look like the same points but be actually right.",
    "Ban nonsense words, spelling tricks, and grammar points outside this list.",
    "In explanation (Korean): for each wrong letter cite UNIT number + Point title (e.g. 「UNIT 01 수일치 · 수식어구」).",
    "",
  ];

  for (const u of GRAMMAR_UNITS) {
    lines.push(`UNIT ${String(u.unit).padStart(2, "0")} ${u.title}`);
    lines.push(`  출제초점: ${u.examFocus.join(" / ")}`);
    for (const p of u.points) {
      lines.push(`  · ${p.title} — traps: ${p.traps.join("; ")}`);
    }
  }

  lines.push("");
  lines.push(
    "Coverage tip: across ⓐ~ⓔ/ⓕ prefer 2+ different UNITs when the passage allows (e.g. 수일치 + 관계사 + 태)."
  );
  lines.push(
    "Priority exam traps (교재 결정적 출제): S-V with modifiers; time/condition clause tense; modal+have p.p.; subjunctive past vs past perfect; active/passive; to-V vs V-ing; participle voice; relative case / that vs what / relative vs adverb; conjunction vs preposition / parallel; countable; adj vs adv; comparison form; It-cleft; indirect question word order."
  );

  return lines.join("\n");
}

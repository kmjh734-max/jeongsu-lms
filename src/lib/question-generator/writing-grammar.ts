/**
 * 조건 영작에 쓰는 어법 목록.
 *
 * 선생님 지적(2026-09-28): 「반드시 등위 병렬을 사용할 것」처럼 말이 안 되는 조건이 나왔다.
 * 지금까지는 1장 요약자료의 「어법 고르기」 목록을 그대로 썼는데, 고르는 문항과 직접
 * 만들어 내는 영작은 기준이 다르다. 그래서 영작 조건으로 말이 되는 것만 따로 모은다.
 * 수일치·대명사 선행사처럼 「틀린 곳 고르기」에만 쓰는 것은 여기에 넣지 않는다.
 *
 * label     — 조건에 그대로 적는 이름
 * form      — 이름 뒤 괄호에 붙이는 형태. 학생이 무엇을 쓸지 바로 알게 한다.
 * hint      — 화면에서 범위를 고를 때 보여 주는 한 줄 설명
 *
 * 시험지 <조건>에는 이름과 형태만 싣는다. 선생님 지적(2026-09-28): 「선행사를 쓰지 말고
 * what으로 시작할 것」 같은 설명까지 적으면 답을 알려 주는 셈이라 필요 없다.
 */
export type WritingGrammar = {
  label: string;
  form: string;
  hint: string;
};

export const WRITING_GRAMMARS: WritingGrammar[] = [
  // ── 동사의 꼴 ──
  {
    label: "수동태",
    form: "be + p.p.",
    hint: "주어가 동작을 당하는 쪽이면 be동사 뒤에 과거분사를 쓴다.",
  },
  {
    label: "시간·조건 부사절의 현재시제",
    form: "when/if + 현재동사",
    hint: "when·if·before가 이끄는 부사절은 미래의 일이라도 현재시제로 쓴다.",
  },
  {
    label: "당위의 should",
    form: "suggest/insist + that + (should) 동사원형",
    hint: "요구·제안·주장 동사의 that절에는 동사원형을 쓴다(should는 생략 가능).",
  },

  // ── 가정법·도치·강조 ──
  {
    label: "가정법 과거",
    form: "If + 과거동사, 주어 + would/could + 동사원형",
    hint: "지금 사실과 반대되는 일을 가정한다.",
  },
  {
    label: "가정법 과거완료",
    form: "If + had p.p., 주어 + would have p.p.",
    hint: "지난 사실과 반대되는 일을 가정한다.",
  },
  {
    label: "부정어 도치",
    form: "Never/Not only + 조동사 + 주어",
    hint: "부정어가 문장 맨 앞에 오면 주어와 (조)동사의 자리가 바뀐다.",
  },
  {
    label: "It - that 강조구문",
    form: "It is ~ that …",
    hint: "강조할 말을 It is와 that 사이에 넣는다.",
  },

  // ── 관계사 ──
  {
    label: "관계대명사",
    form: "who / which / that",
    hint: "앞의 명사를 꾸미는 절을 이끈다. 절 안에 주어나 목적어가 비어 있다.",
  },
  {
    label: "관계대명사 what",
    form: "what + 불완전한 절",
    hint: "꾸밀 명사가 앞에 없을 때 쓴다. 그 자체가 명사 노릇을 한다.",
  },
  {
    label: "관계부사",
    form: "where / when / why / how",
    hint: "장소·때·까닭을 나타내는 명사 뒤에 완전한 절이 온다.",
  },
  {
    label: "관계대명사 계속적 용법",
    form: "…, which / …, who",
    hint: "콤마 뒤에 덧붙여 설명한다. that은 쓸 수 없다.",
  },

  // ── 준동사 ──
  {
    label: "분사구문",
    form: "V-ing …, 주어 + 동사",
    hint: "접속사와 주어를 없애고 분사로 줄인 부사구.",
  },
  {
    label: "감정분사",
    form: "-ing / -ed",
    hint: "감정을 일으키는 쪽은 V-ing, 느끼는 쪽은 과거분사를 쓴다.",
  },
  {
    label: "명사 수식 분사",
    form: "V-ing / p.p. + 명사",
    hint: "꾸밈받는 명사가 하는 쪽이면 V-ing, 당하는 쪽이면 과거분사.",
  },
  {
    label: "목적격보어 to부정사",
    form: "allow/expect/ask + 목적어 + to V",
    hint: "이 동사들은 목적어 뒤에 to부정사를 데려온다.",
  },
  {
    label: "사역동사",
    form: "make/have/let + 목적어 + 동사원형",
    hint: "시키는 뜻의 동사 뒤에는 to 없는 동사원형이 온다.",
  },
  {
    label: "지각동사",
    form: "see/hear/watch + 목적어 + 동사원형 / V-ing",
    hint: "보고 듣는 동사 뒤에는 동사원형이나 -ing가 온다.",
  },
  {
    label: "동명사 목적어",
    form: "enjoy/avoid/finish + V-ing",
    hint: "이 동사들은 목적어로 동명사만 받는다.",
  },
  {
    label: "가주어 it, 진주어 to부정사",
    form: "It is ~ to V",
    hint: "to부정사 주어가 길 때 it을 앞에 세우고 뒤로 보낸다.",
  },
  {
    label: "to부정사 의미상 주어",
    form: "for + 목적격 + to V",
    hint: "to부정사의 행위자가 문장 주어와 다를 때 for로 밝힌다.",
  },

  // ── 비교·구문 ──
  {
    label: "as ~ as 원급 비교",
    form: "as + 원급 + as",
    hint: "두 대상이 같은 정도임을 나타낸다. 사이에는 원급을 쓴다.",
  },
  {
    label: "비교급 than",
    form: "비교급 + than",
    hint: "두 대상을 견준다. -er 또는 more를 쓰고 than으로 잇는다.",
  },
  {
    label: "the + 비교급, the + 비교급",
    form: "The 비교급 …, the 비교급 …",
    hint: "하나가 더할수록 다른 하나도 더하다는 뜻.",
  },
  {
    label: "so ~ that / such ~ that",
    form: "so + 형용사·부사 + that / such + 명사 + that",
    hint: "너무 ~해서 …하다. so 뒤에는 형용사·부사, such 뒤에는 명사가 온다.",
  },
  {
    label: "too ~ to V / enough to V",
    form: "too + 형용사 + to V / 형용사 + enough + to V",
    hint: "너무 ~해서 못 한다, ~할 만큼 충분하다.",
  },

  // ── 그 밖 ──
  {
    label: "간접의문문 어순",
    form: "의문사 + 주어 + 동사",
    hint: "의문사절이 다른 문장 안에 들어가면 평서문 어순이 된다.",
  },
  {
    label: "재귀대명사",
    form: "-self / -selves",
    hint: "목적어가 주어와 같은 대상이면 재귀대명사를 쓴다.",
  },
];

/** 프롬프트에 싣는 목록 — 이름(형태) — 설명 */
export const WRITING_GRAMMAR_LIST = WRITING_GRAMMARS.map(
  (g) => `  · ${g.label}(${g.form}) — ${g.hint}`
).join("\n");

/**
 * 영어로 끝나는 이름은 읽는 소리로 받침을 따진다.
 * should는 「슈드」라 받침이 없어 '를', what은 「왓」이라 '을'.
 */
const LATIN_TAIL_PARTICLE: Record<string, "을" | "를"> = {
  should: "를",
  v: "를",
  what: "을",
  that: "을",
  than: "을",
  it: "을",
};

/** 「강조구문을」·「도치를」 — 받침에 따라 조사를 고른다 */
export function objectParticle(word: string): "을" | "를" {
  const trimmed = word.trim();
  const last = trimmed.slice(-1);
  const code = last.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) {
    return (code - 0xac00) % 28 === 0 ? "를" : "을";
  }
  const tail = trimmed.match(/[A-Za-z]+$/)?.[0]?.toLowerCase() ?? "";
  return LATIN_TAIL_PARTICLE[tail] ?? "을";
}

/**
 * 조건 첫 줄에서 어떤 어법을 시켰는지 찾아낸다.
 * 이름이 겹치는 것들이 있어(관계대명사 ↔ 관계대명사 what) 긴 이름부터 맞춰 본다.
 */
export function findWritingGrammar(conditionLine: string): WritingGrammar | null {
  const line = conditionLine || "";
  const byLength = [...WRITING_GRAMMARS].sort((a, b) => b.label.length - a.label.length);
  return byLength.find((g) => line.includes(g.label)) ?? null;
}

/**
 * 『천일문 기본』 PART / CHAPTER / UNIT 분류체계.
 * 책 내용을 복사하지 않고 목차·용어 분류만 관리한다.
 */

export type CheonilmunPart = {
  partNumber: number;
  partTitle: string;
};

export type CheonilmunChapter = {
  partNumber: number;
  chapterNumber: number;
  chapterTitle: string;
};

export type CheonilmunUnit = {
  unitNumber: number;
  unitTitle: string;
  chapterNumber: number;
  partNumber: number;
};

export type CheonilmunFurtherStudy = {
  title: string;
  chapterNumber: number;
  partNumber: number;
  afterUnitNumber: number | null;
};

export type CheonilmunClassification = {
  partNumber: number;
  partTitle: string;
  chapterNumber: number;
  chapterTitle: string;
  unitNumber: number | null;
  unitTitle: string;
  isFurtherStudy?: boolean;
  isOffCatalog?: boolean;
};

export const CHEONILMUN_BASIC_PARTS: CheonilmunPart[] = [
  { partNumber: 1, partTitle: "문장의 구성" },
  { partNumber: 2, partTitle: "서술어의 이해" },
  { partNumber: 3, partTitle: "수식어구의 이해: 준동사 중심" },
  { partNumber: 4, partTitle: "문장의 확장" },
  { partNumber: 5, partTitle: "주요 구문" },
];

export const CHEONILMUN_BASIC_CHAPTERS: CheonilmunChapter[] = [
  { partNumber: 1, chapterNumber: 1, chapterTitle: "동사와 문장의 기본 구조" },
  { partNumber: 1, chapterNumber: 2, chapterTitle: "주어의 이해" },
  { partNumber: 1, chapterNumber: 3, chapterTitle: "목적어의 이해" },
  { partNumber: 1, chapterNumber: 4, chapterTitle: "보어의 이해" },
  { partNumber: 2, chapterNumber: 5, chapterTitle: "동사의 시제" },
  { partNumber: 2, chapterNumber: 6, chapterTitle: "동사에 의미를 더하는 조동사" },
  { partNumber: 2, chapterNumber: 7, chapterTitle: "동사의 태" },
  { partNumber: 2, chapterNumber: 8, chapterTitle: "가정법" },
  { partNumber: 3, chapterNumber: 9, chapterTitle: "수식어구: to부정사, 분사" },
  { partNumber: 3, chapterNumber: 10, chapterTitle: "분사구문" },
  { partNumber: 4, chapterNumber: 11, chapterTitle: "등위절과 병렬구조" },
  { partNumber: 4, chapterNumber: 12, chapterTitle: "관계사절" },
  { partNumber: 4, chapterNumber: 13, chapterTitle: "부사절" },
  { partNumber: 5, chapterNumber: 14, chapterTitle: "전명구를 동반하는 동사구문" },
  { partNumber: 5, chapterNumber: 15, chapterTitle: "비교구문" },
  { partNumber: 5, chapterNumber: 16, chapterTitle: "특수구문" },
];

/** Unit 01–101 (빠짐·중복 없음) */
export const CHEONILMUN_BASIC_UNITS: CheonilmunUnit[] = [
  // CH01
  { unitNumber: 1, unitTitle: "SV", chapterNumber: 1, partNumber: 1 },
  { unitNumber: 2, unitTitle: "SVA", chapterNumber: 1, partNumber: 1 },
  { unitNumber: 3, unitTitle: "SVC", chapterNumber: 1, partNumber: 1 },
  { unitNumber: 4, unitTitle: "SVO/SVOA", chapterNumber: 1, partNumber: 1 },
  { unitNumber: 5, unitTitle: "SVOO", chapterNumber: 1, partNumber: 1 },
  { unitNumber: 6, unitTitle: "SVOC", chapterNumber: 1, partNumber: 1 },
  { unitNumber: 7, unitTitle: "주의해야 할 동사와 문형", chapterNumber: 1, partNumber: 1 },
  // CH02
  { unitNumber: 8, unitTitle: "명사구 주어", chapterNumber: 2, partNumber: 1 },
  { unitNumber: 9, unitTitle: "명사절 주어Ⅰ", chapterNumber: 2, partNumber: 1 },
  { unitNumber: 10, unitTitle: "명사절 주어Ⅱ", chapterNumber: 2, partNumber: 1 },
  { unitNumber: 11, unitTitle: "가주어 it", chapterNumber: 2, partNumber: 1 },
  { unitNumber: 12, unitTitle: "to부정사의 의미상의 주어", chapterNumber: 2, partNumber: 1 },
  { unitNumber: 13, unitTitle: "동명사의 의미상의 주어", chapterNumber: 2, partNumber: 1 },
  { unitNumber: 14, unitTitle: "it을 주어로 하는 구문", chapterNumber: 2, partNumber: 1 },
  // CH03
  { unitNumber: 15, unitTitle: "to부정사/동명사 목적어Ⅰ", chapterNumber: 3, partNumber: 1 },
  { unitNumber: 16, unitTitle: "to부정사/동명사 목적어Ⅱ", chapterNumber: 3, partNumber: 1 },
  { unitNumber: 17, unitTitle: "명사절 목적어", chapterNumber: 3, partNumber: 1 },
  { unitNumber: 18, unitTitle: "재귀대명사 목적어", chapterNumber: 3, partNumber: 1 },
  { unitNumber: 19, unitTitle: "전치사의 목적어", chapterNumber: 3, partNumber: 1 },
  { unitNumber: 20, unitTitle: "가목적어 it", chapterNumber: 3, partNumber: 1 },
  // CH04
  { unitNumber: 21, unitTitle: "다양한 주격보어", chapterNumber: 4, partNumber: 1 },
  { unitNumber: 22, unitTitle: "to부정사 목적격보어", chapterNumber: 4, partNumber: 1 },
  { unitNumber: 23, unitTitle: "원형부정사(v) 목적격보어", chapterNumber: 4, partNumber: 1 },
  { unitNumber: 24, unitTitle: "현재분사(v-ing) 목적격보어", chapterNumber: 4, partNumber: 1 },
  { unitNumber: 25, unitTitle: "과거분사(p.p.) 목적격보어", chapterNumber: 4, partNumber: 1 },
  { unitNumber: 26, unitTitle: "have + 목적어 + p.p.", chapterNumber: 4, partNumber: 1 },
  // CH05
  { unitNumber: 27, unitTitle: "현재시제의 다양한 의미", chapterNumber: 5, partNumber: 2 },
  { unitNumber: 28, unitTitle: "미래를 나타내는 표현", chapterNumber: 5, partNumber: 2 },
  { unitNumber: 29, unitTitle: "현재완료형/현재완료 진행형", chapterNumber: 5, partNumber: 2 },
  { unitNumber: 30, unitTitle: "과거완료형/미래완료형", chapterNumber: 5, partNumber: 2 },
  { unitNumber: 31, unitTitle: "to부정사/동명사의 완료형", chapterNumber: 5, partNumber: 2 },
  // CH06
  { unitNumber: 32, unitTitle: "능력(Ability)/허가(Permission)", chapterNumber: 6, partNumber: 2 },
  { unitNumber: 33, unitTitle: "충고(Advisability)/의무(Necessity)", chapterNumber: 6, partNumber: 2 },
  { unitNumber: 34, unitTitle: "현재나 미래에 대한 가능성/추측", chapterNumber: 6, partNumber: 2 },
  { unitNumber: 35, unitTitle: "과거에 대한 가능성/추측/후회", chapterNumber: 6, partNumber: 2 },
  { unitNumber: 36, unitTitle: "should의 특별한 쓰임", chapterNumber: 6, partNumber: 2 },
  { unitNumber: 37, unitTitle: "자주 보이는 조동사 표현", chapterNumber: 6, partNumber: 2 },
  // CH07
  { unitNumber: 38, unitTitle: "3문형/4문형의 수동태", chapterNumber: 7, partNumber: 2 },
  { unitNumber: 39, unitTitle: "5문형의 수동태", chapterNumber: 7, partNumber: 2 },
  { unitNumber: 40, unitTitle: "조동사/시제와 결합된 수동태", chapterNumber: 7, partNumber: 2 },
  { unitNumber: 41, unitTitle: "형태에 유의해야 할 수동태", chapterNumber: 7, partNumber: 2 },
  { unitNumber: 42, unitTitle: "명령문/의문문 수동태", chapterNumber: 7, partNumber: 2 },
  { unitNumber: 43, unitTitle: "to부정사/동명사의 수동형", chapterNumber: 7, partNumber: 2 },
  // CH08
  { unitNumber: 44, unitTitle: "if + 가정법 과거", chapterNumber: 8, partNumber: 2 },
  { unitNumber: 45, unitTitle: "if + should/were to", chapterNumber: 8, partNumber: 2 },
  { unitNumber: 46, unitTitle: "if + 가정법 과거완료/혼합가정법", chapterNumber: 8, partNumber: 2 },
  { unitNumber: 47, unitTitle: "if 생략 도치구문", chapterNumber: 8, partNumber: 2 },
  { unitNumber: 48, unitTitle: "S + wish + 가정법", chapterNumber: 8, partNumber: 2 },
  { unitNumber: 49, unitTitle: "as if + 가정법", chapterNumber: 8, partNumber: 2 },
  { unitNumber: 50, unitTitle: "가정법을 이끄는 표현", chapterNumber: 8, partNumber: 2 },
  // CH09
  { unitNumber: 51, unitTitle: "to부정사의 형용사적 수식", chapterNumber: 9, partNumber: 3 },
  { unitNumber: 52, unitTitle: "분사(v-ing/p.p.)의 형용사적 수식", chapterNumber: 9, partNumber: 3 },
  { unitNumber: 53, unitTitle: "감정 분사(v-ing/p.p.)의 형용사적 수식", chapterNumber: 9, partNumber: 3 },
  { unitNumber: 54, unitTitle: "to부정사의 부사적 수식Ⅰ", chapterNumber: 9, partNumber: 3 },
  { unitNumber: 55, unitTitle: "to부정사의 부사적 수식Ⅱ", chapterNumber: 9, partNumber: 3 },
  { unitNumber: 56, unitTitle: "to부정사가 만드는 주요 구문", chapterNumber: 9, partNumber: 3 },
  // CH10
  { unitNumber: 57, unitTitle: "분사구문의 의미", chapterNumber: 10, partNumber: 3 },
  { unitNumber: 58, unitTitle: "주의해야 할 분사구문의 형태", chapterNumber: 10, partNumber: 3 },
  { unitNumber: 59, unitTitle: "주의해야 할 분사구문의 의미상의 주어", chapterNumber: 10, partNumber: 3 },
  // CH11
  { unitNumber: 60, unitTitle: "등위접속사 and/but/or/for/nor/yet", chapterNumber: 11, partNumber: 4 },
  { unitNumber: 61, unitTitle: "병렬구조", chapterNumber: 11, partNumber: 4 },
  { unitNumber: 62, unitTitle: "both A and B 등", chapterNumber: 11, partNumber: 4 },
  { unitNumber: 63, unitTitle: "one/another/the other가 만드는 표현", chapterNumber: 11, partNumber: 4 },
  // CH12
  { unitNumber: 64, unitTitle: "주격/소유격 관계대명사", chapterNumber: 12, partNumber: 4 },
  { unitNumber: 65, unitTitle: "목적격 관계대명사", chapterNumber: 12, partNumber: 4 },
  { unitNumber: 66, unitTitle: "관계부사", chapterNumber: 12, partNumber: 4 },
  { unitNumber: 67, unitTitle: "관계사와 생략", chapterNumber: 12, partNumber: 4 },
  { unitNumber: 68, unitTitle: "선행사와 떨어진 관계사절", chapterNumber: 12, partNumber: 4 },
  { unitNumber: 69, unitTitle: "명사절을 이끄는 관계대명사 what", chapterNumber: 12, partNumber: 4 },
  { unitNumber: 70, unitTitle: "명사절을 이끄는 복합관계대명사", chapterNumber: 12, partNumber: 4 },
  { unitNumber: 71, unitTitle: "선행사를 보충 설명하는 관계사절Ⅰ", chapterNumber: 12, partNumber: 4 },
  { unitNumber: 72, unitTitle: "선행사를 보충 설명하는 관계사절Ⅱ", chapterNumber: 12, partNumber: 4 },
  // CH13
  { unitNumber: 73, unitTitle: "시간을 나타내는 부사절Ⅰ", chapterNumber: 13, partNumber: 4 },
  { unitNumber: 74, unitTitle: "시간을 나타내는 부사절Ⅱ", chapterNumber: 13, partNumber: 4 },
  { unitNumber: 75, unitTitle: "이유/원인을 나타내는 부사절", chapterNumber: 13, partNumber: 4 },
  { unitNumber: 76, unitTitle: "조건을 나타내는 부사절", chapterNumber: 13, partNumber: 4 },
  { unitNumber: 77, unitTitle: "양보/대조를 나타내는 부사절Ⅰ", chapterNumber: 13, partNumber: 4 },
  { unitNumber: 78, unitTitle: "양보/대조를 나타내는 부사절Ⅱ", chapterNumber: 13, partNumber: 4 },
  { unitNumber: 79, unitTitle: "목적/결과를 나타내는 부사절", chapterNumber: 13, partNumber: 4 },
  { unitNumber: 80, unitTitle: "양태를 나타내는 부사절", chapterNumber: 13, partNumber: 4 },
  // CH14
  { unitNumber: 81, unitTitle: "동사 A from B", chapterNumber: 14, partNumber: 5 },
  { unitNumber: 82, unitTitle: "동사 A for B", chapterNumber: 14, partNumber: 5 },
  { unitNumber: 83, unitTitle: "동사 A as B", chapterNumber: 14, partNumber: 5 },
  { unitNumber: 84, unitTitle: "동사 A of B", chapterNumber: 14, partNumber: 5 },
  { unitNumber: 85, unitTitle: "동사 A to B", chapterNumber: 14, partNumber: 5 },
  { unitNumber: 86, unitTitle: "동사 A with B", chapterNumber: 14, partNumber: 5 },
  // CH15
  { unitNumber: 87, unitTitle: "원급 구문Ⅰ", chapterNumber: 15, partNumber: 5 },
  { unitNumber: 88, unitTitle: "원급 구문Ⅱ", chapterNumber: 15, partNumber: 5 },
  { unitNumber: 89, unitTitle: "비교급 구문Ⅰ", chapterNumber: 15, partNumber: 5 },
  { unitNumber: 90, unitTitle: "비교급 구문Ⅱ", chapterNumber: 15, partNumber: 5 },
  { unitNumber: 91, unitTitle: "혼동하기 쉬운 비교급 구문Ⅰ", chapterNumber: 15, partNumber: 5 },
  { unitNumber: 92, unitTitle: "혼동하기 쉬운 비교급 구문Ⅱ", chapterNumber: 15, partNumber: 5 },
  { unitNumber: 93, unitTitle: "최상급 구문", chapterNumber: 15, partNumber: 5 },
  // CH16
  { unitNumber: 94, unitTitle: "도치구문", chapterNumber: 16, partNumber: 5 },
  { unitNumber: 95, unitTitle: "강조구문", chapterNumber: 16, partNumber: 5 },
  { unitNumber: 96, unitTitle: "생략구문", chapterNumber: 16, partNumber: 5 },
  { unitNumber: 97, unitTitle: "공통구문", chapterNumber: 16, partNumber: 5 },
  { unitNumber: 98, unitTitle: "삽입구문", chapterNumber: 16, partNumber: 5 },
  { unitNumber: 99, unitTitle: "동격구문", chapterNumber: 16, partNumber: 5 },
  { unitNumber: 100, unitTitle: "부정구문", chapterNumber: 16, partNumber: 5 },
  { unitNumber: 101, unitTitle: "주어를 부사로 해석해야 하는 구문", chapterNumber: 16, partNumber: 5 },
];

export const CHEONILMUN_BASIC_FURTHER_STUDIES: CheonilmunFurtherStudy[] = [
  { title: "부사 역할을 하는 명사", chapterNumber: 1, partNumber: 1, afterUnitNumber: 2 },
  { title: "명사를 뒤에서 수식하는 형용사(구)", chapterNumber: 1, partNumber: 1, afterUnitNumber: 3 },
  { title: "의미상의 주어를 별도로 나타내지 않는 경우", chapterNumber: 2, partNumber: 1, afterUnitNumber: 13 },
  { title: "주의해야 할 전치사의 목적어", chapterNumber: 3, partNumber: 1, afterUnitNumber: 19 },
  { title: "목적어와 목적격보어 to-v/v/v-ing", chapterNumber: 4, partNumber: 1, afterUnitNumber: 22 },
  { title: "현재완료의 이해", chapterNumber: 5, partNumber: 2, afterUnitNumber: 29 },
  { title: "should와 ought to", chapterNumber: 6, partNumber: 2, afterUnitNumber: 34 },
  { title: "수동태의 관용적 표현", chapterNumber: 7, partNumber: 2, afterUnitNumber: 39 },
  { title: "콤마/콜론/대시/소괄호/세미콜론", chapterNumber: 11, partNumber: 4, afterUnitNumber: 63 },
  { title: "관계대명사/관계부사의 구분", chapterNumber: 12, partNumber: 4, afterUnitNumber: 66 },
  { title: "보충 설명하는 관계사절의 이해", chapterNumber: 12, partNumber: 4, afterUnitNumber: 72 },
  { title: "even though와 even if", chapterNumber: 13, partNumber: 4, afterUnitNumber: 77 },
  { title: "as의 다양한 의미", chapterNumber: 13, partNumber: 4, afterUnitNumber: 80 },
  { title: "접속사로 쓰이는 <전치사+명사+that>", chapterNumber: 13, partNumber: 4, afterUnitNumber: 80 },
  { title: "원급/비교급/최상급이 쓰인 관용적 표현", chapterNumber: 15, partNumber: 5, afterUnitNumber: 93 },
  { title: "부정을 뜻하는 어구", chapterNumber: 16, partNumber: 5, afterUnitNumber: 100 },
];

const partByNumber = new Map(
  CHEONILMUN_BASIC_PARTS.map((p) => [p.partNumber, p] as const)
);
const chapterByNumber = new Map(
  CHEONILMUN_BASIC_CHAPTERS.map((c) => [c.chapterNumber, c] as const)
);
const unitByNumber = new Map(
  CHEONILMUN_BASIC_UNITS.map((u) => [u.unitNumber, u] as const)
);

export function getCheonilmunUnit(unitNumber: number): CheonilmunUnit | undefined {
  return unitByNumber.get(unitNumber);
}

export function formatCheonilmunClassification(
  c: CheonilmunClassification
): string {
  if (c.isOffCatalog || c.unitNumber == null) {
    return `목차 외 보충${c.unitTitle ? ` · ${c.unitTitle}` : ""}`;
  }
  return `PART ${c.partNumber} ${c.partTitle} → CHAPTER ${String(
    c.chapterNumber
  ).padStart(2, "0")} ${c.chapterTitle} → Unit ${String(c.unitNumber).padStart(
    2,
    "0"
  )} ${c.unitTitle}`;
}

export function resolveCheonilmunUnit(
  unitNumber: unknown,
  unitTitleHint?: string
): CheonilmunClassification | null {
  const n = typeof unitNumber === "number" ? unitNumber : Number(unitNumber);
  if (!Number.isFinite(n) || n < 1 || n > 101) {
    if (unitTitleHint?.trim()) {
      return {
        partNumber: 0,
        partTitle: "",
        chapterNumber: 0,
        chapterTitle: "",
        unitNumber: null,
        unitTitle: unitTitleHint.trim(),
        isOffCatalog: true,
      };
    }
    return null;
  }
  const unit = unitByNumber.get(Math.floor(n));
  if (!unit) return null;
  const chapter = chapterByNumber.get(unit.chapterNumber);
  const part = partByNumber.get(unit.partNumber);
  if (!chapter || !part) return null;
  return {
    partNumber: part.partNumber,
    partTitle: part.partTitle,
    chapterNumber: chapter.chapterNumber,
    chapterTitle: chapter.chapterTitle,
    unitNumber: unit.unitNumber,
    unitTitle: unit.unitTitle,
  };
}

/** 프롬프트에 넣을 압축 목차 */
export function buildCheonilmunTaxonomyPromptText(): string {
  const lines: string[] = ["『천일문 기본』 표준 분류표 (UNIT 번호만 사용, 추측 금지)"];
  for (const part of CHEONILMUN_BASIC_PARTS) {
    lines.push(`PART ${part.partNumber} ${part.partTitle}`);
    const chapters = CHEONILMUN_BASIC_CHAPTERS.filter(
      (c) => c.partNumber === part.partNumber
    );
    for (const ch of chapters) {
      lines.push(
        `  CHAPTER ${String(ch.chapterNumber).padStart(2, "0")} ${ch.chapterTitle}`
      );
      const units = CHEONILMUN_BASIC_UNITS.filter(
        (u) => u.chapterNumber === ch.chapterNumber
      );
      for (const u of units) {
        lines.push(
          `    Unit ${String(u.unitNumber).padStart(2, "0")} ${u.unitTitle}`
        );
      }
      const fs = CHEONILMUN_BASIC_FURTHER_STUDIES.filter(
        (f) => f.chapterNumber === ch.chapterNumber
      );
      for (const f of fs) {
        lines.push(`    Further Study ${f.title}`);
      }
    }
  }
  return lines.join("\n");
}

export function verifyCheonilmunBasicTaxonomy(): string[] {
  const errors: string[] = [];

  if (CHEONILMUN_BASIC_PARTS.length !== 5) {
    errors.push(`PART count ${CHEONILMUN_BASIC_PARTS.length} !== 5`);
  }
  for (let i = 1; i <= 5; i++) {
    if (!CHEONILMUN_BASIC_PARTS.some((p) => p.partNumber === i)) {
      errors.push(`missing PART ${i}`);
    }
  }

  if (CHEONILMUN_BASIC_CHAPTERS.length !== 16) {
    errors.push(`CHAPTER count ${CHEONILMUN_BASIC_CHAPTERS.length} !== 16`);
  }
  for (let i = 1; i <= 16; i++) {
    if (!CHEONILMUN_BASIC_CHAPTERS.some((c) => c.chapterNumber === i)) {
      errors.push(`missing CHAPTER ${i}`);
    }
  }

  if (CHEONILMUN_BASIC_UNITS.length !== 101) {
    errors.push(`UNIT count ${CHEONILMUN_BASIC_UNITS.length} !== 101`);
  }
  const seen = new Set<number>();
  for (const u of CHEONILMUN_BASIC_UNITS) {
    if (seen.has(u.unitNumber)) errors.push(`duplicate Unit ${u.unitNumber}`);
    seen.add(u.unitNumber);
    const ch = chapterByNumber.get(u.chapterNumber);
    if (!ch) {
      errors.push(`Unit ${u.unitNumber}: missing CHAPTER ${u.chapterNumber}`);
      continue;
    }
    if (ch.partNumber !== u.partNumber) {
      errors.push(
        `Unit ${u.unitNumber}: partNumber ${u.partNumber} != CHAPTER part ${ch.partNumber}`
      );
    }
  }
  for (let i = 1; i <= 101; i++) {
    if (!seen.has(i)) errors.push(`missing Unit ${i}`);
  }

  for (const f of CHEONILMUN_BASIC_FURTHER_STUDIES) {
    const ch = chapterByNumber.get(f.chapterNumber);
    if (!ch) {
      errors.push(`Further Study "${f.title}": missing CHAPTER`);
      continue;
    }
    if (ch.partNumber !== f.partNumber) {
      errors.push(`Further Study "${f.title}": part mismatch`);
    }
  }

  return errors;
}

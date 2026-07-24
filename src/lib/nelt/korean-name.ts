/** 한국어 이름: 성 제외 + 조사 완성형 (AI가 조사를 다시 붙이지 않도록) */

const HANGUL = /[가-힣]/;

export function isHangulChar(ch: string): boolean {
  return HANGUL.test(ch);
}

/** 마지막 글자 받침 여부 */
export function hasBatchim(word: string): boolean {
  const chars = [...word.trim()].filter(isHangulChar);
  const last = chars[chars.length - 1];
  if (!last) return false;
  return (last.charCodeAt(0) - 0xac00) % 28 !== 0;
}

/**
 * 성 제외 이름.
 * 예: 서윤우 → 윤우, 신지환 → 지환
 */
export function koreanGivenName(fullName: string): string {
  const n = fullName.trim().replace(/\s+/g, "");
  if (!n) return n;
  if (/^[가-힣]{3,4}$/.test(n)) return n.slice(1);
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2 && /^[가-힣]+$/.test(parts[parts.length - 1]!)) {
    return parts[parts.length - 1]!;
  }
  return n;
}

export type KoreanNameForms = {
  /** 학생 원래 이름 (서윤우, 신지환) */
  studentName: string;
  /** 성 제외 (윤우, 지환) */
  givenName: string;
  /** 학부모 호칭 앞 — 지환이 / 윤우 */
  parentAddressName: string;
  /** 주어형 완성형 — 지환이가 / 윤우가 */
  studentSubjectName: string;
  /** 주제형 완성형 — 지환이는 / 윤우는 */
  studentTopicName: string;
  /** 소유격 — 지환이의 / 윤우의 */
  studentPossessiveName: string;
};

/**
 * 코드에서 조사를 완성한 뒤 AI·폴백에 그대로 넘긴다.
 * AI는 이 문자열을 수정·재조합하지 않는다.
 */
export function buildKoreanNameForms(fullName: string): KoreanNameForms {
  const studentName = fullName.trim();
  const givenName = koreanGivenName(studentName);
  const batchim = hasBatchim(givenName);

  // 지환이 / 윤우
  const parentAddressName = batchim ? `${givenName}이` : givenName;
  // 지환이가 / 윤우가
  const studentSubjectName = batchim ? `${givenName}이가` : `${givenName}가`;
  // 지환이는 / 윤우는
  const studentTopicName = batchim ? `${givenName}이는` : `${givenName}는`;
  // 지환이의 / 윤우의
  const studentPossessiveName = batchim
    ? `${givenName}이의`
    : `${givenName}의`;

  return {
    studentName,
    givenName,
    parentAddressName,
    studentSubjectName,
    studentTopicName,
    studentPossessiveName,
  };
}

/**
 * 잘못된 이름·조사 교정.
 * 인사 "{parentAddressName} 어머님"은 유지/교정, 본문은 완성형으로 통일.
 */
export function normalizeStudentNamesInMessage(
  message: string,
  fullName: string
): string {
  const f = buildKoreanNameForms(fullName);
  if (!f.studentName) return message;

  let out = message;

  // 인사 줄: 풀네임/잘못된 호칭 → parentAddressName
  out = out.replace(
    new RegExp(
      `(안녕하세요~\\s*)(${escapeReg(f.studentName)}|${escapeReg(f.givenName)}이?|${escapeReg(f.parentAddressName)})(\\s*)(어머님|아버님|학부모님|학부모)`,
      "g"
    ),
    `$1${f.parentAddressName}$3$4`
  );

  const guards: string[] = [];
  out = out.replace(
    new RegExp(
      `${escapeReg(f.parentAddressName)}\\s*(어머님|아버님|학부모님|학부모)`,
      "g"
    ),
    (m) => {
      guards.push(m);
      return `__NELT_NAME_GUARD_${guards.length - 1}__`;
    }
  );

  // 긴 잘못된 형태부터 교정 (이중 조사 방지)
  const fixes: Array<[string, string]> = [
    [`${f.givenName}이이가`, f.studentSubjectName],
    [`${f.givenName}이가가`, f.studentSubjectName],
    [`${f.givenName}이이는`, f.studentTopicName],
    [`${f.givenName}이는는`, f.studentTopicName],
    [`${f.studentName}이가`, f.studentSubjectName],
    [`${f.studentName}이는`, f.studentTopicName],
    [`${f.studentName}가`, f.studentSubjectName],
    [`${f.studentName}는`, f.studentTopicName],
    [`${f.studentName}은`, f.studentTopicName],
    [`${f.studentName}의`, f.studentPossessiveName],
    [`${f.givenName}가`, f.studentSubjectName], // 지환가 → 지환이가
    [`${f.givenName}이는`, f.studentTopicName],
    [`${f.givenName}이가`, f.studentSubjectName],
    [`${f.givenName}는`, f.studentTopicName],
    [`${f.givenName}은`, f.studentTopicName],
    [`${f.givenName}의`, f.studentPossessiveName],
    [`${f.studentName} 학생`, f.givenName],
    [`${f.givenName} 학생`, f.givenName],
  ];

  if (f.studentName !== f.givenName) {
    fixes.push([f.studentName, f.givenName]);
  }

  for (const [from, to] of fixes) {
    if (from && from !== to) out = out.split(from).join(to);
  }

  out = out.replace(
    /__NELT_NAME_GUARD_(\d+)__/g,
    (_, i) => guards[Number(i)] ?? ""
  );
  return out;
}

function escapeReg(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** 한국어 나열: 어휘·문법·듣기 / 어휘와 문법 */
export function joinKoreanList(items: string[]): string {
  const list = items.filter(Boolean);
  if (list.length === 0) return "";
  if (list.length === 1) return list[0]!;
  if (list.length === 2) {
    const a = list[0]!;
    const b = list[1]!;
    return hasBatchim(a) ? `${a}과 ${b}` : `${a}와 ${b}`;
  }
  return list.join("·");
}

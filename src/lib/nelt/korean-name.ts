/** 한국어 이름: 성 제외 이름 + 조사 */

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
 * 예: 서윤우 → 윤우, 신지환 → 지환, 윤우 → 윤우
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

/** 이/가 — 윤우가, 지환이 */
export function nameIGa(name: string): string {
  const n = name.trim();
  if (!n) return n;
  return hasBatchim(n) ? `${n}이` : `${n}가`;
}

/** 은/는(아이 호칭) — 윤우는, 지환이는 */
export function nameEunNeun(name: string): string {
  const n = name.trim();
  if (!n) return n;
  return hasBatchim(n) ? `${n}이는` : `${n}는`;
}

/** 의 — 윤우의, 지환의 */
export function nameUi(name: string): string {
  const n = name.trim();
  return n ? `${n}의` : n;
}

/** 을/를 */
export function nameEulReul(name: string): string {
  const n = name.trim();
  if (!n) return n;
  return hasBatchim(n) ? `${n}을` : `${n}를`;
}

export type KoreanNameForms = {
  fullName: string;
  givenName: string;
  iGa: string;
  eunNeun: string;
  ui: string;
  eulReul: string;
};

export function buildKoreanNameForms(fullName: string): KoreanNameForms {
  const givenName = koreanGivenName(fullName);
  return {
    fullName: fullName.trim(),
    givenName,
    iGa: nameIGa(givenName),
    eunNeun: nameEunNeun(givenName),
    ui: nameUi(givenName),
    eulReul: nameEulReul(givenName),
  };
}

/**
 * 본문에 풀네임+잘못된 조사가 들어가면 이름(성 제외)+올바른 조사로 교정.
 * 인사말 "{풀네임} 어머님"은 유지.
 */
export function normalizeStudentNamesInMessage(
  message: string,
  fullName: string
): string {
  const forms = buildKoreanNameForms(fullName);
  const full = forms.fullName;
  const given = forms.givenName;
  if (!full) return message;

  let out = message;
  const guards: string[] = [];
  out = out.replace(
    new RegExp(
      `${escapeReg(full)}\\s*(어머님|아버님|학부모님|학부모)`,
      "g"
    ),
    (m) => {
      guards.push(m);
      return `__NELT_NAME_GUARD_${guards.length - 1}__`;
    }
  );

  // 받침 있는 이름에 붙은 잘못된 "가" → 편지체 "이는" (신지환가 → 지환이는)
  const fullGa = hasBatchim(given) ? forms.eunNeun : forms.iGa;
  const givenGa = hasBatchim(given) ? forms.eunNeun : forms.iGa;

  if (full !== given) {
    const replacements: Array<[string, string]> = [
      [`${full}이는`, forms.eunNeun],
      [`${full}은`, forms.eunNeun],
      [`${full}는`, forms.eunNeun],
      [`${full}이가`, forms.iGa],
      [`${full}이`, forms.iGa],
      [`${full}가`, fullGa],
      [`${full}의`, forms.ui],
      [`${full}을`, forms.eulReul],
      [`${full}를`, forms.eulReul],
      [`${full}와`, `${given}와`],
      [`${full}과`, `${given}과`],
      [full, given],
    ];
    for (const [from, to] of replacements) {
      if (from && from !== to) out = out.split(from).join(to);
    }
  }

  if (hasBatchim(given)) {
    out = out.split(`${given}가`).join(givenGa);
    out = out.split(`${given}는`).join(forms.eunNeun);
  } else {
    out = out.split(`${given}이는`).join(forms.eunNeun);
    out = out.split(`${given}은`).join(forms.eunNeun);
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

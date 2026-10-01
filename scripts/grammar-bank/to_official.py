# -*- coding: utf-8 -*-
"""내가 붙여 둔 세부 이름을 족보닷컴 공식 이름으로 옮긴다.

이름이 거의 같은 것끼리 맞댄다(「명사적 용법」↔「명사적 용법」,
「부사적 용법」↔「to부정사의 부사적 용법」). 글자 두 자씩 쪼개 겹치는 정도로 잰다.
많이 다르면 옮기지 않고 비워 두어 다시 가리게 한다.

  python scripts/grammar-bank/to_official.py            (세어만 본다)
  python scripts/grammar-bank/to_official.py --적용      (정말 올린다)
"""
import collections, io, re, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import db
from unit_tree import units_of_name as units_of   # 세부 트리를 다시 짜면서 옮겼다

log = io.open(1, "w", encoding="utf-8", closefd=False)
FLOOR = 0.34      # 이만큼은 닮아야 같은 갈래로 본다

# 글자만으로는 못 맞추는 자리 — 손으로 이어 준다
BY_HAND = {
    "There is/are": "There is/are 구문",
    "명령문과 감탄문": "명령문",
    "부가의문문과 부정의문문": "부가의문문",
    "셀 수 있는 명사와 셀 수 없는 명사": "가산명사",
    "명사의 수일치": "가산명사",
    "관사": "부정관사(a/an)",
    "지시대명사와 it": "지시대명사",
    "인칭대명사": "인칭대명사",
    "부정대명사": "부정대명사 some과 any",
    "주어+동사+보어": "2형식 「주어 + 동사 + 주격보어」",
    "주어+동사+간접목적어+직접목적어": "4형식 「주어 + 동사 + 간접목적어 + 직접목적어」",
    "주어+동사+목적어+목적격보어": "5형식 「주어 + 동사 + 목적어 + 목적격보어」",
    "목적격보어와 원형부정사": "목적격 보어로 쓰이는 원형부정사",
    "동명사의 쓰임": "동명사의 쓰임",
    "동명사와 to부정사": "동명사와 to부정사의 비교",
    "동명사의 관용 표현": "동명사의 관용 표현",
    "시간 전치사": "시간을 나타내는 전치사",
    "장소·위치·방향 전치사": "장소를 나타내는 전치사",
    "장소 전치사": "장소를 나타내는 전치사",
    "여러 가지 전치사": "그 외 자주 사용되는 전치사",
    "시간·이유·조건의 접속사": "종속접속사",
    "시간·이유의 접속사": "시간을 나타내는 접속사",
    "조건·양보의 접속사": "조건을 나타내는 접속사",
    "부사절을 이끄는 접속사": "종속접속사",
    "명사절을 이끄는 접속사": "명사절을 이끄는 종속접속사 that",
    "명사절을 이끄는 that": "명사절을 이끄는 종속접속사 that",
    "짝을 이루는 접속사": "상관접속사",
    "등위접속사": "등위접속사",
    "주의해야 할 분사": "감정을 나타내는 분사",
    "분사의 쓰임": "현재분사와 과거분사",
    "주의해야 할 분사구문": "분사구문",
    "수동태의 형태": "수동태의 형태",
    "수동태의 형태와 시제": "수동태의 시제",
    "주의할 수동태": "수동태 주의사항",
    "다양한 수동태 표현": "다양한 형태의 수동태",
    "수동태의 부정문과 의문문": "수동태의 부정문과 의문문",
    "가정법 과거·과거완료": "가정법 과거",
    "I wish·as if·without 가정법": "I wish 가정법",
    "주의할 가정법": "가정법 현재(조건절)",
    "관계대명사에서 주의할 점": "관계대명사의 생략",
    "관계대명사의 계속적 용법": "관계대명사의 계속적 용법",
    "관계대명사의 종류": "소유격 관계대명사",
    "강조": "강조",
    "도치": "도치",
    "생략과 동격": "생략",
    "부정과 무생물주어": "부정 표현",
    "수일치": "구나 절 주어의 수 일치",
    "시제 일치": "일치, 화법",
    "화법": "평서문의 화법 전환",
    "현재진행형": "진행 시제",
    "과거시제": "과거시제",
    "미래 표현": "조동사 Will",
    "시제의 판단": "현재시제",
    "일반동사의 현재형": "일반동사의 규칙",
    "일반동사의 과거형": "과거시제",
    "일반동사의 부정문과 의문문": "일반동사의 부정문",
    "be동사의 긍정문": "Be 동사",
    "be동사의 부정문과 의문문": "be동사의 부정문",
    "조동사의 부정문과 의문문": "조동사 Will",
    "can/may": "조동사 Can",
    "can/may/will": "조동사 Can",
    "must/have to/should": "조동사 Must",
    "must/should/had better/used to": "조동사 Must",
    "had better/would like to/used to": "「used to + 동사원형」와 would",
    "조동사+have p.p.": "조동사 Must",
    "원급": "원급비교",
    "원급 비교": "원급비교",
    "비교급": "비교급",
    "비교급 비교": "비교급",
    "최상급": "최상급",
    "최상급 비교": "최상급",
    "주요 구문": "원급과 비교급을 사용하여 최상급 표현하기",
    "형용사": "형용사",
    "부사": "부사",
    "주의해야 할 형용사와 부사": "부사",
    "현재완료": "현재완료",
    "과거완료": "과거완료",
    "현재완료진행": "현재완료진행",
    "진행형": "진행시제",
    "여러 가지 시제": "현재완료시제",
    "간접의문문": "간접의문문",
    "의문사 의문문": "의문사 의문문",
    "관계부사": "관계부사",
    "관계대명사": "관계대명사",
    "주격 관계대명사": "주격 관계대명사",
    "목적격 관계대명사": "목적격 관계대명사",
    "명사적 용법": "명사적 용법",
    "형용사적 용법": "형용사적 용법",
    "부사적 용법": "부사적 용법",
    "분사구문": "분사구문",
}


def grams(text):
    flat = re.sub(r"[\s·,「」\[\]()]", "", str(text))
    return {flat[i:i + 2] for i in range(max(len(flat) - 1, 1))}


def nearest(name, choices):
    """이름이 가장 닮은 공식 갈래 — 많이 다르면 None"""
    if not choices:
        return None
    want = BY_HAND.get(name)
    if want:
        for one in choices:
            if re.sub(r"\s", "", one) == re.sub(r"\s", "", want):
                return one
    mine = grams(name)
    best, score = None, 0.0
    for one in choices:
        other = grams(one)
        both = len(mine & other)
        if not both:
            continue
        point = both / len(mine | other)
        if point > score:
            best, score = one, point
    return best if score >= FLOOR else None


def main(apply=False):
    rows = db.rows("id,level,chapter,unit")
    plan = collections.defaultdict(list)
    lost = collections.Counter()
    for r in rows:
        if not r.get("unit"):
            continue
        choices = units_of(r["level"], r["chapter"])
        want = nearest(r["unit"], choices)
        if want is None:
            lost[(r["level"], r["chapter"], r["unit"])] += 1
        elif want != r["unit"]:
            plan[(r["level"], r["chapter"], r["unit"], want)].append(r["id"])

    moved = sum(len(v) for v in plan.values())
    print("옮길 문항 %d개 · 맞댈 데가 없어 비울 문항 %d개" % (moved, sum(lost.values())), file=log)
    for key in sorted(plan, key=lambda k: -len(plan[k]))[:14]:
        print("   [%d] %-18s %-22s → %s (%d개)"
              % (key[0], key[1], key[2], key[3], len(plan[key])), file=log)
    if lost:
        print("\n비울 것", file=log)
        for key, n in lost.most_common(10):
            print("   [%d] %-18s %-24s %d개" % (key[0], key[1], key[2], n), file=log)

    if not apply:
        print("\n세어만 봤습니다. 정말 올리려면 --적용 을 붙이세요.", file=log)
        log.flush()
        return

    for key, ids in plan.items():
        db.update(ids, {"unit": key[3]})
    blanks = [r["id"] for r in rows
              if r.get("unit") and nearest(r["unit"], units_of(r["level"], r["chapter"])) is None]
    if blanks:
        db.update(blanks, {"unit": None})
    print("\n올렸습니다.", file=log)
    log.flush()


if __name__ == "__main__":
    main("--적용" in sys.argv)

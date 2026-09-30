# -*- coding: utf-8 -*-
"""이미 가려 놓은 문항의 말씨를 배워 남은 문항을 가린다.

같은 세부 단원의 문항은 같은 말을 쓴다. 「원급 비교」에는 as 가, 「최상급 비교」에는
most·est 가, 「관계부사」에는 where·when 이 자주 나온다. 단원마다 이미 가려 놓은
문항에서 그 말씨를 세어 두고, 남은 문항이 어느 쪽 말씨에 가까운지 본다.

바깥 서비스는 부르지 않는다. 세어 보고 견주기만 한다.

조심한 것
  · 같은 단원 안에서만 견준다
  · 배울 문항이 적은 세부(기본 12개 미만)는 쓰지 않는다
  · 으뜸이 버금보다 뚜렷이 앞설 때만 붙인다(기본 1.7배)

  python scripts/grammar-bank/fill_by_words.py            (세어만 본다)
  python scripts/grammar-bank/fill_by_words.py --적용      (정말 올린다)
"""
import collections, io, math, random, re, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import db
from unit_rules import flatten

log = io.open(1, "w", encoding="utf-8", closefd=False)
LEAST = 18        # 이만큼은 배워야 그 세부를 쓴다
MARGIN = 2.8      # 으뜸이 버금보다 이만큼 앞서야 붙인다

WORD = re.compile(r"[A-Za-z][A-Za-z']+|[가-힣]{2,}")
STOP = {
    "the", "and", "for", "you", "that", "this", "with", "was", "are", "his", "her",
    "she", "they", "have", "has", "had", "not", "but", "can", "will", "from", "his",
    "다음", "빈칸", "알맞은", "고르시오", "고르세요", "쓰시오", "쓰세요", "것은", "것을",
    "문장", "우리말", "바르게", "밑줄", "부분", "같은", "다른", "하나는", "어법상",
    "완성하시오", "이용하여", "주어진", "의미가", "괄호", "안의", "말을", "적절한",
}


def words(text):
    return [w.lower() for w in WORD.findall(text) if w.lower() not in STOP and len(w) > 1]


def main(apply=False):
    rows = db.rows("id,level,chapter,unit,prompt,body,choices,answer")
    by_chapter = collections.defaultdict(list)
    for r in rows:
        by_chapter[(r["level"], r["chapter"])].append(r)

    plan = collections.defaultdict(list)
    for key, group in by_chapter.items():
        known = [r for r in group if r.get("unit")]
        blank = [r for r in group if not r.get("unit")]
        if not blank or len(known) < LEAST * 2:
            continue

        # 세부마다 말씨를 센다
        bag = collections.defaultdict(collections.Counter)
        size = collections.Counter()
        seen = collections.Counter()      # 이 말이 몇 세부에 나오는가
        for r in known:
            unit = r["unit"]
            size[unit] += 1
            got = set(words(flatten(r)))
            bag[unit].update(got)
        for unit, counter in bag.items():
            for w in counter:
                seen[w] += 1
        usable = {u for u, n in size.items() if n >= LEAST}
        if len(usable) < 2:
            continue

        for r in blank:
            got = set(words(flatten(r)))
            if len(got) < 4:
                continue
            score = {}
            for unit in usable:
                total = size[unit]
                point = 0.0
                for w in got:
                    hits = bag[unit][w]
                    if not hits:
                        continue
                    # 그 세부에서 얼마나 흔한가 × 그 말이 얼마나 가려 주는가
                    point += (hits / total) * math.log(len(usable) / seen[w] + 1)
                score[unit] = point
            ranked = sorted(score.items(), key=lambda kv: -kv[1])
            if len(ranked) < 2 or ranked[0][1] <= 0:
                continue
            if ranked[1][1] > 0 and ranked[0][1] < ranked[1][1] * MARGIN:
                continue
            plan[(key[0], key[1], ranked[0][0])].append(r)

    filled = sum(len(v) for v in plan.values())
    print("세부가 빈 문항 %d개 · 말씨로 가릴 수 있는 것 %d개"
          % (sum(1 for r in rows if not r.get("unit")), filled), file=log)
    for key in sorted(plan, key=lambda k: -len(plan[k]))[:12]:
        print("   [%d] %-20s %-22s %d개" % (key[0], key[1], key[2], len(plan[key])), file=log)

    flat = [(k, r) for k, v in plan.items() for r in v]
    print("\n뽑아 본 것", file=log)
    for key, r in random.Random(9).sample(flat, min(12, len(flat))):
        print("── %s › %s" % (key[1], key[2]), file=log)
        print("   %s" % flatten(r)[:104], file=log)

    if not apply:
        print("\n세어만 봤습니다. 정말 올리려면 --적용 을 붙이세요.", file=log)
        log.flush()
        return

    for key, items in plan.items():
        db.update([r["id"] for r in items], {"unit": key[2]})
    print("\n올렸습니다.", file=log)
    log.flush()


if __name__ == "__main__":
    main("--적용" in sys.argv)

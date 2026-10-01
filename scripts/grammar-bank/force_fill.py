# -*- coding: utf-8 -*-
"""남은 문항을 하나도 빠짐없이 어느 갈래엔가 넣는다.

선생님 결정(2026-09-30): 트리에 「세부 없음」을 두지 말고 어디든 넣는다.

여기까지 온 문항은 규칙으로도 이웃으로도 못 가린 것들이다. 그래도 비워 두지
않기로 했으므로, 같은 단원에서 이미 가려 놓은 문항의 말씨와 가장 가까운 갈래에
넣는다. 견줄 말이 하나도 없으면 그 단원에서 가장 많은 갈래에 넣는다.

여기서 넣은 것은 「짐작해서 넣은 것」이다. 확실한 것과 섞이므로, 쓰시다가 눈에
걸리면 고치시면 된다.

  python scripts/grammar-bank/force_fill.py            (세어만 본다)
  python scripts/grammar-bank/force_fill.py --적용      (정말 올린다)
"""
import collections, io, math, random, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import db
from fill_by_words import words
from unit_tree import units_of_name as units_of   # 세부 트리를 다시 짜면서 옮겼다
from unit_rules import flatten

log = io.open(1, "w", encoding="utf-8", closefd=False)


def main(apply=False):
    rows = db.rows("id,level,chapter,unit,prompt,body,choices,answer")
    by_chapter = collections.defaultdict(list)
    for r in rows:
        by_chapter[(r["level"], r["chapter"])].append(r)

    plan = collections.defaultdict(list)
    for key, group in by_chapter.items():
        known = [r for r in group if r.get("unit")]
        blank = [r for r in group if not r.get("unit")]
        if not blank:
            continue
        choices = units_of(*key)
        if not choices:
            continue

        bag = collections.defaultdict(collections.Counter)
        size = collections.Counter()
        for r in known:
            size[r["unit"]] += 1
            bag[r["unit"]].update(set(words(flatten(r))))
        # 이 단원에서 가장 많은 갈래 — 견줄 말이 없을 때 쓴다
        common = size.most_common(1)[0][0] if size else choices[0]

        for r in blank:
            got = set(words(flatten(r)))
            best, score = None, 0.0
            for unit in size:
                point = sum(bag[unit][w] / size[unit] for w in got if bag[unit][w])
                if point > score:
                    best, score = unit, point
            plan[(key[0], key[1], best or common)].append(r)

    filled = sum(len(v) for v in plan.values())
    print("아직 빈 문항 %d개 · 짐작해서 넣을 것 %d개"
          % (sum(1 for r in rows if not r.get("unit")), filled), file=log)
    for key in sorted(plan, key=lambda k: -len(plan[k]))[:14]:
        print("   [%d] %-18s %-26s %d개" % (key[0], key[1], key[2], len(plan[key])), file=log)

    flat = [(k, r) for k, v in plan.items() for r in v]
    print("\n뽑아 본 것", file=log)
    for key, r in random.Random(4).sample(flat, min(8, len(flat))):
        print("── %s › %s" % (key[1], key[2]), file=log)
        print("   %s" % flatten(r)[:96], file=log)

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

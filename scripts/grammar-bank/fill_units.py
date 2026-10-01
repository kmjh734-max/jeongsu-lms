# -*- coding: utf-8 -*-
"""세부가 비어 있는 문항을 문제 내용으로 가려 채운다.

  python scripts/grammar-bank/fill_units.py            (세어만 보고 표본을 보여 준다)
  python scripts/grammar-bank/fill_units.py --적용      (정말 올린다)

바깥 서비스는 부르지 않는다. 확실하지 않은 것은 비워 둔다.
"""
import collections, io, random, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import db
from unit_tree import units_of_name as units_of   # 세부 트리를 다시 짜면서 옮겼다
from to_official import nearest
from unit_map import UNITS
from unit_rules import guess

log = io.open(1, "w", encoding="utf-8", closefd=False)


def main(apply=False, show=12):
    got = db.rows("id,level,chapter,prompt,body,choices,answer", "unit=is.null")
    print("세부가 비어 있는 문항 %d개" % len(got), file=log)

    plan = collections.defaultdict(list)
    for q in got:
        # 규칙은 내 이름으로 가린다. 그 뒤 족보닷컴 공식 갈래로 옮겨 담는다.
        mine = UNITS.get((q["level"], q["chapter"]))
        name = guess(q["level"], q["chapter"], q, mine)
        if not name:
            continue
        want = nearest(name, units_of(q["level"], q["chapter"]))
        if want:
            plan[(q["level"], q["chapter"], want)].append(q)

    filled = sum(len(v) for v in plan.values())
    print("가려낸 것 %d개 (%d%%)" % (filled, round(filled / max(len(got), 1) * 100)), file=log)
    for key in sorted(plan, key=lambda k: (k[0], k[1], k[2])):
        print("   [%d] %-14s %-24s %d개" % (key[0], key[1], key[2], len(plan[key])), file=log)

    seen = random.Random(11)
    print("\n뽑아 본 것", file=log)
    flat = [(k, q) for k, v in plan.items() for q in v]
    for key, q in seen.sample(flat, min(show, len(flat))):
        body = " / ".join(str(b) for b in (q.get("body") or []))
        picks = "; ".join(str(c.get("text")) for c in (q.get("choices") or []))
        print("── %s › %s" % (key[1], key[2]), file=log)
        print("   %s" % (str(q.get("prompt") or "")[:56]), file=log)
        print("   %s" % (body or picks)[:88], file=log)
        print("   답 %s" % str(q.get("answer"))[:40], file=log)

    if not apply:
        print("\n세어만 봤습니다. 정말 올리려면 --적용 을 붙이세요.", file=log)
        log.flush()
        return

    for key, items in plan.items():
        db.update([q["id"] for q in items], {"unit": key[2]})
    print("\n올렸습니다.", file=log)
    log.flush()


if __name__ == "__main__":
    main("--적용" in sys.argv)

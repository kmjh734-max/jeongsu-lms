# -*- coding: utf-8 -*-
"""붙여 둔 세부가 규칙과 어긋나는 문항을 찾는다.

빈 곳을 채울 때 마지막 1,011문항은 말씨만 보고 짐작해서 넣었다. 그 뒤로 규칙을
더 다듬었으므로, 규칙이 뚜렷이 다른 답을 내는 문항은 다시 볼 만하다.

규칙이 확실할 때만 센다 — 규칙이 아무 말도 못 하면 그냥 둔다.

  python scripts/grammar-bank/review_units.py                 어긋나는 곳을 단원별로
  python scripts/grammar-bank/review_units.py "관계사" 2        그 단원의 어긋난 것들
  python scripts/grammar-bank/review_units.py --적용            규칙 쪽으로 옮긴다
"""
import collections, io, random, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import db
from official_units import units_of
from to_official import nearest
from unit_map import UNITS
from unit_rules import flatten, guess

log = io.open(1, "w", encoding="utf-8", closefd=False)


def verdicts():
    """문항마다 (지금 붙은 것, 규칙이 말하는 것) — 규칙이 말할 때만"""
    rows = db.rows("id,level,chapter,unit,prompt,body,choices,answer")
    out = []
    for q in rows:
        mine = UNITS.get((q["level"], q["chapter"]))
        said = guess(q["level"], q["chapter"], q, mine)
        if not said:
            continue
        want = nearest(said, units_of(q["level"], q["chapter"]))
        if want:
            out.append((q, want))
    return rows, out


def main(apply=False, chapter=None, level=None, show=10):
    rows, said = verdicts()
    off = [(q, want) for q, want in said if q.get("unit") != want]
    print("은행 %d문항 · 규칙이 말할 수 있는 것 %d개 · 그 가운데 어긋난 것 %d개"
          % (len(rows), len(said), len(off)), file=log)

    if chapter:
        off = [(q, w) for q, w in off if q["chapter"] == chapter
               and (level is None or q["level"] == level)]
        print("\n[%s] %s — 어긋난 것 %d개" % (level, chapter, len(off)), file=log)
        for q, want in off[:show]:
            print("── %s → %s" % (q.get("unit"), want), file=log)
            print("   %s" % flatten(q)[:104], file=log)
        log.flush()
        return

    tally = collections.Counter((q["level"], q["chapter"]) for q, _ in off)
    for key, n in tally.most_common(14):
        print("   [%d] %-20s %d개" % (key[0], key[1], n), file=log)

    print("\n뽑아 본 것", file=log)
    for q, want in random.Random(5).sample(off, min(show, len(off))):
        print("── [%d] %s · %s → %s" % (q["level"], q["chapter"], q.get("unit"), want), file=log)
        print("   %s" % flatten(q)[:100], file=log)

    if not apply:
        print("\n세어만 봤습니다. 규칙 쪽으로 옮기려면 --적용 을 붙이세요.", file=log)
        log.flush()
        return

    by_want = collections.defaultdict(list)
    for q, want in off:
        by_want[want].append(q["id"])
    for want, ids in by_want.items():
        db.update(ids, {"unit": want})
    print("\n옮겼습니다 (%d개)." % len(off), file=log)
    log.flush()


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    main("--적용" in sys.argv,
         args[0] if args else None,
         int(args[1]) if len(args) > 1 else None)

# -*- coding: utf-8 -*-
"""아직 세부를 못 가린 문항을 단원별로 들여다본다.

  python scripts/grammar-bank/look_left.py                 남은 곳을 많은 차례로
  python scripts/grammar-bank/look_left.py "관계사" 2        그 단원의 남은 것을 모두 한 줄씩
  python scripts/grammar-bank/look_left.py "관계사" 2 --자세히  글까지 길게
"""
import collections, io, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import db
from unit_map import UNITS
from unit_rules import flatten

log = io.open(1, "w", encoding="utf-8", closefd=False)
args = [a for a in sys.argv[1:] if not a.startswith("--")]
wide = "--자세히" in sys.argv

rows = db.rows("id,level,chapter,prompt,body,choices,answer", "unit=is.null")

if not args:
    left = collections.Counter((r["level"], r["chapter"]) for r in rows)
    print("못 가린 문항 %d개 · 단원 %d곳" % (len(rows), len(left)), file=log)
    for (lv, ch), n in left.most_common():
        table = UNITS.get((lv, ch))
        print("   [%d] %-22s %4d개%s" % (lv, ch, n, "" if table else "  ← 세부 표 없음"), file=log)
    log.flush()
    raise SystemExit

chapter = args[0]
level = int(args[1]) if len(args) > 1 else None
rows = [r for r in rows if r["chapter"] == chapter and (level is None or r["level"] == level)]
print("[%s] %s · 못 가린 문항 %d개" % (level, chapter, len(rows)), file=log)
if level:
    print("쓸 수 있는 세부: %s" % (UNITS.get((level, chapter)) or "(표 없음)"), file=log)
print("", file=log)

for r in rows:
    text = flatten(r)
    if wide:
        print("── %d" % r["id"], file=log)
        print("   %s" % text[:220], file=log)
        print("   답 %s" % str(r.get("answer"))[:60], file=log)
    else:
        print("%6d │ %s" % (r["id"], text[:128]), file=log)
log.flush()

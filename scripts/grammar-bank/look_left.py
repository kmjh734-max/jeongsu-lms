# -*- coding: utf-8 -*-
"""아직 세부를 못 가린 문항을 단원별로 들여다본다.

  python scripts/grammar-bank/look_left.py "관계사" 2
"""
import io, random, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import db
from unit_map import UNITS
from unit_rules import flatten

log = io.open(1, "w", encoding="utf-8", closefd=False)
chapter = sys.argv[1] if len(sys.argv) > 1 else None
level = int(sys.argv[2]) if len(sys.argv) > 2 else None
show = int(sys.argv[3]) if len(sys.argv) > 3 else 10

rows = db.rows("id,level,chapter,prompt,body,choices,answer", "unit=is.null")
if chapter:
    rows = [r for r in rows if r["chapter"] == chapter]
if level:
    rows = [r for r in rows if r["level"] == level]
print("못 가린 문항 %d개" % len(rows), file=log)
if chapter and level:
    print("쓸 수 있는 세부: %s" % (UNITS.get((level, chapter)) or "(표 없음)"), file=log)

for r in random.Random(5).sample(rows, min(show, len(rows))):
    print("\n── [%d] %s" % (r["level"], r["chapter"]), file=log)
    print("   발문 %s" % str(r.get("prompt") or "")[:58], file=log)
    print("   글  %s" % flatten(r)[:110], file=log)
    print("   답  %s" % str(r.get("answer"))[:36], file=log)
log.flush()

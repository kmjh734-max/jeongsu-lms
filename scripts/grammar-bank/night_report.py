# -*- coding: utf-8 -*-
"""밤새 돌린 결과를 한눈에 본다.

  python scripts/grammar-bank/night_report.py
"""
import collections, glob, io, json, os
from pathlib import Path

OUT = Path("tmp-grammar-bank")
log = io.open(1, "w", encoding="utf-8", closefd=False)

BOOKS = [
    ("gq-starter1", "그래머큐 Starter 1"), ("gq-starter2", "그래머큐 Starter 2"),
    ("gq-inter1", "그래머큐 Intermediate 1"), ("gq-inter2", "그래머큐 Intermediate 2"),
    ("gq-adv1", "그래머큐 Advanced 1"), ("gq-adv2", "그래머큐 Advanced 2"),
    ("jp-1", "잘풀리는 영문법 1"), ("jp-2", "잘풀리는 영문법 2"), ("jp-3", "잘풀리는 영문법 3"),
]


def count(path):
    if not os.path.exists(path):
        return None
    try:
        return len(json.loads(Path(path).read_text(encoding="utf-8")))
    except Exception:
        return None


print("교재별 결과", file=log)
print("%-24s %8s %8s %8s %7s" % ("교재", "문항", "답 붙음", "어긋남", "비율"), file=log)
total_q = total_m = 0
for key, name in BOOKS:
    q = count(OUT / ("%s.json" % key))
    m = count(OUT / ("%s-matched.json" % key))
    b = count(OUT / ("%s-bad.json" % key))
    if q is None:
        print("%-24s %8s" % (name, "(없음)"), file=log)
        continue
    total_q += q
    total_m += m or 0
    pct = ("%d%%" % round((m or 0) / q * 100)) if q else "-"
    print("%-24s %8d %8s %8s %7s" % (name, q, m if m is not None else "-",
                                     b if b is not None else "-", pct), file=log)
print("%-24s %8d %8d %7s%%" % ("합계", total_q, total_m,
                               round(total_m / max(total_q, 1) * 100)), file=log)

why = collections.Counter()
for f in glob.glob(str(OUT / "*-bad.json")):
    try:
        for b in json.loads(Path(f).read_text(encoding="utf-8")):
            why[str(b.get("까닭", "")).split(" 안에")[0].split(" %d")[0]] += 1
    except Exception:
        pass
if why:
    print("\n어긋난 까닭", file=log)
    for k, n in why.most_common():
        print("   %-30s %d묶음" % (k, n), file=log)

bank = count(OUT / "new-bank.json")
var = count(OUT / "new-variants.json")
print("\n은행 형식 %s개 → 변형 %s개" % (bank, var), file=log)
log.flush()

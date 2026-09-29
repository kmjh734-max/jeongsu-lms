# -*- coding: utf-8 -*-
"""밤새 돌린 결과를 한눈에 본다.

  python scripts/grammar-bank/night_report.py
"""
import collections, glob, io, json, os, sys
from pathlib import Path

OUT = Path("tmp-grammar-bank")
log = io.open(1, "w", encoding="utf-8", closefd=False)

BOOKS = [
    ("gq-starter1", "그래머큐 Starter 1"), ("gq-starter2", "그래머큐 Starter 2"),
    ("gq-inter1", "그래머큐 Intermediate 1"), ("gq-inter2", "그래머큐 Intermediate 2"),
    ("gq-adv1", "그래머큐 Advanced 1"), ("gq-adv2", "그래머큐 Advanced 2"),
    ("jp-1", "잘풀리는영문법_1권"), ("jp-2", "잘풀리는영문법_2권"), ("jp-3", "잘풀리는영문법_3권"),
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

# 단원을 못 찾아 빠진 문항 — 여러 단원에 걸친 '마무리 실전문제'가 여기 든다
sys.path.insert(0, str(Path(__file__).parent))
try:
    from chapter_map import place

    lost = collections.Counter()
    for key, name in BOOKS:
        got = OUT / ("%s.json" % key)
        if not got.exists():
            continue
        for r in json.loads(got.read_text(encoding="utf-8")):
            if not place(name, r.get("chapter") or ""):
                lost[name] += 1
    if lost:
        print("\n단원을 못 찾아 빠진 문항", file=log)
        for k, n in lost.most_common():
            print("   %-24s %d개" % (k, n), file=log)
except Exception as err:
    print("\n(단원 확인 못 함: %s)" % err, file=log)

# 실제로 은행에 담은 것
try:
    rows = json.loads((OUT / "new-variants.json").read_text(encoding="utf-8"))
    per = collections.Counter(r.get("origin_file") for r in rows)
    lvl = collections.Counter(r.get("level_name") for r in rows)
    ch = collections.Counter(r.get("chapter") for r in rows)
    print("\n은행에 넣은 변형 %d개" % len(rows), file=log)
    for k, n in sorted(per.items()):
        print("   %-24s %d개" % (k, n), file=log)
    print("   단계별: %s" % ", ".join("%s %d" % (k, n) for k, n in lvl.most_common()), file=log)
    print("   단원 %d가지 · 많은 쪽: %s"
          % (len(ch), ", ".join("%s %d" % (k, n) for k, n in ch.most_common(6))), file=log)
except Exception:
    pass
log.flush()

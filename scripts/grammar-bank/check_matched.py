# -*- coding: utf-8 -*-
"""답을 붙인 문항을 눈으로 훑어본다 — 넣기 전에 이상한 것이 없는지 본다.

  python scripts/grammar-bank/check_matched.py [교재열쇠] [개수]
"""
import glob, io, json, random, re, sys
from pathlib import Path

OUT = Path("tmp-grammar-bank")
log = io.open(1, "w", encoding="utf-8", closefd=False)

key = sys.argv[1] if len(sys.argv) > 1 else "*"
want = int(sys.argv[2]) if len(sys.argv) > 2 else 15

rows = []
for f in sorted(glob.glob(str(OUT / ("%s-matched.json" % key)))):
    got = json.loads(Path(f).read_text(encoding="utf-8"))
    for r in got:
        r["_from"] = Path(f).stem.replace("-matched", "")
    rows += got

print("답 붙은 문항 %d개" % len(rows), file=log)

# 의심스러운 것부터 — 답에 번호가 남았거나, 너무 길거나, 비었거나
def odd(r):
    """살펴볼 만한 답 — 객관식의 번호 답(③, 5)은 정상이므로 뺀다"""
    a = str(r.get("answer") or "").strip()
    if not a:
        return True
    if re.fullmatch(r"[1-9①-⑩][,\s]*[1-9①-⑩]?", a):
        return False
    return bool(re.match(r"^\d+\s", a) or len(a) > 60
                or re.search(r"[|~^<>@\\\]\[]", a))


bad = [r for r in rows if odd(r)]
print("살펴볼 것 %d개 (답에 번호가 남았거나 너무 길거나 기호가 섞임)" % len(bad), file=log)
for r in bad[:10]:
    print("   [%s p.%s STEP%s %s번] %s → %r"
          % (r["_from"], r.get("printed_page"), r.get("step"), r.get("no"),
             str(r.get("text", ""))[:46], r.get("answer")), file=log)

print("\n아무거나 %d개" % want, file=log)
for r in random.Random(7).sample(rows, min(want, len(rows))):
    print("\n── %s · %s %s · p.%s" % (r["_from"], r.get("level_name", ""), r.get("chapter"), r.get("printed_page")), file=log)
    print("   [발문] %s" % str(r.get("instruction") or r.get("prompt") or "")[:60], file=log)
    print("   [문항] %s" % str(r.get("text") or " / ".join(r.get("body") or []))[:74], file=log)
    print("   [답]   %s" % r.get("answer"), file=log)
log.flush()

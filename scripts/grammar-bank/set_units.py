# -*- coding: utf-8 -*-
"""세부 목차를 다시 매긴다 — 바깥 서비스는 부르지 않는다.

  python scripts/grammar-bank/set_units.py          ← 보기만 한다
  python scripts/grammar-bank/set_units.py --적용    ← 은행에 적는다
"""
import io, re, sys, collections
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import db
from unit_tree import TREE, same_name, units_of
from unit_rules_v2 import pick

log = io.open(1, "w", encoding="utf-8", closefd=False)
MARKED = re.compile(r"\[\[(.*?)\]\]")


def text_of(r):
    parts = [str(r.get("prompt") or "")]
    parts += r.get("body") or []
    parts += [c.get("text", "") for c in (r.get("choices") or [])]
    parts += [str(r.get("answer") or "")]
    return " ".join(parts)


def main(apply=False):
    rows = db.rows("id,level,chapter_no,chapter,unit,prompt,body,choices,answer,explanation")
    want, how = {}, collections.Counter()
    tree = collections.defaultdict(collections.Counter)

    for r in rows:
        lv, ch = r.get("level"), r.get("chapter_no")
        here = units_of(lv, ch)
        if not here:
            how["트리에 없는 단원"] += 1
            continue
        whole = text_of(r)
        marked = " ".join(MARKED.findall(whole))
        said = str(r.get("explanation") or "")
        got = pick(lv, ch, whole, marked, said, str(r.get("answer") or ""))
        if got and got not in here:
            got = None          # 자국 묶음을 여러 단원이 나눠 써, 이 단원에 없는 이름이 나올 수 있다
        if got:
            how["자국을 보고 가림"] += 1
        else:
            got = same_name(r.get("unit") or "", lv, ch)
            if got:
                how["예전 자리를 그대로"] += 1
            else:
                got = here[0]
                how["자국이 없어 첫 자리로"] += 1
        tree[(lv, ch, r["chapter"])][got] += 1
        if got != r.get("unit"):
            want[r["id"]] = got

    print("은행 %d문항 · 자리를 옮길 것 %d개" % (len(rows), len(want)), file=log)
    for k, n in how.most_common():
        print("   %-18s %d" % (k, n), file=log)
    print(file=log)
    for key in sorted(tree, key=lambda x: (x[0], x[1])):
        lv, ch, name = key
        counts = tree[key]
        print("%d단계 %2d. %-20s (%d)" % (lv, ch, name, sum(counts.values())), file=log)
        for u in units_of(lv, ch):
            print("      %-32s %4d" % (u, counts.get(u, 0)), file=log)
        for u, n in counts.items():
            if u not in units_of(lv, ch):
                print("      ✕ %-30s %4d  ← 트리 밖" % (u, n), file=log)
    log.flush()

    if apply:
        by = collections.defaultdict(list)
        for qid, u in want.items():
            by[u].append(qid)
        done = 0
        for u, ids in by.items():
            db.update(ids, {"unit": u})
            done += len(ids)
        print("\n%d문항의 자리를 옮겼다." % done, file=log)
        log.flush()


if __name__ == "__main__":
    main("--적용" in sys.argv)

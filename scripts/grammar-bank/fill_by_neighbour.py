# -*- coding: utf-8 -*-
"""이웃한 문항의 세부를 물려받아 빈 곳을 채운다.

교재의 문제는 갈래별로 묶여 실린다. 같은 교재의 앞뒤 문항이 같은 세부라면
그 사이에 낀 문항도 거의 틀림없이 같은 세부다. 문제 글만으로는 못 가리던
것들(핵심 낱말이 빈칸에 가려진 문항)이 여기서 채워진다.

조심한 것
  · 같은 교재(source_file)·같은 단원 안에서만 본다
  · 앞뒤 이웃이 같은 세부일 때만 채운다. 하나라도 다르면 비워 둔다
  · 이웃은 번호가 가까워야 한다(기본 3칸)

  python scripts/grammar-bank/fill_by_neighbour.py            (세어만 본다)
  python scripts/grammar-bank/fill_by_neighbour.py --적용      (정말 올린다)
"""
import collections, io, random, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import db

log = io.open(1, "w", encoding="utf-8", closefd=False)
REACH = 3


def main(apply=False):
    rows = db.rows("id,source_file,number,level,chapter,unit,prompt,body")
    by_book = collections.defaultdict(list)
    for r in rows:
        by_book[(r["source_file"], r["level"], r["chapter"])].append(r)

    plan = collections.defaultdict(list)
    for key, group in by_book.items():
        group.sort(key=lambda r: r["number"] or 0)
        for i, r in enumerate(group):
            if r.get("unit"):
                continue
            # 앞으로 가장 가까운 세부, 뒤로 가장 가까운 세부
            back = None
            for j in range(i - 1, max(-1, i - 1 - REACH), -1):
                if group[j].get("unit"):
                    back = group[j]["unit"]
                    break
            ahead = None
            for j in range(i + 1, min(len(group), i + 1 + REACH)):
                if group[j].get("unit"):
                    ahead = group[j]["unit"]
                    break
            if back and back == ahead:
                plan[(key[1], key[2], back)].append(r)

    filled = sum(len(v) for v in plan.values())
    print("세부가 빈 문항 %d개" % sum(1 for r in rows if not r.get("unit")), file=log)
    print("앞뒤가 같아 물려받을 수 있는 것 %d개" % filled, file=log)
    for key in sorted(plan, key=lambda k: -len(plan[k]))[:14]:
        print("   [%d] %-20s %-22s %d개" % (key[0], key[1], key[2], len(plan[key])), file=log)

    flat = [(k, r) for k, v in plan.items() for r in v]
    print("\n뽑아 본 것", file=log)
    for key, r in random.Random(3).sample(flat, min(10, len(flat))):
        body = " / ".join(str(b) for b in (r.get("body") or []))
        print("── %s › %s" % (key[1], key[2]), file=log)
        print("   %s %s" % (str(r.get("prompt") or "")[:44], body[:64]), file=log)

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

# -*- coding: utf-8 -*-
"""맞대어 놓은 결과에서 무작위로 뽑아 눈으로 볼 수 있게 늘어놓는다.

교재를 여럿 한꺼번에 넣을 때, 교재마다 몇 개씩 뽑아 답이 맞는지 직접 본다.
숫자만 보고 넣으면 어긋난 답이 섞여 들어간다.

  python scripts/grammar-bank/sample_check.py 6          교재마다 6개씩
  python scripts/grammar-bank/sample_check.py 6 워크북     이름에 그 말이 든 것만
"""
import glob, io, json, random, sys
from pathlib import Path

OUT = Path("tmp-grammar-bank")


def main(each=6, only=None, seed=None):
    log = io.open(1, "w", encoding="utf-8", closefd=False)
    rng = random.Random(seed if seed is not None else 20260930)
    for path in sorted(glob.glob(str(OUT / "*-matched.json"))):
        name = Path(path).stem.replace("-matched", "")
        if only and only not in name:
            continue
        rows = json.loads(Path(path).read_text(encoding="utf-8"))
        if not rows:
            print("\n══ %s — 없음" % name, file=log)
            continue
        print("\n══ %s (%d문항)" % (name, len(rows)), file=log)
        for q in rng.sample(rows, min(each, len(rows))):
            ask = (q.get("prompt") or q.get("instruction") or "").strip()
            body = q.get("body") or ([q["text"]] if q.get("text") else [])
            print("  · %s" % ask[:56], file=log)
            print("    %s" % " / ".join(str(b) for b in body)[:88], file=log)
            picks = q.get("choices") or []
            if picks:
                print("    보기: %s" % " ".join(str(c.get("text", c))[:16] for c in picks), file=log)
            print("    답: %s" % str(q.get("answer"))[:62], file=log)
    log.flush()


if __name__ == "__main__":
    args = sys.argv[1:]
    main(int(args[0]) if args else 6, args[1] if len(args) > 1 else None,
         int(args[2]) if len(args) > 2 else None)

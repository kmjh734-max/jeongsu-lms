# -*- coding: utf-8 -*-
"""그래머큐 여섯 권을 통째로 돌린다 — 본책 문항 뽑기 · 정답지 읽기 · 맞대기.

정답지 읽기가 오래 걸리므로(한 권 7분쯤) 한 줄로 이어서 돌린다.
이미 만들어 둔 파일은 건너뛴다.

  python scripts/grammar-bank/gq_run_all.py
"""
import io, os, subprocess, sys, time
from pathlib import Path

SRC = Path("참고파일/중등 문법")
OUT = Path("tmp-grammar-bank")
PY = sys.executable
HERE = Path("scripts/grammar-bank")

BOOKS = [
    ("starter1", "그래머큐_Starter 1권_.pdf", "그래머큐_START 1_정답.pdf"),
    ("starter2", "그래머큐_Starter 2권.pdf", "그래머큐_Starter 2 정답.pdf"),
    ("inter1", "그래머큐_Intermediate 1권_.pdf", "그래머큐_Intermediate 1 정답.pdf"),
    ("inter2", "그래머큐_Intermediate 2권.pdf", "그래머큐_Intermediate 2_정답.pdf"),
    ("adv1", "그래머큐_Advanced 1권.pdf", "그래머큐_ADVAN 1_정답.pdf"),
    ("adv2", "그래머큐_Advanced 2권.pdf", "그래머큐_Advanced 2_정답.pdf"),
]

log = io.open(1, "w", encoding="utf-8", closefd=False)


def run(args):
    r = subprocess.run([PY] + args, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode != 0:
        print("     실패: %s" % (r.stderr or "")[-400:], file=log, flush=True)
    return r


def main():
    OUT.mkdir(exist_ok=True)
    t0 = time.time()
    for key, book, answer in BOOKS:
        print("\n══ %s (%.0f분째)" % (key, (time.time() - t0) / 60), file=log, flush=True)
        q = OUT / ("gq-%s.json" % key)
        box = OUT / ("gq-%s-box.json" % key)
        ans = OUT / ("gq-%s-ans.json" % key)
        matched = OUT / ("gq-%s-matched.json" % key)
        bad = OUT / ("gq-%s-bad.json" % key)

        if not q.exists():
            print("  문항 뽑는 중…", file=log, flush=True)
            r = run([str(HERE / "gq_extract.py"), str(SRC / book), str(q)])
            print("   " + (r.stdout or "").strip().replace("\n", "\n   "), file=log, flush=True)
        if not box.exists():
            print("  정답지 읽는 중… (7분쯤)", file=log, flush=True)
            r = run([str(HERE / "gq_answers_ocr.py"), str(SRC / answer), str(box)])
            print("   " + (r.stdout or "").strip().split("\n")[-1], file=log, flush=True)
        run([str(HERE / "gq_answers_parse.py"), str(box), str(ans)])
        r = run([str(HERE / "gq_match.py"), str(q), str(ans), str(matched), str(bad)])
        print("   " + (r.stdout or "").strip().replace("\n", "\n   "), file=log, flush=True)
    print("\n모두 끝. %.0f분" % ((time.time() - t0) / 60), file=log, flush=True)


if __name__ == "__main__":
    main()

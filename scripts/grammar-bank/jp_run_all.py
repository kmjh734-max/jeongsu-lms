# -*- coding: utf-8 -*-
"""잘 풀리는 영문법 세 권을 통째로 돌린다 — 본책 문항 뽑기 · 정답지 읽기 · 맞대기.

정답지의 짜임은 그래머큐와 같다(연한 상자 · 초록 번호 · 검은 답)므로 읽는 일은
gq_answers_ocr.py 를 그대로 쓴다. 머리말 읽는 법만 다르다.

2권 해설 파일은 폴더에 없다 — 그 책은 정답 없이 문항만 남는다.

  python scripts/grammar-bank/jp_run_all.py
"""
import io, subprocess, sys, time
from pathlib import Path

SRC = Path("참고파일/중등 문법")
OUT = Path("tmp-grammar-bank")
PY = sys.executable
HERE = Path("scripts/grammar-bank")

BOOKS = [
    ("jp-1", "잘풀리는영문법_1권.pdf", "잘 풀리는 영문법 1_정답 및 해설.pdf"),
    ("jp-2", "잘풀리는영문법_2권.pdf", None),
    ("jp-3", "잘풀리는영문법_3권.pdf", "잘풀리는영문법3권_해설.pdf"),
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
        q = OUT / ("%s.json" % key)
        # 문항 뽑기는 빠르므로 늘 다시 한다 (뽑는 규칙을 고쳤을 수 있다)
        r = run([str(HERE / "jp_extract.py"), str(SRC / book), str(q)])
        print("   " + (r.stdout or "").strip().replace("\n", "\n   "), file=log, flush=True)
        if not answer:
            print("   정답 파일이 없어 문항만 둔다", file=log, flush=True)
            continue
        box = OUT / ("%s-box.json" % key)
        ans = OUT / ("%s-ans.json" % key)
        if not box.exists():
            print("  정답지 읽는 중…", file=log, flush=True)
            r = run([str(HERE / "gq_answers_ocr.py"), str(SRC / answer), str(box)])
            print("   " + (r.stdout or "").strip().split("\n")[-1], file=log, flush=True)
        r = run([str(HERE / "jp_answers_parse.py"), str(box), str(ans)])
        print("   " + (r.stdout or "").strip().split("\n")[0], file=log, flush=True)
        r = run([str(HERE / "jp_match.py"), str(q), str(ans),
                 str(OUT / ("%s-matched.json" % key)), str(OUT / ("%s-bad.json" % key))])
        print("   " + (r.stdout or "").strip().replace("\n", "\n   "), file=log, flush=True)
    print("\n모두 끝. %.0f분" % ((time.time() - t0) / 60), file=log, flush=True)


if __name__ == "__main__":
    main()

# -*- coding: utf-8 -*-
"""새 교재 아홉 권을 밤새 돌려 문제 은행에 넣는다.

  1) 그래머큐 여섯 권   — 문항 뽑기 · 정답지 읽기 · 맞대기
  2) 잘 풀리는 세 권    — 같은 일 (2권은 정답 파일이 없어 문항만)
  3) 은행 형식으로 맞추기 (단원은 지금 은행의 54단원으로 보낸다)
  4) 변형 만들기 (원본은 넣지 않는다 — 변형이 곧 우리 문항이다)
  5) DB 적재
  6) 난이도 다시 매기기

바깥 서비스는 부르지 않는다. 글자 읽기도 이 컴퓨터에서 한다.
이미 만들어 둔 파일은 건너뛴다.

  python scripts/grammar-bank/night_run.py
"""
import io, subprocess, sys, time
from pathlib import Path

OUT = Path("tmp-grammar-bank")
HERE = Path("scripts/grammar-bank")
PY = sys.executable
log = io.open(1, "w", encoding="utf-8", closefd=False)


def step(title, args, node=False):
    print("\n━━ %s" % title, file=log, flush=True)
    head = ["node"] if node else [PY]
    r = subprocess.run(head + args, capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    body = (r.stdout or "").strip()
    if body:
        print("   " + body.replace("\n", "\n   "), file=log, flush=True)
    if r.returncode != 0:
        print("   ※ 멈춤: %s" % (r.stderr or "")[-600:], file=log, flush=True)
    return r.returncode == 0


def main():
    OUT.mkdir(exist_ok=True)
    t0 = time.time()
    step("그래머큐 여섯 권", [str(HERE / "gq_run_all.py")])
    step("잘 풀리는 세 권", [str(HERE / "jp_run_all.py")])
    if not step("은행 형식으로 맞추기", [str(HERE / "new_books_to_bank.py"), str(OUT / "new-bank.json")]):
        return
    if not step("변형 만들기", [str(HERE / "make_variants.py"),
                            str(OUT / "new-bank.json"), str(OUT / "new-variants.json")]):
        return
    if not step("DB 적재", [str(HERE / "import_new_books.mjs")], node=True):
        return
    step("난이도 다시 매기기", [str(HERE / "grade-tiers.mjs")], node=True)
    print("\n모두 끝. %.0f분" % ((time.time() - t0) / 60), file=log, flush=True)


if __name__ == "__main__":
    main()

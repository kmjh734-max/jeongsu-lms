# -*- coding: utf-8 -*-
"""정답지를 최종 코드로 다시 읽고 끝까지 돌린다.

밤새 고쳐 가며 돌린 탓에 책마다 읽은 코드가 다르다. 한 번 더 통째로 읽어
같은 기준으로 맞춘다. 그 뒤 변형 → 적재 → 난이도까지 이어 간다.

  python scripts/grammar-bank/final_run.py
"""
import glob, io, os, subprocess, sys, time
from pathlib import Path

OUT = Path("tmp-grammar-bank")
HERE = Path("scripts/grammar-bank")
PY = sys.executable
log = io.open(1, "w", encoding="utf-8", closefd=False)


def step(title, args, node=False):
    print("\n━━ %s" % title, file=log, flush=True)
    r = subprocess.run((["node"] if node else [PY]) + args, capture_output=True,
                       text=True, encoding="utf-8", errors="replace")
    body = (r.stdout or "").strip()
    if body:
        print("   " + body.replace("\n", "\n   "), file=log, flush=True)
    if r.returncode != 0:
        print("   ※ 멈춤: %s" % (r.stderr or "")[-600:], file=log, flush=True)
    return r.returncode == 0


def main():
    t0 = time.time()
    for f in glob.glob(str(OUT / "*-box.json")):
        os.remove(f)
    print("정답지를 처음부터 다시 읽는다", file=log, flush=True)
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
    step("결과 정리", [str(HERE / "night_report.py")])
    print("\n모두 끝. %.0f분" % ((time.time() - t0) / 60), file=log, flush=True)


if __name__ == "__main__":
    main()

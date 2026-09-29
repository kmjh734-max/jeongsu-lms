# -*- coding: utf-8 -*-
"""정답지 여러 권을 한꺼번에 읽는다.

한 권을 읽는 데 오래 걸린다. 이 기계는 코어가 열둘이니 한 권에 넷씩 나눠 주고
세 권을 함께 돌리면 한 줄로 돌리는 것보다 훨씬 빠르다.
이미 읽어 둔 권은 건너뛴다.

  python scripts/grammar-bank/read_answers_parallel.py [함께 돌릴 권 수]
"""
import io, os, subprocess, sys, time
from pathlib import Path

SRC = Path("참고파일/중등 문법")
OUT = Path("tmp-grammar-bank")
HERE = Path("scripts/grammar-bank")
PY = sys.executable
log = io.open(1, "w", encoding="utf-8", closefd=False)

BOOKS = [
    ("gq-starter1", "그래머큐_START 1_정답.pdf"),
    ("gq-starter2", "그래머큐_Starter 2 정답.pdf"),
    ("gq-inter1", "그래머큐_Intermediate 1 정답.pdf"),
    ("gq-inter2", "그래머큐_Intermediate 2_정답.pdf"),
    ("gq-adv1", "그래머큐_ADVAN 1_정답.pdf"),
    ("gq-adv2", "그래머큐_Advanced 2_정답.pdf"),
    ("jp-1", "잘 풀리는 영문법 1_정답 및 해설.pdf"),
    ("jp-3", "잘풀리는영문법3권_해설.pdf"),
]


def main(at_once=3, threads=4):
    OUT.mkdir(exist_ok=True)
    env = dict(os.environ)
    for name in ("OMP_NUM_THREADS", "MKL_NUM_THREADS", "OPENBLAS_NUM_THREADS"):
        env[name] = str(threads)

    todo = [(k, f) for k, f in BOOKS if not (OUT / ("%s-box.json" % k)).exists()]
    print("읽을 정답지 %d권 (한 번에 %d권씩)" % (len(todo), at_once), file=log, flush=True)

    t0 = time.time()
    live = []
    while todo or live:
        while todo and len(live) < at_once:
            key, name = todo.pop(0)
            box = OUT / ("%s-box.json" % key)
            # 몇 쪽까지 읽었는지 따로 적어 둔다 — 오래 걸리는 일이라 눈으로 볼 길이 있어야 한다
            trail = open(str(OUT / ("%s-읽는중.log" % key)), "w", encoding="utf-8")
            proc = subprocess.Popen([PY, str(HERE / "gq_answers_ocr.py"), str(SRC / name), str(box)],
                                    stdout=trail, stderr=subprocess.PIPE, env=env)
            proc._trail = trail
            live.append((key, proc))
            print("  시작 %s" % key, file=log, flush=True)
        done = []
        for key, proc in live:
            if proc.poll() is None:
                continue
            done.append((key, proc))
            getattr(proc, "_trail", None) and proc._trail.close()
            err = (proc.stderr.read() or b"").decode("utf-8", "replace")[-300:]
            mark = "끝" if proc.returncode == 0 else "실패 " + err
            print("  %s %s (%.0f분째)" % (key, mark, (time.time() - t0) / 60), file=log, flush=True)
        for item in done:
            live.remove(item)
        if live and not done:
            time.sleep(10)
    print("정답지 읽기 모두 끝. %.0f분" % ((time.time() - t0) / 60), file=log, flush=True)


if __name__ == "__main__":
    main(int(sys.argv[1]) if len(sys.argv) > 1 else 3)

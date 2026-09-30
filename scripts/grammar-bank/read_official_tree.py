# -*- coding: utf-8 -*-
"""족보닷컴 「개념완성」에서 단원마다 세부 갈래를 걷어 낸다.

선생님 결정(2026-09-30): 세부 트리는 원래 쓰던 족보닷컴 것을 따른다.

개념완성 쪽머리에 갈래가 번호로 적혀 있다.
    ◾ to부정사
    1. 명사적 용법
      1) 주어 …  2) 목적어 …  3) 보어 …
    2. 형용사적 용법
    3. 부사적 용법
      1) 목적 …  2) 감정의 원인 …

큰 번호(1. 2. 3.)를 세부 단원으로 삼는다. 작은 번호는 그 아래 설명이라 쓰지 않는다.

  python scripts/grammar-bank/read_official_tree.py [out.json]
"""
import collections, glob, io, json, os, re, sys
from pathlib import Path

import fitz

log = io.open(1, "w", encoding="utf-8", closefd=False)
ROOT = "참고파일/중등 문법/족보닷컴 영문법"
LEVEL = {"1. 기초": 1, "2. 기본": 2, "3. 심화": 3, "4. 완성": 4}

# 「1. 명사적 용법」 — 줄 첫머리의 큰 번호
BIG = re.compile(r"^\s*(\d{1,2})\.\s*(\S[^\n]{1,40})$")
# 파일 이름의 「[기초] 10.to부정사_개념완성」
FROM_NAME = re.compile(r"\[[^\]]+\]\s*(\d{1,2})\.\s*(.+?)_개념완성")


def level_of(path):
    for key, lv in LEVEL.items():
        if key in path:
            return lv
    return None


# 개념 설명이 끝나고 문제가 시작되는 자리
EXERCISE = re.compile(r"^\s*([A-Z]\.|※|연습|확인문제|다음 우리말|다음 문장)")
# 갈래 이름이 아니라 우리말 뜻풀이·예문인 줄
SENTENCE = re.compile(r"(다|요|까|자|네|음)\s*[.?!]?\s*$|[.?!]|\d+\s*살")


def units_of(pdf):
    """한 단원의 세부 갈래 — 나온 차례대로, 겹치는 것은 한 번만

    개념 설명 부분만 읽는다. 문제로 넘어가면 그 쪽은 더 보지 않는다. 문제의
    보기·정답도 「1. 2. 3.」으로 시작해서 그냥 두면 갈래로 잘못 들어온다.
    """
    doc = fitz.open(pdf)
    out = []
    for page in doc:
        for line in page.get_text().split("\n"):
            flat = line.rstrip()
            if EXERCISE.match(flat):
                break                      # 이 쪽은 여기서부터 문제다
            hit = BIG.match(flat)
            if not hit:
                continue
            no, title = int(hit.group(1)), hit.group(2).strip()
            # 예문 줄(「1. He likes to eat pizza.」)은 갈래가 아니다
            if re.search(r"[A-Za-z]{3,}\s+[A-Za-z]{3,}", title):
                continue
            title = re.sub(r"\s{2,}.*$", "", title).strip(" .·-")
            if not title or len(title) > 40:
                continue
            if not re.search(r"[가-힣]", title):
                continue
            if SENTENCE.search(title):     # 뜻풀이·예문이다
                continue
            if (no, title) not in out:
                out.append((no, title))
    # 번호가 1부터 차례로 늘어나는 묶음만 갈래로 본다
    kept, want = [], 1
    for no, title in out:
        if no == want:
            kept.append(title)
            want += 1
    return kept


def main(dst="tmp-grammar-bank/official-units.json"):
    files = glob.glob(os.path.join(ROOT, "**", "*개념완성*.pdf"), recursive=True)
    # 같은 단원에 잠긴 것과 풀린 것이 함께 있으면 풀린 것을 쓴다
    best = {}
    for f in files:
        hit = FROM_NAME.search(os.path.basename(f))
        lv = level_of(f)
        if not hit or not lv:
            continue
        key = (lv, int(hit.group(1)), hit.group(2).strip())
        if key not in best or "unlocked" in f:
            best[key] = f

    tree = {}
    empty = []
    for key in sorted(best):
        lv, no, name = key
        try:
            units = units_of(best[key])
        except Exception as err:
            units = []
            print("   %s 읽다 멈춤: %s" % (os.path.basename(best[key]), err), file=log)
        if units:
            tree["%d|%d|%s" % (lv, no, name)] = units
        else:
            empty.append("[%d] %d. %s" % (lv, no, name))

    Path(dst).write_text(json.dumps(tree, ensure_ascii=False, indent=1), encoding="utf-8")
    print("단원 %d곳에서 세부를 걷었다 (못 걷은 곳 %d)" % (len(tree), len(empty)), file=log)
    for key in sorted(tree)[:12]:
        print("   %-24s %s" % (key, " · ".join(tree[key])), file=log)
    if empty:
        print("\n못 걷은 단원", file=log)
        for e in empty[:16]:
            print("   %s" % e, file=log)
    log.flush()


if __name__ == "__main__":
    main(*sys.argv[1:2])

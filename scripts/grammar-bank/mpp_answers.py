# -*- coding: utf-8 -*-
"""문제로 풀자 정답및해설에서 「실전문제 PLUS」의 답만 읽는다.

정답지 짜임
    CHAPTER 01 TEST            p. 2      ← Gotham-Black 7.6/9.7/13
      01 ③   02 ①   03 ④   04 ④   05 ③   ← 번호는 주황 Gotham-Bold 9, 답도 9
      17 (1)He does not〔doesn’t〕 remember
         my name.  (2)Does he remember my name?   ← 번호 없는 줄은 그 줄에서 가장
                                                     오른쪽 번호의 이어짐
    01 빈칸 뒤에 be동사 are가 왔으므로 …    ← 해설. 번호는 똑같이 주황 9 이지만
                                            뒤따르는 글이 8.0~8.5 로 작다

세 가지로 가린다.
  · 답과 해설은 **글자 크기**로 가른다 — 번호 뒤의 글이 8.8 이상이면 답이다.
  · 번호 없는 줄은 **그 줄에서 가장 오른쪽 번호**의 답이 넘어온 것이다.
    (답이 길면 다음 줄로 넘어가고, 그 줄에는 다른 번호가 들어서지 않는다.)
  · 단원 머리글은 쪽 가운데에도 나온다. 쪽 단위로 단원을 바꾸면 앞 단원의
    남은 답이 뒤 단원으로 넘어가므로, 머리글을 만나는 그 자리에서 바꾼다.

단원 번호가 없는 구역(중간·기말 대비 TEST)은 머리글이 그림이라 글자층에 없다.
번호가 01로 되돌아가는 것으로 알아보고 건너뛴다 — 들여놓으면 단원 TEST 의 같은
번호에 엉뚱한 답이 붙는다.

  python scripts/grammar-bank/mpp_answers.py "…정답 및 해설.pdf" out.json
"""
import io, json, re, sys
from pathlib import Path

import fitz

LOG = io.open(1, "w", encoding="utf-8", closefd=False)
HEAD_FONT = "Gotham-Black"
NUM_FONT = "Gotham-Bold"
# 번호에 쓰는 빛깔은 권마다 다르다(L1 주황, L3 파랑). 그래서 빛깔을 못 박지
# 않고, 검지 않은 Gotham-Bold 번호면 번호로 본다.
DARK = (0x231F20, 0x000000, 0xFFFFFF)
SMALL = 8.8          # 이보다 작은 글은 해설이다
ROW = 6.0            # 이만큼 차이가 나면 다른 줄이다


def lines_of(page):
    """왼쪽 칸을 다 읽고 오른쪽 칸으로 넘어간다.

    오른쪽 칸이 왼쪽 칸보다 위에서 시작해, 높이만으로 줄을 세우면 오른쪽 칸의
    첫 줄이 단원 머리글보다 먼저 와 앞 단원에 붙는다.
    """
    cut = page.rect.width / 2
    out = []
    for block in page.get_text("dict")["blocks"]:
        for ln in block.get("lines", []):
            spans = [q for q in ln["spans"] if q["text"].strip()]
            if spans:
                out.append({"x": ln["bbox"][0], "y": ln["bbox"][1], "spans": spans})
    out.sort(key=lambda r: (0 if r["x"] < cut else 1, r["y"], r["x"]))
    return out


def joined(spans):
    made, last = [], None
    for q in spans:
        if last is not None and q["bbox"][0] - last > 1.0 and made and not made[-1].endswith(" "):
            made.append(" ")
        made.append(q["text"])
        last = q["bbox"][2]
    return re.sub(r"\s+", " ", re.sub(r"[\x00-\x08\x0b-\x1f]", " ", "".join(made))).strip()


def head_in(row):
    """「CHAPTER NN TEST」 머리글이면 그 번호"""
    for q in row["spans"]:
        if q["font"].startswith(HEAD_FONT) and 8 < q["size"] < 12:
            got = re.fullmatch(r"(\d{1,2})", q["text"].strip())
            if got:
                return int(got.group(1))
    return None


def main(src, dst):
    doc = fitz.open(src)
    out = []
    chapter = [None]
    said = []            # [번호, 답] — 쪽에 적힌 차례대로
    line = []            # 지금 줄에 들어선 번호들의 자리 (said 의 몇 번째인가)
    line_y = [None]
    skip = [False]

    def close():
        if said and chapter[0] and not skip[0]:
            out.append({"chapter_no": chapter[0], "section": "실전문제 PLUS",
                        "pieces": [{"no": n, "text": t} for n, t in said]})
        said.clear()
        line.clear()
        line_y[0] = None

    for page in doc:
        for row in lines_of(page):
            got = head_in(row)
            if got is not None:
                close()
                chapter[0] = got
                skip[0] = False
                continue
            if chapter[0] is None:
                continue
            # 한 줄에 번호가 여럿 들어서기도 한다 — 「14 Should he lock  15 ②」.
            # 그래서 줄의 첫 조각만 보지 않고, 주황 번호가 나올 때마다 끊는다.
            parts, tail = [], []
            for q in row["spans"]:
                mark = (re.fullmatch(r"(\d{1,2})(?:\s+(\d))?", q["text"].strip())
                        if (q["font"].startswith(NUM_FONT)
                            and q.get("color") not in DARK)
                        else None)
                if mark:
                    parts.append([int(mark.group(1) + (mark.group(2) or "")), []])
                elif parts:
                    parts[-1][1].append(q)
                else:
                    tail.append(q)
            if not parts:
                # 번호 없는 줄 — 그 줄에서 가장 오른쪽 번호의 답이 넘어온 것이다
                if (tail and line and not skip[0]
                        and all(round(q["size"], 1) >= SMALL for q in tail)):
                    at = max(line)[1]
                    said[at][1] = (said[at][1] + " " + joined(tail)).strip()
                continue
            for no, mine in parts:
                if not mine or any(round(q["size"], 1) < SMALL for q in mine):
                    continue                  # 해설이다
                text = joined(mine).strip()
                if not text:
                    continue
                if no <= 2 and said and max(n for n, _ in said) >= 5:
                    close()
                    skip[0] = True
                    continue
                if skip[0]:
                    continue
                if line_y[0] is None or abs(row["y"] - line_y[0]) > ROW:
                    line.clear()
                    line_y[0] = row["y"]
                said.append([no, text])
                line.append((mine[0]["bbox"][0], len(said) - 1))
    close()

    Path(dst).write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print("실전문제 PLUS 정답 묶음 %d개 저장 (답 %d개): %s"
          % (len(out), sum(len(b["pieces"]) for b in out), dst), file=LOG)
    for b in out[:2]:
        print("   단원%s — %s" % (b["chapter_no"],
              [(p["no"], p["text"][:14]) for p in b["pieces"]][:8]), file=LOG)
    LOG.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])

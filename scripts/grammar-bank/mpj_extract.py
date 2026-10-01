# -*- coding: utf-8 -*-
"""문제로 풀자 중학영문법(YBM) 본책에서 문항을 뽑는다.

쪽 짜임
    POINT N  제목                       ← Gotham-Bold 29 번호 + TTOmniGothicH 17.7 제목
      CHECK  지시문                      ← Gotham-Black 8.5
        1 They ( do not / does not ) …   ← Gotham-Medium 10
      PRACTICE                          ← Gotham-Black 9.5
        A 다음 문장을 부정문으로 바꿔 쓰시오.   ← Gotham-Bold 15.4 (지시문이 붙어 있다)
          1 I have a lot of magazines.

정답지가 「POINT 1 | … p. 14」로 본책 쪽을 적어 두어 자리를 하나로 정해 준다.

  python scripts/grammar-bank/mpj_extract.py "…본책.pdf" out.json
"""
import collections, io, json, re, sys
from pathlib import Path

import fitz

sys.path.insert(0, str(Path(__file__).parent))
from gq_extract import BLANK, blank_rules, put_blanks

CIRCLED = "①②③④⑤⑥⑦⑧⑨⑩"
LETTERED = "ⓐⓑⓒⓓⓔⓕ"
TAG_FONT = "Gotham-Black"        # CHECK · PRACTICE 표시
MARK_FONT = "Gotham-Bold"        # 묶음 A·B·C (와 POINT 번호)
ITEM_FONT = "Gotham-Medium"      # 문항 번호
TITLE_FONT = "TTOmniGothicH"     # POINT 제목·단원 이름
ASK_FONT = ("YDVYGOStd", "SDGothic")

CHECK = "CHECK"
PRACTICE = "PRACTICE"
TEST = "실전 TEST"


def lines_of(page):
    lines = []
    for block in page.get_text("dict")["blocks"]:
        for ln in block.get("lines", []):
            spans = [{"x": q["bbox"][0], "x1": q["bbox"][2], "t": q["text"]}
                     for q in ln["spans"] if q["text"].strip()]
            if not spans:
                continue
            sp = ln["spans"][0]
            lines.append({"x": ln["bbox"][0], "y": ln["bbox"][1], "bottom": ln["bbox"][3],
                          "x1": ln["bbox"][2], "font": sp["font"], "size": round(sp["size"], 1),
                          "spans": spans, "blanks": []})
    put_blanks([ln for ln in lines
                if not ln["font"].startswith((TAG_FONT, "Gotham-Bold", TITLE_FONT, "DIN"))],
               blank_rules(page))
    for ln in lines:
        parts = [dict(q) for q in ln["spans"]]
        parts += [{"x": x, "x1": x, "t": BLANK} for x in ln["blanks"]]
        parts.sort(key=lambda q: q["x"])
        made, last = [], None
        for q in parts:
            if last is not None and q["x"] - last > 1.2 and made and not made[-1].endswith(" "):
                made.append(" ")
            made.append(q["t"])
            last = q["x1"]
        ln["text"] = re.sub(r"\s+", " ", "".join(made)).strip()
    lines.sort(key=lambda ln: (ln["y"], ln["x"]))
    return lines


FOOT = re.compile(r"^CHAPTER\s*(\d{1,2})\s*(.*?)\s*(\d{1,3})$")


def page_head(rows, page):
    """POINT 번호·제목, 그리고 꼬리말에서 단원 번호·이름·인쇄 쪽.

    꼬리말이 「CHAPTER 02 동사33」처럼 한 줄로 붙어 있어 거기서 셋을 다 얻는다.
    """
    point = title = printed = chapter_no = chapter = None
    h = page.rect.height
    for r in rows:
        t = r["text"]
        if r["font"].startswith("Gotham-Bold") and r["size"] > 20 and re.fullmatch(r"\d{1,2}", t):
            point = int(t)
        if r["font"].startswith(TITLE_FONT) and 14 < r["size"] < 22 and re.search(r"[가-힣]", t):
            title = t
        if r["y"] > h - 55:
            got = FOOT.match(t)
            if got:
                chapter_no = int(got.group(1))
                chapter = got.group(2).strip() or None
                printed = int(got.group(3))
    return point, title, printed, chapter_no, chapter


def unfold(text):
    m = re.match(r"^(\d{1,2})\s*(.*)$", text)
    return (int(m.group(1)), (m.group(2) or "").strip()) if m else (None, None)


def heads_in(rows, font, lo_hi, cut=None):
    out = []
    for r in rows:
        if not r["font"].startswith(font) or not (lo_hi[0] <= r["size"] <= lo_hi[1]):
            continue
        no, rest = unfold(r["text"])
        if no is None or no == 0 or rest[:1].isdigit():
            continue
        r["_head"] = True
        out.append({"no": no, "x": r["x"], "y": r["y"], "lead": rest,
                    "col": 0 if (cut is None or r["x"] < cut) else 1})
    return out


def ask_after(rows, y0, y1):
    """묶음 표시 뒤에 따로 적힌 지시문을 줍는다.

    이 책은 「A」 와 지시문을 다른 줄에 앉혀 둔다. 표시 줄만 보면 지시문이
    통째로 빠져, 학생이 무엇을 할지 모르는 문항이 된다. 찾은 줄도 함께
    돌려주어 첫 문항의 본문으로 섞여 들어가지 않게 한다.
    """
    said = [r for r in rows if y0 - 6 <= r["y"] < y1
            and r["font"].startswith(ASK_FONT) and re.search(r"[가-힣]", r["text"])]
    said.sort(key=lambda r: (r["y"], r["x"]))
    return " ".join(r["text"] for r in said).strip(), said


def lead_for(mark, rows, heads):
    """묶음의 지시문 — 표시 줄에 붙어 있으면 그것, 없으면 아래 줄에서 줍는다"""
    said = mark["text"][1:].strip() if mark else ""
    if said or not heads:
        return said, []
    first = min(h["y"] for h in heads)
    return ask_after(rows, mark["y"] if mark else first, first - 4)


def gather(rows, heads, cut):
    order = sorted(heads, key=lambda h: (h["col"], h["y"], h["x"]))
    for h in heads:
        h["prompt"], h["body"], h["choices"] = [], [], []
        if h["lead"][:1] in CIRCLED:
            h["choices"] = [h["lead"]]
        elif h["lead"]:
            h["body"] = [h["lead"]]

    def owner(r):
        best = None
        c = 0 if (cut is None or r["x"] < cut) else 1
        for h in order:
            if h["col"] == c and (r["y"] > h["y"] - 4
                                  or (abs(r["y"] - h["y"]) < 4 and r["x"] >= h["x"])):
                best = h
        return best

    for r in rows:
        if r.get("_head"):
            continue
        t = r["text"]
        if not t:
            continue
        h = owner(r)
        if h is None:
            continue
        bare = t.lstrip(" _")
        if bare[:1] in CIRCLED or (bare[:1] in LETTERED and len(bare) > 2):
            h["choices"].append(bare)
        elif ((r["font"].startswith(ASK_FONT) and re.search(r"[가-힣]", t) and len(t) > 8)
              or re.search(r"(?:시오\.?|것은\?|하시오|쓰시오|고르시오|고르면\?)\s*$", t)):
            h["prompt"].append(t)
        else:
            h["body"].append(t)
    return heads


def pack(heads, lead, carry, block, kind):
    out = []
    for h in sorted(heads, key=lambda h: (h["col"], h["no"])):
        body = [b for b in h["body"] if b.strip()]
        picked = [c for c in h["choices"] if c.strip() and re.sub(r"[_\s]", "", c[1:]).strip()]
        spread = []
        for c in picked:
            tag = "[①-⑩]" if c[0] in CIRCLED else "[ⓐ-ⓕ]"
            inner = re.findall(tag + "(?:(?!" + tag + ").)*", c)
            spread += [x.strip() for x in inner] if len(inner) > 1 else [c]
        choices = []
        for c in spread:
            if not c.strip():
                continue
            seat = (CIRCLED.index(c[0]) + 1 if c[0] in CIRCLED else LETTERED.index(c[0]) + 1)
            choices.append({"no": seat, "text": re.sub(r"(?:\s*_{3,})+$", "", c[1:]).strip()})
        if not body and not choices:
            continue
        head = lead if isinstance(lead, str) else lead.get(h["col"], "")
        prompt = " ".join(([head] if head else []) + h["prompt"]).strip()
        prompt = re.sub(r"^(?:_+\s*)+|(?:\s*_+)+$", "", prompt).strip()
        # 쪽 가운데에서 POINT 가 바뀌면, 그 위 문항은 앞 POINT 의 것이다
        cut_y = carry.get("split_y")
        mine_run = (carry.get("prev_run")
                    if (cut_y is not None and h["y"] < cut_y) else carry.get("run"))
        out.append({"printed_page": carry.get("printed"),
                    "chapter_no": carry.get("chapter_no"), "chapter": carry.get("chapter"),
                    "point_no": carry.get("point"), "run": mine_run,
                    "unit": carry.get("title"),
                    "section": kind, "block": block, "no": h["no"],
                    "prompt": prompt, "body": body, "choices": choices, "bank": [],
                    "question_kind": "객관식" if choices else "단답·서술"})
    return out


def parse_page(page, carry, page_no=None):
    rows = lines_of(page)
    point, title, printed, chapter_no, chapter = page_head(rows, page)
    # 꼬리말은 홀수 쪽에만 찍혀 있다. 그런데 꼬리말이 있는 99쪽 모두 PDF 쪽과
    # 인쇄 쪽이 같았다 — 그러니 짝수 쪽은 PDF 쪽을 그대로 쓴다. 앞 쪽의 번호를
    # 들고 가다 쪽이 어긋나던 것이 여기서 났다.
    if printed is None and page_no is not None:
        printed = page_no
    elif printed is not None and page_no is not None and printed != page_no:
        carry.setdefault("odd", []).append((page_no, printed))
    # POINT 머리글이 쪽 가운데 있으면 그 위는 앞 POINT, 그 아래는 새 POINT 다.
    # 쪽 전체를 새 POINT 로 보내면 앞 POINT 의 답이 통째로 어긋난다.
    mark_y = None
    for r in rows:
        if (r["font"].startswith("Gotham-Bold") and r["size"] > 20
                and re.fullmatch(r"\d{1,2}", r["text"])):
            mark_y = r["y"]
    before = carry.get("point")
    if printed:
        carry["printed"] = printed
    if mark_y is not None:
        # POINT 머리글을 만날 때마다 차례를 하나씩 올린다. 번호(단원·POINT)는
        # 꼬리말 없는 쪽에서 어긋나지만, 나온 차례는 정답지와 똑같다.
        carry["run"] = carry.get("run", 0) + 1
        carry["open"] = None
    if point:
        carry["point"] = point
    carry["split_y"] = mark_y
    carry["prev_run"] = carry.get("run", 0) - 1 if mark_y is not None else carry.get("run", 0)
    if title:
        carry["title"] = title
    if chapter_no:
        carry["chapter_no"] = chapter_no
    if chapter:
        carry["chapter"] = chapter

    h = page.rect.height
    body = [r for r in rows if 40 < r["y"] < h - 40]
    out = []

    # 묶음이 쪽을 넘어가면 표시가 앞 쪽에만 있다 — 열어 둔 묶음에 이어 붙인다
    tags0 = [r for r in body if r["font"].startswith(TAG_FONT)
             and re.match(r"^(CHECK|PRACTICE)", r["text"])]
    if not tags0:
        marks0 = [r for r in body if r["font"].startswith(MARK_FONT) and 13 < r["size"] < 18
                  and re.match(r"^[A-F](\s|$)", r["text"])]
        marks0.sort(key=lambda r: r["y"])
        spans, first = [], (marks0[0]["y"] - 2 if marks0 else h)
        if carry.get("open") is not None and first > 80:
            spans.append((carry["open"], 0, first, carry.get("open_ask", "")))
        for j, m in enumerate(marks0):
            spans.append((ord(m["text"][0]) - ord("A"), m["y"] - 2,
                          marks0[j + 1]["y"] - 2 if j + 1 < len(marks0) else h,
                          m["text"][1:].strip()))
        if marks0:
            carry["open"] = ord(marks0[-1]["text"][0]) - ord("A")
            carry["open_ask"] = marks0[-1]["text"][1:].strip()
        for block, lo, hi, said in spans:
            part = [r for r in body if lo <= r["y"] < hi and r not in marks0]
            heads = heads_in(part, ITEM_FONT, (9, 12))
            if not heads:
                continue
            if not said:
                said, used = ask_after(part, lo, min(h["y"] for h in heads) - 4)
                part = [r for r in part if r not in used]
            out += pack(gather(part, heads, None), said, carry, block, PRACTICE)
        return out

    # CHECK 와 PRACTICE 구역을 가른다
    tags = [r for r in body if r["font"].startswith(TAG_FONT)
            and re.match(r"^(CHECK|PRACTICE)", r["text"])]
    tags.sort(key=lambda r: r["y"])
    for i, tag in enumerate(tags):
        top = tag["y"] - 2
        bottom = tags[i + 1]["y"] - 2 if i + 1 < len(tags) else h
        mine = [r for r in body if top <= r["y"] < bottom]
        name = CHECK if tag["text"].startswith("CHECK") else PRACTICE
        if name == CHECK:
            said = re.sub(r"^CHECK\s*", "", tag["text"]).strip()
            part = [r for r in mine if r is not tag]
            heads = heads_in(part, ITEM_FONT, (9, 12))
            if heads:
                if not said:
                    said, used = ask_after(part, tag["y"], min(h["y"] for h in heads) - 4)
                    part = [r for r in part if r not in used]
                out += pack(gather(part, heads, None), said, carry, 0, CHECK)
            continue
        marks = [r for r in mine if r["font"].startswith(MARK_FONT) and 13 < r["size"] < 18
                 and re.match(r"^[A-F](\s|$)", r["text"])]
        marks.sort(key=lambda r: r["y"])
        for j, m in enumerate(marks):
            lo = m["y"] - 2
            hi = marks[j + 1]["y"] - 2 if j + 1 < len(marks) else bottom
            part = [r for r in mine if lo <= r["y"] < hi and r is not m]
            heads = heads_in(part, ITEM_FONT, (9, 12))
            if not heads:
                continue
            said, used = lead_for(m, part, heads)
            part = [r for r in part if r not in used]
            out += pack(gather(part, heads, None), said, carry,
                        ord(m["text"][0]) - ord("A"), PRACTICE)
        if marks:
            carry["open"] = ord(marks[-1]["text"][0]) - ord("A")
            carry["open_ask"] = marks[-1]["text"][1:].strip()
    return out


def main(src, dst):
    doc = fitz.open(src)
    carry = {}
    out = []
    for page_no, page in enumerate(doc, 1):
        for row in parse_page(page, carry, page_no):
            row["book"] = Path(src).stem
            out.append(row)
    Path(dst).write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    log = io.open(1, "w", encoding="utf-8", closefd=False)
    print("문제로 풀자 문항 %d개 저장: %s" % (len(out), dst), file=log)
    for k, n in collections.Counter(r["section"] for r in out).most_common():
        print("   %-14s %d문항" % (k, n), file=log)
    if carry.get("odd"):
        print("   ! 꼬리말 쪽과 PDF 쪽이 다른 곳 %d군데: %s"
              % (len(carry["odd"]), carry["odd"][:5]), file=log)
    print("   단원 %s · POINT %d가지 · 인쇄 쪽 %d가지"
          % (sorted({r["chapter_no"] for r in out if r["chapter_no"]}),
             len({r["point_no"] for r in out}), len({r["printed_page"] for r in out})), file=log)
    log.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])

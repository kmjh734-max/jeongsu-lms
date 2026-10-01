# -*- coding: utf-8 -*-
"""열중 16강 문법 본책에서 문항을 뽑는다.

한 Chapter 는 두 강(UNIT)이고, 강마다 두 쪽이다. 그 뒤에 시험 쪽이 붙는다.
    강 쪽          묶음 A~E, 묶음마다 지시문 한 줄 + 번호 문항
                   ← Oz-ExtraboldItalic 15.2 묶음 / HelveticaNeueLTStd-Md 10.4 번호
                   오른쪽에 「Grammar Tips」 설명칸이 있어 들이지 않는다
    내신 적중 테스트  01~25번, 두 칸. 보기는 ①~⑤
                   ← Router-Medium 11.9 번호(두 자리) / YDVYGOStd53 10.5 보기
    서술형 내공 Up   묶음 A~E, 두 칸
                   ← Router-Medium 14.8 묶음 / Router-Medium 9.9~10.4 번호

쪽 제목이 글자가 아니라 그림으로 박혀 있어, 쪽의 생김새로 어떤 꼴인지 가린다.
정답지가 「p. 12」 「p. 16」 처럼 본책 쪽을 적어 두어 자리를 검산할 수 있다.

  python scripts/grammar-bank/yj_extract.py "…본책.pdf" out.json
"""
import collections, io, json, re, sys
from pathlib import Path

import fitz

sys.path.insert(0, str(Path(__file__).parent))
from gq_extract import BLANK, blank_rules, put_blanks

CIRCLED = "①②③④⑤⑥⑦⑧⑨⑩"
LETTERED = "ⓐⓑⓒⓓⓔⓕ"
ASK_FONT = "YDVYGOStd54"              # 지시문 (9.5)
UNIT_MARK = "Oz-ExtraboldItalic"      # 강 쪽의 묶음 A~E
TEST_FONT = "Router-Medium"           # 시험 번호·서술형 묶음
UNIT_ITEM = "HelveticaNeueLTStd-Md"   # 강 쪽의 번호
PICK_FONT = "YDVYGOStd53"             # 시험 보기
TAG_FONT = "YDVYGOStd25"              # 「자주 나와요」·「어려워요」·「서술형」
TIPS = "Oz-BoldItalic"                # 「Grammar Tips」
WORDS = "Router-MediumItalic"         # 「Words」 꼬리말
FOOT = re.compile(r"Chapter\s*(\d{1,2})\s+(\d{1,3})\s*$")
RANGE = re.compile(r"^\s*\[(\d{1,2})\s*[-~]\s*(\d{1,2})\]\s*(.*)$")

UNIT_PAGE = "UNIT"
TEST_PAGE = "내신 적중 테스트"
WRITE_PAGE = "서술형 내공 Up"
OX_PAGE = "문법정리 OX"


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
    # 표시 글줄에는 빈칸을 붙이지 않는다 — 붙으면 「A」가 「A _____」가 된다
    put_blanks([ln for ln in lines
                if not ln["font"].startswith((UNIT_MARK, TEST_FONT, "Oz-Bold", "RockwellStd",
                                              TAG_FONT, "DINPro", "SangSangTitle"))],
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


def page_head(rows, page):
    """인쇄 쪽, 그리고 어떤 꼴의 쪽인가"""
    printed = None
    h = page.rect.height
    for r in rows:
        if r["y"] < h - 55:
            continue
        got = FOOT.search(r["text"])
        if got:
            printed = int(got.group(2))
        elif re.fullmatch(r"\d{1,3}", r["text"]) and r["x"] < 60:
            printed = int(r["text"])
    body = [r for r in rows if 48 < r["y"] < h - 55]
    unit_marks = [r for r in body if r["font"].startswith(UNIT_MARK)
                  and 13 < r["size"] < 18 and re.fullmatch(r"[A-F]", r["text"])]
    write_marks = [r for r in body if r["font"].startswith(TEST_FONT)
                   and 13 < r["size"] < 17 and re.fullmatch(r"[A-F]", r["text"])]
    # 시험 번호는 「01」처럼 두 자리로 적는다 — 「접어서 풀어보세요」 쪽과 이것으로 갈린다
    test_nos = [r for r in body if r["font"].startswith(TEST_FONT)
                and 11 < r["size"] < 13 and re.match(r"^\d\d(\s|$)", r["text"])]
    if unit_marks:
        return printed, UNIT_PAGE
    if write_marks:
        return printed, WRITE_PAGE
    if len(test_nos) >= 3:
        return printed, TEST_PAGE
    # 문법정리 OX — 한 자리 번호가 죽 늘어서고, 「O」·「X」를 묻는 지시문이 있다
    ox_nos = [r for r in body if r["font"].startswith(TEST_FONT)
              and 11 < r["size"] < 13 and re.match(r"^\d\s", r["text"])]
    said_ox = [r for r in body if r["font"].startswith(ASK_FONT) and "O" in r["text"]
               and "X" in r["text"]]
    if len(ox_nos) >= 5 and said_ox:
        return printed, OX_PAGE
    return printed, None


def unfold(text):
    """「1You looks happy today.」 처럼 번호에 붙어 온 것을 가른다"""
    m = re.match(r"^(\d{1,2})\s*(.*)$", text)
    return (int(m.group(1)), (m.group(2) or "").strip()) if m else (None, None)


def heads_in(rows, font, lo_hi, two_digit=False, cut=None):
    out = []
    for r in rows:
        if not r["font"].startswith(font) or not (lo_hi[0] <= r["size"] <= lo_hi[1]):
            continue
        if two_digit and not re.match(r"^\d\d(?!\d)", r["text"]):
            continue
        no, rest = unfold(r["text"])
        if no is None or no == 0 or rest[:1].isdigit():
            continue
        r["_head"] = True
        out.append({"no": no, "x": r["x"], "y": r["y"], "lead": rest,
                    "col": 0 if (cut is None or r["x"] < cut) else 1})
    return out


def words_of(row):
    """<보기> 낱말을 조각 자리와 원래 띄어쓰기로 가른다"""
    marks, last = [], None
    for q in row["spans"]:
        if last is not None and q["x"] - last > 6:
            marks.append(None)
        pieces = re.split(r"\s{2,}", q["t"])
        for j, piece in enumerate(pieces):
            if j:
                marks.append(None)
            marks.append(piece.strip() or None)
        last = q["x1"]
    out, now = [], []
    for piece in marks:
        if piece is None:
            if now:
                out.append(" ".join(now))
                now = []
        else:
            now.append(piece)
    if now:
        out.append(" ".join(now))
    return out


def bank_of(rows):
    """「보기 do is don't isn't my your」 — 「보기」로 시작하는 줄"""
    for r in rows:
        if r["text"].startswith("보기") and len(r["text"]) > 4:
            got = words_of(r)
            if got and got[0].startswith("보기"):
                got[0] = got[0][2:].strip()
            got = [w for w in got if w]
            if len(got) > 1:
                return got, [r]
    return [], []


def gather(rows, heads, cut):
    order = sorted(heads, key=lambda h: (h["col"], h["y"]))
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
            if h["col"] == c and r["y"] >= h["y"] - 5:
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
        elif (r["font"].startswith(ASK_FONT) and r["size"] >= 9
              and re.search(r"[가-힣]", t) and len(t) > 8):
            h["prompt"].append(t)
        else:
            h["body"].append(t)
    return heads


def asks(rows, heads, cut):
    """묶음 지시문 — 그 칸의 첫 번호보다 위에 있는 한국말 줄들"""
    out = {}
    for c in ({0} if cut is None else {0, 1}):
        mine = [h for h in heads if h["col"] == c]
        if not mine:
            continue
        top = min(h["y"] for h in mine)
        said = [r for r in rows if r["font"].startswith(ASK_FONT) and r["size"] >= 9
                and r["y"] < top
                and (cut is None or (r["x"] < cut) == (c == 0))
                and re.search(r"[가-힣]", r["text"])]
        said.sort(key=lambda r: r["y"])
        if not said:
            out[c] = ""
            continue
        # 지시문이 두 줄로 넘어간 것만 이어 붙인다. 끝맺은 줄(「~나타낸다.」)은
        # 강의 머리말이므로 끌어오지 않는다.
        pick = [said[-1]]
        for r in reversed(said[:-1]):
            if pick[0]["y"] - r["y"] < 22 and not re.search(r"[.오요다]$", r["text"]):
                pick.insert(0, r)
            else:
                break
        out[c] = " ".join(r["text"] for r in pick)
    return out


def pack(heads, lead, carry, block, kind, bank):
    out = []
    for h in sorted(heads, key=lambda h: (h["col"], h["no"])):
        body = [b for b in h["body"] if b.strip()]
        picked = [c for c in h["choices"] if c.strip() and re.sub(r"[_\s]", "", c[1:]).strip()]
        spread = []
        for c in picked:
            head = "[①-⑩]" if c[0] in CIRCLED else "[ⓐ-ⓕ]"
            inner = re.findall(head + "(?:(?!" + head + ").)*", c)
            spread += [x.strip() for x in inner] if len(inner) > 1 else [c]
        choices = []
        for c in spread:
            if not c.strip():
                continue
            tag = c[0]
            seat = CIRCLED.index(tag) + 1 if tag in CIRCLED else LETTERED.index(tag) + 1
            choices.append({"no": seat, "text": c[1:].strip()})
        if not body and not choices:
            continue
        head = lead.get(h["col"], "")
        prompt = " ".join(([head] if head else []) + h["prompt"]).strip()
        # 발문·보기 양끝에 붙어 온 빈칸은 문항의 일부가 아니다
        prompt = re.sub(r"^(?:_+\s*)+|(?:\s*_+)+$", "", prompt).strip()
        for c in choices:
            c["text"] = re.sub(r"(?:\s*_{3,})+$", "", c["text"]).strip()
        wide = kind != UNIT_PAGE
        out.append({"printed_page": carry.get("printed"),
                    "chapter_no": carry.get("chapter_no"), "chapter": carry.get("chapter"),
                    "unit_no": None if wide else carry.get("unit_no"),
                    "unit": None if wide else carry.get("unit"),
                    "section": kind, "block": block, "no": h["no"],
                    "prompt": prompt, "body": body, "choices": choices, "bank": bank,
                    "question_kind": "객관식" if choices else "단답·서술"})
    return out


def parse_page(page, carry):
    rows = lines_of(page)
    h = page.rect.height

    # ── 단원 가름 쪽 ──
    if any(r["font"].startswith("RockwellStd") and r["size"] > 30 for r in rows):
        nums = [r for r in rows if r["font"].startswith("RockwellStd") and r["size"] > 60
                and re.fullmatch(r"\d{1,2}", r["text"])]
        names = [r for r in rows if r["font"].startswith(ASK_FONT) and r["size"] > 17
                 and re.search(r"[가-힣]", r["text"])]
        if nums:
            carry["chapter_no"] = int(nums[0]["text"])
        if names:
            carry["chapter"] = names[0]["text"]
        carry["unit_no"] = carry["unit"] = None
        carry["open_block"] = None
        return []

    printed, kind = page_head(rows, page)
    if printed:
        carry["printed"] = printed
    # 강 번호·이름은 강의 첫 쪽에만 큰 글씨로 한 번 나온다
    uno = [r for r in rows if r["font"].startswith("Oz-Bold") and r["size"] > 30
           and re.fullmatch(r"\d{1,2}", r["text"])]
    if uno:
        carry["unit_no"] = int(uno[0]["text"])
        carry["open_block"] = None
        names = [r for r in rows if r["font"].startswith(ASK_FONT) and 16 < r["size"] < 22
                 and re.search(r"[가-힣]", r["text"])]
        carry["unit"] = names[0]["text"] if names else carry.get("unit")
    if kind is None:
        return []

    foot = [r for r in rows if r["font"].startswith(WORDS) and r["text"].startswith("Words")]
    floor = min(r["y"] for r in foot) - 4 if foot else h - 58
    body = [r for r in rows if 48 < r["y"] < min(floor, h - 58)
            and not r["font"].startswith((TAG_FONT, WORDS, "Oz-Bold", "RockwellStd"))]
    out = []

    if kind == UNIT_PAGE:
        # 오른쪽 「Grammar Tips」 설명칸은 문항이 아니다
        tips = [r for r in rows if r["font"].startswith(TIPS) and "Grammar" in r["text"]]
        edge = min(r["x"] for r in tips) - 10 if tips else 450.0
        body = [r for r in body if r["x"] < edge]
        marks = [r for r in body if r["font"].startswith(UNIT_MARK)
                 and 13 < r["size"] < 18 and re.fullmatch(r"[A-F]", r["text"])]
        marks.sort(key=lambda r: r["y"])
        # 한 묶음이 쪽을 넘어가기도 한다 (표시는 앞 쪽, 문항은 다음 쪽). 첫 표시보다
        # 위에 있는 문항은 앞 쪽에서 열어 둔 묶음의 것이다.
        spans = []
        first = marks[0]["y"] - 6 if marks else h
        if carry.get("open_block") is not None and first > 100:
            spans.append((carry["open_block"], 0, first))
        for i, m in enumerate(marks):
            spans.append((ord(m["text"]) - ord("A"), m["y"] - 6,
                          marks[i + 1]["y"] - 6 if i + 1 < len(marks) else h))
        if marks:
            carry["open_block"] = ord(marks[-1]["text"]) - ord("A")
        for block, top, bottom in spans:
            mine = [r for r in body if top <= r["y"] < bottom and r not in marks]
            bank, used = bank_of(mine)
            mine = [r for r in mine if r not in used]
            heads = heads_in(mine, UNIT_ITEM, (9.5, 11.5))
            if not heads:
                continue
            out += pack(gather(mine, heads, None), asks(mine, heads, None), carry,
                        block, UNIT_PAGE, bank)

    elif kind == WRITE_PAGE:
        marks = [r for r in body if r["font"].startswith(TEST_FONT)
                 and 13 < r["size"] < 17 and re.fullmatch(r"[A-F]", r["text"])]
        marks.sort(key=lambda r: (0 if r["x"] < 315 else 1, r["y"]))
        for i, m in enumerate(marks):
            side = 0 if m["x"] < 315 else 1
            later = [q for q in marks[i + 1:] if (0 if q["x"] < 315 else 1) == side]
            top, bottom = m["y"] - 6, (later[0]["y"] - 6 if later else h)
            mine = [r for r in body if top <= r["y"] < bottom and r is not m
                    and (r["x"] < 315) == (side == 0)]
            bank, used = bank_of(mine)
            mine = [r for r in mine if r not in used]
            heads = heads_in(mine, TEST_FONT, (9.5, 11.0))
            if not heads:
                continue
            out += pack(gather(mine, heads, None), asks(mine, heads, None), carry,
                        ord(m["text"]) - ord("A"), WRITE_PAGE, bank)

    elif kind == OX_PAGE:
        # 오른쪽 칸은 접어서 가리는 답·풀이 자리다. 문항에서는 빼고, 풀이는 해설로
        # 가져온다. 왼쪽의 작은 글씨는 문법 이름표이므로 버린다.
        mine = [r for r in body if r["x"] < 310 and r["size"] >= 9]
        folded = [r for r in body if r["x"] >= 310]
        labels = sorted([r for r in body if r["x"] < 310 and r["size"] < 9
                         and re.search(r"[가-힣]", r["text"])], key=lambda r: r["y"])
        heads = heads_in(mine, TEST_FONT, (11.0, 13.0))
        if heads:
            got = pack(gather(mine, heads, None), asks(mine, heads, None), carry, 0, OX_PAGE, [])
            order = sorted(heads, key=lambda x: x["y"])
            spot = {h["no"]: (h["y"], order[i + 1]["y"] if i + 1 < len(order) else h["y"] + 70)
                    for i, h in enumerate(order)}
            for g in got:
                top, bottom = spot.get(g["no"], (None, None))
                if top is None:
                    continue
                said = [r["text"] for r in folded if top - 6 <= r["y"] < bottom - 6
                        and not r["text"].startswith("▶")]
                if said:
                    g["explanation"] = re.sub(r"\s+", " ", " ".join(said)).strip()
                near = [r for r in labels if r["y"] < top]
                if near:
                    g["point"] = near[-1]["text"]
            out += got

    elif kind == TEST_PAGE:
        # [01-03] 처럼 여러 문항이 함께 쓰는 지시문은 번호로 나눠 준다
        shared, keep = [], []
        for r in body:
            got = RANGE.match(r["text"])
            if got and r["font"].startswith(ASK_FONT):
                shared.append((int(got.group(1)), int(got.group(2)), got.group(3).strip()))
            else:
                keep.append(r)
        heads = heads_in(keep, TEST_FONT, (11.0, 13.0), two_digit=True, cut=10000.0)
        if heads:
            # 칸 가름선은 번호가 선 자리에서 잰다. 한 값으로 못 박으면 오른쪽 칸
            # (x≈313) 보기가 왼쪽 문항으로 섞여 든다.
            xs = sorted({round(h["x"]) for h in heads})
            far = [x for x in xs if x > xs[0] + 60]
            cut = (far[0] - 6) if far else 10000.0
            for hd in heads:
                hd["col"] = 0 if hd["x"] < cut else 1
            packed = pack(gather(keep, heads, cut), {}, carry, 0, TEST_PAGE, [])
            for g in packed:
                for lo, hi, said in shared:
                    if lo <= g["no"] <= hi and said:
                        g["prompt"] = said
            out += packed
    return out


def main(src, dst):
    doc = fitz.open(src)
    carry = {}
    out = []
    for page in doc:
        for row in parse_page(page, carry):
            row["book"] = Path(src).stem
            out.append(row)
    Path(dst).write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    log = io.open(1, "w", encoding="utf-8", closefd=False)
    print("열중 16강 문항 %d개 저장: %s" % (len(out), dst), file=log)
    for k, n in collections.Counter(r["section"] for r in out).most_common():
        print("   %-18s %d문항" % (k, n), file=log)
    print("   단원 %s · 강 %d가지 · 인쇄 쪽 %d가지"
          % (sorted({r["chapter_no"] for r in out if r["chapter_no"]}),
             len({(r["chapter_no"], r["unit_no"]) for r in out}),
             len({r["printed_page"] for r in out})), file=log)
    log.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])

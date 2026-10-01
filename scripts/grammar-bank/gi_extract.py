# -*- coding: utf-8 -*-
"""Grammar Inside 본책에서 문항을 뽑는다.

쪽 짜임이 단원마다 똑같다.
    UNIT 쪽      설명 + CHECK UP (ⓐⓑⓒ 중 고르기)      ← VAGRounded "CHECK UP"
    PRACTICE 쪽  STEP 1~4, 묶음마다 지시문 한 줄        ← DINPro-Black "STEP" + 숫자
    GRAMMAR FOR WRITING  A·B·C·D 묶음                  ← DINPro-Bold 14, 왼쪽 끝
    REVIEW TEST  1~33번, 두 칸으로 벌어진다             ← DINPro-Black 15
    LET'S REVIEW 정답지에 답이 없어 건너뛴다

정답지가 「CHECK UP p.24」 「PRACTICE p.25」 「pp.34-37」 처럼 **본책 인쇄 쪽**으로
가리키므로, 쪽 번호를 꼭 들고 간다. (묶음, 번호)까지 더하면 자리가 하나로 정해진다.

  python scripts/grammar-bank/gi_extract.py "…본책.pdf" out.json
"""
import collections, io, json, re, sys
from pathlib import Path

import fitz

sys.path.insert(0, str(Path(__file__).parent))
from gq_extract import BLANK, blank_rules, put_blanks

CIRCLED = "①②③④⑤⑥⑦⑧⑨⑩"
LETTERED = "ⓐⓑⓒⓓⓔⓕ"
ASK_FONT = "YDVYGOStd53"          # 지시문
NUM_FONT = "DINPro-Black"         # REVIEW TEST 번호·STEP 숫자
MARK_FONT = "DINPro-Bold"         # Grammar for Writing 묶음 A·B·C·D
ITEM_FONT = "HelveticaNeueLTStd-Bd"
FOOT = re.compile(r"Chapter\s*(\d{1,2})\s*(.*)$")
COL = [320.0]                   # 칸 가름선 — 쪽마다 다시 잰다
TAG_FONT = "SDGothicNeoRound"   # 「빈출」·「서술형」 꼬리표
REVIEW = "LET" + chr(39) + "S REVIEW"
RANGE = re.compile(r"^\s*\[(\d{1,2})[-~](\d{1,2})\]\s*(.*)$")


def col_of(r):
    return 0 if r["x"] < COL[0] else 1


def measure_cols(heads):
    """번호가 선 자리를 보고 두 칸의 가름선을 잰다.

    왼쪽 쪽은 여백이 56, 오른쪽 쪽은 85에서 시작해 쪽마다 다르다. 하나로 못 박으면
    오른쪽 칸 문항이 왼쪽 것으로 섞인다.
    """
    xs = sorted({round(r["x"]) for r in heads})
    if not xs:
        return 10000.0
    far = [x for x in xs if x > xs[0] + 60]
    return (far[0] - 12) if far else 10000.0


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
    # 표시 글줄(STEP·번호·꼬리말)에는 빈칸을 붙이지 않는다. 붙이면 「3」이
    # 「3 _____」이 되어 표시로 알아보지 못한다 — 「보기」 네모의 테두리선이
    # 바로 옆에 있어 실제로 그런 일이 난다.
    put_blanks([ln for ln in lines
                if not ln["font"].startswith(("DINPro", "VAGRound", "Gotham", "HelveticaLTStd"))],
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
    """인쇄 쪽, 단원 번호·이름, 어떤 꼴의 쪽인가"""
    printed = chapter_no = chapter = None
    kinds = set()
    h = page.rect.height
    for r in rows:
        t = r["text"]
        if r["font"].startswith("Gotham") and r["y"] > h - 60 and re.fullmatch(r"\d{1,3}", t):
            printed = int(t)
        if r["y"] > h - 60:
            got = FOOT.search(t)
            if got:
                chapter_no, chapter = int(got.group(1)), got.group(2).strip()
        if r["font"].startswith("VAGRound") and "CHECK" in t:
            kinds.add("CHECK UP")
        if r["font"].startswith(NUM_FONT) and r["size"] > 18:
            if t.startswith("PRACTICE"):
                kinds.add("PRACTICE")
            elif t.startswith("REVIEW TEST"):
                kinds.add("REVIEW TEST")
            elif t.startswith("GRAMMAR FOR WRITING"):
                kinds.add("GRAMMAR FOR WRITING")
            elif t.startswith("LET"):
                kinds.add(REVIEW)
    return printed, chapter_no, chapter, kinds


def unit_of(rows):
    """UNIT 번호·이름 — 쪽 왼쪽 위에 큰 숫자, 이름은 YDVYGOStd55 28"""
    no = name = None
    for r in rows:
        if r["font"].startswith(NUM_FONT) and r["size"] > 40 and re.fullmatch(r"\d{1,2}", r["text"]):
            no = int(r["text"])
        if r["font"].startswith("YDVYGOStd55") and 24 < r["size"] < 34 and re.search(r"[가-힣]", r["text"]):
            name = r["text"]
    return no, name


def unfold(text):
    """「12 ① Amy has long hair.」 처럼 번호에 붙어 온 것을 가른다"""
    m = re.match(r"^(\d{1,2})\s*(.*)$", text)
    return (int(m.group(1)), (m.group(2) or "").strip()) if m else (None, None)


def items_of(body, number_font, lo_hi, one_col):
    """번호 줄을 찾는다"""
    heads = []
    for r in body:
        if not r["font"].startswith(number_font):
            continue
        if lo_hi and not (lo_hi[0] <= r["size"] <= lo_hi[1]):
            continue
        no, rest = unfold(r["text"])
        # Starter 는 묶음마다 「0」번으로 보기 예시를 보여 준다 — 문항이 아니다
        if no is None or no == 0 or rest[:1].isdigit():
            continue
        r["_head"] = True
        heads.append({"no": no, "x": r["x"], "y": r["y"], "lead": rest,
                      "col": 0 if one_col else col_of(r)})
    return heads


def asks(body, heads, one_col):
    """묶음 지시문 — 첫 번호보다 위에 있는 한국말 줄"""
    out = {}
    for c in ({0} if one_col else {0, 1}):
        mine = [h for h in heads if h["col"] == c]
        if not mine:
            continue
        top = min(h["y"] for h in mine)
        said = [r for r in body if r["font"].startswith(ASK_FONT) and r["y"] < top
                and (one_col or col_of(r) == c) and re.search(r"[가-힣]", r["text"])]
        out[c] = max(said, key=lambda r: r["y"])["text"] if said else ""
    return out


def gather(body, heads, one_col):
    """번호마다 본문·보기를 담는다"""
    order = sorted(heads, key=lambda h: (h["col"], h["y"]))
    for h in heads:
        h["prompt"], h["body"], h["choices"] = [], [], []
        if h["lead"][:1] in CIRCLED:
            h["choices"] = [h["lead"]]
        elif h["lead"]:
            h["body"] = [h["lead"]]

    def owner(r):
        best = None
        c = 0 if one_col else col_of(r)
        for h in order:
            if h["col"] == c and r["y"] >= h["y"] - 5:
                best = h
        return best

    for r in body:
        if r.get("_head"):
            continue
        t = r["text"]
        if not t or t.strip() in ("STEP", "보기"):
            continue
        h = owner(r)
        if h is None:
            continue
        if t[:1] in CIRCLED or (t[:1] in LETTERED and len(t) > 2):
            h["choices"].append(t)
        elif r["font"].startswith(ASK_FONT) and re.search(r"[가-힣]", t) and len(t) > 8:
            h["prompt"].append(t)
        else:
            h["body"].append(t)
    return heads


def words_of(row):
    """한 줄을 낱말 묶음으로 가른다.

    <보기> 낱말은 사이를 넓게 띄워 늘어놓는다. 줄 글을 한 칸으로 줄여 놓으면
    「should doesn’t have to should not」처럼 한 덩어리가 되어 쓸 수 없다.
    그래서 조각의 자리(x)와 원래 띄어쓰기를 함께 본다.
    """
    marks, last = [], None
    for q in row["spans"]:
        if last is not None and q["x"] - last > 6:
            marks.append(None)
        pieces = re.split(r"\s{2,}", q["t"])
        for j, piece in enumerate(pieces):
            if j:
                marks.append(None)       # 넓게 띄운 자리가 낱말의 경계다
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


def bank_of(body, lo, hi):
    """<보기> 낱말과, 그 낱말이 적힌 줄들.

    그 줄은 지시문도 본문도 아니다. 돌려주어 담기지 않게 한다 — 안 그러면
    「ⓐ ~할 수 있다 ⓑ ~해도 좋다」가 발문 자리에 앉는다.
    """
    for r in body:
        if lo <= r["y"] < hi and r["text"].strip() in ("보기", "<보기>"):
            same = [q for q in body if abs(q["y"] - r["y"]) < 9 and q["x"] > r["x"] + 10]
            if same:
                return words_of(min(same, key=lambda q: q["x"])), [r] + same
    return [], []


def pack(heads, lead, carry, block, kind):
    out = []
    for h in sorted(heads, key=lambda h: (h["col"], h["no"])):
        body = [b for b in h["body"] if b.strip()]
        # 서술형 문항의 ⓐ·ⓑ 빈칸은 보기가 아니다
        picked = [c for c in h["choices"]
                  if c.strip() and re.sub(r"[_\s]", "", c[1:]).strip()]
        # 「ⓐ ② ⓑ ③ ⓒ ④ ⓓ」 처럼 한 줄에 몰려 온 것은 갈라 놓는다
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
        out.append({"printed_page": carry.get("printed"),
                    "chapter_no": carry.get("chapter_no"), "chapter": carry.get("chapter"),
                    "unit_no": carry.get("unit_no"), "unit": carry.get("unit"),
                    "section": kind, "block": block, "no": h["no"],
                    "prompt": prompt, "body": body, "choices": choices, "bank": [],
                    "question_kind": "객관식" if choices else "단답·서술"})
    return out


def parse_page(page, carry):
    rows = lines_of(page)
    printed, chapter_no, chapter, kinds = page_head(rows, page)
    if printed:
        carry["printed"] = printed
    if chapter_no:
        carry["chapter_no"], carry["chapter"] = chapter_no, chapter
    # 단원 번호는 가름 쪽에서 가져온다. 꼬리말은 홀수 쪽에만 있어, 그것만 믿으면
    # CHECK UP 쪽이 앞 단원을 그대로 물려받아 한 칸씩 밀린다.
    if any(r["text"].startswith("CHAPTER") for r in rows):
        carry["flow"] = None
        nums = [r for r in rows if r["font"].startswith("DINPro")
                and r["size"] > 60 and re.fullmatch(r"\d{1,2}", r["text"])]
        names = [r for r in rows if r["font"].startswith("YDVYGOStd55")
                 and r["size"] > 24 and re.search(r"[가-힣]", r["text"])]
        if nums:
            carry["chapter_no"] = int(nums[0]["text"])
        if names:
            carry["chapter"] = names[0]["text"]
        carry["unit_no"] = carry["unit"] = None
        return []
    uno, uname = unit_of(rows)
    if uno:
        carry["unit_no"], carry["unit"] = uno, uname or carry.get("unit")
    # REVIEW TEST·GRAMMAR FOR WRITING 은 여러 쪽에 걸치고 머리글은 첫 쪽에만 있다
    if kinds:
        carry["flow"] = kinds
    elif carry.get("flow") and carry["flow"] & {"REVIEW TEST", "GRAMMAR FOR WRITING"}:
        kinds = carry["flow"]
    if REVIEW in kinds or not kinds:
        carry["flow"] = None
        return []

    h = page.rect.height
    body = [r for r in rows if 45 < r["y"] < h - 50]
    out = []

    if "CHECK UP" in kinds:
        tag = [r for r in body if r["font"].startswith("VAGRound") and "CHECK" in r["text"]]
        top = min(r["y"] for r in tag) - 6 if tag else 0
        # 레벨 2·3 은 CHECK UP 오른쪽에 「PLUS」 설명칸을 같은 높이로 둔다. 안 자르면
        # 그 설명이 발문·본문으로 섞여 든다.
        plus = [r for r in body if r["font"].startswith("VAGRound") and "PLUS" in r["text"]]
        edge = min(r["x"] for r in plus) - 12 if plus else 10000.0
        mine = [r for r in body if r["y"] >= top and r["x"] < edge]
        heads = items_of(mine, ITEM_FONT, (9, 12), True)
        if heads:
            lead = asks(mine, heads, True)
            out += pack(gather(mine, heads, True), lead, carry, 0, "CHECK UP")

    if "PRACTICE" in kinds:
        steps = []
        for r in body:
            if r["font"].startswith(NUM_FONT) and 13 < r["size"] < 19 and re.fullmatch(r"[1-9]", r["text"]):
                near = [q for q in body if abs(q["y"] - r["y"]) < 14 and q["text"].strip() == "STEP"]
                if near:
                    steps.append((int(r["text"]), min(r["y"], near[0]["y"]) - 5))
        steps.sort(key=lambda s: s[1])
        for i, (n, top) in enumerate(steps):
            bottom = steps[i + 1][1] if i + 1 < len(steps) else h
            mine = [r for r in body if top <= r["y"] < bottom
                    and not (r["font"].startswith(NUM_FONT) and r["size"] < 19)]
            heads = items_of(mine, ITEM_FONT, (9, 12), True)
            if not heads:
                continue
            lead = asks(mine, heads, True)
            bank, used = bank_of(mine, top, bottom)
            mine = [r for r in mine if r not in used]
            heads = items_of(mine, ITEM_FONT, (9, 12), True)
            lead = asks(mine, heads, True)
            got = pack(gather(mine, heads, True), lead, carry, n, "PRACTICE")
            for g in got:
                g["bank"] = bank
            out += got

    if "GRAMMAR FOR WRITING" in kinds:
        marks = [r for r in body if r["font"].startswith(MARK_FONT) and 12 < r["size"] < 17
                 and r["x"] < 110 and re.fullmatch(r"[A-F]", r["text"])]
        marks.sort(key=lambda r: r["y"])
        for i, m in enumerate(marks):
            top = m["y"] - 10
            bottom = marks[i + 1]["y"] - 10 if i + 1 < len(marks) else h
            mine = [r for r in body if top <= r["y"] < bottom and r is not m]
            heads = items_of(mine, ITEM_FONT, (10, 12), True)
            if not heads:
                continue
            lead = asks(mine, heads, True)
            bank, used = bank_of(mine, top, bottom)
            mine = [r for r in mine if r not in used]
            heads = items_of(mine, ITEM_FONT, (10, 12), True)
            lead = asks(mine, heads, True)
            got = pack(gather(mine, heads, True), lead, carry,
                       ord(m["text"]) - ord("A"), "GRAMMAR FOR WRITING")
            for g in got:
                g["bank"] = bank
            out += got

    if "REVIEW TEST" in kinds:
        mine = [r for r in body if not r["text"].startswith("REVIEW TEST")
                and not r["font"].startswith(TAG_FONT)]
        # [9-10] 처럼 여러 문항이 함께 쓰는 지시문은 번호로 나눠 준다. 그 줄 자체는
        # 어느 문항의 것도 아니므로 담지 않는다 — 담으면 앞 문항에 붙는다.
        shared, mine = [], list(mine)
        keep = []
        for r in mine:
            got = RANGE.match(r["text"])
            if got and r["font"].startswith(ASK_FONT):
                shared.append((int(got.group(1)), int(got.group(2)), got.group(3).strip()))
            else:
                keep.append(r)
        mine = keep
        numbers = items_of(mine, NUM_FONT, (13, 18), False)
        if numbers:
            COL[0] = measure_cols(numbers)
            for h in numbers:
                h["col"] = 0 if h["x"] < COL[0] else 1
            packed = pack(gather(mine, numbers, False), {}, carry, 0, "REVIEW TEST")
            for g in packed:
                for lo, hi, said in shared:
                    if lo <= g["no"] <= hi:
                        g["prompt"] = (said + " " + g["prompt"]).strip() if not said else said
            out += packed
        COL[0] = 320.0
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
    print("Grammar Inside 문항 %d개 저장: %s" % (len(out), dst), file=log)
    for k, n in collections.Counter(r["section"] for r in out).most_common():
        print("   %-22s %d문항" % (k, n), file=log)
    print("   단원 %d가지 · 인쇄 쪽 %d가지"
          % (len({r["chapter_no"] for r in out}), len({r["printed_page"] for r in out})), file=log)
    log.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])

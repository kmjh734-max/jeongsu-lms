# -*- coding: utf-8 -*-
"""그래머큐 본책에서 문항을 뽑는다.

쪽 배치가 글꼴로 갈린다.
  지시문   TTMGothicB 9.5pt
  STEP     BauhausStd-Bold "STEP" + 숫자
  문항 번호 DIN-Bold 11pt
  문항 글   HelveticaNeueLTStd 11pt
  꼬리말    "36  Chapter 02  명사"

두 단이지만 한 STEP이 왼쪽 단에서 오른쪽 단으로 이어진다(왼 1~9, 오른 10~18).
그래서 단으로 가르지 않고, STEP 표시의 높이로 띠를 만들어 그 띠에 든 문항을 묶는다.

몇 쪽(학습 구성 안내)은 글꼴에 유니코드 표가 없어 한글이 깨져 나온다. 그런 쪽은 건너뛴다.

  python scripts/grammar-bank/gq_extract.py "참고파일/중등 문법/그래머큐_Starter 1권_.pdf" out.json
"""
import io, json, re, sys
from pathlib import Path
import fitz

NUM_FONT = "DIN-Bold"
INSTR_FONT = "TTMGothic"
STEP_FONT = "BauhausStd"
# 꼬리말은 쪽 번호와 단원 이름이 따로 떨어져 있다 — 단원 쪽만 본다
FOOT = re.compile(r"^Chapter\s+(?P<ch>\d{1,2})\s+(?P<title>.+)$", re.I)
ANSREF = re.compile(r"정답\s*및\s*해설\s*p{1,2}\.\s*(\d+)")
PICK = re.compile(r"\[([^\[\]]+?)\]")
# 글꼴이 깨져 나올 때 쓰이는 대역
BROKEN = re.compile(r"[԰-ࣿऀ-෿က-႟]")


BLANK = " _____ "


def blank_rules(page):
    """빈칸은 글자가 아니라 가는 가로선으로 그려져 있다 — 자리와 함께 걷는다"""
    out = []
    for d in page.get_drawings():
        r = d["rect"]
        if r.height < 2.5 and 8 < r.width < 260:
            out.append({"x": r.x0, "x1": r.x1, "y": r.y1})
    return out


def put_blanks(lines, rules):
    """선마다 임자 줄을 하나만 고른다.

    빈칸은 바로 앞 글자에 이어 붙는다. 앞에 글자가 없으면 뒤 글자 앞에 놓는다.
    한 선이 여러 줄에 걸쳐 보여도 한 줄에만 붙이므로 빈칸이 겹쳐 나오지 않는다.
    """
    for r in rules:
        # 「STEP」·「Point」·쪽 번호 같은 표시 글줄에는 빈칸을 붙이지 않는다.
        # 붙이면 그 글자가 「Point _____」가 되어 표시로 알아보지 못한다.
        same = [ln for ln in lines
                if abs(ln["bottom"] - r["y"]) < 4
                and not ln["font"].startswith(("BauhausStd", "FuturaStd"))]
        if not same:
            continue
        left = [ln for ln in same if max(q["x1"] for q in ln["spans"]) <= r["x"] + 2]
        if left:
            owner = min(left, key=lambda ln: r["x"] - max(q["x1"] for q in ln["spans"]))
        else:
            right = [ln for ln in same if min(q["x"] for q in ln["spans"]) >= r["x1"] - 2]
            if not right:
                continue
            owner = min(right, key=lambda ln: min(q["x"] for q in ln["spans"]) - r["x1"])
        owner["blanks"].append(r["x"])


def lines_of(page):
    """글줄을 걷는다. 빈칸 자리에는 밑줄을 되살려 넣는다.

    문항의 빈칸이 글자가 아니라 선으로 그려져 있어, 그냥 뽑으면
    「Yesterday Jiyun's birthday.」처럼 빈칸이 사라진 문장이 나온다.
    """
    lines = []
    for block in page.get_text("dict")["blocks"]:
        for ln in block.get("lines", []):
            spans = [{"x": q["bbox"][0], "x1": q["bbox"][2], "t": q["text"]}
                     for q in ln["spans"] if q["text"].strip()]
            if not spans:
                continue
            span = ln["spans"][0]
            lines.append({
                "x": ln["bbox"][0], "y": ln["bbox"][1], "bottom": ln["bbox"][3],
                "font": span["font"], "size": round(span["size"], 1),
                "spans": spans, "blanks": [],
            })
    put_blanks(lines, blank_rules(page))

    out = []
    for ln in lines:
        parts = [{"x": q["x"], "t": q["t"]} for q in ln["spans"]]
        parts += [{"x": x, "t": BLANK} for x in ln["blanks"]]
        parts.sort(key=lambda q: q["x"])
        ln["text"] = "".join(q["t"] for q in parts).rstrip()
        out.append(ln)
    return out


def page_info(rows, height):
    """단원 번호·이름, 정답지 쪽, 그리고 본책에 인쇄된 쪽 번호

    인쇄 쪽 번호는 꼬리말 양 끝(FuturaStd-Heavy)에 홀로 있다.
    정답지가 "PRACTICE p.36" 처럼 이 번호로 가리키므로 꼭 함께 들고 간다.
    """
    chapter_no, chapter, ans_page, printed = None, None, None, None
    for r in rows:
        flat = re.sub(r"\s+", " ", r["text"]).strip()
        found = FOOT.match(flat)
        if found:
            chapter_no = int(found.group("ch"))
            chapter = found.group("title").strip()
        hit = ANSREF.search(flat)
        if hit:
            ans_page = int(hit.group(1))
        if r["y"] > height - 55 and r["font"].startswith("FuturaStd-Heavy"):
            m = re.match(r"^(\d{1,3})$", flat)
            if m:
                printed = int(m.group(1))
    return chapter_no, chapter, ans_page, printed


def question_kind(text):
    picks = PICK.findall(text)
    if len(picks) == 1:
        return "어법 고르기"
    if len(picks) > 1:
        return "어법 고르기(여럿)"
    if re.search(r"[○×]", text):
        return "판단 표시"
    return "단답·서술"


CHOICE = re.compile(r"^([①-⑩])\s*(.*)$")


def choice_lines(rows, width):
    """①~⑤ 로 나뉜 고르는 글을 차례대로 잇는다.

    동그라미 번호와 그 옆 글이 따로 떨어져 있고 높이도 조금 어긋난다.
    그래서 높이가 비슷한 줄을 한 줄로 모은 뒤 번호에서 끊는다.
    """
    rows = sorted(rows, key=lambda r: (r["x"] > width / 2, r["y"]))
    merged, cur = [], []
    for r in rows:
        if (cur and abs(r["y"] - cur[0]["y"]) < 4
                and (r["x"] > width / 2) == (cur[0]["x"] > width / 2)):
            cur.append(r)
        else:
            if cur:
                merged.append(cur)
            cur = [r]
    if cur:
        merged.append(cur)

    out, one = [], None
    for group in merged:
        text = " ".join(q["text"].strip() for q in sorted(group, key=lambda q: q["x"])).strip()
        if not text or BROKEN.search(text):
            continue
        head = CHOICE.match(text)
        if head:
            if one:
                out.append(one)
            one = ("%s %s" % (head.group(1), head.group(2))).strip()
        elif one is not None:
            one = (one + " " + text).strip()
    if one:
        out.append(one)
    return out


def parse_page(page, page_no, carry):
    rows = lines_of(page)
    flat = "\n".join(r["text"] for r in rows)
    # 이어지는 쪽에는 PRACTICE 글자가 없다 — STEP 표시가 있으면 문제 쪽으로 본다
    has_step = any(r["font"].startswith(STEP_FONT) and r["text"].strip().upper() == "STEP"
                   for r in rows)
    if not has_step and "P R A C T I C E" not in flat and "PRACTICE" not in flat:
        return []
    if len(BROKEN.findall(flat)) > 20:
        return []  # 글꼴이 깨진 안내 쪽

    ch_no, ch, ans_page, printed = page_info(rows, page.rect.height)
    if ch_no:
        carry["chapter_no"], carry["chapter"] = ch_no, ch

    # STEP 표시가 쪽 위쪽 60 언저리에 오기도 한다 — 그보다 위만 잘라 낸다
    top, bottom = 58, page.rect.height - 45
    body = [r for r in rows if top < r["y"] < bottom]

    # 먼저 STEP 표시부터 모두 걷는다. 글 차례가 쪽 차례와 달라서, 띠를 다 안 뒤라야
    # 어느 줄이 어느 STEP에 드는지 가릴 수 있다.
    steps = []
    for r in body:
        if not (r["font"].startswith(STEP_FONT) and r["text"].strip().upper() == "STEP"):
            continue
        # 바로 아래 큰 숫자가 STEP 번호다. 쪽에 차례대로 놓이지 않으므로 번호를 읽는다.
        no = None
        for q in body:
            if (q["font"].startswith("FuturaStd-Medium") and q["size"] > 20
                    and abs(q["x"] - r["x"]) < 12 and 0 < q["y"] - r["y"] < 30):
                hit = re.match(r"^(\d{1,2})$", q["text"].strip())
                if hit:
                    no = int(hit.group(1))
                break
        steps.append((r["y"], no))
    steps.sort()

    def band(y):
        """이 높이가 어느 STEP 띠에 드는가 — 교재에 적힌 STEP 번호로 돌려준다"""
        got = 0
        for n, (sy, no) in enumerate(steps):
            if y >= sy - 8:
                got = no if no is not None else n + 1
        return got

    instrs, items, rest = [], [], []
    for r in body:
        text = r["text"].strip()
        if r["font"].startswith(STEP_FONT) and text.upper() == "STEP":
            continue
        # STEP 번호로 쓰인 큰 숫자는 문항 번호가 아니다
        if r["font"].startswith("FuturaStd-Medium") and r["size"] > 20:
            continue
        if INSTR_FONT in r["font"] and r["size"] < 11:
            # 지시문에는 빈칸이 없다 — 줄이 감기는 자리에서 옆 선을 집은 것이다
            text = re.sub(r"\s*_{3,}\s*", " ", text).strip()
            if ANSREF.search(text) or len(text) < 6:
                continue
            instrs.append((r["y"], r["x"], text))
            continue
        if r["font"].startswith(NUM_FONT):
            m = re.match(r"^(\d{1,2})[\s\t]*(.*)$", text)
            if m:
                items.append({"y": r["y"], "x": r["x"], "no": int(m.group(1)),
                              "text": m.group(2).strip()})
                continue
        # 번호 뒤에 이어지는 글 — 같은 STEP·같은 단에서 가장 가까운 위 문항에 붙인다.
        # STEP이 다르면 붙이지 않는다. 번호 없는 문항의 글이 윗 STEP으로 끌려가기 때문이다.
        same = [it for it in items if abs(it["x"] - r["x"]) < 40 and it["y"] <= r["y"]
                and band(it["y"]) == band(r["y"])]
        if same:
            near = max(same, key=lambda it: it["y"])
            near["text"] = (near["text"] + " " + text).strip()
        else:
            rest.append(r)

    # 띠마다 지시문 — 그 띠에서 가장 위에 있는 것
    by_band = {}
    for y, x, text in instrs:
        by_band.setdefault(band(y), []).append((y, text))
    instr_of = {b: sorted(v)[0][1] for b, v in by_band.items()}

    # 번호 없이 한 문항만 든 띠 — 「다음 중 어법상 틀린 문장은?」처럼 ①~⑤ 로만 나온다.
    # 정답지도 이런 띠를 1번으로 세므로 1번 문항으로 세워 둔다.
    has_item = {band(it["y"]) for it in items}
    for b in sorted(set(instr_of) - has_item):
        if not b:
            continue
        mine = [r for r in rest if band(r["y"]) == b]
        picked = choice_lines(mine, page.rect.width)
        if len(picked) >= 2:
            items.append({"y": min(r["y"] for r in mine), "x": 0, "no": 1,
                          "text": " ".join(picked)})

    out = []
    for it in sorted(items, key=lambda i: (band(i["y"]), i["x"] > page.rect.width / 2, i["y"])):
        text = re.sub(r"\s+", " ", it["text"]).strip()
        if len(text) < 2 or BROKEN.search(text):
            continue
        b = band(it["y"])
        out.append({
            "page": page_no,
            "printed_page": printed,
            "answer_page": ans_page,
            "chapter_no": carry["chapter_no"],
            "chapter": carry["chapter"],
            "unit_no": unit_of(carry)[0],
            "unit": unit_of(carry)[1],
            "step": b,
            "instruction": instr_of.get(b, ""),
            "no": it["no"],
            "text": text,
            "picks": PICK.findall(text),
            "question_kind": question_kind(text),
        })
    return out


CIRCLED = "①②③④⑤⑥⑦⑧⑨⑩"


def parse_exam_page(page, page_no, carry):
    """「내신 적중」 쪽 — Point 01·02·03 으로 문항이 셋씩 있다.

    문항 머리는 BauhausStd-Demi "Point" 와 그 아래 FuturaStd-Heavy 번호다.
    정답지도 이 쪽을 세 문항으로 세므로 STEP 1 의 1·2·3 번으로 둔다.
    """
    rows = lines_of(page)
    flat = "\n".join(r["text"] for r in rows)
    if "내신" not in flat or "적중" not in flat:
        return []
    if len(BROKEN.findall(flat)) > 20:
        return []

    ch_no, ch, ans_page, printed = page_info(rows, page.rect.height)
    if ch_no:
        carry["chapter_no"], carry["chapter"] = ch_no, ch

    body = [r for r in rows if 200 < r["y"] < page.rect.height - 45]
    heads = []
    for r in body:
        if r["font"].startswith("BauhausStd-Demi") and r["text"].strip() == "Point":
            heads.append(r["y"])
    if not heads:
        return []
    heads.sort()

    def owner(y):
        got = None
        for i, hy in enumerate(heads):
            if y >= hy - 20:
                got = i
        return got

    items = [{"prompt": [], "body": [], "choices": []} for _ in heads]
    for r in body:
        text = r["text"].strip()
        if not text or ANSREF.search(text):
            continue
        if r["font"].startswith(("BauhausStd", "FuturaStd")):
            continue
        i = owner(r["y"])
        if i is None:
            continue
        if INSTR_FONT in r["font"] and 9.0 <= r["size"] <= 11.0:
            items[i]["prompt"].append(re.sub(r"\s*_{3,}\s*", " ", text).strip())
        elif text[0] in CIRCLED:
            items[i]["choices"].append(text)
        else:
            items[i]["body"].append(text)

    out = []
    for n, it in enumerate(items, start=1):
        prompt = re.sub(r"\s+", " ", " ".join(it["prompt"])).strip()
        text = re.sub(r"\s+", " ", " ".join(it["body"] + it["choices"])).strip()
        if not prompt and not text:
            continue
        out.append({
            "page": page_no,
            "printed_page": printed,
            "answer_page": ans_page,
            "chapter_no": carry["chapter_no"],
            "chapter": carry["chapter"],
            "unit_no": unit_of(carry)[0],
            "unit": unit_of(carry)[1],
            "step": 1,
            "instruction": prompt,
            "no": n,
            "text": text,
            "picks": PICK.findall(text),
            "question_kind": "객관식" if it["choices"] else "단답·서술",
        })
    return out


def parse_writing_page(page, page_no, carry):
    """「Writing Exercises」 쪽 — 큰 번호 1·2 아래에 (1)(2)(3) 이 딸린다.

    정답지도 큰 번호로 세므로 큰 번호를 문항으로 잡고, 딸린 것은 한 문항에 담는다.
    """
    rows = lines_of(page)
    flat = "\n".join(r["text"] for r in rows)
    if "Writing Exercises" not in flat:
        return []
    if len(BROKEN.findall(flat)) > 20:
        return []

    ch_no, ch, ans_page, printed = page_info(rows, page.rect.height)
    if ch_no:
        carry["chapter_no"], carry["chapter"] = ch_no, ch

    body = [r for r in rows if 100 < r["y"] < page.rect.height - 45]
    heads = []
    for r in body:
        if r["font"].startswith("Institution") and r["size"] > 15:
            hit = re.match(r"^(\d{1,2})$", r["text"].strip())
            if hit:
                heads.append((r["y"], int(hit.group(1))))
    if not heads:
        return []
    heads.sort()

    def owner(y):
        got = None
        for i, (hy, _no) in enumerate(heads):
            if y >= hy - 12:
                got = i
        return got

    items = [{"prompt": [], "body": []} for _ in heads]
    for r in body:
        text = r["text"].strip()
        if not text or ANSREF.search(text) or "Writing Exercises" in text:
            continue
        if r["font"].startswith("Institution") and r["size"] > 15:
            continue
        i = owner(r["y"])
        if i is None:
            continue
        if INSTR_FONT in r["font"] and r["size"] < 10 and not re.match(r"^\(\d\)$", text):
            items[i]["prompt"].append(re.sub(r"\s*_{3,}\s*", " ", text).strip())
        else:
            items[i]["body"].append(text)

    out = []
    for (_y, no), it in zip(heads, items):
        prompt = re.sub(r"\s+", " ", " ".join(it["prompt"])).strip()
        text = re.sub(r"\s+", " ", " ".join(it["body"])).strip()
        if not text:
            continue
        out.append({
            "page": page_no,
            "printed_page": printed,
            "answer_page": ans_page,
            "chapter_no": carry["chapter_no"],
            "chapter": carry["chapter"],
            "unit_no": unit_of(carry)[0],
            "unit": unit_of(carry)[1],
            "step": 1,
            "instruction": prompt,
            "no": no,
            "text": text,
            "picks": [],
            "question_kind": "영작",
        })
    return out


def read_unit(page, carry):
    """개념 쪽 머리의 「Unit 01 | 인칭대명사와 be동사」를 걷어 둔다.

    연습 쪽에는 단원 이름만 적혀 있고 세부 이름이 없다. 바로 앞 개념 쪽의
    Unit 이름을 물려주면 「to부정사」 안에서 명사적·부사적 쓰임처럼 잘게 나뉜다.
    """
    every = lines_of(page)
    # 단원이 바뀌면 앞 단원의 세부 이름은 버린다. 그냥 두면 다음 단원 문항에 묻어난다.
    # 세부 단원이 어느 단원의 것인지 따로 적어 둔다. 단원이 바뀌면 버린다.
    ch_no = page_info(every, page.rect.height)[0]
    if ch_no and carry.get("unit_chapter") not in (None, ch_no):
        carry["unit_no"], carry["unit"], carry["unit_chapter"] = None, None, None
    rows = [r for r in every if r["y"] < 130]
    # 「Overall Exercises · Unit04-06」처럼 여러 세부 단원에 걸친 쪽은 하나로 못 묶는다
    if any("Overall" in r["text"] for r in rows):
        carry["unit_no"], carry["unit"] = None, None
        return
    mark = [r for r in rows if r["font"].startswith("FuturaStd") and r["text"].strip() == "Unit"]
    if not mark:
        return
    at = mark[0]
    no = None
    title = None
    for r in rows:
        if abs(r["y"] - at["y"]) > 45 or r is at:
            continue
        text = r["text"].strip()
        if r["font"].startswith("FuturaStd") and re.fullmatch(r"\d{1,2}", text):
            no = int(text)
        elif r["size"] > 18 and len(text) > 1 and not BROKEN.search(text):
            title = text
    if title:
        carry["unit_no"], carry["unit"] = no, title
        carry["unit_chapter"] = ch_no or carry.get("chapter_no")   # 이 세부의 집


def unit_of(carry):
    """세부 단원 — 지금 쪽의 단원과 같은 단원의 것일 때만 쓴다.

    단원 끝자락의 「내신 적중」·Writing 쪽이 다음 단원의 Unit 쪽 뒤에 오기도 한다.
    그때 물려받으면 엉뚱한 세부 이름이 붙는다.
    """
    if carry.get("unit_chapter") != carry.get("chapter_no"):
        return None, None
    return carry.get("unit_no"), carry.get("unit")


def parse(path):
    doc = fitz.open(path)
    carry = {"chapter_no": None, "chapter": None, "unit_no": None, "unit": None}
    out = []
    for i, page in enumerate(doc):
        read_unit(page, carry)
        got = (parse_page(page, i + 1, carry)
               or parse_exam_page(page, i + 1, carry)
               or parse_writing_page(page, i + 1, carry))
        for row in got:
            row["book"] = Path(path).stem
            out.append(row)
    return settle_units(out)


def settle_units(rows):
    """세부 단원은 제 단원에만 남긴다.

    단원이 바뀌는 자리에서 앞뒤 쪽이 섞여, 같은 세부 단원이 두 단원에 걸쳐 붙는
    일이 있다. 그 세부 단원의 문항이 가장 많은 단원만 제자리로 보고 나머지는 지운다.
    """
    home = {}
    tally = {}
    for r in rows:
        if r.get("unit_no") is None:
            continue
        key = (r["unit_no"], r.get("unit"))
        tally.setdefault(key, {})
        tally[key][r.get("chapter")] = tally[key].get(r.get("chapter"), 0) + 1
    for key, by in tally.items():
        home[key] = max(by, key=by.get)
    for r in rows:
        key = (r.get("unit_no"), r.get("unit"))
        if r.get("unit_no") is not None and home.get(key) != r.get("chapter"):
            r["unit_no"], r["unit"] = None, None
    return rows


if __name__ == "__main__":
    rows = parse(sys.argv[1])
    Path(sys.argv[2]).write_text(json.dumps(rows, ensure_ascii=False, indent=1), encoding="utf-8")
    out = io.open(1, "w", encoding="utf-8", closefd=False)
    print("문항 %d개 저장: %s" % (len(rows), sys.argv[2]), file=out)
    kinds = {}
    for r in rows:
        kinds[r["question_kind"]] = kinds.get(r["question_kind"], 0) + 1
    for k, n in sorted(kinds.items(), key=lambda kv: -kv[1]):
        print("   %-18s %d개" % (k, n), file=out)
    bad = [r for r in rows if not r["instruction"]]
    print("   지시문 없는 문항 %d개" % len(bad), file=out)
    out.flush()

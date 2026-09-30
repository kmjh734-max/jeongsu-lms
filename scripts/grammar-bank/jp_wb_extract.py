# -*- coding: utf-8 -*-
"""잘 풀리는 영문법 워크북에서 문항을 뽑는다.

워크북 쪽 짜임
    CHAPTER 1 명사와 관사            ← DroidSans-Bold 10pt (쪽 머리)
    RULE 03  셀 수 없는 명사의 수량 표현   ← DINOT-Bold "RULE" + Delhi 29.5pt
                            Answer p. 36  ← DINOT-Bold 8pt (정답지 쪽!)
    빈칸에 알맞은 말을 …               ← YDVYGOStd14 10pt (지시문)
    1  Jane had ______ with me.     ← BriemAkademi 12pt 번호 + 본문

본책과 달리 「Answer p. N」이 쪽마다 적혀 있어, 정답지와 맞대기가 훨씬 수월하다.
RULE 이름이 그대로 세부 단원이 된다.

  python scripts/grammar-bank/jp_wb_extract.py "…_워크북.pdf" out.json
"""
import io, json, re, sys
from pathlib import Path

import fitz

sys.path.insert(0, str(Path(__file__).parent))
from gq_extract import BLANK, blank_rules, put_blanks

NUM_FONT = "BriemAkademi"
MARK_FONT = "FuturaStd-Bold"
ANSWER = re.compile(r"Answer\s*p\.?\s*(\d{1,3})", re.I)
CHAPTER = re.compile(r"CHAPTER\s*(\d{1,2})\s*(.*)", re.I)
# 「01 be동사의 현재형」처럼 띄어 있기도, 「01be동사의 현재형」처럼 붙어 있기도 하다
RULE_NO = re.compile(r"^(\d{1,2})\s*([^\d\s].*)$")
CIRCLED = "①②③④⑤⑥⑦⑧⑨⑩"


def lines_of(page):
    """글줄을 걷는다. 빈칸 자리에는 밑줄을 되살려 넣는다."""
    lines = []
    for block in page.get_text("dict")["blocks"]:
        for ln in block.get("lines", []):
            spans = [{"x": q["bbox"][0], "x1": q["bbox"][2], "t": q["text"]}
                     for q in ln["spans"] if q["text"].strip()]
            if not spans:
                continue
            sp = ln["spans"][0]
            lines.append({
                "x": ln["bbox"][0], "y": ln["bbox"][1], "bottom": ln["bbox"][3],
                "font": sp["font"], "size": round(sp["size"], 1),
                "spans": spans, "blanks": [],
            })
    put_blanks([ln for ln in lines if not ln["font"].startswith(NUM_FONT)], blank_rules(page))
    for ln in lines:
        parts = [{"x": q["x"], "t": q["t"]} for q in ln["spans"]]
        parts += [{"x": x, "t": BLANK} for x in ln["blanks"]]
        parts.sort(key=lambda q: q["x"])
        ln["text"] = "".join(q["t"] for q in parts).rstrip()
    return lines


def page_head(rows, height):
    """이 쪽의 단원·RULE·정답지 쪽

    단원 이름은 쪽 머리에도 있고 꼬리말에도 있다(「CHAPTER 1Ⅰ명사와 관사  5」).
    한쪽만 보면 단원이 안 따라와, 조동사 쪽 문항에 앞 단원 이름이 붙는다.
    """
    chapter_no = chapter = rule_no = rule = answer_page = None
    for r in rows:
        flat = re.sub(r"\s+", " ", r["text"]).strip()
        hit = ANSWER.search(flat)
        if hit:
            answer_page = int(hit.group(1))
        got = CHAPTER.search(flat)
        if got and (r["y"] < 60 or r["y"] > height - 45):
            chapter_no = int(got.group(1))
            name = re.sub(r"\s*\d{1,3}\s*$", "", got.group(2)).strip(" Ⅰ|I")
            chapter = name or chapter
        # RULE 번호는 늘 큰 글씨다. 제목은 같은 줄에 붙어 있기도 하고(1권),
        # 옆에 따로 떨어져 있기도 하다(2권). 둘 다 본다.
        if r["font"].startswith("Delhi") and r["size"] > 20:
            num = RULE_NO.match(flat)
            if num:
                rule_no, rule = int(num.group(1)), num.group(2).strip()
                continue
            only = re.fullmatch(r"(\d{1,2})", flat)
            if only:
                rule_no = int(only.group(1))
                beside = [
                    q for q in rows
                    if q is not r and q["size"] >= 17 and abs(q["y"] - r["y"]) < 26
                    and re.search(r"[가-힣]", q["text"])
                ]
                if beside:
                    rule = re.sub(r"\s+", " ", beside[0]["text"]).strip()
    return chapter_no, chapter, rule_no, rule, answer_page


def marks(rows):
    """쪽을 가르는 묶음 표시(A·B·C) — 초록 동그라미 안의 큰 글자"""
    out = []
    for r in rows:
        if r["font"].startswith(MARK_FONT) and r["size"] > 15 and r["x"] < 90:
            if re.fullmatch(r"[A-F]", r["text"].strip()):
                out.append(r)
    out.sort(key=lambda r: r["y"])
    return out


def parse_page(page, page_no, carry):
    rows = lines_of(page)
    ch_no, ch, rule_no, rule, answer_page = page_head(rows, page.rect.height)
    if ch_no:
        carry["chapter_no"], carry["chapter"] = ch_no, ch or carry["chapter"]
    if rule_no:
        carry["rule_no"], carry["rule"] = rule_no, rule
    if answer_page:
        carry["answer_page"] = answer_page

    body = [r for r in rows if 90 < r["y"] < page.rect.height - 40]

    # 묶음은 A·B·C 표시로 갈린다. 예전처럼 번호가 되돌아가는 자리로 가르면,
    # A가 두 칸에 걸쳐 1~12로 이어질 때 오른칸 7~12가 딴 묶음으로 떨어져 나간다.
    marker = marks(body)
    if marker:
        edges = [(m["y"] - 8, m) for m in marker]
        bounds = [(edges[i][0],
                   edges[i + 1][0] if i + 1 < len(edges) else page.rect.height,
                   i, edges[i][1]) for i in range(len(edges))]
    else:
        bounds = [(0, page.rect.height, 0, None)]

    out = []
    for top, bottom, block, mark in bounds:
        mine = [r for r in body if top <= r["y"] < bottom and r is not mark]
        out += parse_block(mine, block, mark, page, page_no, carry)
    return out


def parse_block(body, block, mark, page, page_no, carry):
    heads = []
    for r in body:
        if not r["font"].startswith(NUM_FONT):
            continue
        m = re.match(r"^(\d{1,2})\s*(.*)$", r["text"].strip())
        if m and not m.group(2)[:1].isdigit():
            heads.append({"no": int(m.group(1)), "x": r["x"], "y": r["y"],
                          "lead": (m.group(2) or "").strip()})
    if not heads:
        return []

    # 칸 가르기는 묶음마다 따로 본다 — A만 두 칸이고 B·C는 한 칸인 쪽이 흔하다
    xs = [h["x"] for h in heads]
    mid = (min(xs) + max(xs)) / 2 if max(xs) - min(xs) > 100 else page.rect.width
    for h in heads:
        h["col"] = 0 if h["x"] < mid else 1

    def owner(r):
        col = 0 if r["x"] < mid else 1
        best = None
        for h in heads:
            if h["col"] == col and r["y"] >= h["y"] - 12:
                best = h
        return best

    # 번호 글자가 잘못 찍혀 나오는 쪽이 있다(3이 2로 뽑힌다). 개수가 맞으면
    # 눈에 보이는 차례가 곧 번호이므로 다시 매긴다.
    seen = sorted(h["no"] for h in heads)
    if seen != list(range(1, len(heads) + 1)) and len(heads) == max(seen):
        for i, h in enumerate(sorted(heads, key=lambda h: (h["col"], h["y"])), start=1):
            h["no"] = i

    # <보기> 상자는 묶음 머리에 따로 놓여 있다. 어느 한 문항에 붙여 두면 그 문항
    # 본문이 더러워지므로, 걷어 내어 묶음 전체가 함께 갖도록 한다.
    bank, drop = [], []
    for r in body:
        if r["size"] < 9 and "보기" in r["text"]:
            near = [q for q in body
                    if q is not r and 0 <= q["y"] - r["y"] < 18 and q["size"] > 9]
            if near:
                row = min(near, key=lambda q: q["y"])
                bank += re.findall(r"[A-Za-z][A-Za-z'’\-]*", row["text"])
                drop += [r, row]
    if drop:
        body = [r for r in body if r not in drop]

    # 지시문은 묶음 표시와 같은 줄에 한 번 적혀 있다
    lead_in = ""
    if mark is not None:
        beside = [r for r in body if abs(r["y"] - mark["y"]) < 14 and r["x"] > mark["x"] + 10
                  and re.search(r"[가-힣]", r["text"])]
        if beside:
            lead_in = re.sub(r"\s+", " ", beside[0]["text"]).strip()
            body = [r for r in body if r is not beside[0]]

    for h in heads:
        h["prompt"], h["body"], h["choices"] = [], [], []
        if h["lead"]:
            h["body"].append(h["lead"])
    for r in body:
        if r["font"].startswith(NUM_FONT):
            continue
        text = r["text"].strip()
        if not text or ANSWER.search(text) or CHAPTER.search(text):
            continue
        h = owner(r)
        if h is None:
            continue
        if 9.0 <= r["size"] <= 10.6 and re.search(r"[가-힣]", text) and not h["body"]:
            h["prompt"].append(text)
        elif text[0] in CIRCLED:
            h["choices"].append(text)
        else:
            h["body"].append(text)

    for h in heads:
        h["block"] = block
        if lead_in:
            h["prompt"].insert(0, lead_in)

    out = []
    for h in sorted(heads, key=lambda h: h["no"]):
        body_text = [re.sub(r"\s+", " ", b).strip() for b in h["body"] if b.strip()]
        choices = []
        for c in h["choices"]:
            choices.append({"no": CIRCLED.index(c[0]) + 1, "text": c[1:].strip()})
        if not body_text and not choices:
            continue
        out.append({
            "page": page_no,
            "printed_page": page_no,
            "answer_page": carry.get("answer_page"),
            "chapter_no": carry.get("chapter_no"),
            "chapter": carry.get("chapter"),
            "rule_no": carry.get("rule_no"),
            "rule": carry.get("rule"),
            "block": h["block"],
            "no": h["no"],
            "prompt": re.sub(r"\s+", " ", " ".join(h["prompt"])).strip(),
            "body": body_text,
            "choices": choices,
            "question_kind": "객관식" if choices else "단답·서술",
            "bank": bank,
        })
    return out


def main(src, dst):
    doc = fitz.open(src)
    carry = {"chapter_no": None, "chapter": None, "rule_no": None, "rule": None,
             "answer_page": None}
    out = []
    for i, page in enumerate(doc):
        for row in parse_page(page, i + 1, carry):
            row["book"] = Path(src).stem
            out.append(row)
    Path(dst).write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")

    log = io.open(1, "w", encoding="utf-8", closefd=False)
    print("워크북 문항 %d개 저장: %s" % (len(out), dst), file=log)
    import collections

    rules = collections.Counter((r["chapter"], r["rule_no"], r["rule"]) for r in out)
    print("RULE %d가지 · 정답지 쪽 %d가지"
          % (len(rules), len({r["answer_page"] for r in out if r["answer_page"]})), file=log)
    for key, n in list(rules.items())[:8]:
        print("   %s · %s. %s — %d문항" % (key[0], key[1], key[2], n), file=log)
    log.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])

# -*- coding: utf-8 -*-
"""I Love Grammar(YBM) 본책에서 문항을 뽑는다.

쪽 짜임
    Grammar Practice   묶음 A·B·C·D, 묶음마다 지시문 한 줄 + 번호 문항
                       ← ITCAvantGardeStd-Demi 15 묶음 / MyriadPro-Semibold 10.8 번호
    Writing Practice   같은 꼴
    LANGUAGE FOCUS     같은 꼴
    ACTUAL TEST        1~20번, 두 칸. 보기는 ①~⑤
                       ← ITCAvantGardeStd-Demi 12.1 번호 / SDGothicNeoaUni-dRg 9.4 보기

쪽 머리에 「> Answers p. 6」이 적혀 있어 정답지 쪽을 바로 가리킨다.

  python scripts/grammar-bank/ilg_extract.py "…본책.pdf" out.json
"""
import collections, io, json, re, sys
from pathlib import Path

import fitz

sys.path.insert(0, str(Path(__file__).parent))
from gq_extract import BLANK, blank_rules, put_blanks

CIRCLED = "①②③④⑤⑥⑦⑧⑨⑩"
LETTERED = "ⓐⓑⓒⓓⓔⓕ"
HEAD_FONT = "ITCAvantGardeStd-Demi"      # 쪽 제목·묶음 표시·시험 번호
ASK_FONT = "SDGothicNeoaUni-f"           # 지시문
PICK_FONT = "SDGothicNeoaUni-d"          # 시험 보기
ITEM_FONT = "MyriadPro-Semibold"         # 묶음 안의 번호
ANSREF = re.compile(r"Answers?\s*p\.?\s*(\d{1,3})", re.I)
FOOT = re.compile(r"^I LOVE GRAMMAR\s*(\d)", re.I)

PRACTICE = "Grammar Practice"
WRITING = "Writing Practice"
FOCUS = "LANGUAGE FOCUS"
TEST = "ACTUAL TEST"


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
    put_blanks([ln for ln in lines if not ln["font"].startswith(HEAD_FONT)], blank_rules(page))
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
    """어떤 꼴의 쪽인가, 정답지 몇 쪽을 가리키나, 인쇄 쪽은 몇 쪽인가"""
    kind = ans = printed = None
    h = page.rect.height
    for r in rows:
        t = r["text"]
        if r["font"].startswith(HEAD_FONT) and r["size"] > 13:
            if t.startswith("Grammar Practice"):
                kind = PRACTICE
            elif t.startswith("Writing Practice"):
                kind = WRITING
            elif t.upper().startswith("LANGUAGE FOCUS"):
                kind = FOCUS
            elif t.upper().startswith("ACTUAL TEST"):
                kind = TEST
        got = ANSREF.search(t)
        if got:
            ans = int(got.group(1))
        if r["y"] > h - 55 and re.fullmatch(r"\d{1,3}", t):
            printed = int(t)
    return kind, ans, printed


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
            if h["col"] == c and (r["y"] > h["y"] - 4 or
                                  (abs(r["y"] - h["y"]) < 4 and r["x"] >= h["x"])):
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
        elif ((r["font"].startswith(ASK_FONT) and re.search(r"[가-힣]", t))
              # 시험 쪽은 발문의 글꼴이 들쭉날쭉하다 — 말투로도 가린다
              or re.search(r"(?:시오\.?|것은\?|것을\?|하시오|쓰시오|고르시오|고르면\?)\s*$", t)):
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
            choices.append({"no": seat, "text": c[1:].strip()})
        if not body and not choices:
            continue
        head = lead.get(h["col"], "") if isinstance(lead, dict) else lead
        prompt = " ".join(([head] if head else []) + h["prompt"]).strip()
        prompt = re.sub(r"^(?:_+\s*)+|(?:\s*_+)+$", "", prompt).strip()
        for c in choices:
            c["text"] = re.sub(r"(?:\s*_{3,})+$", "", c["text"]).strip()
        out.append({"printed_page": carry.get("printed"), "answer_page": carry.get("ans"),
                    "chapter_no": carry.get("chapter_no"), "chapter": carry.get("chapter"),
                    "unit_no": carry.get("unit_no"), "unit": carry.get("unit"),
                    "section": kind, "block": block, "no": h["no"],
                    "prompt": prompt, "body": body, "choices": choices, "bank": [],
                    "question_kind": "객관식" if choices else "단답·서술"})
    return out


def parse_page(page, carry):
    rows = lines_of(page)
    kind, ans, printed = page_head(rows, page)
    if printed:
        carry["printed"] = printed
    if ans:
        carry["ans"] = ans
    # 단원 가름 쪽 — 큰 숫자와 이름이 있다
    big = [r for r in rows if r["font"].startswith("CenturyGothic") and r["size"] > 60
           and re.fullmatch(r"\d{1,2}", r["text"])]
    if big:
        carry["chapter_no"] = int(big[0]["text"])
        names = [r for r in rows if r["font"].startswith("GongGothic") and r["size"] > 20
                 and re.search(r"[가-힣]", r["text"])]
        if names:
            carry["chapter"] = names[0]["text"]
        carry["unit_no"] = carry["unit"] = None
        return []
    # 설명 쪽 — UNIT 번호·이름을 들고 간다
    uno = [r for r in rows if r["font"].startswith("CenturyGothic") and 30 < r["size"] < 60
           and re.fullmatch(r"\d{1,2}", r["text"])]
    if uno:
        carry["unit_no"] = int(uno[0]["text"])
        names = [r for r in rows if r["font"].startswith("GongGothic") and 18 < r["size"] < 28
                 and re.search(r"[가-힣]", r["text"])]
        carry["unit"] = names[0]["text"] if names else carry.get("unit")
    if not kind:
        return []

    h = page.rect.height
    body = [r for r in rows if 60 < r["y"] < h - 45]
    out = []

    if kind == TEST:
        heads = heads_in(body, HEAD_FONT, (11, 14), cut=10000.0)
        if not heads:
            return []
        xs = sorted({round(x["x"]) for x in heads})
        far = [x for x in xs if x > xs[0] + 60]
        cut = (far[0] - 6) if far else 10000.0
        for x in heads:
            x["col"] = 0 if x["x"] < cut else 1
        out += pack(gather(body, heads, cut), {}, carry, 0, TEST)
        return out

    marks = [r for r in body if r["font"].startswith(HEAD_FONT) and 13 < r["size"] < 18
             and re.match(r"^[A-F](\s|$)", r["text"])]
    marks.sort(key=lambda r: r["y"])
    for i, m in enumerate(marks):
        top = m["y"] - 4
        bottom = marks[i + 1]["y"] - 4 if i + 1 < len(marks) else h
        mine = [r for r in body if top <= r["y"] < bottom and r is not m]
        heads = heads_in(mine, ITEM_FONT, (9.5, 12))
        if not heads:
            continue
        # 지시문은 묶음 표시에 붙어 있거나 바로 아래 한 줄로 있다
        said = m["text"][1:].strip()
        if not said:
            near = [r for r in mine if r["font"].startswith(ASK_FONT)
                    and r["y"] < min(x["y"] for x in heads) and re.search(r"[가-힣]", r["text"])]
            said = max(near, key=lambda r: r["y"])["text"] if near else ""
        out += pack(gather(mine, heads, None), said, carry,
                    ord(m["text"][0]) - ord("A"), kind)
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
    print("I Love Grammar 문항 %d개 저장: %s" % (len(out), dst), file=log)
    for k, n in collections.Counter(r["section"] for r in out).most_common():
        print("   %-20s %d문항" % (k, n), file=log)
    print("   단원 %s · 인쇄 쪽 %d가지"
          % (sorted({r["chapter_no"] for r in out if r["chapter_no"]}),
             len({r["printed_page"] for r in out})), file=log)
    log.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])

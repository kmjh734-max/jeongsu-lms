# -*- coding: utf-8 -*-
"""Good Grammar 2nd Edition(YBM) 본책에서 문항을 뽑는다.

쪽 짜임
    실력 다지기            묶음 A·B·C, 묶음마다 지시문 한 줄 + 번호 문항
                          ← designhouseBold 18 제목 / BriemAkademiStd 20.5 묶음
                             SDGothicNeoa-fSm 10 지시문 / MyriadPro-Semibold 12 번호
    서술형 대비 문장 쓰기    번호 문항만
    실력 완성 내신대비       01~24번, 두 칸

꼬리말이 「일반동사25」처럼 단원 이름과 인쇄 쪽을 붙여 적어 둔다. 정답지가
「Unit 04 … p. 25」로 그 쪽을 가리키므로 자리가 하나로 정해진다.

  python scripts/grammar-bank/gg_extract.py "…본책.pdf" out.json
"""
import collections, io, json, re, sys
from pathlib import Path

import fitz

sys.path.insert(0, str(Path(__file__).parent))
from gq_extract import BLANK, blank_rules, put_blanks

CIRCLED = "①②③④⑤⑥⑦⑧⑨⑩"
LETTERED = "ⓐⓑⓒⓓⓔⓕ"
TITLE_FONT = "designhouse"          # 「실력 다지기」·「서술형 대비」
MARK_FONT = "BriemAkademiStd"       # 묶음 A·B·C
ITEM_FONT = "MyriadPro-Semibold"    # 문항 번호
ASK_FONT = "SDGothicNeo"            # 지시문
FOOT = re.compile(r"^(.*?)(\d{1,3})$")

DRILL = "실력 다지기"
WRITE = "서술형 대비"
TEST = "실력 완성"


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
                if not ln["font"].startswith((MARK_FONT, TITLE_FONT, "DIN", "SDSwagger"))],
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
    """어떤 꼴의 쪽인가, 단원 번호·이름은 무엇인가.

    꼬리말이 두 가지다 — 홀수 쪽은 「문장의 형식 13」(이름과 인쇄 쪽), 짝수 쪽은
    「CHAPTER 1」(단원 번호). 예전에는 「CHAPTER 1」의 1을 인쇄 쪽으로 읽어, 그
    쪽부터 자리가 통째로 어긋났다. L2·L3 를 넣지 못한 까닭이 이것이다.

    인쇄 쪽은 PDF 쪽을 그대로 쓴다 — 이름이 적힌 꼬리말 154군데를 모두 재어
    보니 셋 다 PDF 쪽과 인쇄 쪽이 같았다.
    """
    kind = printed = chapter = chapter_no = None
    h = page.rect.height
    for r in rows:
        t = r["text"]
        flat = re.sub(r"\s+", "", t)
        if r["font"].startswith(TITLE_FONT) and r["size"] > 13:
            # 권마다 「실력 다지기」·「실력다지기」로 띄어쓰기가 다르다
            if flat.startswith("실력다지기"):
                kind = DRILL
            elif flat.startswith("서술형"):
                kind = WRITE
        if re.search(r"내신대비|실력완성", flat) and r["size"] > 10:
            kind = TEST
        if r["y"] > h - 55:
            mark = re.fullmatch(r"CHAPTER\s*(\d{1,2})", t.strip())
            if mark:
                chapter_no = int(mark.group(1))
                continue
            got = FOOT.match(t)
            if got and re.search(r"[가-힣]", got.group(1) or ""):
                chapter = got.group(1).strip()
                printed = int(got.group(2))
    return kind, printed, chapter, chapter_no


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
            if h["col"] == c and (r["y"] > h["y"] - 4
                                  or (abs(r["y"] - h["y"]) < 5 and r["x"] >= h["x"])):
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
        # 꼬리말(「Chapter 04완료시제」)이 본문 높이 안으로 들어오는 쪽이 있다
        body = [b for b in h["body"] if b.strip()
                and not re.match(r"(?i)chapter\s*\d", b.strip())]
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
        out.append({"printed_page": carry.get("printed"), "chapter": carry.get("chapter"),
                    "chapter_no": carry.get("chapter_no"),
                    "seq": (carry.get("seq") or {}).get(kind),
                    "section": kind, "block": block, "no": h["no"],
                    "prompt": prompt, "body": body, "choices": choices, "bank": [],
                    "question_kind": "객관식" if choices else "단답·서술"})
    return out


def parse_page(page, carry, page_no=None):
    rows = lines_of(page)
    kind, printed, chapter, chapter_no = page_head(rows, page)
    # 인쇄 쪽은 PDF 쪽이다. 꼬리말에 적힌 쪽과 다르면 알아차리게 적어 둔다.
    if printed and page_no and printed != page_no:
        carry.setdefault("odd", []).append((page_no, printed))
    printed = page_no or printed
    if printed:
        carry["printed"] = printed
    if chapter:
        carry["chapter"] = chapter
    if chapter_no:
        carry["chapter_no"] = chapter_no
    if not kind:
        return []
    # 쪽 번호가 권마다 들쭉날쭉해, 「실력 다지기」 쪽이 나온 차례를 들고 간다.
    # 정답지도 같은 차례로 적혀 있어 이것으로 자리가 맞는다.
    if kind != carry.get("last_kind") or printed != carry.get("last_page"):
        carry["seq"] = carry.get("seq", {})
        carry["seq"][kind] = carry["seq"].get(kind, 0) + 1
        carry["last_kind"], carry["last_page"] = kind, printed

    h = page.rect.height
    body = [r for r in rows if 48 < r["y"] < h - 50]

    if kind == TEST:
        heads = heads_in(body, ITEM_FONT, (10, 14), cut=10000.0)
        if not heads:
            return []
        xs = sorted({round(x["x"]) for x in heads})
        far = [x for x in xs if x > xs[0] + 60]
        cut = (far[0] - 6) if far else 10000.0
        for x in heads:
            x["col"] = 0 if x["x"] < cut else 1
        return pack(gather(body, heads, cut), {}, carry, 0, TEST)

    marks = [r for r in body if r["font"].startswith(MARK_FONT) and 16 < r["size"] < 24
             and re.fullmatch(r"[A-F]", r["text"])]
    marks.sort(key=lambda r: r["y"])
    if not marks:
        heads = heads_in(body, ITEM_FONT, (10, 14))
        if not heads:
            return []
        said = [r for r in body if r["font"].startswith(ASK_FONT)
                and r["y"] < min(x["y"] for x in heads) and re.search(r"[가-힣]", r["text"])]
        return pack(gather(body, heads, None),
                    max(said, key=lambda r: r["y"])["text"] if said else "", carry, 0, kind)

    out = []
    for i, m in enumerate(marks):
        top = m["y"] - 3
        bottom = marks[i + 1]["y"] - 3 if i + 1 < len(marks) else h
        mine = [r for r in body if top <= r["y"] < bottom and r is not m]
        heads = heads_in(mine, ITEM_FONT, (10, 14))
        if not heads:
            continue
        said = [r for r in mine if r["font"].startswith(ASK_FONT)
                and r["y"] < min(x["y"] for x in heads) and re.search(r"[가-힣]", r["text"])]
        out += pack(gather(mine, heads, None),
                    max(said, key=lambda r: r["y"])["text"] if said else "", carry,
                    ord(m["text"]) - ord("A"), kind)
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
    print("Good Grammar 문항 %d개 저장: %s" % (len(out), dst), file=log)
    for k, n in collections.Counter(r["section"] for r in out).most_common():
        print("   %-14s %d문항" % (k, n), file=log)
    print("   인쇄 쪽 %d가지 · 단원 %d가지"
          % (len({r["printed_page"] for r in out}), len({r["chapter"] for r in out})), file=log)
    log.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])

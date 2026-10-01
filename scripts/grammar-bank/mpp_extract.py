# -*- coding: utf-8 -*-
"""문제로 풀자 「실전문제 PLUS」(학생용)에서 문항을 뽑는다.

쪽 짜임 (두 칸)
    CHAPTER 01 TEST                  ← Gotham-Black 11/14/19, 단원마다 첫 쪽에만
      01 다음 빈칸에 들어갈 말로 …     ← Gotham-Bold 13 번호(+발문이 붙기도 한다)
         ① You        ② They         ← YDVYGOStd53 10, 한 줄에 둘씩 따로 놓인다
      [02-03] 다음 빈칸에 들어갈 …     ← Gotham-Bold 10.5, 두 문항이 함께 쓰는 발문
      02 …

번호는 단원 안에서 01부터 이어지고, 정답지도 「CHAPTER 01 TEST」 아래 번호별로
답을 적어 두어 (단원, 번호)로 자리가 하나로 정해진다.

  python scripts/grammar-bank/mpp_extract.py "…실전문제PLUS 학생용.pdf" out.json
"""
import collections, io, json, re, sys
from pathlib import Path

import fitz

sys.path.insert(0, str(Path(__file__).parent))
from gq_extract import BLANK, blank_rules, put_blanks

CIRCLED = "①②③④⑤⑥⑦⑧⑨⑩"
LETTERED = "ⓐⓑⓒⓓⓔⓕ"
HEAD_FONT = "Gotham-Black"      # CHAPTER · TEST · 단원 번호
ITEM_FONT = "Gotham-Bold"       # 문항 번호, 그리고 묶음 발문의 [02-03]
ASK_FONT = ("YDVYGOStd", "SDGothic")
RANGE = re.compile(r"^\[\s*(\d{1,2})\s*[-–~]\s*(\d{1,2})\s*\]\s*(.*)$")


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
    put_blanks([ln for ln in lines if not ln["font"].startswith((HEAD_FONT, "DIN"))],
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


def chapter_of(rows):
    """단원 번호 — 단원마다 첫 쪽에만 「CHAPTER 01 TEST」로 적혀 있다"""
    for r in rows:
        if r["font"].startswith(HEAD_FONT) and 12 < r["size"] < 17:
            got = re.fullmatch(r"(\d{1,2})", r["text"])
            if got:
                return int(got.group(1))
    return None


def item_heads(rows):
    out = []
    for r in rows:
        if not r["font"].startswith(ITEM_FONT) or not (12 <= r["size"] <= 14):
            continue
        got = re.match(r"^(\d{1,2})\s*(.*)$", r["text"])
        if not got:
            continue
        rest = (got.group(2) or "").strip()
        if rest[:1].isdigit():
            continue
        r["_head"] = True
        out.append({"no": int(got.group(1)), "x": r["x"], "y": r["y"], "lead": rest})
    return out


def shared_asks(rows):
    """「[02-03] …」처럼 여러 문항이 함께 쓰는 발문. 다음 줄로 이어지기도 한다."""
    out = []
    for i, r in enumerate(rows):
        if not r["font"].startswith(ITEM_FONT) or not (9.5 <= r["size"] <= 12):
            continue
        got = RANGE.match(r["text"])
        if not got:
            continue
        said = [got.group(3).strip()]
        for after in rows[i + 1:]:
            if after["y"] - r["y"] > 40 or abs(after["x"] - r["x"]) > 60:
                continue
            if after["font"].startswith(ASK_FONT) and after["y"] > r["y"]:
                said.append(after["text"])
                after["_said"] = True
                break
            if after["y"] > r["y"] + 4:
                break
        r["_said"] = True
        out.append({"lo": int(got.group(1)), "hi": int(got.group(2)),
                    "text": " ".join(s for s in said if s).strip()})
    return out


def column_cut(heads, page):
    """문항 번호가 놓인 x 를 보고 두 칸의 경계를 잡는다"""
    xs = sorted({round(h["x"]) for h in heads})
    if not xs:
        return page.rect.width
    far = [x for x in xs if x > xs[0] + 80]
    return (far[0] - 8) if far else page.rect.width


def gather(rows, heads, cut):
    for h in heads:
        h["prompt"], h["body"], h["choices"] = [], [], []
        h["col"] = 0 if h["x"] < cut else 1
        if h["lead"][:1] in CIRCLED:
            h["choices"] = [h["lead"]]
        elif h["lead"]:
            h["prompt"] = [h["lead"]]
    order = sorted(heads, key=lambda h: (h["col"], h["y"], h["x"]))

    def owner(r):
        best = None
        c = 0 if r["x"] < cut else 1
        for h in order:
            if h["col"] == c and (r["y"] > h["y"] - 4
                                  or (abs(r["y"] - h["y"]) < 6 and r["x"] >= h["x"])):
                best = h
        return best

    for r in rows:
        if r.get("_head") or r.get("_said"):
            continue
        t = r["text"]
        if not t or r["font"].startswith(HEAD_FONT):
            continue
        h = owner(r)
        if h is None:
            continue
        bare = t.lstrip(" _")
        if bare[:1] in CIRCLED or (bare[:1] in LETTERED and len(bare) > 2):
            h["choices"].append(bare)
        elif (r["font"].startswith(ASK_FONT) and re.search(r"[가-힣]", t)
              and re.search(r"(?:시오|것은|고르|쓰|완성|배열|바꿔)", t) and len(t) > 8):
            h["prompt"].append(t)
        else:
            h["body"].append(t)
    return heads


def pack(heads, asks, chapter, page_no, book):
    out = []
    for h in sorted(heads, key=lambda h: (h["col"], h["no"])):
        spread = []
        for c in [c for c in h["choices"] if c.strip()]:
            tag = "[①-⑩]" if c[0] in CIRCLED else "[ⓐ-ⓕ]"
            inner = re.findall(tag + "(?:(?!" + tag + ").)*", c)
            spread += [x.strip() for x in inner] if len(inner) > 1 else [c]
        choices = []
        for c in spread:
            if not c.strip() or not re.sub(r"[_\s]", "", c[1:]).strip():
                continue
            seat = (CIRCLED.index(c[0]) + 1 if c[0] in CIRCLED else LETTERED.index(c[0]) + 1)
            choices.append({"no": seat, "text": re.sub(r"(?:\s*_{3,})+$", "", c[1:]).strip()})
        body = [b for b in h["body"] if b.strip()]
        if not body and not choices:
            continue
        said = [a["text"] for a in asks if a["lo"] <= h["no"] <= a["hi"]]
        prompt = " ".join(said + h["prompt"]).strip()
        # 발문이 두 줄로 끊겨 「… 바르게 짝지어진」 + 「것은?」 으로 들어오면 앞
        # 줄에 맺음말이 없어 본문으로 샌다. 발문이 빈 문항은 본문 앞머리에서
        # 우리말 발문을 되찾는다.
        if not prompt:
            taken = 0
            for line in body[:3]:
                if re.search(r"[A-Za-z]{3}", line) or not re.search(r"[가-힣]", line):
                    break
                taken += 1
                if re.search(r"(?:것은\?|것\?|고르면\?|시오\.?|쓰세요\.?)\s*$", line):
                    prompt = " ".join(body[:taken]).strip()
                    body = body[taken:]
                    break
            else:
                taken = 0
        prompt = re.sub(r"^(?:_+\s*)+|(?:\s*_+)+$", "", prompt).strip()
        out.append({"book": book, "chapter_no": chapter, "printed_page": page_no,
                    "section": "실전문제 PLUS", "no": h["no"],
                    "prompt": prompt, "body": body, "choices": choices, "bank": [],
                    "question_kind": "객관식" if choices else "단답·서술"})
    return out


def parse_page(page, page_no, carry, book):
    rows = lines_of(page)
    got = chapter_of(rows)
    if got:
        carry["chapter"] = got
        carry["seen"] = 0
        # 단원이 바뀌면 번호가 1로 되돌아간다. 묶음 발문을 들고 가면 앞 단원의
        # [27-28] 발문이 다음 단원 27·28번에 그대로 붙는다.
        carry["asks"] = []
    h = page.rect.height
    body = [r for r in rows if 60 < r["y"] < h - 40]
    heads = item_heads(body)
    if not heads:
        return []
    # 단원 번호가 없는 구역(중간·기말 대비 TEST)이 사이에 끼어 있다. 머리글이
    # 그림이라 글자층에 없으니, 번호가 01로 되돌아가는 것으로 알아보고 건너뛴다.
    # 그대로 두면 앞 단원 TEST 의 같은 번호에 엉뚱한 답이 붙는다.
    low = min(x["no"] for x in heads)
    if got is None and low <= 2 and carry.get("seen", 0) >= 5:
        carry["chapter"] = None
    carry["seen"] = max(carry.get("seen", 0), max(x["no"] for x in heads))
    if not carry.get("chapter"):
        return []
    asks = shared_asks(body)
    # 묶음 발문은 쪽을 넘어가도 쓰인다 — 앞 쪽에서 본 것 가운데 이 쪽의 번호와
    # 겹치는 것만 들고 간다
    high = max(x["no"] for x in heads)
    carry["asks"] = [a for a in carry.get("asks", [])
                     if a["hi"] >= low and a["lo"] <= high]
    asks = carry["asks"] + asks
    carry["asks"] = asks
    cut = column_cut(heads, page)
    return pack(gather(body, heads, cut), asks, carry["chapter"], page_no, book)


def main(src, dst):
    doc = fitz.open(src)
    carry, out = {}, []
    for page_no, page in enumerate(doc, 1):
        out += parse_page(page, page_no, carry, Path(src).stem)
    Path(dst).write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    log = io.open(1, "w", encoding="utf-8", closefd=False)
    print("실전문제 PLUS 문항 %d개 저장: %s" % (len(out), dst), file=log)
    print("   단원 %d가지 · 발문 있는 것 %d개 · 객관식 %d개"
          % (len({r["chapter_no"] for r in out}),
             sum(1 for r in out if r["prompt"]),
             sum(1 for r in out if r["choices"])), file=log)
    for ch, n in sorted(collections.Counter(r["chapter_no"] for r in out).items()):
        print("   단원%-3s %d문항" % (ch, n), file=log)
    log.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])

# -*- coding: utf-8 -*-
"""잘 풀리는 영문법 본책·워크북에서 문항을 뽑는다.

쪽 배치가 글꼴로 갈린다.
  문항 번호  BriemAkademiStd-Bold 15pt  (왼 단 x≈69, 오른 단 x≈333)
  딱지       YDVYGOStd14 7.1pt          ("최다 기출", "서술형")
  지시문     YDVYGOStd13 10pt
  본문·보기   YDVYGOStd12 11pt / HelveticaNeue 11pt
  머리말     "CHAPTER 1   통합 문제", "정답 및 해설 p.03"
  꼬리말     "CHAPTER 1Ⅰ명사와 관사    15"

문항은 왼 단을 위에서 아래로 읽고 이어서 오른 단을 읽는다.

  python scripts/grammar-bank/jp_extract.py "참고파일/중등 문법/잘풀리는영문법_1권.pdf" out.json
"""
import io, json, re, sys
from pathlib import Path
import fitz

NUM_FONT = "BriemAkademi"
BADGE_FONT = "YDVYGOStd14"
INSTR_SIZE = 10.0
CIRCLED = "①②③④⑤⑥⑦⑧⑨⑩"
HEAD = re.compile(r"CHAPTER\s*(\d{1,2})\s*(?:[ⅠI|]\s*)?(.*)")
ANSREF = re.compile(r"정답\s*및\s*해설\s*p\.?\s*(\d+)")
SECTION = re.compile(r"(통합 ?문제|마무리 ?실전문제\s*\d*회?)")
# 발문으로 끝나는 말 — 크기가 달라 본문에 섞인 발문을 가려낸다
ASK = re.compile(r"(것은\?|것을?\s*(모두\s*)?(고르|쓰)|하시오\.|쓰시오\.|고르시오\.|완성하시오\.|것인가\?|짝지어진 것)")


# 빈칸은 글자가 아니라 가는 가로선으로 그려져 있다 — 그래머큐와 같은 손질을 쓴다
sys.path.insert(0, str(Path(__file__).parent))
from gq_extract import BLANK, blank_rules, put_blanks


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
                "x": ln["bbox"][0], "y": ln["bbox"][1], "x1": ln["bbox"][2],
                "bottom": ln["bbox"][3],
                "font": sp["font"], "size": round(sp["size"], 1),
                "spans": spans, "blanks": [],
            })
    # 문항 번호 글줄에는 빈칸을 붙이지 않는다 — 붙으면 번호로 알아보지 못한다
    put_blanks([ln for ln in lines if not ln["font"].startswith(NUM_FONT)], blank_rules(page))

    out = []
    for ln in lines:
        parts = [{"x": q["x"], "t": q["t"]} for q in ln["spans"]]
        parts += [{"x": x, "t": BLANK} for x in ln["blanks"]]
        parts.sort(key=lambda q: q["x"])
        ln["text"] = "".join(q["t"] for q in parts).rstrip()
        out.append(ln)
    return out


def printed_page(rows, height):
    """본책에 인쇄된 쪽 번호 — 꼬리말 양 끝에 있다

    "CHAPTER 1Ⅰ명사와 관사    15" 또는 "16    잘 풀리는 영문법 1" 꼴이다.
    정답지가 이 번호로 가리키므로 꼭 들고 간다.
    """
    for r in rows:
        if r["y"] < height - 40:
            continue
        flat = re.sub(r"\s+", " ", r["text"]).strip()
        m = re.match(r"^(\d{1,3})\s+\D", flat) or re.search(r"(\d{1,3})$", flat)
        if m:
            no = int(m.group(1))
            if 1 <= no <= 400:
                return no
    return None


def page_meta(rows):
    """단원 번호·이름, 문제 갈래, 정답 쪽"""
    ch_no = ch = section = ans = None
    for r in rows:
        flat = re.sub(r"\s+", " ", r["text"]).strip()
        hit = SECTION.search(flat)
        if hit and r["y"] < 80:
            section = re.sub(r"\s+", " ", hit.group(1))
        m = HEAD.search(flat)
        if m:
            no = int(m.group(1))
            title = m.group(2).strip(" Ⅰ|I")
            title = re.sub(r"\s*\d+\s*$", "", title).strip()
            if title and not SECTION.search(title):
                ch_no, ch = no, title
            elif ch_no is None:
                ch_no = no
        a = ANSREF.search(flat)
        if a:
            ans = int(a.group(1))
    return ch_no, ch, section, ans


def parse_page(page, page_no, carry):
    rows = lines_of(page)
    flat = "\n".join(r["text"] for r in rows)
    # 이어지는 쪽에는 '통합 문제' 머리말이 없다 — 문항 번호 글꼴이 여럿 있으면 문제 쪽으로 본다
    has_no = sum(1 for r in rows
                 if r["font"].startswith(NUM_FONT) and re.match(r"^\d{1,2}$", r["text"].strip()))
    if not SECTION.search(flat) and has_no < 3:
        return []

    ch_no, ch, section, ans = page_meta(rows)
    printed = printed_page(rows, page.rect.height)
    if ch_no:
        carry["chapter_no"] = ch_no
    if ch:
        carry["chapter"] = ch
    if section:
        carry["section"] = section

    top, bottom = 60, page.rect.height - 40
    body = [r for r in rows if top < r["y"] < bottom]
    mid = page.rect.width / 2

    # 문항 머리: 번호 글꼴
    heads = []
    for r in body:
        if r["font"].startswith(NUM_FONT):
            m = re.match(r"^(\d{1,2})$", r["text"].strip())
            if m:
                heads.append({"no": int(m.group(1)), "x": r["x"], "y": r["y"],
                              "col": 0 if r["x"] < mid else 1})
    if not heads:
        return []
    heads.sort(key=lambda h: (h["col"], h["y"]))

    def owner(r):
        """이 줄이 어느 문항에 딸리는가 — 같은 단에서 바로 위 번호"""
        col = 0 if r["x"] < mid else 1
        best = None
        for h in heads:
            if h["col"] != col:
                continue
            if r["y"] >= h["y"] - 14:
                best = h
        return best

    for h in heads:
        h["badges"], h["prompt"], h["body"], h["choices"] = [], [], [], []
    for r in body:
        if r["font"].startswith(NUM_FONT):
            continue
        h = owner(r)
        if h is None:
            continue
        text = r["text"].strip()
        if not text or ANSREF.search(text) or SECTION.search(text):
            continue
        if r["font"].startswith(BADGE_FONT) or (r["size"] < 8 and len(text) < 8):
            h["badges"].append(text)
        elif abs(r["size"] - INSTR_SIZE) < 0.3:
            h["prompt"].append(text)
        elif text[0] in CIRCLED:
            h["choices"].append(text)
        else:
            h["body"].append(text)

    def tidy(text, keep_blank=False):
        """딸려 든 갈래 머리말을 떼고, 발문·보기에서는 빈칸도 뗀다.

        빈칸은 본문에만 있다. 발문이나 보기 끝에 붙은 것은 옆 선을 잘못 집은 것이다.
        본문에서는 빈칸이 곧 문제이므로 그대로 둔다.
        """
        t = re.sub(r"\s+", " ", text or "").strip()
        t = re.sub(r"바로 ?풀리는 ?(실전|개념) ?문제", " ", t)
        if not keep_blank:
            t = re.sub(r"(\s*_{3,})+\s*$", "", t)
            t = re.sub(r"^\s*(_{3,}\s*)+", "", t)
        return re.sub(r"\s+", " ", t).strip()

    out = []
    for h in heads:
        prompt = tidy(" ".join(h["prompt"]))
        body = [b for b in (tidy(x, keep_blank=True) for x in h["body"]) if b]
        # RULE 쪽은 발문 글씨 크기가 달라 본문에 섞인다 — 발문꼴이면 끌어올린다
        if not prompt and body and ASK.search(body[0]):
            prompt, body = tidy(body[0]), body[1:]
        if not prompt and not h["choices"]:
            continue
        choices = []
        for c in h["choices"]:
            n = CIRCLED.index(c[0]) + 1
            choices.append({"no": n, "text": tidy(c[1:])})
        out.append({
            "page": page_no,
            "printed_page": printed,
            "answer_page": ans,
            "chapter_no": carry["chapter_no"],
            "chapter": carry["chapter"],
            "section": carry["section"],
            "no": h["no"],
            "badges": [b for b in h["badges"] if b],
            "prompt": prompt,
            "body": body,
            "choices": choices,
            "question_kind": "객관식" if choices else "단답·서술",
        })
    return out


def parse(path):
    doc = fitz.open(path)
    carry = {"chapter_no": None, "chapter": None, "section": None}
    out = []
    for i, page in enumerate(doc):
        for row in parse_page(page, i + 1, carry):
            row["book"] = Path(path).stem
            out.append(row)
    return out


if __name__ == "__main__":
    rows = parse(sys.argv[1])
    Path(sys.argv[2]).write_text(json.dumps(rows, ensure_ascii=False, indent=1), encoding="utf-8")
    log = io.open(1, "w", encoding="utf-8", closefd=False)
    print("문항 %d개 저장: %s" % (len(rows), sys.argv[2]), file=log)
    kinds = {}
    for r in rows:
        kinds[r["question_kind"]] = kinds.get(r["question_kind"], 0) + 1
    for k, n in sorted(kinds.items(), key=lambda kv: -kv[1]):
        print("   %-12s %d개" % (k, n), file=log)
    print("   지시문 없는 문항 %d개" % sum(1 for r in rows if not r["prompt"]), file=log)
    log.flush()

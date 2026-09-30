# -*- coding: utf-8 -*-
"""고등 어법·서술형 교사용에서 문항과 답을 뽑는다.

교사용이라 답이 본문에 함께 찍혀 있다. 색으로 갈린다.

    3   빈출 유형 연습                        ← DINPro-Bold 21pt 번호
        주어진 단어를 배열하여 우리말을 영작하시오.        ← YDVYGOStd13 9.4pt 발문
        ⑴ 그가 그 회의를 참석할 필요는 없었다.            ← 검정 #231f20
           (no / him / conference / for / …)
              There was no need for him to attend …   ← 하늘색 #00aeef 답
        해설⑴ 의미상 주어(「for＋목적격」)＋to부정사        ← 해설, 넣지 않는다
                                        •conference 회의  ← 오른쪽 어휘, 넣지 않는다

정답지는 답만 담는다(해설·어휘는 뺀다). 단원 이름은 쪽 꼬리말에서 읽는다.

  python scripts/grammar-bank/hs_extract.py "…교사용….pdf" out.json
"""
import collections, io, json, re, sys
from pathlib import Path

import fitz

ANSWER_COLOR = 0x00AEEF
BLACK = 0x231F20
VOCAB_COLOR = 0x304F88   # 오른쪽 여백의 어휘 풀이
MID_X = 310              # 쪽이 두 단이다 — 이 왼쪽이 첫째 단
FOOT_Y = 788             # 이보다 아래는 꼬리말
NUM_FONT = "DINPro-Bold"
SET_FONT = "DINPro-Medium"
PROMPT_FONT = "YDVYGOStd13"
PROMPT_SIZE = (9.0, 9.8)
CIRCLED = "①②③④⑤⑥⑦⑧⑨⑩"
SUBNO = re.compile(r"^[⑴-⑽]")
SET_HEAD = re.compile(r"^\[\s*(\d{1,2})\s*[~∼-]\s*(\d{1,2})\s*\]")


def rows_of(page):
    out = []
    for block in page.get_text("dict")["blocks"]:
        for ln in block.get("lines", []):
            spans = [q for q in ln["spans"] if q["text"].strip()]
            if not spans:
                continue
            text = "".join(q["text"] for q in spans).strip()
            if not text:
                continue
            head = spans[0]
            out.append({
                "x": ln["bbox"][0], "y": ln["bbox"][1],
                "font": head["font"], "size": round(head["size"], 1),
                "color": head.get("color", 0),
                # 답은 하늘색 조각으로만 적힌다 — 조각마다 색을 따로 본다
                "cyan": "".join(q["text"] for q in spans
                                if q.get("color") == ANSWER_COLOR).strip(),
                "text": text,
            })
    out.sort(key=lambda r: (r["y"], r["x"]))
    return out


def chapter_of(page):
    """쪽 꼬리말의 「to부정사 / 21」에서 단원 이름을 읽는다.

    이름은 오른쪽 쪽에만 찍혀 있다(왼쪽 쪽은 「22 / GRAMMAR Point 03」). 글꼴이
    쪽마다 달라 자리와 크기로 잡는다.
    """
    for block in page.get_text("dict")["blocks"]:
        for ln in block.get("lines", []):
            if not (800 < ln["bbox"][1] < 815 and ln["bbox"][0] > 450):
                continue
            if ln["spans"][0]["size"] > 7.0:
                continue
            text = "".join(q["text"] for q in ln["spans"]).strip()
            name = text.split("/")[0].strip()
            if name and len(name) < 26 and not name.isdigit():
                return name
    return None


def is_korean(text):
    return bool(re.search(r"[가-힣]", text))


def parse_page(page, page_no, carry):
    rows = [r for r in rows_of(page)
            if r["y"] < FOOT_Y and r["color"] != VOCAB_COLOR
            and not r["text"].startswith("해설")]

    out = []
    for col in (0, 1):
        mine = [r for r in rows if (0 if r["x"] < MID_X else 1) == col]
        out += parse_column(mine, page_no, carry)
    return out


def parse_column(rows, page_no, carry):
    """한 단을 위에서 아래로 읽는다.

    두 단을 함께 보면 옆 단 문항의 글이 섞여 들어와, 답은 이 문항 것인데 본문은
    옆 문항 것이 되어 버린다.
    """
    heads, sets = [], []
    for r in rows:
        # 번호만 따로 놓인 줄도 있고, 발문이 같은 줄에 붙어 있기도 하다
        if r["font"].startswith(NUM_FONT) and r["size"] > 15:
            got = re.match(r"^(\d{1,2})\s*(.*)$", r["text"].strip())
            if got:
                r["no"] = int(got.group(1))
                r["lead"] = got.group(2).strip()
                heads.append(r)
        got = SET_HEAD.match(r["text"])
        if got and r["font"].startswith(SET_FONT):
            sets.append({"from": int(got.group(1)), "to": int(got.group(2)), "y": r["y"],
                         "ask": SET_HEAD.sub("", r["text"]).strip(), "lines": []})
    if not heads:
        return []
    heads.sort(key=lambda r: r["y"])
    sets.sort(key=lambda s: s["y"])

    # 지문은 「[4~5] 다음 글을 읽고」 아래에 한 번만 실리고 두 문항이 함께 쓴다
    edges = sorted([h["y"] for h in heads] + [s["y"] for s in sets])

    def spot(y):
        last = None
        for e in edges:
            if y >= e - 2:
                last = e
            else:
                break
        return last

    owner = {h["y"]: {"no": h["no"], "lead": h["lead"], "y": h["y"], "lines": []}
             for h in heads}
    for s in sets:
        owner[s["y"]] = s
    for r in rows:
        if r in heads or any(r["y"] == s["y"] and SET_HEAD.match(r["text"]) for s in sets):
            continue
        at = spot(r["y"])
        if at is None:
            continue
        owner[at]["lines"].append(r)

    out = []
    for h in heads:
        mine = owner[h["y"]]
        shared = [s for s in sets if s["from"] <= mine["no"] <= s["to"]]
        out += questions(mine, shared[0] if shared else None, page_no, carry)
    return out


def questions(item, shared, page_no, carry):
    """한 문항을 낱낱의 답 단위로 가른다 (⑴⑵ 가 있으면 그만큼)."""
    # 해설 줄은 미리 걷어 냈다 — 정답지에는 답만 담는다
    lines = item["lines"]
    if not lines:
        return []

    # 발문은 글꼴로 가린다. 지문이 먼저 나오고 발문이 그 뒤에 오는 문항도 많아,
    # 자리로 가리면(앞쪽 줄만 발문) 그런 문항의 발문을 통째로 놓친다.
    # 우리말 본문(번역할 문장)은 YDVYGOStd12 이고 발문만 YDVYGOStd13 이다.
    said, body_lines = [], []
    for r in lines:
        head = (r["font"].startswith(PROMPT_FONT) and is_korean(r["text"])
                and PROMPT_SIZE[0] <= r["size"] <= PROMPT_SIZE[1]
                and not r["cyan"] and not SUBNO.match(r["text"]))
        if head:
            said.append(re.sub(r"\s+", " ", r["text"]).strip())
            continue
        body_lines.append(r)
    if item.get("lead"):
        said.insert(0, item["lead"])
    # 제 발문이 없는 문항은 「[4~5] 다음 글을 읽고, 물음에 답하시오.」를 쓴다
    if not said and shared and shared.get("ask"):
        said = [shared["ask"]]
    prompt = " ".join(said)

    # ⑴⑵ 마다 따로 세운다. 없으면 통째로 하나다.
    parts, now = [], {"body": [], "answer": []}
    for r in body_lines:
        if SUBNO.match(r["text"]) and (now["body"] or now["answer"]):
            parts.append(now)
            now = {"body": [], "answer": []}
        if r["cyan"] and not is_korean(r["cyan"]):
            now["answer"].append(r["cyan"])
        elif not r["cyan"]:
            now["body"].append(re.sub(r"\s+", " ", r["text"]).strip())
    parts.append(now)

    lead = [re.sub(r"\s+", " ", r["text"]).strip()
            for r in (shared["lines"] if shared else []) if not r["cyan"]]
    out = []
    for n, part in enumerate(parts, 1):
        answer = " / ".join(a for a in part["answer"] if a)
        body = [b for b in part["body"] if b]
        if not answer or not body:
            continue
        # <보기> 상자와 ①~⑤ 보기가 나란히 놓인 문항은 글이 서로 엇갈려 담긴다.
        # 같은 동그라미 번호가 두 번 나오면 그 자국이므로 넣지 않는다.
        marks = collections.Counter(c for c in " ".join(body) if c in CIRCLED)
        if any(n > 1 for n in marks.values()):
            continue
        out.append({
            "page": page_no,
            "chapter": carry.get("chapter"),
            "no": item["no"],
            "sub": n if len(parts) > 1 else None,
            "prompt": prompt,
            "passage": lead,
            "body": body,
            "choices": [],
            "answer": answer,
            "question_kind": "단답·서술",
        })
    return out


def main(src, dst):
    doc = fitz.open(src)
    # 이름은 오른쪽 쪽에만 있으니, 먼저 다 읽어 두고 왼쪽 쪽은 뒤쪽 것을 물려받는다
    names = [chapter_of(p) for p in doc]
    for i in range(len(names) - 2, -1, -1):
        if not names[i]:
            names[i] = names[i + 1]

    out = []
    for i, page in enumerate(doc):
        carry = {"chapter": names[i]}
        for row in parse_page(page, i + 1, carry):
            row["book"] = Path(src).stem
            out.append(row)
    Path(dst).write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")

    log = io.open(1, "w", encoding="utf-8", closefd=False)
    import collections

    chs = collections.Counter(r["chapter"] for r in out)
    print("고등 서술형 %d문항 저장: %s" % (len(out), dst), file=log)
    print("단원 %d가지" % len(chs), file=log)
    for k, n in chs.most_common():
        print("   %-24s %d문항" % (k, n), file=log)
    log.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])

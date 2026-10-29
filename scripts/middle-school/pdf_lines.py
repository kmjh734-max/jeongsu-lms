"""족보닷컴 문제 PDF(최다빈출·최상위·최다오답) → 읽는 차례의 글줄.

PDF에는 글자층이 있지만 ①~⑤가 8×8 그림으로 박혀 있고(보기 번호·정답 모두), 밑줄은 가는 선 그림이며, 2단이다.
- 그림 다섯 종류(digest)를 ①~⑤로 맞춘다: 보기 줄에서 같은 문항 안 차례(첫째·둘째…)를 세어 가장 많은 차례를 번호로 본다.
- 번호 그림은 그 자리의 글자 「①」로 되돌려 줄 안에 넣는다.
- 밑줄 선(높이 1.5pt 미만, 폭 200pt 미만) 바로 위 낱말은 <u>…</u>로 감싼다.
- 단은 쪽 가운데(x 300)로 가르고, 왼단 → 오른단 차례로 읽는다.
"""
import fitz, re, collections

CIRC = "①②③④⑤"
KO = re.compile(r"[가-힣]")


def page_items(page):
    words = page.get_text("words")  # x0 y0 x1 y1 word block line wno
    marks = [b for b in page.get_image_info(hashes=True) if (b["bbox"][2] - b["bbox"][0]) < 12 and (b["bbox"][3] - b["bbox"][1]) < 12]
    lines_u = [d["rect"] for d in page.get_drawings() if d["rect"].height < 1.6 and 6 < d["rect"].width < 200]
    return words, marks, lines_u


def digest_map(doc):
    """그림 digest → 번호(1~5). 같은 줄 무리(한 문항의 보기)에서 차례를 센다."""
    votes = collections.defaultdict(collections.Counter)
    for page in doc:
        _w, marks, _l = page_items(page)
        for col in (0, 1):
            ms = sorted([m for m in marks if (m["bbox"][0] >= 300) == bool(col)], key=lambda m: (m["bbox"][1], m["bbox"][0]))
            # 세로로 30pt 넘게 떨어지면 다른 무리
            groups, cur = [], []
            for m in ms:
                if cur and m["bbox"][1] - cur[-1]["bbox"][1] > 30:
                    groups.append(cur)
                    cur = []
                cur.append(m)
            if cur:
                groups.append(cur)
            for g in groups:
                if len(g) == 5:
                    for i, m in enumerate(g):
                        votes[m["digest"]][i + 1] += 1
    return {dg: c.most_common(1)[0][0] for dg, c in votes.items()}


def read_lines(page, dmap, skip_top=62, skip_bottom=790):
    """쪽 → [(단, y, x0, 글)] 읽는 차례"""
    words, marks, ulines = page_items(page)
    toks = []
    for w in words:
        x0, y0, x1, y1, t = w[:5]
        if y0 < skip_top or y1 > skip_bottom:
            continue
        u = any(abs(l.y0 - y1) < 3.2 and l.x0 < x1 - 1 and l.x1 > x0 + 1 for l in ulines)
        toks.append({"x0": x0, "x1": x1, "y": (y0 + y1) / 2, "t": t, "u": u})
    for m in marks:
        x0, y0, x1, y1 = m["bbox"]
        if y0 < skip_top or y1 > skip_bottom:
            continue
        n = dmap.get(m["digest"])
        if n:
            toks.append({"x0": x0, "x1": x1, "y": (y0 + y1) / 2, "t": CIRC[n - 1], "u": False, "mark": True})
    out = []
    for col in (0, 1):
        ts = sorted([t for t in toks if (t["x0"] >= 300) == bool(col)], key=lambda t: (t["y"], t["x0"]))
        rows = []
        for t in ts:
            if rows and abs(rows[-1][0]["y"] - t["y"]) < 3.5:
                rows[-1].append(t)
            else:
                rows.append([t])
        for r in rows:
            r.sort(key=lambda t: t["x0"])
            parts, prev = [], None
            for t in r:
                gap = t["x0"] - prev["x1"] if prev else 0
                sep = "" if prev is None else ("\t" if gap > 14 else " ")
                txt = f"<u>{t['t']}</u>" if t["u"] else t["t"]
                parts.append(sep + txt)
                prev = t
            text = "".join(parts).replace("</u> <u>", " ")
            out.append((col, r[0]["y"], r[0]["x0"], text))
    return out

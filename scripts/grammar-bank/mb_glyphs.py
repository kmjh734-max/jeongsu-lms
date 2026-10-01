# -*- coding: utf-8 -*-
"""중학영문법 3800제의 글자 모양표를 만든다 (이 컴퓨터 안에서만, 바깥 서비스 없이).

이 책은 글자가 선으로 그려져 있어 글자로 뽑히지 않는다. 그런데 **같은 글자는 같은
모양**이므로, 모양마다 한 번만 알아내면 책 전체를 되살릴 수 있다.

알아내는 법
    1) 선 도형을 줄로 묶는다 (자리가 정확히 남아 있다).
    2) 줄을 크게 그려 이 컴퓨터의 글자 읽기(easyocr)로 읽는다.
    3) 읽은 글자 수와 도형 수가 똑같은 줄만 쓴다 — 그러면 짝이 하나로 맞는다.
    4) 여러 줄에서 모은 표를 다수결로 굳힌다. 한 줄이 잘못 읽혀도 묻힌다.

자주 나오는 모양은 사람이 눈으로 한 번 더 본다(mb_sheet.py).

  python scripts/grammar-bank/mb_glyphs.py "…3800제.pdf" 모양표.json [쪽수]
"""
import collections, hashlib, io, json, re, sys
from pathlib import Path

import fitz

LOG = io.open(1, "w", encoding="utf-8", closefd=False)
ROW = 3.0          # 같은 줄로 볼 높이 차


def shape_key(d):
    """선 모양을 글자 상자에 맞춰 잰 열쇠 — 같은 글자는 같은 값"""
    r = d["rect"]
    w = r.width or 1
    h = r.height or 1
    parts = ["%.2f" % (w / h)]
    for it in d["items"]:
        parts.append(it[0])
        for p in it[1:]:
            if isinstance(p, fitz.Point):
                parts.append("%.2f,%.2f" % ((p.x - r.x0) / w, (p.y - r.y0) / h))
    return hashlib.md5("|".join(parts).encode()).hexdigest()[:16]


def glyphs_of(page):
    out = []
    for d in page.get_drawings():
        r = d["rect"]
        if r.height > 16 or r.width > 60 or r.width < 0.3 or r.height < 0.5:
            continue
        c = d.get("fill") or d.get("color")
        if not c:
            continue
        out.append({"x": r.x0, "x1": r.x1, "y": r.y0, "y1": r.y1,
                    "color": tuple(round(v, 1) for v in c), "shape": shape_key(d)})
    return out


def rows_of(glyphs, least=4):
    """글자 **가운데 높이**가 비슷한 것끼리 한 줄로 묶는다.

    밑선으로 묶으면 p·g·y·j 처럼 아래로 내려가는 글자가 딴 줄로 떨어져 나가,
    낱말이 「ob ected」처럼 깨진다. 가운데 높이는 아래로 내려가는 글자나 위로
    솟는 글자나 비슷해, 한 줄이 온전히 모인다.
    """
    out = []
    for g in sorted(glyphs, key=lambda g: ((g["y"] + g["y1"]) / 2, g["x"])):
        mid = (g["y"] + g["y1"]) / 2
        if out and abs(out[-1]["mid"] - mid) < ROW:
            line = out[-1]
            line["gl"].append(g)
            line["mid"] = (line["mid"] * (len(line["gl"]) - 1) + mid) / len(line["gl"])
        else:
            out.append({"mid": mid, "gl": [g]})
    for line in out:
        line["gl"].sort(key=lambda g: g["x"])
    return [line["gl"] for line in out if len(line["gl"]) >= least]


def main(src, dst, upto=None, seed=None):
    """src 에 쉼표로 여러 권을 적으면 한 표에 함께 모은다 — 세 권이 같은 글꼴이다."""
    books = [fitz.open(s) for s in str(src).split(",")]
    plan = [(doc, pno) for doc in books
            for pno in range(min(int(upto), len(doc)) if upto else len(doc))]

    import easyocr
    import numpy as np
    reader = easyocr.Reader(["ko", "en"], gpu=False, verbose=False)

    DPI = 200
    GAP = 18          # 쌓을 때 줄 사이 틈 (점)

    def read_many(shots):
        """줄 그림 여러 장을 한 장에 쌓아 한 번에 읽는다.

        줄은 이미 잘라 놓았으므로 글자 찾기(검출)를 다시 돌 까닭이 없다. 자리를
        알려 주고 읽기만 시키면 품이 크게 줄고, 쌓아서 한 번에 넘기면 더 준다.
        """
        if not shots:
            return []
        wide = max(s.width for s in shots)
        tall = sum(s.height for s in shots) + GAP * (len(shots) + 1)
        sheet = np.full((tall, wide), 255, dtype=np.uint8)   # 흑백이면 더 빠르다
        boxes, y = [], GAP
        for s in shots:
            arr = np.frombuffer(s.samples, dtype=np.uint8).reshape(s.height, s.width, s.n)
            grey = arr[:, :, :3].mean(axis=2).astype(np.uint8)
            sheet[y:y + s.height, 0:s.width] = grey
            boxes.append([0, s.width, y, y + s.height])
            y += s.height + GAP
        try:
            got = reader.recognize(sheet, horizontal_list=boxes, free_list=[],
                                   detail=0, batch_size=len(boxes), reformat=False)
        except Exception:
            return [""] * len(boxes)      # 한 묶음이 어긋나도 책 전체를 멈추지 않는다
        return [str(t) for t in got] if len(got) == len(boxes) else [""] * len(boxes)

    votes = collections.defaultdict(collections.Counter)
    seen = collections.Counter()
    # 앞서 만들어 둔 표가 있으면 씨앗으로 깐다 — 이미 아는 모양은 다시 읽지 않아
    # 품이 크게 준다. (끊긴 일을 이어 돌릴 때 쓴다.)
    if seed:
        said = json.loads(Path(seed).read_text(encoding="utf-8"))
        for shape, v in said.get("table", {}).items():
            votes[shape][v["ch"]] = max(3, int(v.get("n", 3)))
        print("씨앗 표에서 모양 %d가지를 받아 왔다" % len(said.get("table", {})), file=LOG)
    later = []
    used = skipped = 0

    def enough(shape):
        """이 모양은 넉넉히 봤는가 — 보느라 빈 칸을 만들지 않는다"""
        box = votes.get(shape)
        return bool(box) and sum(box.values()) >= 3
    def learn(rows, texts):
        nonlocal used, skipped
        for row, got in zip(rows, texts):
            text = re.sub(r"\s+", "", got)
            if text and len(text) == len(row):
                used += 1
                for g, ch in zip(row, text):
                    votes[g["shape"]][ch] += 1
            elif text and abs(len(text) - len(row)) <= 3 and len(row) <= 40:
                # 길이가 조금 어긋난 줄은 모아 두었다가, 표가 어느 정도 찬 뒤에
                # 아는 글자를 닻 삼아 맞춰 끼운다
                later.append(("".join(g["shape"] for g in row), text, len(row)))
                skipped += 1
            else:
                skipped += 1

    for step, (doc, pno) in enumerate(plan):
        page = doc[pno]
        gl = glyphs_of(page)
        for g in gl:
            seen[g["shape"]] += 1
        batch, shots = [], []
        for row in rows_of(gl):
            box = fitz.Rect(min(g["x"] for g in row) - 1, min(g["y"] for g in row) - 1,
                            max(g["x1"] for g in row) + 1, max(g["y1"] for g in row) + 1)
            if not (6 < box.width <= 420) or not (3 < box.height <= 20):
                skipped += 1
                continue
            # 이미 넉넉히 본 모양만 있는 줄은 읽지 않는다 — 앞쪽 몇십 쪽이면
            # 자주 나오는 글자는 다 차므로, 이것만으로 품이 크게 준다
            if all(enough(g["shape"]) for g in row):
                skipped += 1
                continue
            try:
                shot = page.get_pixmap(dpi=DPI, clip=box)
            except Exception:
                skipped += 1
                continue
            if shot.width < 8 or shot.height < 8:
                skipped += 1
                continue
            shots.append(shot)
            batch.append(row)
            if len(batch) >= 16:
                learn(batch, read_many(shots))
                batch, shots = [], []
        if batch:
            learn(batch, read_many(shots))
        if (step + 1) % 10 == 0:
            done = sum(1 for s in seen if votes.get(s))
            print("  %4d/%d쪽 · 쓴 줄 %d · 버린 줄 %d · 알아낸 모양 %d/%d"
                  % (step + 1, len(plan), used, skipped, done, len(seen)), file=LOG)
            LOG.flush()
            # 오래 걸리는 일이라 중간에 끊겨도 건지도록 틈틈이 적어 둔다
            Path(dst + ".part").write_text(json.dumps(
                {"table": {s: {"ch": b.most_common(1)[0][0],
                               "sure": round(b.most_common(1)[0][1] / sum(b.values()), 2),
                               "n": sum(b.values())}
                           for s, b in votes.items() if b},
                 "seen": dict(seen), "upto": step + 1}, ensure_ascii=False), encoding="utf-8")

    # ── 길이가 어긋났던 줄을 아는 글자에 맞춰 끼운다 ──
    import difflib
    for turn in range(3):
        best = {s: box.most_common(1)[0][0] for s, box in votes.items()}
        got = 0
        for keys, text, n in later:
            shapes = [keys[i * 16:(i + 1) * 16] for i in range(n)]
            guess = "".join(best.get(s, "￿") for s in shapes)
            sm = difflib.SequenceMatcher(None, guess, text, autojunk=False)
            for i, j, size in sm.get_matching_blocks():
                # 닻이 맞은 자리를 기준으로 그 둘레의 모르는 글자를 채운다
                for k in range(-2, size + 2):
                    a, b = i + k, j + k
                    if 0 <= a < n and 0 <= b < len(text) and shapes[a] not in best:
                        votes[shapes[a]][text[b]] += 1
                        got += 1
        print("  맞춰 끼우기 %d번째 — 새로 알아낸 자리 %d곳 (모양 %d가지)"
              % (turn + 1, got, len(votes)), file=LOG)
        LOG.flush()
        if not got:
            break

    table = {}
    for shape, box in votes.items():
        if not box:
            continue          # 건너뛸지 보느라 만들어진 빈 칸이다
        ch, n = box.most_common(1)[0]
        table[shape] = {"ch": ch, "sure": round(n / sum(box.values()), 2), "n": sum(box.values())}
    Path(dst).write_text(json.dumps({"table": table, "seen": dict(seen)},
                                    ensure_ascii=False), encoding="utf-8")
    covered = sum(seen[s] for s in table)
    print("\n모양 %d가지 중 %d가지를 알아냈다 — 글자 수로 %.1f%%"
          % (len(seen), len(table), covered * 100 / max(sum(seen.values()), 1)), file=LOG)
    LOG.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2],
         sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] != "-" else None,
         sys.argv[4] if len(sys.argv) > 4 else None)

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


def rows_of(glyphs):
    """밑선이 비슷한 것끼리 한 줄로 묶는다"""
    out = []
    for g in sorted(glyphs, key=lambda g: (round(g["y1"] / ROW), g["x"])):
        if out and abs(out[-1][-1]["y1"] - g["y1"]) < ROW and g["x"] >= out[-1][-1]["x"] - 1:
            out[-1].append(g)
        else:
            out.append([g])
    return [r for r in out if len(r) >= 4]


def main(src, dst, upto=None):
    doc = fitz.open(src)
    pages = range(min(int(upto), len(doc)) if upto else len(doc))

    import easyocr
    reader = easyocr.Reader(["ko", "en"], gpu=False, verbose=False)

    votes = collections.defaultdict(collections.Counter)
    seen = collections.Counter()
    later = []
    used = skipped = 0
    for pno in pages:
        page = doc[pno]
        gl = glyphs_of(page)
        for g in gl:
            seen[g["shape"]] += 1
        for row in rows_of(gl):
            box = fitz.Rect(min(g["x"] for g in row) - 1, min(g["y"] for g in row) - 1,
                            max(g["x1"] for g in row) + 1, max(g["y1"] for g in row) + 1)
            if not (6 < box.width <= 420) or not (3 < box.height <= 20):
                skipped += 1
                continue
            # 이미 넉넉히 본 모양만 있는 줄은 읽지 않는다 — 앞쪽 몇십 쪽이면
            # 자주 나오는 글자는 다 차므로, 이것만으로 품이 크게 준다
            if all(sum(votes[g["shape"]].values()) >= 3 for g in row):
                skipped += 1
                continue
            try:
                pix = page.get_pixmap(dpi=300, clip=box)
                raw = pix.tobytes("png")
            except Exception:
                skipped += 1
                continue
            got = reader.readtext(raw, detail=0, paragraph=True)
            text = re.sub(r"\s+", "", "".join(got))
            if len(text) == len(row):
                used += 1
                for g, ch in zip(row, text):
                    votes[g["shape"]][ch] += 1
            elif abs(len(text) - len(row)) <= 3 and len(row) <= 40:
                # 길이가 조금 어긋난 줄은 모아 두었다가, 표가 어느 정도 찬 뒤에
                # 아는 글자를 닻 삼아 맞춰 끼운다
                later.append(("".join(g["shape"] for g in row), text, len(row)))
                skipped += 1
            else:
                skipped += 1
        if (pno + 1) % 10 == 0:
            done = sum(1 for s in seen if votes.get(s))
            print("  %3d쪽 · 쓴 줄 %d · 버린 줄 %d · 알아낸 모양 %d/%d"
                  % (pno + 1, used, skipped, done, len(seen)), file=LOG)
            LOG.flush()

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
        ch, n = box.most_common(1)[0]
        table[shape] = {"ch": ch, "sure": round(n / sum(box.values()), 2), "n": sum(box.values())}
    Path(dst).write_text(json.dumps({"table": table, "seen": dict(seen)},
                                    ensure_ascii=False), encoding="utf-8")
    covered = sum(seen[s] for s in table)
    print("\n모양 %d가지 중 %d가지를 알아냈다 — 글자 수로 %.1f%%"
          % (len(seen), len(table), covered * 100 / max(sum(seen.values()), 1)), file=LOG)
    LOG.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else None)

# -*- coding: utf-8 -*-
"""글자 모양표를 **은행에 쌓인 낱말**로 맞춰 바로잡는다 (바깥 서비스 없이).

기계가 줄을 읽어 만든 표에는 늘 같은 자리에서 틀리는 글자가 있다. 「I」를 t 로,
「'」를 t 로, 「Y」를 모름으로 읽는 식이다. 그런데 우리에게는 이미 문법 은행에
쌓인 영어 낱말 9천여 가지가 있다. 모양 하나의 글자를 바꿔 보면서 **낱말이 되는
쪽**을 고르면, 사람이 한 자 한 자 보지 않아도 표가 깨끗해진다.

    before  tt is a book.   ← t 가 I 라면 「It is a book.」
    after   It is a book.

  python scripts/grammar-bank/mb_tune.py 모양표.json "…3800제.pdf" [쪽수]
고친 것은 tmp-grammar-bank/mb-fix.json 에 쌓인다(사람이 적은 것은 덮지 않는다).
"""
import collections, io, json, re, sys
from pathlib import Path

import fitz

sys.path.insert(0, str(Path(__file__).parent))
from mb_glyphs import glyphs_of, rows_of

LOG = io.open(1, "w", encoding="utf-8", closefd=False)
OUT = Path("tmp-grammar-bank")
WORDS = OUT / "bank-words.json"
FIX = OUT / "mb-fix.json"
# 바꿔 볼 글자들 — 자주 헷갈리는 짝을 넉넉히 둔다
TRY = list("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.,?!;:-")


def pieces(page, table):
    """쪽을 낱말 단위로 쪼갠다 — (낱말 글자들, 모양들)"""
    out = []
    for row in rows_of(glyphs_of(page), least=1):
        word, shapes, last = [], [], None
        for g in row:
            wide = max(1.6, (g["y1"] - g["y"]) * 0.34)
            if last is not None and g["x"] - last > wide:
                if word:
                    out.append((word, shapes))
                word, shapes = [], []
            got = table.get(g["shape"])
            word.append(got["ch"] if got else "□")
            shapes.append(g["shape"])
            last = g["x1"]
        if word:
            out.append((word, shapes))
    return out


def main(table_path, pdf, upto=80):
    said = json.loads(Path(table_path).read_text(encoding="utf-8"))
    table = dict(said["table"])
    by_hand = json.loads(FIX.read_text(encoding="utf-8")) if FIX.exists() else {}
    for shape, ch in by_hand.items():
        table[shape] = {"ch": ch, "sure": 1.0, "n": 99}
    words = set(json.loads(WORDS.read_text(encoding="utf-8")))

    doc = fitz.open(pdf)
    # 모양마다 그 모양이 든 낱말을 모은다
    where = collections.defaultdict(list)
    for pno in range(min(int(upto), len(doc))):
        for word, shapes in pieces(doc[pno], table):
            if len(word) < 2 or len(word) > 18:
                continue
            if not all(re.fullmatch(r"[A-Za-z'□.,]", c) for c in word):
                continue          # 영어 낱말만 본다
            for at, shape in enumerate(shapes):
                if len(where[shape]) < 400:
                    where[shape].append((word, at))

    def score(word):
        """낱말이 되는가 — 두 글자짜리는 어쩌다 맞을 수 있어 세 글자부터 센다"""
        w = "".join(word).strip(".,?!;:'").lower()
        return 1 if (len(w) >= 3 and w in words) else 0

    fixed, looked = {}, 0
    order = sorted(where, key=lambda s: -len(where[s]))
    for shape in order:
        spots = where[shape]
        if len(spots) < 6:
            continue
        looked += 1
        now = table.get(shape, {}).get("ch", "□")
        if shape in by_hand:
            continue
        now_n = sum(score(w) for w, _ in spots)
        best, best_n = now, now_n
        for ch in TRY:
            if ch == now:
                continue
            got = 0
            for word, at in spots:
                tried = list(word)
                tried[at] = ch
                got += score(tried)
            if got > best_n:
                best, best_n = ch, got
        # 넉넉히 나아질 때만 바꾼다 — 어쩌다 한두 낱말이 맞는 것으로는 바꾸지 않는다
        if (best != now and best_n >= now_n + 3 and best_n >= 0.3 * len(spots)
                and best_n >= 2 * max(now_n, 1)):
            fixed[shape] = (best, now_n, best_n,
                            ["".join(w[:at]) + "[" + best + "]" + "".join(w[at + 1:])
                             for w, at in spots[:3]])

    out = dict(by_hand)
    out.update({s: v[0] for s, v in fixed.items()})
    FIX.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print("낱말로 맞춰 본 모양 %d가지 · 바로잡은 것 %d가지 (표 전체 %d가지)"
          % (looked, len(fixed), len(table)), file=LOG)
    for shape, (ch, was, now_got, sample) in list(fixed.items())[:26]:
        print("   %s → %s  낱말 %d개 → %d개 (%d곳)  보기: %s"
              % (table.get(shape, {}).get("ch", "□"), ch, was, now_got,
                 len(where[shape]), ", ".join(sample)), file=LOG)
    LOG.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else 80)

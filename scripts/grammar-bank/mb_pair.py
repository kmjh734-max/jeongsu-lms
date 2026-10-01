# -*- coding: utf-8 -*-
"""틀린 낱말과 바른 낱말을 짝지어 주면, 글자 모양표를 그 자리에서 바로잡는다.

    팔호 → 괄호      「팔」 자리에 쓰인 모양이 사실은 「괄」이다

사람이 글을 읽다 눈에 걸린 것을 이렇게 적어 주면, 그 모양이 책 어디에 쓰였든
한꺼번에 고쳐진다. 모양을 하나하나 들여다보지 않아도 된다.

  python scripts/grammar-bank/mb_pair.py 모양표.json "…3800제.pdf" 짝.json [쪽수]
짝.json 은 {"팔호": "괄호", "반칸": "빈칸"} 꼴이다.
"""
import collections, io, json, sys
from pathlib import Path

import fitz

sys.path.insert(0, str(Path(__file__).parent))
from mb_tune import pieces
from mb_read import load_table

LOG = io.open(1, "w", encoding="utf-8", closefd=False)
FIX = Path("tmp-grammar-bank/mb-fix.json")


def main(table_path, pdf, pairs_path, upto=120):
    table = load_table(table_path)
    pairs = json.loads(Path(pairs_path).read_text(encoding="utf-8"))
    pairs = {k: v for k, v in pairs.items() if len(k) == len(v)}

    doc = fitz.open(pdf)
    votes = collections.defaultdict(collections.Counter)
    for pno in range(min(int(upto), len(doc))):
        for word, shapes in pieces(doc[pno], table):
            said = "".join(word)
            for bad, good in pairs.items():
                at = said.find(bad)
                if at < 0:
                    continue
                for i, (was, now) in enumerate(zip(bad, good)):
                    if was != now:
                        votes[shapes[at + i]][now] += 1

    out = json.loads(FIX.read_text(encoding="utf-8")) if FIX.exists() else {}
    got = 0
    for shape, box in votes.items():
        ch, n = box.most_common(1)[0]
        if n < 2:
            continue
        was = table.get(shape, {}).get("ch", "□")
        if was == ch:
            continue
        out[shape] = ch
        got += 1
        print("   %s → %s   (%d곳에서 봤다)" % (was, ch, n), file=LOG)
    FIX.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print("짝 %d개로 모양 %d가지를 바로잡았다 (고침표 %d가지)"
          % (len(pairs), got, len(out)), file=LOG)
    LOG.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], sys.argv[3],
         sys.argv[4] if len(sys.argv) > 4 else 120)

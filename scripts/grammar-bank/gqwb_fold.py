# -*- coding: utf-8 -*-
"""눈으로 읽어 적어 둔 그래머큐 워크북 답을 문항에 맞물린다.

정답지 뒤쪽의 워크북 답은 글자가 선으로 그려져 있어 기계로는 읽히지 않는다.
그래서 쪽을 그림으로 띄워 **사람이 직접 읽어** 적어 두었다(gqwb-ans/*.json).
그 표를 (강, 묶음, 번호)로 문항에 붙인다.

적어 둔 꼴
    {"book": "s1", "units": {"1": {"A": ["He is, …", …], "B": […]}}}
    A·B·C… 는 묶음 차례(0·1·2…), 배열의 자리가 곧 문항 번호다.
    앞 쪽에서 끊긴 묶음은 "A_more": {"10": "enjoys"} 처럼 번호를 적어 둔다.

  python scripts/grammar-bank/gqwb_fold.py s1 결과.json
"""
import collections, io, json, re, sys
from pathlib import Path

HERE = Path("tmp-grammar-bank")
LETTERS = "ABCDEFGH"


def answers_of(book):
    """적어 둔 쪽들을 한 표로 모은다 — (강, 묶음, 번호) → 답"""
    out = {}
    for path in sorted((HERE / "gqwb-ans").glob("%s-*.json" % book)):
        said = json.loads(path.read_text(encoding="utf-8"))
        for unit, blocks in said["units"].items():
            for tag, items in blocks.items():
                more = tag.endswith("_more")
                block = LETTERS.index(tag[0])
                if more:
                    for no, text in items.items():
                        out[(int(unit), block, int(no))] = text
                else:
                    for i, text in enumerate(items, 1):
                        out[(int(unit), block, i)] = text
    return out


def main(book, dst):
    log = io.open(1, "w", encoding="utf-8", closefd=False)
    said = answers_of(book)
    # 강 이름이 본책에서 안 걷힌 데가 있다 — 정답지에서 읽어 적어 둔 이름으로 채운다
    titles = json.loads((HERE / "gqwb-ans" / "titles.json").read_text(encoding="utf-8")).get(book, {})
    rows = json.loads((HERE / ("gqwb-%s.json" % book)).read_text(encoding="utf-8"))
    out, miss = [], collections.Counter()
    for q in rows:
        key = (int(q["unit_no"]), int(q["block"]), int(q["no"]))
        text = said.get(key)
        if not text:
            miss[(key[0], key[1])] += 1
            continue
        row = dict(q)
        row["answer"] = text
        if not row.get("unit"):
            row["unit"] = titles.get(str(key[0]))
        out.append(row)
    Path(dst).write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print("%s — 문항 %d개 중 답을 붙인 것 %d개 (%d%%) · 적어 둔 답 %d개"
          % (book, len(rows), len(out), round(len(out) / max(len(rows), 1) * 100), len(said)),
          file=log)
    for (u, b), n in miss.most_common(8):
        print("   ✕ 강%d 묶음%s — 답 없음 %d문항" % (u, LETTERS[b], n), file=log)
    log.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])

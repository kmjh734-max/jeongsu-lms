# -*- coding: utf-8 -*-
"""글자 모양표의 **우리말 글자**를 은행의 낱말로 맞춰 바로잡는다 (바깥 서비스 없이).

영어는 바꿔 볼 글자가 몇 안 되어 하나씩 넣어 보면 되지만, 우리말은 글자가
수천 가지라 그럴 수 없다. 그래서 거꾸로 간다 — 은행에 쌓인 우리말 낱말을 한
자리씩 가린 꼴(「괄?」, 「?호」)로 미리 적어 두고, 3800제에서 읽은 낱말을 같은
꼴로 찾아 **그 자리에 올 수 있는 글자**를 표로 모은다.

    읽은 글   팔호 안에        가린 꼴 ?호 → 은행에는 「괄호」
    고친 글   괄호 안에

  python scripts/grammar-bank/mb_tune_ko.py 모양표.json "…3800제.pdf" [쪽수]
고친 것은 tmp-grammar-bank/mb-fix.json 에 쌓인다(사람이 적은 것은 덮지 않는다).
"""
import collections, io, json, re, sys
from pathlib import Path

import fitz

sys.path.insert(0, str(Path(__file__).parent))
from mb_tune import pieces

LOG = io.open(1, "w", encoding="utf-8", closefd=False)
OUT = Path("tmp-grammar-bank")
WORDS = OUT / "bank-kowords.json"
FIX = OUT / "mb-fix.json"
KO = re.compile(r"[가-힣]")


def masked(words):
    """낱말을 한 자리씩 가린 꼴로 적어 둔다 — {가린 꼴: 그 자리에 오는 글자들}"""
    book = collections.defaultdict(collections.Counter)
    for w in words:
        for at in range(len(w)):
            book[w[:at] + "?" + w[at + 1:]][w[at]] += 1
    return book


def main(table_path, pdf, upto=80):
    said = json.loads(Path(table_path).read_text(encoding="utf-8"))
    table = dict(said["table"])
    by_hand = json.loads(FIX.read_text(encoding="utf-8")) if FIX.exists() else {}
    for shape, ch in by_hand.items():
        table[shape] = {"ch": ch, "sure": 1.0, "n": 99}
    book = masked(json.loads(WORDS.read_text(encoding="utf-8")))

    doc = fitz.open(pdf)
    words = set(json.loads(WORDS.read_text(encoding="utf-8")))
    where = collections.defaultdict(list)
    for pno in range(min(int(upto), len(doc))):
        for word, shapes in pieces(doc[pno], table):
            if not (2 <= len(word) <= 8):
                continue
            # 우리말 낱말만 본다
            if not all(KO.match(c) for c in word):
                continue
            for at, shape in enumerate(shapes):
                if len(where[shape]) < 300:
                    where[shape].append((word, at))

    fixed = {}
    for shape, spots in where.items():
        if shape in by_hand or len(spots) < 6:
            continue
        now = table.get(shape, {}).get("ch", "□")
        # 바꿔 볼 글자는 「가린 꼴」로 찾은 것만 본다 — 우리말은 글자가 수천 가지라
        # 하나씩 넣어 볼 수 없다.
        maybe = collections.Counter()
        for word, at in spots:
            key = "".join(word[:at]) + "?" + "".join(word[at + 1:])
            for ch in book.get(key, {}):
                maybe[ch] += 1
        if not maybe:
            continue

        def count(ch):
            """이 글자로 보면 **서로 다른** 낱말이 몇 개나 되는가.

            같은 낱말이 여러 번 나온 것을 세면, 「반칸」이 「반면」으로 바뀌는 것
            같은 한 낱말짜리 착각이 이긴다. 그래서 가짓수로 센다.
            """
            got = set()
            for word, at in spots:
                tried = list(word)
                tried[at] = ch
                made = "".join(tried)
                if made in words:
                    got.add(made)
            return len(got)

        now_n = count(now)
        best, best_n = now, now_n
        for ch, _ in maybe.most_common(8):
            if ch == now:
                continue
            got = count(ch)
            if got > best_n:
                best, best_n = ch, got
        if best != now and best_n >= 3 and best_n >= now_n + 3:
            fixed[shape] = (best, now, best_n, now_n, len(spots))

    out = dict(by_hand)
    out.update({s: v[0] for s, v in fixed.items()})
    FIX.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print("우리말로 맞춰 본 모양 %d가지 · 바로잡은 것 %d가지" % (len(where), len(fixed)), file=LOG)
    for shape, (ch, now, n, mine, times) in sorted(
            fixed.items(), key=lambda kv: -kv[1][4])[:30]:
        print("   %s → %s   (낱말 %d개 → %d개 · %d곳에서 봤다)"
              % (now, ch, mine, n, times), file=LOG)
    LOG.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else 80)

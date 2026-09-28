# -*- coding: utf-8 -*-
"""영어만 있는 문항에서 쓰는 형용사 교체.

우리말은 형용사가 활용을 한다(높은·높다·높아서). 해석문이 붙은 문항에서 영어만
바꾸면 우리말이 어긋나므로, 본문과 보기에 한글이 없는 문항에서만 쓴다.

동사는 다루지 않는다. 같은 동사가 문장마다 문형이 달라서(my friend moved to
another city / I moved the desk) 문장을 이해하지 않고는 가릴 수 없고, 규칙동사는
과거와 과거분사가 같아서(started·started) 불규칙동사로 바꿀 때 어느 쪽인지
갈라지지 않는다. 그 일은 사람이 문장을 보고 해야 한다.

형용사는 뒤따르는 구조를 바꾸지 않아 안전하다. 다만 비교급 만드는 방식이
같은 것끼리만 묶는다. tall→taller와 expensive→more expensive가 섞이면 깨진다.
"""
import re

import vocab as _vocab

# 비교급을 -er로 만드는 것끼리, more로 만드는 것끼리 따로 묶는다.
# 사람에게 쓰는 말과 사물에 쓰는 말을 섞으면 "자신이 비싸다"가 된다.
# 비교급 만드는 방식도 같은 것끼리만 묶는다(-er 무리와 more 무리를 섞지 않는다).
ADJECTIVES = [
    # 사람의 기분 — -ier
    [("happy", "happier", "happiest"), ("angry", "angrier", "angriest"),
     ("hungry", "hungrier", "hungriest"), ("thirsty", "thirstier", "thirstiest"),
     ("sleepy", "sleepier", "sleepiest")],
    # 사람의 성격 — more
    [("polite", "more polite", "most polite"),
     ("careful", "more careful", "most careful"),
     ("honest", "more honest", "most honest"),
     ("generous", "more generous", "most generous")],
    # 사물의 성질 — more
    [("expensive", "more expensive", "most expensive"),
     ("useful", "more useful", "most useful"),
     ("colorful", "more colorful", "most colorful")],
    # 사물의 크기 — -er
    [("deep", "deeper", "deepest"), ("wide", "wider", "widest"),
     ("narrow", "narrower", "narrowest")],
    # 키 — 사람에게도 사물에게도 쓴다
    [("tall", "taller", "tallest"), ("short", "shorter", "shortest")],
]

FORMS = ("원급", "비교급", "최상급")


def build():
    pools = []
    for entries in ADJECTIVES:
        pool = [{FORMS[i]: form for i, form in enumerate(entry)}
                for entry in entries]
        # 명사 곳간과 겹치는 낱말은 여기서 다루지 않는다.
        pool = [c for c in pool if not any(v in _vocab.WHERE for v in c.values())]
        if len(pool) > 1:
            pools.append(pool)
    return pools


POOLS = build()
WHERE, ALL_FORMS = {}, {}
for _index, _pool in enumerate(POOLS):
    for _at, _concept in enumerate(_pool):
        for _word in _concept.values():
            WHERE[_word] = (_index, _at)
            ALL_FORMS[_word] = tuple(_concept.values())


def _eng(words):
    body = "|".join(re.escape(w) for w in sorted(words, key=len, reverse=True))
    return r"(?<![A-Za-z'])(%s)(?![A-Za-z'])" % body


WORD_RE = re.compile(_eng(WHERE))
HANGUL = re.compile(r"[가-힣]")


def usable(sentences):
    """본문·보기에 한글이 없어야 쓴다. 해석문이 있으면 어긋나기 때문이다."""
    return not HANGUL.search(" ".join(sentences))


def plan(texts, locked, rng, limit=2, visible=None):
    blob = re.sub(r"\[\[.*?\]\]", " ", " ".join(texts))
    seen = re.sub(r"\[\[.*?\]\]", " ",
                  " ".join(visible if visible is not None else texts))
    allowed = {WHERE[w] for w in WORD_RE.findall(seen)}
    found = []
    for word in WORD_RE.findall(blob):
        # 이 낱말의 어느 모습 하나라도 해설에 묶여 있으면 통째로 건너뛴다.
        if any(form.lower() in locked for form in ALL_FORMS[word]):
            continue
        spot = WHERE[word]
        if spot not in allowed:
            continue                     # 본문·보기에 없으면 정답만 어긋난다
        if spot not in [WHERE[w] for w in found]:
            found.append(word)
    if not found:
        return None, None

    rng.shuffle(found)
    table, moved = {}, {}
    taken = {WHERE[w] for w in WORD_RE.findall(blob)}
    for word in found[:limit]:
        index, at = WHERE[word]
        pool = POOLS[index]
        source = pool[at]
        pick = [c for other, c in enumerate(pool)
                if (index, other) not in taken
                and not any(v.lower() in locked for v in c.values())]
        if not pick:
            continue
        target = pick[rng.randrange(len(pick))]
        taken.add((index, pool.index(target)))
        for key, value in source.items():
            table[value] = target[key]
        moved[source["원급"]] = target["원급"]
    if not table:
        return None, None
    return table, moved


def pattern_for(table):
    return re.compile(_eng(table))

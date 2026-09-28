# -*- coding: utf-8 -*-
"""우리말 낱말 경계.

한글은 띄어쓰기 없이 붙는 일이 많아서, 그냥 바꾸면 낱말 속이 바뀐다.
"문"을 바꾸면 "문장"이 "창문장"이 되고, "개"를 바꾸면 "3개"가 "3고양이"가 된다.
그래서 앞뒤가 한글이 아니거나, 뒤에 조사가 붙은 경우에만 바꾼다.
"""
import re

PARTICLES = ("으로서", "으로써", "에서는", "에게서", "이랑", "으로", "에서", "에게",
             "부터", "까지", "보다", "처럼", "마다", "조차", "라도", "이나",
             "은", "는", "이", "가", "을", "를", "의", "에", "와", "과",
             "도", "만", "로", "랑", "야", "아", "여")
_PARTICLE_RE = "|".join(sorted(PARTICLES, key=len, reverse=True))


def boundary(word):
    """이 우리말 낱말을 안전하게 집어내는 무늬."""
    body = re.escape(word)
    return (r"(?<![가-힣])%s(?![가-힣])"
            r"|(?<![가-힣])%s(?=(?:%s)(?![가-힣]))" % (body, body, _PARTICLE_RE))


def pattern(words):
    return "|".join(boundary(w) for w in sorted(words, key=len, reverse=True))

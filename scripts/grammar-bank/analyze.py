# -*- coding: utf-8 -*-
"""문항 하나하나를 뜯어보고, 무엇을 바꿔도 되는지 가려낸다.

같은 규칙을 모든 문항에 그냥 들이대면 "Mr. Kim … She"처럼 앞뒤가 어긋난다.
그래서 문항마다 따로 본다.

이 문항에서 손대면 안 되는 것:
 1. 밑줄 친 부분 — 어법 문항은 거기가 곧 문제다.
 2. 정답에 들어 있는 말 — 바꾸면 정답이 틀린다.
 3. 해설이 집어 말한 말 — 해설이 "주어가 we로 복수이고"라고 하면 we를 못 바꾼다.
 4. 선택지가 답의 자리인 낱말 — 선택지가 he/she라면 he를 바꾸는 순간 답이 옮겨간다.
 5. 빈칸 바로 옆에서 답을 결정하는 말.
"""
import re

MARKERS = "①②③④⑤"
WORD = re.compile(r"[A-Za-z]+(?:'[A-Za-z]+)*")   # Mina' 처럼 따옴표가 붙어도 낱말만 집는다
PROTECTED = re.compile(r"\[\[(.*?)\]\]")
BLANK = re.compile(r"_{3,}")


def words(text):
    """낱말을 뽑는다. Jane's는 Jane's와 Jane 둘 다로 센다."""
    out = []
    for token in WORD.findall(text or ""):
        out.append(token)
        if "'" in token:
            out.append(token.split("'")[0])
    return out


def question_texts(question):
    return ([question["prompt"]] + list(question["body"])
            + [c["text"] for c in question["choices"]]
            + [question.get("answer") or "", question.get("explanation") or ""])


def locked_words(question):
    """이 문항에서 바꾸면 안 되는 영어 낱말을 모은다."""
    locked = set()

    # 1. 밑줄 친 부분
    for text in question_texts(question):
        for span in PROTECTED.findall(text):
            locked.update(w.lower() for w in words(span))

    # 2. 정답에 들어 있는 말 — 선택지가 있을 때만 잠근다.
    #    서술형은 본문과 정답을 함께 바꾸면 앞뒤가 맞으므로 잠글 이유가 없다.
    if question["choices"]:
        locked.update(w.lower() for w in words(question.get("answer") or ""))

    # 3. 해설이 집어 말한 말 — 우리말 해설 속의 영어는 모두 문법의 근거다.
    locked.update(w.lower() for w in words(question.get("explanation") or ""))

    # 4. 한 낱말짜리 선택지 — 그 낱말 자체가 답이라 바꾸면 답이 옮겨간다.
    #    긴 선택지는 바꿔도 되지만, 바꾼 뒤 다른 선택지와 겹치지 않는지 따로 살핀다.
    for choice in question["choices"]:
        if len(words(choice["text"])) <= 1:
            locked.update(w.lower() for w in words(choice["text"]))

    return locked


def blank_neighbours(question):
    """빈칸 양옆의 말 — 답을 고르는 근거라 건드리지 않는다."""
    near = set()
    for text in question["body"]:
        for found in BLANK.finditer(text):
            before = words(text[max(0, found.start() - 40):found.start()])
            after = words(text[found.end():found.end() + 40])
            near.update(w.lower() for w in before[-3:] + after[:3])
    return near


CHAPTER_HINTS = {
    "대명사": "대명사 자체가 문제라 사람말을 바꾸면 답이 흔들린다",
    "인칭": "인칭이 문제라 사람말을 바꾸면 답이 흔들린다",
    "수일치": "수 일치가 문제라 주어를 바꾸면 답이 흔들린다",
    "비교": "비교 대상이 바뀌면 뜻이 달라진다",
}


def chapter_caution(question):
    for key, reason in CHAPTER_HINTS.items():
        if key in question["chapter"]:
            return reason
    return None


def analyze(question):
    """이 문항에서 무엇을 바꿔도 되는지 정리해 돌려준다."""
    locked = locked_words(question) | blank_neighbours(question)
    caution = chapter_caution(question)
    return {
        "locked": locked,
        "caution": caution,
        # 대명사·수일치 단원에서는 사람말을 아예 건드리지 않는다.
        "allow_gender": caution is None,
        "has_choices": bool(question["choices"]),
    }


def free_to_change(word, report):
    """이 낱말을 바꿔도 되는지."""
    return word.lower() not in report["locked"]

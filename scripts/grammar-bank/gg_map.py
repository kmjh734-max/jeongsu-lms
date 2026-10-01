# -*- coding: utf-8 -*-
"""Good Grammar 2nd Edition(YBM) 단원을 문법 은행 목차로 보낸다.

L1 은 중1 과정이다. 꼬리말에 적힌 단원 이름으로 찾는다 — 번호는 권마다 비어
있는 데가 있어 믿을 수 없다.
"""
LEVEL = {"L1": 1, "L2": 2, "L3": 3}

MAP = {
    (1, "인칭대명사와 be동사"): (1, 1, "be동사"),
    (1, "일반동사"): (1, 2, "일반동사"),
    (1, "동사의 시제"): (1, 3, "동사의 시제"),
    (1, "조동사"): (1, 4, "조동사"),
    (1, "명사와 관사"): (1, 5, "명사와 관사"),
    (1, "대명사"): (1, 6, "대명사"),
    (1, "동사와 문장의 형태"): (1, 7, "문장의 형식"),
    (1, "의문문, 감탄문, 명령문"): (1, 8, "다양한 문장의 형태"),
    (1, "의문사"): (1, 8, "다양한 문장의 형태"),
    (1, "형용사와 부사"): (1, 9, "형용사와 부사"),
    (1, "to부정사와 동명사"): (1, 10, "to부정사"),
    (1, "전치사"): (1, 14, "전치사"),
    (1, "접속사"): (1, 13, "접속사"),
}

# 묶음 단원을 강 이름으로 가른다
SPLIT = {
    (1, "to부정사와 동명사"): [("동명사", (1, 11, "동명사"))],
    (1, "형용사와 부사"): [("비교", (1, 12, "비교구문"))],
}


def level_of(book):
    for key, lv in LEVEL.items():
        if key in str(book):
            return lv
    return None


def place(book, chapter, unit=None):
    lv = level_of(book)
    if lv is None or not chapter:
        return None
    name = str(chapter).strip()
    for word, spot in SPLIT.get((lv, name), []):
        if word in str(unit or ""):
            return spot
    return MAP.get((lv, name))

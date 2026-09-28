# -*- coding: utf-8 -*-
"""뽑아낸 문항을 쓸 수 있게 다듬는다.

족보닷컴은 체크체크와 종합문제에 같은 문항을 재사용한다. 시험지를 짤 때
같은 문제가 두 번 나오면 안 되므로, 내용이 같은 것끼리 묶어 표시해 둔다.
"""
import collections, json, re, sys
from pathlib import Path

KIND_RANK = {"체크체크": 0, "확인문제": 1, "종합문제": 2}


def fingerprint(question):
    """문항을 알아보는 지문 — 발문·본문·선택지를 공백 없이 이어 붙인다."""
    blob = (question["prompt"] + " ".join(question["body"])
            + " ".join(c["text"] for c in question["choices"]))
    return re.sub(r"\s+", "", blob)


def richness(question):
    """메타 정보가 많은 쪽을 대표로 삼는다."""
    return (len(question.get("badges") or []),
            1 if question.get("difficulty") else 0,
            -KIND_RANK.get(question["kind"], 9))


def tidy_answer(question):
    for key in ("answer", "explanation"):
        if question.get(key):
            text = re.sub(r"\[정답\]\s*", " ", question[key])
            question[key] = re.sub(r"\s+", " ", text).strip()


def main(path):
    bank = json.loads(Path(path).read_text(encoding="utf-8"))
    groups = collections.defaultdict(list)
    for question in bank:
        tidy_answer(question)
        mark = fingerprint(question)
        if len(mark) < 30:
            continue                      # 너무 짧으면 같은지 가릴 수 없다
        groups[(question["level"], question["chapter_no"], mark)].append(question)

    families = 0
    for members in groups.values():
        if len(members) < 2:
            continue
        families += 1
        group_id = "dup-%04d" % families
        best = max(members, key=richness)
        for question in members:
            question["dup_group"] = group_id
            question["is_primary"] = question is best

    for question in bank:
        question.setdefault("dup_group", None)
        question.setdefault("is_primary", True)

    Path(path).write_text(json.dumps(bank, ensure_ascii=False), encoding="utf-8")
    primary = sum(1 for q in bank if q["is_primary"])
    print("문항 %d개 / 중복 묶음 %d개 / 겹치지 않는 문항 %d개"
          % (len(bank), families, primary))


if __name__ == "__main__":
    main(sys.argv[1])

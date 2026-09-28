# -*- coding: utf-8 -*-
"""뽑아낸 문항의 갈래·난이도 분포를 센다."""
import collections, json, re, sys
from pathlib import Path

MARKERS = "①②③④⑤"


def kind(question):
    """발문과 생김새로 문항 갈래를 나눈다."""
    prompt = question["prompt"]
    answer = question["answer"] or ""
    if question["choices"]:
        if "어색한" in prompt or "어법상" in prompt or "틀린" in prompt:
            return "어법 고르기"
        if "짝지어진" in prompt or "공통으로" in prompt:
            return "짝짓기"
        return "객관식"
    if "배열" in prompt:
        return "배열 영작"
    if "바꿔" in prompt or "고쳐" in prompt or "바꾸" in prompt:
        return "문장 전환"
    if "완성" in prompt or "채우" in prompt or "쓰시오" in prompt or "쓰세요" in prompt:
        return "단답·서술"
    return "기타"


def main(folder):
    folder = Path(folder)
    kinds, levels, sources, answers = (collections.Counter() for _ in range(4))
    total = 0
    for path in sorted(folder.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        source = re.sub(r"^\[.*?\]\s*", "", path.stem)
        for question in data["questions"]:
            total += 1
            kinds[kind(question)] += 1
            levels[question.get("difficulty") or "표시 없음"] += 1
            sources[source] += 1
            picked = [c for c in (question["answer"] or "") if c in MARKERS]
            if len(picked) == 1:
                answers[picked[0]] += 1
    print("전체 %d문항\n" % total)
    for title, counter in (("갈래", kinds), ("난이도", levels),
                           ("출처", sources), ("객관식 정답 분포", answers)):
        print("[%s]" % title)
        for key, count in counter.most_common():
            print("  %-22s %4d  (%4.1f%%)" % (key, count, count * 100 / max(total, 1)))
        print()


if __name__ == "__main__":
    main(sys.argv[1])

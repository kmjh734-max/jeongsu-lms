# -*- coding: utf-8 -*-
"""문제 은행 전체를 레벨·챕터별로 세어 본다."""
import collections, json, sys
from pathlib import Path

MARKERS = "①②③④⑤"


def main(path):
    bank = json.loads(Path(path).read_text(encoding="utf-8"))
    print("전체 %d문항\n" % len(bank))

    by_level = collections.Counter()
    chapters = collections.OrderedDict()
    for question in bank:
        by_level[question["level_name"]] += 1
        key = (question["level"], question["level_name"],
               question["chapter_no"], question["chapter"])
        chapters[key] = chapters.get(key, 0) + 1

    print("[레벨]")
    for level in ("기초", "기본", "심화", "완성"):
        count = by_level.get(level, 0)
        pages = sum(1 for k in chapters if k[1] == level)
        print("  %-4s Level %d   %2d챕터  %5d문항" % (level, {"기초":1,"기본":2,"심화":3,"완성":4}[level], pages, count))

    print("\n[갈래]")
    for name, count in collections.Counter(q["question_kind"] for q in bank).most_common():
        print("  %-12s %5d  (%4.1f%%)" % (name, count, count * 100 / len(bank)))

    print("\n[표시]")
    badges = collections.Counter()
    for question in bank:
        for badge in question.get("badges", []):
            badges[badge] += 1
    levels = collections.Counter(q.get("difficulty") for q in bank if q.get("difficulty"))
    for name, count in badges.most_common():
        print("  %-14s %5d" % (name, count))
    for name in ("하", "중", "상"):
        print("  난이도 %-9s %5d" % (name, levels.get(name, 0)))

    print("\n[객관식 정답 분포]")
    picks = collections.Counter()
    for question in bank:
        found = [c for c in (question["answer"] or "") if c in MARKERS]
        if len(found) == 1:
            picks[found[0]] += 1
    total = sum(picks.values())
    for mark in MARKERS:
        count = picks.get(mark, 0)
        print("  %s  %5d  (%4.1f%%)" % (mark, count, count * 100 / max(total, 1)))

    print("\n[챕터]")
    for (level, level_name, no, title), count in sorted(chapters.items()):
        print("  L%d %-4s %2d. %-22s %4d문항" % (level, level_name, no, title, count))


if __name__ == "__main__":
    main(sys.argv[1])

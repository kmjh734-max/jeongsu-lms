# -*- coding: utf-8 -*-
"""문제 은행을 전수 점검한다.

문항 하나하나를 보는 check.py와 달리, 여기서는 묶음으로 봐야 보이는 것을 찾는다.
번호가 중간에 빠졌다거나, 같은 문항이 두 번 들어갔다거나 하는 것들이다.
"""
import collections, json, re, sys
from pathlib import Path

MARKERS = "①②③④⑤"


def by_file(bank):
    groups = collections.OrderedDict()
    for question in bank:
        groups.setdefault(question["file"], []).append(question)
    return groups


def check_numbering(groups):
    """문항 번호가 1부터 끊김 없이 이어지는지."""
    out = []
    for name, rows in groups.items():
        numbers = sorted(q["number"] for q in rows)
        if numbers != list(range(1, len(numbers) + 1)):
            missing = sorted(set(range(1, max(numbers) + 1)) - set(numbers))
            repeated = [n for n, c in collections.Counter(numbers).items() if c > 1]
            out.append("%s — 번호 %d~%d, 빠짐 %s, 겹침 %s"
                       % (name, min(numbers), max(numbers), missing or "없음",
                          repeated or "없음"))
    return out


def check_refs(groups):
    """한 PDF 안에서 zb 고유번호가 겹치지 않는지."""
    out = []
    for name, rows in groups.items():
        refs = [q["source_ref"] for q in rows if q["source_ref"]]
        repeated = [r for r, c in collections.Counter(refs).items() if c > 1]
        if repeated:
            out.append("%s — 고유번호 겹침 %s" % (name, repeated[:6]))
    return out


def check_answers(bank):
    """정답 번호가 선택지 범위 안에 있는지."""
    out = []
    for question in bank:
        answer = question["answer"] or ""
        picked = [MARKERS.index(c) + 1 for c in answer if c in MARKERS]
        count = len(question["choices"])
        if picked and count and max(picked) > count:
            out.append("%s %d번 — 정답 %s인데 선택지 %d개"
                       % (question["file"], question["number"], answer, count))
        if count and not picked and len(answer) < 3 and answer:
            out.append("%s %d번 — 선택지가 있는데 정답이 '%s'"
                       % (question["file"], question["number"], answer))
    return out


def check_duplicates(bank):
    """같은 문항이 두 번 들어갔는지. 같은 챕터 안에서만 따진다."""
    seen, out = {}, []
    for question in bank:
        key = (question["level"], question["chapter_no"],
               re.sub(r"\s+", "", question["prompt"] + " ".join(question["body"])))
        if len(key[2]) < 30:
            continue
        if key in seen:
            first = seen[key]
            out.append("%s %d번 = %s %d번"
                       % (question["file"], question["number"],
                          first["file"], first["number"]))
        else:
            seen[key] = question
    return out


def check_text_health(bank):
    """글이 깨졌거나 남으면 안 될 것이 남았는지."""
    patterns = {
        "납본번호": re.compile(r"I\d{3}-[A-Z]"),
        "정답 표시 잔재": re.compile(r"\[정답\]"),
        "해설 표시 잔재": re.compile(r"\[해설\]"),
        "별표": re.compile(r"[★☆]{2,}"),
        "그림 자리표시": re.compile(r"\[\[그림"),
        "표딱지 자리표시": re.compile(r"\[\[표딱지"),
        "짝 안 맞는 밑줄": re.compile(r"\[\[(?![^\[]*\]\])"),
    }
    out = collections.Counter()
    for question in bank:
        blob = " ".join([question["prompt"], " ".join(question["body"]),
                         " ".join(c["text"] for c in question["choices"]),
                         question["answer"] or "", question["explanation"] or ""])
        for name, pattern in patterns.items():
            if pattern.search(blob):
                out[name] += 1
    return out


def check_coverage(bank):
    """챕터마다 다섯 종류가 다 들어왔는지."""
    want = {"체크체크", "확인문제1", "확인문제2", "종합문제1", "종합문제2"}
    have = collections.defaultdict(set)
    for question in bank:
        tag = question["kind"] + (str(question["round"]) if question["round"] else "")
        have[(question["level"], question["chapter_no"], question["chapter"])].add(tag)
    out = []
    for key, kinds in sorted(have.items()):
        missing = want - kinds
        if missing:
            out.append("L%d %d.%s — 빠진 묶음 %s" % (key[0], key[1], key[2], sorted(missing)))
    return out


def main(path):
    bank = json.loads(Path(path).read_text(encoding="utf-8"))
    groups = by_file(bank)
    print("문항 %d개 / PDF %d개 / 챕터 %d개\n"
          % (len(bank), len(groups),
             len({(q["level"], q["chapter_no"]) for q in bank})))

    sections = [
        ("문항 번호가 끊긴 곳", check_numbering(groups)),
        ("고유번호가 겹친 곳", check_refs(groups)),
        ("정답이 선택지를 벗어난 곳", check_answers(bank)),
        ("같은 문항이 겹친 곳", check_duplicates(bank)),
        ("빠진 문제 묶음", check_coverage(bank)),
    ]
    for title, rows in sections:
        print("[%s] %d건" % (title, len(rows)))
        for row in rows[:8]:
            print("   ", row)
        if len(rows) > 8:
            print("    … 그 밖 %d건" % (len(rows) - 8))
        print()

    print("[글 상태]")
    health = check_text_health(bank)
    if not health:
        print("    남은 군더더기 없음")
    for name, count in health.most_common():
        print("    %-14s %d문항" % (name, count))


if __name__ == "__main__":
    main(sys.argv[1])

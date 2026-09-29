# -*- coding: utf-8 -*-
"""잘 풀리는 영문법 — 본책 문항과 정답지에서 읽은 답을 맞댄다.

맞대는 열쇠
  · RULE·실전문제 상자 → (본책에 인쇄된 쪽, 문항 번호)
  · 통합 문제 상자     → (단원 번호, 문항 번호)  ─ 통합 문제는 두 쪽에 걸쳐 이어진다

검산 — 하나라도 어긋나면 그 묶음은 넣지 않는다.
  · 문항 수와 답 개수가 같아야 한다
  · 보기 ①~⑤ 가 있는 문항은 답이 그 안의 번호여야 한다

  python scripts/grammar-bank/jp_match.py 문항.json 답.json 결과.json [어긋난것.json]
"""
import collections, io, json, re, sys
from pathlib import Path

CIRCLED = "①②③④⑤⑥⑦⑧⑨⑩"


def answer_nos(answer):
    """'④' 또는 '4' 또는 '②, ⑤' 에서 보기 번호를 읽는다"""
    text = str(answer or "")
    got = [CIRCLED.index(c) + 1 for c in text if c in CIRCLED]
    if got:
        return got
    return [int(n) for n in re.findall(r"\b([1-9])\b", text)]


def ok_choice(answer, choices):
    if not choices:
        return True
    nos = answer_nos(answer)
    if not nos:
        return False
    have = {c["no"] for c in choices}
    return all(n in have for n in nos)


def main(q_path, a_path, out_path, bad_path=None):
    questions = json.load(open(q_path, encoding="utf-8"))
    blocks = json.load(open(a_path, encoding="utf-8"))

    by_page = collections.defaultdict(list)
    by_chapter = collections.defaultdict(list)
    for q in questions:
        by_page[q.get("printed_page")].append(q)
        if "통합" in str(q.get("section") or ""):
            by_chapter[q.get("chapter_no")].append(q)
    for v in by_page.values():
        v.sort(key=lambda q: q["no"])
    for v in by_chapter.values():
        v.sort(key=lambda q: (q.get("printed_page") or 0, q["no"]))

    matched, failed = [], []
    for b in blocks:
        answers = b["answers"]
        got = [answers[k] for k in sorted(answers, key=int)]
        if b["kind"] == "통합":
            items = by_chapter.get(b.get("chapter_no"), [])
            where = "CH%s 통합" % b.get("chapter_no")
        else:
            items = by_page.get(b.get("book_page"), [])
            where = "p.%s" % b.get("book_page")
        if not items:
            failed.append({"where": where, "문항": 0, "답": len(got), "까닭": "본책에서 찾지 못함"})
            continue
        if len(items) != len(got):
            failed.append({"where": where, "문항": len(items), "답": len(got), "까닭": "개수가 맞지 않음"})
            continue
        bad = [i for i, (q, a) in enumerate(zip(items, got)) if not ok_choice(a, q.get("choices"))]
        if bad:
            failed.append({"where": where, "문항": len(items), "답": len(got),
                           "까닭": "보기에 없는 답 %d개" % len(bad)})
            continue
        for q, a in zip(items, got):
            row = dict(q)
            row["answer"] = a
            matched.append(row)

    Path(out_path).write_text(json.dumps(matched, ensure_ascii=False, indent=1), encoding="utf-8")
    if bad_path:
        Path(bad_path).write_text(json.dumps(failed, ensure_ascii=False, indent=1), encoding="utf-8")
    log = io.open(1, "w", encoding="utf-8", closefd=False)
    total = max(len(questions), 1)
    print("본책 문항 %d개 중 답을 붙인 것 %d개 (%d%%)"
          % (len(questions), len(matched), round(len(matched) / total * 100)), file=log)
    why = collections.Counter(f["까닭"] for f in failed)
    for k, n in why.most_common():
        print("   %s: %d묶음" % (k, n), file=log)
    log.flush()


if __name__ == "__main__":
    main(*sys.argv[1:5])

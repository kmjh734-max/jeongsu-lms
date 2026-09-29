# -*- coding: utf-8 -*-
"""본책에서 뽑은 문항과 정답지에서 읽은 답을 맞댄다.

맞대는 열쇠는 (본책에 인쇄된 쪽, STEP, 문항 번호)다. 상자가 두세 쪽에 걸쳐 있을 때는
그 쪽들의 문항을 STEP·번호 차례로 이어 붙여 맞댄다.

검산 — 하나라도 어긋나면 그 묶음은 넣지 않고 따로 남긴다.
  · 문항 수와 답 개수가 같아야 한다
  · [a / an / ×] 처럼 고를 것이 정해진 문항은 답이 그 안에 있어야 한다

  python scripts/grammar-bank/gq_match.py 문항.json 답.json 결과.json [어긋난것.json]
"""
import collections, io, json, re, sys
from pathlib import Path


def norm(s):
    return re.sub(r"[^a-z0-9가-힣○×]", "", str(s).lower())


def in_choices(answer, picks):
    if not picks:
        return True
    opts = []
    for p in picks:
        opts += [o.strip() for o in p.split("/")]
    # 빈칸이 둘인 문항은 답도 둘이다 ("She, Her") — 조각마다 견준다
    parts = [p for p in re.split(r"[,/]| {2,}", str(answer)) if norm(p)]
    if not parts:
        return False
    return all(any(norm(p) == norm(o) for o in opts) for p in parts)


def main(q_path, a_path, out_path, bad_path=None):
    questions = json.load(open(q_path, encoding="utf-8"))
    blocks = json.load(open(a_path, encoding="utf-8"))

    by_page = collections.defaultdict(list)
    for q in questions:
        by_page[q["printed_page"]].append(q)

    matched, failed = [], []
    for b in blocks:
        pages = b["book_pages"]
        for step_key, answers in b["steps"].items():
            step = int(step_key)
            items = [q for p in pages for q in by_page.get(p, []) if q["step"] == step]
            items.sort(key=lambda q: (q["printed_page"], q["no"]))
            got = [answers[k] for k in sorted(answers, key=int)]
            if not items:
                failed.append({"pages": pages, "step": step, "문항": 0, "답": len(got),
                               "까닭": "본책에서 그 STEP을 찾지 못함"})
                continue
            if len(items) != len(got):
                failed.append({"pages": pages, "step": step, "문항": len(items), "답": len(got),
                               "까닭": "개수가 맞지 않음"})
                continue
            bad = [i for i, (q, a) in enumerate(zip(items, got)) if not in_choices(a, q["picks"])]
            if bad:
                failed.append({"pages": pages, "step": step, "문항": len(items), "답": len(got),
                               "까닭": "고를 것 안에 없는 답 %d개" % len(bad)})
                continue
            for q, a in zip(items, got):
                row = dict(q)
                row["answer"] = a
                matched.append(row)

    Path(out_path).write_text(json.dumps(matched, ensure_ascii=False, indent=1), encoding="utf-8")
    if bad_path:
        Path(bad_path).write_text(json.dumps(failed, ensure_ascii=False, indent=1), encoding="utf-8")

    log = io.open(1, "w", encoding="utf-8", closefd=False)
    total = len(questions)
    print("본책 문항 %d개 중 답을 붙인 것 %d개 (%d%%)"
          % (total, len(matched), round(len(matched) / total * 100)), file=log)
    print("어긋나 넣지 않은 묶음 %d개" % len(failed), file=log)
    why = collections.Counter(f["까닭"] for f in failed)
    for k, n in why.most_common():
        print("   %s: %d묶음" % (k, n), file=log)
    for f in failed[:8]:
        print("   p.%s STEP %s · 문항 %d / 답 %d · %s"
              % (f["pages"], f["step"], f["문항"], f["답"], f["까닭"]), file=log)
    log.flush()


if __name__ == "__main__":
    main(*sys.argv[1:5])

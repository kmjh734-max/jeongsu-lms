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


# 답 앞에 문항 번호가 딸려 들어온 꼴 ("2 she", "8 we") — 떼어 낸다
LEAD_NO = re.compile(r"^\s*\d{1,2}\s+(?=[A-Za-z가-힣○×(])")


# 읽다가 어긋난 답 — 글자가 뭉개졌거나 엉뚱한 기호가 섞였다
GARBLED = re.compile(r"[@|~^\<>]|[A-Za-z]{2,}[0-9]{2,}|[)(\]\[]{2,}")


def clean_answer(text, no):
    """답 앞에 딸려 온 문항 번호를 뗀다.

    잘라 읽는 자리가 조금 넓어 왼쪽 번호가 섞여 들어오면 "2 she" 처럼 나온다.
    뒤에 글자가 남는다면 번호는 답이 아니므로 뗀다.
    """
    t = str(text or "").strip()
    hit = LEAD_NO.match(t)
    if hit and re.search(r"[A-Za-z가-힣○×]", t[hit.end():]):
        t = t[hit.end():].strip()
    return t


def usable(answer):
    """넣어도 되는 답인가 — 읽다가 어긋난 것은 넣지 않는다.

    옆 줄이 딸려 들어오면 "5 7 Tom's 2 stu 5 children's" 처럼 번호와 낱말이
    번갈아 나온다. 그런 꼴은 답이 아니다.
    """
    t = str(answer or "").strip()
    if not t or len(t) > 70:
        return False
    if GARBLED.search(t):
        return False
    # 홑 번호 답(③, 5, "2, 5")은 그대로 둔다
    if re.fullmatch(r"[1-9①-⑩][,\s]*[1-9①-⑩]?", t):
        return True
    # 번호가 두 번 이상 끼어 있으면 옆 답이 섞인 것이다
    if len(re.findall(r"(?<![A-Za-z0-9])\d{1,2}(?![A-Za-z0-9])", t)) >= 2:
        return False
    return True


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


def fill_blocks(blocks, questions):
    """본책 쪽을 못 읽은 상자에 쪽을 물려 준다.

    본책 쪽마다 "정답 및 해설 p.N" 이 적혀 있다. 그러니 정답지 N쪽에 실린 상자들은
    그 N을 가리키는 본책 쪽들에 차례대로 대응한다. 이미 읽은 쪽은 그대로 두고,
    남은 자리에만 남은 쪽을 차례로 넣는다.
    """
    want = collections.defaultdict(list)   # 정답지 쪽 → 본책 쪽들 (차례대로)
    for q in questions:
        ap, bp = q.get("answer_page"), q.get("printed_page")
        if ap and bp and bp not in want[ap]:
            want[ap].append(bp)
    for v in want.values():
        v.sort()

    by_answer_page = collections.defaultdict(list)
    for b in blocks:
        by_answer_page[b["answer_page"]].append(b)
    for ap, group in by_answer_page.items():
        group.sort(key=lambda b: b.get("order", 0))
        taken = {p for b in group for p in b["book_pages"]}
        left = [p for p in want.get(ap, []) if p not in taken]
        for b in group:
            if b["book_pages"] or not left:
                continue
            b["book_pages"] = [left.pop(0)]
            b["guessed"] = True


def main(q_path, a_path, out_path, bad_path=None):
    questions = json.load(open(q_path, encoding="utf-8"))
    blocks = json.load(open(a_path, encoding="utf-8"))

    by_page = collections.defaultdict(list)
    for q in questions:
        by_page[q["printed_page"]].append(q)

    # 머리말에서 잘못 읽은 쪽을 버린다. 본책에 문항이 있는 쪽만 쓸 수 있다
    # (작은 글씨를 잘못 읽어 p.1·2·3 처럼 엉뚱한 쪽이 나오기도 한다).
    real = {q["printed_page"] for q in questions if q.get("printed_page")}
    for b in blocks:
        if b["book_pages"] and not any(p in real for p in b["book_pages"]):
            b["book_pages"] = []

    # 머리말에서 본책 쪽을 못 읽은 상자를 채운다.
    # 본책 쪽마다 "정답 및 해설 p.N" 이 적혀 있으므로, 같은 정답지 쪽에 딸린
    # 본책 쪽들을 차례대로 늘어놓고 쪽을 모르는 상자에 차례로 물려 준다.
    fill_blocks(blocks, questions)

    matched, failed = [], []
    for b in blocks:
        pages = b["book_pages"]
        for step_key, raw in b["steps"].items():
            step = int(step_key)
            answers = {str(k): v for k, v in raw.items()}
            items = [q for p in pages for q in by_page.get(p, []) if q["step"] == step]
            items.sort(key=lambda q: (q["printed_page"], q["no"]))
            got = [clean_answer(answers[k], k) for k in sorted(answers, key=int)]
            if not items:
                failed.append({"pages": pages, "step": step, "문항": 0, "답": len(got),
                               "까닭": "본책에서 그 STEP을 찾지 못함"})
                continue
            # 개수가 딱 맞으면 차례대로, 아니면 문항 번호로 하나씩 맞댄다.
            # 번호로 맞대면 몇 개가 빠져도 나머지는 살릴 수 있다.
            if len(items) == len(got):
                pairs = list(zip(items, got))
            else:
                pairs = [(q, clean_answer(answers[str(q["no"])], q["no"]))
                         for q in items if str(q["no"]) in answers]
                if len(pairs) < len(items) * 0.6:
                    failed.append({"pages": pages, "step": step, "문항": len(items), "답": len(got),
                                   "까닭": "개수가 맞지 않음"})
                    continue
            pairs = [(q, a) for q, a in pairs if usable(a)]
            if not pairs:
                failed.append({"pages": pages, "step": step, "문항": len(items), "답": len(got),
                               "까닭": "읽은 답이 뭉개짐"})
                continue
            bad = [1 for q, a in pairs if not in_choices(a, q["picks"])]
            if bad:
                failed.append({"pages": pages, "step": step, "문항": len(items), "답": len(got),
                               "까닭": "고를 것 안에 없는 답 %d개" % len(bad)})
                continue
            for q, a in pairs:
                if not str(a or "").strip():
                    continue
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

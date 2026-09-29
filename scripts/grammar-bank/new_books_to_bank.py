# -*- coding: utf-8 -*-
"""새 교재에서 뽑은 문항을 문제 은행 형식으로 맞춘다.

은행 한 줄의 모양
    source_file · number · level · level_name · chapter_no · chapter
    kind · question_kind · badges · prompt · body · choices · answer · explanation

단원은 chapter_map.py 가 지금 은행의 54단원 가운데 하나로 보낸다.
난이도(tier)는 여기서 정하지 않는다 — 적재 뒤 grade-tiers.mjs 가 다시 매긴다.
정답이 없는 문항은 넣지 않는다(은행은 정답지를 함께 뽑아야 하므로).

  python scripts/grammar-bank/new_books_to_bank.py out.json
"""
import io, json, re, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from chapter_map import place, LEVEL_NAME

OUT = Path("tmp-grammar-bank")

# (모아 둔 파일, 교재 이름, 갈래)
SOURCES = [
    ("gq-starter1-matched.json", "그래머큐 Starter 1", "gq"),
    ("gq-starter2-matched.json", "그래머큐 Starter 2", "gq"),
    ("gq-inter1-matched.json", "그래머큐 Intermediate 1", "gq"),
    ("gq-inter2-matched.json", "그래머큐 Intermediate 2", "gq"),
    ("gq-adv1-matched.json", "그래머큐 Advanced 1", "gq"),
    ("gq-adv2-matched.json", "그래머큐 Advanced 2", "gq"),
    ("jp-1-matched.json", "잘풀리는영문법_1권", "jp"),
    ("jp-2-matched.json", "잘풀리는영문법_2권", "jp"),
    ("jp-3-matched.json", "잘풀리는영문법_3권", "jp"),
]

PICK = re.compile(r"\[([^\[\]]+?)\]")


CIRCLED = re.compile(r"[①-⑩]")


def split_choices(text):
    """①~⑤ 로 갈린 문항을 본문과 보기로 가른다.

    「다음 중 어법상 틀린 문장은?」처럼 고르는 문항은 보기를 따로 두어야
    화면에 한 줄씩 나온다.
    """
    marks = list(CIRCLED.finditer(text))
    if len(marks) < 2:
        return [text], []
    stem = text[:marks[0].start()].strip()
    picks = []
    for n, m in enumerate(marks):
        end = marks[n + 1].start() if n + 1 < len(marks) else len(text)
        picks.append(text[m.end():end].strip())
    picks = [p for p in picks if p]
    # 은행에 담긴 보기 꼴에 맞춘다 — {no, text}
    return ([stem] if stem else []), [{"no": n, "text": t} for n, t in enumerate(picks, 1)]


MARKERS = "①②③④⑤"


def mark_answer(answer, choices):
    """고르는 문항의 답을 동그라미 번호로 맞춘다 (3 → ③).

    변형을 만드는 쪽이 동그라미 번호로 답의 자리를 읽으므로 꼴을 맞춰 둔다.
    """
    t = str(answer or "").strip()
    if not choices or t in MARKERS:
        return t
    if t.isdigit() and 1 <= int(t) <= len(choices) and int(t) <= 5:
        return MARKERS[int(t) - 1]
    return t


def from_gq(q, book):
    """그래머큐 — 지시문 하나에 문장 하나. 고를 것은 문장 안 [A / B] 에 있다."""
    body, choices = split_choices(q["text"])
    return {
        "kind": "PRACTICE",
        "question_kind": ("객관식" if choices else (q.get("question_kind") or "단답·서술")),
        "badges": [],
        "prompt": q.get("instruction") or "",
        "body": body,
        "choices": choices,
        "answer": mark_answer(q.get("answer"), choices),
        "explanation": None,
        "chapter_title": q.get("chapter"),
    }


def from_jp(q, book):
    """잘 풀리는 영문법 — 발문·본문·①~⑤ 보기"""
    return {
        "kind": q.get("section") or "통합 문제",
        "question_kind": q.get("question_kind") or ("객관식" if q.get("choices") else "단답·서술"),
        "badges": q.get("badges") or [],
        "prompt": q.get("prompt") or "",
        "body": q.get("body") or [],
        "choices": q.get("choices") or [],
        "answer": q.get("answer"),
        "explanation": None,
        "chapter_title": q.get("chapter"),
    }


def main(dst):
    rows = []
    log = io.open(1, "w", encoding="utf-8", closefd=False)
    for fname, book, kind in SOURCES:
        path = OUT / fname
        if not path.exists():
            print("  %-26s 건너뜀 (파일 없음)" % book, file=log)
            continue
        got = json.loads(path.read_text(encoding="utf-8"))
        made = 0
        for i, q in enumerate(got, 1):
            row = from_gq(q, book) if kind == "gq" else from_jp(q, book)
            if not str(row["answer"] or "").strip():
                continue
            spot = place(book, row.pop("chapter_title") or "")
            if not spot:
                continue
            level, ch_no, ch = spot
            made += 1
            rows.append({
                # make_variants 가 원본을 가리킬 때 쓰는 이름들
                "source_ref": "%s #%d" % (book, made),
                "file": book,
                "source_file": book,
                "number": made,
                "level": level,
                "level_name": LEVEL_NAME[level],
                "chapter_no": ch_no,
                "chapter": ch,
                "round": None,
                "difficulty": None,
                **row,
            })
        print("  %-26s %d개" % (book, made), file=log)
    Path(dst).write_text(json.dumps(rows, ensure_ascii=False, indent=1), encoding="utf-8")
    print("\n은행 형식으로 %d개 저장: %s" % (len(rows), dst), file=log)
    log.flush()


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "tmp-grammar-bank/new-bank.json")

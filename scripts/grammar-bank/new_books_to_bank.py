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
import cw_map
import gi_map
import gg_map
import ilg_map
import hs_map
import mj_map
import mb_map
import mpj_map
import tb_map
import tfg_map
import yj_map
from unit_tree import units_of_name as units_of   # 세부 트리를 다시 짜면서 옮겼다
from to_official import nearest

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
    ("jpwb-1-matched.json", "잘풀리는영문법_1권 워크북", "jpwb"),
    ("jpwb-2-matched.json", "잘풀리는영문법_2권 워크북", "jpwb"),
    ("jpwb-3-matched.json", "잘풀리는영문법_3권 워크북", "jpwb"),
    ("gqwb-s1-matched.json", "그래머큐 Starter 1 워크북", "cwwb"),
    ("gqwb-s2-matched.json", "그래머큐 Starter 2 워크북", "cwwb"),
    ("gqwb-i1-matched.json", "그래머큐 Intermediate 1 워크북", "cwwb"),
    ("gqwb-i2-matched.json", "그래머큐 Intermediate 2 워크북", "cwwb"),
    ("gqwb-a1-matched.json", "그래머큐 Advanced 1 워크북", "cwwb"),
    ("gqwb-a2-matched.json", "그래머큐 Advanced 2 워크북", "cwwb"),
    ("cwwb-1-matched.json", "천일문 GRAMMAR 1권 워크북", "cwwb"),
    ("cwwb-2-matched.json", "천일문 GRAMMAR 2권 워크북", "cwwb"),
    ("cwwb-3-matched.json", "천일문 GRAMMAR 3권 워크북", "cwwb"),
    ("hs.json", "고등영어 어법서술형", "hs"),
    ("tb.json", "고등 교과서 문법", "tb"),
    ("mj-1-matched.json", "문법을 마중하다 Level_1", "mj"),
    ("mj-2-matched.json", "문법을 마중하다 Level_2", "mj"),
    ("mj-3-matched.json", "문법을 마중하다 Level_3", "mj"),
    ("gi-Starter-matched.json", "Grammar Inside Starter", "gi"),
    ("gi-1-matched.json", "Grammar Inside Level_1", "gi"),
    ("gi-2-matched.json", "Grammar Inside Level_2", "gi"),
    ("gi-3-matched.json", "Grammar Inside Level_3", "gi"),
    ("yj-1-matched.json", "열중 16강 문법 LEVEL 1", "yj"),
    ("yj-2-matched.json", "열중 16강 문법 LEVEL 2", "yj"),
    ("yj-3-matched.json", "열중 16강 문법 LEVEL 3", "yj"),
    ("ilg-1-keep.json", "I Love Grammar L1", "ilg"),
    ("ilg-2-keep.json", "I Love Grammar L2", "ilg"),
    ("ilg-3-keep.json", "I Love Grammar L3", "ilg"),
    ("gg-1-matched.json", "Good Grammar L1", "gg"),
    ("gg-2-matched.json", "Good Grammar L2", "gg"),
    ("gg-3-matched.json", "Good Grammar L3", "gg"),
    ("mb-1-keep.json", "중학영문법 3800제 1학년", "mb"),
    ("mb-2-keep.json", "중학영문법 3800제 2학년", "mb"),
    ("mb-3-keep.json", "중학영문법 3800제 3학년", "mb"),
    ("mpj-1-matched.json", "문제로 풀자 중학영문법 L1", "mpj"),
    ("mpj-2-matched.json", "문제로 풀자 중학영문법 L2", "mpj"),
    ("mpj-3-matched.json", "문제로 풀자 중학영문법 L3", "mpj"),
    ("mpp-1-matched.json", "문제로 풀자 L1 실전문제PLUS", "mpp"),
    ("mpp-2-matched.json", "문제로 풀자 L2 실전문제PLUS", "mpp"),
    ("mpp-3-matched.json", "문제로 풀자 L3 실전문제PLUS", "mpp"),
    ("tfgwb-basic-matched.json", "Time for Grammar Basic 워크북", "tfgwb"),
    ("tfgwb-inter-matched.json", "Time for Grammar Intermediate 워크북", "tfgwb"),
    ("tfgwb-adv-matched.json", "Time for Grammar Advanced 워크북", "tfgwb"),
    ("tfgwb-expert-matched.json", "Time for Grammar Expert 워크북", "tfgwb"),
    ("tfg-basic-matched.json", "Time for Grammar Basic", "tfg"),
    ("tfg-inter-matched.json", "Time for Grammar Intermediate", "tfg"),
    ("tfg-adv-matched.json", "Time for Grammar Advanced", "tfg"),
    ("tfg-expert-matched.json", "Time for Grammar Expert", "tfg"),
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


def from_jp_wb(q, book):
    """잘 풀리는 영문법 워크북 — RULE 이름이 곧 세부 단원이다."""
    return {
        "kind": "RULE",
        "question_kind": q.get("question_kind") or ("객관식" if q.get("choices") else "단답·서술"),
        "badges": [],
        "prompt": q.get("prompt") or "",
        "body": q.get("body") or [],
        "choices": q.get("choices") or [],
        "answer": q.get("answer"),
        "explanation": None,
        "chapter_title": q.get("chapter"),
    }


def from_cw_wb(q, book):
    """천일문 워크북 — Unit 이름이 곧 세부 단원이다."""
    return {
        "kind": "Unit",
        "question_kind": q.get("question_kind") or ("객관식" if q.get("choices") else "단답·서술"),
        "badges": [],
        "prompt": q.get("prompt") or "",
        "body": q.get("body") or [],
        "choices": q.get("choices") or [],
        "answer": q.get("answer"),
        "explanation": None,
        "chapter_title": q.get("chapter"),
    }


def from_hs(q, book):
    """고등 어법·서술형 — 지문이 있으면 본문 앞에 붙인다."""
    body = list(q.get("passage") or []) + list(q.get("body") or [])
    return {
        "kind": "서술형",
        "question_kind": q.get("question_kind") or "단답·서술",
        "badges": [],
        "prompt": q.get("prompt") or "",
        "body": body,
        "choices": [],
        "answer": q.get("answer"),
        "explanation": None,
        "chapter_title": q.get("chapter"),
    }


def from_tb(q, book):
    """고등 교과서 문법 — 연습문제 하나에 발문 하나, 답은 열쇠에서 가져왔다."""
    return {
        "kind": "연습문제",
        "question_kind": q.get("question_kind") or "단답·서술",
        "badges": [],
        "prompt": q.get("prompt") or "",
        "body": q.get("body") or [],
        "choices": [],
        "answer": q.get("answer"),
        "explanation": None,
        "chapter_title": q.get("title"),
    }


def from_mj(q, book):
    """문법을 마중하다 — POINT 이름이 곧 세부 단원이다."""
    return {
        "kind": "POINT",
        "question_kind": q.get("question_kind") or ("객관식" if q.get("choices") else "단답·서술"),
        "badges": [],
        "prompt": q.get("prompt") or "",
        "body": q.get("body") or [],
        "choices": q.get("choices") or [],
        "answer": q.get("answer"),
        "explanation": None,
        "chapter_title": q.get("chapter"),
    }


def from_gi(q, book):
    """Grammar Inside — CHECK UP·PRACTICE·Grammar for Writing·Review Test.

    이 책은 정답지에 해설이 붙어 있어(Review Test) 그대로 들고 온다.
    """
    return {
        "kind": q.get("section") or "PRACTICE",
        "question_kind": q.get("question_kind") or ("객관식" if q.get("choices") else "단답·서술"),
        "badges": [],
        "prompt": q.get("prompt") or "",
        "body": q.get("body") or [],
        "choices": q.get("choices") or [],
        "answer": q.get("answer"),
        "explanation": q.get("explanation"),
        "chapter_title": q.get("chapter"),
    }


def from_yj(q, book):
    """열중 16강 — 강 묶음·내신 적중 테스트·문법정리 OX·서술형 내공 Up.

    문법정리 OX 는 쪽 오른쪽에 접혀 있는 풀이를 해설로 들고 왔다.
    """
    return {
        "kind": q.get("section") or "UNIT",
        "question_kind": q.get("question_kind") or ("객관식" if q.get("choices") else "단답·서술"),
        "badges": [],
        "prompt": q.get("prompt") or "",
        "body": q.get("body") or [],
        "choices": q.get("choices") or [],
        "answer": q.get("answer"),
        "explanation": q.get("explanation"),
        "chapter_title": q.get("chapter"),
    }


def from_ilg(q, book):
    """I Love Grammar — Grammar Practice·Writing Practice 만 쓴다.

    LANGUAGE FOCUS 는 한 쪽에 과제가 둘이라 답이 엇갈리고, ACTUAL TEST 는 발문이
    절반 넘게 비어 학생이 무엇을 할지 모른다. 수를 채우기보다 맞는 것만 넣는다.
    """
    return {
        "kind": q.get("section") or "Grammar Practice",
        "question_kind": q.get("question_kind") or ("객관식" if q.get("choices") else "단답·서술"),
        "badges": [],
        "prompt": q.get("prompt") or "",
        "body": q.get("body") or [],
        "choices": q.get("choices") or [],
        "answer": q.get("answer"),
        "explanation": None,
        "chapter_title": q.get("chapter"),
    }


def from_gg(q, book):
    """Good Grammar — 실력 다지기만 쓴다(표본 20문항을 풀어 모두 맞았다)."""
    return {
        "kind": q.get("section") or "실력 다지기",
        "question_kind": q.get("question_kind") or ("객관식" if q.get("choices") else "단답·서술"),
        "badges": [],
        "prompt": q.get("prompt") or "",
        "body": q.get("body") or [],
        "choices": q.get("choices") or [],
        "answer": q.get("answer"),
        "explanation": None,
        "chapter_title": q.get("chapter"),
    }


def from_tfg(q, book):
    """Time for Grammar — 지시문마다 묶음이 갈리는 연습 문항만 쓴다."""
    return {
        "kind": q.get("section") or "연습",
        "question_kind": q.get("question_kind") or ("객관식" if q.get("choices") else "단답·서술"),
        "badges": [],
        "prompt": q.get("prompt") or "",
        "body": q.get("body") or [],
        "choices": q.get("choices") or [],
        "answer": q.get("answer"),
        "explanation": None,
        "chapter_title": q.get("chapter"),
    }


def from_mpj(q, book):
    """문제로 풀자 — POINT 연습(CHECK·PRACTICE)만 쓴다.

    「내신대비 실전문제」는 정답지에서 답이 아직 또박또박 읽히지 않는다. 수를
    채우려고 넣으면 어긋난 답이 섞이므로, 읽히는 것만 넣는다.
    """
    return {
        "kind": q.get("section") or "PRACTICE",
        "question_kind": q.get("question_kind") or ("객관식" if q.get("choices") else "단답·서술"),
        "badges": [],
        "prompt": q.get("prompt") or "",
        "body": q.get("body") or [],
        "choices": q.get("choices") or [],
        "answer": q.get("answer"),
        "explanation": None,
        "chapter_title": q.get("chapter"),
    }


def from_mpp(q, book):
    """문제로 풀자 「실전문제 PLUS」 — 단원마다 01부터 이어지는 내신형 문항이다."""
    return {
        "kind": "실전문제 PLUS",
        "question_kind": q.get("question_kind") or ("객관식" if q.get("choices") else "단답·서술"),
        "badges": [],
        "prompt": q.get("prompt") or "",
        "body": q.get("body") or [],
        "choices": q.get("choices") or [],
        "answer": q.get("answer"),
        "explanation": None,
        "chapter_title": None,
    }


def from_tfgwb(q, book):
    """Time for Grammar 워크북 — 지시문마다 묶음이 갈리는 연습 문항이다."""
    return {
        "kind": "워크북",
        "question_kind": q.get("question_kind") or ("객관식" if q.get("choices") else "단답·서술"),
        "badges": [],
        "prompt": q.get("prompt") or "",
        "body": q.get("body") or [],
        "choices": q.get("choices") or [],
        "answer": q.get("answer"),
        "explanation": None,
        "chapter_title": q.get("chapter"),
    }


def from_mb(q, book):
    """중학영문법 3800제 — 답이 문제 위에 하늘색으로 적힌 책이다.

    하늘색 자리를 빈칸으로 돌려놓은 것이 문제고, 그 글자가 답이다.
    """
    return {
        "kind": "연습",
        "question_kind": "단답·서술",
        "badges": [],
        "prompt": q.get("prompt") or "",
        "body": q.get("body") or [],
        "choices": [],
        "answer": ", ".join(q.get("answer") or []) if isinstance(q.get("answer"), list)
                  else q.get("answer"),
        "explanation": None,
        "chapter_title": q.get("chapter"),
    }


def unit_for(kind, q, level, chapter):
    """워크북의 RULE 이름을 은행이 쓰는 세부 목차 이름으로 옮긴다.

    은행의 세부 목차는 족보닷컴 갈래로 맞춰 두었다. 교재가 붙인 RULE 이름을
    그대로 넣으면 같은 뜻이 두 이름으로 갈라지므로, 가장 가까운 것으로 보낸다.
    """
    if kind == "jpwb":
        return nearest(q.get("rule") or "", units_of(level, chapter))
    if kind == "cwwb":
        return nearest(q.get("unit") or "", units_of(level, chapter))
    if kind == "mj":
        # POINT 이름이 세부 갈래 그대로다 — 공식 목차에서 가장 가까운 것으로
        return nearest(q.get("point") or "", units_of(level, chapter))
    if kind == "gg":
        return nearest(q.get("unit") or "", units_of(level, chapter))
    if kind in ("tfg", "tfgwb"):
        # 교재가 세부 갈래 이름을 적어 두지 않는다 — 적재 뒤 말씨로 가린다
        return None
    if kind == "mpj":
        # POINT 제목이 세부 갈래 그대로다(정답지에서 들고 왔다)
        return nearest(q.get("unit") or "", units_of(level, chapter))
    if kind == "mpp":
        # 내신형 문항에는 갈래 이름이 없다 — 적재 뒤 말씨로 가린다
        return None
    if kind == "mb":
        # UNIT 제목이 세부 갈래 그대로다 — 공식 목차에서 가장 가까운 것으로
        return nearest(q.get("unit") or "", units_of(level, chapter))
    if kind == "ilg":
        return nearest(q.get("unit") or "", units_of(level, chapter))
    if kind == "yj":
        # 강 이름(또는 문법정리 OX 의 이름표)이 세부 갈래 그대로다
        return nearest(q.get("unit") or q.get("point") or "", units_of(level, chapter))
    if kind == "gi":
        # UNIT 이름이 세부 갈래 그대로다 — 공식 목차에서 가장 가까운 것으로
        return nearest(q.get("unit") or "", units_of(level, chapter))
    if kind == "gq":
        # 교재가 붙인 단원 이름을 그대로 쓰면 공식 목차 밖으로 나간다
        return nearest(q.get("unit") or "", units_of(level, chapter))
    if kind == "tb":
        # PATTERN 이름이 세부 갈래 그대로다 — 공식 목차에서 가장 가까운 것으로
        return nearest(q.get("title") or "", units_of(level, chapter))
    if kind == "hs":
        # 교재 단원 이름이 「조동사」처럼 뭉뚱그려져 있어 그대로 가져오면
        # 「조동사 Can」 같은 중1 갈래가 붙는다. 적재 뒤 말씨로 가리게 비워 둔다.
        return None
    return q.get("unit")


def main(dst, only=None):
    """only 를 주면 이름에 그 말이 든 교재만 모은다.

    적재 스크립트는 이 파일에 없는 줄을 그 교재에서 지우고 세부 목차도 덮어쓴다.
    이미 넣어 둔 교재까지 함께 돌리면 손봐 둔 세부 목차가 날아가므로, 새로
    넣을 교재만 골라 돌린다.
    """
    rows = []
    log = io.open(1, "w", encoding="utf-8", closefd=False)
    for fname, book, kind in SOURCES:
        if only and only not in book:
            continue
        path = OUT / fname
        if not path.exists():
            print("  %-26s 건너뜀 (파일 없음)" % book, file=log)
            continue
        got = json.loads(path.read_text(encoding="utf-8"))
        # 답을 붙인 비율이 터무니없이 낮으면 그 교재의 정답지를 잘못 읽은 것이다.
        # 몇 개 건지려고 넣으면 어긋난 답이 은행에 섞인다.
        whole = OUT / fname.replace("-matched", "")
        if whole.exists():
            total = len(json.loads(whole.read_text(encoding="utf-8")))
            if total and len(got) < total * 0.05:
                print("  %-26s 넣지 않음 (답 붙은 것이 %d/%d — 정답지를 잘못 읽었다)"
                      % (book, len(got), total), file=log)
                continue
        made = 0
        for i, q in enumerate(got, 1):
            row = (from_gq(q, book) if kind == "gq" else
                   from_jp_wb(q, book) if kind == "jpwb" else
                   from_cw_wb(q, book) if kind == "cwwb" else
                   from_hs(q, book) if kind == "hs" else
                   from_tb(q, book) if kind == "tb" else
                   from_mj(q, book) if kind == "mj" else
                   from_gi(q, book) if kind == "gi" else
                   from_yj(q, book) if kind == "yj" else
                   from_ilg(q, book) if kind == "ilg" else
                   from_gg(q, book) if kind == "gg" else
                   from_tfg(q, book) if kind == "tfg" else
                   from_tfgwb(q, book) if kind == "tfgwb" else
                   from_mpj(q, book) if kind == "mpj" else
                   from_mpp(q, book) if kind == "mpp" else
                   from_mb(q, book) if kind == "mb" else from_jp(q, book))
            if not str(row["answer"] or "").strip():
                continue
            title = row.pop("chapter_title") or ""
            # 천일문은 단원 짜임이 달라 표를 따로 둔다 (「to부정사와 동명사」처럼
            # 둘을 묶어 놓은 단원은 Unit 이름을 보고 가른다)
            if kind == "cwwb":
                # 그래머큐 워크북은 단원 이름이 본책과 같아 기존 표를 그대로 쓴다
                spot = (place(book, title) if "그래머큐" in book
                        else cw_map.place(book, title, q.get("unit")))
            elif kind == "mj":
                spot = mj_map.place(book, title, q.get("point"))
            elif kind == "gi":
                # 쪽마다 단원 이름이 조금씩 잘려 들어오므로 번호로 찾는다
                spot = gi_map.place(book, q.get("chapter_no"), q.get("unit"))
            elif kind == "gg":
                # L2·L3 은 단원 번호와 인쇄 쪽으로 찾는다(이름 꼬리말이 드물다)
                spot = gg_map.place(book, title, q.get("unit"),
                                    q.get("chapter_no"), q.get("printed_page"))
            elif kind == "mb":
                spot = mb_map.place(book, q.get("chapter_no"), q.get("unit"))
            elif kind in ("mpj", "mpp"):
                # 단원 번호로 찾고, 묶음 단원은 POINT 제목으로 가른다
                spot = mpj_map.place(book, q.get("chapter_no"), q.get("unit"))
            elif kind == "tfgwb":
                # 쪽머리 이름에서 글자가 빠져 들어오는 쪽이 있어 번호로 찾는다
                spot = tfg_map.place(
                    book, tfg_map.name_of(book, q.get("chapter_no")) or title,
                    " ".join([row["prompt"]] + row["body"] + [str(row["answer"] or "")]))
            elif kind == "tfg":
                # 단원 이름이 영어다. 한 단원에 두 갈래를 묶어 놓은 데가 있어
                # 문항의 말씨를 함께 넘긴다 — 단원 이름은 섞지 않는다.
                spot = tfg_map.place(
                    book, title,
                    " ".join([row["prompt"]] + row["body"] + [str(row["answer"] or "")]))
            elif kind == "ilg":
                spot = ilg_map.place(book, q.get("chapter_no"), q.get("unit"))
            elif kind == "yj":
                # 한 단원에 두 강을 묶어 놓아, 강 이름을 보고 가른다
                spot = yj_map.place(
                    book, q.get("chapter_no"), q.get("unit"),
                    " ".join([q.get("point") or "", q.get("explanation") or "",
                              row["prompt"]] + row["body"]))
            elif kind == "tb":
                spot = tb_map.place(title)
            elif kind == "hs":
                # 「동사의 시제와 태」는 문항을 보고 시제·수동태로 가른다
                spot = hs_map.place(title, " ".join(row["body"] + [row["answer"] or ""]))
            else:
                spot = place(book, title)
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
                # 교재가 나눈 세부 단원 — 목차를 잘게 나눠 고를 때 쓴다
                "unit_no": q.get("unit_no"),
                "unit": unit_for(kind, q, level, ch),
                "round": None,
                "difficulty": None,
                **row,
            })
        print("  %-26s %d개" % (book, made), file=log)
    Path(dst).write_text(json.dumps(rows, ensure_ascii=False, indent=1), encoding="utf-8")
    print("\n은행 형식으로 %d개 저장: %s" % (len(rows), dst), file=log)
    log.flush()


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "tmp-grammar-bank/new-bank.json",
         sys.argv[2] if len(sys.argv) > 2 else None)

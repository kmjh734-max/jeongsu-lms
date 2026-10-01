# -*- coding: utf-8 -*-
"""중학영문법 3800제에서 뽑은 문항 가운데 **쓸 만한 것만** 고른다.

이 책은 글자를 모양표로 되살렸으므로, 표에 없는 모양은 □ 로 남는다. □ 가 든
문항은 학생에게 그대로 나가면 글이 뚫린 채로 보이므로 넣지 않는다. 답이 없는
것, 답이 빈칸·기호뿐인 것, 글이 너무 짧아 무엇을 묻는지 알 수 없는 것도 뺀다.

  python scripts/grammar-bank/mb_keep.py 뽑은것.json 고른것.json
"""
import collections, io, json, re, sys
from pathlib import Path

LOG = io.open(1, "w", encoding="utf-8", closefd=False)
BLANK = "_____"
MARKS = re.compile(r"^[\s_\-.,;:()\[\]'\"/·□■★→▶]*$")
# 「(down, under)」·「(at; on; in)」처럼 고를 말을 괄호에 적어 둔 자리
PICK = re.compile(r"\(([^()]{2,60}[,;][^()]{2,60})\)")


def tidy(text):
    text = re.sub(r"\s+", " ", str(text or "")).strip()
    # 빈칸이 여러 번 이어진 것은 하나로 줄인다
    return re.sub(r"(?:_{3,}\s*){2,}", BLANK + " ", text).strip()


def note(text):
    """답이 아니라 곁에 적어 둔 낱말 풀이인가.

    이 책은 어려운 낱말의 뜻을 하늘색으로 곁들여 적는다. 빛깔이 답과 같아서
    그대로 두면 「amazing / (+ dissatisfy 동 불만을 느끼게 하다)」처럼 답에
    풀이말이 따라붙는다. 우리말과 영어가 섞여 길게 이어지면 풀이말로 본다.
    """
    t = str(text or "").strip()
    if t.startswith(("(", "+", "cf", "※", "▶", "=")):
        return True
    if re.match(r"^[A-Za-z][A-Za-z\s'-]{2,}\s+[가-힣]", t):
        return True          # 「fish 명 물고기」 꼴
    return bool(re.search(r"[가-힣]", t) and re.search(r"[A-Za-z]{3}", t) and len(t) > 24)


def main(src, dst):
    rows = json.loads(Path(src).read_text(encoding="utf-8"))

    # 한 묶음 안에서 지시문이 빠진 문항은 같은 묶음의 지시문을 물려받는다.
    # 지시문은 묶음의 머리에 한 번만 적혀 있어, 쪽을 넘어가면 빠지기 때문이다.
    heads = collections.defaultdict(collections.Counter)
    for r in rows:
        if str(r.get("prompt") or "").strip():
            heads[(r.get("chapter_no"), r.get("block"))][r["prompt"]] += 1
    for r in rows:
        if not str(r.get("prompt") or "").strip():
            box = heads.get((r.get("chapter_no"), r.get("block")))
            if box:
                r["prompt"] = box.most_common(1)[0][0]

    out, why = [], collections.Counter()
    for r in rows:
        answer = [tidy(a) for a in (r.get("answer") or [])]
        answer = [a for a in answer if a and not MARKS.match(a) and not note(a)]
        body = [tidy(b) for b in (r.get("body") or [])]
        body = [b for b in body if b]
        prompt = tidy(r.get("prompt"))
        said = " ".join([prompt] + body + answer)

        if not answer:
            why["답이 없다"] += 1
            continue
        if "□" in said:
            why["모르는 글자가 들었다"] += 1
            continue
        if not body:
            why["본문이 없다"] += 1
            continue
        if not prompt:
            why["발문이 없다"] += 1
            continue
        if len(" ".join(body)) < 12:
            why["글이 너무 짧다"] += 1
            continue
        if BLANK not in " ".join(body) and len(answer) == 1 and answer[0] in " ".join(body):
            why["빈칸이 없다"] += 1
            continue
        if sum(len(a) for a in answer) > 160:
            why["답이 너무 길다"] += 1
            continue
        # 고를 말을 괄호에 적어 둔 문항은 답이 그 안에 있어야 한다. 이 책은 고른
        # 자리에 동그라미를 쳐 두는데, 그 동그라미가 글자로 읽혀 엉뚱한 답이 된다.
        picks = [p.strip() for box in PICK.findall(" ".join(body))
                 for p in re.split(r"[,;/]", box) if p.strip()]
        if picks and not any(a.strip(" _.") in picks for a in answer):
            why["괄호 안의 말이 답에 없다"] += 1
            continue
        got = dict(r)
        got["prompt"], got["body"], got["answer"] = prompt, body, answer
        out.append(got)

    Path(dst).write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print("문항 %d개 가운데 %d개를 골랐다 (%.0f%%): %s"
          % (len(rows), len(out), 100 * len(out) / max(len(rows), 1), dst), file=LOG)
    for k, n in why.most_common():
        print("   뺀 까닭 — %s: %d개" % (k, n), file=LOG)
    LOG.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])

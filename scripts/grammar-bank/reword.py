# -*- coding: utf-8 -*-
"""보기 순서만 바뀐 변형의 영어를 바꾼다.

보기가 am/is/are처럼 문법 형태 자체인 문제는 보기를 건드릴 수 없다.
대신 본문에 나오는 낱말을 바꿔 다른 문제로 보이게 하고,
보기·정답·해설에도 같은 낱말이 있으면 똑같이 바꿔 앞뒤를 맞춘다.

바꾸지 않는 자리
  - [[ ]]로 밑줄 친 곳은 문제가 묻는 자리이므로 손대지 않는다.
    그 안에 든 낱말은 문제 전체에서 바꾸지 않는다.
  - 셀 수 없는 명사 함정처럼 문제의 핵심이 되는 낱말이 있으면 그 문제는 건너뛴다.
"""
import json, re, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from words import SWAP, KEEP_AWAY, KOREAN

MARK = re.compile(r"\[\[.*?\]\]", re.S)
WORD = re.compile(r"[A-Za-z][A-Za-z'’-]*")
HANGUL = re.compile(r"[가-힣]")


def words_of(text):
    return set(WORD.findall(text or ""))


def sig(q):
    return (q["prompt"].strip(), tuple(x.strip() for x in q["body"]),
            (q["answer"] or "").strip(),
            tuple(c["text"].strip() for c in q["choices"]))


def plural(word):
    if word.endswith(("s", "x", "ch", "sh")):
        return word + "es"
    if word.endswith("y") and word[-2] not in "aeiou":
        return word[:-1] + "ies"
    return word + "s"


def build_table(question):
    """이 문제에서 쓸 수 있는 낱말 짝만 고른다."""
    english = " ".join(list(question["body"])
                       + [c["text"] for c in question["choices"]])
    # 우리말 뜻이 함께 적힌 문제에서는 영어와 우리말을 같이 바꿔야 한다.
    mixed = bool(HANGUL.search(english))
    whole = " ".join([question["prompt"], english,
                      question["answer"] or "", question["explanation"] or ""])
    seen = words_of(whole)
    if seen & KEEP_AWAY:
        return None
    frozen = set()
    for chunk in MARK.findall(whole):
        frozen |= {w.lower() for w in words_of(chunk)}
    # "computer games", "math exam"처럼 두 낱말이 붙어 한 뜻을 이루면 둘 다 두고 본다.
    keyset = set(SWAP) | {plural(k) for k in SWAP if k[0].islower()}
    stuck = set()
    for one, two in re.findall(r"([A-Za-z]+) ([A-Za-z]+)", whole):
        if one in keyset and two in keyset:
            stuck |= {one, two}

    table = {}
    for key, val in SWAP.items():
        if key in stuck or plural(key) in stuck:
            continue
        if key.lower() in frozen:
            continue
        pair = KOREAN.get(key)
        if mixed and not (pair and pair[0] in whole):
            # 우리말이 섞인 문제에서는 우리말 짝이 함께 나오는 낱말만 쓴다.
            continue
        if pair and pair[0] in whole:
            table[pair[0]] = pair[1]
        if key in seen:
            table[key] = val
        low = key[0].islower()
        if low and plural(key) in seen:
            table[plural(key)] = plural(val)
    return table or None


def apply(text, table):
    if not text:
        return text, 0
    parts = []
    for key in sorted(table, key=len, reverse=True):
        esc = re.escape(key)
        # 우리말은 뒤에 조사가 붙으므로 낱말 경계를 쓰지 않는다.
        if HANGUL.search(key):
            # 뒤에 조사가 붙은 자리만 바꾼다. "영화배우"처럼 붙어 만든 말은 건드리지 않는다.
            parts.append(esc + r"(?=[^가-힣]|[은는이가을를의에도와과로만])")
        else:
            parts.append(r"(?<![A-Za-z'])%s(?![A-Za-z'])" % esc)
    pattern = re.compile("(" + "|".join(parts) + ")")
    hits = [0]

    def swap_part(part):
        def one(m):
            hits[0] += 1
            return table[m.group(1)]
        return pattern.sub(one, part)

    out, last = [], 0
    for m in MARK.finditer(text):
        out.append(swap_part(text[last:m.start()]))
        out.append(m.group(0))
        last = m.end()
    out.append(swap_part(text[last:]))
    return "".join(out), hits[0]


def rewrite(variant, table):
    # 눈에 보이는 곳 — 본문과 보기 — 이 바뀌어야 다른 문제가 된다.
    # 정답·해설만 바뀐 것은 바꾼 것으로 치지 않는다.
    shown = 0
    body = []
    for line in variant["body"]:
        new, n = apply(line, table)
        body.append(new)
        shown += n
    choices = []
    for c in variant["choices"]:
        new, n = apply(c["text"], table)
        choices.append({"no": c["no"], "text": new})
        shown += n
    answer, _ = apply(variant["answer"], table)
    why, _ = apply(variant["explanation"], table)
    if not shown:
        return None
    total = shown
    out = dict(variant)
    out.update({"body": body, "choices": choices, "answer": answer,
                "explanation": why})
    return out, total


def main(bank_path, variants_path, dry=False):
    bank = {(q["file"], q["number"]): q
            for q in json.loads(Path(bank_path).read_text(encoding="utf-8"))}
    made = json.loads(Path(variants_path).read_text(encoding="utf-8"))

    plans, thin = {}, []
    for v in made:
        ch = v["changes"] or []
        if ch and ch[0].startswith("손으로"):
            continue
        q = bank[(v["origin_file"], v["origin_number"])]
        if not q["choices"]:
            continue
        if [x.strip() for x in q["body"]] != [x.strip() for x in v["body"]]:
            continue
        if sorted(x["text"].strip() for x in q["choices"]) != \
           sorted(x["text"].strip() for x in v["choices"]):
            continue
        key = sig(q)
        if key in plans or key in {t[0] for t in thin}:
            continue
        table = build_table(q)
        done = rewrite(v, table) if table else None
        if done:
            plans[key] = (done[0], done[1], table)
        else:
            thin.append((key, q))

    changed = 0
    if not dry:
        for v in made:
            ch = v["changes"] or []
            if ch and ch[0].startswith("손으로"):
                continue
            q = bank[(v["origin_file"], v["origin_number"])]
            plan = plans.get(sig(q))
            if not plan:
                continue
            new, _, table = plan
            v["body"] = list(new["body"])
            v["choices"] = [dict(c) for c in new["choices"]]
            v["answer"] = new["answer"]
            v["explanation"] = new["explanation"]
            note = "낱말 바꿈 " + ", ".join("%s→%s" % kv for kv in sorted(table.items())[:6])
            v["changes"] = [note] + [c for c in (v["changes"] or [])]
            # 검사기가 원본에 그대로 다시 적용해 볼 수 있도록 바꿈표를 남긴다.
            kept = dict(v.get("table") or {})
            kept.update(table)
            v["table"] = kept
            changed += 1
        Path(variants_path).write_text(json.dumps(made, ensure_ascii=False),
                                       encoding="utf-8")
    print("영어를 바꾼 문제 %d가지 (문항 수로는 %d개)" % (len(plans), changed))
    print("아직 보기 순서만 바뀐 문제 %d가지" % len(thin))
    return thin


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], dry="--dry" in sys.argv)

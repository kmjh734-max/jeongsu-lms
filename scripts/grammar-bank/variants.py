# -*- coding: utf-8 -*-
"""문항을 안전하게 변형한다.

문법 포인트를 건드리면 정답이 깨지므로, 바꿔도 어법이 그대로인 것만 허용한다.
 - 선택지 순서 섞기 (정답 번호를 다시 매긴다)
 - 사람 이름 바꾸기 (3인칭 단수를 유지하고, 우리말 조사가 깨지지 않는 이름만)
 - he ↔ she (his/her가 섞여 뜻이 갈리는 문장은 건드리지 않는다)
 - 숫자 바꾸기 (단수/복수가 바뀌지 않는 범위에서만)

어법 문항의 밑줄 친 부분([[...]])은 무슨 일이 있어도 그대로 둔다.
"""
import re

import english_only
import gender
import vocab

MARKERS = "①②③④⑤"
PROTECTED = re.compile(r"\[\[.*?\]\]")


# ── 사람 이름 ───────────────────────────────────────────────────────────────
# final=True는 우리말로 읽을 때 받침이 있는 이름(톰, 제인 …).
# 받침이 같아야 "Tom과/Mike와", "Jane은/Amy는" 같은 조사가 깨지지 않는다.
NAMES = [
    ("Tom", "m", True), ("Ben", "m", True), ("John", "m", True),
    ("Sam", "m", True), ("Kevin", "m", True), ("Jack", "m", True),
    ("Dan", "m", True), ("Bill", "m", True),
    ("Mike", "m", False), ("Mark", "m", False), ("Andy", "m", False),
    ("Peter", "m", False), ("Harry", "m", False), ("Danny", "m", False),
    ("Jane", "f", True), ("Ann", "f", True), ("Sujin", "f", True),
    ("Karen", "f", True), ("Susan", "f", True),
    ("Amy", "f", False), ("Mary", "f", False), ("Judy", "f", False),
    ("Sally", "f", False), ("Mina", "f", False), ("Sora", "f", False),
    ("Jenny", "f", False), ("Emily", "f", False), ("Lucy", "f", False),
]
NAME_INDEX = {name: (gender, final) for name, gender, final in NAMES}


def eng_boundary(words):
    r"""영어 낱말 경계를 만든다.

    \b는 "Mike는"에서 한글을 낱말로 봐서 경계를 못 찾는다. 앞뒤가 영문자가
    아닌지로 따지면 한글이 바로 붙어도 낱말 끝으로 본다.
    """
    body = "|".join(re.escape(w) for w in sorted(words, key=len, reverse=True))
    return r"(?<![A-Za-z'])(%s)(?![A-Za-z'])" % body


NAME_RE = re.compile(eng_boundary(NAME_INDEX))

# he ↔ she 짝. 'her'는 소유격일 수도 목적격일 수도 있어 뜻이 갈린다.
AMBIGUOUS = re.compile(r"\b(his|His|her|Her|hers|Hers)\b")
PRONOUN_PAIRS = [("he", "she"), ("He", "She"), ("him", "her"), ("Him", "Her"),
                 ("himself", "herself"), ("Himself", "Herself")]

NUMBER_WORDS = ["two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"]
NUMBER_RE = re.compile(eng_boundary(NUMBER_WORDS))


# ── 밑줄 보호 ───────────────────────────────────────────────────────────────

def split_protected(text):
    """[[밑줄]] 부분과 나머지를 갈라 놓는다. 밑줄은 손대지 않는다."""
    parts, last = [], 0
    for found in PROTECTED.finditer(text):
        parts.append((text[last:found.start()], False))
        parts.append((found.group(0), True))
        last = found.end()
    parts.append((text[last:], False))
    return parts


def substitute(text, replace):
    """밑줄 친 곳은 빼고 바꾼다."""
    out = []
    for piece, guarded in split_protected(text):
        out.append(piece if guarded else replace(piece))
    return "".join(out)


# 붙어 쓰는 말의 뒷자리 — 여기 낱말을 바꾸면 말이 깨진다.
# 「cell phone」이 「cell wallet」, 「living room」이 「living kitchen」,
# 「best friend」가 「best teammate」가 되어 학생에게 그대로 나갔다.
GLUED = {
    "cell", "Christmas", "high", "middle", "elementary", "swimming", "living",
    "best", "ice", "post", "birthday", "department", "text", "traffic",
    "cotton", "police", "fire", "news", "rail", "tooth", "hair", "dining",
    "living", "grand", "class", "home", "week", "wedding", "water", "air",
    "video",            # 「video games」가 「radio games」가 되었다
}


GLUE_RE = re.compile(
    # 붙어 쓰는 두 낱말, 그리고 붇임표로 묶인 말(T-shirt·old-fashioned)
    r"\b(?:%s)\s+[A-Za-z]+|\b[A-Za-z]+(?:-[A-Za-z]+)+\b"
    % "|".join(sorted(GLUED, key=len, reverse=True)), re.I)


def keep_glued(replace):
    """붙어 쓰는 말만 잠시 가려 두고, 나머지 글은 그대로 바꾼다.

    영어 낱말을 하나씩 떼어 바꾸면 안 된다 — 낱말표에는 「ice cream」처럼 두
    낱말짜리 말과 우리말 짝(skiing↔스키)이 함께 들어 있어, 영어만 집으면 짝이
    따로 남는다. 「스키 타러 갈 텐데」 밑에 basketball 이 적힌 변형본이 그렇게
    나왔다. 그러니 가릴 것만 가리고 글 전체를 한 번에 바꾼다.
    """
    def swap(piece):
        kept = []

        def hide(found):
            kept.append(found.group(0))
            return "\x01%d\x01" % (len(kept) - 1)

        masked = GLUE_RE.sub(hide, piece)
        done = replace(masked)
        return re.sub(r"\x01(\d+)\x01", lambda m: kept[int(m.group(1))], done)
    return swap


def visible(question):
    """학생이 보는 곳 — 여기에 없는 말을 바꾸면 정답만 달라져 앞뒤가 어긋난다."""
    return ([question["prompt"]] + list(question["body"])
            + [c["text"] for c in question["choices"]])


def fields(question):
    """변형이 닿아야 하는 글 전부 — 우리말 해석에도 이름이 들어 있다."""
    yield ("prompt", question["prompt"])
    for index, line in enumerate(question["body"]):
        yield (("body", index), line)
    for index, choice in enumerate(question["choices"]):
        yield (("choice", index), choice["text"])
    yield ("answer", question["answer"] or "")
    yield ("explanation", question["explanation"] or "")


def rebuild(question, changed):
    """바뀐 글을 문항 모양으로 다시 담는다."""
    out = {
        "prompt": changed.get("prompt", question["prompt"]),
        "body": list(question["body"]),
        "choices": [dict(c) for c in question["choices"]],
        "answer": changed.get("answer", question["answer"]),
        "explanation": changed.get("explanation", question["explanation"]),
    }
    for key, value in changed.items():
        if isinstance(key, tuple) and key[0] == "body":
            out["body"][key[1]] = value
        elif isinstance(key, tuple) and key[0] == "choice":
            out["choices"][key[1]]["text"] = value
    return out



# ── 이름 바꾸기 ─────────────────────────────────────────────────────────────

def plan_names(question, report, rng, flip_gender=False):
    """바꿔 넣을 이름을 고른다. 이 문항에서 묶여 있는 이름은 건드리지 않는다.

    성별과 받침이 같은 이름만 고른다. 성별이 같아야 he/she가 어긋나지 않고,
    받침이 같아야 "Tom과 / Mike와" 같은 우리말 조사가 깨지지 않는다.
    성별을 통째로 뒤집을 때만 반대 성별에서 고른다.
    """
    blob = " ".join(visible(question))
    found = []
    for name in NAME_RE.findall(blob):
        if name not in found and name.lower() not in report["locked"]:
            found.append(name)
    if not found:
        return None

    plan, taken = {}, set(NAME_RE.findall(blob))
    for name in found:
        gender, final = NAME_INDEX[name]
        want = ("f" if gender == "m" else "m") if flip_gender else gender
        pool = [n for n, g, f in NAMES
                if g == want and f == final and n not in taken and n != name]
        if not pool:
            return None                       # 하나라도 못 바꾸면 통째로 포기
        pick = rng.choice(pool)
        plan[name] = pick
        taken.add(pick)
    return plan


def apply_map(question, table):
    pattern = re.compile(eng_boundary(table))

    def swap(piece):
        return pattern.sub(lambda m: table[m.group(1)], piece)

    return {key: substitute(text, swap) for key, text in fields(question)}


# ── 성별 뒤집기 ─────────────────────────────────────────────────────────────

def can_flip_gender(question, report):
    """이 문항의 성별을 통째로 뒤집어도 되는지.

    대명사·수일치 단원이거나, 성별을 알 수 없는 이름이 섞였거나,
    뒤집을 말이 정답·해설에 묶여 있으면 손대지 않는다.
    """
    if not report["allow_gender"]:
        return False
    texts = [text for _, text in fields(question)]
    if not gender.can_flip(texts, known_names=NAME_INDEX):
        return False
    # 성별 표지가 본문에 없고 정답에만 있으면, 뒤집어 봐야 문제와 답이 어긋난다.
    if not gender.FLIP_RE.search(re.sub(r"\[\[|\]\]", " ", " ".join(visible(question)))):
        return False
    for text in texts:
        for word in gender.FLIP_RE.findall(re.sub(r"\[\[|\]\]", "", text)):
            token = (word[0] or word[1]) if isinstance(word, tuple) else word
            if token and token.lower() in report["locked"]:
                return False
    return True


def apply_gender(question):
    return {key: substitute(text, gender.flip) for key, text in fields(question)}


# ── 숫자 바꾸기 ─────────────────────────────────────────────────────────────

def plan_numbers(question, report, rng):
    """단수/복수가 바뀌지 않게, 둘 이상인 수끼리만 바꾼다.

    본문에 없이 정답에만 있는 수는 건드리지 않는다. 바꾸면 문제와 답이 어긋난다.
    발문의 수도 세지 않는다 — 「Combine the two sentences」의 two 는 문장의
    내용이 아니라 할 일의 개수라서, 바꾸면 발문이 거짓말이 된다.
    """
    blob = " ".join(list(question["body"]) + [c["text"] for c in question["choices"]])
    found = []
    for word in NUMBER_RE.findall(blob):
        if word not in found and word not in report["locked"]:
            found.append(word)
    if not found:
        return None
    plan, used = {}, set()
    for word in found:
        pool = [w for w in NUMBER_WORDS
                if w != word and w not in used and w not in report["locked"]]
        if not pool:
            return None
        pick = rng.choice(pool)
        plan[word] = pick
        used.add(pick)
    return plan


# ── 선택지 순서 섞기 ────────────────────────────────────────────────────────

# 보기끼리 서로를 가리키는 문항만 막는다.
# "순서대로 짝지어진 것은?"은 빈칸의 순서를 말하는 것이라 보기를 섞어도 된다.
ORDER_MATTERS = re.compile(r"(위의 모두|모두 고른|위 선택지)")


def can_shuffle(question):
    """선택지를 섞어도 되는 문항인지."""
    choices = question["choices"]
    if len(choices) != 5:
        return False
    if ORDER_MATTERS.search(question["prompt"]):
        return False
    for choice in choices:
        text = choice["text"].strip()
        if not text or "〈그림〉" in text:
            return False
        if any(mark in text for mark in MARKERS):
            return False            # 선택지가 다른 번호를 가리키면 섞을 수 없다
    return any(c in (question["answer"] or "") for c in MARKERS)


def shuffle_choices(question, rng, want=None):
    """선택지를 섞고 정답 번호를 다시 매긴다.

    want를 주면 정답이 그 자리(0부터)로 가도록 맞춘다. 정답 쏠림을 펴는 데 쓴다.
    """
    choices = question["choices"]
    picked = [MARKERS.index(c) for c in (question["answer"] or "") if c in MARKERS]
    order = list(range(len(choices)))
    for _ in range(40):
        rng.shuffle(order)
        if order == list(range(len(choices))):
            continue                                  # 그대로면 변형이 아니다
        if want is None or len(picked) != 1:
            break
        if order.index(picked[0]) == want:
            break

    moved = [dict(choices[old], no=new + 1) for new, old in enumerate(order)]
    answer = question["answer"] or ""
    for old in sorted(picked, reverse=True):
        answer = answer.replace(MARKERS[old], "\x00%d" % order.index(old))
    for new in range(len(choices)):
        answer = answer.replace("\x00%d" % new, MARKERS[new])
    return moved, answer, order


# ── 검사 ────────────────────────────────────────────────────────────────────

def protected_spans(question):
    blob = " ".join(text for _, text in fields(question))
    return sorted(PROTECTED.findall(blob))


def validate(original, variant):
    """변형본이 쓸 만한지 따진다. 하나라도 걸리면 버린다."""
    problems = []
    if protected_spans(original) != protected_spans(variant):
        problems.append("밑줄 친 부분이 바뀌었다")

    answer = variant["answer"] or ""
    if not answer.strip():
        problems.append("정답이 비었다")
    picked = [MARKERS.index(c) + 1 for c in answer if c in MARKERS]
    if picked and max(picked) > len(variant["choices"]):
        problems.append("정답 번호가 선택지를 벗어났다")

    for choice in variant["choices"]:
        if not choice["text"].strip():
            problems.append("선택지가 비었다")
            break

    # 바꾼 보기가 다른 보기의 원래 내용이 되면, 어느 것이 답인지 흔들린다.
    before = [c["text"].strip() for c in original["choices"]]
    after = [c["text"].strip() for c in variant["choices"]]
    if len(set(after)) != len(after):
        problems.append("선택지끼리 같아졌다")
    changed_any = sorted(after) != sorted(before)
    if changed_any:
        for text in after:
            if text not in before:
                continue
        fresh = [t for t in after if t not in before]
        stale = [t for t in before if t not in after]
        if fresh and stale and set(after) & set(before):
            pass          # 일부만 바뀌는 것은 정상이다
    moved = [t for t in after if t not in before]
    if moved and set(after) & set(before) and len(moved) < len(after):
        pass                                    # 일부만 바뀐 것은 정상이다
    for index, text in enumerate(after):
        if text in before and before.index(text) != index and text not in moved:
            pass                                # 순서 섞기는 당연히 자리가 바뀐다

    visible_old = original["body"] + [c["text"] for c in original["choices"]] + [original["answer"] or ""]
    visible_new = variant["body"] + [c["text"] for c in variant["choices"]] + [variant["answer"] or ""]
    if visible_old == visible_new:
        problems.append("학생이 보는 곳이 그대로다")

    old_texts = [text for _, text in fields(original)]
    new_texts = [text for _, text in fields(variant)]
    if old_texts == new_texts:
        problems.append("원본과 똑같다")
    for old, new in zip(old_texts, new_texts):
        if re.sub(r"\s+", "", old) and not re.sub(r"\s+", "", new):
            problems.append("글이 사라졌다")
            break

    bad = re.compile(r"\ba\s+[aeiouAEIOU]")
    if len(bad.findall(" ".join(new_texts))) > len(bad.findall(" ".join(old_texts))):
        problems.append("a/an이 어긋난다")

    if mismatched(" ".join(new_texts)) and not mismatched(" ".join(old_texts)):
        problems.append("우리말 뜻과 영어가 어긋난다")
    return problems


def mismatched(text):
    """우리말에는 옛 낱말이 남고 영어만 바뀐 글인가.

    붙어 쓰는 말을 가려 두면(Christmas gift) 영어는 그대로인데 우리말만 바뀌어
    「입장권 ↔ gift」처럼 어긋난다. 두 쪽 다 짝이 맞는지 여기서 본다.
    """
    if not re.search(r"[가-힣]", text):
        return False
    for group in vocab.GROUPS.values():
        here_ko = [ko for en, ko in group if ko in text]
        here_en = [en for en, ko in group
                   if re.search(r"(?:^|[^A-Za-z])%s(?:[^A-Za-z]|$)" % re.escape(en),
                                text, re.I)]
        off = [ko for en, ko in group if ko in here_ko and en not in here_en]
        other = [en for en, ko in group if en in here_en and ko not in here_ko]
        if off and other:
            return True
    return False


# ── 변형 만들기 ─────────────────────────────────────────────────────────────

def build_variant(question, report, rng, want=None):
    """한 문항을 분석 결과에 따라 변형한다. 무엇을 바꿨는지 함께 돌려준다."""
    applied, table, flipped = [], {}, False
    working = question

    flip = can_flip_gender(working, report)
    plan = plan_names(working, report, rng, flip_gender=flip)
    # 성별을 뒤집는데 이름을 못 바꾸면 "Tom … she"가 된다. 그럴 바엔 뒤집지 않는다.
    if flip and plan is None and NAME_RE.search(" ".join(visible(working))):
        flip = False
    if plan:
        working = dict(working, **rebuild(working, apply_map(working, plan)))
        table.update(plan)
        applied.append("이름 " + ", ".join("%s→%s" % kv for kv in plan.items()))

    if flip:
        after = rebuild(working, apply_gender(working))
        if gender.stays_consistent([t for _, t in fields(working)],
                                   [t for _, t in fields(dict(working, **after))]):
            working = dict(working, **after)
            flipped = True
            applied.append("성별 뒤집기")

    table_, moved = vocab.plan(
        [t for _, t in fields(working)], report["locked"], rng,
        visible=visible(working))
    if table_:
        pattern = vocab.pattern_for(table_)

        def swap_vocab(piece):
            return pattern.sub(lambda m: table_[m.group(0)], piece)

        changed = {key: substitute(text, keep_glued(swap_vocab))
                   for key, text in fields(working)}
        working = dict(working, **rebuild(working, changed))
        table.update(table_)
        applied.append("낱말 " + ", ".join("%s→%s" % kv for kv in moved.items()))

    # 형용사는 우리말이 활용을 해서, 해석문이 없는 문항에서만 바꾼다.
    sentences = list(working["body"]) + [c["text"] for c in working["choices"]]
    if english_only.usable(sentences):
        forms, moved_forms = english_only.plan(
            [t for _, t in fields(working)], report["locked"], rng,
            visible=sentences)
        if forms:
            shape = english_only.pattern_for(forms)

            def swap_forms(piece):
                return shape.sub(lambda m: forms[m.group(0)], piece)

            changed = {key: substitute(text, keep_glued(swap_forms))
                       for key, text in fields(working)}
            working = dict(working, **rebuild(working, changed))
            table.update(forms)
            applied.append("형용사 "
                           + ", ".join("%s→%s" % kv for kv in moved_forms.items()))

    numbers = plan_numbers(working, report, rng)
    if numbers:
        working = dict(working, **rebuild(working, apply_map(working, numbers)))
        table.update(numbers)
        applied.append("숫자 " + ", ".join("%s→%s" % kv for kv in numbers.items()))

    if can_shuffle(working):
        moved, answer, order = shuffle_choices(working, rng, want)
        working = dict(working, choices=moved, answer=answer)
        applied.append("선택지 " + "".join(str(i + 1) for i in order))

    if not applied:
        return None, [], ["바꿀 수 있는 곳이 없다"]

    variant = {
        "prompt": working["prompt"],
        "body": list(working["body"]),
        "choices": [dict(c) for c in working["choices"]],
        "answer": working["answer"],
        "explanation": working["explanation"],
    }
    variant["table"] = table
    variant["flipped"] = flipped
    return variant, applied, validate(question, variant)

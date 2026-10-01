# -*- coding: utf-8 -*-
"""Time for Grammar(YBM) 단원을 문법 은행 목차로 보낸다.

Basic 은 중1, Intermediate 는 중2, Advanced 는 중3, Expert 는 고등 과정이다.
단원 이름이 영어라 이름으로 찾는다.

손봐야 하는 자리가 둘 있다.
  · 한 단원에 두 갈래를 묶어 놓은 데 — 「To-Infinitives & Gerunds」,
    「Adjectives & Adverbs」, 「Subjunctive Mood & Sentence Arrangement」.
    문항의 말씨를 보고 가른다. 어느 쪽인지 가릴 자국이 없으면 넣지 않는다.
  · 은행 목차의 중3·고등에는 「문장의 형식」이 없다 — 공식 목차가 그렇다.
    Advanced·Expert 의 「Sentence Patterns」(1~5형식, 감각동사, 수여동사)는
    갈래가 맞는 중2 1단원으로 보낸다. 난이도는 적재 뒤 다시 매기므로,
    같은 단원 안에서도 어려운 문항으로 가려 쓸 수 있다.
"""
import re

LEVEL = {"Basic": 1, "Intermediate": 2, "Advanced": 3, "Expert": 4}

MAP = {
    # ── Basic → 중1 ──
    (1, "Personal Pronouns & Be Verbs"): (1, 1, "be동사"),
    (1, "General Verbs"): (1, 2, "일반동사"),
    (1, "Verb Tense"): (1, 3, "동사의 시제"),
    (1, "Modal Verbs"): (1, 4, "조동사"),
    (1, "Verbs & Sentence Patterns"): (1, 7, "문장의 형식"),
    (1, "Sentence Types"): (1, 8, "다양한 문장의 형태"),
    (1, "Nouns & Articles"): (1, 5, "명사와 관사"),
    (1, "Pronouns"): (1, 6, "대명사"),
    (1, "Adjectives & Adverbs"): (1, 9, "형용사와 부사"),
    (1, "To-Infinitives & Gerunds"): (1, 10, "to부정사"),
    (1, "Prepositions"): (1, 14, "전치사"),
    (1, "Conjunctions"): (1, 13, "접속사"),
    # ── Intermediate → 중2 ──
    (2, "Verbs & Sentence Patterns"): (2, 1, "문장의 형식"),
    (2, "To-infinitives"): (2, 3, "부정사[1]"),
    (2, "Gerunds"): (2, 5, "동명사"),
    (2, "Participles"): (2, 6, "분사"),
    (2, "Tenses"): (2, 2, "시제"),
    (2, "Modal Verbs"): (2, 7, "조동사"),
    (2, "Pronouns"): (2, 12, "대명사와 수일치"),
    (2, "Comparison"): (2, 11, "비교구문"),
    (2, "Conjunctions"): (2, 14, "접속사[1]"),
    (2, "Relative Pronouns"): (2, 8, "관계사"),
    (2, "Passive Voice"): (2, 9, "수동태와 능동태"),
    (2, "Subjunctive Mood & Sentence Arrangement"): (2, 10, "가정법"),
    # ── Advanced → 중3 ──
    (3, "Sentence Patterns"): (2, 1, "문장의 형식"),
    (3, "To-infinitives"): (3, 1, "부정사"),
    (3, "Gerunds"): (3, 2, "동명사"),
    (3, "Participles"): (3, 10, "분사구문"),
    (3, "Perfect Tenses"): (3, 3, "완료시제"),
    (3, "Modals"): (3, 4, "조동사"),
    (3, "Passive Voice"): (3, 5, "수동태"),
    (3, "Subjunctive Mood"): (3, 7, "가정법"),
    (3, "Relatives"): (3, 6, "관계사"),
    (3, "Comparison"): (3, 8, "비교구문"),
    (3, "Conjunctions"): (3, 9, "접속사"),
    (3, "Agreement & Narration"): (3, 11, "일치와 화법"),
    # ── Expert → 고등 ──
    (4, "Sentence Patterns"): (2, 1, "문장의 형식"),
    (4, "Perfect Aspect"): (4, 2, "시제"),
    (4, "Modals"): (4, 3, "조동사"),
    (4, "Passives"): (4, 4, "수동태"),
    (4, "To-infinitives"): (4, 5, "부정사"),
    (4, "Gerunds"): (4, 6, "동명사"),
    (4, "Participles"): (4, 7, "분사"),
    (4, "Comparisons"): (4, 11, "비교"),
    (4, "Conjunctions"): (4, 8, "접속사"),
    (4, "Relatives"): (4, 10, "관계사"),
    (4, "Subjunctive Mood"): (4, 9, "가정법"),
    (4, "Agreement & Narration"): (4, 1, "일치, 화법"),
    (4, "Sentence Arrangement"): (4, 12, "특수구문"),
}

# 「-est」로 끝나지만 최상급이 아닌 말 — 이것만 걸러도 최상급을 가릴 수 있다
NOT_TOP = {
    "rest", "test", "west", "best", "guest", "honest", "forest", "interest",
    "request", "suggest", "protest", "contest", "invest", "harvest", "modest",
    "nest", "pest", "quest", "arrest", "earnest", "vest", "chest", "priest",
    "dishonest", "conquest", "digest", "ingest", "manifest", "latest", "dest",
}


def _has(pattern, flags=re.I):
    want = re.compile(pattern, flags)
    return lambda said: bool(want.search(said))


def _superlative(said):
    """최상급 꼴이 들었는가 — the hardest·heaviest 처럼 keyword 없이 나온다"""
    for word in re.findall(r"[A-Za-z]{4,}est\b", said):
        if word.lower() not in NOT_TOP:
            return True
    return False


_COMPARE = [
    _has(r"comparative|superlative|비교급|최상급|원급"),
    _has(r"\bthan\b"),
    _has(r"\bas\s+[A-Za-z]+\s+as\b"),
    _has(r"\b(?:more|most|less|least|better|worse|worst)\b"),
    _superlative,
]


def _is_compare(said):
    return any(f(said) for f in _COMPARE)


# 묶음 단원 — 앞에서부터 들어맞는 첫 규칙으로 보낸다.
# 규칙에 하나도 걸리지 않으면 None(넣지 않는다)이거나 MAP 의 기본 자리로 간다.
SPLIT = {
    (1, "To-Infinitives & Gerunds"): [
        (_has(r"to-?infinitive|to부정사"), (1, 10, "to부정사")),
        (_has(r"gerund|동명사"), (1, 11, "동명사")),
        (_has(r"\bto\s+[a-z]{2,}"), (1, 10, "to부정사")),
        (_has(r"[a-z]{3,}ing\b"), (1, 11, "동명사")),
    ],
    (1, "Adjectives & Adverbs"): [
        (_is_compare, (1, 12, "비교구문")),
    ],
    # 가정법과 특수구문(도치·동격)·접속사를 한 단원에 묶어 놓았다.
    # 「If」·도치를 이끄는 말은 대문자로만 본다 — 쪽에 섞여 들어온 단원 이름
    # (Subjunctive Mood)이나 문장 가운데의 never 에 걸리지 않게 한다.
    (2, "Subjunctive Mood & Sentence Arrangement"): [
        (_has(r"\bIf\b|\bwish\b|가정법", 0), (2, 10, "가정법")),
        (_has(r"\b(?:Never|Hardly|Rarely|Seldom|Nowhere|Nothing|Only then)\b", 0),
         (3, 12, "특수구문")),
        (_has(r"neither|\bnor\b|\bboth\b|not only|\beither\b|상관접속사"),
         (2, 14, "접속사[1]")),
        (_has(r"\b(?:fact|news|idea|rumor|chance|promise|plan|thought|hope|way|"
              r"possibility)\s+(?:that|of)\b|동격"), (3, 12, "특수구문")),
    ],
}

# 가름 규칙이 하나도 안 걸리면 넣지 않는 단원 — 기본 자리로 보내면 엉뚱해진다
NO_FALLBACK = {(2, "Subjunctive Mood & Sentence Arrangement")}


def level_of(book):
    for key, lv in LEVEL.items():
        if key.lower() in str(book).lower():
            return lv
    return None


def place(book, chapter, said=None):
    """said 에는 발문·본문·답만 넣는다 — 단원 이름을 섞으면 그 이름이 규칙에 걸린다"""
    lv = level_of(book)
    if lv is None or not chapter:
        return None
    name = str(chapter).strip()
    rules = SPLIT.get((lv, name))
    if rules:
        text = str(said or "")
        for check, spot in rules:
            if check(text):
                return spot
        if (lv, name) in NO_FALLBACK:
            return None
    return MAP.get((lv, name))

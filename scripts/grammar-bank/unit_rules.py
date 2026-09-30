# -*- coding: utf-8 -*-
"""문제를 보고 어느 세부 단원인지 가린다.

선생님 결정(2026-09-30): 세부가 비어 있는 문항은 문제를 보고 확인해서 넣는다.

바깥 서비스는 부르지 않는다. 문항의 발문·본문·보기·답에 남는 자국으로만 가린다.
확실하지 않으면 붙이지 않는다 — 틀리게 붙는 것보다 비어 있는 편이 낫다.

  from unit_rules import guess
  guess(level, chapter, question)  → 세부 이름 또는 None
"""
import re

# 「밑줄 친 부분과 쓰임이 같은[다른] 것은?」 — 보기는 일부러 다른 쓰임을 늘어놓은 것이라
# 함께 보면 엉뚱한 데로 샌다. 이런 문항은 본문만 본다.
SAME_USE = re.compile(r"쓰임이\s*(같은|다른)|용법이\s*(같은|다른)|나머지\s*넷과")


def flatten(q):
    """문항 하나를 한 덩이 글로 편다"""
    prompt = str(q.get("prompt") or "")
    body = [str(b) for b in (q.get("body") or [])]
    if SAME_USE.search(prompt) and any(b.strip() for b in body):
        return re.sub(r"\s+", " ", " ".join(body))
    bits = [prompt] + body
    bits += [str(c.get("text") or "") for c in (q.get("choices") or [])]
    bits.append(str(q.get("answer") or ""))
    return re.sub(r"\s+", " ", " ".join(bits))


V = r"[a-z]+"          # 동사로 볼 만한 낱말
TO = r"\bto\s+" + V


def has(text, *pats):
    return any(re.search(p, text, re.I) for p in pats)


# ── 부정사 ──────────────────────────────────────────────────────────
# 주요 구문이 가장 좁으므로 먼저 본다. 그 다음 형용사적(명사 뒤), 명사적(동사·보어),
# 마지막으로 부사적(나머지 목적·이유). 좁은 것부터 보아야 엉뚱한 데로 새지 않는다.
INF_MAIN = [
    r"\btoo\s+\w+\s+to\s+" + V,
    r"\benough\s+to\s+" + V,
    r"\bin\s+order\s+(to|not\s+to)\s+" + V,
    r"\bso\s+as\s+to\s+" + V,
    r"\bIt\s+takes\s+.{0,20}\s+to\s+" + V,
    r"너무\s*\S*\s*해서|하기에 충분|하기 위해서|~하기에 충분",
]
INF_ADJ = [
    r"\b(something|anything|nothing|everything)\s+(\w+\s+)?to\s+" + V,
    r"\b(a|an|the|some|many|much)\s+\w+(s)?\s+to\s+" + V,
    r"\b(time|way|place|chance|reason|plan|book|water|friend|money|work)\s+to\s+" + V,
    r"형용사적",
]
INF_NOUN = [
    r"\b(want|hope|plan|decide|need|promise|expect|refuse|wish|agree|choose|"
    r"learn|begin|start|forget|remember|try|would like|fail|manage|pretend)\s+(not\s+)?to\s+" + V,
    r"\b(is|are|was|were|am)\s+to\s+" + V,
    r"\bIt\s+(is|was)\s+\w+\s+(for|of)\s+\w+\s+to\s+" + V,
    r"\bIt\s+(is|was)\s+\w+\s+to\s+" + V,
    r"\b(how|what|where|when|which|whether)\s+to\s+" + V,
    r"명사적",
]
INF_ADV = [
    r"\bto\s+" + V + r"\b.{0,40}(그래서|때문에|위해|하려고)",
    r"부사적",
]
# 「have to visit」를 「have + 목적어 + 원형」으로 잘못 보면 안 된다.
# 가운데 말이 사람·사물을 가리킬 때만 목적격보어로 본다.
WHO = (r"(me|him|her|us|them|you|it|the\s+\w+|my\s+\w+|his\s+\w+|her\s+\w+|"
       r"[A-Z][a-z]+)")
INF_ROOT = [
    r"\b(make|makes|made|let|lets|help|helps|helped|see|saw|watch|watched|hear|heard|"
    r"feel|felt|notice|noticed)\s+" + WHO + r"\s+[a-z]+\b",
    r"\b(had|has|have)\s+" + WHO + r"\s+(?!to\b)[a-z]+\b",
    r"원형부정사|목적격보어",
]


def infinitive(text, allow):
    for name, pats in (
        ("주요 구문", INF_MAIN),
        ("목적격보어와 원형부정사", INF_ROOT),
        ("형용사적 용법", INF_ADJ),
        ("명사적 용법", INF_NOUN),
        ("부사적 용법", INF_ADV),
    ):
        if name in allow and has(text, *pats):
            return name
    return None


# ── 동명사 ──────────────────────────────────────────────────────────
GER_IDIOM = [
    r"\b(be\s+)?(busy|worth)\s+\w+ing\b",
    r"\bcan'?t\s+help\s+\w+ing\b",
    r"\bfeel\s+like\s+\w+ing\b",
    r"\bgo\s+\w+ing\b",
    r"\bhow\s+about\s+\w+ing\b",
    r"\blook\s+forward\s+to\s+\w+ing\b",
    r"\bspend\s+.{0,16}\s+\w+ing\b",
    r"\bit\s+is\s+no\s+use\s+\w+ing\b",
    r"관용",
]
GER_BOTH = [
    r"\b(remember|forget|try|stop|regret)\s+(to\s+\w+|\w+ing)\b",
    r"\b(like|love|hate|begin|start|continue)\s+(to\s+\w+|\w+ing)\b",
    r"동명사와 to부정사|to부정사와 동명사",
]
GER_USE = [
    r"\b(enjoy|finish|mind|avoid|keep|give up|practice|suggest|quit|deny|admit)\s+\w+ing\b",
    r"\b(is|are|was|were)\s+\w+ing\b.{0,30}\b(hobby|dream|job)\b",
    r"\bby\s+\w+ing\b|\bwithout\s+\w+ing\b|\bafter\s+\w+ing\b|\bbefore\s+\w+ing\b",
    r"동명사",
]


def gerund(text, allow):
    for name, pats in (
        ("동명사의 관용 표현", GER_IDIOM),
        ("동명사와 to부정사", GER_BOTH),
        ("동명사의 쓰임", GER_USE),
    ):
        if name in allow and has(text, *pats):
            return name
    return None


# ── 비교 ────────────────────────────────────────────────────────────
CMP_MAIN = [
    r"\bthe\s+(\w+er|more|less)\b.{0,34}\bthe\s+(\w+er|more|less)\b",
    r"\b\w+er\s+and\s+\w+er\b",
    r"\bmore\s+and\s+more\b",
    r"\bone\s+of\s+the\s+\w+est\b",
    r"\bno\s+other\b|\bnothing\s+is\s+(more|as)\b",
    r"\btwice\s+as\b|\b\w+\s+times\s+as\b|\b\d+\s+times\s+\w*(er|more)\b",
    r"주요 구문",
]
CMP_SUP = [r"\b(the\s+)?\w+est\b", r"\bthe\s+most\s+\w+\b", r"최상급"]
CMP_CMP = [r"\b\w+er\s+than\b", r"\bmore\s+\w+\s+than\b", r"\bless\s+\w+\s+than\b", r"비교급"]
CMP_EQ = [r"\bas\s+\w+\s+as\b", r"\bnot\s+so\s+\w+\s+as\b", r"원급"]


def compare(text, allow):
    for name, pats in (
        ("주요 구문", CMP_MAIN),
        ("원급 비교", CMP_EQ),
        ("비교급 비교", CMP_CMP),
        ("최상급 비교", CMP_SUP),
        ("원급", CMP_EQ),
        ("비교급", CMP_CMP),
        ("최상급", CMP_SUP),
    ):
        if name in allow and has(text, *pats):
            return name
    return None


# ── 관계사 ──────────────────────────────────────────────────────────
REL_ADV = [r"\b(where|when|why|how)\b.{0,40}\b(place|time|reason|way)\b", r"관계부사",
           r"\bthe\s+(place|time|reason|way)\s+(where|when|why|how)\b"]
REL_CONT = [r",\s*(who|which|whose|where|when)\b", r"계속적 용법"]
REL_PRON = [r"\b(who|whom|whose|which|that)\b", r"관계대명사"]


def relative(text, allow):
    for name, pats in (
        ("관계부사", REL_ADV),
        ("관계대명사의 계속적 용법", REL_CONT),
        ("관계대명사", REL_PRON),
    ):
        if name in allow and has(text, *pats):
            return name
    return None


# ── 수동태 ──────────────────────────────────────────────────────────
# by 가 아닌 전치사를 쓰는 굳어진 수동태만 여기로 본다
PAS_SPECIAL = [
    r"\b(is|are|was|were|be|been)\s+"
    r"(known|filled|covered|made|interested|surprised|satisfied|worried|"
    r"crowded|tired|excited|disappointed|pleased)\s+"
    r"(as|to|with|of|in|at|about|for)\b",
]
PAS_CARE = [
    r"\bwas\s+\w+ed\s+to\s+\w+", r"\bbe\s+p\.?p\.?\b", r"주의할 수동태",
    r"\b(is|are|was|were)\s+being\s+\w+ed\b", r"\bhas\s+been\s+\w+ed\b",
]
PAS_NEG = [r"\b(is|are|was|were)\s+not\s+\w+ed\b", r"^\s*(Is|Are|Was|Were)\s+\w+\s+\w+ed\b",
           r"부정문|의문문"]
PAS_FORM = [r"\b(is|are|was|were|be)\s+\w+(ed|en)\b\s*(by\b)?", r"수동태"]


def passive(text, allow):
    for name, pats in (
        ("다양한 수동태 표현", PAS_SPECIAL),
        ("수동태의 부정문과 의문문", PAS_NEG),
        ("주의할 수동태", PAS_CARE),
        ("수동태의 형태와 시제", PAS_FORM),
        ("수동태의 형태", PAS_FORM),
    ):
        if name in allow and has(text, *pats):
            return name
    return None


# ── 가정법 ──────────────────────────────────────────────────────────
SUB_WISH = [r"\bI\s+wish\b", r"\bas\s+if\b", r"\bwithout\b|\bbut\s+for\b", r"I wish|as if"]
SUB_BASE = [r"\bif\s+.{0,30}\b(were|had|would|could|should)\b", r"가정법 과거|가정법 과거완료"]
SUB_CARE = [r"\bhad\s+it\s+not\s+been\b", r"\bwere\s+it\s+not\b", r"\bit\s+is\s+time\b", r"주의할 가정법"]


def subjunctive(text, allow):
    for name, pats in (
        ("I wish·as if·without 가정법", SUB_WISH),
        ("주의할 가정법", SUB_CARE),
        ("가정법 과거·과거완료", SUB_BASE),
    ):
        if name in allow and has(text, *pats):
            return name
    return None


# ── 분사 ────────────────────────────────────────────────────────────
PART_CARE = [
    r"\b(bored|boring|excited|exciting|interested|interesting|surprised|surprising|"
    r"tired|tiring|amazed|amazing|shocked|shocking|satisfied|satisfying|confused|confusing)\b",
    r"감정을 나타내는|주의해야 할 분사",
]
# 「Studying hard, I …」처럼 문장 첫머리에 오는 분사 — 글 전체의 첫머리가 아니다
PART_CLAUSE = [
    r"(^|[.!?…]\s+|/\s*|\[\[)\s*[A-Za-z]\w*ing\b[^,]{0,34},\s*[A-Za-z]",
    r"\bhaving\s+\w+(ed|en)\b",
    r"\b(being|not\s+being)\s+\w+(ed|en)\b",
    r"분사구문",
]
PART_USE = [r"\b\w+ing\s+\w+\b", r"\b\w+(ed|en)\s+(by|in|at)\b", r"분사"]


def participle(text, allow):
    for name, pats in (
        ("주의해야 할 분사", PART_CARE),
        ("주의해야 할 분사구문", PART_CLAUSE),
        ("분사구문", PART_CLAUSE),
        ("분사의 쓰임", PART_USE),
    ):
        if name in allow and has(text, *pats):
            return name
    return None


# ── 조동사 ──────────────────────────────────────────────────────────
MOD_HAVE = [r"\b(must|should|may|might|could|can'?t)\s+have\s+\w+(ed|en)\b", r"have p\.?p\.?"]
MOD_DUTY = [r"\b(must|have\s+to|has\s+to|had\s+to|should|ought\s+to|had\s+better|used\s+to)\b"]
MOD_CAN = [r"\b(can|could|may|might|will|would)\b"]


def modal(text, allow):
    for name, pats in (
        ("조동사+have p.p.", MOD_HAVE),
        ("must/should/had better/used to", MOD_DUTY),
        ("must/have to/should", MOD_DUTY),
        ("had better/would like to/used to", [r"\b(had\s+better|would\s+like\s+to|used\s+to)\b"]),
        ("can/may/will", MOD_CAN),
        ("can/may", MOD_CAN),
    ):
        if name in allow and has(text, *pats):
            return name
    return None


# ── 단원마다 어느 가림법을 쓸지
PICKERS = {
    "to부정사": infinitive, "부정사": infinitive, "부정사[1]": infinitive, "부정사[2]": infinitive,
    "동명사": gerund,
    "비교구문": compare, "비교": compare,
    "관계사": relative,
    "수동태": passive, "수동태와 능동태": passive,
    "가정법": subjunctive,
    "분사": participle, "분사구문": participle,
    "조동사": modal,
}


def guess(level, chapter, question, allow):
    """이 문항의 세부 단원 — 가릴 수 없으면 None.

    allow 는 그 단원에서 쓸 수 있는 세부 이름들이다. 표에 없는 이름은 내놓지 않는다.
    """
    pick = PICKERS.get(chapter)
    if not pick or not allow:
        return None
    return pick(flatten(question), set(allow))

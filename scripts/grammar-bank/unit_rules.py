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
    """문항 하나를 한 덩이 글로 편다.

    보기는 일부러 틀린 것을 섞어 둔 자리다. 본문이 있으면 본문으로 가리고,
    본문이 없는 문항(보기만 늘어놓은 것)에서만 보기를 본다.
    """
    prompt = str(q.get("prompt") or "")
    body = [str(b) for b in (q.get("body") or []) if str(b).strip()]
    picks = [str(c.get("text") or "") for c in (q.get("choices") or [])]
    answer = str(q.get("answer") or "")
    if body:
        if SAME_USE.search(prompt):
            return re.sub(r"\s+", " ", " ".join(body))
        # 보기가 없는 서술형은 답이 곧 문법이 드러나는 자리다 — 함께 본다.
        # 보기가 있는 문항의 답은 번호뿐이라 보태도 얻을 것이 없다.
        tail = [answer] if not picks else []
        return re.sub(r"\s+", " ", " ".join([prompt] + body + tail))
    return re.sub(r"\s+", " ", " ".join([prompt] + picks + [answer]))


V = r"[a-z]+"          # 동사로 볼 만한 낱말
TO = r"\bto\s+" + V


def has(text, *pats):
    return any(re.search(p, text, re.I) for p in pats)


# ── 부정사 ──────────────────────────────────────────────────────────
# 주요 구문이 가장 좁으므로 먼저 본다. 그 다음 형용사적(명사 뒤), 명사적(동사·보어),
# 마지막으로 부사적(나머지 목적·이유). 좁은 것부터 보아야 엉뚱한 데로 새지 않는다.
INF_MAIN = [
    r"\btoo\s+\w+\s+(for\s+\w+\s+)?to\s+" + V,
    r"\benough\s+(for\s+\w+\s+)?to\s+" + V,
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
    # ask/allow/tell + 목적어 + to부정사 도 목적격보어 자리다
    r"\b(ask|asked|tell|told|allow|allowed|advise|advised|order|ordered|want|wanted|"
    r"expect|expected|encourage|encouraged|force|forced|get|got|enable|enabled)\s+"
    + WHO + r"\s+(to\s+)?[a-z]+\b",
    r"원형부정사|목적격보어",
]


# to부정사 바로 앞에 오는 말로 쓰임을 가른다
TO_VERB = (r"(want|hope|plan|decide|need|promise|expect|refuse|wish|agree|choose|learn|"
           r"begin|start|forget|remember|try|like|love|hate|fail|manage|pretend|"
           r"seem|appear|happen|tend|offer|prepare|arrange|care|deserve|intend|come|go)"
           r"(s|es|ed|d|ing|ning|nt|ame)?")
FEEL_ADJ = (r"glad|happy|sad|sorry|surprised|shocked|pleased|delighted|angry|"
            r"excited|lucky|proud|afraid|ready|willing|eager|thirsty|anxious")
NOUNY = (r"something|anything|nothing|everything|someone|anyone|people|time|way|place|"
         r"chance|reason|plan|book|books|water|friend|friends|money|work|homework|"
         r"thing|things|one|ones|classmates|places|gloves|dress|crayon")

MARKED = re.compile(r"\[\[\s*(?:to\s+\w+|to)\s*\]\]")


def infinitive_use(text):
    """to부정사 하나를 집어 그 앞말로 쓰임을 가린다.

    밑줄이 쳐져 있으면 그 자리를 본다. 문항이 묻는 곳이 거기이기 때문이다.
    """
    # 가주어·가목적어 it 은 뒤의 to부정사가 참주어·참목적어다 — 명사적 쓰임
    if re.search(r"\bit\s+(is|was|seems|isn't|wasn't)\s+\w+\s+(for\s+\w+\s+)?to\s+[a-z]+",
                 text, re.I):
        return "명사적 용법"
    if re.search(r"\b(found|find|finds|make|makes|made|think|thought|consider|considers)\s+"
                 r"it\s+\w+\s+to\s+[a-z]+", text, re.I):
        return "명사적 용법"
    spot = MARKED.search(text)
    if spot:
        before = text[: spot.start()]
    else:
        hit = re.search(r"\bto\s+[a-z]+", text)
        if not hit:
            return None
        before = text[: hit.start()]
    tail = re.sub(r"[^A-Za-z'\s]", " ", before).split()
    if not tail:
        return "명사적 용법"          # 문장 첫머리의 To부정사 — 주어
    last = tail[-1].lower()
    if re.fullmatch(FEEL_ADJ, last):
        return "부사적 용법"
    if re.fullmatch(r"is|are|was|were|am|be|been", last):
        return "명사적 용법"
    if re.fullmatch(TO_VERB, last):
        return "명사적 용법"
    if re.fullmatch(r"how|what|where|when|which|whether|who", last):
        return "명사적 용법"
    if re.fullmatch(NOUNY, last) or re.fullmatch(r"\w+s", last):
        return "형용사적 용법"
    if re.fullmatch(r"a|an|the|my|your|his|her|our|their|some|many|much|no|one|two", last):
        return "형용사적 용법"
    # 앞이 온전한 문장이면 목적·이유를 나타내는 부사적 쓰임이다
    if len(tail) >= 3:
        return "부사적 용법"
    return None


def infinitive(text, allow):
    for name, pats in (
        ("주요 구문", INF_MAIN),
        ("목적격보어와 원형부정사", INF_ROOT),
    ):
        if name in allow and has(text, *pats):
            return name
    for name, pats in (
        ("형용사적 용법", INF_ADJ),
        ("명사적 용법", INF_NOUN),
        ("부사적 용법", INF_ADV),
    ):
        if name in allow and has(text, *pats):
            return name
    got = infinitive_use(text)
    return got if got in allow else None


# ── 동명사 ──────────────────────────────────────────────────────────
GER_IDIOM = [
    r"\b(be\s+)?(busy|worth)\s+\w+ing\b",
    r"\bcan['’]?t\s+help\s+\w+ing\b",
    r"\bfeel\s+like\s+\w+ing\b",
    r"\bgo\s+\w+ing\b",
    r"\bhow\s+about\s+\w+ing\b",
    r"\blook(ing)?\s+forward\s+to\b",
    r"\bspend\s+.{0,16}\s+\w+ing\b",
    r"\bit\s+is\s+no\s+use\s+\w+ing\b",
    # 전치사를 데리고 다니는 굳은 표현 — 뒤에는 동명사가 온다
    r"\b(is|are|was|were|am|be)\s+"
    r"(good|bad|fond|afraid|interested|tired|proud|capable|ashamed|aware|sure|"
    r"worried|used|accustomed|busy|sorry)\s+(at|of|in|about|for|to|with)\b",
    r"\b(object|devote|contribute|be\s+opposed)\s+to\b",
    r"\bin\s+addition\s+to\b|\bwhat\s+about\b",
    r"관용",
]
# 이 갈래는 to부정사와 동명사를 견주는 자리다. 한쪽만 있으면 그냥 쓰임이다.
GER_BOTH = [
    r"\b(remember|forget|try|stop|regret|remembered|forgot|tried|stopped|regretted|"
    r"remembers|forgets)\b[^.]{0,20}(to\s+\w+|\w+ing)\b",
    r"\[[^\]]*\bto\s+\w+[^\]]*/[^\]]*\w+ing[^\]]*\]",
    r"\[[^\]]*\w+ing[^\]]*/[^\]]*\bto\s+\w+[^\]]*\]",
    r"\bto\s+\w+\b.{0,40}\b\w+ing\b.{0,20}(고르|알맞은|같은)",
    # 같은 동사가 두 꼴을 다 데리고 나온다 (「loves watching → loves to watch」)
    r"\b(like|love|hate|begin|start|continue|prefer)s?\s+\w+ing\b.{0,60}"
    r"\b(like|love|hate|begin|start|continue|prefer)s?\s+to\b",
    # to부정사만 받는 동사 — 동명사와 갈라 쓰는 자리다
    r"\b(refuse|decide|hope|plan|promise|expect|agree|wish|choose|manage|afford)s?\b"
    r".{0,24}\bto\s+\w+",
    r"동명사와 to부정사|to부정사와 동명사",
]
GER_USE = [
    # 동명사만 받는 동사 — 뒤가 빈칸이거나 틀린 꼴이어도 이 갈래다
    r"\b(enjoy|finish|mind|avoid|keep|give\s+up|practice|suggest|quit|deny|admit|"
    r"consider|postpone|put\s+off|imagine|escape|delay)s?\b",
    r"\b(is|are|was|were)\s+\w+ing\b.{0,30}\b(hobby|dream|job)\b",
    r"\bby\s+\w+ing\b|\bwithout\s+\w+ing\b|\bafter\s+\w+ing\b|\bbefore\s+\w+ing\b",
    r"동명사",
]


def gerund(text, allow):
    for name, pats in (
        ("동명사의 관용 표현", GER_IDIOM + [r"\bhave\s+(difficulty|trouble|a\s+hard\s+time)\b"]),
        ("동명사와 to부정사", GER_BOTH),
        ("동명사의 쓰임", GER_USE),
    ):
        if name in allow and has(text, *pats):
            return name
    # 빈칸이 있는 문항 — 빈칸 뒤에 무엇이 오는지로 가른다
    if "동명사와 to부정사" in allow and re.search(r"_{3,}\s*to\s+[a-z]+", text):
        return "동명사와 to부정사"
    if "동명사와 to부정사" in allow and re.search(
            r"\b(like|love|hate|likes|loves|hates|begin|start|prefer)s?\s*_{3,}", text):
        return "동명사와 to부정사"
    if "동명사의 쓰임" in allow:
        if re.search(r"_{3,}\s*\w+ing\b", text):
            return "동명사의 쓰임"
        # 동명사 주어 뒤에 동사 자리가 빈칸인 꼴
        if re.search(r"(^|[.!?/]\s*)[A-Z]\w*ing\b[^.!?]{0,40}_{3,}", text):
            return "동명사의 쓰임"
        # 문장 첫머리의 동명사 주어 — 「Getting up early is …」
        if re.search(r"(^|[.!?/]\s*)[A-Z]\w*ing\b[^.!?]{0,40}\b(is|was|are|were)\b", text):
            return "동명사의 쓰임"
    return None


# ── 비교 ────────────────────────────────────────────────────────────
CMP_MAIN = [
    r"\bthe\s+(\w+er|more|less)\b.{0,34}\bthe\s+(\w+er|more|less)\b",
    r"\b\w+er\s+and\s+\w+er\b",
    r"\bmore\s+and\s+more\b",
    r"\bone\s+of\s+(the\s+)?(\w+est|most\s+\w+|_{3,}|\(\w\))",
    r"\bthe\s+(\w+er|more|less)\b.{0,48}(\bthe\s+)?(_{3,}|\(\w\))",
    r"\bno\s+other\b|\bnothing\s+is\s+(more|as)\b",
    r"\btwice\s+as\b|\b\w+\s+times\s+as\b|\b\d+\s+times\s+\w*(er|more)\b",
    r"주요 구문",
]
CMP_SUP = [r"\b(the\s+)?\w+est\b", r"\bthe\s+most\s+\w+\b", r"최상급"]
CMP_CMP = [r"\b\w+er\s+than\b", r"\bmore\s+\w+\s+than\b", r"\bless\s+\w+\s+than\b", r"비교급"]
CMP_EQ = [
    r"\bas\s+\w+\s+as\b", r"\bnot\s+so\s+\w+\s+as\b", r"원급",
    r"\bthe\s+same\b.{0,30}\bas\b", r"\bsame\b.{0,20}(_{3,}|\(\s*\w\s*\))",
    r"와 같은|과 같은|만큼",
]


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
BLANK = r"(_{3,}|\(\s*\w\s*\)_*|\[\[[^\]]*\]\])"
REL_ADV = [
    r"\b(where|when|why|how)\b.{0,40}\b(place|time|reason|way)\b", r"관계부사",
    r"\bthe\s+(place|time|reason|way)\s+(where|when|why|how)\b",
    # 빈칸 앞이 곳·때를 가리키는 말이면 관계부사 자리다
    r"\b(place|time|reason|way|day|year|city|town|house|school|room|moment)s?\s*" + BLANK,
]
REL_CONT = [
    r",\s*(who|which|whose|where|when)\b", r"계속적 용법",
    # 쉼표 뒤 빈칸에 이어 주어·동사가 오는 자리
    r",\s*" + BLANK + r"\s*(we|they|he|she|I|you|it|[A-Z][a-z]+)\b",
]
REL_PRON = [
    r"\b(who|whom|whose|which|that)\b", r"관계대명사",
    # 명사 뒤 빈칸에 이어 절이 오는 자리
    r"\b\w+\s*" + BLANK + r"\s*(we|they|he|she|I|you|it|is|are|was|were|has|have|can)\b",
]


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
    # 「is said to ~」처럼 that절을 받아 넘긴 수동태
    r"\b(is|are|was|were)\s+(said|believed|thought|reported|expected|supposed)\s+to\b",
    # 전치사가 빈칸인 굳은 수동태 — 「covered ___ snow」
    r"\b(known|filled|covered|made|interested|surprised|satisfied|worried|crowded|"
    r"tired|excited|disappointed|pleased)\s*(_{3,}|\(\s*\w\s*\)_*)",
]
PAS_CARE = [
    r"\bwas\s+\w+ed\s+to\s+\w+", r"\bbe\s+p\.?p\.?\b", r"주의할 수동태",
    r"\b(is|are|was|were)\s+being\s+\w+ed\b", r"\bhas\s+been\s+\w+ed\b",
]
PAS_NEG = [r"\b(is|are|was|were)\s+not\s+\w+ed\b", r"^\s*(Is|Are|Was|Were)\s+\w+\s+\w+ed\b",
           r"부정문|의문문"]
PAS_FORM = [
    r"\b(is|are|was|were|be)\s+\w+(ed|en)\b\s*(by\b)?", r"수동태",
    # 빈칸이 분사 자리인 꼴 — 「were felt (A)___ by Mike」
    r"\b(is|are|was|were|been|be)\s+\w*\s*(_{3,}|\(\s*\w\s*\)_*)",
    r"\b(had|has|have)\s+(_{3,}|\(\s*\w\s*\)_*)\s*\w*(ed|en)\b",
]


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
SUB_CARE = [
    r"\bhad\s+it\s+not\s+been\b", r"\bwere\s+it\s+not\b", r"\bit\s+is\s+time\b",
    # 단순 조건절(if + 현재, will)은 가정법과 갈라 써야 하는 자리다
    r"\bif\s+\w+\s+(\w+s|do|does|is|are|don['’]?t|doesn['’]?t)\b.{0,40}\bwill\b",
    r"\bif\s+.{0,30}\bwill\b",
    r"주의할 가정법",
]


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
PART_USE = [
    r"\b\w+ing\s+\w+\b", r"\b\w+(ed|en)\s+(by|in|at)\b", r"분사",
    # 명사 뒤에서 꾸미는 분사 — 「the photos [[taking]] in Africa」
    r"\b(the|a|an|my|his|her|their|our)\s+\w+\s*\[\[\s*\w+\s*\]\]",
    r"\b(is|are|was|were)\s+(an?|the)\s+\w+\s+\[\[",
    # 「(make, making, made)」처럼 세 꼴을 늘어놓고 고르게 하는 자리
    r"\(\s*\w+,\s*\w+ing,\s*\w+(ed|en)\s*\)",
]


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
MOD_HAVE = [
    r"\b(must|should|may|might|could|can['’]?t|cannot)\s+have\s+\w+(ed|en)\b",
    r"have p\.?p\.?",
    # 우리말 자국 — 「했어야 했다」·「했을 리가 없다」·「했을지도 모른다」
    r"했어야|했을 리가|했을지도|였음에 틀림없|했음에 틀림없",
]
MOD_DUTY = [
    r"\b(must|have\s+to|has\s+to|had\s+to|should|ought\s+to|had\s+better|used\s+to)\b",
    r"해야 한다|하는 게 좋|하곤 했|하지 않는 게 좋|의무|충고",
]
MOD_CAN = [
    r"\b(can|could|may|might|will|would|shall)\b",
    r"할 수 있|일 것이다|해도 좋|일지도 모른|허락|추측",
]


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


# ── 나머지 단원 — 좁은 것부터 차례로 본다
# (단원 이름) → [(세부 이름, 자국들), …]  먼저 걸리는 것이 임자다.
TABLE = {
    "be동사": [
        ("be동사의 부정문과 의문문",
         [r"\b(is|are|am|was|were)\s+not\b", r"\b(isn['’]?t|aren['’]?t|wasn['’]?t|weren['’]?t)\b",
          r"(^|[.?!/]\s*)(Is|Are|Am|Was|Were)\s+\w+"]),
        ("be동사의 긍정문", [r"\b(is|are|am|was|were)\b"]),
    ],
    "일반동사": [
        ("일반동사의 부정문과 의문문",
         [r"\b(do|does|did)\s+not\b", r"\b(don['’]?t|doesn['’]?t|didn['’]?t)\b",
          r"(^|[.?!/]\s*)(Do|Does|Did)\s+\w+"]),
        ("일반동사의 과거형",
         [r"\b(yesterday|last\s+\w+|ago)\b", r"어제|지난|과거형",
          r"\b(went|came|ate|saw|made|took|got|had|did|said|bought|wrote|found)\b"]),
        ("일반동사의 현재형", [r"\b(always|usually|often|every\s+day)\b", r"현재형", r"\w+s\b"]),
    ],
    "동사의 시제": [
        ("미래 표현",
         [r"\bwill\b", r"\b(is|are|am)\s+going\s+to\b", r"\b(tomorrow|next\s+\w+)\b", r"미래"]),
        ("현재진행형", [r"\b(is|are|am|was|were)\s+\w+ing\b", r"진행형",
                  r"\b(is|are|am)\s+_{3,}", r"\bdoing\b", r"하고 있|하는 중"]),
        ("시제의 판단", [r"판단|알맞은 시제|시제에 맞게"]),
        ("과거시제",
         [r"\b(yesterday|last\s+\w+|ago)\b", r"어제|지난",
          r"\b(was|were)\b", r"\b\w+ed\b"]),
    ],
    "시제": [
        ("현재완료", [r"\b(have|has)\s+(not\s+)?(been|\w+(ed|en))\b", r"현재완료",
                  r"\b(since|for)\s+\w+", r"\bever\b|\bnever\b|\byet\b|\balready\b"]),
        ("진행형", [r"\b(is|are|am|was|were)\s+\w+ing\b", r"진행형"]),
        ("여러 가지 시제", [r"\bwill\b|\bwas\b|\bwere\b|시제"]),
    ],
    "완료시제": [
        ("현재완료진행",
         [r"\b(have|has)\s+been\s+\w+ing\b", r"완료진행",
          # 「여덟 시간 전에 시작해서 아직도 하고 있다」 — 계속되는 일
          r"\bago\b.{0,60}\bstill\b", r"\bstill\b.{0,40}\bnow\b.{0,40}\bago\b"]),
        ("과거완료",
         [r"\bhad\s+(not\s+)?(been|\w+(ed|en))\b", r"과거완료", r"대과거",
          # 더 앞선 일을 가리키는 자국 — 빈칸이어도 already·before 가 남는다
          r"_{3,}\s+(eaten|been|seen|gone|done|finished|left|lost)\b",
          r"\b(realized|knew|found|said|thought)\b.{0,40}\b(already|before|previously)\b"]),
        ("현재완료",
         [r"\b(have|has)\s+(not\s+)?(been|\w+(ed|en))\b", r"현재완료",
          r"\b(since|for)\s+\w+", r"\b(ever|never|yet|already|just)\b"]),
    ],
    "명사와 관사": [
        # 「관사를 쓰시오」는 There is 문장을 예로 들기도 한다 — 발문을 먼저 본다
        ("관사", [r"관사", r"\[\s*(a|an|the|x)\s*/\s*(a|an|the|x)\b",
                r"\b(a|an|the)\s*[/·]\s*(a|an|the)\b"]),
        ("There is/are", [r"\bthere\s+(is|are|was|were)\b.{0,12}_{3,}",
                          r"_{3,}\s*(is|are|was|were)\b", r"There is|There are"]),
        ("명사의 수일치", [r"\b(is|are)\b.{0,24}\b(water|money|milk|bread|information|news)\b",
                    r"수일치"]),
        ("셀 수 있는 명사와 셀 수 없는 명사",
         [r"\b(many|much|a\s+few|a\s+little|some|any)\b", r"\b\w+(s|es|ies|ves)\b",
          r"셀 수 (있는|없는)"]),
    ],
    "대명사": [
        ("재귀대명사", [r"\b\w*(self|selves)\b", r"재귀"]),
        ("부정대명사", [r"\b(one|ones|some|any|another|the\s+other|others|each\s+other)\b", r"부정대명사"]),
        ("지시대명사와 it", [r"\b(this|that|these|those)\b", r"지시대명사"]),
        ("인칭대명사", [r"\b(I|my|me|mine|you|your|yours|he|his|him|she|her|hers|we|our|us|"
                   r"they|their|them|theirs)\b", r"인칭대명사"]),
    ],
    "대명사와 수일치": [
        ("재귀대명사", [r"\b\w*(self|selves)\b", r"재귀"]),
        ("수일치", [r"수일치|\b(each|every|either|neither|both|all|none)\s+of\b"]),
        ("부정대명사", [r"\b(one|ones|some|any|another|the\s+other|others|each\s+other)\b", r"부정대명사"]),
        ("대명사 it", [r"\bit\s+(is|was|takes)\b", r"비인칭"]),
    ],
    "문장의 형식": [
        ("주어+동사+목적어+목적격보어",
         [r"\b(make|makes|made|call|called|find|found|keep|kept|name|named|elect|leave|left|"
          r"have|has|had|let|lets|see|saw|watch|watched|hear|heard|feel|felt|notice|noticed)\s+"
          + WHO + r"\s+\w+",
          # 동사가 빈칸이어도 「목적어 + to부정사」 꼴이면 목적격보어다
          r"(_{3,}|\[\[[^\]]*\]\])\s*" + WHO + r"\s+to\s+[a-z]+",
          r"\b\w+\s+" + WHO + r"\s+\w+ing\b",
          # ask/tell/want + 목적어 + to부정사 도 목적격보어다
          r"\b(ask|asked|tell|told|want|wanted|allow|allowed|advise|advised|order|ordered|"
          r"expect|expected|encourage|encouraged|get|got)\s+" + WHO + r"\s+to\s+\w+",
          r"목적격보어"]),
        ("주어+동사+간접목적어+직접목적어",
         [r"\b(give|gave|send|sent|show|showed|buy|bought|make|made|teach|taught|tell|told|"
          r"lend|lent|write|wrote|ask|asked)\s+" + WHO + r"\s+(a|an|the|some|my|his|her)\b",
          r"\b(to|for|of)\s+(me|him|her|us|them|you)\b",
          # 전치사가 빈칸인 꼴 — 「gave it ___ me」
          r"(_{3,}|\[\[[^\]]*\]\])\s*(me|him|her|us|them|you)\b",
          r"간접목적어"]),
        ("주어+동사+보어",
         [r"\b(become|became|look|looks|looked|feel|felt|taste|tastes|sound|sounds|smell|"
          r"seem|seems|get|gets|turn|turns|stay|remain)\s+\w+", r"보어"]),
    ],
    "다양한 문장의 형태": [
        ("There is/are",
         [r"\bthere\s+(is|are|was|were|isn['’]?t|aren['’]?t)\b",
          r"\bThere\s+(_{3,}|\[\[|\(\w\))"]),
        ("부가의문문과 부정의문문",
         [r",\s*(isn['’]?t|aren['’]?t|wasn['’]?t|weren['’]?t|don['’]?t|doesn['’]?t|didn['’]?t|can['’]?t|won['’]?t|"
          r"is|are|do|does|did|can|will)\s+\w+\?", r"부가의문문|부정의문문",
          r",\s*(_{3,}|\[\[[^\]]*\]\])\s*\?"]),
        ("명령문과 감탄문",
         [r"\bWhat\s+(a|an)\s+\w+", r"\bHow\s+\w+\s+(he|she|it|they|you|I)\b",
          r"(^|[.?!/]\s*)(Don['’]?t|Let['’]?s|Be\b|Never\b)", r"명령문|감탄문",
          # 빈칸으로 시작하는 감탄문 — 「___ nice the backpack is!」
          r"_{3,}\s+(a|an\s+)?\w+[^.!?]{0,24}\b(is|are|was|were)\s*!",
          r"_{3,}\s+\w+[^!]{0,30}!",
          # 빈칸 뒤에 동사원형만 오는 명령문
          r"_{3,}\s+(use|play|be|open|close|turn|put|take|come|go|eat|drink|study|"
          r"listen|wash|clean|help|look|write|read|stop|keep)\b"]),
        ("의문사 의문문",
         [r"(^|[.?!/]\s*)(What|Who|Whom|Whose|When|Where|Why|How|Which)\b", r"의문사"]),
    ],
    "부가의문문과 간접의문문": [
        ("간접의문문",
         [r"\b(know|wonder|tell\s+me|ask|sure)\b.{0,20}\b(what|who|when|where|why|how|if|whether)\b\s+\w+\s+\w+",
          r"간접의문문"]),
        ("부가의문문과 부정의문문",
         [r",\s*(isn['’]?t|aren['’]?t|don['’]?t|doesn['’]?t|didn['’]?t|can['’]?t|won['’]?t|is|are|do|does|did|can|will)\s+\w+\?",
          r"부가의문문|부정의문문"]),
        ("의문사 의문문", [r"(^|[.?!/]\s*)(What|Who|When|Where|Why|How|Which)\b", r"의문사"]),
    ],
    "형용사와 부사": [
        ("부사", [r"\b\w+ly\b", r"\b(always|usually|often|sometimes|never|seldom|hardly)\b", r"부사"]),
        ("형용사", [r"형용사", r"\b(beautiful|kind|happy|large|small|tall|young|new|old)\b",
                 r"\b(many|much|a\s+lot\s+of|lots\s+of|a\s+few|a\s+little|few|little)\b"]),
    ],
    "형용사와 명사의 수량표현": [
        ("주의해야 할 형용사와 부사",
         [r"\b(hard|hardly|late|lately|near|nearly|high|highly|most|almost)\b", r"주의"]),
        ("부사", [r"\b\w+ly\b", r"\b(always|usually|often|sometimes|never)\b", r"부사"]),
        ("형용사", [r"\b(many|much|a\s+few|a\s+little|few|little|some|any)\b", r"형용사",
                 # 셀 수 없는 명사를 세는 말 — 「a bowl of rice」
                 r"\b(bowl|glass|slice|piece|pair|cup|loaf|sheet|bottle|can)s?\s+of\b",
                 r"_{3,}\s+(money|sugar|food|water|time|juice|milk|bread|advice|"
                 r"information|news|homework|furniture)\b"]),
    ],
    "접속사": [
        ("짝을 이루는 접속사",
         [r"\bboth\s+\w+\s+and\b", r"\beither\s+\w+\s+or\b", r"\bneither\s+\w+\s+nor\b",
          r"\bnot\s+only\b.{0,24}\bbut\s+also\b", r"\bbut\s+also\b",
          r"\bso\s*~?\s*that\s*~?", r"\bsuch\s+.{0,16}\s+that\b",
          r"상관접속사|짝을 이루"]),
        ("명사절을 이끄는 접속사",
         [r"\b(know|knew|think|thought|say|said|believe|hope|sure|heard|hear|suggest|"
          r"realize|feel|felt)\b[^.]{0,16}that\b",
          r"\bwhether\b|\bif\s+\w+\s+\w+", r"명사절",
          # 「The reason … is ___ she is kind」처럼 보어 자리의 명사절
          r"\b(reason|fact|problem|point|question)\b.{0,30}\bis\s*(\(\w\)|_{3,})",
          r"\b(believe|know|think|say|suggest)\s*(\(\w\)|_{3,})\s+\w+\s+\w+"]),
        ("명사절을 이끄는 that", [r"\bthat\b.{0,30}\b(is|are|was|were|will|can)\b", r"that절|명사절"]),
        ("부사절을 이끄는 접속사",
         [r"\b(when|while|before|after|until|as\s+soon\s+as|because|since|although|though|"
          r"even\s+though|if|unless)\b", r"부사절",
          # 빈칸 뒤에 절이 이어지는 자리 — 「(A)___ it was snowing heavily」
          r"(\(\w\)|_{3,})\s*(it|he|she|they|we|you|I|[A-Z][a-z]+)\s+(was|were|is|are|had|has|"
          r"did|do|does|could|would|will|can)\b"]),
        ("시간·이유·조건의 접속사",
         [r"\b(when|while|before|after|until|because|since|if|unless)\b", r"시간|이유|조건",
          # 빈칸 뒤에 절(주어+동사)이 오면 부사절을 이끄는 자리다
          r"_{3,}\s+(I|you|he|she|we|they|it|[A-Z][a-z]+)\s+[a-z]+"]),
        ("시간·이유의 접속사", [r"\b(when|while|before|after|until|because|since)\b"]),
        ("조건·양보의 접속사", [r"\b(if|unless|although|though|even\s+if|even\s+though)\b"]),
        ("등위접속사",
         [r"\b(and|but|or|so)\b", r"등위",
          # 「명령문, ___ 주어+동사」 — 그러면·그렇지 않으면
          r"(^|[.!?/]\s*)[A-Z]\w+[^.!?,]{0,30},\s*(_{3,}|\(\s*\w\s*\))\s*"
          r"(you|he|she|they|we|I)\b"]),
    ],
    # 전치사는 낱말만 보면 아무 문장에나 걸린다. 뒤에 오는 말까지 함께 본다.
    # 그래도 안 걸리면 아래 prepositions() 가 때·곳을 가리키는 낱말을 세어 가른다.
    "전치사": [
        ("시간 전치사",
         [r"\b(at|on|in|before|after|during|until|by|since|for|from)\s+"
          r"(\d{1,4}|noon|midnight|morning|afternoon|evening|night|sunset|sunrise|"
          r"Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|"
          r"January|February|March|April|May|June|July|August|September|October|November|December|"
          r"spring|summer|fall|autumn|winter|breakfast|lunch|dinner|\w+day)\b",
          r"시간을 나타내는|때를 나타내는"]),
        ("장소·위치·방향 전치사",
         [r"\b(under|over|above|below|behind|between|among|beside|near|"
          r"next\s+to|in\s+front\s+of|into|out\s+of|through|across|along|around|toward)\b",
          r"\b(in|on|at|to|from)\s+(the\s+)?(school|house|home|room|table|wall|park|station|"
          r"store|city|country|street|box|bag|corner|garden|kitchen|library|hospital)\b",
          r"장소|위치|방향"]),
        ("여러 가지 전치사", [r"\b(with|without|about|of|for|by)\s+\w+"]),
    ],
    "일치와 화법": [
        ("화법", [r"said\s+to\b", r"\btold\s+\w+\s+that\b", r"\basked\s+\w+\s+(if|whether)\b",
                r"[“\"].{0,40}[”\"]", r"화법|전달"]),
        ("시제 일치", [r"시제\s*일치", r"\bsaid\s+that\b.{0,24}\b(was|were|had|would|could)\b"]),
        # 나머지는 거의 수일치 문항이다 — 주어와 동사를 맞추는 것을 묻는다
        ("수일치", [r"수일치|단수|복수|모두 현재형",
                 r"\b(each|every|either|neither|both|all|none|one\s+of|half\s+of|"
                 r"the\s+number\s+of|a\s+number\s+of|most\s+of|some\s+of)\b",
                 r"\[\s*is\s*/\s*are\s*\]", r"\b(is|are|was|were)\b"]),
    ],
    "특수구문": [
        ("도치",
         [r"\b(Never|Little|Only|Hardly|Rarely|Seldom|Not\s+until|Neither|Nor|So)\b"
          r".{0,26}\b(do|does|did|is|are|was|were|have|has|had|can|could|will|would)\b",
          r"\bNot\s+until\b", r"\b(So|Neither)\s+(do|does|did|am|is|are|was|were|can|will)\s+\w",
          # 빈칸이 조동사 자리인 도치 — 「Never (A)___ such a sight」
          r"\b(Never|Little|Only|Hardly|Rarely|Seldom|Neither|Nor)\b\s*(\(\w\)\s*)?(_{3,}|\[\[)",
          r"도치"]),
        ("강조",
         [r"\bIt\s+(is|was)\b.{1,34}[\s\[]that\b",
          r"\[\[\s*(do|does|did)\s*\]\]",
          r"\b(do|does|did)\s+\w+\b.{0,20}강조", r"정말로|바로 그",
          r"\bthe\s+very\b", r"강조"]),
        ("생략과 동격",
         [r"생략|동격", r",\s*(a|an|the)\s+\w+\s*,",
          r"(When|While|If|Though|Although)\s+(asked|seen|compared|necessary|possible|"
          r"needed|young|alone|in\s+doubt)",
          r"If\s+you\s+are.{0,20}=\s*(_{3,}|\(\s*\w\s*\))"]),

        ("부정과 무생물주어", [r"부분\s*부정|전체\s*부정|무생물\s*주어", r"\bnot\s+(all|every|always|both)\b"]),
    ],
}


# ── 전치사 — 때를 가리키는 말과 곳을 가리키는 말을 세어 가른다
TIME_WORD = re.compile(
    r"\b(o['’]?clock|morning|afternoon|evening|night|noon|midnight|today|tomorrow|yesterday|"
    r"Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|"
    r"January|February|March|April|May|June|July|August|September|October|November|December|"
    r"spring|summer|fall|autumn|winter|weekend|holiday|vacation|birthday|christmas|"
    r"year|years|month|months|week|weeks|day|days|hour|hours|minute|minutes|"
    r"breakfast|lunch|dinner)\b|\b\d{1,2}:\d{2}\b",
    re.I,
)
PLACE_WORD = re.compile(
    r"\b(school|home|house|room|kitchen|garden|town|city|country|street|station|park|"
    r"store|shop|library|hospital|church|office|desert|beach|sea|river|mountain|wall|"
    r"table|desk|box|bag|corner|door|window|bus|subway|train|airport|bed|floor|"
    r"restaurant|cafe|museum|zoo|farm|island|hotel|building|bridge)\b",
    re.I,
)


def prepositions(text, allow):
    """전치사 문항 — 때를 가리키는 말이 무거우면 시간, 곳이 무거우면 장소"""
    time = len(TIME_WORD.findall(text))
    place = len(PLACE_WORD.findall(text))
    if time >= 2 and time >= place * 2:
        for name in ("시간 전치사", "시간"):
            if name in allow:
                return name
    if place >= 2 and place >= time * 2:
        for name in ("장소·위치·방향 전치사", "장소 전치사", "장소"):
            if name in allow:
                return name
    if time + place >= 2:
        for name in ("여러 가지 전치사",):
            if name in allow:
                return name
    return None


def by_table(chapter):
    """표로 가리는 단원 — 좁은 것부터 차례로 본다"""
    def pick(text, allow):
        for name, pats in TABLE[chapter]:
            if name in allow and has(text, *pats):
                return name
        # 표로 못 가린 전치사 문항은 낱말을 세어 본다
        if "전치사" in chapter:
            return prepositions(text, allow)
        return None
    return pick


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


for _name in TABLE:
    PICKERS.setdefault(_name, by_table(_name))
# 레벨 4는 단원 이름만 조금 다르다
for _a, _b in (("일치, 화법", "일치와 화법"), ("분사", "분사"), ("비교", "비교구문")):
    if _b in TABLE:
        PICKERS.setdefault(_a, by_table(_b))
# 같은 짜임을 쓰는 단원들
for _a, _b in (("접속사[1]", "접속사"), ("접속사[2]", "접속사"),
               ("문장의 형식", "문장의 형식"), ("비교", "비교구문")):
    if _b in TABLE:
        PICKERS.setdefault(_a, by_table(_b))


# 레벨마다 세부 이름이 다른 단원은 따로 본다
BY_LEVEL = {
    (2, "관계사"): [
        ("관계대명사에서 주의할 점",
         [r"\b(who|which|that)\s+(was|were|is|are)\b.{0,30}(고쳐|어색|틀린)",
          r"\b(in|on|at|for|with|to|about)\s+(which|whom)\b", r"주의"]),
        ("관계대명사의 종류",
         [r"\bwhose\b", r"\bwhat\b.{0,24}관계", r"who,\s*whom,\s*whose", r"종류",
          r"\b\w+\s*" + BLANK + r"\s*\w+\s+(is|are|was|were)\b"]),
        ("목적격 관계대명사",
         [r"\bwho\s?\(?m\)?\b", r"\bwhom\b",
          r"\b(who|which|that)\s+(I|you|he|she|we|they|[A-Z][a-z]+)\b",
          r"목적격",
          r"\b\w+\s*" + BLANK + r"\s*(I|you|he|she|we|they)\s+[a-z]+"]),
        ("주격 관계대명사",
         [r"\b(who|which|that)\s+(is|are|was|were|has|have|had|\w+s|\w+ed)\b", r"주격",
          r"\b\w+\s*" + BLANK + r"\s*(is|are|was|were|has|have|can|will)\b"]),
    ],
    (2, "접속사[2]"): [
        ("짝을 이루는 접속사",
         [r"\bboth\s+\w+\s+and\b", r"\beither\s+\w+\s+or\b", r"\bneither\s+\w+\s+nor\b",
          r"\bnot\s+only\b", r"\bbut\s+also\b", r"\bso\s*~?\s*that\b", r"상관접속사|짝을 이루"]),
        ("조건·양보의 접속사",
         [r"\b(if|unless|although|though|even\s+if|even\s+though|in\s+case)\b",
          r"조건|양보|만약|비록"]),
        ("시간·이유의 접속사",
         [r"\b(when|while|before|after|until|till|since|because|as\s+soon\s+as|as)\b",
          r"시간|이유|때문|~할 때"]),
        ("명사절을 이끄는 that",
         [r"\bthat\b", r"\bwhether\b", r"명사절|that절"]),
        ("시간 전치사",
         [r"\b(at|on|in|before|after|during|until|by|since|for)\s+"
          r"(\d{1,4}|noon|midnight|morning|afternoon|evening|night|\w+day|"
          r"January|February|March|April|May|June|July|August|September|October|November|December)\b",
          r"시간"]),
        ("장소 전치사",
         [r"\b(under|over|above|below|behind|between|among|beside|near|next\s+to|"
          r"in\s+front\s+of|into|through|across|along)\b", r"장소"]),
        ("여러 가지 전치사", [r"\b(with|without|about|of|for|by)\s+\w+"]),
    ],
}
for _key, _rules in BY_LEVEL.items():
    TABLE["%d|%s" % _key] = _rules
    PICKERS["%d|%s" % _key] = by_table("%d|%s" % _key)


def guess(level, chapter, question, allow):
    """이 문항의 세부 단원 — 가릴 수 없으면 None.

    allow 는 그 단원에서 쓸 수 있는 세부 이름들이다. 표에 없는 이름은 내놓지 않는다.
    """
    pick = PICKERS.get("%d|%s" % (level, chapter)) or PICKERS.get(chapter)
    if not pick or not allow:
        return None
    return pick(flatten(question), set(allow))

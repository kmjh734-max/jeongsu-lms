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
    if body:
        if SAME_USE.search(prompt):
            return re.sub(r"\s+", " ", " ".join(body))
        return re.sub(r"\s+", " ", " ".join([prompt] + body))
    return re.sub(r"\s+", " ", " ".join([prompt] + picks + [str(q.get("answer") or "")]))


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


# ── 나머지 단원 — 좁은 것부터 차례로 본다
# (단원 이름) → [(세부 이름, 자국들), …]  먼저 걸리는 것이 임자다.
TABLE = {
    "be동사": [
        ("be동사의 부정문과 의문문",
         [r"\b(is|are|am|was|were)\s+not\b", r"\b(isn'?t|aren'?t|wasn'?t|weren'?t)\b",
          r"(^|[.?!/]\s*)(Is|Are|Am|Was|Were)\s+\w+"]),
        ("be동사의 긍정문", [r"\b(is|are|am|was|were)\b"]),
    ],
    "일반동사": [
        ("일반동사의 부정문과 의문문",
         [r"\b(do|does|did)\s+not\b", r"\b(don'?t|doesn'?t|didn'?t)\b",
          r"(^|[.?!/]\s*)(Do|Does|Did)\s+\w+"]),
        ("일반동사의 과거형",
         [r"\b(yesterday|last\s+\w+|ago)\b", r"어제|지난|과거형",
          r"\b(went|came|ate|saw|made|took|got|had|did|said|bought|wrote|found)\b"]),
        ("일반동사의 현재형", [r"\b(always|usually|often|every\s+day)\b", r"현재형", r"\w+s\b"]),
    ],
    "동사의 시제": [
        ("미래 표현",
         [r"\bwill\b", r"\b(is|are|am)\s+going\s+to\b", r"\b(tomorrow|next\s+\w+)\b", r"미래"]),
        ("현재진행형", [r"\b(is|are|am|was|were)\s+\w+ing\b", r"진행형"]),
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
        ("현재완료진행", [r"\b(have|has)\s+been\s+\w+ing\b", r"완료진행"]),
        ("과거완료", [r"\bhad\s+(not\s+)?(been|\w+(ed|en))\b", r"과거완료"]),
        ("현재완료", [r"\b(have|has)\s+(not\s+)?(been|\w+(ed|en))\b", r"현재완료"]),
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
         [r"\b(make|makes|made|call|called|find|found|keep|kept|name|named|elect|leave|left)\s+"
          + WHO + r"\s+\w+", r"목적격보어"]),
        ("주어+동사+간접목적어+직접목적어",
         [r"\b(give|gave|send|sent|show|showed|buy|bought|make|made|teach|taught|tell|told|"
          r"lend|lent|write|wrote|ask|asked)\s+" + WHO + r"\s+(a|an|the|some|my|his|her)\b",
          r"\b(to|for|of)\s+(me|him|her|us|them|you)\b", r"간접목적어"]),
        ("주어+동사+보어",
         [r"\b(become|became|look|looks|looked|feel|felt|taste|tastes|sound|sounds|smell|"
          r"seem|seems|get|gets|turn|turns|stay|remain)\s+\w+", r"보어"]),
    ],
    "다양한 문장의 형태": [
        ("부가의문문과 부정의문문",
         [r",\s*(isn'?t|aren'?t|wasn'?t|weren'?t|don'?t|doesn'?t|didn'?t|can'?t|won'?t|"
          r"is|are|do|does|did|can|will)\s+\w+\?", r"부가의문문|부정의문문"]),
        ("명령문과 감탄문",
         [r"\bWhat\s+(a|an)\s+\w+", r"\bHow\s+\w+\s+(he|she|it|they|you|I)\b",
          r"(^|[.?!/]\s*)(Don'?t|Let'?s|Be\b|Never\b)", r"명령문|감탄문"]),
        ("의문사 의문문",
         [r"(^|[.?!/]\s*)(What|Who|Whom|Whose|When|Where|Why|How|Which)\b", r"의문사"]),
    ],
    "부가의문문과 간접의문문": [
        ("간접의문문",
         [r"\b(know|wonder|tell\s+me|ask|sure)\b.{0,20}\b(what|who|when|where|why|how|if|whether)\b\s+\w+\s+\w+",
          r"간접의문문"]),
        ("부가의문문과 부정의문문",
         [r",\s*(isn'?t|aren'?t|don'?t|doesn'?t|didn'?t|can'?t|won'?t|is|are|do|does|did|can|will)\s+\w+\?",
          r"부가의문문|부정의문문"]),
        ("의문사 의문문", [r"(^|[.?!/]\s*)(What|Who|When|Where|Why|How|Which)\b", r"의문사"]),
    ],
    "형용사와 부사": [
        ("부사", [r"\b\w+ly\b", r"\b(always|usually|often|sometimes|never|seldom|hardly)\b", r"부사"]),
        ("형용사", [r"형용사", r"\b(beautiful|kind|happy|large|small|tall|young|new|old)\b"]),
    ],
    "형용사와 명사의 수량표현": [
        ("주의해야 할 형용사와 부사",
         [r"\b(hard|hardly|late|lately|near|nearly|high|highly|most|almost)\b", r"주의"]),
        ("부사", [r"\b\w+ly\b", r"\b(always|usually|often|sometimes|never)\b", r"부사"]),
        ("형용사", [r"\b(many|much|a\s+few|a\s+little|few|little|some|any)\b", r"형용사"]),
    ],
    "접속사": [
        ("짝을 이루는 접속사",
         [r"\bboth\s+\w+\s+and\b", r"\beither\s+\w+\s+or\b", r"\bneither\s+\w+\s+nor\b",
          r"\bnot\s+only\b.{0,24}\bbut\s+also\b", r"\bbut\s+also\b",
          r"\bso\s*~?\s*that\s*~?", r"\bsuch\s+.{0,16}\s+that\b",
          r"상관접속사|짝을 이루"]),
        ("명사절을 이끄는 접속사",
         [r"\b(know|think|say|believe|hope|sure)\s+(that)?\b.{0,12}\bthat\b",
          r"\bwhether\b|\bif\s+\w+\s+\w+", r"명사절"]),
        ("명사절을 이끄는 that", [r"\bthat\b.{0,30}\b(is|are|was|were|will|can)\b", r"that절|명사절"]),
        ("부사절을 이끄는 접속사",
         [r"\b(when|while|before|after|until|as\s+soon\s+as|because|since|although|though|"
          r"even\s+though|if|unless)\b", r"부사절"]),
        ("시간·이유·조건의 접속사",
         [r"\b(when|while|before|after|until|because|since|if|unless)\b", r"시간|이유|조건"]),
        ("시간·이유의 접속사", [r"\b(when|while|before|after|until|because|since)\b"]),
        ("조건·양보의 접속사", [r"\b(if|unless|although|though|even\s+if|even\s+though)\b"]),
        ("등위접속사", [r"\b(and|but|or|so)\b", r"등위"]),
    ],
    # 전치사는 낱말만 보면 아무 문장에나 걸린다. 뒤에 오는 말까지 함께 본다.
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
        ("수일치", [r"수일치", r"\b(each|every|either|neither|both|all|none|the\s+number\s+of|"
                 r"a\s+number\s+of)\b"]),
    ],
    "특수구문": [
        ("도치", [r"(^|[.?!/]\s*)(Never|Little|Only|Hardly|Rarely|Seldom|Not\s+until|So|Neither|Nor)\b"
                r".{0,20}\b(do|does|did|is|are|was|were|have|has|had|can|will)\b", r"도치"]),
        ("강조", [r"\bIt\s+(is|was)\s+.{1,30}\s+that\b", r"\b(do|does|did)\s+\w+\b.{0,20}강조",
                r"\bthe\s+very\b", r"강조"]),
        ("생략과 동격", [r"생략|동격", r",\s*(a|an|the)\s+\w+\s*,"]),
        ("부정과 무생물주어", [r"부분\s*부정|전체\s*부정|무생물\s*주어", r"\bnot\s+(all|every|always|both)\b"]),
    ],
}


def by_table(chapter):
    """표로 가리는 단원 — 좁은 것부터 차례로 본다"""
    def pick(text, allow):
        for name, pats in TABLE[chapter]:
            if name in allow and has(text, *pats):
                return name
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
# 같은 짜임을 쓰는 단원들
for _a, _b in (("접속사[1]", "접속사"), ("접속사[2]", "접속사"),
               ("문장의 형식", "문장의 형식"), ("비교", "비교구문")):
    if _b in TABLE:
        PICKERS.setdefault(_a, by_table(_b))


def guess(level, chapter, question, allow):
    """이 문항의 세부 단원 — 가릴 수 없으면 None.

    allow 는 그 단원에서 쓸 수 있는 세부 이름들이다. 표에 없는 이름은 내놓지 않는다.
    """
    pick = PICKERS.get(chapter)
    if not pick or not allow:
        return None
    return pick(flatten(question), set(allow))

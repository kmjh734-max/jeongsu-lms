# -*- coding: utf-8 -*-
"""문항을 세부 목차의 어느 자리에 넣을지 가리는 규칙 — 바깥 서비스는 부르지 않는다.

가리는 법
    문항의 발문·본문·보기·답·해설을 한 덩어리로 보고, 자리마다 적어 둔 자국을
    찾아 점수를 매긴다. 가장 높은 자리에 넣는다.

    밑줄 친 부분([[ ]])은 그 문항이 **무엇을 묻는지** 가장 잘 알려 주므로 세 배로
    센다. 해설에 적힌 문법 이름도 곧바로 자리를 가리키므로 두 배로 센다.

    아무 자국도 못 찾으면 예전 자리를 그대로 둔다(이 단원에 있는 이름일 때만).
"""
import re

# ── 여러 단원이 함께 쓰는 자국 묶음 ──────────────────────────────────────────

INF = {
    "독립부정사": [r"to tell the truth|to be frank|to make matters worse|strange to say"
                   r"|needless to say|so to speak|to begin with|to be sure|독립부정사"],
    "의미상 주어": [r"의미상 주어", r"\bfor (?:him|her|me|us|them|you|us)\s+to\s+[a-z]",
                    r"\bof (?:him|her|you|them|us)\s+to\s+[a-z]"],
    "to부정사의 시제·부정·태": [r"완료부정사|to부정사의 (?:부정|시제|태)",
                                r"\bto have (?:been|[a-z]+ed|gone|done|seen|written|taken)\b",
                                r"\bnot\s+to\s+[a-z]+\b", r"\bto be (?:[a-z]+ed|done|built|taken|given)\b"],
    "목적격 보어로 쓰이는 원형부정사": [r"원형부정사|사역동사|지각동사",
        r"\b(?:make|makes|made|have|has|had|let|lets|let)\s+(?:me|him|her|us|them|you|the\s+\w+|my\s+\w+|his\s+\w+|her\s+\w+)\s+(?!to\b)[a-z]+\b",
        r"\b(?:see|saw|seen|hear|heard|watch|watched|feel|felt|notice|noticed)\s+(?:me|him|her|us|them|the\s+\w+)\s+(?!to\b)[a-z]+\b"],
    "목적격 보어로 쓰이는 to부정사": [
        r"\b(?:want|wants|wanted|ask|asks|asked|tell|tells|told|advise|advised|allow|allows|allowed"
        r"|expect|expects|expected|order|ordered|encourage|encouraged|force|forced|enable|enabled"
        r"|persuade|persuaded|remind|reminded|cause|caused|teach|taught|invite|invited|warn|warned"
        r"|get|gets|got)\s+(?:me|him|her|us|them|you|the\s+\w+|my\s+\w+|his\s+\w+|her\s+\w+)\s+to\s+[a-z]"],
    "형용사적 용법": [r"형용사적", r"\b(?:something|anything|nothing|someone|somebody)\s+to\s+[a-z]",
                      r"\b(?:a|the|some|many|much|no)\s+\w+\s+to\s+(?:eat|drink|read|do|wear|see|say|visit|play|buy|live)\b",
                      r"~?할\s*(?:것|일|사람|시간|방법)", r"명사를\s*(?:꾸미|수식)"],
    "부사적 용법": [r"부사적", r"in order to\b|so as to\b", r"목적|원인|결과|판단의 근거|조건을 나타내",
                    r"\btoo\s+\w+\s+to\s+[a-z]", r"enough\s+to\s+[a-z]"],
    "명사적 용법": [r"명사적", r"가주어|진주어",
                    r"\b(?:decide|decided|want|wants|wanted|hope|hoped|plan|planned|promise|promised"
                    r"|need|needs|needed|begin|began|start|started|learn|learned|refuse|refused"
                    r"|agree|agreed|expect|expected|wish|wished|choose|chose|fail|failed)\s+to\s+[a-z]",
                    r"^To\s+[a-z]+\b|It (?:is|was|'s)\s+\w+\s+to\s+[a-z]"],
}

GER = {
    "동명사의 관용 표현": [r"관용\s*표현",
        r"\b(?:feel like|be busy|be worth|It is no use|there is no|cannot help|can't help"
        r"|look forward to|be used to|get used to|spend\s+\w+|have (?:a hard|difficulty|trouble)"
        r"|go\s+(?:shopping|fishing|swimming|hiking|camping|skiing)|on\s+\w+ing|keep\s+\w+\s+from)\b"],
    "동명사의 의미상 주어": [r"의미상 주어", r"\b(?:his|her|my|their|our|your)\s+\w+ing\b"],
    "동명사와 to부정사": [r"동명사와\s*to\s*부정사|목적어로\s*(?:동명사|to)",
        r"\b(?:remember|forget|try|stop|regret|mean)\s+(?:to\s+[a-z]+|\w+ing)\b",
        r"\b(?:enjoy|finish|avoid|mind|give up|keep|practice|suggest|quit|deny|admit|consider|imagine|postpone|delay)\b"],
    # 넓은 자리는 이름이 불릴 때만 센다. 「\w+ing」 같은 자국을 두면 답에까지 걸려
    # 좁은 자리(관용 표현 따위)를 눌러 버린다. 아무데도 안 걸린 문항은 트리의 첫
    # 자리로 가므로, 넓은 자리를 첫머리에 적어 두면 그대로 담긴다.
    "동명사의 쓰임": [r"동명사의?\s*(?:쓰임|역할)"],
}

PART = {
    "with + 명사 + 분사": [r"with\s*\+\s*명사", r"\bwith\s+(?:his|her|my|their|our|your|the)\s+\w+\s+\w+(?:ing|ed)\b"],
    "완료 분사구문": [r"완료\s*분사", r"\bHaving\s+(?:been\s+)?[a-z]+(?:ed|en)\b"],
    "여러 가지 분사구문": [r"독립\s*분사|비인칭\s*독립|분사구문의\s*의미|접속사를?\s*(?:남긴|생략하지)",
                           r"\b(?:Generally|Frankly|Strictly|Judging from|Considering|Speaking of)\s+speaking\b"],
    "분사구문 만들기": [r"분사구문", r"^(?:Being|Not having|Not being)\b"],
    "감정을 나타내는 분사": [r"감정을\s*나타내",
        r"\b(?:interesting|interested|boring|bored|exciting|excited|surprising|surprised"
        r"|amazing|amazed|shocking|shocked|tiring|tired|confusing|confused|satisfying|satisfied"
        r"|disappointing|disappointed|touching|touched|pleasing|pleased|frightening|frightened)\b"],
    "현재분사와 동명사의 구분": [r"현재분사와\s*동명사"],
    "현재분사와 과거분사": [r"현재분사|과거분사"],
}

PASS = {
    "조동사가 있는 수동태": [r"조동사가?\s*(?:있는|쓰인)\s*수동태",
                             r"\b(?:will|can|may|must|should|could|would|might)\s+be\s+[a-z]+(?:ed|en)\b"],
    "by 이외의 전치사를 쓰는 수동태": [r"by\s*이외|전치사를?\s*(?:쓰는|사용하는)\s*수동태",
        r"\bbe\s+(?:known|interested|satisfied|surprised|filled|covered|pleased|worried|made|tired"
        r"|disappointed|crowded|composed|married)\s+(?:as|to|for|with|in|at|of|about)\b"],
    "5형식 문장의 수동태": [r"5형식.{0,6}수동태",
        r"\bwas\s+(?:made|seen|heard|called|named|elected|found)\s+to\s+[a-z]"],
    "4형식 문장의 수동태": [r"4형식.{0,6}수동태", r"\bwas\s+(?:given|sent|told|taught|shown|asked|bought|made)\s+(?:a|an|the|to|for)\b"],
    "수동태의 부정문과 의문문": [r"수동태의?\s*(?:부정|의문)",
                                 r"\b(?:was|were|is|are|am)\s+not\s+[a-z]+(?:ed|en)\b",
                                 r"^(?:Was|Were|Is|Are|Am)\s+\w+\s+[a-z]+(?:ed|en)\b"],
    "수동태의 시제": [r"수동태의?\s*시제|완료\s*수동태|진행형?\s*수동태",
                      r"\b(?:has|have|had)\s+been\s+[a-z]+(?:ed|en)\b",
                      r"\b(?:is|are|was|were)\s+being\s+[a-z]+(?:ed|en)\b"],
    "수동태의 형태": [r"수동태의?\s*형태|능동태"],
}

REL = {
    "복합관계사": [r"복합\s*관계",
        r"\b(?:whoever|whomever|whatever|whichever|whenever|wherever|however)\b"],
    "관계사의 계속적 용법": [r"계속적\s*용법", r",\s*(?:which|who|whom|whose|where|when)\b"],
    "관계대명사 what": [r"관계대명사\s*what", r"\bwhat\s+(?:I|you|he|she|we|they|it)\s+\w+"],
    "관계대명사의 생략": [r"관계대명사의?\s*생략|생략할\s*수\s*있"],
    "관계부사": [r"관계부사", r"\b(?:the\s+(?:place|time|day|year|reason|way))\s+(?:where|when|why|that)\b",
                 r"\b(?:where|when|why)\b"],
    "소유격 관계대명사": [r"소유격\s*관계", r"\bwhose\b|\bof which\b"],
    "목적격 관계대명사": [r"목적격\s*관계", r"\bwhom\b"],
    "주격 관계대명사": [r"주격\s*관계"],
    "관계대명사": [r"관계대명사"],
}

IF = {
    "without·but for 가정법": [r"without\s*가정법|but for", r"\b(?:Without|But for)\b"],
    "as if 가정법": [r"as if|as though"],
    "I wish 가정법": [r"I wish|I wished"],
    "혼합 가정법": [r"혼합\s*가정법", r"If\s+\w+\s+had\s+[a-z]+(?:ed|en).{0,60}\b(?:would|could|might)\s+(?!have)[a-z]+\s+now\b"],
    "가정법 과거완료": [r"가정법\s*과거완료", r"If\s+.{0,30}\bhad\s+[a-z]+(?:ed|en)\b.{0,50}\b(?:would|could|might)\s+have\b"],
    "가정법 과거": [r"가정법\s*과거", r"If\s+.{0,20}\bwere\b|If\s+.{0,30}\b(?:would|could|might)\s+(?!have)[a-z]+"],
    "가정법 현재(조건절)": [r"가정법\s*현재|조건절", r"If\s+.{0,30}\b(?:will|can)\b"],
}

COMP = {
    "여러 가지 비교 표현": [r"여러\s*가지\s*비교|비교\s*표현",
        r"\bthe\s+\w+er\b.{0,30}\bthe\s+\w+er\b|\bthe\s+more\b.{0,30}\bthe\s+more\b",
        r"\b(?:\w+er|more\s+\w+)\s+and\s+(?:\w+er|more\s+\w+)\b",
        r"\bone of the\s+(?:\w+est|most\s+\w+)\b"],
    "원급·비교급으로 최상급 나타내기": [r"원급.{0,8}비교급.{0,10}최상급|최상급\s*(?:표현|나타)",
        r"\bno\s+other\s+\w+\b|\bthan\s+any\s+other\b|\bnothing\s+is\s+(?:as|so)\b"],
    "최상급": [r"최상급", r"\bthe\s+(?:\w+est|most\s+\w+)\b"],
    "원급 비교": [r"원급", r"\b(?:as|so)\s+\w+\s+as\b"],
    "비교급": [r"비교급", r"\b(?:\w+er|more\s+\w+|less\s+\w+)\s+than\b"],
    "비교급·최상급 만들기": [r"비교급.{0,6}최상급을?\s*만드|변화형|규칙\s*변화"],
}

CONJ = {
    "명사절을 이끄는 that": [r"명사절", r"\bthat\s+(?:he|she|it|they|we|you|I)\s+\w+"],
    "상관접속사": [r"상관접속사",
        r"\b(?:both\s+\w+\s+and|either\s+\w+\s+or|neither\s+\w+\s+nor|not only\s+.{0,20}\s+but also"
        r"|as well as)\b"],
    "명령문 + and/or": [r"명령문\s*\+?\s*(?:and|or)", r"^\s*[A-Z][a-z]+\s+.{0,40},\s+(?:and|or)\s+"],
    "조건·양보를 나타내는 접속사": [r"조건을?\s*나타내|양보를?\s*나타내",
        r"\b(?:unless|although|though|even though|even if|whether)\b"],
    "조건을 나타내는 접속사": [r"조건을?\s*나타내", r"\b(?:unless|if)\b"],
    "양보를 나타내는 접속사": [r"양보", r"\b(?:although|though|even though|even if)\b"],
    "시간·이유를 나타내는 접속사": [r"시간을?\s*나타내|이유를?\s*나타내",
        r"\b(?:when|while|before|after|until|till|since|as soon as|because|so that)\b"],
    "시간을 나타내는 접속사": [r"시간을?\s*나타내", r"\b(?:when|while|before|after|until|till|as soon as)\b"],
    # 「as」는 때(~할 때)로도 이유(~때문에)로도 쓰여 어느 쪽인지 가리지 못한다.
    # 그래서 이유 쪽에서는 보지 않는다 — 때 쪽이 훨씬 자주 나온다.
    "이유를 나타내는 접속사": [r"이유를?\s*나타내", r"\b(?:because|since)\b"],
    "등위접속사": [r"등위접속사|접속부사", r"\b(?:and|but|or|so)\b"],
}

SPEC = {
    "동격·삽입": [r"동격|삽입"],
    "부정 표현": [r"부정\s*(?:표현|구문)|전체부정|부분부정",
        r"\b(?:not all|not every|not always|none of|neither of|hardly|seldom|rarely|scarcely|barely)\b"],
    "생략": [r"생략"],
    "도치": [r"도치", r"^(?:Never|Hardly|Seldom|Rarely|Little|Not until|Only|No sooner|So|Neither|Nor)\b"],
    "It ~ that 강조 구문": [r"It\s*~?\s*that\s*강조", r"\bIt\s+(?:is|was)\s+.{1,40}\s+that\b"],
    "강조": [r"강조", r"\bdo(?:es|d)?\s+(?!not)[a-z]+\b|\bthe\s+very\b|\bat all\b|\bin the world\b"],
}

AGREE = {
    "의문문·명령문의 화법 전환": [r"의문문.{0,6}화법|명령문.{0,6}화법",
        r"\b(?:asked|told)\s+\w+\s+(?:if|whether|not to|to)\b"],
    "평서문의 화법 전환": [r"평서문|화법\s*전환|간접화법|직접화법", r"\b(?:said that|told \w+ that)\b"],
    "시제의 일치": [r"시제의?\s*일치"],
    "수의 일치": [r"수의?\s*일치|수일치"],
}

MODAL = {
    "조동사 + have p.p.": [r"have\s+p\.?\s*p\.?|조동사\s*\+\s*have",
        r"\b(?:must|should|may|might|could|cannot|can't|would)\s+(?:not\s+)?have\s+[a-z]+(?:ed|en)\b"],
    "had better와 would rather": [r"had better|would rather"],
    "used to와 would": [r"used to|would\s*(?:로|가)?\s*", r"\bused to\b"],
    "should와 ought to": [r"ought to|충고|제안", r"\b(?:should|ought to)\b"],
    "must와 have to": [r"\b(?:must|have to|has to|had to)\b"],
    "can과 be able to": [r"be able to", r"\bcan(?:not|'t)?\b|\bcould\b"],
    "will과 be going to": [r"be going to", r"\bwill\b"],
    "조동사 may": [r"\bmay\b|\bmight\b"],
    "조동사 can": [r"\bcan(?:not|'t)?\b|\bcould\b|be able to"],
    "조동사 will": [r"\bwill\b|\bbe going to\b|\bshall\b"],
    "조동사 must": [r"\bmust\b|\bhave to\b|\bhas to\b"],
    "조동사 should": [r"\bshould\b|\bought to\b"],
}

SV = {
    "지각동사": [r"지각동사", r"\b(?:see|saw|hear|heard|watch|watched|feel|felt|notice|noticed)\s+\w+\s+\w+ing\b"],
    "사역동사": [r"사역동사", r"\b(?:make|makes|made|let|lets|have|has|had)\s+(?:me|him|her|us|them|the\s+\w+)\s+[a-z]+\b"],
    "5형식": [r"5형식|목적격\s*보어"],
    "4형식": [r"4형식|간접목적어|직접목적어", r"\b(?:give|gave|send|sent|show|showed|tell|told|buy|bought|make|made|teach|taught|ask|asked|lend|lent|write|wrote)\s+(?:me|him|her|us|them|my|his|her)\b"],
    "감각동사": [r"감각동사", r"\b(?:look|looks|looked|sound|sounds|sounded|smell|smells|smelled|taste|tastes|tasted|feel|feels|felt)\s+(?:\w+ly\b)?\s*(?:good|bad|nice|sweet|happy|sad|soft|strange|delicious|terrible|great|wonderful|fresh|salty|sour)\b"],
    "3형식": [r"3형식"],
    "2형식": [r"2형식|주격\s*보어"],
    "1형식": [r"1형식"],
}

# ── 단원마다 쓰는 자국 묶음 ─────────────────────────────────────────────────

RULES = {
    (1, 1): {
        "be동사의 의문문": [r"의문문", r"^\s*(?:Am|Are|Is|Was|Were)\s+(?:I|you|he|she|it|we|they|the|my|his|her|your|that|this|those|these|\w+)\b.*\?",
                            r"\b(?:Yes|No),\s*(?:I|you|he|she|it|we|they)\s+(?:am|are|is|was|were|aren't|isn't|wasn't|weren't)\b"],
        "be동사의 부정문": [r"부정문", r"\b(?:am|are|is|was|were)\s+not\b|\b(?:isn't|aren't|wasn't|weren't)\b"],
        "be동사의 과거형": [r"과거형|과거시제", r"\b(?:was|were)\b"],
        "be동사의 현재형": [r"현재형", r"\b(?:am|are|is)\b"],
    },
    (1, 2): {
        "일반동사의 의문문": [r"의문문", r"^\s*(?:Do|Does|Did)\s+\w+", r"\b(?:Yes|No),\s*\w+\s+(?:do|does|did|don't|doesn't|didn't)\b"],
        "일반동사의 부정문": [r"부정문", r"\b(?:do|does|did)\s+not\b|\b(?:don't|doesn't|didn't)\b"],
        "일반동사의 과거형": [r"과거형|과거시제", r"\b(?:yesterday|last\s+\w+|ago|then)\b"],
        "3인칭 단수 현재형": [r"3인칭\s*단수", r"\b(?:goes|does|has|studies|watches|washes|teaches|flies|cries|tries|brushes|fixes|passes|misses)\b"],
        "일반동사의 현재형": [r"현재형", r"\b(?:every\s+\w+|usually|always|often)\b"],
    },
    (1, 3): {
        "미래시제": [r"미래", r"\bwill\b|\bbe going to\b"],
        "과거진행형": [r"과거진행", r"\b(?:was|were)\s+\w+ing\b"],
        "현재진행형": [r"현재진행|진행", r"\b(?:am|are|is)\s+\w+ing\b"],
        "과거시제": [r"과거시제", r"\b(?:yesterday|last\s+\w+|ago)\b"],
        "현재시제": [r"현재시제", r"\b(?:every\s+\w+|usually|always)\b"],
    },
    (1, 4): {k: MODAL[k] for k in ("조동사 should", "조동사 must", "조동사 will", "조동사 may", "조동사 can")},
    (1, 5): {
        "정관사 the": [r"정관사|무관사", r"\bthe\s+\w+"],
        "부정관사 a/an": [r"부정관사", r"\b(?:a|an)\s+\w+"],
        "셀 수 없는 명사": [r"셀\s*수\s*없는|불가산",
            r"\b(?:water|milk|bread|money|time|air|rice|sugar|salt|cheese|paper|advice|information|homework|music|love|snow|rain)\b",
            r"\b(?:a|two|three)\s+(?:glass|glasses|cup|cups|piece|pieces|slice|slices|bottle|bottles|loaf|loaves|bowl|bowls)\s+of\b"],
        "셀 수 있는 명사": [r"셀\s*수\s*있는|가산|복수형",
            r"\b(?:children|men|women|feet|teeth|mice|geese|leaves|knives|boxes|dishes|potatoes)\b"],
    },
    (1, 6): {
        "비인칭 주어 it": [r"비인칭", r"^It(?:'s| is| was)\s+(?:sunny|rainy|cloudy|cold|hot|warm|dark|Monday|five|seven|\d)"],
        "부정대명사 some과 any": [r"some과\s*any|부정대명사", r"\b(?:some|any)\b"],
        "재귀대명사": [r"재귀대명사", r"\b(?:myself|yourself|himself|herself|itself|ourselves|yourselves|themselves)\b"],
        "지시대명사": [r"지시대명사", r"\b(?:this|that|these|those)\b"],
        "인칭대명사": [r"인칭대명사|소유격|목적격|소유대명사",
                       r"\b(?:mine|yours|his|hers|ours|theirs)\b"],
    },
    (1, 7): {k: SV[k] for k in ("5형식", "4형식", "감각동사", "3형식", "2형식", "1형식")},
    (1, 8): {
        "부가의문문": [r"부가의문문", r",\s*(?:isn't|aren't|wasn't|weren't|don't|doesn't|didn't|won't|can't|shouldn't|is|are|was|were|do|does|did|will|can)\s+(?:he|she|it|they|we|you|I)\s*\?"],
        "감탄문": [r"감탄문", r"^\s*(?:What|How)\s+.{0,40}!"],
        "명령문": [r"명령문", r"^\s*(?:Don't|Let's|Be|Do|Please)\b|\bLet's\b"],
        "의문사 의문문": [r"의문사", r"^\s*(?:What|Who|Whose|Which|When|Where|Why|How)\b"],
        "There is/are 구문": [r"There\s+(?:is|are|was|were)"],
    },
    (1, 9): {
        "빈도부사": [r"빈도부사", r"\b(?:always|usually|often|sometimes|seldom|rarely|never)\b"],
        "수량형용사": [r"수량형용사", r"\b(?:many|much|a few|few|a little|little|some|any|a lot of|lots of)\b"],
        "부사": [r"부사", r"\b\w+ly\b"],
        "형용사": [r"형용사"],
    },
    (1, 10): {k: INF[k] for k in ("부사적 용법", "형용사적 용법", "명사적 용법")},
    (1, 11): {k: GER[k] for k in ("동명사의 관용 표현", "동명사와 to부정사", "동명사의 쓰임")},
    (1, 12): {k: COMP[k] for k in ("최상급", "원급 비교", "비교급", "비교급·최상급 만들기")},
    (1, 13): {k: CONJ[k] for k in ("명사절을 이끄는 that", "조건을 나타내는 접속사",
                                   "이유를 나타내는 접속사", "시간을 나타내는 접속사", "등위접속사")},
    (1, 14): {
        "방향을 나타내는 전치사": [r"방향", r"\b(?:to|from|into|out of|up|down|along|across|through|toward)\b"],
        "시간을 나타내는 전치사": [r"시간을?\s*나타내",
            r"\b(?:at|on|in)\s+(?:\d|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday"
            r"|January|February|March|April|May|June|July|August|September|October|November|December"
            r"|noon|night|morning|afternoon|evening|summer|winter|spring|fall)\b",
            r"\b(?:before|after|during|for|since|until|till|by)\b"],
        "장소·위치를 나타내는 전치사": [r"장소|위치",
            r"\b(?:in front of|behind|next to|between|among|under|over|above|below|beside|near|on|in|at)\b"],
        "그 밖의 전치사": [r"그\s*(?:외|밖)", r"\b(?:with|without|about|by|for|like|as)\b"],
    },
    (2, 1): SV,
    (2, 2): {
        "현재완료의 부정문과 의문문": [r"현재완료의?\s*(?:부정|의문)",
            r"\b(?:has|have)\s+(?:not|never)\s+[a-z]+(?:ed|en)\b|^(?:Has|Have)\s+\w+\s+[a-z]+(?:ed|en)\b"],
        "현재완료": [r"현재완료", r"\b(?:has|have)\s+(?:just|already|never|ever|yet|been|gone)?\s*[a-z]+(?:ed|en)\b"],
        "미래시제": [r"미래", r"\bwill\b|\bbe going to\b"],
        "진행시제": [r"진행", r"\b(?:am|are|is|was|were)\s+\w+ing\b"],
        "현재시제와 과거시제": [r"현재시제|과거시제"],
    },
    (2, 3): {k: INF[k] for k in ("부사적 용법", "형용사적 용법", "명사적 용법")},
    (2, 4): {
        "의문사 + to부정사": [r"의문사\s*\+?\s*to", r"\b(?:what|where|when|how|which|who)\s+to\s+[a-z]"],
        "too ~ to와 enough to": [r"too\s*~?\s*to|enough\s*to", r"\btoo\s+\w+\s+to\s+[a-z]|enough\s+to\s+[a-z]"],
        "의미상 주어": INF["의미상 주어"],
        "가주어와 진주어": [r"가주어|진주어", r"\bIt\s+(?:is|was|'s)\s+\w+\s+(?:for\s+\w+\s+)?to\s+[a-z]"],
    },
    (2, 5): {k: GER[k] for k in ("동명사의 관용 표현", "동명사와 to부정사", "동명사의 쓰임")},
    (2, 6): {
        "분사구문": PART["분사구문 만들기"],
        "감정을 나타내는 분사": PART["감정을 나타내는 분사"],
        "현재분사와 동명사의 구분": PART["현재분사와 동명사의 구분"],
        "현재분사와 과거분사": PART["현재분사와 과거분사"],
    },
    (2, 7): {k: MODAL[k] for k in ("used to와 would", "had better와 would rather",
                                   "should와 ought to", "must와 have to",
                                   "will과 be going to", "can과 be able to") if k in MODAL},
    (2, 8): {k: REL[k] for k in ("관계대명사 what", "관계대명사의 생략", "관계부사",
                                 "소유격 관계대명사", "목적격 관계대명사", "주격 관계대명사")},
    (2, 9): {k: PASS[k] for k in ("by 이외의 전치사를 쓰는 수동태", "5형식 문장의 수동태",
                                  "4형식 문장의 수동태", "수동태의 부정문과 의문문",
                                  "수동태의 시제", "수동태의 형태")},
    (2, 10): {k: IF[k] for k in ("I wish 가정법", "가정법 과거완료", "가정법 과거", "가정법 현재(조건절)")},
    (2, 11): {k: COMP[k] for k in ("원급·비교급으로 최상급 나타내기", "최상급", "원급 비교",
                                   "비교급", "비교급·최상급 만들기")},
    (2, 12): {
        "all·both·each·every": [r"\b(?:all|both|each|every|either|neither)\b"],
        "부정대명사 one": [r"부정대명사\s*one|one과\s*it", r"\bone\b|\bones\b"],
        "재귀대명사": [r"재귀대명사", r"\b(?:myself|yourself|himself|herself|itself|ourselves|yourselves|themselves)\b"],
        "부정대명사 some과 any": [r"some과\s*any", r"\b(?:some|any|something|anything|someone|anyone)\b"],
    },
    (2, 13): {
        "셀 수 없는 명사의 단위": [r"단위", r"\b(?:glass|glasses|cup|cups|piece|pieces|slice|slices|bottle|bottles|loaf|loaves|bowl|bowls|sheet|sheets)\s+of\b"],
        "few와 little": [r"few와\s*little", r"\b(?:a few|few|a little|little)\b"],
        "many와 much": [r"many와\s*much", r"\b(?:many|much|a lot of|lots of|plenty of)\b"],
        "형용사의 쓰임": [r"형용사"],
    },
    (2, 14): {k: CONJ[k] for k in ("명사절을 이끄는 that", "상관접속사", "명령문 + and/or", "등위접속사")},
    (2, 15): {k: CONJ[k] for k in ("양보를 나타내는 접속사", "조건을 나타내는 접속사",
                                   "시간을 나타내는 접속사", "이유를 나타내는 접속사")},
    (2, 16): {
        "간접의문문": [r"간접의문문", r"\b(?:know|tell|wonder|ask|asked|think)\s+(?:if|whether|what|where|when|why|how|who)\s+\w+\s+\w+"],
        "부가의문문": [r"부가의문문", r",\s*(?:isn't|aren't|wasn't|weren't|don't|doesn't|didn't|won't|can't|is|are|was|were|do|does|did|will|can)\s+(?:he|she|it|they|we|you|I)\s*\?"],
        "의문사 의문문": [r"의문사", r"^\s*(?:What|Who|Whose|Which|When|Where|Why|How)\b"],
    },
    (3, 1): INF,
    (3, 2): GER,
    (3, 3): {
        "미래완료": [r"미래완료", r"\bwill have\s+[a-z]+(?:ed|en)\b"],
        "과거완료진행": [r"과거완료진행", r"\bhad been\s+\w+ing\b"],
        "현재완료진행": [r"현재완료진행", r"\b(?:has|have) been\s+\w+ing\b"],
        "과거완료": [r"과거완료|대과거", r"\bhad\s+[a-z]+(?:ed|en)\b"],
        "현재완료": [r"현재완료", r"\b(?:has|have)\s+(?:just|already|never|ever|yet|been|gone)?\s*[a-z]+(?:ed|en)\b"],
    },
    (3, 4): {k: MODAL[k] for k in ("조동사 + have p.p.", "had better와 would rather",
                                   "used to와 would", "should와 ought to", "must와 have to")},
    (3, 5): {k: PASS[k] for k in ("조동사가 있는 수동태", "by 이외의 전치사를 쓰는 수동태",
                                  "5형식 문장의 수동태", "4형식 문장의 수동태",
                                  "수동태의 시제", "수동태의 형태")},
    (3, 6): {k: REL[k] for k in ("복합관계사", "관계사의 계속적 용법", "관계대명사 what",
                                 "관계대명사의 생략", "관계부사", "관계대명사")},
    (3, 7): IF,
    (3, 8): COMP,
    (3, 9): {k: CONJ[k] for k in ("명사절을 이끄는 that", "상관접속사",
                                  "조건·양보를 나타내는 접속사", "시간·이유를 나타내는 접속사", "등위접속사")},
    (3, 10): PART,
    (3, 11): AGREE,
    (3, 12): SPEC,
    (4, 1): AGREE,
    (4, 2): {
        "미래완료": [r"미래완료", r"\bwill have\s+[a-z]+(?:ed|en)\b"],
        "현재완료진행": [r"현재완료진행", r"\b(?:has|have) been\s+\w+ing\b"],
        "과거완료": [r"과거완료|대과거", r"\bhad\s+[a-z]+(?:ed|en)\b"],
        "현재완료": [r"현재완료", r"\b(?:has|have)\s+(?:just|already|never|ever|yet|been|gone)?\s*[a-z]+(?:ed|en)\b"],
        "진행 시제": [r"진행", r"\b(?:am|are|is|was|were)\s+\w+ing\b"],
        "현재시제와 과거시제": [r"현재시제|과거시제"],
    },
    (4, 3): {k: MODAL[k] for k in ("조동사 + have p.p.", "had better와 would rather",
                                   "used to와 would", "should와 ought to", "must와 have to")},
    (4, 4): {k: PASS[k] for k in ("조동사가 있는 수동태", "by 이외의 전치사를 쓰는 수동태",
                                  "5형식 문장의 수동태", "4형식 문장의 수동태",
                                  "수동태의 시제", "수동태의 형태")},
    (4, 5): INF,
    (4, 6): GER,
    (4, 7): PART,
    (4, 8): {k: CONJ[k] for k in ("명사절을 이끄는 that", "상관접속사",
                                  "조건·양보를 나타내는 접속사", "시간·이유를 나타내는 접속사", "등위접속사")},
    (4, 9): IF,
    (4, 10): {k: REL[k] for k in ("복합관계사", "관계사의 계속적 용법", "관계대명사 what",
                                  "관계대명사의 생략", "관계부사", "관계대명사")},
    (4, 11): {k: COMP[k] for k in ("여러 가지 비교 표현", "원급·비교급으로 최상급 나타내기",
                                   "최상급", "원급 비교", "비교급")},
    (4, 12): SPEC,
}

_CACHE = {}


def _ready(level, chapter_no):
    key = (level, chapter_no)
    if key not in _CACHE:
        made = []
        for unit, pats in RULES.get(key, {}).items():
            made.append((unit, [re.compile(p, re.I) for p in pats]))
        _CACHE[key] = made
    return _CACHE[key]


MARKED = re.compile(r"\[\[(.*?)\]\]")


def pick(level, chapter_no, text, marked="", said="", answer=""):
    """이 문항이 들어갈 자리. 못 가리면 None.

    어디를 묻는지 가장 잘 알려 주는 것부터 무겁게 센다 —
    밑줄 친 부분과 **답**이 3, 해설이 2, 나머지 글이 1이다.

    점수는 더하지 않고 가장 센 자국 하나만 본다. 더하면 「\w+ing」처럼 아무데나
    걸리는 넓은 자리가 좁은 자리를 이겨 버린다. 같은 점수면 앞에 적은(좁은) 자리가
    이긴다.
    """
    ready = _ready(level, chapter_no)
    best, score, seat = None, 0, 0
    for order, (unit, pats) in enumerate(ready):
        got = 0
        for p in pats:
            if p.search(marked) or p.search(answer):
                got = max(got, 3)
            elif p.search(said):
                got = max(got, 2)
            elif p.search(text):
                got = max(got, 1)
        if got and (got > score or (got == score and order < seat)):
            best, score, seat = unit, got, order
    return best

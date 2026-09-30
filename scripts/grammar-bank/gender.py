# -*- coding: utf-8 -*-
"""성별 뒤집기 — he ↔ she를 안전하게 하는 장치.

대명사만 바꾸면 "Mr. Kim ... She"처럼 앞뒤가 어긋난다. 그래서 문장 안의
성별 표지를 통째로 뒤집되, 뒤집을 수 없는 낱말이 하나라도 있으면 손대지 않는다.
"""
import re

# 짝이 분명한 성별 낱말. his/her는 소유격·목적격이 갈려 여기 넣지 않는다.
PAIRS = [
    ("he", "she"), ("him", "her"), ("himself", "herself"),
    ("boy", "girl"), ("boys", "girls"), ("man", "woman"), ("men", "women"),
    ("brother", "sister"), ("brothers", "sisters"),
    ("father", "mother"), ("dad", "mom"), ("daddy", "mommy"),
    ("son", "daughter"), ("sons", "daughters"),
    ("fathers", "mothers"), ("dads", "moms"),
    ("uncle", "aunt"), ("uncles", "aunts"),
    ("nephew", "niece"), ("nephews", "nieces"),
    ("king", "queen"), ("kings", "queens"),
    ("husbands", "wives"), ("grandfathers", "grandmothers"),
    ("actors", "actresses"), ("waiters", "waitresses"),
    ("gentleman", "lady"), ("gentlemen", "ladies"),
    ("prince", "princess"), ("princes", "princesses"),
    ("husband", "wife"), ("grandfather", "grandmother"),
    ("grandpa", "grandma"), ("actor", "actress"), ("waiter", "waitress"),
    ("sir", "ma'am"), ("male", "female"),
    # 우리말 해석에도 같이 적용해야 앞뒤가 맞는다.
    ("그는", "그녀는"), ("그가", "그녀가"), ("그를", "그녀를"),
    ("그와", "그녀와"), ("그에게", "그녀에게"), ("그도", "그녀도"),
    ("소년", "소녀"), ("남자", "여자"), ("아들", "딸"),
    ("소년들", "소녀들"), ("남자들", "여자들"), ("아들들", "딸들"),
    ("엄마들", "아빠들"), ("아버지들", "어머니들"),
    ("아버지", "어머니"), ("아빠", "엄마"), ("할아버지", "할머니"),
    ("남편", "아내"), ("삼촌", "이모"), ("왕", "여왕"),
]

FLIP = {}
for left, right in PAIRS:
    FLIP[left] = right
    FLIP[right] = left
    FLIP[left.capitalize()] = right.capitalize()
    FLIP[right.capitalize()] = left.capitalize()

_ENGLISH = sorted((w for w in FLIP if re.fullmatch(r"[A-Za-z']+", w)), key=len, reverse=True)
_KOREAN = sorted((w for w in FLIP if re.search(r"[가-힣]", w)), key=len, reverse=True)
# 영어 경계는 \b로 잡으면 "Mike는"에서 한글을 낱말로 봐 어긋난다.
FLIP_RE = re.compile(
    # 우리말은 낱말 첫머리에서만 본다. 앞에 한글이 붙어 있으면 낱말 가운데이므로
    # 건드리면 안 된다 — 「받아들여야」의 아들을 딸로 바꿔 「받딸여야」가 되었다.
    r"(?<![A-Za-z'])(?:%s)(?![A-Za-z'])|(?<![가-힣])(?:%s)"
    % ("|".join(re.escape(w) for w in _ENGLISH),
       "|".join(re.escape(w) for w in _KOREAN)))

# 소유격인지 목적격인지 갈리는 말. 나오면 건드리지 않는다.
AMBIGUOUS = re.compile(r"\b(his|His|her|Her|hers|Hers)\b")

# 우리말 성별 표지인데 위 짝에 없는 것. 하나라도 있으면 뒤집을 수 없다.
KOREAN_UNSAFE = re.compile(
    r"(형|누나|오빠|언니|남동생|여동생|시아버지|시어머니|장인|장모|"
    r"신사|숙녀|아저씨|아주머니|고모|이모부|조카딸|며느리|사위)")

# 성별을 지녔는데 짝을 지어 두지 않은 영어 낱말. 하나라도 있으면 뒤집을 수 없다.
ENGLISH_UNSAFE = re.compile(
    r"(widow|widower|bride|groom|hero|heroine|monk|nun|"
    r"policeman|policewoman|salesman|saleswoman|chairman|chairwoman|"
    r"stepfather|stepmother|godfather|godmother|bull|cow|rooster|hen)",
    re.I)

# 사람 이름일 수 있는 대문자 낱말. 이 목록 밖의 낱말이 있으면 성별을 알 수 없다.
SAFE_CAPS = set("""
The This That These Those What When Where Which Who Whom Whose Why How
I It They We You There Here Do Does Did Is Are Was Were Am Be Been Being
Have Has Had Will Would Can Could May Might Must Should Shall Let
My Your Our Their Its Not No Yes If As And But Or So Because Although
Though While Since Until Unless After Before A An Of In On At To For From
With By About Into Over Under Than Then Now Today Tomorrow Yesterday
Every Each Some Any All Both Many Much More Most Few Little Less Least
One Two Three Four Five Six Seven Eight Nine Ten Eleven Twelve
Monday Tuesday Wednesday Thursday Friday Saturday Sunday
January February March April June July August September October November
December English Korean Look Listen Please Thank Sorry Well Oh Good Nice
Great Really Just Only Even Still Also Too Very Such Same Other Another
Next Last First Second Third Never Always Often Sometimes Usually Hardly
Neither Either However Once Whether Nobody Nothing Everyone Everybody
Someone Somebody Anyone Anybody People Tell Take Make Give Keep Come Go
Get Put Turn Open Close Stop Start Try Help Find Think Know See Say
""".split())

CAP_RE = re.compile(r"\b[A-Z][a-z]{1,13}\b")


def can_flip(texts, known_names=()):
    """이 글의 성별을 통째로 뒤집어도 되는지."""
    blob = " ".join(texts)
    blob = re.sub(r"\[\[|\]\]", "", blob)
    if AMBIGUOUS.search(blob):
        return False
    if KOREAN_UNSAFE.search(blob):
        return False
    if ENGLISH_UNSAFE.search(blob):
        return False
    allowed = SAFE_CAPS | set(known_names) | {w for w in FLIP if w[:1].isupper()}
    for word in CAP_RE.findall(blob):
        if word not in allowed:
            return False                 # 성별을 알 수 없는 이름이 섞여 있다
    return bool(FLIP_RE.search(blob))


def flip(text):
    return FLIP_RE.sub(lambda m: FLIP[m.group(0)], text)


LEFT = {left for left, _ in PAIRS} | {left.capitalize() for left, _ in PAIRS}
RIGHT = {right for _, right in PAIRS} | {right.capitalize() for _, right in PAIRS}


def sides(texts):
    """이 글에 남자 쪽 말과 여자 쪽 말이 각각 있는지."""
    found = set()
    for text in texts:
        for match in FLIP_RE.finditer(re.sub(r"\[\[|\]\]", "", text)):
            token = match.group(0)
            if token in LEFT:
                found.add("L")
            if token in RIGHT:
                found.add("R")
    return found


def stays_consistent(before, after):
    """뒤집기 전에 한쪽만 있었다면, 뒤집은 뒤에도 한쪽만 있어야 한다."""
    return not (len(sides(before)) == 1 and len(sides(after)) > 1)

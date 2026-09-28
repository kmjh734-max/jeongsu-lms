# -*- coding: utf-8 -*-
"""낱말 교체 — 뜻만 갈아 끼우고 어법은 그대로 두는 바꿔치기.

영어만 바꾸면 우리말 해석이 어긋나므로 짝을 지어 함께 바꾼다.
바꿔도 되는 낱말끼리 묶으려면 세 가지가 같아야 하는데, 이제 코드가 따진다.
 - 영어 첫소리가 모음인지 (a / an이 바뀌지 않게)
 - 우리말에 받침이 있는지 (은·는, 이·가, 과·와가 깨지지 않게)
 - 셀 수 있는 단수 명사인지 (묶음을 그렇게만 모아 둔다)

뜻이 여럿인 낱말은 넣지 않는다. 우리말로 갈리는 것(말·새·자·개)도,
영어로 갈리는 것(kind는 '종류', spring은 '용수철')도 뺐다.
동사와 형용사는 뒤따르는 문장 구조를 바꿔 버려서(found it messy는 되지만
lost it messy는 안 된다) 다루지 않는다.
"""
import re

import korean as kor

VOWEL = "aeiouAEIOU"


def has_final(word):
    """우리말 마지막 글자에 받침이 있는지. 조사가 갈리는 기준이다."""
    for char in reversed(word):
        if "가" <= char <= "힣":
            return (ord(char) - 0xAC00) % 28 != 0
    return True                      # 한글이 없으면 섞이지 않게 따로 둔다


# 넉넉히 적어 두면 코드가 첫소리와 받침을 따져 알아서 갈라 묶는다.
GROUPS = {
    "학용품": [("pencil", "연필"), ("notebook", "공책"), ("bag", "가방"),
             ("eraser", "지우개"), ("crayon", "크레용"), ("textbook", "교과서"),
             ("umbrella", "우산")],
    "동물": [("dog", "강아지"), ("cat", "고양이"), ("rabbit", "토끼"),
           ("monkey", "원숭이"), ("tiger", "호랑이"), ("elephant", "코끼리"),
           ("horse", "조랑말"), ("turtle", "거북이")],
    "장소": [("park", "공원"), ("library", "도서관"), ("museum", "박물관"),
           ("hospital", "병원"), ("church", "교회"),
           ("theater", "극장"), ("airport", "공항"), ("restaurant", "식당"),
           ("bakery", "빵집"), ("market", "시장"), ("beach", "해변"),
           ("zoo", "동물원"), ("school", "학교"), ("office", "사무실"),
           ("factory", "공장"), ("hotel", "호텔")],
    "운동": [("soccer", "축구"), ("baseball", "야구"), ("basketball", "농구"),
           ("tennis", "테니스"), ("badminton", "배드민턴"), ("golf", "골프"),
           ("swimming", "수영"), ("skiing", "스키")],
    "요일": [("Monday", "월요일"), ("Tuesday", "화요일"), ("Wednesday", "수요일"),
           ("Thursday", "목요일"), ("Friday", "금요일"), ("Saturday", "토요일"),
           ("Sunday", "일요일")],
    "달": [("January", "1월"), ("February", "2월"), ("March", "3월"),
          ("April", "4월"), ("June", "6월"), ("July", "7월"),
          ("August", "8월"), ("September", "9월"), ("October", "10월"),
          ("November", "11월"), ("December", "12월")],
    "도시": [("Seoul", "서울"), ("Busan", "부산"), ("Incheon", "인천"),
           ("Daegu", "대구"), ("Gwangju", "광주"), ("Jeju", "제주")],
    "나라": [("Canada", "캐나다"), ("France", "프랑스"), ("Japan", "일본"),
           ("Italy", "이탈리아"), ("Spain", "스페인"), ("Australia", "호주")],
    "음식": [("pizza", "피자"), ("salad", "샐러드"), ("soup", "수프"),
           ("sandwich", "샌드위치"), ("spaghetti", "스파게티"),
           ("hamburger", "햄버거"), ("cookie", "쿠키"), ("cake", "케이크")],
    "과일": [("banana", "바나나"), ("strawberry", "딸기"), ("grape", "포도"),
           ("peach", "복숭아"), ("melon", "멜론"), ("mango", "망고")],
    "직업": [("doctor", "의사"), ("nurse", "간호사"), ("singer", "가수"),
           ("pilot", "조종사"), ("dancer", "무용수"), ("designer", "디자이너"),
           ("reporter", "기자"), ("scientist", "과학자")],
    "색": [("red", "빨간색"), ("blue", "파란색"), ("green", "초록색"),
          ("yellow", "노란색"), ("black", "검은색"), ("white", "흰색")],
    "사람": [("friend", "친구"), ("classmate", "반 친구"), ("teammate", "팀 동료")],
    "탈것": [("bus", "버스"), ("taxi", "택시"), ("bike", "자전거"),
           ("train", "기차"), ("boat", "보트"), ("plane", "비행기"),
           ("car", "자동차"), ("truck", "트럭")],
    "가구": [("desk", "책상"), ("window", "창문"), ("sofa", "소파"),
           ("mirror", "거울"), ("clock", "시계"), ("lamp", "전등")],
    "악기": [("piano", "피아노"), ("violin", "바이올린"), ("flute", "플루트"),
           ("cello", "첼로")],
    "옷": [("shirt", "셔츠"), ("skirt", "치마"), ("jacket", "재킷"),
          ("sweater", "스웨터"), ("scarf", "목도리")],
    "여가": [("concert", "콘서트"), ("picnic", "소풍"), ("festival", "축제"),
           ("party", "파티"), ("contest", "대회")],
    "집안": [("room", "방"), ("kitchen", "부엌"), ("roof", "지붕"),
           ("garage", "차고"), ("basement", "지하실")],
    "건물": [("house", "주택"), ("apartment", "아파트"), ("cottage", "오두막")],
    "끼니": [("breakfast", "아침식사"), ("lunch", "점심식사"),
           ("dinner", "저녁식사")],
    "물건": [("letter", "편지"), ("gift", "선물"), ("box", "상자"),
           ("basket", "바구니"), ("blanket", "담요"), ("candle", "양초"),
           ("towel", "수건"), ("poster", "포스터"), ("ticket", "입장권")],
    "식기": [("cup", "컵"), ("plate", "접시"), ("spoon", "숟가락"),
           ("fork", "포크")],
    "일터사람": [("writer", "작가"), ("farmer", "농부"), ("driver", "운전사"),
             ("painter", "화가")],
    "자연물": [("flower", "꽃"), ("tree", "나무"), ("cloud", "구름"),
            ("stone", "돌멩이"), ("rainbow", "무지개")],
    "길": [("road", "도로"), ("bridge", "다리"), ("tunnel", "터널")],
    "자연": [("mountain", "산"), ("river", "강"), ("lake", "호수"),
           ("forest", "숲"), ("island", "섬"), ("garden", "정원")],
    "기기": [("phone", "휴대폰"), ("camera", "카메라"), ("computer", "컴퓨터"),
           ("wallet", "지갑"), ("radio", "라디오")],
    "음료": [("coffee", "커피"), ("juice", "주스"), ("milk", "우유")],
    "때": [("morning", "아침"), ("afternoon", "오후"), ("evening", "저녁")],
}


# 복수형을 못 만드는 낱말(불규칙·셀 수 없음)은 홑으로만 쓴다.
NO_PLURAL = {"swimming", "skiing", "badminton", "golf", "soccer", "baseball",
             "basketball", "tennis", "coffee", "juice", "milk", "morning",
             "afternoon", "evening", "Seoul", "Busan", "Incheon", "Daegu",
             "Gwangju", "Jeju", "Canada", "France", "Japan", "Italy", "Spain",
             "Australia", "red", "blue", "green", "yellow", "black", "white",
             "spaghetti"}
DAYS_MONTHS = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
               "Saturday", "Sunday", "January", "February", "March", "April",
               "June", "July", "August", "September", "October", "November",
               "December"}


def plural(english):
    """규칙 복수형만 만든다. 불규칙은 손대지 않는다."""
    if english in NO_PLURAL or english in DAYS_MONTHS or " " in english:
        return None
    if english.endswith(("s", "x", "z", "ch", "sh")):
        return english + "es"
    if english.endswith("y") and english[-2] not in "aeiou":
        return english[:-1] + "ies"
    if english.endswith("o") and english not in ("piano", "radio", "cello"):
        return english + "es"
    return english + "s"



def build_pools():
    """바꿔 써도 되는 것끼리 갈라 묶는다.

    한 낱말은 단수·복수·영어·우리말 네 모습을 한 덩어리로 들고 다닌다.
    그래야 "책 두 권"과 "two books"가 서로 다른 낱말로 갈라지지 않는다.
    """
    pools = []
    for entries in GROUPS.values():
        buckets = {}
        for english, hangul in entries:
            concept = {
                "en": english, "ko": hangul,
                "en_pl": plural(english), "ko_pl": hangul + "들",
            }
            key = (english[0] in VOWEL, has_final(hangul))
            buckets.setdefault(key, []).append(concept)
        for bucket in buckets.values():
            if len(bucket) > 1:          # 혼자면 바꿀 상대가 없다
                pools.append(bucket)
    return pools


POOLS = build_pools()

# 어떤 모습으로 나오든 그 덩어리를 찾아갈 수 있게 해 둔다.
WHERE, FORM = {}, {}
for _index, _pool in enumerate(POOLS):
    for _at, _concept in enumerate(_pool):
        for _key in ("en", "en_pl", "ko", "ko_pl"):
            _word = _concept[_key]
            if _word:
                WHERE[_word] = (_index, _at)
                FORM[_word] = _key

ENGLISH_WORDS = [w for w in WHERE if re.fullmatch(r"[A-Za-z ]+", w)]
HANGUL_WORDS = [w for w in WHERE if w not in ENGLISH_WORDS]


def _eng(words):
    """영어 낱말 경계. 한글이 바로 붙어도("book을") 낱말 끝으로 본다."""
    body = "|".join(re.escape(w) for w in sorted(words, key=len, reverse=True))
    return r"(?<![A-Za-z'])(%s)(?![A-Za-z'])" % body


ENGLISH_RE = re.compile(_eng(ENGLISH_WORDS))
HANGUL_RE = re.compile(kor.pattern(HANGUL_WORDS))


def occurrences(text):
    """이 글에 나온 낱말들. 영어든 우리말이든, 단수든 복수든."""
    clean = re.sub(r"\[\[.*?\]\]", " ", text)
    return ENGLISH_RE.findall(clean) + HANGUL_RE.findall(clean)


def plan(texts, locked, rng, limit=4, visible=None):
    """바꿀 낱말을 고른다. (바꿈표, 바꾼 영어 낱말표)를 돌려준다.

    한 덩어리에 걸린 모든 모습(단수·복수·영어·우리말)을 한꺼번에 바꾼다.
    """
    whole = " ".join(texts)
    seen = " ".join(visible if visible is not None else texts)
    allowed = {WHERE[w] for w in occurrences(seen)}
    here, blocked = [], set()
    for word in occurrences(whole):
        spot = WHERE[word]
        if word.lower() in locked or (FORM[word].startswith("en")
                                      and word.lower() in locked):
            blocked.add(spot)
            continue
        if spot in allowed and spot not in here:
            here.append(spot)
    here = [spot for spot in here if spot not in blocked]
    if not here:
        return None, None

    rng.shuffle(here)
    table, moved = {}, {}
    taken = {spot for spot in (WHERE[w] for w in occurrences(whole))}
    for spot in here[:limit]:
        pool = POOLS[spot[0]]
        source = pool[spot[1]]
        pick = [c for at, c in enumerate(pool)
                if (spot[0], at) not in taken
                and not any((c[k] or "").lower() in locked for k in ("en", "en_pl"))]
        if not pick:
            continue
        target = rng.choice(pick)
        taken.add((spot[0], pool.index(target)))
        for key in ("en", "en_pl", "ko", "ko_pl"):
            if source[key] and target[key]:
                table[source[key]] = target[key]
        moved[source["en"]] = target["en"]
    if not table:
        return None, None
    return table, moved


def pattern_for(table):
    english = [k for k in table if re.fullmatch(r"[A-Za-z ]+", k)]
    hangul = [k for k in table if k not in english]
    parts = []
    if english:
        parts.append(_eng(english))
    if hangul:
        parts.append(kor.pattern(hangul))
    return re.compile("|".join(parts))

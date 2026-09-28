# -*- coding: utf-8 -*-
"""변형문제에 쓸 낱말 바꿈표.

바꾼 뒤에도 문법이 그대로여야 하므로, 짝이 되는 말은 다음을 지킨다.
  - 단수는 단수로, 복수는 복수로 (수일치 문제가 깨지지 않게)
  - 셀 수 있는 말은 셀 수 있는 말로 (관사·수량표현 문제가 깨지지 않게)
  - 사람 이름은 같은 성별끼리 (뒤따르는 he/she가 어긋나지 않게)
형용사와 동사는 보기에 반대말·활용형으로 숨어 있는 일이 많아 손대지 않는다.
"""

SWAP = {
    # 사람 이름 — 남
    "Tom": "Brian", "Mike": "Jake", "Kevin": "Aaron", "Andy": "Leo",
    "John": "Peter", "David": "Henry", "James": "Victor", "Jack": "Simon",
    "Bob": "Frank", "Sam": "Eric", "Bill": "Roy", "Chris": "Dylan",
    "Paul": "Marcus", "Steve": "Trevor", "Ben": "Nathan", "Tony": "Felix",
    "Mark": "Owen", "Alex": "Blake", "Daniel": "Gavin", "Brian": "Colin",
    "Minho": "Junho", "Jiho": "Sungho", "Minsu": "Doyun", "Jinho": "Taeho",
    # 사람 이름 — 여
    "Sora": "Yuna", "Mina": "Jiwon", "Suji": "Hana", "Jenny": "Emily",
    "Julie": "Nina", "Sarah": "Laura", "Anna": "Rosa", "Jane": "Fiona",
    "Mary": "Alice", "Lucy": "Molly", "Amy": "Ruby", "Kate": "Sophie",
    "Emma": "Chloe", "Lisa": "Diana", "Susan": "Grace", "Nancy": "Irene",
    "Jisoo": "Haeun", "Yuri": "Sohee", "Jina": "Bora",
    # 사물 — 단수 가산
    "notebook": "diary", "pen": "pencil",
    "pencil": "crayon", "bag": "backpack", "backpack": "suitcase",
    "box": "basket", "basket": "bucket", "chair": "bench", "bench": "stool",
    "table": "desk", "desk": "shelf", "car": "truck", "truck": "van",
    "bike": "scooter", "bicycle": "motorcycle", "computer": "laptop", "laptop": "printer", "camera": "speaker",
    "letter": "postcard", "postcard": "poster", "ticket": "coupon",
    "window": "curtain", "door": "gate", "house": "cottage",
    "garden": "yard", "room": "office", "kitchen": "garage",
    "library": "museum", "museum": "gallery", "restaurant": "diner", "hospital": "clinic", "station": "terminal",
    "airport": "harbor", "beach": "lake", "lake": "river",
    "river": "valley", "mountain": "hill", "hill": "cliff",
    "city": "town", "town": "village", "street": "alley", "road": "path",
    "bridge": "tunnel", "movie": "drama", "drama": "musical",
    "song": "poem", "poem": "novel", "novel": "comic", "story": "article",
    "article": "essay", "game": "puzzle", "puzzle": "riddle",
    "party": "festival", "festival": "concert", "concert": "contest",
    "contest": "match", "meeting": "seminar", "test": "exam",
    "exam": "interview", "word": "phrase", "gift": "souvenir", "flower": "plant",
    "tree": "bush", "job": "career", "trip": "journey",
    "vacation": "holiday", "hobby": "pastime", "idea": "opinion", "birthday": "wedding",
    # 사물 — 더 보탠 것
    "hat": "cap", "shirt": "jacket", "shoes": "boots", "dress": "skirt",
    "coat": "sweater", "umbrella": "raincoat", "ball": "balloon",
    "doll": "robot", "toy": "block", "guitar": "violin", "piano": "flute",
    "cup": "mug", "bottle": "jar", "plate": "bowl", "spoon": "fork",
    "clock": "calendar", "map": "chart", "newspaper": "magazine",
    "magazine": "brochure", "wall": "ceiling", "bus": "subway",
    "train": "ferry", "plane": "helicopter", "ship": "yacht",
    "boat": "canoe", "zoo": "farm", "market": "mall", "church": "temple",
    "hotel": "motel", "forest": "desert", "island": "peninsula",
    "pool": "gym", "stage": "studio", "club": "team", "group": "crowd",
    "parents": "relatives", "student": "classmate",
    # 사물 — 셀 수 없는 말
    "milk": "soup", "bread": "cheese", "rice": "pasta",
    "coffee": "tea", "money": "cash", "grass": "sand", "rain": "snow",
    "homework": "housework",
    # 음식 — 단수 가산
    "cake": "pie", "cookie": "muffin", "apple": "peach", "banana": "mango",
    "egg": "bean", "dinner": "supper", "breakfast": "brunch",
    # 동물
    "dog": "puppy", "cat": "rabbit", "bird": "duck", "horse": "pony",
    "lion": "tiger", "elephant": "giraffe", "monkey": "panda",
    # 사람
    "doctor": "dentist", "teacher": "coach", "friend": "neighbor",
    "brother": "cousin", "sister": "aunt", "mother": "grandmother",
    "father": "grandfather", "son": "nephew", "daughter": "niece",
    "baby": "kid", "singer": "dancer", "writer": "painter",
    "player": "captain", "driver": "pilot", "farmer": "gardener",
    # 과목·활동
    "math": "biology", "science": "geography", "music": "art",
    "soccer": "baseball", "tennis": "badminton",
}

# 이 낱말이 문제 안에 있으면 그 문제는 손대지 않는다.
# (셀 수 없는 명사 함정, 수일치 함정, 시간 표현 등 문제의 핵심이 되는 말)
KEEP_AWAY = {
    "news", "advice", "information", "furniture", "luggage", "baggage",
    "equipment", "bread", "paper", "hair", "people", "police", "cattle",
    "children", "child", "man", "men", "woman", "women", "person",
    "fish", "sheep", "deer", "glasses", "scissors", "pants", "clothes",
}


# 우리말 뜻이 함께 적힌 문제에서는 영어와 우리말을 같이 바꿔야 한다.
# 여기에 짝이 적힌 낱말만 그런 문제에 쓴다.
# ('차, 말, 산, 문'처럼 다른 뜻으로도 읽히는 한 글자 말은 일부러 뺐다.)
KOREAN = {
    "movie": ("영화", "드라마"), "letter": ("편지", "엽서"),
    "bicycle": ("자전거", "오토바이"), "friend": ("친구", "이웃"),
    "cat": ("고양이", "토끼"), "teacher": ("선생님", "코치"),
    "doctor": ("의사", "치과의사"), "homework": ("숙제", "집안일"),
    "money": ("돈", "현금"), "milk": ("우유", "수프"),
    "coffee": ("커피", "차"), "cake": ("케이크", "파이"),
    "cookie": ("쿠키", "머핀"), "banana": ("바나나", "망고"),
    "egg": ("달걀", "콩"), "hospital": ("병원", "진료소"),
    "library": ("도서관", "박물관"), "restaurant": ("식당", "분식점"),
    "airport": ("공항", "항구"), "beach": ("해변", "호수"),
    "city": ("도시", "마을"), "song": ("노래", "시"),
    "story": ("이야기", "기사"), "game": ("게임", "퍼즐"),
    "party": ("파티", "축제"), "concert": ("콘서트", "대회"),
    "test": ("시험", "면접"), "job": ("직업", "경력"),
    "trip": ("여행", "여정"), "birthday": ("생일", "결혼식"),
    "flower": ("꽃", "화초"), "tree": ("나무", "덤불"),
    "window": ("창문", "커튼"), "room": ("방", "사무실"),
    "kitchen": ("부엌", "차고"), "truck": ("트럭", "승합차"),
    "chair": ("의자", "벤치"), "box": ("상자", "바구니"),
    "bag": ("가방", "배낭"), "pen": ("펜", "연필"),
    "computer": ("컴퓨터", "노트북"), "camera": ("카메라", "스피커"),
    "baby": ("아기", "아이"), "soccer": ("축구", "야구"),
    "tennis": ("테니스", "배드민턴"), "math": ("수학", "생물"),
    "science": ("과학", "지리"), "music": ("음악", "미술"),
    "Tom": ("톰", "브라이언"), "Mike": ("마이크", "제이크"),
    "Jenny": ("제니", "에밀리"), "Emma": ("엠마", "클로이"),
    "Kevin": ("케빈", "에런"), "Sora": ("소라", "유나"),
    "Mina": ("미나", "지원"), "Minho": ("민호", "준호"),
    "Jiho": ("지호", "성호"), "Minsu": ("민수", "도윤"),
}

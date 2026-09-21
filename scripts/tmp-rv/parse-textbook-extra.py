# 교과서 본문 PDF → 본문1·본문2…·추가지문1… 로 나눈 JSON (영어 + 출판사가 실은 한글 해석)
#
# 본문 뒤에 Read More / Further Reading 처럼 딸린 지문이 있는데, 내용정리 플러스에는
# 표시가 없어서 앞 본문 덩어리에 붙어 버렸다. 그 제목 자리에서 잘라 따로 뽑는다.
#   python scripts/tmp-rv/parse-textbook.py "참고파일/교과서/공통영어2" scripts/tmp-rv/tb-공통영어2.json
#
# 나누는 기준은 "내용정리 플러스"의 본문❶·❷… 표시다. 그 자료의 '문장 학습'에 실린
# 번호 붙은 영어 문장을 모아, 본문 문장마다 어느 덩어리인지 맞춰 자른다.
import sys, glob, json, os, re
import fitz

SRC, OUT = sys.argv[1], sys.argv[2]

# 파일 이름: (2022개정)2025년_공통영어2_YBM(박준언)_1과_본문_(20250723수정).pdf
NAME = re.compile(
    r"^\((?P<rev>[^)]+)\)(?P<year>\d{4})년_(?P<subject>[^_]+)_(?P<publisher>[^_]+)_(?P<lesson>[^_]+)_(?P<kind>본문|내용정리 플러스)"
)
HEAD = re.compile(r"^(2022 개정|교과서 본문|공통영어\d?|영어[I1-2]{1,3}|- ?\d+ ?-|\d+)\s*$")
KO = re.compile(r"[가-힣]")
MARK = re.compile(r"본문([❶-➓①-⑳❶-❿])")
# 본문 뒤에 딸린 지문의 제목 — 출판사마다 부르는 이름이 다르다.
# 교과서 251권을 훑어 되풀이되는 제목을 전부 모았다(2026-09-21).
EXTRA_NAMES = (
    "read\s*more|further\s*reading|read\s*further|read\s*on|"
    "world\s*link|inside\s*culture|deep\s*learning"
)
# 제목은 문장 첫머리에 온다. 가운데서 우연히 걸리면(‘deep learning 기술’ 같은 말) 안 되니 앞만 본다.
EXTRA = re.compile(r"^[\s“”\"']*(" + EXTRA_NAMES + r")\b", re.I)
# 앞머리로 못 찾았을 때만 쓰는 느슨한 짝 — 우연히 걸릴 일이 없는 이름만 둔다
EXTRA_LOOSE = re.compile(r"\b(read\s*more|further\s*reading|read\s*further|world\s*link|inside\s*culture)\b", re.I)





def page_paragraphs(page):
    """쪽에서 (영어 문단, 한글 문단)을 y위치와 함께 뽑는다.

    - 칸은 x가 아니라 글자 종류로 가른다(양끝 맞춤 때문에 영어 조각이 오른쪽까지 밀려 있다).
    - 한 줄이 여러 조각으로 쪼개져 있으므로 y가 같은 조각끼리 먼저 묶는다.
    - 문단 시작은 들여쓰기(이어지는 줄보다 오른쪽에서 시작)로 가른다.
    """
    cols = {False: {}, True: {}}
    for block in page.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            x0, y0 = line["bbox"][0], line["bbox"][1]
            if y0 < 70 or y0 > page.rect.height - 40:
                continue
            raw = "".join(sp["text"] for sp in line["spans"])
            if not raw.strip() or HEAD.match(raw.strip()):
                continue
            cols[bool(KO.search(raw))].setdefault(round(y0 / 4), []).append((x0, raw))

    def paragraphs(is_ko):
        rows = []
        for ykey in sorted(cols[is_ko]):
            parts = sorted(cols[is_ko][ykey], key=lambda t: t[0])
            text = ("" if is_ko else " ").join(t for _, t in parts)
            rows.append((parts[0][0], ykey * 4, text))
        if not rows:
            return []
        xs = [round(x, 1) for x, _, _ in rows]
        body_x = min(xs, key=lambda v: (-xs.count(v), v))
        paras, cur = [], []
        for x, y, raw in rows:
            if cur and round(x, 1) != body_x:
                paras.append(cur)
                cur = []
            cur.append((y, raw))
        if cur:
            paras.append(cur)
        join = "" if is_ko else " "
        out = []
        for para in paras:
            text = join.join(t for _, t in para).strip()
            if text:
                out.append((para[0][0], text))
        return out

    return paragraphs(False), paragraphs(True)


def read_body(path):
    """영어 문단마다 같은 높이의 한글 문단을 짝지어 돌려준다"""
    doc = fitz.open(path)
    pairs = []
    for page in doc:
        en, ko = page_paragraphs(page)
        used = set()
        for y, text in en:
            def nearest(skip_used):
                best, best_d = None, 1e9
                for i, (ky, _t) in enumerate(ko):
                    if skip_used and i in used:
                        continue
                    d = abs(ky - y)
                    if d < best_d:
                        best, best_d = i, d
                return best, best_d

            best, best_d = nearest(True)
            if best is None or best_d > 60:
                alt, alt_d = nearest(False)
                if alt is not None and alt_d < 120 and (best is None or alt_d < best_d):
                    best, best_d = alt, alt_d
            ko_text = ""
            if best is not None and best_d < 120:
                used.add(best)
                ko_text = ko[best][1]
            pairs.append({
                "en": re.sub(r"\s+", " ", text).strip(),
                "ko": re.sub(r"[ ]{2,}", " ", ko_text).strip(),
            })
    return pairs


def sentence_pairs(pairs):
    """문단 쌍을 문장 쌍으로 편다. 한 문단 안에서 영어·해석 문장을 수에 맞춰 나눈다."""
    out = []
    for p in pairs:
        en_s = [x.strip() for x in re.split(r'(?<=[.!?”"])\s+', p["en"]) if x.strip()]
        ko_s = [x.strip() for x in re.split(r'(?<=[.!?”])\s+', p["ko"]) if x.strip()]
        if not en_s:
            continue
        if ko_s and len(ko_s) == len(en_s):
            for e, k in zip(en_s, ko_s):
                out.append({"en": e, "ko": k})
        elif ko_s:
            for i, e in enumerate(en_s):
                a = round(i * len(ko_s) / len(en_s))
                b = max(a + 1, round((i + 1) * len(ko_s) / len(en_s)))
                out.append({"en": e, "ko": " ".join(ko_s[a:b])})
        else:
            for e in en_s:
                out.append({"en": e, "ko": ""})
    return out


def first_words(text, n=6):
    return " ".join(re.sub(r"[^A-Za-z' ]", " ", text).split()[:n]).lower()


def block_anchors(path):
    """내용정리 플러스: 본문❶·❷… 마다 '문장 학습'의 번호 붙은 영어 문장을 모두 모은다"""
    doc = fitz.open(path)
    full = "\n".join(pg.get_text() for pg in doc)
    marks = list(MARK.finditer(full))
    blocks = {}
    for i, m in enumerate(marks):
        stop = marks[i + 1].start() if i + 1 < len(marks) else len(full)
        sents = []
        for line in full[m.end():stop].split("\n"):
            hit = re.match(r'^\d+\s+([A-Za-z“"].{12,})$', line.strip())
            if hit and not KO.search(hit.group(1)):
                sents.append(hit.group(1))
        if sents:
            blocks.setdefault(m.group(1), []).extend(sents)
    order = sorted(blocks.keys(), key=ord)
    return [(i + 1, blocks[c]) for i, c in enumerate(order)]


def split_at(pairs, starts):
    """정해진 문장 번호에서 자른다(영어·해석을 함께)"""
    blocks = []
    for i, st in enumerate(starts):
        end = starts[i + 1] if i + 1 < len(starts) else len(pairs)
        chunk = pairs[st:end]
        en = " ".join(p["en"] for p in chunk).strip()
        seen_ko = []
        for p in chunk:
            if p["ko"] and p["ko"] not in seen_ko:
                seen_ko.append(p["ko"])
        ko = " ".join(seen_ko).strip()
        if not en:
            continue
        if len(en.split()) < 25 and blocks:
            # 소제목만 있는 조각은 앞 덩어리에 붙인다
            blocks[-1]["en"] = f"{blocks[-1]['en']} {en}".strip()
            blocks[-1]["ko"] = f"{blocks[-1]['ko']} {ko}".strip()
            continue
        blocks.append({"en": en, "ko": ko})
    return blocks


def split_blocks(pairs, anchors):
    """문장마다 덩어리 번호를 붙이고(문장 학습과 대조), 번호가 바뀌는 자리에서 자른다"""
    if not anchors:
        return []
    keys = [(no, {first_words(x, 5) for x in sents if first_words(x, 5)}) for no, sents in anchors]
    assigned = [next((no for no, ks in keys if first_words(p["en"], 5) in ks), None) for p in pairs]

    # 못 찾은 문장(주석 때문에 줄이 잘린 문장)은 앞 문장을 따른다. 번호는 뒤로만 간다.
    last = 1
    filled = []
    for a in assigned:
        if a is not None and a >= last:
            last = a
        filled.append(last)

    starts = [0] + [i for i in range(1, len(filled)) if filled[i] != filled[i - 1]]
    return split_at(pairs, starts)


def heading_starts(pairs):
    """내용정리 플러스가 없는 과: 소제목(짧고 마침표 없는 문장)에서 나눈다"""
    starts = []
    for i, p in enumerate(pairs):
        en = p["en"].strip()
        if not en:
            continue
        head_like = len(en.split()) <= 12 and not en.endswith((".", "!", "?", "”", '"'))
        if i == 0 or head_like:
            starts.append(i)
    return starts or [0]


rows = []
for path in sorted(glob.glob(os.path.join(SRC, "*본문*.pdf"))):
    name = os.path.basename(path)
    m = NAME.match(name)
    if not m:
        print("이름 모양이 달라 건너뜀:", name)
        continue
    subject, publisher, lesson = m.group("subject"), m.group("publisher"), m.group("lesson")
    plus = glob.glob(os.path.join(SRC, f"*{subject}_{publisher}_{lesson}_내용정리*.pdf"))
    pairs = sentence_pairs(read_body(path))
    anchors = block_anchors(plus[0]) if plus else []

    # 딸린 지문이 시작되는 문장 — 제목이 붙은 문장부터 뒤는 전부 추가 지문이다
    extra_at = next((i for i, p in enumerate(pairs) if EXTRA.search(p["en"])), None)
    if extra_at is None:
        # 제목이 앞 문장 끝에 붙어 버린 경우 — 이름이 뚜렷한 것만 가운데서도 찾는다
        extra_at = next((i for i, p in enumerate(pairs) if EXTRA_LOOSE.search(p["en"])), None)
    main_pairs = pairs[:extra_at] if extra_at is not None else pairs
    extra_pairs = pairs[extra_at:] if extra_at is not None else []

    blocks = split_blocks(main_pairs, anchors)
    if len(blocks) <= 1:
        blocks = split_at(main_pairs, heading_starts(main_pairs)) or blocks
    for i, b in enumerate(blocks, start=1):
        rows.append({
            "subject": subject,
            "publisher": publisher,
            "lesson": lesson,
            "part": f"본문{i}",
            "label": f"{subject} {publisher} {lesson} 본문{i}",
            "english_text": b["en"],
            "korean_text": b["ko"],
            "words": len(b["en"].split()),
            "file": name,
        })

    if extra_pairs:
        # 'Read More' / 'Further Reading' 이라는 말 자체는 지문이 아니라 표시다 — 지운다
        head = dict(extra_pairs[0])
        head["en"] = EXTRA_LOOSE.sub("", EXTRA.sub("", head["en"])).strip()
        extra_pairs = [head] + extra_pairs[1:]
    extras = split_at(extra_pairs, heading_starts(extra_pairs)) if extra_pairs else []
    # 제목만 남은 앞 덩어리는 뒤 지문에 붙인다 (split_at 은 앞으로만 붙일 줄 안다)
    while len(extras) > 1 and len(extras[0]["en"].split()) < 25:
        extras[1]["en"] = f"{extras[0]['en']} {extras[1]['en']}".strip()
        extras[1]["ko"] = f"{extras[0]['ko']} {extras[1]['ko']}".strip()
        extras.pop(0)
    extras = [b for b in extras if b["en"].strip()]
    for i, b in enumerate(extras, start=1):
        rows.append({
            "subject": subject,
            "publisher": publisher,
            "lesson": lesson,
            "part": f"추가지문{i}",
            "label": f"{subject} {publisher} {lesson} 추가지문{i}",
            "english_text": b["en"],
            "korean_text": b["ko"],
            "words": len(b["en"].split()),
            "file": name,
        })

    want = len(anchors)
    flag = "" if not want or want == len(blocks) else f"  <- 내용정리는 {want}개"
    tail = f" + 추가지문 {len(extras)}개" if extras else ""
    print(f"{subject} {publisher} {lesson}: 본문 {len(blocks)}개(해석 {sum(1 for b in blocks if b['ko'])}){tail}{flag}")

json.dump(rows, open(OUT, "w", encoding="utf8"), ensure_ascii=False, indent=1)
print("지문", len(rows), "개 저장:", OUT)

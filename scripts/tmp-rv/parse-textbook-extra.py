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
    r"read\s*more|further\s*reading|read\s*further|read\s*on|"
    r"world\s*link|inside\s*culture|deep\s*learning"
)
# 제목은 문장 첫머리에 온다. 가운데서 우연히 걸리면(‘deep learning 기술’ 같은 말) 안 되니 앞만 본다.
EXTRA = re.compile(r"^[\s“”\"']*(" + EXTRA_NAMES + r")\b", re.I)
# 앞머리로 못 찾았을 때만 쓰는 느슨한 짝 — 우연히 걸릴 일이 없는 이름만 둔다
EXTRA_LOOSE = re.compile(r"\b(read\s*more|further\s*reading|read\s*further|world\s*link|inside\s*culture)\b", re.I)





# 쪽 위에 겹쳐 찍힌 저작권 문구 — 글자가 본문 줄 사이에 섞여 들어온다
NOISE = re.compile(r"무단전재|복제를금|저작권법|라이센스를획득")


def noise_styles(page):
    """워터마크처럼 본문 줄에 글자가 섞여 드는 스타일(글꼴·크기)을 찾는다.

    쪽 안의 글꼴·크기별로 글자를 모으면 저작권 문구가 한 스타일에 몰려 스스로 드러난다.
    낱말을 지우는 대신 스타일을 통째로 빼면 본문을 건드릴 일이 없다.
    """
    by = {}
    for block in page.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            for sp in line["spans"]:
                key = (sp["font"], round(sp["size"], 1))
                by[key] = by.get(key, "") + sp["text"]
    return {k for k, t in by.items() if NOISE.search(re.sub(r"\s+", "", t))}


def page_paragraphs(page):
    """쪽에서 (영어 문단, 한글 문단)을 y위치와 함께 뽑는다.

    - 칸은 x가 아니라 글자 종류로 가른다(양끝 맞춤 때문에 영어 조각이 오른쪽까지 밀려 있다).
    - 한 줄이 여러 조각으로 쪼개져 있으므로 y가 같은 조각끼리 먼저 묶는다.
    - 문단 시작은 들여쓰기(이어지는 줄보다 오른쪽에서 시작)로 가른다.
    """
    bad = noise_styles(page)
    cols = {False: {}, True: {}}
    for block in page.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            x0, y0 = line["bbox"][0], line["bbox"][1]
            if y0 < 70 or y0 > page.rect.height - 40:
                continue
            raw = "".join(
                sp["text"] for sp in line["spans"] if (sp["font"], round(sp["size"], 1)) not in bad
            )
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
                # 첫 줄과 마지막 줄의 높이를 함께 둔다 — 긴 문단은 첫 줄만 보면 짝을 놓친다
                out.append((para[0][0], para[-1][0], text))
        return out

    return paragraphs(False), paragraphs(True)


INNER_PUNCT = re.compile(r'[.!?”]')
# 제목에서 대문자를 안 쓰는 잔말 — 대문자 비율을 셀 때 뺀다
SMALL_WORDS = {
    "a", "an", "the", "of", "in", "on", "at", "to", "and", "or", "for", "with",
    "from", "by", "as", "is", "are", "be", "your", "our", "my", "his", "her", "their", "its",
}


def head_like(text):
    """소제목처럼 보이는가

    본문이 양끝 맞춤으로 줄마다 잘려 있어 '짧고 마침표가 없다'만으로는
    문장 조각까지 소제목으로 본다. 그래서 세 가지를 더 본다.
      - 가운데에 문장부호가 없다
      - 쉼표 같은 문장 중간 부호로 끝나지 않는다
      - 잔말을 뺀 낱말이 대개 대문자로 시작한다(제목 표기)
    """
    t = text.strip()
    if not t or len(t.split()) > 12:
        return False
    if t.endswith((".", "!", "?", "”", '"', ",", ";", "-", "—")):
        return False
    if INNER_PUNCT.search(t):
        return False
    if not (t[0].isupper() or t[0] in "“\"'"):
        return False
    words = re.findall(r"[A-Za-z’']+", t)
    if not words:
        return False
    if len(words) <= 3:
        return True
    big = [w for w in words if w.lower() not in SMALL_WORDS]
    if not big:
        return False
    return sum(1 for w in big if w[0].isupper()) / len(big) >= 0.7


def read_body(path):
    """영어 문단과 한글 문단을 같은 높이끼리 묶어 돌려준다

    한쪽이 더 잘게 나뉜 쪽을 그대로 두면 짝이 어긋난다. 해석이 한 덩어리인 대담형
    본문에서는 영어가 줄마다 쪼개져 있고, 해석이 들여쓰기로 더 쪼개진 쪽도 있다.
    그래서 서로 가장 가까운 문단끼리 이어 붙여 덩어리를 만든 뒤, 덩어리끼리 짝짓는다.
    한 덩어리 안에서 문장 수를 맞추는 일은 sentence_pairs 가 한다.

    다만 소제목은 덩어리에 삼켜지면 본문을 나누는 자리를 잃는다. 내용정리 자료가
    없는 과는 소제목으로 나누므로, 소제목은 묶기 전에 따로 빼 둔다.
    """
    doc = fitz.open(path)
    pairs = []
    for page in doc:
        en, ko = page_paragraphs(page)
        if not en:
            continue

        def gap(a, b):
            """두 문단의 높이 범위가 겹치면 0, 아니면 떨어진 거리"""
            return max(0, max(a[0], b[0]) - min(a[1], b[1]))

        # ── 소제목은 따로 — 가장 가까운 짧은 해석 한 줄만 짝지어 준다.
        #    다만 그 해석이 본문 쪽에 더 가까우면 본문에 넘긴다(‘Further Reading’ 같은 꼬리표가
        #    바로 밑 제목의 해석을 가로채는 일을 막는다).
        heads = [i for i, row in enumerate(en) if head_like(row[2])]
        rest_en = [i for i in range(len(en)) if i not in heads]
        short_ko = [j for j, row in enumerate(ko) if len(row[2]) <= 40]
        head_ko, taken_ko = {}, set()
        for d, i, j in sorted(
            (gap(en[i], ko[j]), i, j) for i in heads for j in short_ko
        ):
            if d > 60 or i in head_ko or j in taken_ko:
                continue
            if any(gap(en[k], ko[j]) < d for k in rest_en):
                continue
            head_ko[i] = j
            taken_ko.add(j)

        body_ko = [j for j in range(len(ko)) if j not in taken_ko]

        # ── 소제목으로 끊어지는 마디 — 영어 문단 차례는 그대로 둔다
        units = []  # {"head": i} 또는 {"en": [문단 번호…], "ko": [해석 번호…]}
        for i in range(len(en)):
            if i in heads:
                units.append({"head": i})
            elif units and "en" in units[-1]:
                units[-1]["en"].append(i)
            else:
                units.append({"en": [i], "ko": []})

        # 해석 문단을 본문 마디에 나눠 준다. 한 문단이 여러 마디에 걸치면 문장 단위로 쪼갠다
        # (소제목을 사이에 두고 위아래 본문이 한 해석 문단을 나눠 쓰는 꼴이 잦다).
        bodies = [u for u in units if "en" in u]
        for u in bodies:
            u["ko"] = []
        for j in body_ko:
            reach = [(u, min(gap(ko[j], en[i]) for i in u["en"])) for u in bodies]
            over = [u for u, d in reach if d == 0]
            if not over:
                near = min(reach, key=lambda t: t[1], default=None)
                if near and near[1] < 120:
                    near[0]["ko"].append(ko[j])
                continue
            if len(over) == 1:
                over[0]["ko"].append(ko[j])
                continue
            sents = [s for s in KO_SENT.split(ko[j][2]) if s.strip()]
            sizes = [sum(len(en[i][2]) for i in u["en"]) for u in over]
            total = sum(sizes) or 1
            at = 0
            for n, (u, size) in enumerate(zip(over, sizes)):
                take = len(sents) - at if n == len(over) - 1 else max(1, round(len(sents) * size / total))
                part = sents[at:at + take]
                at += take
                if part:
                    u["ko"].append((
                        min(en[i][0] for i in u["en"]),
                        max(en[i][1] for i in u["en"]),
                        " ".join(part),
                    ))

        out = []
        for u in units:
            if "head" in u:
                j = head_ko.get(u["head"])
                out.append(([en[u["head"]][2]], ko[j][2] if j is not None else ""))
                continue

            eidx, mine = u["en"], u["ko"]  # mine 은 이 마디 몫의 해석 (y0, y1, 글)

            root = {}

            def find(a):
                while root.get(a, a) != a:
                    a = root[a]
                return a

            def union(a, b):
                ra, rb = find(a), find(b)
                if ra != rb:
                    root[ra] = rb

            for i in eidx:
                best, best_d = None, 1e9
                for j, row in enumerate(mine):
                    d = gap(en[i], row)
                    if d < best_d:
                        best, best_d = j, d
                if best is not None and best_d < 120:
                    union(("E", i), ("K", best))
            for j, row in enumerate(mine):
                best, best_d = None, 1e9
                for i in eidx:
                    d = gap(row, en[i])
                    if d < best_d:
                        best, best_d = i, d
                if best is not None and best_d < 120:
                    union(("K", j), ("E", best))

            ko_by_root = {}
            for j in range(len(mine)):
                ko_by_root.setdefault(find(("K", j)), []).append(j)

            # 차례대로 걸으며 뿌리가 바뀌는 자리에서만 끊는다 — 문단 차례가 그대로 남는다
            runs, seen = [], set()
            for i in eidx:
                r = find(("E", i))
                if runs and runs[-1][0] == r:
                    runs[-1][1].append(i)
                else:
                    runs.append((r, [i]))
            for r, idxs in runs:
                ks = [] if r in seen else ko_by_root.get(r, [])
                seen.add(r)
                out.append((
                    [en[i][2] for i in idxs],
                    " ".join(mine[j][2] for j in sorted(ks)),
                ))

        for paras, k in out:
            paras = [re.sub(r"\s+", " ", t).strip() for t in paras]
            paras = [t for t in paras if t]
            if not paras:
                continue
            pairs.append({
                "en": " ".join(paras),
                "ko": re.sub(r"[ ]{2,}", " ", k).strip(),
                # 원래 문단이 어디서 시작했는지 — 내용정리 자료가 없는 과를 나눌 때 쓴다
                "paras": paras,
            })
    return pairs


# 해석은 마침표 뒤에 띄어쓰기 없이 다음 문장이 붙는 일이 잦다(‘…왔나요?Hill 박사: …’).
# 띄어쓰기만 보고 자르면 한 쪽이 두세 문장으로 뭉쳐 영어와 수가 크게 어긋난다.
# 숫자 뒤의 마침표($0.10)는 문장 끝이 아니므로 앞 글자가 숫자면 자르지 않는다.
KO_SENT = re.compile(r'(?<=[.!?”])\s+|(?<=[^0-9][.!?”])(?=[가-힣A-Z])')


def sentence_pairs(pairs):
    """문단 쌍을 문장 쌍으로 편다. 한 문단 안에서 영어·해석 문장을 수에 맞춰 나눈다.

    문단이 시작되는 문장에는 para 표시를 남긴다. 내용정리 자료가 없는 과는
    소제목이 없으면 나눌 자리가 없어 한 덩어리가 되어 버리는데, 그때 쓴다.
    """
    out = []
    for p in pairs:
        en_s = [x.strip() for x in re.split(r'(?<=[.!?”"])\s+', p["en"]) if x.strip()]
        ko_s = [x.strip() for x in KO_SENT.split(p["ko"]) if x.strip()]
        if not en_s:
            continue

        # 문단 첫머리가 몇 번째 문장에 걸리는지 — 글자 자리로 맞춘다
        offs, at = [], 0
        for t in p.get("paras") or [p["en"]]:
            offs.append(at)
            at += len(t) + 1
        head_at, k, pos = set(), 0, 0
        for i, s in enumerate(en_s):
            while k < len(offs) and offs[k] <= pos:
                head_at.add(i)
                k += 1
            pos += len(s) + 1

        if ko_s and len(ko_s) == len(en_s):
            got = [(e, k2) for e, k2 in zip(en_s, ko_s)]
        elif ko_s:
            got = []
            for i, e in enumerate(en_s):
                a = round(i * len(ko_s) / len(en_s))
                b = max(a + 1, round((i + 1) * len(ko_s) / len(en_s)))
                got.append((e, " ".join(ko_s[a:b])))
        else:
            got = [(e, "") for e in en_s]
        for i, (e, k2) in enumerate(got):
            out.append({"en": e, "ko": k2, "para": i in head_at})
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
    return move_tails(blocks)


END = re.compile(r'[.!?"”’)]\s*$')
SENT = re.compile(r'(?<=[.!?"”])\s+')


def move_tails(blocks):
    """덩어리 끝에 남은 미완성 조각을 다음 덩어리 머리로 옮긴다.

    소제목은 뒤 본문의 머리이지 앞 본문의 꼬리가 아니다.
    문장이 경계에서 잘린 경우에도 같은 손질로 한 문장이 두 본문에 나뉘지 않게 한다.
    """
    for i in range(len(blocks) - 1):
        en = blocks[i]["en"].strip()
        if not en or END.search(en):
            continue
        parts = SENT.split(en)
        if len(parts) < 2:
            continue
        frag = parts[-1].strip()
        if not frag:
            continue
        blocks[i]["en"] = en[: len(en) - len(frag)].strip()
        blocks[i + 1]["en"] = f"{frag} {blocks[i + 1]['en']}".strip()
        ko = blocks[i]["ko"].strip()
        if ko.endswith(frag):
            blocks[i]["ko"] = ko[: -len(frag)].strip()
            blocks[i + 1]["ko"] = f"{frag} {blocks[i + 1]['ko']}".strip()
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
    """내용정리 플러스가 없는 과: 소제목(짧고 마침표 없는 문장)에서 나눈다

    첫 자리는 반드시 0이어야 한다. split_at 은 첫 start 앞의 글을 버리므로,
    첫 문장이 비어 있다고 건너뛰면 그 앞의 본문이 통째로 사라진다.
    """
    starts = [0]
    for i, p in enumerate(pairs):
        if i == 0:
            continue
        en = p["en"].strip()
        if not en:
            continue
        if len(en.split()) <= 12 and not en.endswith((".", "!", "?", "”", '"')):
            starts.append(i)
    return starts


def para_starts(pairs):
    """소제목마저 없는 과: 원래 문단이 시작되는 자리에서 나눈다"""
    return [0] + [i for i in range(1, len(pairs)) if pairs[i].get("para")]


DUP = re.compile(r"\s\(\d\)\.pdf$")  # 같은 파일을 두 번 받아 ' (1).pdf' 가 붙은 것
# 파일 이름은 로마 숫자인데 화면과 DB 는 아라비아 숫자를 쓴다
SUBJECT_NAME = {"영어I": "영어1", "영어II": "영어2"}

def body_files(src):
    """폴더에서 (과목, 출판사, 과, 본문 PDF, 내용정리 PDF) 를 차례대로 돌려준다"""
    for path in sorted(glob.glob(os.path.join(src, "*본문*.pdf"))):
        name = os.path.basename(path)
        if DUP.search(name):
            continue
        m = NAME.match(name)
        if not m:
            print("이름 모양이 달라 건너뜀:", name)
            continue
        subject, publisher, lesson = m.group("subject"), m.group("publisher"), m.group("lesson")
        plus = glob.glob(os.path.join(src, f"*{subject}_{publisher}_{lesson}_내용정리*.pdf"))
        yield SUBJECT_NAME.get(subject, subject), publisher, lesson, path, (plus[0] if plus else None)


def lesson_pairs(path):
    """본문 PDF → 문장 단위의 (영어, 해석) 짝"""
    return sentence_pairs(read_body(path))


def build(src):
    rows = []
    for subject, publisher, lesson, path, plus in body_files(src):
        name = os.path.basename(path)
        pairs = lesson_pairs(path)
        anchors = block_anchors(plus) if plus else []

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
        if len(blocks) <= 1:
            blocks = split_at(main_pairs, para_starts(main_pairs)) or blocks
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
            rest = extra_pairs[1:]
            if not head["en"] and rest:
                # 표시만 있던 줄 — 해석은 뒤 지문에 넘기고 그 줄은 버린다
                rest = [{**rest[0], "ko": f"{head['ko']} {rest[0]['ko']}".strip()}] + rest[1:]
                extra_pairs = rest
            else:
                extra_pairs = [head] + rest
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
    return rows


if __name__ == "__main__":
    src, out = sys.argv[1], sys.argv[2]
    rows = build(src)
    json.dump(rows, open(out, "w", encoding="utf8"), ensure_ascii=False, indent=1)
    print("지문", len(rows), "개 저장:", out)

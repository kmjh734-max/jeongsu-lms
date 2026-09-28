# -*- coding: utf-8 -*-
"""족보닷컴 문법 문제 PDF에서 문항·정답·해설을 뽑는다.

한글은 PyMuPDF로 그대로 읽힌다(pdftotext는 한글을 흘린다).
선택지 번호 ①~⑤는 글자가 아니라 그림이라, 해시로 짝지어 제자리에 끼워 넣는다.
어법 문항의 밑줄은 글자에 안 남으므로 짧은 가로선을 찾아 [[ ]]로 표시한다.
"""
import fitz, hashlib, json, re, sys
from pathlib import Path

MARKERS = "①②③④⑤"
_TABLE = json.loads(Path(__file__).with_name("markers.json").read_text(encoding="utf-8"))
MARKER_BY_HASH = {h: MARKERS[n - 1] for h, n in _TABLE["markers"].items()}
BADGE_BY_HASH = _TABLE.get("badges", {})          # 서술형·꼭! 나오는 문제 같은 표딱지
NOISE_HASHES = set(_TABLE.get("noise", []))       # 쪽 귀퉁이 장식 무늬

PROMPT_FONTS = ("HCRDotum-Bold", "HCRDotum")      # 발문(한글 지시문)
BULLET_FONTS = ("Wingdings", "Symbol", "Webdings", "ZapfDingbats")
BOX_LINE_WIDTH = (220, 235)                       # <보기>·문제 상자 테두리 폭
HANGUL = re.compile(r"[가-힣]")


# ---------------------------------------------------------------- 쪽 훑기

def column_line(page):
    """가운데 세로 구분선. 두 단 편집인지, 본문이 어디서 시작하는지 알려 준다."""
    tallest = None
    for drawing in page.get_drawings():
        rect = drawing["rect"]
        if rect.width < 2 and rect.height > page.rect.height * 0.5:
            if tallest is None or rect.height > tallest.height:
                tallest = rect
    return tallest


def wide_boxes(page, split_x):
    """두 단에 걸쳐 있는 상자(개념 요약 등). 그 안은 한 단으로 읽는다."""
    if split_x is None:
        return []
    out = []
    for drawing in page.get_drawings():
        rect = drawing["rect"]
        if rect.width > 60 and rect.height > 20 and rect.x0 < split_x - 5 < rect.x1:
            out.append(rect)
    return out


def underline_rects(page):
    out = []
    for drawing in page.get_drawings():
        rect = drawing["rect"]
        if rect.height >= 2.5 or rect.width < 4:
            continue
        if BOX_LINE_WIDTH[0] < rect.width < BOX_LINE_WIDTH[1]:
            continue                                # <보기> 상자 테두리
        out.append(rect)
    return out


def is_noise(font, text):
    text = text.strip()
    if any(font.startswith(b) for b in BULLET_FONTS):
        return True                                 # 글머리표 기호
    if font == "New20Gulim":
        return True                                 # 납본 도장
    if re.fullmatch(r"-\s*\d+\s*-", text):
        return True                                 # 쪽 번호
    if re.fullmatch(r"I\d{3}-[A-Z]+(\([A-Z]+\))?-[\d-]+", text):
        return True
    return False


def mark_underlines(span, lines):
    """밑줄 그어진 글자만 골라 [[ ]]로 감싼다.

    빈칸(______)도 같은 가로선이라, 선 아래 글자가 공백뿐이면 밑줄로 치지 않는다.
    어법 문항은 어느 낱말에 밑줄이 있는지가 곧 문제라서 글자 단위로 따진다.
    """
    chars = [c for c in span.get("chars", [])]
    if not chars:
        return span["text"]
    flags = []
    for char in chars:
        cx0, _, cx1, cy1 = char["bbox"]
        center = (cx0 + cx1) / 2
        flags.append(any(-1 <= r.y0 - cy1 <= 6 and r.x0 - 0.5 <= center <= r.x1 + 0.5
                         for r in lines))
    for index, char in enumerate(chars):          # 앞뒤가 글자가 아닌 공백은 뺀다
        if flags[index] and char["c"].isspace():
            before = any(flags[:index][::-1][:1]) and not chars[index - 1]["c"].isspace()
            after = index + 1 < len(flags) and flags[index + 1] and not chars[index + 1]["c"].isspace()
            flags[index] = bool(before and after)
    if not any(flags):
        return span["text"]
    out, inside = "", False
    for char, hit in zip(chars, flags):
        if hit and not inside:
            out, inside = out + "[[", True
        elif not hit and inside:
            out, inside = out + "]]", False
        out += char["c"]
    return out + ("]]" if inside else "")


def page_items(doc, page, headers=()):
    """글자·선택지 그림·zb 꼬리표를 모은다. 아직 순서는 매기지 않는다."""
    divider = column_line(page)
    split_x = divider.x0 if divider else None
    content_top = (divider.y0 - 2) if divider else (page.rect.y0 + 40)
    boxes = wide_boxes(page, split_x)
    lines = underline_rects(page)
    items, figures = [], []

    def add(x0, y0, x1, y1, font, size, text, blob=None):
        wide = any(b.y0 - 2 <= y0 and y1 <= b.y1 + 2 for b in boxes)
        items.append({"x": x0, "x1": x1, "y0": y0, "y1": y1, "font": font,
                      "size": size, "text": text, "blob": blob,
                      "col": -1 if wide else (0 if split_x is None or x0 < split_x else 1),
                      "underline": False, "tiny": size < 3})

    for block in page.get_text("rawdict")["blocks"]:
        if block["type"] != 0:
            continue
        for line in block["lines"]:
            for span in line["spans"]:
                span["text"] = "".join(c["c"] for c in span.get("chars", []))
                text = span["text"]
                if not text.strip():
                    continue
                font = span["font"].split("+")[-1]
                x0, y0, x1, y1 = span["bbox"]
                if (y0 + y1) / 2 < content_top:
                    continue                        # 머리글(단원명·쪽번호) 영역
                if span["size"] >= 3 and is_noise(font, text):
                    continue
                add(x0, y0, x1, y1, font, span["size"],
                    mark_underlines(span, lines))

    for info in page.get_image_info(xrefs=True):
        xref = info.get("xref")
        if not xref or not (100 < info["width"] < 900 and 60 < info["height"] < 900):
            continue
        blob = doc.extract_image(xref)["image"]
        digest = hashlib.md5(blob).hexdigest()[:10]
        x0, y0, x1, y1 = info["bbox"]
        if (y0 + y1) / 2 < content_top:
            continue
        if digest in NOISE_HASHES:
            continue
        if digest in MARKER_BY_HASH:
            add(x0, y0, x1, y1, "MARK", 9.0, MARKER_BY_HASH[digest])
        elif digest in BADGE_BY_HASH:
            add(x0, y0, x1, y1, "BADGE", 9.0, "[[표딱지:%s]]" % BADGE_BY_HASH[digest])
        else:
            add(x0, y0, x1, y1, "FIGURE", 9.0, "[[그림:%s]]" % digest, blob)
            figures.append(digest)
    return items, figures


# ---------------------------------------------------------------- 줄 묶기

def group_lines(items):
    """세로 구간이 겹치면 같은 줄로 본다.

    문제 번호(큰 글씨)와 선택지 그림은 본문보다 키가 커서, 위치를 반올림하는
    방식으로는 다른 줄로 튄다. 구간이 겹치는지로 따지면 그런 일이 없다.
    """
    lines = []
    for item in sorted(items, key=lambda i: (i["col"], i["y0"])):
        center = (item["y0"] + item["y1"]) / 2
        last = lines[-1] if lines else None
        if (last and last["col"] == item["col"]
                and last["top"] - 1.5 <= center <= last["bottom"] + 1.5):
            last["items"].append(item)
            last["top"] = min(last["top"], item["y0"])
            last["bottom"] = max(last["bottom"], item["y1"])
        else:
            lines.append({"col": item["col"], "top": item["y0"],
                          "bottom": item["y1"], "items": [item]})
    for line in lines:
        line["items"].sort(key=lambda i: i["x"])
    lines.sort(key=lambda l: (l["col"], l["top"]))
    return lines


def join_spans(spans):
    """한 줄 안의 조각을 붙인다. 사이가 벌어져 있으면 공백을 넣는다."""
    out, prev = "", None
    for span in spans:
        text = span["text"]
        if prev is not None and span["x"] - prev["x1"] > 1.5 and not out.endswith(" "):
            out += " "
        out += text
        prev = span
    return re.sub(r"\s+", " ", out).strip()


# ---------------------------------------------------------------- 문항 자르기

def take_source_refs(lines):
    """zb 꼬리표(아주 작은 조각 두 개)를 이어 붙여 문항 고유번호를 만든다."""
    refs = []
    for line in lines:
        keep, buffer = [], []
        for item in line["items"]:
            if item["tiny"]:
                buffer.append(item)
                joined = "".join(b["text"] for b in buffer).strip()
                found = re.fullmatch(r"zb\s*(\d+)\)", joined)
                if found:
                    refs.append({"ref": "zb" + found.group(1), "col": line["col"],
                                 "top": item["y0"], "x": item["x"]})
                    buffer = []
                elif len(buffer) > 4:
                    buffer = []
                continue
            keep.append(item)
        line["items"] = keep
    return refs


NUMBER_RE = re.compile(r"\d+\.")
STAR_ONLY = re.compile(r"[★☆]{2,5}")


def _is_mark_only(span):
    """표딱지(서술형 등)와 난이도 별표만 있는 조각인지."""
    return span["font"] == "BADGE" or bool(STAR_ONLY.fullmatch(span["text"].strip()))


def rehome_marks(blocks, leading):
    """번호 위에 찍힌 표딱지·별표를 뒤 문항으로 옮긴다.

    족보닷컴은 "꼭! 나오는 문제" 딱지와 ★★☆ 난이도를 문항 번호 바로 위에 찍는다.
    읽는 순서대로는 앞 문항 끝에 붙어 버리므로, 제자리를 찾아 준다.
    """
    if blocks and leading:
        blocks[0]["lines"] = leading + blocks[0]["lines"]
    for index in range(len(blocks) - 1, 0, -1):
        previous, block = blocks[index - 1], blocks[index]
        moved = []
        while previous["lines"] and all(_is_mark_only(s) for s in previous["lines"][-1]):
            moved.append(previous["lines"].pop())
        if moved:
            block["lines"] = list(reversed(moved)) + block["lines"]
    return blocks


def split_questions(lines):
    """문제 번호(굵은 숫자)에서 문항을 자른다."""
    refs = take_source_refs(lines)
    blocks, current, leading = [], None, []
    for line in lines:
        head = line["items"][0] if line["items"] else None
        if (head is not None and head["font"] == "MalgunGothicBold"
                and NUMBER_RE.fullmatch(head["text"].strip())):
            current = {"number": int(head["text"].strip().rstrip(".")),
                       "col": line["col"], "top": line["top"], "x": head["x"],
                       "lines": []}
            blocks.append(current)
            rest = line["items"][1:]
            if rest:
                current["lines"].append(rest)
            continue
        if current is not None and line["items"]:
            current["lines"].append(line["items"])
        elif line["items"] and all(_is_mark_only(s) for s in line["items"]):
            leading.append(line["items"])       # 첫 문항 위에 찍힌 딱지·별표

    rehome_marks(blocks, leading)
    # zb 꼬리표는 문항과 같은 순서로 찍히므로 읽는 순서대로 짝짓는다.
    for index, block in enumerate(blocks):
        block["source_ref"] = refs[index]["ref"] if index < len(refs) else None
    if len(refs) != len(blocks):
        for block in blocks:
            block["ref_warning"] = "꼬리표 %d개 / 문항 %d개" % (len(refs), len(blocks))
    return blocks


# ---------------------------------------------------------------- 문항 조립

def _hangul_tail(text):
    return bool(text) and bool(HANGUL.match(text[-1]))


def _hangul_head(text):
    return bool(text) and bool(HANGUL.match(text[0]))


STAR_RE = re.compile(r"[★☆]{2,5}")
FIGURE_RE = re.compile(r"\[\[그림:([0-9a-f]+)\]\]")
BADGE_RE = re.compile(r"\[\[표딱지:([^\]]+)\]\]")
DIFFICULTY = {"★☆☆": "하", "★★☆": "중", "★★★": "상"}


def _strip(text, found):
    """별표(난이도)와 그림 자리표시를 떼어내고 본문만 남긴다."""
    for star in STAR_RE.findall(text):
        found["difficulty"] = DIFFICULTY.get(star, found.get("difficulty"))
    for badge in BADGE_RE.findall(text):
        found.setdefault("badges", []).append(badge)
    text = STAR_RE.sub(" ", text)
    text = FIGURE_RE.sub("〈그림〉", text)
    text = BADGE_RE.sub(" ", text)
    return re.sub(r"\s+", " ", text).strip()


def build_question(block):
    """한 문항을 발문·본문·선택지로 나눈다."""
    prompt_parts, body_lines, choices = [], [], []
    found = {}
    pending = None
    for spans in block["lines"]:
        prompt_spans = [s for s in spans if s["font"] in PROMPT_FONTS]
        other_spans = [s for s in spans if s["font"] not in PROMPT_FONTS]
        if prompt_spans and not choices and all(s["font"] == "MARK" for s in other_spans):
            prompt_spans, other_spans = spans, []      # 발문 안의 번호는 글자처럼 붙인다
        if prompt_spans and not choices:               # 선택지가 시작되면 발문은 끝
            piece = _strip(join_spans(prompt_spans), found)
            if prompt_parts and _hangul_tail(prompt_parts[-1]) and _hangul_head(piece):
                prompt_parts[-1] += piece              # 한글은 줄바꿈에서 붙여 쓴다
            elif piece:
                prompt_parts.append(piece)
        elif prompt_spans:
            other_spans = spans
        if not other_spans:
            continue
        text = _strip(join_spans(other_spans), found)
        if not text:
            continue
        if any(m in text for m in MARKERS):
            for piece in re.split(r"(?=[①②③④⑤])", text):
                piece = piece.strip()
                if not piece:
                    continue
                if piece[0] in MARKERS:
                    choices.append({"no": MARKERS.index(piece[0]) + 1,
                                    "text": piece[1:].strip()})
                    pending = choices[-1]
                elif pending is not None:
                    pending["text"] = (pending["text"] + " " + piece).strip()
                else:
                    body_lines.append(piece)
        elif pending is not None:
            pending["text"] = (pending["text"] + " " + text).strip()   # 접힌 선택지
        else:
            body_lines.append(text)

    figures = sorted({s["text"][len("[[그림:"):-2]
                      for spans in block["lines"] for s in spans if s["font"] == "FIGURE"})
    return {
        "source_ref": block["source_ref"],
        "number": block["number"],
        "prompt": " ".join(p for p in prompt_parts if p).strip(),
        "body": [b for b in body_lines if b],
        "choices": [c for c in choices if c["text"] or True],
        "figures": figures,
        "difficulty": found.get("difficulty"),
        "badges": sorted(set(found.get("badges", []))),
    }


# ---------------------------------------------------------------- 정답·해설

# 원본이 더러 [정답] 표시를 빠뜨린다("12) ②"). 번호가 이어지면 정답 줄로 본다.
# 완성 교재는 문항 사이에 "유형 ➋ ...", "적용 ➌ ...", "실전 수능 문항 대비하기" 같은
# 머리를 끼워 넣는다. 앞 문항 발문 끝에 묻어 들어오지만 실제로는 뒤 문항들의 이름이다.
CIRCLED = "➀-➓⓫-⓴"
SECTION_RE = re.compile(
    r"\s*(?:\[\[)?\s*(?:유형|적용)\s*[%s]\s*(?:\]\])?\s*(.*)$" % CIRCLED)
PLAIN_HEADS = ("실전 수능 문항 대비하기",)
TYPE_BOX_RE = re.compile(r"\s*(?:\[\[)?\s*대표유형\s*(?:\]\])?\s*(.*)$")
TIP_SPLIT_RE = re.compile(r"\s*(?:\[\[)?\s*풀이\s*Tip\s*(?:\]\])?\s*")
# 발문이 본문 글꼴로 찍힌 문항이 더러 있다. 지시문처럼 끝나면 발문으로 올린다.
INSTRUCTION_TAIL = re.compile(r"(시오\.?|세요\.?|[가-힣]+[은는이]\?|것을\?)\s*$")


def _cut_type_box(prompt):
    """발문 뒤에 붙은 "대표유형 … 풀이 Tip …" 상자를 잘라 낸다."""
    found = TYPE_BOX_RE.search(prompt)
    if not found:
        return prompt, None, None
    rest = re.sub(r"\[\[|\]\]", "", found.group(1)).strip()
    parts = TIP_SPLIT_RE.split(rest, maxsplit=1)
    title = parts[0].strip() or None
    tip = parts[1].strip() if len(parts) > 1 else None
    return prompt[:found.start()].strip(), title, tip


def _cut_section(prompt):
    """발문 뒤에 붙은 단원 머리를 잘라 낸다. (남은 발문, 머리 이름)"""
    found = SECTION_RE.search(prompt)
    if found:
        title = re.sub(r"\[\[|\]\]", "", found.group(1)).strip()
        return prompt[:found.start()].strip(), (title or None)
    for head in PLAIN_HEADS:
        at = prompt.find(head)
        if at >= 0:
            return prompt[:at].strip(), prompt[at:].strip()
    return prompt, None


def tidy(questions):
    """유형 머리를 떼어 뒤 문항에 물려주고, 본문으로 밀려난 발문을 끌어올린다."""
    section, carry = None, None
    for question in questions:
        question["section"] = section
        question["type_box"], question["tip"] = carry or (None, None)
        carry = None
        question["prompt"], head = _cut_section(question["prompt"])
        question["prompt"], box, tip = _cut_type_box(question["prompt"])
        if head:
            section = head
        if box or tip:
            carry = (box, tip)
        if not question["prompt"] and question["body"]:
            if INSTRUCTION_TAIL.search(question["body"][0]):
                question["prompt"] = question["body"].pop(0)
    return questions


ANSWER_LINE = re.compile(r"^(\d+)\)\s*(\[정답\])?\s*(.*)$")


LOOKALIKE = {"ⓛ": "①"}      # ⓛ → ①


def fix_lookalikes(text):
    for wrong, right in LOOKALIKE.items():
        text = text.replace(wrong, right)
    return text


def parse_answers(lines):
    answers, current, mode, expected = {}, None, None, 1
    for text in lines:
        found = ANSWER_LINE.match(text)
        if found and (found.group(2) or int(found.group(1)) == expected):
            number = int(found.group(1))
            current = {"answer": found.group(3).strip(), "explanation": ""}
            answers[number] = current
            expected = number + 1
            mode = "answer"
            continue
        if current is None:
            continue
        if text.startswith("[해설]"):
            current["explanation"] = text[len("[해설]"):].strip()
            mode = "explanation"
        elif mode == "explanation":
            current["explanation"] = (current["explanation"] + " " + text).strip()
        else:
            text = re.sub(r"^\[정답\]\s*", "", text)
            current["answer"] = (current["answer"] + " " + text).strip()
    for value in answers.values():
        for key in ("answer", "explanation"):
            text = re.sub(r"\[정답\]\s*", " ", fix_lookalikes(value[key]))
            value[key] = re.sub(r"\s+", " ", text).strip()
    return answers


def running_headers(doc):
    """쪽 위쪽에 되풀이되는 단원명. 본문에 섞이면 안 된다."""
    seen = {}
    for page in doc:
        limit = page.rect.y0 + page.rect.height * 0.12
        for block in page.get_text("dict")["blocks"]:
            if block["type"] != 0:
                continue
            for line in block["lines"]:
                for span in line["spans"]:
                    text = span["text"].strip()
                    if span["size"] < 3:
                        continue                    # zb 꼬리표는 머리글이 아니다
                    if text and span["bbox"][1] < limit and len(text) < 30:
                        seen.setdefault(text, set()).add(page.number)
    return {text for text, pages in seen.items() if len(pages) >= 2}


def parse_pdf(path):
    doc = fitz.open(str(path))
    headers = running_headers(doc)
    question_lines, answer_texts, figures, in_answers = [], [], {}, False
    for index in range(doc.page_count):
        page = doc[index]
        items, figs = page_items(doc, page, headers)
        for item in items:
            if item["blob"] is not None:
                figures[item["text"][len("[[그림:"):-2]] = item["blob"]
        lines = group_lines(items)
        rendered = [join_spans(l["items"]) for l in lines]
        if in_answers or any("[정답]" in text for text in rendered):
            in_answers = True
            answer_texts += [t for t in rendered if t]
        else:
            question_lines += lines

    questions = tidy([build_question(b) for b in split_questions(question_lines)])
    answers = parse_answers(answer_texts)
    for question in questions:
        found = answers.get(question["number"])
        question["answer"] = found["answer"] if found else None
        question["explanation"] = found["explanation"] if found else None
    return {"file": Path(path).name, "questions": questions,
            "figures": sorted(figures)}, figures


def main():
    result, blobs = parse_pdf(sys.argv[1])
    out = Path(sys.argv[2])
    out.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    if len(sys.argv) > 3 and blobs:
        folder = Path(sys.argv[3]); folder.mkdir(parents=True, exist_ok=True)
        for digest, blob in blobs.items():
            (folder / (digest + ".png")).write_bytes(blob)
    missing = [q["number"] for q in result["questions"] if not q["answer"]]
    noref = [q["number"] for q in result["questions"] if not q["source_ref"]]
    print("문항 %d개 / 정답 없음 %s / 번호 없음 %s / 그림 %d개"
          % (len(result["questions"]), missing or "없음", noref or "없음",
             len(result["figures"])))


if __name__ == "__main__":
    main()

# -*- coding: utf-8 -*-
"""그래머큐 정답지에서 답을 문항마다 하나씩 읽어 낸다 (바깥 서비스 없이 이 컴퓨터에서).

정답 PDF는 글자가 선으로 그려져 있어 글자로 뽑히지 않는다. 그런데 도형은 남아 있어
자리·색·선 모양을 알 수 있다. 그것을 최대한 쓰고, OCR 은 꼭 필요한 데만 쓴다.

  1) 답은 연한 색 상자 안에만 있다. 상자 자리는 도형으로 남아 있다.
  2) 상자 안에서 문항 번호는 갈색, 답은 검은색이다. 번호 오른쪽이 그 문항의 답이다.
     번호는 1부터 차례대로이므로 번호 글자는 읽지 않는다 — 몇 번째인지가 곧 번호다.
  3) ○ 는 곡선 네 개짜리 도형 하나, × 는 직선 하나짜리 도형 둘이다. 이런 기호는
     OCR 로 읽히지 않으므로 선 모양으로 가린다.
  4) 낱말은 도형 하나가 낱말 하나다. 조각만 잘라 읽으면 잘 읽힌다. 같은 낱말은
     선 모양이 같으므로 한 번만 읽고 두고두고 쓴다.

  python scripts/grammar-bank/gq_answers_ocr.py "…정답.pdf" out.json
"""
import hashlib, io, json, re, sys, time
from pathlib import Path
import fitz

DPI = 400
ROW = 7.0    # 같은 줄로 볼 높이 차 (PDF 눈금)
GAP = 2.2    # 같은 번호로 볼 글자 사이 틈
PAD = 1.2    # 잘라 낼 때 둘레 여유


def answer_boxes(page):
    out = []
    for d in page.get_drawings():
        fill = d.get("fill")
        r = d["rect"]
        if not fill or r.width < 120 or r.height < 18:
            continue
        if min(fill) < 0.85 or min(fill) > 0.995:
            continue
        out.append(fitz.Rect(r))
    out.sort(key=lambda r: (round(r.y0), r.x0))
    kept = []
    for r in out:
        if any(r in k for k in kept):
            continue
        kept.append(r)
    return kept


def glyphs_in(page, rect):
    out = []
    for d in page.get_drawings():
        r = d["rect"]
        # 낱말 하나가 도형 하나다 — 긴 낱말도 들어오게 폭은 넉넉히, 높이만 글자 크기로 본다
        if r.height > 14 or r.width > 120 or r.width < 0.4:
            continue
        if not (rect.x0 - 1 <= r.x0 and r.x1 <= rect.x1 + 1
                and rect.y0 - 1 <= r.y0 and r.y1 <= rect.y1 + 1):
            continue
        c = d.get("fill") or d.get("color")
        if not c:
            continue
        kinds = {it[0] for it in d["items"]}
        out.append({"x": r.x0, "x1": r.x1, "y": r.y0, "y1": r.y1,
                    "color": tuple(round(v, 2) for v in c),
                    "curved": "c" in kinds, "items": len(d["items"]),
                    "shape": shape_key(d)})
    return out


def shape_key(d):
    """선 모양을 글자 상자 기준으로 정규화한 열쇠 — 같은 낱말은 같은 값"""
    r = d["rect"]
    w = r.width or 1
    h = r.height or 1
    parts = ["%.1fx%.1f" % (w, h)]
    for it in d["items"]:
        parts.append(it[0])
        for p in it[1:]:
            if isinstance(p, fitz.Point):
                parts.append("%.2f,%.2f" % ((p.x - r.x0) / w, (p.y - r.y0) / h))
    return hashlib.md5("|".join(parts).encode()).hexdigest()[:16]


def split_by_color(glyphs, rect):
    """상자 안 글자를 색으로 가른다.

    갈색이 문항 번호, 검은색이 답, 왼쪽 끝의 주황색이 STEP 표시다.
    색 이름을 박아 두지 않고, 많이 쓰인 두 색을 번호·답으로, 왼쪽 끝에만 있는
    나머지 한 색을 STEP 표시로 본다(교재마다 색이 달라도 통하도록).
    """
    by = {}
    for g in glyphs:
        by.setdefault(g["color"], []).append(g)
    if len(by) < 2:
        return [], [], []
    ranked = sorted(by.items(), key=lambda kv: -len(kv[1]))
    main = ranked[:2]
    width = {c: sum(g["x1"] - g["x"] for g in v) / len(v) for c, v in main}
    num_color = min(width, key=width.get)
    ans_color = max(width, key=width.get)
    labels = []
    for color, group in ranked[2:]:
        if all(g["x"] < rect.x0 + 40 for g in group):
            labels += group
    return by[num_color], by[ans_color], labels


def clump(glyphs):
    """가로로 붙은 글자를 한 덩이로 묶는다 ('1' '0' → 10)"""
    out = []
    for g in sorted(glyphs, key=lambda g: (round(g["y"] / ROW), g["x"])):
        if out and abs(g["y"] - out[-1]["y"]) < ROW and g["x"] - out[-1]["x1"] < GAP:
            out[-1]["x1"] = max(out[-1]["x1"], g["x1"])
        else:
            out.append({"x": g["x"], "x1": g["x1"], "y": g["y"]})
    return out


def mark_of(run):
    """○ 와 × 는 OCR 로 읽히지 않는다 — 선 모양으로 가린다"""
    if not run:
        return None
    if len(run) == 1 and run[0]["curved"] and run[0]["items"] <= 6:
        w, h = run[0]["x1"] - run[0]["x"], run[0]["y1"] - run[0]["y"]
        if abs(w - h) < 1.2:
            return "○"
    if len(run) == 2 and all(not g["curved"] and g["items"] == 1 for g in run):
        if abs(run[0]["x"] - run[1]["x"]) < 1.0:
            return "×"
    return None


def cuts(page, rect):
    """상자 안을 (STEP, 문항 번호, 그 문항의 답 도형들)로 나눈다.

    줄이 바뀌어 이어지는 답(그 줄 첫 번호보다 왼쪽에 있는 글자)은 앞 문항에 붙인다.
    """
    nums, answers, labels = split_by_color(glyphs_in(page, rect), rect)
    if not nums:
        return [], []
    nums = clump(nums)
    label_rows = sorted({round(g["y"] / ROW) for g in clump(labels)}) if labels else []

    rows = {}
    for g in nums:
        rows.setdefault(round(g["y"] / ROW), []).append(g)

    out = []
    step = 0
    seen = 0
    for key in sorted(rows):
        if key in label_rows or (not label_rows and not out):
            step += 1
            seen = 0
        line = sorted(rows[key], key=lambda g: g["x"])
        # 줄 첫 번호보다 왼쪽에 있는 답은 앞 문항이 이어진 것
        lead = [a for a in answers
                if abs(a["y"] - line[0]["y"]) < ROW * 1.5 and a["x"] < line[0]["x"] - 0.3]
        if lead and out:
            out[-1]["run"] += lead
        for i, g in enumerate(line):
            seen += 1
            right = line[i + 1]["x"] if i + 1 < len(line) else rect.x1
            run = [a for a in answers
                   if abs(a["y"] - g["y"]) < ROW * 1.5 and g["x1"] - 0.5 <= a["x"] < right - 0.3]
            out.append({"step": max(step, 1), "no": seen, "y": g["y"], "x": g["x"], "run": run})

    # 번호가 하나도 없는 줄(앞 문항이 그대로 이어지는 줄)의 글자를 앞 문항에 붙인다
    taken = {id(a) for c in out for a in c["run"]}
    for a in sorted(answers, key=lambda a: (round(a["y"] / ROW), a["x"])):
        if id(a) in taken:
            continue
        before = [c for c in out
                  if (round(c["y"] / ROW), c["x"]) <= (round(a["y"] / ROW), a["x"])]
        if before:
            before[-1]["run"].append(a)

    for c in out:
        c["run"].sort(key=lambda a: (round(a["y"] / ROW), a["x"]))
    # STEP 표시 자리 — 번호를 읽어 실제 STEP 번호로 바꿔 쓴다.
    # 한 상자가 STEP 3·4·5 를 담기도 하므로 차례로 1·2·3 을 매기면 어긋난다.
    label_rects = []
    for g in clump(labels):
        label_rects.append({"y": g["y"], "rect": fitz.Rect(rect.x0 - 1, g["y"] - 3,
                                                           rect.x0 + 34, g["y"] + 12)})
    return [c for c in out if c["run"]], label_rects


BRACKET = re.compile(r"(?<=[A-Za-z])l(?=[A-Za-z'’]{1,10}\])")


STRAY = re.compile(r"^[<>›‹|~^·]+|[<>›‹|~^]+$")


def tidy(text):
    """OCR 이 자주 어긋나는 데를 바로잡는다.

    · 여는 대괄호를 l 로 읽는다
    · 둘레를 넓게 잘라 읽다 보면 옆 글자의 조각이 > 같은 기호로 딸려 온다
    """
    got = BRACKET.sub("[", text).strip()
    return STRAY.sub("", got).strip()


def read_crop(reader, page, rect, dpi=None):
    # 작은 글자일수록 크게 키워 읽고, 둘레도 넉넉히 둔다 (너무 딱 붙으면 못 읽는다)
    if dpi is None:
        dpi = DPI if rect.width > 40 else (600 if rect.width > 14 else 900)
    if rect.width < 40:
        # 위아래·오른쪽만 넉넉히 둔다. 왼쪽을 넓히면 바로 옆 문항 번호가 딸려 들어와
        # "2 she" 처럼 답에 번호가 섞인다.
        pad = max(2.0, rect.width * 0.35)
        rect = fitz.Rect(rect.x0 - 0.8, rect.y0 - pad, rect.x1 + pad, rect.y1 + pad)
    png = page.get_pixmap(dpi=dpi, clip=rect).tobytes("png")
    got = reader.readtext(png, detail=1, paragraph=False)
    got.sort(key=lambda r: (min(p[1] for p in r[0]) // 40, min(p[0] for p in r[0])))
    text = tidy(" ".join(t for _b, t, _s in got).strip())
    score = round(sum(float(s) for _b, _t, s in got) / len(got), 3) if got else 0.0
    return text, score


def units_of(run):
    """겹쳐 그려진 글자는 한 덩이로 (× 는 직선 두 개가 같은 자리에 있다)"""
    out = []
    for g in sorted(run, key=lambda a: (round(a["y"] / ROW), a["x"])):
        if out and abs(g["x"] - out[-1][0]["x"]) < 1.0 and abs(g["y"] - out[-1][0]["y"]) < 1.0:
            out[-1].append(g)
        else:
            out.append([g])
    return out


def run_text(reader, page, run, cache):
    """답 조각을 글로 바꾼다.

    글자(낱말) 하나가 도형 하나이므로 **하나씩 따로 읽어 붙인다**. 여럿을 한 사각형으로
    잘라 읽으면 줄이 바뀌는 자리에서 옆 문항의 글까지 덮어 버린다.
    기호(○·×)는 OCR 로 읽히지 않으므로 선 모양으로 가린다.
    같은 모양은 한 번만 읽고 두고두고 쓴다.
    """
    words, scores = [], []
    for unit in units_of(run):
        mark = mark_of(unit)
        if mark:
            words.append(mark)
            scores.append(1.0)
            continue
        key = "|".join(g["shape"] for g in unit)
        if key not in cache:
            rect = fitz.Rect(min(g["x"] for g in unit) - PAD, min(g["y"] for g in unit) - PAD,
                             max(g["x1"] for g in unit) + PAD, max(g["y1"] for g in unit) + PAD)
            cache[key] = read_crop(reader, page, rect)
        text, score = cache[key]
        if text:
            words.append(text)
            scores.append(score)
    return " ".join(words).strip(), (round(sum(scores) / len(scores), 3) if scores else 0.0)


def run(pdf_path, out_path):
    import easyocr

    reader = easyocr.Reader(["ko", "en"], gpu=False, verbose=False)
    doc = fitz.open(pdf_path)
    log = io.open(1, "w", encoding="utf-8", closefd=False)
    t0 = time.time()
    out, cache = [], {}
    for i, page in enumerate(doc):
        for rect in answer_boxes(page):
            # 머리말("PRACTICE … p.36")은 글씨가 작아 크게 키워 읽는다.
            # 여기서 본책 쪽을 못 읽으면 그 상자의 답을 통째로 쓸 수 없다.
            head_rect = fitz.Rect(rect.x0 - 14, max(0, rect.y0 - 95), rect.x1 + 70, rect.y0)
            head, _ = read_crop(reader, page, head_rect, dpi=600)
            pieces = []
            got, label_rects = cuts(page, rect)
            # 상자에 적힌 STEP 번호를 읽어 띠 번호를 바로잡는다
            real = {}
            for i, lab in enumerate(label_rects, start=1):
                text, _score = read_crop(reader, page, lab["rect"], dpi=600)
                # 잘라 낸 자리에 옆 답이 딸려 오므로("24 STCP 2"), STEP 뒤의 숫자만 본다
                hit = re.search(r"S[TICL][CEI]?P\s*(\d{1,2})", text, re.I)
                real[i] = int(hit.group(1)) if hit else i
            for c in got:
                c["step"] = real.get(c["step"], c["step"])
                text, score = run_text(reader, page, c["run"], cache)
                if text:
                    pieces.append({"step": c["step"], "no": c["no"],
                                   "text": text, "score": score})
            if pieces:
                out.append({"answer_page": i + 1,
                            "rect": [round(v, 1) for v in (rect.x0, rect.y0, rect.x1, rect.y1)],
                            "head": head, "pieces": pieces})
        print("  %d/%d쪽 · 답 상자 누적 %d개 · 읽은 모양 %d가지 · %.0f초"
              % (i + 1, doc.page_count, len(out), len(cache), time.time() - t0),
              file=log, flush=True)
    Path(out_path).write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print("답 상자 %d개 저장: %s" % (len(out), out_path), file=log)
    log.flush()


if __name__ == "__main__":
    run(sys.argv[1], sys.argv[2])

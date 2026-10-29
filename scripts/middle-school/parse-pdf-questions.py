# 족보닷컴 문제 PDF(최다빈출·최상위·최다오답) → 문항 JSON(questions.json 과 같은 꼴)
#   python -X utf8 scripts/middle-school/parse-pdf-questions.py "H:/내 드라이브" scripts/middle-school/questions-pdf.json [동아(윤)]
#
# 선생님 결정(2026-10-29): PDF 문항도 그림으로 자르지 말고 글자로 넣는다. pdf_lines.py 가 읽는 차례의 글줄로 되돌린다.
# 문제 쪽: 「※ 다음 글을 읽고…」 묶음 지문 → 「N.\t발문」 「zbN)」 → 문제 글 → ①~⑤ 보기(이어지는 줄은 들여 씀)
# 정답 쪽(「[정답]」이 처음 나오는 쪽부터): 「N)」 「[정답] ④」 「[해설] …」
import sys, os, re, json, glob
import fitz

sys.path.insert(0, os.path.dirname(__file__))
import pdf_lines as P

ROOT, OUT = sys.argv[1], sys.argv[2]
ONLY = sys.argv[3] if len(sys.argv) > 3 else "동아(윤)"
KINDS = [("최다빈출", r"\[최다빈출 공략\]"), ("최상위", r"\[최상위 공략\]"), ("최다오답", r"\[최다오답 공략\]")]
KO = re.compile(r"[가-힣]")
CIRC = "①②③④⑤"
NOISE = re.compile(r"^(중[123]\t?영어.*|TOP \d|☑.*|zb\d+\)|.*_동아\(.*\)$|동아\(.*\)$|\[[^\]]*공략\].*)$")
SPEAKER = re.compile(r"^([A-Z][A-Za-z.]{0,12}|[A-Z])\s*:\s")
STEM_END = re.compile(r"(\?|시오\.|하시오\.|고르시오\.|쓰시오\.)(\s*\(.*\))?$|\(정답\s*\d개\)$|\(\d개\)$")


# 낱말 가운데서 꺾인 줄의 둘째 줄 첫머리(「가장 적절 / 한 것은?」)
TAIL = {"한", "다.", "다", "고", "는", "은", "을", "를", "이", "가", "의", "에", "로", "와", "과", "도", "해", "된", "할", "함", "임", "음", "기", "며", "면", "서", "지"}


def join(a, b):
    """꺾인 줄 잇기: 한글 줄은 낱말 경계에서 꺾이는 게 보통이라 띄우고, 둘째 줄이 한두 글자 꼬리로 시작하면 붙인다"""
    if not a:
        return b
    ta, tb = re.sub(r"</?u>", "", a), re.sub(r"</?u>", "", b)
    if ta and tb and KO.match(ta[-1]) and KO.match(tb[0]):
        first = re.split(r"\s", tb, maxsplit=1)[0]
        if first in TAIL or (len(first) == 1 and not re.search(r"[A-Za-z]", tb[:3])):
            return a + b
    return a + " " + b


def strip_u(s):
    return re.sub(r"</?u>", "", s)


def question_lines(doc, dmap):
    """정답 쪽 전까지 읽는 차례의 글줄. 정답 쪽 번호도 돌려준다."""
    # 정답 쪽: 「[정답]」(최다빈출) 또는 「15) 정답」(최상위·최다오답)이 처음 나오는 쪽
    ans_page = next((i for i, p in enumerate(doc) if "[정답]" in p.get_text() or re.search(r"(^|\n)\d+\)\s*정답", p.get_text())), len(doc))
    lines = []
    for i in range(ans_page):
        for col, y, x, t in P.read_lines(doc[i], dmap):
            if NOISE.match(t.strip()):
                continue
            lines.append({"x": x, "t": t.strip()})
    return lines, ans_page


def answers(doc, dmap, ans_page):
    out, cur, mode = {}, None, None
    for i in range(ans_page, len(doc)):
        for col, y, x, t in P.read_lines(doc[i], dmap):
            t = t.strip()
            if NOISE.match(t) or "콘텐츠" in t or "제작" in t and "◇" in t or t.startswith(("◇", "1) 제작", "3) 이 콘텐츠", "일부터 5년")):
                continue
            m = re.match(r"^(\d+)\)$", t)
            if m:
                cur = int(m.group(1))
                out[cur] = {"answer": "", "explanation": ""}
                mode = None
                continue
            m = re.match(r"^(\d+)\)\s*정답\s*(.*)$", t)  # 최상위·최다오답: 「15) 정답 ③」
            if m:
                cur = int(m.group(1))
                out[cur] = {"answer": m.group(2).strip(), "explanation": ""}
                mode = "e2"
                continue
            if mode == "e2":
                if re.sub(r"</?u>", "", t) in ("오답 point", "오답 파헤치기", "해설"):
                    continue
                out[cur]["explanation"] = join(out[cur]["explanation"], re.sub(r"</?u>", "", t))
                continue
            if cur is None:
                continue
            if t.startswith("[정답]"):
                out[cur]["answer"] = t[4:].strip()
                mode = "a"
                continue
            if t.startswith("[해설]"):
                out[cur]["explanation"] = t[4:].strip()
                mode = "e"
                continue
            if mode == "e":
                out[cur]["explanation"] = join(out[cur]["explanation"], t)
            elif mode == "a":
                out[cur]["answer"] = join(out[cur]["answer"], t)
    return out


def split_choices(t):
    out = []
    for m in re.finditer(r"([①-⑤])\s*(.*?)(?=\s*[①-⑤]|$)", t):
        out.append([CIRC.index(m.group(1)) + 1, m.group(2).strip()])
    return out


def parse_pdf(path):
    doc = fitz.open(path)
    dmap = P.digest_map(doc)
    lines, ans_page = question_lines(doc, dmap)
    ans = answers(doc, dmap, ans_page)
    items, group, q = [], None, None
    for ln in lines:
        t = ln["t"]
        if t.startswith("※"):
            group = {"lead": t.lstrip("※ ").strip(), "lines": []}
            q = None
            continue
        m = re.match(r"^(\d+)\.\s+(.*)$", t)
        # 문항 번호는 차례대로 이어질 때만(문항 안 상자의 「1. 2.」 줄은 문제 글)
        if m and int(m.group(1)) != (items[-1]["no"] + 1 if items else 1):
            m = None
        if m:
            q = {"no": int(m.group(1)), "stem": m.group(2).strip(), "stemDone": bool(STEM_END.search(strip_u(m.group(2)).strip())),
                 "group": group if group and group["lines"] else None, "body": [], "choices": []}
            if not re.search(r"윗글|위 글|위 대화|위의|본문", strip_u(q["stem"])):
                q["group"] = None  # 「다음 대화를 …」 문항은 제 글을 쓴다(발문이 꺾였으면 아래에서 다시 본다)
            items.append(q)
            continue
        if q is None:
            if group is not None:
                # 묶음 지문: 말하는 사람 줄은 새 줄, 나머지는 앞 줄에 잇는다
                if group["lines"] and not SPEAKER.match(strip_u(t)) and not re.match(r"^(\(|\[|•|<)", strip_u(t)):
                    group["lines"][-1] = join(group["lines"][-1], t)
                else:
                    group["lines"].append(t)
            continue
        if not q["stemDone"]:
            q["stem"] = join(q["stem"], t)
            q["stemDone"] = bool(STEM_END.search(strip_u(q["stem"]).strip()))
            if q["group"] is None and group and group["lines"] and re.search(r"윗글|위 글|위 대화|위의|본문", strip_u(q["stem"])):
                q["group"] = group
            continue
        if re.match(r"^\(.*\)$", strip_u(t)) and not q["body"] and not q["choices"] and KO.search(t):
            q["stem"] = join(q["stem"], t)  # 「(정답 2개)」 같은 꼬리
            continue
        if re.match(r"^[①-⑤]", strip_u(t)):
            q["choices"].extend(split_choices(t))
            continue
        if q["choices"]:
            q["choices"][-1][1] = join(q["choices"][-1][1], t)  # 꺾인 보기
            continue
        # 문제 글: 말하는 사람 줄·표 줄·<보기> 등은 새 줄, 나머지는 앞 줄에 잇는다
        if q["body"] and not SPEAKER.match(strip_u(t)) and not re.match(r"^(\(|\[|•|<|→|[ⓐ-ⓩ㉠-㉭Ⓐ-Ⓩ]|Q|A:|[A-E]\))", strip_u(t)) and "\t" not in t and "\t" not in q["body"][-1]:
            q["body"][-1] = join(q["body"][-1], t)
        else:
            q["body"].append(t)
    out = []
    for q in items:
        a = ans.get(q["no"], {"answer": "", "explanation": ""})
        nums = [CIRC.index(c) + 1 for c in re.findall(r"[①-⑤]", a["answer"])]
        kind = "mc" if q["choices"] else "sa"
        answer = ", ".join(map(str, nums)) if kind == "mc" and nums else strip_u(a["answer"])
        tidy = lambda s: re.sub(r"\s*\t\s*→\s*\t?\s*|\s*→\s*\t\s*", " → ", s).replace("\t", " / ")
        out.append({
            "no": q["no"],
            "stem": q["stem"],
            "group": {"lead": q["group"]["lead"], "lines": q["group"]["lines"]} if q["group"] else None,
            "body": [tidy(b) for b in q["body"]],
            "choices": [{"no": c[0], "text": tidy(c[1])} for c in q["choices"]],
            "answer": answer,
            "explanation": a["explanation"],
            "kind": kind,
            "needsImage": bool(re.search(r"그림|사진|표를|표의|표에|도표|그래프|포스터|광고|안내문|메모를 보고", strip_u(q["stem"]))),
        })
    return out


def review_reason(q):
    """자동 점검(parse-questions.py 와 같은 잣대) — 걸리면 기본 화면에서 숨기고 직접 검수"""
    if q["needsImage"]:
        return "그림·표가 있어야 풀 수 있음"
    if q["kind"] == "mc":
        n = len(q["choices"])
        if n not in (4, 5) or [c["no"] for c in q["choices"]] != list(range(1, n + 1)):
            return f"보기 {n}개"
        if any(not c["text"].strip() for c in q["choices"]):
            return "빈 보기"
        ans = [int(x) for x in re.findall(r"\d", q["answer"])]
        if not ans or any(a > n for a in ans):
            return "정답 번호 이상"
    elif not q["answer"]:
        return "정답 없음"
    if q["kind"] == "mc" and not q["body"] and not q["group"] and not any(KO.search(c["text"]) for c in q["choices"]) and re.search(r"\(가\)|\(A\)|<보기>|다음 글|다음 대화|다음 표|우리말과", strip_u(q["stem"])):
        return "문제 글 없음"
    return ""

all_items = []
for grade in ("중1", "중2"):
    for unit in sorted(glob.glob(f"{ROOT}/{grade} 족보닷컴 다운로드/{ONLY}/*/")):
        lesson = os.path.basename(unit.rstrip("/\\"))
        for kind, pat in KINDS:
            files = sorted(f for f in glob.glob(unit + "*.pdf") if re.search(pat, os.path.basename(f)) and ONLY.replace("(윤)", "(윤정미)").replace("(이)", "(이병민)") in os.path.basename(f))
            for f in files:
                # 회차: 「(02)_동아…」 또는 「(02) 중1_…대표문제」
                setno = "%02d" % int((re.search(r"\((\d+)\)[ _]", os.path.basename(f)) or [None, "1"])[1])
                src = f"{kind} {setno}"
                qs = parse_pdf(f)
                for q in qs:
                    q.update({"src": src, "grade": grade, "publisher": ONLY, "lesson": lesson, "area": "", "point": ""})
                    q["review"] = review_reason(q)
                all_items.extend(qs)
                want = int((re.search(r"\[(\d+)문제\]", os.path.basename(f)) or [None, "0"])[1])
                nos = [q["no"] for q in qs]
                print(grade, lesson, src, len(qs), "문항", "" if len(qs) == want and nos == list(range(1, want + 1)) else f"(파일 이름 {want}문제 — 어긋남)",
                      "· 검수", sum(1 for q in qs if q["review"]), flush=True)

json.dump(all_items, open(OUT, "w", encoding="utf8"), ensure_ascii=False, indent=1)

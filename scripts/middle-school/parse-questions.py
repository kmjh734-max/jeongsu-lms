# 족보닷컴 예상문제(교사용, 밑줄 살린 글자) → 문항 JSON
#   python -X utf8 scripts/middle-school/parse-questions.py <덤프 폴더> scripts/middle-school/questions.json [동아(윤)]
#
# 선생님 결정(2026-10-29): 문제는 새로 만들지 않고 족보닷컴 문항을 그대로 쓴다.
# 교사용 한 문항은 이렇게 뽑힌다:
#   발문 → (한 칸 들여) 정답·해설 → 보기 해석(한글) → 상자 이름(제시문·오답·질문·제목) → 실제 지문·보기(영어) → 해설 되풀이 → 「해설」
# 「다음 글을 읽고 물음에 답하시오」 뒤의 지문은 그다음 문항들이 같이 쓴다.
import sys, os, re, json, glob

SRC, OUT = sys.argv[1], sys.argv[2]
ONLY = next((a for a in sys.argv[3:] if not a.startswith("--")), "동아(윤)")
FILES = {"예상PRE": "예상문제 PRE-STEP", "예상1": "예상문제 1회", "예상2": "예상문제 2회"}
# Grammar Build Up 객관식은 전용 해석기(gbu_item)로 넣는다 — 무작위 표본을 직접 풀어 28문항 중 27문항이 그대로 맞음(2026-10-29).
# 주관식은 꼴이 제각각(정답이 앞에 오거나 <보기> 예시가 소문항에 섞임)이라 아직 --gbu-sa 로만 본다.
FILES["GBU객관식"] = "Grammar Build Up 객관식"
if "--gbu-sa" in sys.argv:
    FILES["GBU주관식"] = "Grammar Build Up 주관식"

KO = re.compile(r"[가-힣]")
CIRC = "①②③④⑤"
FILLED = "❶❷❸❹❺"
NOISE = re.compile(r"^(동아\(.*\)\s*\d+과|예상문제.*|중등 2022 개정|중[123]|교사용|정답 및 해설|\S+┃.*┃|\d+)$")
LABELS = {"제시문", "오답", "질문", "제목", "보기", "조건", "<보기>", "<조건>", "대화", "본문", "요약문", "요약", "글", "표"}
GROUP = re.compile(r"^(\[\d+\s*[~-]\s*\d+\]\s*)?다음 (글|대화|두 글|대화문|글과 대화)\S*\s*읽고,?\s*물음에 답하시오\.?$")
STEM_START = re.compile(r"^(다음|윗글|위 글|위 대화|위의|위 주어진|주어진|우리말|빈칸|밑줄|그림|아래|본문|대화|표|괄호|보기|<보기>|각|두|세|어법|문맥)")
AREA = re.compile(r"^(단어|어휘|대화문|의사소통|문법|어법|본문|독해)┃(객관식|주관식|\d회)┃")
SUBLABELS = {"어휘", "의사소통", "문법", "어법", "본문", "단어", "대화문", "독해"}
AREA_NAME = {"어휘": "단어", "대화문": "의사소통", "문법": "어법", "독해": "본문"}


def guess_area(stem, group, body):
    """1회·2회는 영역 머리말이 첫머리에만 있다 — 발문·지문으로 가른다"""
    t = strip_u(stem)
    lead = (group or {}).get("lead", "")
    if "대화" in lead or re.search(r"대화|의사소통|표현", t):
        return "의사소통"
    if group or re.match(r"^(윗글|위 글|위의 글)", t):
        return "본문"
    if re.search(r"글|요약|단락|제목|주제|요지", t) and not re.search(r"영영풀이|철자", t):
        return "본문"
    if re.search(r"영영풀이|단어|의미|뜻|철자|낱말", t) and not re.search(r"어법", t):
        return "단어"
    if re.search(r"어법|문법|문장|영작|배열|바꿔 쓰|바꾸어 쓰|고쳐 쓰", t):
        return "어법"
    return "단어"



def balance_u(s):
    """밑줄 태그가 줄을 넘으면 짝이 어긋난다 — 줄 안에서 짝을 맞춘다"""
    s = re.sub(r"^(\s*)</u>", r"\1", s)
    opened = 0
    out = []
    for part in re.split(r"(</?u>)", s):
        if part == "<u>":
            if opened:
                continue
            opened = 1
        elif part == "</u>":
            if not opened:
                continue
            opened = 0
        out.append(part)
    if opened:
        out.append("</u>")
    return "".join(out)


def review_reason(q):
    """자동 점검에 걸리면 사유(기본 화면에서는 숨기고 직접 검수한다)"""
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
    else:
        if not q["answer"]:
            return "정답 없음"
        if not q["body"] and not q["group"]:
            return "문제 글 없음"
    if any(KO.search(b) and re.search(r"(알맞다|자연스럽다|따라서)", b) for b in q["body"]):
        return "해설이 섞임"
    if q["kind"] == "sa" and q["src"].startswith("Grammar"):
        subs_body = len([b for b in q["body"] if re.match(r"^\(\d\)", strip_u(b))])
        subs_ans = len(re.findall(r"\(\d\)", q["answer"]))
        if subs_body != subs_ans and not (subs_body <= 1 and subs_ans == 0):
            return "소문항·정답 수 어긋남"
        if sum(1 for b in q["body"] if len(strip_u(b)) <= 10) >= 6:
            return "그림·표가 있어야 풀 수 있음"
        if any(re.match(r"^(Look|Fill|Complete|Choose|Write|Read)\b", strip_u(b)) for b in q["body"]):
            return "다른 문항이 섞임"
        if not any("<blank/>" in b or "___" in b for b in q["body"]):
            return "답 칸 없음"
    if q["kind"] == "mc" and not q["body"] and not q["group"] and re.search(r"\(가\)|\(A\)|<보기>|우리말과|다음 문장|주어진 (문장|단어)|다음 글|다음 대화|다음 표", strip_u(q["stem"])):
        return "문제 글 없음"
    return ""


def strip_u(s):
    return re.sub(r"</?u>", "", s)


def is_en_stem(lines, k):
    """영어 발문(「What flower does Mrs. Parker like the most?」): 물음표로 끝나는 영어 줄 바로 다음이 한 칸 들여 쓴 정답 줄"""
    t = strip_u(lines[k]).strip()
    # 「…? Choose all.」처럼 물음표 뒤에 짧은 지시가 붙기도 한다
    # 물음표가 없어도 「Choose the pair of words that fits in the blank.」 같은 영어 지시문
    imperative = re.match(r"^(Choose|Find|Pick|Select|Write|Complete|Circle|Read|Look|Fill|Change|Rewrite|Make|Use|Answer|Translate|Arrange|Correct|Put)\b.*\.$", t) is not None
    if not (imperative or re.search(r"\?(\s*[A-Z][^?]{0,30}\.)?$", t)) or KO.search(t) or lines[k].startswith(" ") or re.match(r"^([①-⑤❶-❺(]|[A-Z][a-z]*\s*:|Q\b)", t):
        return False
    nxt = next((l for l in lines[k + 1:k + 4] if l.strip()), "")
    if imperative and t.endswith("."):
        return True  # 영어 지시문은 다음 줄이 정답 줄이 아니어도(주관식) 문항 시작
    return nxt.startswith(" ") and re.match(r"^\s+[①-⑤](\s*,\s*[①-⑤])*\s*(:|$)", strip_u(nxt)) is not None


def stem_at(lines, k):
    return is_stem(lines[k]) or is_en_stem(lines, k)


def is_stem(line):
    t = strip_u(line).strip()
    return (
        bool(KO.search(t))
        and not line.startswith(" ")
        and STEM_START.match(t) is not None
        and (t.endswith("?") or re.search(r"(시오|하라|쓰세요|고르세요)[.)]?(\s*\(.*\))?$", t) is not None or t.endswith("?)") or re.search(r"\?\s*\(.*\)$", t) is not None)
        and not GROUP.match(t)
    )


def split_choices(line):
    """「① a\t② b\t③ c」 → [(번호, 정답 표시, 글)]"""
    out = []
    for m in re.finditer(r"([①-⑤❶-❺])\s*(.*?)(?=\s*[①-⑤❶-❺]|$)", line):
        mark = m.group(1)
        filled = mark in FILLED
        no = (FILLED.index(mark) if filled else CIRC.index(mark)) + 1
        out.append((no, filled, m.group(2).strip()))
    return out


GBU_NOISE = re.compile(r"^(Pattern \d+\.?.*|Lesson|Grammar Build Up.*|중[123] 동아\(.*\)|\d{1,2}|해설|정답)$")


def gbu_item(stem, chunk, titles):
    """Grammar Build Up 한 문항. 예상문제와 달리 상자 이름이 없고 해설이 문항 앞에 바로 붙는다.
    객관식: 정답 줄(「 ④: 해설」) → 해설 조각(「① is → are」 「- 3인칭…」) → 문항 → 마지막 ①부터 보기.
    주관식: 「문제 줄 → 한 칸 들여 쓴 정답 줄(→ 칸)」이 소문항마다 되풀이된다."""
    lines = [l for l in chunk if l.strip() and not GBU_NOISE.match(strip_u(l).strip()) and strip_u(l).strip() not in titles]
    if not lines:
        return None
    first = strip_u(lines[0]).strip()
    m = re.match(r"^([①-⑤](?:\s*,\s*[①-⑤])*)\s*:?\s*(.*)$", first) if lines[0].startswith(" ") else None
    if m:
        answer = ", ".join(str(CIRC.index(c) + 1) for c in re.findall(r"[①-⑤]", m.group(1)))
        expl = m.group(2)
        rest = lines[1:]
        # 마지막 ①(또는 ❶)부터가 보기
        starts = [k for k, l in enumerate(rest) if re.match(r"^\s*[①❶]", strip_u(l))]
        if not starts:
            return {"kind": "mc", "answer": answer, "explanation": expl, "body": [], "choices": []}
        k0 = starts[-1]
        choices = []
        for l in rest[k0:]:
            t = l.strip()
            if re.match(r"^[①-⑤❶-❺]", strip_u(t)):
                choices.extend(split_choices(t))
            elif choices and (
                re.match(r"^\s+[A-Z][a-z]*\s*:", l)
                or (t.startswith("→") and not KO.search(t))
                or (l.startswith("  ") and not KO.search(t))  # 「   = 수동태 문장」 같은 둘째 줄
                or re.match(r"^\([^)]*\)$", t)  # 「(주어를 Jane으로 바꾸어 부정문으로)」 지시
            ):
                # 두 줄 보기: 대화(A:/B:) 둘째 줄, 「① 두 문장 / → 합친 문장」
                no_, f_, tx = choices[-1]
                choices[-1] = (no_, f_, tx + "\n" + t)
            elif choices and l.startswith(" ") and (KO.search(t) or "→" in t):
                break  # 해설 되풀이
        def is_expl(b):
            t = strip_u(b).strip()
            if "___" in t:
                return False  # 빈칸이 있는 줄은 문제 글(「→ If the weather (A)____ …」)
            if t.startswith("→") and not KO.search(t) and "→" not in t[1:]:
                return False  # 「→ Do you (like / know / their / if / they) jobs?」 — 해설의 「is → are」는 화살표가 가운데
            if re.match(r"^[:/\-→①-⑤❶-❺]", t) or "→" in t:
                return True
            if KO.search(t) and "_" not in t and not t.startswith(("•", "<", "(A)", "A:", "B:")) and re.search(r"(다\.?|다\))$|[<〔]", t):
                if re.search(r"우리말|해석", strip_u(stem)) and not re.search(r"이므로|때문|주어|동사|형태|쓰인|쓴다|알맞|어색|→|〔|<", t):
                    return False
                return True
            if t.startswith("e.g."):
                return True
            return False
        body = [b.strip() for b in rest[:k0] if not is_expl(b)]
        # 우리말을 쓰는 발문(영작·해석·뜻)이 아니면 한글만 있는 줄(「나머지는 주격 관계대명사」)은 해설이다
        if not re.search(r"우리말|해석|뜻|의미|한국어", strip_u(stem)):
            # 우리말이 필요 없는 문항의 한글 줄은 해설·문법 요점이다(「(1) 1, 2인칭 주어 : Do +주어 …」)
            def mostly_en(b):
                t = strip_u(b)
                return len(re.findall(r"[A-Za-z]", t)) > len(re.findall(r"[가-힣]", t)) * 2
            body = [b for b in body if not KO.search(strip_u(b)) or "_" in b or mostly_en(b)]
        # 「to – give, send, tell」 같은 문법 요점 줄
        body = [b for b in body if not re.search(r"\s[–—]\s", strip_u(b)) or "_" in b]
        return {"kind": "mc", "answer": answer, "explanation": expl, "body": body, "choices": choices}
    # 주관식: 문제 줄(여러 줄일 수 있음 — A:/B:) → 정확히 한 칸 들여 쓴 정답 줄. 여러 칸 들여 쓴 줄은 문제 이어짐.
    def is_ans(l):
        return len(l) > 1 and l[0] == " " and l[1] != " " and not re.match(r"^\s*[①-⑤]", strip_u(l))

    def is_answer_slot(t):
        return t.startswith("→") and "_" in t or set(t) <= set("_ →")

    korean_prompt = bool(re.search(r"우리말|해석|뜻", strip_u(stem)))

    def is_expl(t):
        if korean_prompt and not re.search(r"이므로|때문|주어|동사|형태|쓰인|쓴다|알맞|적절|어색|→|〔|<", t):
            return False
        return bool(KO.search(t)) and bool(re.search(r"다\.?$|이다|알맞다|적절하다", t)) and "_" not in t

    # (가) 정답이 먼저 오는 꼴: 발문 바로 다음이 한 칸 들여 쓴 정답 줄(「 (1) not is → is not」 …)
    if is_ans(lines[0]):
        ans_lines, k = [], 0
        while k < len(lines) and is_ans(lines[k]):
            ans_lines.append(strip_u(lines[k]).strip())
            k += 1
        body = []
        for l in lines[k:]:
            t = strip_u(l).strip()
            if is_expl(t) or (l.startswith(" ") and KO.search(t)):
                continue
            if is_answer_slot(t):
                body.append("→ <blank/>")
                continue
            # 교사용 답 칸에 적힌 정답(밑줄)은 빈칸으로
            body.append(re.sub(r"<u>[^<]*</u>", "<blank/>", l.strip()) if re.search(r"^\(\d\)|→", t) else l.strip())
        return {"kind": "sa", "answer": " / ".join(ans_lines), "explanation": "", "body": body, "choices": []}

    # (나) 소문항마다 「문제 줄(여러 줄일 수 있음) → 한 칸 들여 쓴 정답 줄」
    pre, subs, buf = [], [], []
    for l in lines:
        t = strip_u(l).strip()
        if not t or is_answer_slot(t):
            continue
        if is_ans(l):
            if buf:
                # <보기> 예시(「my mother / … / → My mother is … .」)는 소문항이 아니다 — 마지막 「→ 예시」까지는 머리 글로
                arrows = [i for i, x in enumerate(buf) if strip_u(x).startswith("→")]
                if arrows and arrows[-1] < len(buf) - 1:
                    pre.extend(buf[: arrows[-1] + 1])
                    buf = buf[arrows[-1] + 1:]
                subs.append((" / ".join(buf) if len(buf) > 1 else buf[0], t))
                buf = []
            continue
        if is_expl(t):
            continue
        # 소문항 앞의 <보기>·<조건>·예시는 머리 글로
        if not subs and not buf and re.match(r"^(<|•|\d\.|※)", t):
            pre.append(l.strip())
            continue
        if not subs and buf and re.match(r"^(<|•|\d\.|※|→)", buf[0]):
            pre.extend(buf)
            buf = []
        buf.append(l.strip())
    if not subs and buf:
        pre.extend(buf)
    if not subs:
        return {"kind": "sa", "answer": "", "explanation": "", "body": pre, "choices": []}
    def with_blank(q):
        return q if "_" in q else q + "\n→ <blank/>"
    if len(subs) == 1:
        body = pre + [with_blank(subs[0][0])]
        answer = subs[0][1]
    else:
        body = pre + [with_blank(f"({i + 1}) {q}") for i, (q, _a) in enumerate(subs)]
        answer = " / ".join(f"({i + 1}) {a}" for i, (_q, a) in enumerate(subs))
    body = [b.replace("___________", "<blank/>") if False else b for b in body]
    return {"kind": "sa", "answer": answer, "explanation": "", "body": body, "choices": []}


def parse_file(lines, src):
    items = []
    group = None  # 함께 쓰는 지문
    area = ""
    point = ""  # Grammar Build Up: │Pattern 1│ 다음 줄 이름
    i, n = 0, len(lines)
    titles = set()
    for k, l in enumerate(lines):
        if re.match(r"^│Pattern \d│$", strip_u(l).strip()):
            nm = next((strip_u(x).strip() for x in lines[k + 1:k + 4] if x.strip()), "")
            if nm:
                titles.add(nm)
    while i < n:
        raw = lines[i]
        t = strip_u(raw).strip()
        am = AREA.match(t)
        if am:
            area = AREA_NAME.get(am.group(1), am.group(1))
        if re.match(r"^│Pattern \d│$", t):
            point = next((strip_u(x).strip() for x in lines[i + 1:i + 4] if x.strip()), "")
        if GROUP.match(t):
            # 다음 발문 전까지가 지문
            body = []
            i += 1
            while i < n and not stem_at(lines, i) and not GROUP.match(strip_u(lines[i]).strip()):
                s = lines[i].rstrip()
                if s.strip() and not NOISE.match(strip_u(s).strip()) and strip_u(s).strip() not in LABELS:
                    body.append(s.strip())
                i += 1
            group = {"lead": t, "lines": body}
            continue
        if not stem_at(lines, i):
            i += 1
            continue
        stem = raw.strip()
        # 문항 끝: 다음 발문 · 다음 묶음
        j = i + 1
        while j < n and not stem_at(lines, j) and not GROUP.match(strip_u(lines[j]).strip()) and not re.match(r"^│Pattern \d│$", strip_u(lines[j]).strip()):
            j += 1
        chunk = [l.rstrip() for l in lines[i + 1:j]]
        i = j
        for l in chunk:
            am = AREA.match(strip_u(l).strip())
            if am and am.group(2) in ("객관식", "주관식"):
                area = AREA_NAME.get(am.group(1), am.group(1))
        chunk = [l for l in chunk if l.strip() and not NOISE.match(strip_u(l).strip())]
        if not chunk:
            continue
        if src.startswith("Grammar"):
            g = gbu_item(stem, chunk, titles)
            if g is None:
                continue
            q = {
                "src": src, "point": point, "area": "어법", "stem": stem, "group": None,
                "body": g["body"], "choices": [{"no": c[0], "text": c[2]} for c in g["choices"]],
                "answer": g["answer"] or ", ".join(str(c[0]) for c in g["choices"] if c[1]),
                "explanation": g["explanation"], "kind": g["kind"] if g["choices"] or g["kind"] == "sa" else "mc",
                "needsImage": bool(re.search(r"그림|사진|표를 보고|표의|표에|도표|포스터|광고|만화", strip_u(stem))),
            }
            q["review"] = review_reason(q)
            items.append(q)
            continue
        # 문항 끝에 다음 영역 소제목(「본문┃주관식┃」 뒤의 「본문」)이 붙어 온다 — 상자 이름으로 착각하지 않게 뗀다
        while chunk and strip_u(chunk[-1]).strip() in SUBLABELS:
            chunk = chunk[:-1]
        # PRE-STEP은 발문 뒤에 영역 소제목(어휘·본문…)이 먼저 온다
        while chunk and strip_u(chunk[0]).strip() in SUBLABELS:
            chunk = chunk[1:]
        if not chunk:
            continue
        # 정답 줄: 처음 한 칸 들여 쓴 줄
        ans_line = chunk[0] if chunk[0].startswith(" ") else ""
        answer, expl = "", ""
        if ans_line:
            a = strip_u(ans_line).strip()
            m = re.match(r"^([①-⑤](?:\s*,\s*[①-⑤])*)\s*:?\s*(.*)$", a)
            if m:
                answer = ", ".join(str(CIRC.index(c) + 1) for c in re.findall(r"[①-⑤]", m.group(1)))
                expl = m.group(2)
            else:
                answer = a
        # 서술형 정답이 여러 줄이면(「(1) … (2) …」 다음 줄 「(3) …」) 한글이 나오기 전까지 잇는다
        ans_end = 1
        if ans_line and not re.match(r"^[①-⑤]", strip_u(ans_line).strip()):
            while ans_end < len(chunk) and re.match(r"^\s*\(\d\)", strip_u(chunk[ans_end])) and not KO.search(strip_u(chunk[ans_end])):
                answer += "\t" + strip_u(chunk[ans_end]).strip()
                ans_end += 1
        answer = re.sub(r"\s*\t\s*", " / ", answer.strip())
        # 상자 이름(제시문·오답·질문·제목) 뒤가 실제 문항. 없으면 정답 줄 뒤 전부.
        label_at = max((k for k, l in enumerate(chunk) if strip_u(l).strip() in LABELS), default=-1)
        content = chunk[label_at + 1:] if label_at >= 0 else chunk[ans_end:]
        # 해설 되풀이·「해설」에서 끊는다
        cut = len(content)
        for k, l in enumerate(content):
            s = strip_u(l).strip()
            if s == "해설" or (l.startswith(" ") and KO.search(s) and expl and s[:12] == expl[:12]):
                cut = k
                break
        content = content[:cut]
        if label_at < 0 and expl:
            # 상자 이름이 없으면 해설 줄(들여 쓴 한글)을 걷어 낸다
            content = [l for l in content if not (l.startswith(" ") and KO.search(l) and not re.search(r"[A-Za-z]{4,}", l))]
        # 보기 뒤에 해설 되풀이가 한 칸 들여 붙는다(「 ① is → are」 「 ⓐ are → is」 「 not are → are not」)
        started, kept = False, []
        for l in content:
            s2 = strip_u(l)
            gloss = KO.search(s2) and len(s2.strip()) <= 16 and "→" not in s2 and not re.search(r"다\.$", s2.strip())
            if started and l.startswith(" ") and not gloss and (KO.search(s2) or "→" in s2 or re.match(r"^\s*[①-⑤❶-❺]", s2)) and not s2.strip().startswith("→"):
                break
            kept.append(l)
            if s2.strip():
                started = True
        content = kept
        choices, body = [], []
        for l in content:
            s = l.strip()
            if re.match(r"^[①-⑤❶-❺]", strip_u(s)):
                choices.extend(split_choices(s))
            elif choices and l.startswith(" ") and s:
                # 두 줄 보기(① A: … / B: …)의 둘째 줄
                no_, filled_, text_ = choices[-1]
                choices[-1] = (no_, filled_, text_ + "\n" + s)
            else:
                body.append(s)
        if choices:
            # 객관식 지문에 섞인 해설(「(B) …알맞다.」)·낱말 풀이(「hate 정말 싫어하다」)는 뺀다
            body = [b for b in body if not (KO.search(b) and (re.search(r"다\.$|따라서|알맞다|자연스럽다", strip_u(b)) or re.match(r"^[a-z][a-z' ]*\s+[가-힣~(]", strip_u(b))))]
        # 보기 해석(한글)과 실제 보기(영어)가 두 벌 잡히면 마지막 벌(①부터 다시 시작한 곳)만 남긴다
        starts = [k for k, c in enumerate(choices) if c[0] == 1]
        if len(starts) > 1:
            choices = choices[starts[-1]:]
        filled = [c[0] for c in choices if c[1]]
        if choices and filled and not answer:
            answer = ", ".join(map(str, filled))
        kind = "mc" if choices else "sa"
        if kind == "sa":
            # 교사용은 서술형 칸에 정답이 밑줄로 적혀 있다 → 빈칸으로
            sa_ans = []
            def blank(m):
                sa_ans.append(m.group(1).strip())
                return "<blank/>"
            underline_q = "밑줄" in strip_u(stem)
            body = [b if underline_q and not re.search(r"→|\(\d\)\s*<u>", b) else re.sub(r"<u>([^<]*)</u>", blank, b) for b in body]
            if not answer and sa_ans:
                answer = " / ".join(sa_ans)
        items.append({
            "src": src,
            "point": point,
            "area": "어법" if src.startswith("Grammar") else area if src.endswith("PRE-STEP") else guess_area(stem, group if re.match(r"^(윗글|위 글|위 대화|위의)", strip_u(stem).strip()) else None, body),
            "stem": stem,
            "group": group,
            "body": body,
            "choices": [{"no": c[0], "text": c[2]} for c in choices],
            "answer": answer,
            "explanation": expl,
            "kind": kind,
            "needsImage": bool(re.search(r"그림|사진|표를 보고|도표|포스터|광고", strip_u(stem))),
        })
        items[-1]["review"] = review_reason(items[-1])
        # 묶음 지문은 「윗글/위 대화」 문항이 이어지는 동안만
        if group and not re.match(r"^(윗글|위 글|위 대화|위의)", strip_u(stem).strip()):
            items[-1]["group"] = None
    return items


out = []
for d in sorted(glob.glob(os.path.join(SRC, "*", ONLY, "*"))):
    grade, pub, lesson = d.replace("\\", "/").split("/")[-3:]
    for key, label in FILES.items():
        f = os.path.join(d, key + ".rich.txt")
        if not os.path.exists(f):
            continue
        # 한글 기호 글꼴(사용자 영역 문자)은 화면에서 깨진 네모로 나온다 — 걷어 낸다
        lines = [balance_u(re.sub(r"[\ue000-\uf8ff]", "", l)) for l in open(f, encoding="utf8").read().split("\n")]
        # 끝에 붙은 빠른 정답 표(「… - 객관식(선다형)」)부터는 버린다
        end = next(
            (k for k, l in enumerate(lines) if re.search(r"- 객관식\(선다형\)|- 주관식\(서답형\)|본 콘텐츠는 해당 출판사|무단 전재|저작권법", l)),
            len(lines),
        )
        lines = lines[:end]
        items = parse_file(lines, label)
        for k, it in enumerate(items):
            it.update({"grade": grade, "publisher": pub, "lesson": lesson, "no": k + 1})
        out.extend(items)
        bad = [it for it in items if not it["answer"] or (it["kind"] == "mc" and len(it["choices"]) < 3)]
        print(grade, lesson, label, len(items), "문항 · 객관식", sum(it["kind"] == "mc" for it in items), "· 의심", len(bad), "· 그림", sum(it["needsImage"] for it in items))

json.dump(out, open(OUT, "w", encoding="utf8"), ensure_ascii=False, indent=1)

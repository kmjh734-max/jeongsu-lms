# 족보닷컴 「본문 10단계 워크북」(한글) → 과마다 워크북 문항 JSON
#   python -X utf8 scripts/middle-school/parse-workbooks.py <덤프 폴더> scripts/middle-school/workbooks.json [동아(윤)]
#
# 선생님 결정(2026-10-29): 내신용·정수학원만이라 워크북은 과마다 미리 정해 둔다. 족보닷컴 문항을 그대로 쓴다.
# 문장 단위(2·3·5·6·8·9): {ko, q, answer} — 정답 줄은 한 칸 들여 쓴 줄(「 is」)이다.
# 글 단위(7 어색한 곳): {passage, count, answers[]}
import sys, os, re, json, glob

SRC, OUT = sys.argv[1], sys.argv[2]
ONLY = sys.argv[3] if len(sys.argv) > 3 else "동아(윤)"
KO = re.compile(r"[가-힣]")

TYPES = {
    "워크북2": ("ko_blank", "영문을 보고 우리말 해석을 완성하시오."),
    "워크북3": ("en_blank", "우리말 해석을 보고 영문을 완성하시오."),
    "워크북5": ("verb_form", "괄호 안에 주어진 단어를 알맞게 고쳐 쓰시오."),
    "워크북6": ("grammar_choice", "괄호 안에서 어법상 알맞은 것을 고르시오."),
    "워크북8": ("word_order", "우리말과 같은 뜻이 되도록 주어진 단어 및 어구를 알맞게 배열하시오."),
    "워크북9": ("writing", "우리말과 같은 뜻이 되도록 주어진 단어를 순서대로 사용하여 영작하시오."),
    "워크북7": ("context_fix", "다음 글의 밑줄 친 부분 중 문맥상 어색한 것을 찾아 바르게 고쳐 쓰시오."),
}
NOISE = re.compile(r"^(2022 개정.*|Lesson|\d{1,2}|중[123]|◗.*|워크북\s*\d+.*|\d+ .*연습.*|.*Check$|어법&어휘.*)$")


def clean(s):
    s = s.replace(" ", " ").replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    s = re.sub(r"[-]", "", s)
    return re.sub(r"[ \t]+", " ", s).strip()


def is_answer(raw):
    # 정답 줄: 한 칸 들여 씀, 밑줄 칸(  ____)은 아님
    return raw.startswith(" ") and not raw.lstrip().startswith("_") and raw.strip() != ""


def sentence_items(lines, kind):
    items, buf = [], []
    for raw in lines:
        s = clean(raw)
        if not s or NOISE.match(s):
            continue
        if kind == "writing":
            # 해석 → 정답(들여 씀) → 주어진 단어 → 밑줄 칸
            if is_answer(raw) and not s.startswith("_"):
                if buf and KO.search(buf[-1]) and not any(i.get("_open") for i in items[-1:]):
                    items.append({"ko": buf[-1], "answer": s, "_open": True})
                    buf = []
                    continue
            if items and items[-1].get("_open"):
                if s.startswith("_") or set(s) <= set("_ .,!?'"):
                    items[-1]["blank"] = s
                    items[-1].pop("_open")
                elif "hint" not in items[-1]:
                    items[-1]["hint"] = s
                else:
                    items[-1]["blank"] = s
                    items[-1].pop("_open")
                continue
            buf.append(s)
            continue
        if is_answer(raw) and buf:
            if kind == "ko_blank":
                en = next((b for b in buf if not KO.search(b)), "")
                q = next((b for b in reversed(buf) if KO.search(b)), "")
                items.append({"en": en, "q": q, "answer": s})
            else:
                ko = next((b for b in buf if KO.search(b) and not re.search(r"\[|\(|_", b)), "")
                q = next((b for b in reversed(buf) if b != ko), "")
                items.append({"ko": ko, "q": q, "answer": s})
            buf = []
        else:
            buf.append(s)
    for it in items:
        it.pop("_open", None)
    return [it for it in items if it.get("answer") and (it.get("q") or it.get("ko"))]


def context_items(lines):
    """워크북7: 발문 → 번호 → 정답 (1)…(2)… → 글 → 밑줄 칸"""
    items, cur = [], None
    for raw in lines:
        s = clean(raw)
        if not s:
            continue
        m = re.search(r"어색한 것을 (.+?) 찾아", s)
        if m:
            cur = {"count": m.group(1), "answers": [], "passage": ""}
            items.append(cur)
            continue
        if cur is None:
            continue
        if re.match(r"^\(\d\)\s*_", s):
            continue
        am = re.match(r"^\((\d)\)\s*(.+?→.+)$", s)
        if am and not cur["passage"]:
            cur["answers"].append(clean(am.group(2)))
            continue
        if not cur["passage"] and len(s.split()) > 12 and not KO.search(s):
            cur["passage"] = s
    return [it for it in items if it["passage"] and it["answers"]]


out = []
for d in sorted(glob.glob(os.path.join(SRC, "*", ONLY, "*"))):
    grade, pub, lesson = d.replace("\\", "/").split("/")[-3:]
    u = {"grade": grade, "publisher": pub, "lesson": lesson, "sets": {}}
    for name, (kind, direction) in TYPES.items():
        f = os.path.join(d, name + ".txt")
        if not os.path.exists(f):
            continue
        lines = open(f, encoding="utf8").read().split("\n")
        items = context_items(lines) if kind == "context_fix" else sentence_items(lines, kind)
        u["sets"][kind] = {"direction": direction, "items": items}
    out.append(u)
    print(grade, pub, lesson, {k: len(v["items"]) for k, v in u["sets"].items()})

json.dump(out, open(OUT, "w", encoding="utf8"), ensure_ascii=False, indent=1)

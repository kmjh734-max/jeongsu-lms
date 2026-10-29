# questions.json 자동 점검(값 없음): 보기 수·번호, 정답 범위·❶표시, 서술형 빈칸, 회차별 문항 수
#   python -X utf8 scripts/middle-school/check-questions.py
import json, re, os, collections

Q = json.load(open(os.path.join(os.path.dirname(__file__), "questions.json"), encoding="utf8"))
issues = collections.Counter()
ex = collections.defaultdict(list)


def flag(name, q):
    issues[name] += 1
    ex[name].append((q["grade"], q["lesson"], q["src"], q["no"]))


for q in Q:
    if q["kind"] == "mc":
        n = len(q["choices"])
        if [c["no"] for c in q["choices"]] != list(range(1, n + 1)):
            flag("보기 번호 어긋남", q)
        if n not in (4, 5):
            flag(f"보기 {n}개", q)
        ans = [int(x) for x in re.findall(r"\d", q["answer"])]
        if not ans or any(a > n for a in ans):
            flag("정답 이상", q)
        if any(not c["text"].strip() for c in q["choices"]):
            flag("빈 보기", q)
    else:
        if not q["answer"]:
            flag("서술형 정답 없음", q)
        if not any("<blank/>" in b or "___" in b for b in q["body"]) and not re.search(r"쓰시오|영작|배열|고쳐", q["stem"]):
            flag("서술형 빈칸·지시 없음", q)
        if not q["body"] and not q["group"]:
            flag("서술형 본문 없음", q)
    if any(re.search(r"[가-힣]", b) and re.search(r"(알맞다|자연스럽다|따라서)", b) for b in q["body"]):
        flag("본문에 해설 섞임", q)

print(len(Q), "문항")
for k, v in issues.most_common():
    print(v, k, ex[k][:5])
cnt = collections.Counter((q["grade"], q["lesson"], q["src"]) for q in Q)
print("1·2회 30 아닌 곳:", [(k, v) for k, v in cnt.items() if "PRE" not in k[2] and v != 30])
print("영역:", dict(collections.Counter(q["area"] for q in Q)))

# questions.json 의 한 회차를 읽기 좋게 펼친다(검수용)
#   python -X utf8 scripts/middle-school/show-questions.py 중1 1과 "예상문제 1회"
import sys, json, re, os
Q = json.load(open(os.path.join(os.path.dirname(__file__), "questions.json"), encoding="utf8"))
g, l, src = sys.argv[1:4]
last = None
for q in Q:
    if (q["grade"], q["lesson"], q["src"]) != (g, l, src):
        continue
    if q["group"] and q["group"] != last:
        print("  [지문]", q["group"]["lead"], "|", " / ".join(q["group"]["lines"])[:300])
    last = q["group"]
    print(f'{q["no"]:>2}. [{q["area"]}] {q["stem"]}  {"(그림)" if q["needsImage"] else ""}')
    for b in q["body"]:
        print("      ", b[:150])
    for c in q["choices"]:
        print(f'      {c["no"]}) {c["text"][:90]}')
    print(f'      → 정답 {q["answer"]}   해설: {q["explanation"][:70]}')

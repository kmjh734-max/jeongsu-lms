# 중학교 수업자료 시안 — 중1 동아(윤정미) 1과
#   python -X utf8 build.py <units.json> <out.html>
import sys, json, html, random

UNITS, OUT = sys.argv[1], sys.argv[2]
U = json.load(open(UNITS, encoding="utf8"))
u = next(x for x in U if (x["grade"], x["publisher"], x["lesson"]) == ("중1", "동아(윤)", "1과"))
e = html.escape
CIRCLE = "①②③④⑤"

pages = []


def page(body, part="", tone=""):
    pages.append(f'<section class="sheet {tone}"><header class="run"><span>중1 동아(윤정미) · Lesson 1 Happy Together</span><span>{e(part)}</span></header>{body}<footer class="foot"><span>정수학원</span><span class="pno"></span></footer></section>')


def part_title(no, en, ko):
    return f'<div class="ptitle"><b>PART {no}</b><h2>{e(ko)}</h2><span>{e(en)}</span></div>'


# ── 표지 ──
pages.append(f'''<section class="sheet cover">
<div class="cv-top"><span>중학교 수업자료</span><span>2022 개정 · 동아(윤정미)</span></div>
<div class="cv-mid"><div class="cv-grade">중1</div><div class="cv-lesson">Lesson 1</div><h1>{e(u["title"])}</h1>
<ol class="cv-toc"><li><b>01</b> 단어</li><li><b>02</b> 문법</li><li><b>03</b> 대화문</li><li><b>04</b> 본문</li><li><b>05</b> 변형문제</li></ol></div>
<div class="cv-bot"><span>이름 ________________</span><span>정수학원</span></div></section>''')

# ── PART 1 단어 ──
def word_table(words, start=0):
    rows = "".join(
        f'<tr><td class="no">{start + i + 1}</td><td class="w">{e(w["word"])}</td><td class="m">{e(w["meaning"])}</td>'
        f'<td class="ex">{e(w["examples"][0]["en"]) if w.get("examples") else ""}</td></tr>'
        for i, w in enumerate(words))
    return f'<table class="wt"><thead><tr><th></th><th>단어</th><th>뜻</th><th>예문</th></tr></thead><tbody>{rows}</tbody></table>'

# 한 쪽에 26줄씩 — 대화문/본문 단어 사이에 소제목
rows_all = []
for sec in ("대화문", "본문"):
    ws = [w for w in u["words"] if w["section"] == sec]
    rows_all += [("h", sec + " 단어")] + [("w", w) for w in ws]
chunks, cur, n = [], [], 0
for r in rows_all:
    if n >= 26 or (r[0] == "h" and n >= 22):
        chunks.append(cur); cur, n = [], 0
    cur.append(r); n += 1 if r[0] == "w" else 2
chunks.append(cur)
num = 0
for ci, ch in enumerate(chunks):
    body = part_title(1, "Words", "단어") if ci == 0 else ""
    buf = []
    def flush():
        global body
        if buf:
            body += word_table(buf, start)
            buf.clear()
    start = num
    for kind, val in ch:
        if kind == "h":
            flush(); start = num
            body += f'<h3 class="sub">{e(val)}</h3>'
        else:
            buf.append(val); num += 1
    flush()
    page(body, "PART 1 단어")

random.seed(1)
pool = [w for w in u["words"] if len(w["word"]) > 2 and w["word"] not in ("a.",)]
en2ko = random.sample(pool, 10)
ko2en = random.sample([w for w in pool if w not in en2ko], 10)
def strip_pos(m):
    import re
    return re.sub(r"^(n|v|a|adv|prep|conj)\.\s*", "", m.split(";")[0])
t1 = "".join(f'<li><span class="q">{e(w["word"])}</span><span class="line"></span></li>' for w in en2ko)
t2 = "".join(f'<li><span class="q">{e(strip_pos(w["meaning"]))}</span><span class="line"></span></li>' for w in ko2en)
page('<div class="testhead"><h3>단어 TEST</h3><span>점수 ______ / 20</span></div>'
     f'<div class="cols"><div><h4>A. 영어 → 우리말</h4><ol class="wtest">{t1}</ol></div><div><h4>B. 우리말 → 영어</h4><ol class="wtest">{t2}</ol></div></div>'
     '<h4 class="mt">C. 빈칸에 알맞은 말을 쓰시오. (첫 글자 제시)</h4><ol class="fill">'
     '<li>Mrs. Schmidt is my <u>n</u>________. She lives next to my house.</li>'
     '<li>She is a great <u>l</u>________, and I often talk with her.</li>'
     '<li>Hope is my <u>g</u>________ dog and my best friend.</li>'
     '<li>With Mrs. Schmidt, I feel at <u>h</u>________. (마음이 편안하다)</li>'
     '<li>Let\'s meet at two in <u>f</u>________ of the gym.</li></ol>', "PART 1 단어 TEST")

# ── PART 2 문법 ──
for gi, g in enumerate(u["grammar"]):
    pts = "".join(
        f'<li>{e(p.split(" | ")[0])}' + (f'<div class="eg">e.g. {e(p.split(" | ")[1])}</div>' if " | " in p else "") + "</li>"
        for p in g["points"])
    exs = "".join(
        f'<li><span class="en">{e(x["en"])}' + (' <i class="tag">교과서</i>' if x["fromText"] else "") + f'</span><span class="ko">{e(x["ko"])}</span></li>'
        for x in g["examples"])
    body = (part_title(2, "Grammar", "문법") if gi == 0 else "") + f'<div class="gbox"><div class="gno">Point {gi + 1}</div><h3>{e(g["title"])}</h3><ul class="gpts">{pts}</ul></div><h4>교과서 예문</h4><ul class="gex">{exs}</ul>'
    if gi == 0:
        body += ('<h4 class="mt">확인 문제</h4><p class="dir">괄호 안에서 알맞은 말을 고르시오.</p><ol class="chk">'
                 '<li>I ( am / is ) Jihun.</li><li>Minsu and I ( is / are ) members of the school band.</li>'
                 '<li>Kevin ( isn\'t / aren\'t ) a doctor.</li><li>( Is / Are ) Hope your guide dog?</li>'
                 '<li>We ( am not / are not ) good players.</li></ol>')
    else:
        body += ('<h4 class="mt">확인 문제</h4><p class="dir">괄호 안에서 알맞은 말을 고르시오.</p><ol class="chk">'
                 '<li>Minsu ( play / plays ) the drums.</li><li>She ( don\'t / doesn\'t ) talk much.</li>'
                 '<li>( Do / Does ) Hope sleep in class?</li><li>The teachers ( don\'t / doesn\'t ) mind.</li>'
                 '<li>Does she ( bake / bakes ) a cake for you?</li></ol>'
                 '<p class="dir">밑줄 친 부분을 어법에 맞게 고쳐 쓰시오.</p><ol class="fix" start="6">'
                 '<li>She <u>don\'t</u> talk much. → ____________</li><li>Hope <u>go</u> to school with me. → ____________</li>'
                 '<li><u>Are</u> you love rock music? → ____________</li></ol>')
    page(body, "PART 2 문법")

# ── PART 3 대화문 ──
def dlg_block(g, n):
    rows = "".join(f'<tr><td class="sp">{e(t["speaker"])}</td><td class="den">{e(t["en"])}</td><td class="dko">{e(t.get("ko", ""))}</td></tr>' for t in g["turns"])
    return f'<div class="dlg"><div class="dh"><b>Dialogue {n}</b> <span>{e(g["section"])}</span></div><table>{rows}</table></div>'

ds = u["dialogues"]
page(part_title(3, "Dialogue", "대화문")
     + '<div class="func"><b>의사소통 기능</b><span>인사하고 답하기 — How\'s it going? / Pretty good.</span><span>좋아하는 것 묻고 답하기 — What\'s your favorite subject? / It\'s science.</span></div>'
     + "".join(dlg_block(g, i + 1) for i, g in enumerate(ds[:3])), "PART 3 대화문")
page("".join(dlg_block(g, i + 4) for i, g in enumerate(ds[3:]))
     + '<h4 class="mt">대화문 연습</h4><p class="dir">&lt;보기&gt;에서 알맞은 말을 골라 대화를 완성하시오.</p>'
     '<div class="box">보기 | going · good · favorite · about · meet · then</div>'
     '<ol class="fill"><li>B: Hi, Lucy. How\'s it ________?</li><li>G: Pretty ________, Jiho. Is that a soccer ball?</li>'
     '<li>B: Yes. You know, soccer is my ________ sport. How ________ you?</li>'
     '<li>G: Sounds good! Let\'s ________ at two in front of the gym.</li><li>B: Perfect. See you ________.</li></ol>', "PART 3 대화문")

# ── PART 4 본문 ──
for pi, p in enumerate(u["passages"]):
    rows = "".join(f'<li><span class="en">{e(s["en"])}</span><span class="ko">{e(s["ko"])}</span></li>' for s in p["sentences"])
    head = part_title(4, "Reading", "본문") + f'<div class="ptl">{e(u["passages"][0]["passageTitle"]["en"])} <span>{e(u["passages"][0]["passageTitle"]["ko"])}</span></div>' if pi == 0 else ""
    pages_body = head + f'<div class="rd"><div class="rh"><b>본문 {pi + 1}</b> {e(p["title"])}</div><ol class="sents">{rows}</ol></div>'
    if pi == 2:
        pages_body += ""
    page(pages_body, "PART 4 본문")
# 본문 연습 — 해석 쓰기 · 어법 선택
p1 = u["passages"][0]["sentences"]
tr = "".join(f'<li><span class="en">{e(s["en"])}</span><span class="wline"></span></li>' for s in p1)
page('<h3 class="sub">본문 연습 ① 해석 쓰기 · 본문 1</h3>'
     f'<ol class="tr">{tr}</ol>'
     '<h3 class="sub mt">본문 연습 ② 어법 선택 · 본문 2</h3><div class="pass">I\'m Hannah. Mrs. Schmidt, my neighbor, <b>[ is / are ]</b> a dear friend to me. She is a great listener, and I often talk with <b>[ she / her ]</b>. She <b>[ don\'t / doesn\'t ]</b> talk much. She just nods and <b>[ smile / smiles ]</b> at me. Sometimes I\'m sad, and she bakes a cake for me. Her cake is yummy, and I feel all right, like magic. With Mrs. Schmidt, I feel at home. Together, we <b>[ is / are ]</b> happy.</div>', "PART 4 본문 연습")

# ── PART 5 변형문제 ──
P1 = " ".join(s["en"] for s in u["passages"][0]["sentences"])
P2 = " ".join(s["en"] for s in u["passages"][1]["sentences"])
P3 = " ".join(s["en"] for s in u["passages"][2]["sentences"])
P2_blank = P2.replace("She is a great listener", "She is a great <u>　　(A)　　</u>").replace("like magic", "<u>like</u> magic")


def mc(no, stem, opts, box=""):
    o = "".join(f'<li><i>{CIRCLE[i]}</i>{x}</li>' for i, x in enumerate(opts))
    return f'<div class="q"><div class="qs"><b>{no}.</b> {stem}</div>{box}<ol class="opts">{o}</ol></div>'


def sa(no, stem, box="", lines=1):
    return f'<div class="q"><div class="qs"><b>{no}.</b> {stem}</div>{box}' + '<div class="aline"></div>' * lines + '</div>'


q_a = [
    mc(1, "다음 영영풀이에 해당하는 단어로 알맞은 것은?", ["neighbor", "listener", "member", "guide", "player"], '<div class="box">a person who lives next to or near you</div>'),
    mc(2, "다음 빈칸에 공통으로 들어갈 말로 알맞은 것은?", ["love", "play", "talk", "feel", "mind"], '<div class="box">· I ______ the guitar in the school band.<br>· On weekends, we go to the park and ______ together.</div>'),
    mc(3, "다음 대화의 빈칸에 들어갈 말로 알맞은 것은?", ["Pretty good.", "Nice to meet you.", "It's science.", "Yes, I do.", "See you then."], '<div class="box">A: Hi, Jiho. How\'s it going?<br>B: ____________ Thanks.</div>'),
    mc(4, "다음 중 짝지어진 대화가 <u>어색한</u> 것은?", ["A: What's up? — B: Not much.", "A: What's your favorite subject? — B: It's science.", "A: Nice to meet you. — B: Nice to meet you, too.", "A: How's it going? — B: I'm Lee Dongmin.", "A: Is two o'clock OK? — B: Sounds good!"]),
    mc(5, "주어진 말에 이어질 대화의 순서로 알맞은 것은?", ["(A)-(B)-(D)-(C)", "(B)-(A)-(D)-(C)", "(B)-(D)-(A)-(C)", "(D)-(B)-(A)-(C)", "(D)-(A)-(C)-(B)"],
       '<div class="box">Hi, Lucy. How\'s it going?<br>(A) Yes. You know, soccer is my favorite sport. How about you?<br>(B) Pretty good, Jiho. Is that a soccer ball?<br>(C) Really? I play tennis, too.<br>(D) My favorite sport? It\'s tennis. I play every Saturday.</div>'),
    mc(6, "다음 중 어법상 알맞은 문장은?", ["She don't talk much.", "Minsu play the drums.", "Is she a good student?", "We is members of the band.", "Does Hope sleeps in class?"]),
    mc(7, "다음 빈칸에 들어갈 말이 나머지 넷과 <u>다른</u> 것은?", ["Mrs. Schmidt ____ my neighbor.", "Hope ____ my guide dog.", "Minsu and I ____ happy.", "She ____ a great listener.", "My best friend ____ Minsu."]),
    mc(8, "다음 문장을 부정문으로 바르게 바꾼 것은?", ["She not talks much.", "She don't talk much.", "She doesn't talk much.", "She doesn't talks much.", "She isn't talk much."], '<div class="box">She talks much.</div>'),
]
q_b = [
    f'<div class="qgroup"><div class="qs">[9~10] 다음 글을 읽고 물음에 답하시오.</div><div class="pass">{e(P1)}</div></div>',
    mc(9, "윗글의 내용과 일치하지 <u>않는</u> 것은?", ["지훈이의 가장 친한 친구는 민수이다.", "지훈이와 민수는 록 음악을 정말 좋아한다.", "지훈이는 밴드에서 드럼을 연주한다.", "두 사람은 연주를 잘하지 못한다.", "지훈이는 민수와 있으면 항상 웃는다."]),
    mc(10, "윗글에서 지훈이가 민수와 함께 있을 때의 기분으로 알맞은 것은?", ["bored", "happy", "nervous", "sad", "angry"]),
]
q_c = [
    f'<div class="qgroup"><div class="qs">[11~12] 다음 글을 읽고 물음에 답하시오.</div><div class="pass">{P2_blank}</div></div>',
    mc(11, "윗글의 빈칸 (A)에 들어갈 말로 알맞은 것은?", ["speaker", "listener", "singer", "player", "teacher"]),
    mc(12, "윗글의 밑줄 친 <u>like</u>와 쓰임이 같은 것은?", ["I like rock music.", "Do you like cookies?", "She sings like a bird.", "They like reading books.", "We like our neighbor."]),
    f'<div class="qgroup"><div class="qs">[13~14] 다음 글을 읽고 물음에 답하시오.</div><div class="pass">{e(P3)}</div></div>',
    mc(13, "윗글의 Hope에 대한 설명으로 알맞은 것은?", ["Tim의 이웃이다.", "수업 시간에 주로 잠을 잔다.", "학교에는 가지 않는다.", "선생님들이 싫어하신다.", "주말에는 집에만 있다."]),
    sa(14, "윗글을 읽고 다음 질문에 완전한 영어 문장으로 답하시오.", '<div class="box">Q: What do Tim and Hope do on weekends?</div>'),
]
q_d = [
    '<div class="sec">서술형</div>',
    sa(15, "우리말과 같도록 주어진 단어를 바르게 배열하시오.", '<div class="box">그녀는 그저 고개를 끄덕이고 나를 보고 미소 지어.<br>( nods / smiles / she / just / and / at me )</div>'),
    sa(16, "다음 문장을 의문문으로 바꿔 쓰시오.", '<div class="box">Hope goes to school with Tim.</div>'),
    sa(17, "다음 문장에서 어법상 <u>틀린</u> 부분을 찾아 바르게 고쳐 쓰시오.", '<div class="box">Sometimes I\'m sad, and she bake a cake for me.</div>'),
    sa(18, "세 글(본문 1~3)의 공통된 내용을 다음과 같이 쓸 때, 빈칸에 알맞은 한 단어를 본문에서 찾아 쓰시오.", '<div class="box">Jihun, Hannah, and Tim have a special friend. With their friends, they are always ________.</div>'),
]
page(part_title(5, "Practice Test", "변형문제") + '<div class="qcols">' + "".join(q_a[:5]) + "</div>", "PART 5 변형문제")
page('<div class="qcols">' + "".join(q_a[5:]) + "".join(q_b) + "</div>", "PART 5 변형문제")
page('<div class="qcols">' + "".join(q_c) + "</div>", "PART 5 변형문제")
page('<div class="qcols">' + "".join(q_d) + "</div>", "PART 5 변형문제")

# ── 정답 ──
ans = [
    ("단어 TEST C", "1. neighbor  2. listener  3. guide  4. home  5. front"),
    ("문법 Point 1", "1. am  2. are  3. isn't  4. Is  5. are not"),
    ("문법 Point 2", "1. plays  2. doesn't  3. Does  4. don't  5. bake  6. doesn't  7. goes  8. Do"),
    ("대화문 연습", "1. going  2. good  3. favorite, about  4. meet  5. then"),
    ("본문 연습 ②", "is / her / doesn't / smiles / are"),
    ("변형문제", "1. ①  2. ②  3. ①  4. ④  5. ②  6. ③  7. ③  8. ③  9. ③  10. ②  11. ②  12. ③  13. ②<br>"
                 "14. They go to the park and play together.<br>15. She just nods and smiles at me.<br>"
                 "16. Does Hope go to school with Tim?<br>17. bake → bakes<br>18. happy"),
]
page('<h3 class="sub">정답</h3><table class="ans">' + "".join(f"<tr><th>{a}</th><td>{b}</td></tr>" for a, b in ans) + "</table>", "정답")

CSS = open(__file__.replace("build.py", "style.css"), encoding="utf8").read()
doc = f'<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>중학교 수업자료 시안</title><style>{CSS}</style></head><body>{"".join(pages)}<script>document.querySelectorAll(".sheet:not(.cover) .pno").forEach((n,i)=>n.textContent=i+2)</script></body></html>'
open(OUT, "w", encoding="utf8").write(doc)
print(len(pages), "쪽")

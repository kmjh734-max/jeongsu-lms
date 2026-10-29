# 중학교 족보닷컴 한글 자료 → 글자 파일(과마다 폴더)
#   python -X utf8 scripts/middle-school/dump-hwp.py "H:/내 드라이브" <출력 폴더>
# 쓰는 것만 뽑는다: 본문 · 내용정리 플러스 · WORD TEST · Grammar Build Up 워크북
import sys, os, re, glob
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "tmp-rv", "ea-1013", "sw"))
import hwp_text

ROOT, OUT = sys.argv[1], sys.argv[2]
KINDS = {"본문": r"_본문(_\(\d+수정\))?\.hwp$", "플러스": r"내용정리 플러스", "단어": r"WORD TEST", "문법": r"Grammar Build Up 워크북"}
# 워크북·문제(3·4단계): 본문 10단계 워크북 1~10, Grammar Build Up 객관식·주관식, 예상문제(교사용)
EXTRA = {f"워크북{n}": rf"본문10단계 워크북 {n} " for n in range(1, 11)}
EXTRA.update({"GBU객관식": r"Grammar Build Up 객관식", "GBU주관식": r"Grammar Build Up 주관식",
              "예상PRE": r"예상문제 PRE-STEP\(교사용\)", "예상1": r"예상문제 1회\(교사용\)", "예상2": r"예상문제 2회\(교사용\)"})
if "--extra" in sys.argv:
    KINDS = EXTRA
ONLY = next((a.split("=", 1)[1] for a in sys.argv if a.startswith("--only=")), None)


def latest(files):
    # 같은 자료에 원본과 _(날짜수정) 판이 같이 있으면 날짜 늦은 것만
    def key(f):
        m = re.search(r"\((\d{8})수정\)", f)
        return m.group(1) if m else "0"
    return max(files, key=key)


for grade in ("중1", "중2"):
    for book in sorted(glob.glob(f"{ROOT}/{grade} 족보닷컴 다운로드/*/")):
        pub = os.path.basename(book.rstrip("/\\"))
        if ONLY and pub != ONLY:
            continue
        for unit in sorted(glob.glob(book + "*/")):
            lesson = os.path.basename(unit.rstrip("/\\"))
            hwps = glob.glob(unit + "*.hwp")
            if not hwps:
                continue
            dst = os.path.join(OUT, grade, pub, lesson)
            os.makedirs(dst, exist_ok=True)
            for kind, pat in KINDS.items():
                hit = [f for f in hwps if re.search(pat, os.path.basename(f))]
                if not hit:
                    print("없음", grade, pub, lesson, kind)
                    continue
                paras = hwp_text.read_hwp(latest(hit))
                text = "\n".join(p["text"] for p in paras)
                open(os.path.join(dst, kind + ".txt"), "w", encoding="utf8").write(text)
print("끝")

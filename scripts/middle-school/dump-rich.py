# 문제·워크북 한글 파일을 밑줄(<u>…</u>) 살려 뽑는다 → <덤프>/<학년>/<출판사>/<과>/<이름>.rich.txt
#   python -X utf8 scripts/middle-school/dump-rich.py "H:/내 드라이브" <덤프 폴더> [동아(윤)]
import sys, os, re, glob
sys.path.insert(0, os.path.dirname(__file__))
import hwp_rich

ROOT, OUT = sys.argv[1], sys.argv[2]
ONLY = sys.argv[3] if len(sys.argv) > 3 else "동아(윤)"
KINDS = {
    "예상PRE": r"예상문제 PRE-STEP\(교사용\)", "예상1": r"예상문제 1회\(교사용\)", "예상2": r"예상문제 2회\(교사용\)",
    "GBU객관식": r"Grammar Build Up 객관식", "GBU주관식": r"Grammar Build Up 주관식", "워크북7": r"본문10단계 워크북 7 ",
}


def latest(files):
    return max(files, key=lambda f: (re.search(r"\((\d{8})수정\)", f) or [None, "0"])[1])


for grade in ("중1", "중2"):
    for unit in sorted(glob.glob(f"{ROOT}/{grade} 족보닷컴 다운로드/{ONLY}/*/")):
        lesson = os.path.basename(unit.rstrip("/\\"))
        hwps = glob.glob(unit + "*.hwp")
        dst = os.path.join(OUT, grade, ONLY, lesson)
        os.makedirs(dst, exist_ok=True)
        for kind, pat in KINDS.items():
            hit = [f for f in hwps if re.search(pat, os.path.basename(f))]
            if not hit:
                print("없음", grade, lesson, kind)
                continue
            text = "\n".join(p["text"] for p in hwp_rich.read_hwp(latest(hit)))
            open(os.path.join(dst, kind + ".rich.txt"), "w", encoding="utf8").write(text)
        print(grade, lesson, flush=True)

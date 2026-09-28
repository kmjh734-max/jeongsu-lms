# -*- coding: utf-8 -*-
"""선택지 번호로 쓰인 그림을 전 교재에서 모아 종류를 센다."""
import fitz, hashlib, json, sys, collections
from pathlib import Path

ROOT = Path(r"C:/video-app/참고파일/중등 문법/족보닷컴 영문법")
KINDS = ("개념완성", "체크체크", "확인문제", "종합문제")


def target_pdfs():
    for path in sorted(ROOT.rglob("*.pdf")):
        name = path.name
        if any(k in name for k in KINDS) and "unlocked" not in name:
            yield path


def main(out_dir):
    out_dir = Path(out_dir)
    (out_dir / "imgs").mkdir(parents=True, exist_ok=True)
    counts = collections.Counter()
    sizes = collections.Counter()
    files = list(target_pdfs())
    for index, path in enumerate(files, 1):
        doc = fitz.open(str(path))
        for page in doc:
            for info in page.get_image_info(xrefs=True):
                xref = info.get("xref")
                if not xref:
                    continue
                width, height = info["width"], info["height"]
                if not (100 < width < 900 and 60 < height < 900):
                    continue
                blob = doc.extract_image(xref)["image"]
                digest = hashlib.md5(blob).hexdigest()[:10]
                counts[digest] += 1
                sizes[(width, height)] += 1
                target = out_dir / "imgs" / (digest + ".png")
                if not target.exists():
                    target.write_bytes(blob)
        doc.close()
        if index % 40 == 0:
            print("  %d/%d" % (index, len(files)), flush=True)
    (out_dir / "counts.json").write_text(
        json.dumps(counts.most_common(), ensure_ascii=False, indent=1), encoding="utf-8")
    print("PDF %d개 / 서로 다른 그림 %d종 / 크기 %s"
          % (len(files), len(counts), sizes.most_common(5)))


if __name__ == "__main__":
    main(sys.argv[1])

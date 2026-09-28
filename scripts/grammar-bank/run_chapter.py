# -*- coding: utf-8 -*-
"""한 챕터 폴더의 문제 PDF를 모두 뽑고 검수표를 만든다."""
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from extract import parse_pdf
from check import report
from review import render

KINDS = ("체크체크", "확인문제", "종합문제")


def main(folder, out_dir):
    folder, out_dir = Path(folder), Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "figs").mkdir(exist_ok=True)
    total, flagged, views = 0, [], []
    for path in sorted(folder.glob("*.pdf")):
        if not any(k in path.name for k in KINDS) or "unlocked" in path.name:
            continue
        data, blobs = parse_pdf(path)
        for digest, blob in blobs.items():
            (out_dir / "figs" / (digest + ".png")).write_bytes(blob)
        (out_dir / (path.stem + ".json")).write_text(
            json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        views.append(render(data))
        total += len(data["questions"])
        for number, ref, found in report(data):
            flagged.append("%-34s %3s번 [%s]  %s"
                           % (path.stem[:34], number, ref, " / ".join(found)))
    (out_dir / "모아보기.txt").write_text("\n\n".join(views), encoding="utf-8")
    (out_dir / "검수필요.txt").write_text(
        "문항 %d개 중 %d개 확인 필요\n\n" % (total, len(flagged)) + "\n".join(flagged),
        encoding="utf-8")
    print("문항 %d개 / 확인 필요 %d개" % (total, len(flagged)))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])

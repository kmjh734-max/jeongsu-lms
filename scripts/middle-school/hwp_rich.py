"""HWP5 글자 뽑기 + 밑줄 살리기.

hwp_text.py(글자만)와 같되, 글자 모양(DocInfo CHAR_SHAPE)의 밑줄을 읽어 밑줄 친 글자를 <u>…</u>로 감싼다.
족보닷컴 문제의 「밑줄 친 단어의 의미가 다른 것은?」·워크북 「밑줄 친 부분 중 어색한 것」처럼 밑줄이 문제의 핵심이라
글자만 뽑으면 문항이 서지 않는다(2026-10-29).

  python -X utf8 hwp_rich.py <파일.hwp> [문단 수]
"""
import olefile, zlib, struct, sys

EXT = {1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23}
TAG_CHAR_SHAPE = 21  # DocInfo: HWPTAG_BEGIN(16) + 5
TAG_PARA_TEXT = 67
TAG_PARA_CHAR_SHAPE = 68
TAG_CTRL_HEADER = 71


def records(data):
    i, n = 0, len(data)
    while i + 4 <= n:
        h = struct.unpack("<I", data[i:i + 4])[0]
        i += 4
        tag, level, size = h & 0x3FF, (h >> 10) & 0x3FF, (h >> 20) & 0xFFF
        if size == 0xFFF:
            size = struct.unpack("<I", data[i:i + 4])[0]
            i += 4
        yield tag, level, data[i:i + size]
        i += size


def underline_shapes(ole, compressed):
    """글자 모양 번호 → 밑줄 여부"""
    data = ole.openstream("DocInfo").read()
    if compressed:
        data = zlib.decompress(data, -15)
    out = []
    for tag, _lv, body in records(data):
        if tag != TAG_CHAR_SHAPE:
            continue
        # 글꼴 7×2 + 장평 7 + 자간 7 + 상대크기 7 + 위치 7 = 42, 기준크기 4 → 속성은 46
        attr = struct.unpack("<I", body[46:50])[0] if len(body) >= 50 else 0
        out.append(((attr >> 2) & 0x3) == 1)  # 1 = 글자 아래 밑줄
    return out


def decode(body, shapes, runs):
    """문단 글자를 풀며 글자마다 글자 모양을 붙인다. runs = [(시작 위치, 모양 번호)]"""
    units = len(body) // 2
    chars = []  # (글자, 위치)
    j = 0
    while j < units:
        c = struct.unpack("<H", body[2 * j:2 * j + 2])[0]
        if c < 32:
            if c == 9:
                chars.append(("\t", j))
                j += 8
                continue
            if c in EXT:
                j += 8
                continue
            if c == 10:
                chars.append(("\n", j))
            elif c in (24, 30):
                chars.append(("-" if c == 30 else " ", j))
            elif c == 31:
                chars.append((" ", j))
            j += 1
            continue
        chars.append((chr(c), j))
        j += 1

    def shape_at(pos):
        cur = runs[0][1] if runs else 0
        for start, sid in runs:
            if start <= pos:
                cur = sid
            else:
                break
        return cur

    out, inside = [], False
    for ch, pos in chars:
        u = ch.strip() != "" and 0 <= shape_at(pos) < len(shapes) and shapes[shape_at(pos)]
        if u and not inside:
            out.append("<u>")
            inside = True
        elif not u and inside and ch.strip() != "":
            out.append("</u>")
            inside = False
        out.append(ch)
    if inside:
        out.append("</u>")
    text = "".join(out)
    # 밑줄 끝의 공백은 밖으로: "<u>like </u>" → "<u>like</u> "
    while "  </u>" in text or " </u>" in text:
        text = text.replace(" </u>", "</u> ")
    text = text.replace("<u></u>", "")
    return text.encode("utf-16-le", "surrogatepass").decode("utf-16-le", "replace")


def read_hwp(path):
    ole = olefile.OleFileIO(path)
    hdr = ole.openstream("FileHeader").read()
    flags = struct.unpack("<I", hdr[36:40])[0]
    compressed = bool(flags & 1)
    if flags & 2:
        raise ValueError("password-protected")
    shapes = underline_shapes(ole, compressed)
    secs = sorted([e for e in ole.listdir() if len(e) == 2 and e[0] == "BodyText"], key=lambda e: int(e[1].replace("Section", "")))
    paras = []
    for e in secs:
        data = ole.openstream(e).read()
        if compressed:
            data = zlib.decompress(data, -15)
        pending = None  # 글자 문단 → 다음 글자 모양 레코드에서 마무리
        stack = []
        for tag, level, body in records(data):
            while stack and stack[-1][0] >= level:
                stack.pop()
            if tag == TAG_CTRL_HEADER and len(body) >= 4:
                stack.append((level, body[:4][::-1].decode("latin-1")))
            elif tag == TAG_PARA_TEXT:
                if pending:
                    paras.append(pending)
                pending = {"body": body, "level": level, "ctx": "/".join(c for _, c in stack)}
            elif tag == TAG_PARA_CHAR_SHAPE and pending is not None:
                runs = [struct.unpack("<II", body[k:k + 8]) for k in range(0, len(body) - 7, 8)]
                pending["text"] = decode(pending.pop("body"), shapes, runs)
                paras.append(pending)
                pending = None
        if pending:
            pending["text"] = decode(pending.pop("body"), shapes, [])
            paras.append(pending)
    ole.close()
    return [p for p in paras if "text" in p]


if __name__ == "__main__":
    for p in read_hwp(sys.argv[1])[: int(sys.argv[2]) if len(sys.argv) > 2 else 60]:
        print(repr(p["text"][:140]))

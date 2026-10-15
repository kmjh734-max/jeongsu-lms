/**
 * 한글(HWP · HWPX) 파일에서 글자만 뽑는다 — 선생님 지시(2026-10-15): 「hwp도 가능하게 해줘」.
 *
 * 적중 자료집은 밑줄 모양이 아니라 글자(①~⑤ 표지, [괄호], 빈칸, 주어진 문장)로 같은 자리를 찾으므로
 * 글자만 있으면 PDF와 똑같이 대조할 수 있다. 새 꾸러미 없이 Node 의 zlib 만 쓴다.
 *  - HWPX: zip 안의 Contents/section*.xml 에서 <hp:t> 글자를 문단마다 모은다.
 *  - HWP 5.0: 문서 묶음(OLE) 안의 BodyText/Section* 을 풀고(압축이면 deflate), 문단 글자 기록(HWPTAG_PARA_TEXT)만 읽는다.
 * 배포용·암호 문서는 본문이 따로 잠겨 있어 읽지 못한다 — 그때는 PDF로 올려 달라고 알린다.
 */
import { inflateRawSync } from "node:zlib";

export class HwpReadError extends Error {}

// ── HWPX (zip)
function unzipEntries(buf: Buffer): Map<string, Buffer> {
  const out = new Map<string, Buffer>();
  // 끝머리(End of Central Directory)를 뒤에서 찾는다
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 70000); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new HwpReadError("zip 끝머리를 찾지 못했어요.");
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  for (let n = 0; n < count && p + 46 <= buf.length; n++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) break;
    const method = buf.readUInt16LE(p + 10);
    const csize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const name = buf.toString("utf8", p + 46, p + 46 + nameLen);
    p += 46 + nameLen + extraLen + commentLen;
    if (!/^Contents\/section\d+\.xml$/i.test(name)) continue;
    const lNameLen = buf.readUInt16LE(local + 26);
    const lExtraLen = buf.readUInt16LE(local + 28);
    const start = local + 30 + lNameLen + lExtraLen;
    const raw = buf.subarray(start, start + csize);
    out.set(name, method === 8 ? inflateRawSync(raw) : Buffer.from(raw));
  }
  return out;
}

const decodeXml = (s: string) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_m, d: string) => String.fromCharCode(Number(d)))
    .replace(/&amp;/g, "&");

function hwpxText(buf: Buffer): string {
  const sections = [...unzipEntries(buf)].sort(([a], [b]) => {
    const na = Number(a.match(/(\d+)\.xml$/i)?.[1] ?? 0);
    const nb = Number(b.match(/(\d+)\.xml$/i)?.[1] ?? 0);
    return na - nb;
  });
  if (sections.length === 0) throw new HwpReadError("본문을 찾지 못했어요.");
  const lines: string[] = [];
  for (const [, xml] of sections) {
    const s = xml.toString("utf8");
    for (const p of s.split(/<\/hp:p>/)) {
      const t = [...p.matchAll(/<hp:t(?:\s[^>]*)?>([\s\S]*?)<\/hp:t>/g)].map((m) => decodeXml(m[1]!.replace(/<[^>]+>/g, ""))).join("");
      if (t.trim()) lines.push(t);
    }
  }
  return lines.join("\n");
}

// ── HWP 5.0 (OLE 문서 묶음)
type DirEntry = { name: string; type: number; start: number; size: number };

function readCfb(buf: Buffer): { entries: DirEntry[]; read: (e: DirEntry) => Buffer } {
  if (buf.readUInt32LE(0) !== 0xe011cfd0 || buf.readUInt32LE(4) !== 0xe11ab1a1) throw new HwpReadError("한글 문서 형식이 아니에요.");
  const secSize = 1 << buf.readUInt16LE(0x1e);
  const miniSize = 1 << buf.readUInt16LE(0x20);
  const numFat = buf.readUInt32LE(0x2c);
  const dirStart = buf.readUInt32LE(0x30);
  const cutoff = buf.readUInt32LE(0x38);
  const miniFatStart = buf.readUInt32LE(0x3c);
  let difatSec = buf.readUInt32LE(0x44);
  const sec = (n: number) => buf.subarray(512 + n * secSize, 512 + (n + 1) * secSize);

  // FAT 섹터 번호 목록(DIFAT)
  const fatSecs: number[] = [];
  for (let i = 0; i < 109 && fatSecs.length < numFat; i++) fatSecs.push(buf.readUInt32LE(0x4c + i * 4));
  let guard = 0;
  while (fatSecs.length < numFat && difatSec < 0xfffffffa && guard++ < 10000) {
    const d = sec(difatSec);
    for (let i = 0; i < secSize / 4 - 1 && fatSecs.length < numFat; i++) fatSecs.push(d.readUInt32LE(i * 4));
    difatSec = d.readUInt32LE(secSize - 4);
  }
  const fat: number[] = [];
  for (const s of fatSecs) {
    const d = sec(s);
    for (let i = 0; i < secSize / 4; i++) fat.push(d.readUInt32LE(i * 4));
  }
  const chain = (start: number, table: number[]): number[] => {
    const out: number[] = [];
    let s = start;
    while (s < 0xfffffffa && s < table.length && out.length < 1_000_000) {
      out.push(s);
      s = table[s]!;
    }
    return out;
  };
  const readChain = (start: number) => Buffer.concat(chain(start, fat).map(sec));

  const dirBuf = readChain(dirStart);
  const entries: DirEntry[] = [];
  for (let o = 0; o + 128 <= dirBuf.length; o += 128) {
    const nameLen = dirBuf.readUInt16LE(o + 64);
    const name = dirBuf.toString("utf16le", o, o + Math.max(0, nameLen - 2));
    entries.push({ name, type: dirBuf[o + 66]!, start: dirBuf.readUInt32LE(o + 116), size: dirBuf.readUInt32LE(o + 120) });
  }
  const root = entries[0];
  const miniStream = root ? readChain(root.start) : Buffer.alloc(0);
  const miniFat: number[] = [];
  if (miniFatStart < 0xfffffffa) {
    const m = readChain(miniFatStart);
    for (let i = 0; i + 4 <= m.length; i += 4) miniFat.push(m.readUInt32LE(i));
  }
  const read = (e: DirEntry): Buffer => {
    if (e.size < cutoff) {
      const parts = chain(e.start, miniFat).map((n) => miniStream.subarray(n * miniSize, (n + 1) * miniSize));
      return Buffer.concat(parts).subarray(0, e.size);
    }
    return readChain(e.start).subarray(0, e.size);
  };
  return { entries, read };
}

const HWPTAG_PARA_TEXT = 0x10 + 51;

function paraText(rec: Buffer): string {
  let s = "";
  for (let i = 0; i + 1 < rec.length; ) {
    const c = rec.readUInt16LE(i);
    if (c >= 32) {
      s += String.fromCharCode(c);
      i += 2;
      continue;
    }
    // 한 칸짜리 조절 글자: 0 · 10(줄바꿈) · 13(문단 끝) · 24~31(특수 공백 등)
    if (c === 0 || c === 10 || c === 13 || (c >= 24 && c <= 31)) {
      if (c === 10) s += "\n";
      else if (c >= 24) s += " ";
      i += 2;
      continue;
    }
    // 나머지 조절 글자(표·그림·각주 등)는 여덟 칸을 차지한다
    if (c === 9) s += "\t";
    i += 16;
  }
  return s;
}

function hwp5Text(buf: Buffer): string {
  const { entries, read } = readCfb(buf);
  const header = entries.find((e) => e.name === "FileHeader");
  if (!header) throw new HwpReadError("한글 문서 머리를 찾지 못했어요.");
  const h = read(header);
  const flags = h.length >= 40 ? h.readUInt32LE(36) : 0;
  if (flags & 0x2) throw new HwpReadError("암호가 걸린 한글 문서라 읽을 수 없어요.");
  if (flags & 0x4) throw new HwpReadError("배포용 한글 문서라 읽을 수 없어요.");
  const compressed = (flags & 0x1) !== 0;
  const sections = entries
    .filter((e) => e.type === 2 && /^Section\d+$/.test(e.name))
    .sort((a, b) => Number(a.name.slice(7)) - Number(b.name.slice(7)));
  if (sections.length === 0) throw new HwpReadError("본문을 찾지 못했어요.");
  const lines: string[] = [];
  for (const e of sections) {
    let data = read(e);
    if (compressed) data = inflateRawSync(data);
    for (let p = 0; p + 4 <= data.length; ) {
      const v = data.readUInt32LE(p);
      const tag = v & 0x3ff;
      let size = (v >>> 20) & 0xfff;
      p += 4;
      if (size === 0xfff) {
        size = data.readUInt32LE(p);
        p += 4;
      }
      if (tag === HWPTAG_PARA_TEXT) {
        const t = paraText(data.subarray(p, p + size));
        if (t.trim()) lines.push(t);
      }
      p += size;
    }
  }
  return lines.join("\n");
}

/** 한글 파일 → 글자. 못 읽으면 HwpReadError */
export function hwpToText(buf: Buffer, name = ""): string {
  const isZip = buf.length > 4 && buf.readUInt32LE(0) === 0x04034b50;
  const text = isZip || /\.hwpx$/i.test(name) ? hwpxText(buf) : hwp5Text(buf);
  const clean = text.replace(/\r/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (clean.replace(/\s/g, "").length < 20) throw new HwpReadError("글자를 거의 찾지 못했어요.");
  return clean;
}

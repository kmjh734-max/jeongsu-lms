/**
 * 한글(HWP · HWPX) 파일에서 글자만 뽑는다 — 선생님 지시(2026-10-15): 「hwp도 가능하게 해줘」.
 *
 * 적중 자료집은 밑줄 모양이 아니라 글자(①~⑤ 표지, [괄호], 빈칸, 주어진 문장)로 같은 자리를 찾으므로
 * 글자만 있으면 PDF와 똑같이 대조할 수 있다.
 *  - HWPX: zip 안의 Contents/section*.xml 에서 <hp:t> 글자를 문단마다 모은다.
 *  - HWP 5.0: 문서 묶음(OLE) 안의 BodyText/Section* 을 풀고(압축이면 deflate), 문단 글자 기록(HWPTAG_PARA_TEXT)만 읽는다.
 * 배포용·암호 문서는 본문이 따로 잠겨 있어 읽지 못한다 — 그때는 PDF로 올려 달라고 알린다.
 *
 * 브라우저에서 돈다(선생님 파일이 그림을 품어 4~18MB라 서버로 보내면 받을 수 없었다 — 2026-10-15).
 * 새 꾸러미 없이 Uint8Array 와 DecompressionStream(deflate-raw)만 쓰므로 Node 에서도 그대로 돈다.
 */

export class HwpReadError extends Error {}

const u16 = (b: Uint8Array, o: number) => b[o]! | (b[o + 1]! << 8);
const u32 = (b: Uint8Array, o: number) => (b[o]! | (b[o + 1]! << 8) | (b[o + 2]! << 16) | (b[o + 3]! << 24)) >>> 0;

/**
 * deflate 를 푼다. 한글 본문은 압축 데이터 뒤에 여분 바이트가 붙어 있는 일이 흔한데, 브라우저 풀이는 그것을
 * 「끝 뒤 쓰레기」로 보고 오류를 낸다. 그때까지 풀린 것은 온전하므로 받아 둔 만큼 쓴다.
 */
async function inflateRaw(data: Uint8Array): Promise<Uint8Array> {
  const reader = new Blob([data as BlobPart]).stream().pipeThrough(new DecompressionStream("deflate-raw")).getReader();
  const parts: Uint8Array[] = [];
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) parts.push(value);
    }
  } catch (e) {
    if (parts.length === 0) throw e;
  }
  return concat(parts);
}

function concat(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((s, p) => s + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

const utf8 = new TextDecoder("utf-8");
const utf16 = new TextDecoder("utf-16le");

// ── HWPX (zip)
async function unzipSections(buf: Uint8Array): Promise<Array<[string, Uint8Array]>> {
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 70000); i--) {
    if (u32(buf, i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new HwpReadError("zip 끝머리를 찾지 못했어요.");
  const count = u16(buf, eocd + 10);
  let p = u32(buf, eocd + 16);
  const out: Array<[string, Uint8Array]> = [];
  for (let n = 0; n < count && p + 46 <= buf.length; n++) {
    if (u32(buf, p) !== 0x02014b50) break;
    const method = u16(buf, p + 10);
    const csize = u32(buf, p + 20);
    const nameLen = u16(buf, p + 28);
    const extraLen = u16(buf, p + 30);
    const commentLen = u16(buf, p + 32);
    const local = u32(buf, p + 42);
    const name = utf8.decode(buf.subarray(p + 46, p + 46 + nameLen));
    p += 46 + nameLen + extraLen + commentLen;
    if (!/^Contents\/section\d+\.xml$/i.test(name)) continue;
    const start = local + 30 + u16(buf, local + 26) + u16(buf, local + 28);
    const raw = buf.subarray(start, start + csize);
    out.push([name, method === 8 ? await inflateRaw(raw) : raw]);
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

async function hwpxText(buf: Uint8Array): Promise<string> {
  const sections = (await unzipSections(buf)).sort(
    ([a], [b]) => Number(a.match(/(\d+)\.xml$/i)?.[1] ?? 0) - Number(b.match(/(\d+)\.xml$/i)?.[1] ?? 0)
  );
  if (sections.length === 0) throw new HwpReadError("본문을 찾지 못했어요.");
  const lines: string[] = [];
  for (const [, xml] of sections) {
    for (const p of utf8.decode(xml).split(/<\/hp:p>/)) {
      const t = [...p.matchAll(/<hp:t(?:\s[^>]*)?>([\s\S]*?)<\/hp:t>/g)].map((m) => decodeXml(m[1]!.replace(/<[^>]+>/g, ""))).join("");
      if (t.trim()) lines.push(t);
    }
  }
  return lines.join("\n");
}

// ── HWP 5.0 (OLE 문서 묶음)
type DirEntry = { name: string; type: number; start: number; size: number };

function readCfb(buf: Uint8Array): { entries: DirEntry[]; read: (e: DirEntry) => Uint8Array } {
  if (u32(buf, 0) !== 0xe011cfd0 || u32(buf, 4) !== 0xe11ab1a1) throw new HwpReadError("한글 문서 형식이 아니에요.");
  const secSize = 1 << u16(buf, 0x1e);
  const miniSize = 1 << u16(buf, 0x20);
  const numFat = u32(buf, 0x2c);
  const dirStart = u32(buf, 0x30);
  const cutoff = u32(buf, 0x38);
  const miniFatStart = u32(buf, 0x3c);
  let difatSec = u32(buf, 0x44);
  const sec = (n: number) => buf.subarray(512 + n * secSize, 512 + (n + 1) * secSize);

  const fatSecs: number[] = [];
  for (let i = 0; i < 109 && fatSecs.length < numFat; i++) fatSecs.push(u32(buf, 0x4c + i * 4));
  let guard = 0;
  while (fatSecs.length < numFat && difatSec < 0xfffffffa && guard++ < 10000) {
    const d = sec(difatSec);
    for (let i = 0; i < secSize / 4 - 1 && fatSecs.length < numFat; i++) fatSecs.push(u32(d, i * 4));
    difatSec = u32(d, secSize - 4);
  }
  const fat: number[] = [];
  for (const s of fatSecs) {
    const d = sec(s);
    for (let i = 0; i < secSize / 4; i++) fat.push(u32(d, i * 4));
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
  const readChain = (start: number) => concat(chain(start, fat).map(sec));

  const dirBuf = readChain(dirStart);
  const entries: DirEntry[] = [];
  for (let o = 0; o + 128 <= dirBuf.length; o += 128) {
    const nameLen = u16(dirBuf, o + 64);
    entries.push({
      name: utf16.decode(dirBuf.subarray(o, o + Math.max(0, nameLen - 2))),
      type: dirBuf[o + 66]!,
      start: u32(dirBuf, o + 116),
      size: u32(dirBuf, o + 120),
    });
  }
  const root = entries[0];
  const miniStream = root ? readChain(root.start) : new Uint8Array(0);
  const miniFat: number[] = [];
  if (miniFatStart < 0xfffffffa) {
    const m = readChain(miniFatStart);
    for (let i = 0; i + 4 <= m.length; i += 4) miniFat.push(u32(m, i));
  }
  const read = (e: DirEntry): Uint8Array => {
    if (e.size < cutoff) {
      return concat(chain(e.start, miniFat).map((n) => miniStream.subarray(n * miniSize, (n + 1) * miniSize))).subarray(0, e.size);
    }
    return readChain(e.start).subarray(0, e.size);
  };
  return { entries, read };
}

const HWPTAG_PARA_TEXT = 0x10 + 51;

function paraText(rec: Uint8Array): string {
  let s = "";
  for (let i = 0; i + 1 < rec.length; ) {
    const c = u16(rec, i);
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

async function hwp5Text(buf: Uint8Array): Promise<string> {
  const { entries, read } = readCfb(buf);
  const header = entries.find((e) => e.name === "FileHeader");
  if (!header) throw new HwpReadError("한글 문서 머리를 찾지 못했어요.");
  const h = read(header);
  const flags = h.length >= 40 ? u32(h, 36) : 0;
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
    if (compressed) data = await inflateRaw(data);
    for (let p = 0; p + 4 <= data.length; ) {
      const v = u32(data, p);
      const tag = v & 0x3ff;
      let size = (v >>> 20) & 0xfff;
      p += 4;
      if (size === 0xfff) {
        size = u32(data, p);
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
export async function hwpToText(input: ArrayBuffer | Uint8Array, name = ""): Promise<string> {
  const buf = input instanceof Uint8Array ? input : new Uint8Array(input);
  const isZip = buf.length > 4 && u32(buf, 0) === 0x04034b50;
  const text = isZip || /\.hwpx$/i.test(name) ? await hwpxText(buf) : await hwp5Text(buf);
  const clean = text
    .replace(/\r/g, "")
    // 짝 없는 유니코드 반쪽·제어 문자는 DB가 받지 못한다(압축 풀이가 도중에 끊기면 생긴다)
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "")
    // eslint-disable-next-line no-control-regex -- DB(jsonb)가 받지 못하는 제어 문자를 일부러 찾는다
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (clean.replace(/\s/g, "").length < 20) throw new HwpReadError("글자를 거의 찾지 못했어요.");
  return clean;
}

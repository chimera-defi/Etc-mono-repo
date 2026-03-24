/**
 * Pure-JS ZIP builder (STORE, no compression).
 * Shared between the server-side export-zip API route and client-side
 * ExportFileBrowser so edits / removals can be downloaded without a round-trip.
 */

// Build CRC-32 lookup table once at module load time
const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  return table;
})();

function crc32(buf: Uint8Array): number {
  let crc = 0xffffffff;
  for (let k = 0; k < buf.length; k++) crc = CRC32_TABLE[(crc ^ buf[k]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function u16(v: number, buf: Uint8Array, off: number) {
  buf[off] = v & 0xff;
  buf[off + 1] = (v >>> 8) & 0xff;
}

function u32(v: number, buf: Uint8Array, off: number) {
  buf[off] = v & 0xff;
  buf[off + 1] = (v >>> 8) & 0xff;
  buf[off + 2] = (v >>> 16) & 0xff;
  buf[off + 3] = (v >>> 24) & 0xff;
}

export function buildZip(files: Record<string, string>): Uint8Array {
  const enc = new TextEncoder();
  const entries: Array<{ nameBytes: Uint8Array; dataBytes: Uint8Array; crc: number; offset: number }> = [];
  let offset = 0;
  const localParts: Uint8Array[] = [];

  for (const [name, content] of Object.entries(files)) {
    const nameBytes = enc.encode(name);
    const dataBytes = enc.encode(content);
    const crc = crc32(dataBytes);
    const header = new Uint8Array(30 + nameBytes.length);
    header[0] = 0x50; header[1] = 0x4b; header[2] = 0x03; header[3] = 0x04;
    u16(20, header, 4); u16(0, header, 6); u16(0, header, 8);
    u16(0, header, 10); u16(0, header, 12);
    u32(crc, header, 14);
    u32(dataBytes.length, header, 18); u32(dataBytes.length, header, 22);
    u16(nameBytes.length, header, 26); u16(0, header, 28);
    header.set(nameBytes, 30);
    entries.push({ nameBytes, dataBytes, crc, offset });
    offset += header.length + dataBytes.length;
    localParts.push(header, dataBytes);
  }

  const centralParts: Uint8Array[] = [];
  let centralSize = 0;
  for (const entry of entries) {
    const cd = new Uint8Array(46 + entry.nameBytes.length);
    cd[0] = 0x50; cd[1] = 0x4b; cd[2] = 0x01; cd[3] = 0x02;
    u16(20, cd, 4); u16(20, cd, 6); u16(0, cd, 8); u16(0, cd, 10);
    u16(0, cd, 12); u16(0, cd, 14);
    u32(entry.crc, cd, 16); u32(entry.dataBytes.length, cd, 20);
    u32(entry.dataBytes.length, cd, 24); u16(entry.nameBytes.length, cd, 28);
    u16(0, cd, 30); u16(0, cd, 32); u16(0, cd, 34); u16(0, cd, 36);
    u32(0, cd, 38); u32(entry.offset, cd, 42);
    cd.set(entry.nameBytes, 46);
    centralParts.push(cd);
    centralSize += cd.length;
  }

  const eocd = new Uint8Array(22);
  eocd[0] = 0x50; eocd[1] = 0x4b; eocd[2] = 0x05; eocd[3] = 0x06;
  u16(0, eocd, 4); u16(0, eocd, 6);
  u16(entries.length, eocd, 8); u16(entries.length, eocd, 10);
  u32(centralSize, eocd, 12); u32(offset, eocd, 16); u16(0, eocd, 20);

  const allParts = [...localParts, ...centralParts, eocd];
  const total = allParts.reduce((s, p) => s + p.length, 0);
  const result = new Uint8Array(total);
  let pos = 0;
  for (const part of allParts) { result.set(part, pos); pos += part.length; }
  return result;
}

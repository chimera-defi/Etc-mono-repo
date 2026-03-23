import { NextResponse } from "next/server";

import { exportDocument } from "@/lib/specforge/store";
import { getCurrentWorkspaceAccess } from "@/lib/specforge/workspace-access";

type Params = {
  params: Promise<{ id: string }>;
};

// --- minimal pure-JS ZIP (STORE, no compression) ---

function crc32(buf: Uint8Array): number {
  // Pre-computed CRC-32 table
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  let crc = 0xffffffff;
  for (let k = 0; k < buf.length; k++) {
    crc = table[(crc ^ buf[k]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint16LE(v: number, buf: Uint8Array, off: number) {
  buf[off] = v & 0xff;
  buf[off + 1] = (v >>> 8) & 0xff;
}

function writeUint32LE(v: number, buf: Uint8Array, off: number) {
  buf[off] = v & 0xff;
  buf[off + 1] = (v >>> 8) & 0xff;
  buf[off + 2] = (v >>> 16) & 0xff;
  buf[off + 3] = (v >>> 24) & 0xff;
}

function buildZip(files: Record<string, string>): Uint8Array {
  const enc = new TextEncoder();
  const entries: Array<{
    nameBytes: Uint8Array;
    dataBytes: Uint8Array;
    crc: number;
    offset: number;
  }> = [];

  // Compute total size for local entries
  let offset = 0;
  const localParts: Uint8Array[] = [];

  for (const [name, content] of Object.entries(files)) {
    const nameBytes = enc.encode(name);
    const dataBytes = enc.encode(content);
    const crc = crc32(dataBytes);
    const headerSize = 30 + nameBytes.length;
    const header = new Uint8Array(headerSize);

    // Local file header signature
    header[0] = 0x50; header[1] = 0x4b; header[2] = 0x03; header[3] = 0x04;
    writeUint16LE(20, header, 4);   // version needed
    writeUint16LE(0, header, 6);    // flags
    writeUint16LE(0, header, 8);    // compression: STORE
    writeUint16LE(0, header, 10);   // mod time
    writeUint16LE(0, header, 12);   // mod date
    writeUint32LE(crc, header, 14);
    writeUint32LE(dataBytes.length, header, 18); // compressed size
    writeUint32LE(dataBytes.length, header, 22); // uncompressed size
    writeUint16LE(nameBytes.length, header, 26);
    writeUint16LE(0, header, 28);   // extra field length
    header.set(nameBytes, 30);

    entries.push({ nameBytes, dataBytes, crc, offset });
    offset += header.length + dataBytes.length;

    localParts.push(header, dataBytes);
  }

  // Central directory
  const centralParts: Uint8Array[] = [];
  let centralSize = 0;

  for (const entry of entries) {
    const cdSize = 46 + entry.nameBytes.length;
    const cd = new Uint8Array(cdSize);
    cd[0] = 0x50; cd[1] = 0x4b; cd[2] = 0x01; cd[3] = 0x02;
    writeUint16LE(20, cd, 4);   // version made by
    writeUint16LE(20, cd, 6);   // version needed
    writeUint16LE(0, cd, 8);    // flags
    writeUint16LE(0, cd, 10);   // compression: STORE
    writeUint16LE(0, cd, 12);   // mod time
    writeUint16LE(0, cd, 14);   // mod date
    writeUint32LE(entry.crc, cd, 16);
    writeUint32LE(entry.dataBytes.length, cd, 20); // compressed size
    writeUint32LE(entry.dataBytes.length, cd, 24); // uncompressed size
    writeUint16LE(entry.nameBytes.length, cd, 28);
    writeUint16LE(0, cd, 30);   // extra field length
    writeUint16LE(0, cd, 32);   // file comment length
    writeUint16LE(0, cd, 34);   // disk number start
    writeUint16LE(0, cd, 36);   // int file attributes
    writeUint32LE(0, cd, 38);   // ext file attributes
    writeUint32LE(entry.offset, cd, 42); // relative offset
    cd.set(entry.nameBytes, 46);
    centralParts.push(cd);
    centralSize += cdSize;
  }

  // End of central directory
  const eocd = new Uint8Array(22);
  eocd[0] = 0x50; eocd[1] = 0x4b; eocd[2] = 0x05; eocd[3] = 0x06;
  writeUint16LE(0, eocd, 4);   // disk number
  writeUint16LE(0, eocd, 6);   // start disk
  writeUint16LE(entries.length, eocd, 8);
  writeUint16LE(entries.length, eocd, 10);
  writeUint32LE(centralSize, eocd, 12);
  writeUint32LE(offset, eocd, 16);
  writeUint16LE(0, eocd, 20);  // comment length

  // Concatenate all parts
  const allParts = [...localParts, ...centralParts, eocd];
  const total = allParts.reduce((s, p) => s + p.length, 0);
  const result = new Uint8Array(total);
  let pos = 0;
  for (const part of allParts) {
    result.set(part, pos);
    pos += part.length;
  }
  return result;
}

// -------------------------------------------------------

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const { workspaceId } = await getCurrentWorkspaceAccess();

  const bundle = await exportDocument(id, { workspaceId });
  const zipBytes = buildZip(bundle.files);

  // Use the document_id as slug (bundle has document_id + version + files)
  const slugTitle = bundle.document_id
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

  const buf = Buffer.from(zipBytes);

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${slugTitle}-spec-bundle.zip"`,
      "Content-Length": String(buf.length),
    },
  });
}

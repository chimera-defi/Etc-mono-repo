const fs = require("node:fs/promises");
const path = require("node:path");

const { Server } = require("@hocuspocus/server");
const Y = require("yjs");

const port = Number(process.env.PORT ?? 4321);
const roomStoreDir = path.resolve(
  __dirname,
  "..",
  ".data",
  "collab-rooms",
);

function getRoomSnapshotPath(documentName) {
  const safeName = encodeURIComponent(documentName);
  return path.join(roomStoreDir, `${safeName}.bin`);
}

async function ensureRoomStoreDir() {
  await fs.mkdir(roomStoreDir, { recursive: true });
}

async function loadRoomSnapshot(documentName) {
  const snapshotPath = getRoomSnapshotPath(documentName);

  try {
    const snapshot = await fs.readFile(snapshotPath);
    const document = new Y.Doc();
    Y.applyUpdate(document, new Uint8Array(snapshot));
    return document;
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

async function storeRoomSnapshot(documentName, document) {
  const snapshotPath = getRoomSnapshotPath(documentName);
  const state = Buffer.from(Y.encodeStateAsUpdate(document));

  await fs.writeFile(snapshotPath, state);
}

const server = new Server({
  name: "specforge-collab",
  async onListen() {
    console.log(`SpecForge collab server listening on ws://localhost:${port}`);
  },
  async onLoadDocument(data) {
    const snapshot = await loadRoomSnapshot(data.documentName);

    if (snapshot) {
      console.log(`loaded persisted room ${data.documentName}`);
      return snapshot;
    }

    console.log(`starting fresh room ${data.documentName}`);
    return null;
  },
  async onStoreDocument(data) {
    await storeRoomSnapshot(data.documentName, data.document);
    console.log(`persisted room ${data.documentName}`);
  },
  async onConnect(data) {
    console.log(`client connected to ${data.documentName}`);
  },
  async onDisconnect(data) {
    console.log(`client disconnected from ${data.documentName}`);
  },
  port,
});

async function main() {
  await ensureRoomStoreDir();
  await server.listen();
}

main().catch((error) => {
  console.error("Failed to start SpecForge collab server", error);
  process.exit(1);
});

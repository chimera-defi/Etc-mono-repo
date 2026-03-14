const fs = require("node:fs/promises");
const path = require("node:path");

const { Server } = require("@hocuspocus/server");
const Y = require("yjs");
const { verifyCollabToken } = require("../../lib/collab-auth.js");

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

function logEvent(event, fields = {}) {
  console.log(
    JSON.stringify({
      at: new Date().toISOString(),
      event,
      ...fields,
    }),
  );
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
    logEvent("server_listen", { url: `ws://localhost:${port}` });
  },
  async onAuthenticate(data) {
    try {
      const claims = verifyCollabToken(data.token, {
        expectedRoomName: data.documentName,
      });

      data.context.actor = {
        actor_id: claims.sub,
        actor_name: claims.actor_name,
        actor_type: claims.actor_type,
        actor_color: claims.actor_color,
      };
      logEvent("auth_ok", {
        room: data.documentName,
        actor_id: claims.sub,
        actor_type: claims.actor_type,
        socket_id: data.socketId,
      });

      return {
        context: data.context,
      };
    } catch (error) {
      logEvent("auth_failed", {
        room: data.documentName,
        socket_id: data.socketId,
        reason: error instanceof Error ? error.message : "Unknown auth failure",
      });
      throw error;
    }
  },
  async onLoadDocument(data) {
    const snapshot = await loadRoomSnapshot(data.documentName);

    if (snapshot) {
      logEvent("room_load", {
        room: data.documentName,
        source: "snapshot",
      });
      return snapshot;
    }

    logEvent("room_load", {
      room: data.documentName,
      source: "fresh",
    });
    return null;
  },
  async onStoreDocument(data) {
    await storeRoomSnapshot(data.documentName, data.document);
    logEvent("room_store", {
      room: data.documentName,
      byte_length: Y.encodeStateAsUpdate(data.document).byteLength,
    });
  },
  async onConnect(data) {
    logEvent("client_connected", {
      room: data.documentName,
      socket_id: data.socketId,
      actor_id: data.context.actor?.actor_id ?? "unknown",
      actor_type: data.context.actor?.actor_type ?? "unknown",
    });
  },
  async onDisconnect(data) {
    logEvent("client_disconnected", {
      room: data.documentName,
      socket_id: data.socketId,
      actor_id: data.context.actor?.actor_id ?? "unknown",
      actor_type: data.context.actor?.actor_type ?? "unknown",
    });
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

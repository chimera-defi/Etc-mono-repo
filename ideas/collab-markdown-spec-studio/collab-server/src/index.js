const { Server } = require("@hocuspocus/server");

const port = Number(process.env.PORT ?? 4321);

const server = new Server({
  name: "specforge-collab",
  async onListen() {
    console.log(`SpecForge collab server listening on ws://localhost:${port}`);
  },
  async onConnect(data) {
    console.log(`client connected to ${data.documentName}`);
  },
  async onDisconnect(data) {
    console.log(`client disconnected from ${data.documentName}`);
  },
  port,
});

server.listen();

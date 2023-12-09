import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({
  port: 8080,
});

const sockets = new Map<number, WebSocket>();

wss.on("connection", socket => {
  const index = sockets.size;
  sockets.set(index, socket);
  console.log(`Client ${index} connected`);
  socket.on("message", data => {
    for (const [i, socket] of sockets) {
      if (i !== index) {
        socket.send(data.toString());
      }
    }
  });

  socket.on("close", () => {
    sockets.delete(index);
  });
});


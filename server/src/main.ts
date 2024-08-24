import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { Server } from "./server";

const PORT = process.env.PORT || 8000;

const app: express.Application = express();

const httpServer = createServer(app);
const io: SocketIOServer = new SocketIOServer(httpServer);

app.use(express.json());
// Serve the React static files after build
app.use(express.static("../../client/build"));

httpServer.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

const roundRobinServer = new Server(app);

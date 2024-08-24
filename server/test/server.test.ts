import express from "express";

import request from "supertest";

import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { Server } from "../src/server";

const PORT = process.env.PORT || 9999;

const app: express.Application = express();

const httpServer = createServer(app);
const io: SocketIOServer = new SocketIOServer(httpServer);

app.use(express.json());
// Serve the React static files after build
app.use(express.static("../../client/build"));

const roundRobinServer = new Server(app);

beforeAll(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
  });
});

afterAll(() => {
  httpServer.close();
});

describe("Server", () => {
  it("should respond on `/`", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.text).toBe("Round robin server");
  });
});

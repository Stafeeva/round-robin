import express from "express";

import request from "supertest";

import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { Server } from "../src/server";
import * as meeting from "@App/repository/meeting";
import { Service as MeetingService } from "@App/service/meeting";

// db dependencies
import mysql from "mysql";
import puresql, { PuresqlAdapter } from "puresql";

const PORT = process.env.PORT || 9999;

const app: express.Application = express();

const httpServer = createServer(app);
const io: SocketIOServer = new SocketIOServer(httpServer);

app.use(express.json());
// Serve the React static files after build
app.use(express.static("../../client/build"));

// setup db connection

const dbConnection = mysql.createConnection({
  host: "0.0.0.0",
  port: 3306,
  user: "root", // defined in docker-compose.yml
  password: "password",
  database: "roundrobin",
});

const pureSQLAdapter: PuresqlAdapter = puresql.adapters.mysql(
  dbConnection,
  () => {}
);

const pureSQLQueries: Record<
  string,
  puresql.PuresqlQuery<any>
> = puresql.loadQueries("server/src/queries.sql");

const meetingRepository = new meeting.SQLRepository(
  pureSQLAdapter,
  pureSQLQueries
);
const meetingService = new MeetingService(meetingRepository);

const roundRobinServer = new Server(app, meetingService);

beforeAll(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
  });
});

afterAll(() => {
  httpServer.close();
});

// TODO - clean the DB before each test

beforeEach(() => {
  console.log("before each");

  // clean the DB
  dbConnection.query("SET FOREIGN_KEY_CHECKS = 0");
  dbConnection.query("TRUNCATE TABLE meeting");
  dbConnection.query("TRUNCATE TABLE speaker");
  dbConnection.query("TRUNCATE TABLE meeting_speaker");
  dbConnection.query("SET FOREIGN_KEY_CHECKS = 1");
});

describe("Server", () => {
  it("should respond on `/`", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.text).toBe("Round robin server");
  });

  it("should return a list of meetings", async () => {
    const response = await request(app).get("/api/meeting");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);

    // insert a meeting into the database and test again
    dbConnection.query(
      "insert into meeting set name='test', code='abc-123-def', speaker_duration=30, auto_proceed=false, state='NotStarted';"
    );

    const responseAfterInsert = await request(app).get("/api/meeting");
    expect(responseAfterInsert.status).toBe(200);
    expect(responseAfterInsert.body.length).toBe(1);
  });
});

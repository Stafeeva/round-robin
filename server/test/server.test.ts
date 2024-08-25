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
  httpServer.listen(PORT, () => {});
});

afterAll(() => {
  httpServer.close();
  dbConnection.end();
});

// TODO - clean the DB before each test

beforeEach(() => {
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

  // progress meeting (move to next speaker / end meeting)

  // delete meeting
});

describe("GET /api/meeting/", () => {
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

describe("POST /api/meeting", () => {
  // create meeting
  it("should create a meeting", async () => {
    const response = await request(app)
      .post("/api/meeting")
      .send({ name: "test meeting" })
      .expect("Content-Type", /json/)
      .expect(201);

    const meetingFromAPI = response.body;
    expect(meetingFromAPI.name).toBe("test meeting");

    // ensure default fields are set
    expect(meetingFromAPI.autoProceed).toBe(false);
    expect(meetingFromAPI.speakerDuration).toBe(60);

    // ensure the meeting was saved to the db
    const meetingFromDb = await meetingRepository.getMeeting(
      meetingFromAPI.code
    );
    expect(meetingFromDb.name).toBe(meetingFromAPI.name);
  });

  // TODO - test create meeting with invalid input
  // no name

  it("should return a 400 when no meeting name is provided", async () => {
    const response = await request(app)
      .post("/api/meeting")
      .send({ speakerDuration: 30, autoProceed: false })
      .expect(400);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid meeting name");
  });

  it("should return a 400 when the speaker duration is invalid", async () => {
    const response = await request(app)
      .post("/api/meeting")
      .send({ name: "test", speakerDuration: 15, autoProceed: false })
      .expect(400);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      "Invalid speaker duration, must be between 30 and 600 seconds"
    );

    const responseTooHigh = await request(app)
      .post("/api/meeting")
      .send({ name: "test", speakerDuration: 999, autoProceed: false })
      .expect(400);

    expect(responseTooHigh.status).toBe(400);
  });

  it("should return a 400 when autoProceed is invalid", async () => {
    const response = await request(app)
      .post("/api/meeting")
      .send({
        name: "test",
        speakerDuration: 30,
        autoProceed: "invalid-not-a-boolean",
      })
      .expect(400);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      "Invalid autoProceed value, must be a boolean"
    );
  });
});

describe("GET /api/meeting/:code", () => {
  // get meeting by code
  it("should return a meeting by code", async () => {
    // given a meeting exists in the DB
    const meetingCode = "abc-123-def";

    await meetingRepository.createMeeting({
      name: "test",
      speakerDuration: 30,
      autoProceed: false,
      code: meetingCode,
    });

    // when we request the meeting by code
    const response = await request(app).get(`/api/meeting/${meetingCode}`);

    // then we should get the meeting
    expect(response.status).toBe(200);
    expect(response.body.name).toBe("test");
  });

  it("should return a 404 when the meeting does not exist in the DB", async () => {
    // when we request a meeting that does not exist
    const response = await request(app).get("/api/meeting/xyz-123-abc");

    // then we should get a 404
    expect(response.status).toBe(404);
  });

  it("should return a 400 when an invalid meeting code is provided", async () => {
    // when we request a meeting with an invalid code
    const response = await request(app).get(
      "/api/meeting/invalid-meeting-code"
    );

    // then we should get a 400
    expect(response.status).toBe(400);
  });
});

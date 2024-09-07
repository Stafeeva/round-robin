import express from "express";

import request from "supertest";

import * as entity from "@App/domain/entity";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { Server } from "../src/server";
import * as meeting from "@App/repository/meeting";
import * as speaker from "@App/repository/speaker";
import * as note from "@App/repository/note";
import { Service as MeetingService } from "@App/service/meeting";
import { Service as SpeakerService } from "@App/service/speaker";
import * as service from "@App/domain/service";

import { Service as NotificationService } from "@App/service/notification";

import { io } from "socket.io-client";

// db dependencies
import mysql from "mysql";
import puresql, { PuresqlAdapter } from "puresql";

const PORT = process.env.PORT || 9999;

const app: express.Application = express();

const httpServer = createServer(app);
const socketIOServer: SocketIOServer = new SocketIOServer(httpServer);

app.use(express.json());
// Serve the React static files after build
app.use(express.static("../../client/build"));

// setup db connection

const dbConnection = mysql.createConnection({
  host: "0.0.0.0",
  port: 3307,
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

const speakerRepository = new speaker.SQLRepository(
  pureSQLAdapter,
  pureSQLQueries
);

const noteRepository = new note.SQLRepository(pureSQLAdapter, pureSQLQueries);

const notificationService = new NotificationService(socketIOServer);

const meetingService = new MeetingService(
  meetingRepository,
  noteRepository,
  notificationService
);
const speakerService = new SpeakerService(speakerRepository);

const roundRobinServer = new Server(app, meetingService, speakerService);

// setup socket io client
const socket = io(`http://localhost:${PORT}`);

beforeAll(() => {
  httpServer.listen(PORT, () => {});
});

afterAll(() => {
  httpServer.close();
  dbConnection.end();
  socket.close();
});

beforeEach(() => {
  // clean the DB
  dbConnection.query("SET FOREIGN_KEY_CHECKS = 0");
  dbConnection.query("TRUNCATE TABLE meeting");
  dbConnection.query("TRUNCATE TABLE speaker");
  dbConnection.query("TRUNCATE TABLE meeting_speaker");
  dbConnection.query("TRUNCATE TABLE note");
  dbConnection.query("TRUNCATE TABLE action");
  dbConnection.query("SET FOREIGN_KEY_CHECKS = 1");
});

// Define a helper function to wait for a condition to become true within a timeout
const waitForCondition = async (
  conditionFn: () => boolean,
  timeoutMs = 1000,
  intervalMs = 100
) => {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const checkCondition = async () => {
      if (await conditionFn()) {
        resolve(true);
      } else if (Date.now() - startTime > timeoutMs) {
        reject(new Error("Timeout waiting for condition"));
      } else {
        setTimeout(checkCondition, intervalMs);
      }
    };
    checkCondition();
  });
};

describe("Server", () => {
  it("should respond on `/`", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.text).toBe("Round robin server");
  });

  // progress meeting (move to next speaker / end meeting)

  // delete meeting
});

const setUpLoggedInSpeaker = async () => {
  const speaker = await speakerService.createSpeaker({
    username: "logged-in-speaker",
    password: "password",
    firstName: "Test",
    lastName: "Speaker",
  });

  const response = await request(app)
    .post("/api/speaker:login")
    .send({
      username: "logged-in-speaker",
      password: "password",
    })
    .expect("Content-Type", /json/)
    .expect(200);

  // expect a token to be returned
  const token = response.body.token;
  return { speaker, token };
};

describe("GET /api/meeting/", () => {
  it("should return a list of meetings WIP", async () => {
    const { speaker, token } = await setUpLoggedInSpeaker();

    const response = await request(app)
      .get("/api/meeting")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);

    // insert a meeting into the database and test again
    dbConnection.query(
      "insert into meeting set name='test', code='abc-123-def', speaker_duration=30, auto_proceed=false, state='NotStarted';"
    );

    // list meetings only returns meetings that the logged in user is part of

    // meeting is not returned as the speaker is not part of the meeting
    const responseAfterInsert = await request(app)
      .get("/api/meeting")
      .set("Authorization", `Bearer ${token}`);
    expect(responseAfterInsert.status).toBe(200);
    expect(responseAfterInsert.body.length).toBe(0);

    // add logged in speaker to the meeting
    await meetingService.addSpeakerToMeeting("abc-123-def", speaker.id);

    const responseAfterAddingSpeakerToMeeting = await request(app)
      .get("/api/meeting")
      .set("Authorization", `Bearer ${token}`);
    expect(responseAfterAddingSpeakerToMeeting.status).toBe(200);
    expect(responseAfterAddingSpeakerToMeeting.body.length).toBe(1);

    expect(responseAfterAddingSpeakerToMeeting.body[0].speakers.length).toBe(1);

    expect(
      responseAfterAddingSpeakerToMeeting.body[0].speakers[0].username
    ).toBe(speaker.username);
  });
});

describe("POST /api/meeting", () => {
  // create meeting
  it("should create a meeting", async () => {
    const { token } = await setUpLoggedInSpeaker();

    const response = await request(app)
      .post("/api/meeting")
      .set("Authorization", `Bearer ${token}`)
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

  it("should return a 400 when no meeting name is provided", async () => {
    const { token } = await setUpLoggedInSpeaker();

    const response = await request(app)
      .post("/api/meeting")
      .set("Authorization", `Bearer ${token}`)
      .send({ speakerDuration: 30, autoProceed: false })
      .expect(400);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid meeting name");
  });

  it("should return a 400 when the speaker duration is invalid", async () => {
    const { token } = await setUpLoggedInSpeaker();

    const response = await request(app)
      .post("/api/meeting")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "test", speakerDuration: 15, autoProceed: false })
      .expect(400);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      "Invalid speaker duration, must be between 30 and 600 seconds"
    );

    const responseTooHigh = await request(app)
      .post("/api/meeting")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "test", speakerDuration: 999, autoProceed: false })
      .expect(400);

    expect(responseTooHigh.status).toBe(400);
  });

  it("should return a 400 when autoProceed is invalid", async () => {
    const { token } = await setUpLoggedInSpeaker();

    const response = await request(app)
      .post("/api/meeting")
      .set("Authorization", `Bearer ${token}`)
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
    const { token } = await setUpLoggedInSpeaker();

    // given a meeting exists in the DB
    const meetingCode = "abc-123-def";

    await meetingRepository.createMeeting({
      name: "test",
      speakerDuration: 30,
      autoProceed: false,
      code: meetingCode,
    });

    // when we request the meeting by code
    const response = await request(app)
      .get(`/api/meeting/${meetingCode}`)
      .set("Authorization", `Bearer ${token}`);

    // then we should get the meeting
    expect(response.status).toBe(200);
    expect(response.body.name).toBe("test");
  });

  it("should return a 404 when the meeting does not exist in the DB", async () => {
    const { token } = await setUpLoggedInSpeaker();

    // when we request a meeting that does not exist
    const response = await request(app)
      .get("/api/meeting/xyz-123-abc")
      .set("Authorization", `Bearer ${token}`);

    // then we should get a 404
    expect(response.status).toBe(404);
  });

  it("should return a 400 when an invalid meeting code is provided", async () => {
    const { token } = await setUpLoggedInSpeaker();

    // when we request a meeting with an invalid code
    const response = await request(app)
      .get("/api/meeting/invalid-meeting-code")
      .set("Authorization", `Bearer ${token}`);

    // then we should get a 400
    expect(response.status).toBe(400);
  });
});

describe("POST /api/speaker", () => {
  it("creates a speaker", async () => {
    const response = await request(app)
      .post("/api/speaker")
      .send({
        username: "test-speaker",
        password: "password",
        firstName: "Test",
        lastName: "Speaker",
      })
      .expect("Content-Type", /json/)
      .expect(201);

    const speakerFromAPI = response.body;

    expect(speakerFromAPI.id).toBe(1);
    expect(speakerFromAPI.username).toBe("test-speaker");
    expect(speakerFromAPI.firstName).toBe("Test");
    expect(speakerFromAPI.lastName).toBe("Speaker");

    // password field should not exist on the response
    expect(speakerFromAPI.password).toBeUndefined();

    // ensure the speaker was saved to the db
    // ensure the password is hashed

    const speakerFromDb = await speakerRepository.getSpeaker(
      speakerFromAPI.username
    );

    expect(speakerFromDb.id).toBe(1);
    expect(speakerFromDb.username).toBe("test-speaker");
    expect(speakerFromDb.password).not.toBe("password");

    // check the hashed password
    const isMatchingPassword = await service.comparePasswords(
      "password",
      speakerFromDb.password
    );
    expect(isMatchingPassword).toBe(true);
  });

  // TODO some tests should be unit tests closer to implementation
  // create speaker with invalid username
  // create speaker with invalid password
  // create speaker with invalid first name
  // create speaker with invalid last name
  // create speaker with existing username

  // TODO
  // get speaker by username / id ? is this needed?
});

describe("POST /api/speaker:login", () => {
  it("logs in a speaker", async () => {
    // create a speaker
    await speakerService.createSpeaker({
      username: "test-speaker",
      password: "password",
      firstName: "Test",
      lastName: "Speaker",
    });

    const response = await request(app)
      .post("/api/speaker:login")
      .send({
        username: "test-speaker",
        password: "password",
      })
      .expect("Content-Type", /json/)
      .expect(200);

    // expect a token to be returned
    const token = response.body.token;

    // verify the token is valid
    const tokenPayload = await speakerService.verifyToken(token);
    expect(tokenPayload.speakerUsername).toBe("test-speaker");
    expect(tokenPayload.speakerId).toBe(1);
  });

  it("returns a 401 when the password is incorrect", async () => {
    // create a speaker
    await speakerService.createSpeaker({
      username: "test-speaker",
      password: "password",
      firstName: "Test",
      lastName: "Speaker",
    });
    // send wrong credentials
    const response = await request(app).post("/api/speaker:login").send({
      username: "test-speaker",
      password: "wrong-password",
    });

    expect(response.status).toBe(401);
  });

  // TODO - try to log in with a username that does not exist - 401?
});

describe("POST /api/meeting/:code/speaker", () => {
  it("adds a speaker to a meeting", async () => {
    const { speaker, token } = await setUpLoggedInSpeaker();

    // create a meeting
    const meeting = await meetingService.createMeeting({
      name: "test",
      speakerDuration: 30,
      autoProceed: false,
    });

    // add the speaker to the meeting
    const response = await request(app)
      .post(`/api/meeting/${meeting.code}/speaker`)
      .set("Authorization", `Bearer ${token}`)
      .send({ speakerId: speaker.id })
      .expect(201);

    // expect the speaker to be added to the meeting
    const speakers = await meetingRepository.getSpeakers(meeting.code);
    expect(speakers.length).toBe(1);
    expect(speakers[0].id).toBe(speaker.id);
  });
});

describe("POST /api/meeting/:code[:]start", () => {
  it("starts a meeting", async () => {
    const { token } = await setUpLoggedInSpeaker();

    // create a meeting
    const meeting = await meetingService.createMeeting({
      name: "test-meeting",
      speakerDuration: 30,
      autoProceed: false,
    });

    // add a speaker to the meeting
    const speakerOne = await speakerService.createSpeaker({
      username: "test-speaker-one",
      password: "password",
      firstName: "Test",
      lastName: "Speaker",
    });

    // add a second speaker to the meeting
    const speakerTwo = await speakerService.createSpeaker({
      username: "test-speaker-two",
      password: "password",
      firstName: "Test",
      lastName: "Speaker",
    });

    await meetingService.addSpeakerToMeeting(meeting.code, speakerOne.id);
    await meetingService.addSpeakerToMeeting(meeting.code, speakerTwo.id);

    // start the meeting
    const response = await request(app)
      .post(`/api/meeting/${meeting.code}:start`)
      .set("Authorization", `Bearer ${token}`)
      .send({})
      .expect(200);
    expect(response.body.state).toBe(entity.MeetingState.InProgress);

    // expect the meeting to be in progress
    const meetingAfterStart = await meetingRepository.getMeeting(meeting.code);
    expect(meetingAfterStart.state).toBe(entity.MeetingState.InProgress);

    // verify speaker queue
    expect(meetingAfterStart.speakerQueue).toEqual(
      expect.arrayContaining([speakerOne.id, speakerTwo.id])
    );
  });
});

describe("POST /api/meeting/:code[:]next", () => {
  it("moves to the next speaker", async () => {
    const { token } = await setUpLoggedInSpeaker();

    let webSocketMeetingUpdates: entity.Meeting[] = [];

    // create a meeting
    const meeting = await meetingService.createMeeting({
      name: "test-meeting",
      speakerDuration: 30,
      autoProceed: false,
    });

    socket.emit("joinRoom", meeting.code);

    socket.on("meetingUpdated", (meeting: entity.Meeting) => {
      webSocketMeetingUpdates.push(meeting);
    });

    // add a speaker to the meeting
    const speakerOne = await speakerService.createSpeaker({
      username: "test-speaker-one",
      password: "password",
      firstName: "Test",
      lastName: "Speaker",
    });

    // add a second speaker to the meeting
    const speakerTwo = await speakerService.createSpeaker({
      username: "test-speaker-two",
      password: "password",
      firstName: "Test",
      lastName: "Speaker",
    });

    // add a third speaker to the meeting
    const speakerThree = await speakerService.createSpeaker({
      username: "test-speaker-three",
      password: "password",
      firstName: "Test",
      lastName: "Speaker",
    });

    // no web socket updates yet
    expect(webSocketMeetingUpdates.length).toBe(0);

    await meetingService.addSpeakerToMeeting(meeting.code, speakerOne.id);
    await meetingService.addSpeakerToMeeting(meeting.code, speakerTwo.id);
    await meetingService.addSpeakerToMeeting(meeting.code, speakerThree.id);

    // start the meeting
    const response = await request(app)
      .post(`/api/meeting/${meeting.code}:start`)
      .set("Authorization", `Bearer ${token}`)
      .send({})
      .expect(200);
    expect(response.body.state).toBe(entity.MeetingState.InProgress);

    const speakerQueue = response.body.speakerQueue;

    waitForCondition(() => {
      return (
        webSocketMeetingUpdates.length === 1 &&
        webSocketMeetingUpdates[0].state === entity.MeetingState.InProgress
      );
    });

    // move to the next speaker
    expect(
      (
        await request(app)
          .post(`/api/meeting/${meeting.code}:next`)
          .set("Authorization", `Bearer ${token}`)
          .expect(200)
      ).body.speakerQueue
    ).toEqual(speakerQueue.slice(1));

    waitForCondition(() => webSocketMeetingUpdates.length === 2);

    // move to the next speaker
    expect(
      (
        await request(app)
          .post(`/api/meeting/${meeting.code}:next`)
          .set("Authorization", `Bearer ${token}`)
          .expect(200)
      ).body.speakerQueue
    ).toEqual(speakerQueue.slice(2));

    waitForCondition(() => webSocketMeetingUpdates.length === 3);

    // move to the last speaker
    const finalMeetingResponse = await request(app)
      .post(`/api/meeting/${meeting.code}:next`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    // meeting has ended
    const finalMeeting = finalMeetingResponse.body;
    expect(finalMeeting.speakerQueue).toEqual(speakerQueue.slice(3));
    expect(finalMeeting.state).toBe(entity.MeetingState.Ended);
  });
});

describe("Authentication", () => {
  it("returns a 401 when no authorization token is passed", async () => {
    const response = await request(app).get("/api/meeting");
    expect(response.status).toBe(401);
  });

  it("returns a 401 when an invalid token is passed", async () => {
    const response = await request(app)
      .get("/api/meeting")
      .set("Authorization", "Bearer invalid-token");
    expect(response.status).toBe(401);
  });
});

describe("POST /api/meeting/:code/note", () => {
  it("adds a note to a meeting", async () => {
    const { speaker, token } = await setUpLoggedInSpeaker();

    // create a meeting
    const meeting = await meetingService.createMeeting({
      name: "test",
      speakerDuration: 30,
      autoProceed: false,
    });

    // with a speaker
    await request(app)
      .post(`/api/meeting/${meeting.code}/speaker`)
      .set("Authorization", `Bearer ${token}`)
      .send({ speakerId: speaker.id })
      .expect(201);

    // add a note to the meeting
    const response = await request(app)
      .post(`/api/meeting/${meeting.code}/note`)
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "A test note" })
      .expect("Content-Type", /json/)
      .expect(201);
  });
});

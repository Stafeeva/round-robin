import mysql from "mysql";
import puresql from "puresql";

import { MeetingRepository } from "@App/domain/repository";
import * as entity from "@App/domain/entity";
import { SQLRepository } from "@App/repository/meeting";
import { MeetingState } from "@App/domain/entity";

// setup db connection and sql repository
const dbConnection = mysql.createConnection({
  host: "0.0.0.0",
  port: 3307,
  user: "root", // defined in docker-compose.yml
  password: "password",
  database: "roundrobin",
});

const pureSQLAdapter = puresql.adapters.mysql(dbConnection, () => {});
const pureSQLQueries = puresql.loadQueries("server/src/queries.sql");
const meetingRepository: MeetingRepository = new SQLRepository(
  pureSQLAdapter,
  pureSQLQueries
);

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

afterAll(() => {
  dbConnection.end();
});

describe("Meeting Repository", () => {
  it("returns an empty list when there are no meetings in the DB", async () => {
    const meetings = await meetingRepository.listMeetings();
    expect(meetings).toEqual([]);
  });

  // test with one or more meetings in the DB
  it("returns a meeting that exists in the db", async () => {
    // insert a meeting in the DB
    dbConnection.query(
      "insert into meeting set name='test', code='abc-123-def', speaker_duration=30, auto_proceed=false, state='NotStarted';"
    );

    // list meetings
    const meetings = await meetingRepository.listMeetings();
    expect(meetings.length).toEqual(1);

    // verify that the meeting added to the db was returned
    // test the meeting conforms to the entity model
    const meeting = meetings[0];
    expect(meeting.name).toEqual("test");
    expect(meeting.code).toEqual("abc-123-def");
    expect(meeting.speakerDuration).toEqual(30);
    expect(meeting.autoProceed).toEqual(false);
    expect(meeting.state).toEqual(MeetingState.NotStarted);
    expect(meeting.createdAt).toBeInstanceOf(Date);
    expect(meeting.speakerQueue).toEqual([]);
  });

  it("returns a meeting by code", async () => {
    // insert a meeting in the DB
    dbConnection.query(
      "insert into meeting set name='test', code='abc-123-def', speaker_duration=30, auto_proceed=false, state='NotStarted', speaker_queue='[1,2,3]';"
    );

    const meeting = await meetingRepository.getMeeting("abc-123-def");

    expect(meeting.name).toEqual("test");
  });

  it("throws an error when meeting is not found", async () => {
    try {
      await meetingRepository.getMeeting("abc-123-def");
      fail("should have thrown an error");
    } catch (e) {
      // check that the error is of type MeetingNotFoundError
      expect(e).toBeInstanceOf(entity.MeetingNotFoundError);
    }
  });
});

// create a meeting
it("should create a meeting", async () => {
  const meeting = await meetingRepository.createMeeting({
    name: "Apollo standup",
    speakerDuration: 60,
    autoProceed: false,
    code: "abc-123-xyz",
  });

  expect(meeting.name).toEqual("Apollo standup");
  expect(meeting.speakerDuration).toEqual(60);
  expect(meeting.autoProceed).toEqual(false);
  expect(meeting.code).toEqual("abc-123-xyz");
  expect(meeting.state).toEqual(MeetingState.NotStarted);
  expect(meeting.speakerQueue).toEqual([]);
  expect(meeting.createdAt).toBeInstanceOf(Date);
});

it("deletes a meeting", async () => {
  // insert a meeting in the DB
  dbConnection.query(
    "insert into meeting set name='test', code='abc-123-def', speaker_duration=30, auto_proceed=false, state='NotStarted', speaker_queue='[1,2,3]';"
  );
  const meetingsUpdated = await meetingRepository.listMeetings();
  expect(meetingsUpdated.length).toEqual(1);

  // delete meeting
  await meetingRepository.deleteMeeting("abc-123-def");
  const meetingsAfterDeletion = await meetingRepository.listMeetings();
  expect(meetingsAfterDeletion).toEqual([]);
});

// // start a meeting
it("starts a meeting", async () => {
  dbConnection.query(
    "insert into meeting set name='test', code='abc-123-def', speaker_duration=30, auto_proceed=false, state='NotStarted', speaker_queue='[]';"
  );

  // update a meeting state (to progress the meeting, updating state and speaker queue)
  const meeting = await meetingRepository.updateMeetingState(
    MeetingState.InProgress,
    "abc-123-def",
    [1, 2, 3]
  );
  expect(meeting.state).toEqual(MeetingState.InProgress);
  expect(meeting.speakerQueue).toEqual([1, 2, 3]);
});

// add a speaker to a meeting
// remove a speaker from a meeting

// TODO later notes and actions

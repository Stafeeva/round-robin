/*
    Repository abstraction over the databse
*/

import * as entity from "@App/domain/entity";

export type CreateMeeting = {
  name: string;
  speakerDuration: number;
  autoProceed: boolean;
  code: string;
};

export interface MeetingRepository {
  listMeetings(): Promise<entity.Meeting[]>;
  getMeeting(code: string): Promise<entity.Meeting>;
  createMeeting(meeting: CreateMeeting): Promise<entity.Meeting>;
  deleteMeeting(code: string): Promise<void>;
  updateMeetingState(
    state: entity.MeetingState,
    code: string,
    speakerQueue: number[]
  ): Promise<entity.Meeting>;
  getSpeakers(meetingCode: string): Promise<entity.Speaker[]>;
  addSpeakerToMeeting(meetingId: number, speakerId: number): Promise<void>;
}

export type CreateSpeaker = {
  username: string;
  password: string; // hashed password
  firstName: string;
  lastName: string;
};

export interface SpeakerRepository {
  createSpeaker(speaker: CreateSpeaker): Promise<entity.Speaker>;
  getSpeaker(username: string): Promise<entity.Speaker>;
}

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
  listMeetings(speakerId?: number): Promise<entity.Meeting[]>;
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
  getSpeaker(username: string): Promise<entity.SpeakerWithPassword>;
}

export type CreateNote = {
  meetingId: number;
  speakerId: number;
  text: string;
};

export interface NoteRepository {
  createNote(note: CreateNote): Promise<entity.Note>;
  getNote(noteId: number): Promise<entity.Note>;
  getNotes(meetingId: number): Promise<entity.Note[]>;
}

export type CreateAction = {
  meetingId: number;
  createdBy: number;
  ownerId: number;
  text: string;
};
export interface ActionRepository {
  createAction(action: CreateAction): Promise<entity.Action>;
  getAction(actionId: number): Promise<entity.Action>;
  getActions(meetingId: number): Promise<entity.Action[]>;
}

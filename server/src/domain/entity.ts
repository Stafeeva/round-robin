/*
Domain entity models, based on Domain Driven Design
*/

export enum MeetingState {
  NotStarted = "NotStarted",
  InProgress = "InProgress",
  Ended = "Ended",
}

// TODO: separate Meeting model for list meetings
// more info on the individual meeting model ?

export type Meeting = {
  id: number;
  name: string;
  code: string;
  speakerDuration: number;
  autoProceed: boolean;
  state: MeetingState;
  createdAt: Date;
  speakerQueue: number[];
  // speakers: SpeakerWithoutPassword[];
  // notes: Note[];
  // TODO: add actions
};

export type MeetingAggregate = Meeting & {
  speakers: Speaker[];
  notes: Note[];
};

export type Speaker = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
};

export type SpeakerWithPassword = Speaker & {
  password: string;
};

export type Note = {
  id: number;
  meetingId: number;
  speakerId: number;
  text: string;
  createdAt: Date;
};

/**
 * Errors
 */

export class MeetingNotFoundError extends Error {}
export class InvalidMeetingCodeError extends Error {}
export class InvalidMeetingNameError extends Error {}
export class InvalidSpeakerDurationError extends Error {}
export class InvalidAutoProceedError extends Error {}
export class InvalidPasswordError extends Error {}
export class InvalidTokenError extends Error {}

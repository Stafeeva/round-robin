/*
Domain entity models, based on Domain Driven Design
*/

export enum MeetingState {
  NotStarted = "NotStarted",
  InProgress = "InProgress",
  Ended = "Ended",
}

export type Meeting = {
  id: number;
  name: string;
  code: string;
  speakerDuration: number;
  autoProceed: boolean;
  state: MeetingState;
  createdAt: Date;
  speakerQueue: number[];
};

export type MeetingAggregate = Meeting & {
  speakers: Speaker[];
  notes: Note[];
  actions: Action[];
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

export type Action = {
  id: number;
  meetingId: number;
  createdAt: Date;
  createdBy: number; // speaker who created the action
  ownerId: number; // speaker who the action is for
  text: string;
  completed: boolean;
};

export type TimerEvent = {
  secondsRemaining: number;
  meetingCode: string;
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

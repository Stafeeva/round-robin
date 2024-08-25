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

/**
 * Errors
 */

export class MeetingNotFoundError extends Error {}
export class InvalidMeetingCodeError extends Error {}
export class InvalidMeetingNameError extends Error {}
export class InvalidSpeakerDurationError extends Error {}
export class InvalidAutoProceedError extends Error {}

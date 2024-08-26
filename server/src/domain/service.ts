import * as entity from "@App/domain/entity";

import bcrypt from "bcrypt";

export type CreateMeeting = {
  name: string;
  speakerDuration?: number;
  autoProceed?: boolean;
};

export interface MeetingService {
  listMeetings(): Promise<entity.Meeting[]>;
  createMeeting(meeting: CreateMeeting): Promise<entity.Meeting>;
  getMeeting(code: string): Promise<entity.Meeting>;
  addSpeakerToMeeting(
    meetingCode: string,
    speakerId: number
  ): Promise<entity.Meeting>;
  startMeeting(code: string): Promise<entity.Meeting>;
  moveToNextSpeaker(code: string): Promise<entity.Meeting>;
}

export type CreateSpeaker = {
  username: string;
  password: string; // unhashed password
  firstName: string;
  lastName: string;
};

export type Speaker = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
};

export type Token = {
  speakerId: number;
  token: string;
};

export type TokenPayload = {
  speakerUsername: string;
  speakerId: number;
};

export interface SpeakerService {
  createSpeaker(spearker: CreateSpeaker): Promise<Speaker>;
  getSpeaker(username: string): Promise<Speaker>;
  loginSpeaker(username: string, password: string): Promise<Token>;
  verifyToken(token: string): Promise<TokenPayload>;
}

const generateMeetingCodeSegment = (length: number): string => {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export type MeetingCodeGenerator = () => string;

// generates a 3-segment meeting code in the format abc-123-def (similar to google meet)
export const randomMeetingCodeGenerator: MeetingCodeGenerator = (): string => {
  // Generate three segments of the code
  const part1 = generateMeetingCodeSegment(3);
  const part2 = generateMeetingCodeSegment(3);
  const part3 = generateMeetingCodeSegment(3);

  // Join the segments with hyphens
  return `${part1}-${part2}-${part3}`;
};

export const isValidMeetingCode = (code: string): boolean => {
  return /^[a-z0-9]{3}-[a-z0-9]{3}-[a-z0-9]{3}$/.test(code);
};

// hash a password
export const hashPassword = async (password: string): Promise<string> => {
  // hash using bcrypt
  const saltRounds = 5;

  try {
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
  } catch (error) {
    console.error("Error hashing password", error);
    throw new Error("Error hashing password");
  }
};

export const comparePasswords = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error("Error comparing passwords", error);
    throw new Error("Error comparing passwords");
  }
};

export const shuffleArray = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

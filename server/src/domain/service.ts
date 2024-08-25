import * as entity from "@App/domain/entity";

export type CreateMeeting = {
  name: string;
  speakerDuration?: number;
  autoProceed?: boolean;
};

export interface MeetingService {
  listMeetings(): Promise<entity.Meeting[]>;
  createMeeting(meeting: CreateMeeting): Promise<entity.Meeting>;
  getMeeting(code: string): Promise<entity.Meeting>;
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

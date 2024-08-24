import * as entity from "@App/domain/entity";

export interface MeetingService {
  listMeetings(): Promise<entity.Meeting[]>;
}

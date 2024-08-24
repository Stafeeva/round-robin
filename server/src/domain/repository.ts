/*
    Repository abstraction over the databse
*/

import * as entity from "@App/domain/entity";

export interface MeetingRepository {
  listMeetings(): Promise<entity.Meeting[]>;
}

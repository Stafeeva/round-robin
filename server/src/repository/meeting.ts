import puresql, { PuresqlAdapter } from "puresql";
import * as entity from "@App/domain/entity";
import { MeetingRepository } from "@App/domain/repository";

export class SQLRepository implements MeetingRepository {
  private adapter: PuresqlAdapter;
  private queries: Record<string, puresql.PuresqlQuery<any>>;

  constructor(
    adapter: PuresqlAdapter,
    queries: Record<string, puresql.PuresqlQuery<any>>
  ) {
    this.adapter = adapter;
    this.queries = queries;
  }

  async listMeetings(): Promise<entity.Meeting[]> {
    const meetings = await this.queries.list_meetings({}, this.adapter);
    return meetings;
  }
}

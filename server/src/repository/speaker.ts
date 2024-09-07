import puresql, { PuresqlAdapter } from "puresql";
import * as entity from "@App/domain/entity";
import * as db from "@App/domain/db";
import { CreateSpeaker, SpeakerRepository } from "@App/domain/repository";

export const dbSpeakerToEntitySpeaker = (
  speaker: db.Speaker
): entity.Speaker => {
  return {
    id: speaker.id,
    username: speaker.username,
    password: speaker.password,
    firstName: speaker.first_name,
    lastName: speaker.last_name,
  };
};
export class SQLRepository implements SpeakerRepository {
  private adapter: PuresqlAdapter;
  private queries: Record<string, puresql.PuresqlQuery<any>>;

  constructor(
    adapter: PuresqlAdapter,
    queries: Record<string, puresql.PuresqlQuery<any>>
  ) {
    this.adapter = adapter;
    this.queries = queries;
  }

  async createSpeaker(speaker: CreateSpeaker): Promise<entity.Speaker> {
    const newSpeakerData = {
      username: speaker.username,
      password: speaker.password,
      first_name: speaker.firstName,
      last_name: speaker.lastName,
    };

    const res = await this.queries.create_speaker(newSpeakerData, this.adapter);
    return this.getSpeaker(speaker.username);
  }

  async getSpeaker(username: string): Promise<entity.Speaker> {
    const speakers: db.Speaker[] = await this.queries.get_speaker(
      { username },
      this.adapter
    );

    // TODO handle not found

    return dbSpeakerToEntitySpeaker(speakers[0]);
  }
}

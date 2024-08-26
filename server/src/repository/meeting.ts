import puresql, { PuresqlAdapter } from "puresql";
import * as entity from "@App/domain/entity";
import * as db from "@App/domain/db";
import { CreateMeeting, MeetingRepository } from "@App/domain/repository";
import { dbSpeakerToEntitySpeaker } from "./speaker";

const dbMeetingToEntityMeeting = (meeting: db.Meeting): entity.Meeting => {
  return {
    id: meeting.id,
    name: meeting.name,
    code: meeting.code,
    speakerDuration: meeting.speaker_duration,
    createdAt: meeting.created_at,
    autoProceed: meeting.auto_proceed === 1,
    state: meeting.state as entity.MeetingState,
    speakerQueue: JSON.parse(meeting.speaker_queue),
  };
};

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
    // convert from db type to domain entity
    return meetings.map(dbMeetingToEntityMeeting);
  }

  async getMeeting(code: string): Promise<entity.Meeting> {
    const meeting: db.Meeting[] = await this.queries.get_meeting(
      { code },
      this.adapter
    );

    if (meeting.length === 0) {
      throw new entity.MeetingNotFoundError();
    }

    return dbMeetingToEntityMeeting(meeting[0]);
  }

  async createMeeting(meeting: CreateMeeting): Promise<entity.Meeting> {
    const newMeetingData = {
      name: meeting.name,
      code: meeting.code,
      speaker_duration: meeting.speakerDuration,
      auto_proceed: meeting.autoProceed ? 1 : 0,
      state: entity.MeetingState.NotStarted,
    };

    await this.queries.create_meeting(newMeetingData, this.adapter);

    return this.getMeeting(meeting.code);
  }

  async deleteMeeting(code: string): Promise<void> {
    await this.queries.delete_meeting({ code }, this.adapter);
    return;
  }

  async updateMeetingState(
    meetingState: entity.MeetingState,
    code: string,
    speakerQueue: number[]
  ): Promise<entity.Meeting> {
    const queryData = {
      code,
      speaker_queue: JSON.stringify(speakerQueue),
      state: meetingState,
    };
    await this.queries.update_meeting_state(queryData, this.adapter);
    return this.getMeeting(code);
  }

  async getSpeakers(meetingCode: string): Promise<entity.Speaker[]> {
    const speakers = await this.queries.get_meeting_speakers(
      { code: meetingCode },
      this.adapter
    );

    return speakers.map(dbSpeakerToEntitySpeaker);
  }

  async addSpeakerToMeeting(
    meetingId: number,
    speakerId: number
  ): Promise<void> {
    await this.queries.add_speaker_to_meeting(
      { meeting_id: meetingId, speaker_id: speakerId },
      this.adapter
    );
    return;
  }
}

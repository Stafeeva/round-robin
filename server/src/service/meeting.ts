import { MeetingService } from "@App/domain/service";
import { MeetingRepository } from "@App/domain/repository";

export class Service implements MeetingService {
  private meetingRepository: MeetingRepository;

  constructor(meetingRepository: MeetingRepository) {
    this.meetingRepository = meetingRepository;
  }

  async listMeetings() {
    return this.meetingRepository.listMeetings();
  }
}

import * as service from "@App/domain/service";
import { MeetingService } from "@App/domain/service";
import { MeetingRepository } from "@App/domain/repository";
import * as repository from "@App/domain/repository";
import * as entity from "@App/domain/entity";

export class Service implements MeetingService {
  private meetingRepository: MeetingRepository;

  constructor(meetingRepository: MeetingRepository) {
    this.meetingRepository = meetingRepository;
  }

  async listMeetings() {
    return this.meetingRepository.listMeetings();
  }

  async createMeeting(meeting: service.CreateMeeting) {
    // name is required, no longer than 45 characters, cannot be empty
    if (
      !meeting.name ||
      meeting.name.length === 0 ||
      meeting.name.length > 45
    ) {
      throw new entity.InvalidMeetingNameError();
    }

    // speaker duration is optional, but it must be between 30 and 600 seconds
    if (
      meeting.speakerDuration &&
      (meeting.speakerDuration < 30 || meeting.speakerDuration > 600)
    ) {
      throw new entity.InvalidSpeakerDurationError();
    }

    // auto proceed is optional, should default to false if not provided
    if (meeting.autoProceed && typeof meeting.autoProceed !== "boolean") {
      throw new entity.InvalidAutoProceedError();
    }

    const meetingCode = service.randomMeetingCodeGenerator();

    let createMeeting: repository.CreateMeeting = {
      name: meeting.name,
      speakerDuration: meeting.speakerDuration || 60,
      autoProceed: meeting.autoProceed || false,
      code: meetingCode,
    };

    return this.meetingRepository.createMeeting(createMeeting);
  }

  async getMeeting(code: string) {
    if (service.isValidMeetingCode(code)) {
      return this.meetingRepository.getMeeting(code);
    } else {
      throw new entity.InvalidMeetingCodeError();
    }
  }

  async addSpeakerToMeeting(
    meetingCode: string,
    speakerId: number
  ): Promise<entity.Meeting> {
    // TODO meeting must exist
    // TODO speaker must exist

    const meeting = await this.meetingRepository.getMeeting(meetingCode);

    // add the speaker to the meeting
    await this.meetingRepository.addSpeakerToMeeting(meeting.id, speakerId);

    return meeting;
  }
}

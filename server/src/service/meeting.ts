import * as service from "@App/domain/service";
import { NotificationService, MeetingService } from "@App/domain/service";
import { MeetingRepository } from "@App/domain/repository";
import * as repository from "@App/domain/repository";
import * as entity from "@App/domain/entity";

export class Service implements MeetingService {
  private meetingRepository: MeetingRepository;
  private notificationService: NotificationService;

  constructor(
    meetingRepository: MeetingRepository,
    notificationService: NotificationService
  ) {
    this.meetingRepository = meetingRepository;
    this.notificationService = notificationService;
  }

  async listMeetings(speakerId?: number) {
    const meetings = await this.meetingRepository.listMeetings();

    // filter meetings to only include those that the speaker is a part of
    return meetings.filter((meeting) =>
      meeting.speakers.some((speaker) => speaker.id === speakerId)
    );
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

  async startMeeting(code: string): Promise<entity.Meeting> {
    const meeting = await this.meetingRepository.getMeeting(code);

    const speakerQueue = service
      .shuffleArray(await this.meetingRepository.getSpeakers(code))
      .map((speaker) => speaker.id);

    // start the meeting
    const updatedMeeting = await this.meetingRepository.updateMeetingState(
      entity.MeetingState.InProgress,
      code,
      speakerQueue
    );

    this.notificationService.notify(updatedMeeting);

    return updatedMeeting;
  }

  async moveToNextSpeaker(code: string): Promise<entity.Meeting> {
    const meeting = await this.meetingRepository.getMeeting(code);

    // TODO - what should this do if meeting has already ended? 409 Conflict?
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/409

    // remove the first speaker from the queue
    const speakerQueue = meeting.speakerQueue.slice(1);

    const nextMeetingState =
      speakerQueue.length === 0
        ? entity.MeetingState.Ended
        : entity.MeetingState.InProgress;

    // update the meeting with the new speaker queue
    const updatedMeeting = await this.meetingRepository.updateMeetingState(
      nextMeetingState,
      code,
      speakerQueue
    );

    this.notificationService.notify(updatedMeeting);
    // return the updated meeting
    return updatedMeeting;
  }
}

import * as service from "@App/domain/service";
import { NotificationService, MeetingService } from "@App/domain/service";
import { MeetingRepository, NoteRepository } from "@App/domain/repository";
import * as repository from "@App/domain/repository";
import * as entity from "@App/domain/entity";

export class Service implements MeetingService {
  private meetingRepository: MeetingRepository;
  private noteRepository: NoteRepository;
  private notificationService: NotificationService;

  constructor(
    meetingRepository: MeetingRepository,
    noteRepository: NoteRepository,
    notificationService: NotificationService
  ) {
    this.meetingRepository = meetingRepository;
    this.noteRepository = noteRepository;
    this.notificationService = notificationService;
  }

  async listMeetings(speakerId?: number) {
    const meetings = await this.meetingRepository.listMeetings(speakerId);

    // filter meetings to only include those that the speaker is a part of
    // return meetings.filter((meeting) =>
    //   meeting.speakers.some((speaker) => speaker.id === speakerId)
    // );

    return meetings;
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

  async getMeeting(code: string): Promise<entity.MeetingAggregate> {
    if (service.isValidMeetingCode(code)) {
      const meeting = await this.meetingRepository.getMeeting(code);

      const speakers: entity.Speaker[] =
        await this.meetingRepository.getSpeakers(code);

      const notes: entity.Note[] = await this.noteRepository.getNotes(
        meeting.id
      );

      return { ...meeting, speakers, notes };
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

    this.notificationService.notify(await this.getMeeting(code));

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

    this.notificationService.notify(await this.getMeeting(code));
    // return the updated meeting
    return updatedMeeting;
  }

  // handle notes

  async addNoteToMeeting(
    code: string,
    note: service.CreateNote
  ): Promise<entity.Meeting> {
    // TODO meeting must exist
    // TODO note must exist

    const meeting = await this.meetingRepository.getMeeting(code);

    try {
      // add note to the meeting
      const foo = await this.noteRepository.createNote({
        meetingId: meeting.id,
        speakerId: note.speakerId,
        text: note.text,
      });

      // TODO
      // meeting model does not currently contain notes, needs to be added
      // so the updated meeting can be sent via the notification service

      this.notificationService.notify(await this.getMeeting(code));
    } catch (e) {
      console.error(e);
    }

    return meeting;
  }
}

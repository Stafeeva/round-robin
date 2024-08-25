import * as service from "@App/domain/service";
import { SpeakerService } from "@App/domain/service";
import * as repository from "@App/domain/repository";
import * as entity from "@App/domain/entity";

export class Service implements SpeakerService {
  private speakerRepository: repository.SpeakerRepository;

  constructor(speakerRepository: repository.SpeakerRepository) {
    this.speakerRepository = speakerRepository;
  }

  async createSpeaker(
    speaker: service.CreateSpeaker
  ): Promise<service.Speaker> {
    // hash the password
    const hashedPassword = await service.hashPassword(speaker.password);

    // write the speaker to the repository
    const { password, ...serviceSpeaker } =
      await this.speakerRepository.createSpeaker({
        ...speaker,
        password: hashedPassword,
      });
    return serviceSpeaker as service.Speaker;
  }

  async getSpeaker(username: string): Promise<entity.Speaker> {
    throw new Error("Method not implemented.");
  }
}

import * as service from "@App/domain/service";
import { SpeakerService } from "@App/domain/service";
import * as repository from "@App/domain/repository";
import * as entity from "@App/domain/entity";
import jwt from "jsonwebtoken";

export class Service implements SpeakerService {
  private speakerRepository: repository.SpeakerRepository;

  // TODO - should be set via constructor
  private secretKey = "yourSecretKey";

  constructor(speakerRepository: repository.SpeakerRepository) {
    this.speakerRepository = speakerRepository;
  }

  async createSpeaker(
    speaker: service.CreateSpeaker
  ): Promise<service.Speaker> {
    // hash the password
    const hashedPassword = await service.hashPassword(speaker.password);

    // write the speaker to the repository
    return this.speakerRepository.createSpeaker({
      ...speaker,
      password: hashedPassword,
    });
  }

  async getSpeaker(username: string): Promise<entity.Speaker> {
    throw new Error("Method not implemented.");
  }

  async loginSpeaker(
    username: string,
    password: string
  ): Promise<service.Token> {
    // get the speaker from the repository
    const speaker = await this.speakerRepository.getSpeaker(username);

    // compare the passwords
    const isPasswordCorrect = await service.comparePasswords(
      password,
      speaker.password
    );

    if (!isPasswordCorrect) {
      throw new entity.InvalidPasswordError();
    }

    // generate a token
    const tokenPayload = {
      speakerUsername: speaker.username,
      speakerId: speaker.id,
    };
    const options = { expiresIn: "1h" };

    const token = jwt.sign(tokenPayload, this.secretKey, options);

    return {
      speakerId: speaker.id,
      token: token,
    };
  }

  async verifyToken(token: string): Promise<service.TokenPayload> {
    try {
      const tokenPayload = jwt.verify(
        token,
        this.secretKey
      ) as service.TokenPayload;
      const { speakerId, speakerUsername } = tokenPayload;
      return { speakerId, speakerUsername };
    } catch (error) {
      throw new entity.InvalidTokenError();
    }
  }
}

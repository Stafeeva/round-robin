import { NotificationService } from "@App/domain/service";
import * as entity from "@App/domain/entity";
import { Server as SocketIOServer } from "socket.io";

export class Service implements NotificationService {
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;

    io.on("connection", (socket) => {
      // room for each meeting code so that we can notify only the relevant clients
      socket.on("joinRoom", (code: string) => {
        socket.join(code);
      });
    });
  }

  async notify(meeting: entity.MeetingAggregate): Promise<void> {
    this.io.to(meeting.code).emit("meetingUpdated", meeting);
  }
}

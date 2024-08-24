import express from "express";
import * as service from "@App/domain/service";

// using classes to benefit from dependency injection in order to test
export class Server {
  private app: express.Application;

  constructor(
    express: express.Application,
    meetingService: service.MeetingService
  ) {
    this.app = express;

    this.app.get("/", (req, res) => {
      res.send("Round robin server");
    });

    this.app.get("/api/meeting", async (req, res) => {
      const meetings = await meetingService.listMeetings();
      res.json(meetings);
    });
  }
}

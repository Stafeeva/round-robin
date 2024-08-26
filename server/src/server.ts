import express from "express";
import * as service from "@App/domain/service";
import * as entity from "@App/domain/entity";

// using classes to benefit from dependency injection in order to test

/*
    Server class to handle the http routes,
    maps the routes to the service methods and converts response to a json response

    HTTP response codes as per https://httpwg.org/specs/rfc9110.html#rfc.section.15
*/
export class Server {
  private app: express.Application;

  constructor(
    express: express.Application,
    meetingService: service.MeetingService,
    speakerService: service.SpeakerService
  ) {
    this.app = express;
    // Map http routes to the service methods
    this.app.get("/", (req, res) => {
      res.send("Round robin server");
    });

    this.app.get("/api/meeting", async (req, res) => {
      const meetings = await meetingService.listMeetings();
      res.json(meetings);
    });

    this.app.post("/api/meeting", async (req, res) => {
      // call the service to create a meeting
      try {
        const newMeeting = await meetingService.createMeeting(req.body);
        res.status(201).json(newMeeting);
      } catch (error) {
        if (error instanceof entity.InvalidMeetingNameError) {
          res.status(400).json({ error: "Invalid meeting name" });
        } else if (error instanceof entity.InvalidSpeakerDurationError) {
          res.status(400).json({
            error:
              "Invalid speaker duration, must be between 30 and 600 seconds",
          });
        } else if (error instanceof entity.InvalidAutoProceedError) {
          res
            .status(400)
            .json({ error: "Invalid autoProceed value, must be a boolean" });
        } else {
          res.status(500).json({ error: "Server error" });
        }
      }
    });

    this.app.get("/api/meeting/:code", async (req, res) => {
      try {
        const meeting = await meetingService.getMeeting(req.params.code);
        res.json(meeting);
      } catch (error) {
        if (error instanceof entity.MeetingNotFoundError) {
          res.status(404).json({ error: "Meeting not found" });
        } else if (error instanceof entity.InvalidMeetingCodeError) {
          res.status(400).json({ error: "Invalid meeting code" });
        } else {
          res.status(500).json({ error: "Server error" });
        }
      }
    });

    this.app.post("/api/speaker", async (req, res) => {
      try {
        const newSpeaker = await speakerService.createSpeaker(req.body);
        res.status(201).json(newSpeaker);
      } catch (error) {
        console.log("Server error", error);
        res.status(500).json({ error: "Server error" });
      }
    });

    this.app.post("/api/speaker[:]login", async (req, res) => {
      const username = req.body.username;
      const password = req.body.password;

      try {
        const speaker = await speakerService.loginSpeaker(username, password);
        res.status(200).json(speaker);
      } catch (error) {
        if (error instanceof entity.InvalidPasswordError) {
          res.status(401).json({ error: "Invalid password" });
        } else {
          res.status(500).json({ error: "Server error" });
        }
      }
    });

    this.app.post("/api/meeting/:code/speaker", async (req, res) => {
      try {
        await meetingService.addSpeakerToMeeting(
          req.params.code,
          req.body.speakerId
        );
        res.status(201).json({ message: "Speaker added to meeting" });
      } catch (error) {
        console.error("Error adding speaker to meeting", error);
        res.status(500).json({ error: "Server error" });
      }
    });

    this.app.post("/api/meeting/:code[:]start", async (req, res) => {
      // @ts-ignore
      const meetingCode = req.params.code;

      try {
        const meeting = await meetingService.startMeeting(meetingCode);

        res.status(200).json(meeting);
      } catch (error) {
        console.error("Error starting meeting", error);
        res.status(500).json({ error: "Server error" });
      }
    });

    this.app.post("/api/meeting/:code[:]next", async (req, res) => {
      // @ts-ignore
      const meeting = await meetingService.moveToNextSpeaker(req.params.code);

      res.status(200).json(meeting);
    });
  }
}

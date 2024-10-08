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

    const unauthorizedRoutes = ["/api/speaker", "/api/speaker:login"];
    const authMiddleware = async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      if (unauthorizedRoutes.includes(req.path)) {
        return next();
      }

      if (req.headers.authorization) {
        const token = req.headers.authorization.replace("Bearer ", "");

        try {
          const verified = await speakerService.verifyToken(token);

          // @ts-ignore
          req.speakerId = verified.speakerId;
          return next();
        } catch (error) {
          if (error instanceof entity.InvalidTokenError) {
            res.status(401).json({ error: "Unauthorized" });
          } else {
            res.status(500).json({ error: "Server error" });
          }
        }
      } else {
        res.status(401).json({ error: "Unauthorized" });
      }
    };

    this.app.use(authMiddleware);

    this.app.get("/api/meeting", async (req, res) => {
      // @ts-ignore
      const speakerId = req.speakerId;
      const meetings = await meetingService.listMeetings(speakerId);
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


        // @ts-ignore
        const speakerId = req.speakerId as number;



        // console.log("add speaker to meeting", req.params, "....", req.params.code, req.body.speakerId);


        await meetingService.addSpeakerToMeeting(
          req.params.code,
          speakerId
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

    this.app.post("/api/meeting/:code/note", async (req, res) => {
      const meetingCode = req.params.code;

      // @ts-ignore
      const speakerId = req.speakerId as number;

      const meeting = await meetingService.addNoteToMeeting(meetingCode, {
        speakerId,
        text: req.body.text,
      });

      // TODO create note service
      // TODO add note to meeting
      res.status(201).json(meeting);
    });

    // TODO note routes
    // get notes ? maybe not needed if just return meeting
    // edit a note
    // delete a note

    // TODO action routes
    this.app.post("/api/meeting/:code/action", async (req, res) => {
      const meetingCode = req.params.code;
      // @ts-ignore
      const speakerId = req.speakerId as number;

      const newAction = {
        createdBy: speakerId,
        ownerId: req.body.ownerId,
        text: req.body.text,
      };
      const meeting = await meetingService.addActionToMeeting(
        meetingCode,
        newAction
      );

      res.status(201).json(meeting);
    });
    // edit an action ?
    // mark action as completed ? (maybe just edit)
    // delete an action
  }
}

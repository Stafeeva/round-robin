import express from "express";
import { createServer } from "http";
import path from "path";
import { Server } from "socket.io";

export type Attendee = { name: string };

export type Note = { author: string; text: string };

export type Action = { assignee: string; text: string };

const PORT = process.env.PORT || 8000;

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.json());
// Serve the React static files after build
app.use(express.static("../client/build"));

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

const attendees: Attendee[] = [];

const notes: Note[] = [];

const actions: Action[] = [];

enum MeetingState {
  NotStarted = "NotStarted",
  InProgress = "InProgress",
  Ended = "Ended",
}

let meetingState = MeetingState.NotStarted;

// the order in which attendees will speak
let speakerQueue: Attendee[] = [];
let currentSpeaker: Attendee | undefined;

app.post("/api/join", (req, res) => {
  console.log(req.body);
  // TODO: Validate the name is unique
  const person = { name: req.body.name };
  attendees.push(person);

  console.log("Attendees", attendees);
  io.emit("meetingUpdated", getMeeting());

  // TODO: what if meeting already started?

  res.json({ message: "joined" });
});

// LIST attendees
app.get("/api/attendee", (req, res) => {
  res.json(attendees);
});

// All other unmatched requests will return the React app
app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
});

const getMeeting = () => {
  return {
    attendees,
    meetingState,
    speakerQueue,
    currentSpeaker,
  };
};

app.get("/api/meeting", (req, res) => {
  res.json(getMeeting());
});

// TODO: move this to a utility file
const shuffleArray = (array: Attendee[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// https://cloud.google.com/apis/design/custom_methods

app.post("/api/meeting[:]start", (req, res) => {
  // TODO: only allow starting meeting if in notstarted state

  // Start the meeting
  meetingState = MeetingState.InProgress;
  // Define a random order for the attendees
  speakerQueue = shuffleArray([...attendees]);

  // Start with the first speaker
  currentSpeaker = speakerQueue.shift();

  io.emit("meetingUpdated", getMeeting());

  res.json(getMeeting());
});

app.post("/api/meeting[:]next", (req, res) => {
  // TODO: only allow next if the meeting is in progress

  // Move to the next attendee
  currentSpeaker = speakerQueue.shift();

  // if we have reached the last speaker, the meeting is over
  if (currentSpeaker === undefined) {
    meetingState = MeetingState.Ended;
  }

  io.emit("meetingUpdated", getMeeting());
  res.json(getMeeting());
});

app.post("/api/meeting[:]reset", (req, res) => {
  resetMeeting();

  io.emit("meetingUpdated", getMeeting());
  res.json(getMeeting());
});

const resetMeeting = () => {
  meetingState = MeetingState.NotStarted;
  speakerQueue = [];
  currentSpeaker = undefined;
};

app.get("/api/note", (req, res) => {
  res.json(notes);
});

app.post("/api/note", (req, res) => {
  const note = req.body;
  notes.push(note);
  io.emit("noteAdded", notes);

  res.status(201).json({ message: "Note added" });
});

app.get("/api/action", (req, res) => {
  res.json(actions);
});

app.post("/api/action", (req, res) => {
  const action = req.body;
  actions.push(action);
  io.emit("actionAdded", actions);

  res.status(201).json({ message: "Action added" });
});

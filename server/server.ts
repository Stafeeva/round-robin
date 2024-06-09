import express from "express";
import { createServer } from "http";
import path from "path";
import { Server } from "socket.io";

export type Attendee = { name: string };

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

const attendees: Attendee[] = [
  { name: "John" },
  { name: "Jane" },
  { name: "Alice" },
];

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
  io.emit("attendees", attendees);
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

const shuffleArray = (array: Attendee[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// https://cloud.google.com/apis/design/custom_methods

app.post("/api/meeting[:]start", (req, res) => {
  // Start the meeting
  meetingState = MeetingState.InProgress;
  // Define a random order for the attendees
  speakerQueue = shuffleArray([...attendees]);

  // Start with the first speaker
  currentSpeaker = speakerQueue.shift();

  res.json(getMeeting());
});

app.post("/api/meeting[:]next", (req, res) => {
  // Move to the next attendee
  currentSpeaker = speakerQueue.shift();

  // if we have reached the last speaker, the meeting is over
  if (currentSpeaker === undefined) {
    meetingState = MeetingState.Ended;
  }

  res.json(getMeeting());
});

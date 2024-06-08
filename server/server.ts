import { log } from "console";
import { create } from "domain";
import express from "express";
import { createServer } from "http";
import path from "path";
import { Server } from "socket.io";

export type Person = { name: string };

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

const people: Person[] = [];

app.post("/api/join", (req, res) => {
  console.log(req.body);
  const person = { name: req.body.name };
  people.push(person);
  io.emit("people", people);
  res.json({ message: "joined" });
});

// LIST PEOPLE
app.get("/api/people", (req, res) => {
  res.json(people);
});

// All other unmatched requests will return the React app
app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
});

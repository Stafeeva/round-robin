import { log } from "console";
import express from "express";
import path from "path";

export type Person = { name: string };

const PORT = process.env.PORT || 8000;

const app = express();

app.use(express.json());
// Serve the React static files after build
app.use(express.static("../client/build"));

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

const people: Person[] = [];

app.post("/api/join", (req, res) => {
  console.log(req.body);
  const person = { name: req.body.name };
  people.push(person);
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

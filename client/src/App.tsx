import React, { FC, useEffect } from "react";
import { io } from "socket.io-client";

import "./App.css";

type Person = { name: string };

const socket = io();

const Join: FC = () => {
  const [name, setName] = React.useState<string>("");

  const handleJoin = async () => {
    const res = await fetch("/api/join", {
      method: "POST",
      body: JSON.stringify({ name }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  return (
    <>
      <p>Please enter your name</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleJoin();
        }}
      >
        <input onChange={(e) => setName(e.currentTarget.value)} />
        <button type="submit">Join</button>
      </form>
    </>
  );
};

function App() {
  const [people, setPeople] = React.useState<Person[]>([]);

  const fetchPeople = async () => {
    const res = await fetch("/api/attendee");
    const data = await res.json();
    setPeople(data);
  };

  useEffect(() => {
    fetchPeople();

    socket.on("attendees", (data: Person[]) => {
      setPeople(data);
    });
  }, []);

  return (
    <div className="App">
      <h1>Attendees</h1>
      <ul>
        {people.map((person, i) => (
          <li key={i}>{person.name}</li>
        ))}
      </ul>
      <Join />
    </div>
  );
}

export default App;

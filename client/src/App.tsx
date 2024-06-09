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
  const [meeting, setMeeting] = React.useState<any>({});

  const fetchMeeting = async () => {
    const res = await fetch("/api/meeting");
    const data = await res.json();
    setMeeting(data);
  };

  useEffect(() => {
    fetchMeeting();

    // TODO: type for data
    socket.on("meetingUpdated", (data: any) => {
      setMeeting(data);
    });
  }, []);

  const handleStartMeeting = async () => {
    const res = await fetch("/api/meeting:start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  const handleNext = async () => {
    const res = await fetch("/api/meeting:next", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  const handleResetMeeting = async () => {
    const res = await fetch("/api/meeting:reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  return (
    <div className="App">
      <h2>Attendees</h2>
      <ul>
        {meeting?.attendees?.map((person: Person, i: number) => (
          <li key={i}>{person.name}</li>
        ))}
      </ul>
      <Join />
      <h2>Meeting: {meeting?.meetingState}</h2>
      <button onClick={handleStartMeeting}>Start</button>
      <button onClick={handleNext}>Next</button>
      <button onClick={handleResetMeeting}>Reset </button>
      <h2>Current Speaker: {meeting?.currentSpeaker?.name}</h2>
      <h2>Speaker Queue</h2>
      <ul>
        {meeting?.speakerQueue?.map((person: Person, i: number) => (
          <li key={i}>{person.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;

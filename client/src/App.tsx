import React, { FC, useEffect } from "react";
import { io } from "socket.io-client";
import { Attendee, Note, Action } from "../../server/server";
import { Button, Input } from "antd";
import "./App.css";
import Meeting from "./Meeting";

const socket = io();

export const AddAction = ({ attendees }: { attendees: Attendee[] }) => {
  const [assignee, setAssignee] = React.useState<string>("");
  const [text, setText] = React.useState<string>("");

  const handleAddAction = async () => {
    await fetch("/api/action", {
      method: "POST",
      body: JSON.stringify({ assignee, text }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    setText("");
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleAddAction();
      }}
    >
      <label htmlFor="assignee">Assignee: </label>
      <select
        id="assignee"
        onChange={(e) => {
          setAssignee(e.currentTarget.value);
        }}
      >
        {attendees.map((attendee, i) => (
          <option key={i} value={attendee.name}>
            {attendee.name}
          </option>
        ))}
      </select>

      <Input
        id="actionText"
        onChange={(e) => setText(e.currentTarget.value)}
        value={text}
      />
      <Button>Add Action</Button>
    </form>
  );
};

function App({ attendeeName }: { attendeeName: string }) {
  return (
    <div className="App">
      <main>
        <Meeting attendeeName={attendeeName} />
      </main>
    </div>
  );
}

export default App;

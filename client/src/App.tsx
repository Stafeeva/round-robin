import React, { FC, useEffect } from "react";
import { Attendee, Note, Action } from "../../server/serverPrototype";
import { Button, Input } from "antd";
import "./App.css";
import Meeting from "./LegacyMeeting";
import { Link, useNavigate } from "react-router-dom";

type Speaker = {
  firstName: string;
  lastName: string;
  id: number;
};

export const AddAction: FC<{ meetingCode: string; speakers: Speaker[] }> = ({
  meetingCode,
  speakers,
}) => {
  const [owner, setOwner] = React.useState<number>(speakers?.[0].id);
  const [text, setText] = React.useState<string>("");

  const navigate = useNavigate();

  const handleAddAction = async () => {
    const payload = { ownerId: owner, text };

    const token = JSON.parse(localStorage.getItem("token") as string);

    const response = await fetch(`/api/meeting/${meetingCode}/action`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.token}`,
      },
    });

    // if response is 401 then the token is invalid, redirect to login
    if (response.status === 401) {
      navigate("/login");
    }

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
        required
        id="assignee"
        defaultValue={speakers?.[0].id}
        onChange={(e) => {
          setOwner(Number(e.currentTarget.value));
        }}
      >
        {speakers?.map((speaker, i) => (
          <option key={i} value={speaker.id}>
            {speaker.firstName} {speaker.lastName}
          </option>
        ))}
      </select>

      <Input
        id="actionText"
        onChange={(e) => setText(e.currentTarget.value)}
        value={text}
      />
      <Button onClick={handleAddAction}>Add Action</Button>
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

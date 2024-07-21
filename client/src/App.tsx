import React, { FC, useEffect } from "react";
import { io } from "socket.io-client";
import { Attendee, Note, Action } from "../../server/server";
import "./App.css";

const socket = io();

const AddNote = ({ author }: { author: string }) => {
  const [text, setText] = React.useState<string>("");

  const handleAddNote = async () => {
    await fetch("/api/note", {
      method: "POST",
      body: JSON.stringify({ author, text }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    // clear text after note has been added
    setText("");
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleAddNote();
      }}
    >
      <label htmlFor="noteText">{author}: </label>
      <input
        id="noteText"
        onChange={(e) => setText(e.currentTarget.value)}
        value={text}
      />
      <button type="submit">Add Note</button>
    </form>
  );
};

const AddAction = ({ attendees }: { attendees: Attendee[] }) => {
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

      <input
        id="actionText"
        onChange={(e) => setText(e.currentTarget.value)}
        value={text}
      />
      <button type="submit">Add Action</button>
    </form>
  );
};

function App({ attendeeName }: { attendeeName: string }) {
  const [meeting, setMeeting] = React.useState<any>({});

  const [notes, setNotes] = React.useState<Note[]>([]);

  const [actions, setActions] = React.useState<Action[]>([]);

  const fetchMeeting = async () => {
    const res = await fetch("/api/meeting");
    const data = await res.json();
    setMeeting(data);
  };

  const fetchNotes = async () => {
    const res = await fetch("/api/note");
    const data = await res.json();
    setNotes(data);
  };

  const fetchActions = async () => {
    const res = await fetch("/api/action");
    const data = await res.json();
    setActions(data);
  };

  useEffect(() => {
    fetchMeeting();
    fetchNotes();
    fetchActions();

    // TODO: type for data
    socket.on("meetingUpdated", (data: any) => {
      setMeeting(data);
    });

    socket.on("noteAdded", (data: Note[]) => {
      setNotes(data);
    });

    socket.on("actionAdded", (data: Action[]) => {
      setActions(data);
    });
  }, []);

  const handleStartMeeting = async () => {
    await fetch("/api/meeting:start", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  const handleNext = async () => {
    await fetch("/api/meeting:next", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  const handleResetMeeting = async () => {
    await fetch("/api/meeting:reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  return (
    <div className="App">
      <main>
        <div className="container">
          <div className="meeting-container">
            <h2>Meeting: {meeting?.meetingState}</h2>

            {meeting?.meetingState === "InProgress" && (
              <div className="speakers">
                <p>
                  <strong>Current Speaker: </strong>{" "}
                  {meeting?.currentSpeaker?.name}
                </p>
                {meeting?.speakerQueue?.length > 0 && (
                  <p>
                    <strong>Speaker queue</strong>:{" "}
                    {meeting?.speakerQueue?.map(
                      (attendee: Attendee, i: number) => (
                        <span className="speaker" key={i}>
                          {attendee.name}
                        </span>
                      )
                    )}
                  </p>
                )}
              </div>
            )}

            <div className="meeting-actions">
              {meeting?.meetingState === "NotStarted" ? (
                <button onClick={handleStartMeeting}>Start</button>
              ) : (
                <button onClick={handleResetMeeting}>Reset</button>
              )}
              {meeting?.meetingState === "InProgress" && (
                <button onClick={handleNext}>
                  {meeting?.speakerQueue?.length === 0 ? "Finish" : "Next"}
                </button>
              )}
            </div>
          </div>
          <div className="attendees">
            <h2>Attendees</h2>
            <ul>
              {meeting?.attendees?.map((attendee: Attendee, i: number) => (
                <li
                  key={i}
                  className={attendeeName === attendee.name ? "active" : ""}
                >
                  {attendee.name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="container">
          <div className="notes">
            <h2>Notes</h2>

            <AddNote author={attendeeName} />
            <ul>
              {notes?.map((note: Note, i: number) => (
                <li key={i}>
                  <strong>{note.author}</strong>: {note.text}
                </li>
              ))}
            </ul>
          </div>

          <div className="actions">
            <h2>Actions</h2>

            <AddAction attendees={meeting?.attendees || []} />
            <ul>
              {actions?.map((action: Action, i: number) => (
                <li key={i}>
                  <strong>{action.assignee}</strong>: {action.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

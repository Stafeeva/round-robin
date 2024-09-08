import { Button } from "antd";
import React, { FC, useEffect } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";

import { io } from "socket.io-client";
import AddNote from "./components/AddNote";
import NoteItem from "./components/Note";
import { useNavigate } from "react-router-dom";
import { AddAction } from "./App";
import ActionItem from "./components/ActionItem";

enum MeetingState {
  NotStarted = "NotStarted",
  InProgress = "InProgress",
  Ended = "Ended",
}

type Meeting = {
  id: number;
  name: string;
  code: string;
  speakerDuration: number;
  autoProceed: boolean;
  state: MeetingState;
  createdAt: Date;
  speakerQueue: number[];
};

export type MeetingAggregate = Meeting & {
  speakers: Speaker[];
  notes: Note[];
  actions: Action[];
};

type Speaker = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
};

type Note = {
  id: number;
  meetingId: number;
  speakerId: number;
  text: string;
  createdAt: Date;
};

type Action = {
  id: number;
  meetingId: number;
  createdAt: Date;
  createdBy: number; // speaker who created the action
  ownerId: number; // speaker who the action is for
  text: string;
  completed: boolean;
};

type TimerEvent = {
  secondsRemaining: number;
  meetingCode: string;
};

type Token = {
  speakerId: number;
  token: string;
};

const Meeting: FC = () => {
  const [meeting, setMeeting] = React.useState<MeetingAggregate | null>(null);

  const [timerEvent, setTimerEvent] = React.useState<TimerEvent | null>(null);

  const navigate = useNavigate();

  // get meeting code from url
  const meetingCode = useParams().code as string;
  const token: Token = JSON.parse(localStorage.getItem("token") as string);

  useEffect(() => {
    // set up web socket to subscribe to updates for this meeting
    const socket = io();

    // when socket connects, join room
    socket.on("connect", () => {
      socket.emit("joinRoom", meetingCode);
    });

    socket.on("meetingUpdated", (data: any) => {
      setMeeting(data);
    });

    socket.on("timerEvent", (timerEvent: TimerEvent) => {
      setTimerEvent(timerEvent);
    });

    const fetchMeeting = async () => {
      const res = await fetch(`/api/meeting/${meetingCode}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.token}`,
        },
      });

      if (res.status === 401) {
        // redirect to login if not authorized
        navigate("/login");
      }

      const data = await res.json();
      setMeeting(data);
    };

    // fetch meeting data from server
    fetchMeeting();

    return () => {
      // close web socket
      // should not receive updates for this meeting if not on the meeting screen
      socket.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartMeeting = async () => {
    await fetch(`/api/meeting/${meetingCode}:start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.token}`,
      },
    });
  };

  const handleNext = async () => {
    await fetch(`/api/meeting/${meetingCode}:next`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.token}`,
      },
    });
  };

  const handleResetMeeting = async () => {
    await fetch("/api/meeting:reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.token}`,
      },
    });
  };

  if (!meeting) {
    return <div>Loading...</div>;
  }

  const timerMessage =
    timerEvent && timerEvent.secondsRemaining === 0
      ? "Time's up!"
      : timerEvent?.secondsRemaining;

  return (
    <div>
      <h2>
        {meeting.name} {meeting.state}
      </h2>

      <div>
        {meeting.state === MeetingState.InProgress && timerEvent && (
          <p>Timer: {timerMessage}</p>
        )}
      </div>

      <div className="meeting-actions">
        {meeting?.state === "NotStarted" ? (
          <Button onClick={handleStartMeeting}>Start</Button>
        ) : (
          <Button onClick={handleResetMeeting}>Reset</Button>
        )}
        {meeting?.state === "InProgress" && (
          <Button onClick={handleNext}>
            {meeting?.speakerQueue?.length === 0 ? "Finish" : "Next"}
          </Button>
        )}
      </div>
      <div>
        <h2>Attendees</h2>
        {meeting.speakers?.map((speaker: any) => (
          <p key={speaker.id}>{speaker.firstName}</p>
        ))}
      </div>
      <div>Speaker queue</div>
      {meeting.speakerQueue?.map((speaker: any) => (
        <p key={speaker}>{speaker}</p>
      ))}

      <div>Notes</div>
      <div className="notes">
        <h2>Notes</h2>
        <AddNote meetingCode={meetingCode} />
        <ul>
          {meeting.notes?.map(
            (note: { speakerId: number; text: string }, i: number) => (
              <NoteItem note={note} key={`note-${i}`} />
            )
          )}
        </ul>
      </div>

      <div>Actions</div>
      <div className="actions">
        <h2>Actions</h2>

        {meeting.speakers && (
          <AddAction meetingCode={meetingCode} speakers={meeting.speakers} />
        )}

        {meeting.actions?.map(
          (action: { ownerId: number; text: string; id: number }) => (
            <ActionItem actionItem={action} key={action.id} />
          )
        )}

        {/* <ActionItem
          actionItem={{
            asignee: "Dylan",
            text: "This is an action item",
            completed: false,
          }}
        /> */}
      </div>

      <Link to={`/`}>Back to home</Link>
    </div>
  );
};

export default Meeting;

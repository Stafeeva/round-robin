import { Avatar, Button, Flex } from "antd";
import React, { FC, useEffect } from "react";
import { useParams } from "react-router";
import {
  UserOutlined,
  CaretRightOutlined,
  RedoOutlined,
} from "@ant-design/icons";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

import AddNote from "./components/AddNote";
import NoteItem from "./components/Note";
import AddAction from "./components/AddAction";
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

  const getSpeakerNameById = (id: number): string => {
    return (
      meeting.speakers.find((speaker) => speaker.id === id)?.firstName || ""
    );
  };

  const formatSecondsToMMSS = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const timerMessage =
    timerEvent && timerEvent.secondsRemaining === 0
      ? `Time's up ${getSpeakerNameById(meeting.speakerQueue[0])}!`
      : "Remaining: " + formatSecondsToMMSS(timerEvent?.secondsRemaining || 0);

  return (
    <div style={{ width: "100%" }}>
      <h1>{meeting.name}</h1>
      <div>
        <Flex style={{ gap: "24px", justifyContent: "center" }}>
          {meeting.speakers?.map((speaker: Speaker) => (
            <div
              style={{
                border: `2px solid ${
                  speaker.id === meeting.speakerQueue[0] ? " #008080" : "white"
                }`,
                padding: "16px 16px 0 16px",
                borderRadius: "8px",
              }}
            >
              <Avatar size={48} icon={<UserOutlined />} />
              <p key={speaker.id}>{speaker.firstName}</p>
            </div>
          ))}
        </Flex>
      </div>
      <div>
        {meeting.state === MeetingState.InProgress && timerEvent && (
          <>
            <h2>
              Current speaker: {getSpeakerNameById(meeting.speakerQueue[0])}
            </h2>
            <p
              style={{
                fontSize: "36px",
                color: timerEvent?.secondsRemaining < 16 ? "red" : "black",
              }}
            >
              {timerMessage}
            </p>
          </>
        )}
      </div>

      <div
        style={{
          marginTop: "36px",
          display: "flex",
          justifyContent: "center",
          gap: "16px",
        }}
      >
        {meeting?.state === "NotStarted" ? (
          <Button
            type="primary"
            onClick={handleStartMeeting}
            icon={<CaretRightOutlined />}
          >
            Start
          </Button>
        ) : (
          <Button
            onClick={handleResetMeeting}
            type="primary"
            icon={<RedoOutlined />}
          >
            Restart
          </Button>
        )}
        {meeting?.state === "InProgress" && (
          <Button
            onClick={handleNext}
            type="primary"
            icon={<CaretRightOutlined />}
          >
            {meeting?.speakerQueue?.length === 0 ? "Finish" : "Next"}
          </Button>
        )}
      </div>

      <Flex style={{ gap: "48px" }}>
        <div style={{ width: "50%" }} className="notes">
          <h2>Notes</h2>
          <AddNote meetingCode={meetingCode} />

          {meeting.notes?.map(
            (note: { speakerId: number; text: string }, i: number) => (
              <NoteItem
                speakerName={getSpeakerNameById(note.speakerId)}
                text={note.text}
                key={`note-${i}`}
              />
            )
          )}
        </div>
        <div style={{ width: "50%" }} className="actions">
          <h2>Actions</h2>

          {meeting.speakers && (
            <AddAction meetingCode={meetingCode} speakers={meeting.speakers} />
          )}

          {meeting.actions?.map(
            (action: { ownerId: number; text: string; id: number }) => (
              <ActionItem
                ownerName={getSpeakerNameById(action.ownerId)}
                text={action.text}
                key={action.id}
              />
            )
          )}
        </div>
      </Flex>
    </div>
  );
};

export default Meeting;

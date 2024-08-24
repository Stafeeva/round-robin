import React, { FC, useEffect } from "react";
import { io } from "socket.io-client";
import { Avatar, Button, Flex, Skeleton } from "antd";
import {
  UserOutlined,
  ClockCircleFilled,
  AudioFilled,
} from "@ant-design/icons";

import { Attendee, Action, Note } from "../../server/server";
import "./App.css";
import { AddAction } from "./App";
import NoteItem from "./components/Note";
import AddNote from "./components/AddNote";
import ActionItem from "./components/ActionItem";

const socket = io();

const Meeting = ({ attendeeName }: { attendeeName: string }) => {
  const [meeting, setMeeting] = React.useState<any>({});

  const [notes, setNotes] = React.useState<Note[]>([]);

  const [actions, setActions] = React.useState<any[]>([]);

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
    // fetchMeeting();
    fetchNotes();
    // fetchActions();

    // TODO: type for data
    // socket.on("meetingUpdated", (data: any) => {
    //   setMeeting(data);
    // });

    socket.on("noteAdded", (data: Note[]) => {
      setNotes(data);
    });

    // socket.on("actionAdded", (data: Action[]) => {
    //   setActions(data);
    // });
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
    <Flex
      vertical
      style={{ width: "100%", height: "100vh" }}
      align="center"
      justify="flex-start"
    >
      <Flex
        vertical
        style={{ width: "800px", padding: "48px" }}
        align="center"
        gap="48px"
      >
        {/* <h2>Meeting: {meeting?.meetingState}</h2>
          < */}
        <h2>Apollo team standup</h2>
        {/* {meeting?.meetingState === "InProgress" && (
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
          )} */}

        <div className="meeting-actions">
          {meeting?.meetingState === "NotStarted" ? (
            <Button onClick={handleStartMeeting}>Start</Button>
          ) : (
            <Button onClick={handleResetMeeting}>Reset</Button>
          )}
          {meeting?.meetingState === "InProgress" && (
            <Button onClick={handleNext}>
              {meeting?.speakerQueue?.length === 0 ? "Finish" : "Next"}
            </Button>
          )}
        </div>

        <div style={{ width: "100%" }}>
          {meeting.meetingState === "InProgress" ? (
            <Flex justify="space-between">
              <div>
                <ClockCircleFilled style={{ fontSize: "48px" }} />
                <span style={{ fontSize: "48px", marginLeft: "24px" }}>
                  01:18
                </span>
              </div>
              <div>
                <AudioFilled style={{ fontSize: "48px" }} />
                <span style={{ fontSize: "48px", marginLeft: "24px" }}>
                  Dylan
                </span>
              </div>
            </Flex>
          ) : null}
        </div>

        <div className="attendees">
          <h2>Attendees</h2>
          <Flex gap="24px" style={{ marginTop: "24px" }}>
            {meeting?.attendees?.map((attendee: Attendee, i: number) => (
              <div
                key={i}
                className={attendeeName === attendee.name ? "active" : ""}
              >
                <Avatar size={64} icon={<UserOutlined />} />
                <div>{attendee.name}</div>
              </div>
            ))}
          </Flex>
        </div>
      </Flex>
      <Flex style={{ width: "800px" }} gap="48px">
        <div className="notes">
          <h2>Notes</h2>
          <AddNote author={attendeeName} />
          <ul>
            {notes?.map((note: Note, i: number) => (
              <NoteItem note={note} key={`note-${i}`} />
            ))}
          </ul>
        </div>

        <div className="actions">
          <h2>Actions</h2>
          <AddAction attendees={meeting?.attendees || []} />
          {/* {actions?.map((action, i: number) => ( */}
          <ActionItem
            actionItem={{
              asignee: "Dylan",
              text: "This is an action item",
              completed: false,
            }}
          />
          {/* ))} */}
        </div>
      </Flex>
    </Flex>
  );
};

export default Meeting;

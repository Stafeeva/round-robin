import { Button } from "antd";
import React, { FC, useEffect } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";

import { io } from "socket.io-client";

type Token = {
  speakerId: number;
  token: string;
};

const Meeting: FC = () => {
  const [meeting, setMeeting] = React.useState<any>({});

  // get meeting code from url
  const meetingCode = useParams().code;
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

    const fetchMeeting = async () => {
      const res = await fetch(`/api/meeting/${meetingCode}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.token}`,
        },
      });
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

  return (
    <div>
      <h2>
        {meeting.name} {meeting.state}
      </h2>
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

      <Link to={`/`}>Back to home</Link>
    </div>
  );
};

export default Meeting;

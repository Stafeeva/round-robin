import { Button, Input } from "antd";
import React, { FC } from "react";
import { useNavigate } from "react-router-dom";

type Token = {
  speakerId: number;
  token: string;
};

const Join: FC = () => {
  const [meetingCode, setMeetingCode] = React.useState<string>("");

  const navigate = useNavigate();

  const joinMeeting = async () => {
    const token: Token = JSON.parse(localStorage.getItem("token") as string);

    const addSpeakerResponse = await fetch(
      `/api/meeting/${meetingCode}/speaker`,
      {
        method: "POST",
        body: JSON.stringify({ speakerId: token.speakerId }),
        headers: {
          Authorization: `Bearer ${token.token}`,
        },
      }
    );

    if (addSpeakerResponse.status === 401) {
      // navigate to login page
      navigate("/login");
    }

    if (addSpeakerResponse.status === 201) {
      // redirect to meeting page
      navigate(`/meeting/${meetingCode}`);
    }
  };

  return (
    <div>
      Meeting code:
      <Input
        type="text"
        value={meetingCode}
        onChange={(e) => setMeetingCode(e.target.value)}
      />
      <Button onClick={joinMeeting}>Join</Button>
    </div>
  );
};

export default Join;

import { Button, Input } from "antd";
import React, { FC } from "react";
import { Link, useNavigate } from "react-router-dom";

type Token = {
  speakerId: number;
  token: string;
};


const Main: FC = () => {
  const [meetingCode, setMeetingCode] = React.useState<string>("");

  const navigate = useNavigate();

  const joinMeeting = async () => {
    console.log("join meeting with code", meetingCode);


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


    console.log("addSpeakerResponse", addSpeakerResponse);

    if (addSpeakerResponse.status === 401) {
      // TODO - unuauthorized - redirect to login
    }

    if (addSpeakerResponse.status === 201) {
      
    
      console.log("added speaker, redirect to meeting page");

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

export default Main;

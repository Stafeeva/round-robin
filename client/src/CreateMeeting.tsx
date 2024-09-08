import React, { FC } from "react";
import { Button, Input, Flex } from "antd";
import { useNavigate } from "react-router-dom";

type Token = {
  speakerId: number;
  token: string;
};

const CreateMeeting: FC = () => {
  const navigate = useNavigate();

  const [meetingName, setMeetingName] = React.useState("");
  const [speakerDuration, setSpeakerDuration] = React.useState(120);
  const [autoProceed, setAutoProceed] = React.useState(true);

  const token: Token = JSON.parse(localStorage.getItem("token") as string);

  const onClickCreateMeeting = async () => {
    console.log("create meeting clicked");

    // ensure name is not empty

    const payload = {
      name: meetingName,
      speakerDuration,
      autoProceed,
    };

    const response = await fetch("/api/meeting/", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.token}`,
      },
    });

    // join a meeting after creating it

    if (response.status === 401) {
      // TODO - unuauthorized - redirect to login
    }

    if (response.status === 201) {
      // meeting created

      console.log("response", response);

      const data = await response.json();

      console.log("data", data);

      const meetingCode = data.code;

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

      // if the speaker was added to the meeting - redirect to the meeting

      // otherwise - show and handle error

      // join the meeting
    } else {
      // meeing not created

      // TODO - handle error  (perhaps required field not provided / invalid data)

      console.error("error creating meeting", response);
    }

    //navigate("/meeting/123");
  };

  return (
    <Flex vertical gap="middle">
      <Flex justify="space-between" align="center">
        Meeting name
        <Input
          value={meetingName}
          style={{ width: "70%" }}
          onChange={(event) => setMeetingName(event.target.value)}
        />
      </Flex>

      <Flex justify="space-between" align="center" gap="6px">
        Speaker duration
        <Flex justify="space-around" gap="6px">
          <Button
            type={speakerDuration === 60 ? "primary" : "default"}
            onClick={() => setSpeakerDuration(60)}
          >
            1m
          </Button>
          <Button
            type={speakerDuration === 120 ? "primary" : "default"}
            onClick={() => setSpeakerDuration(120)}
          >
            2m
          </Button>
          <Button
            type={speakerDuration === 180 ? "primary" : "default"}
            onClick={() => setSpeakerDuration(180)}
          >
            3m
          </Button>
          <Button
            type={speakerDuration === 300 ? "primary" : "default"}
            onClick={() => setSpeakerDuration(300)}
          >
            5m
          </Button>
        </Flex>
      </Flex>
      <Flex justify="space-between" align="center" gap="6px">
        Auto proceed to next speaker
        <Flex justify="space-around" gap="6px">
          <Button
            type={autoProceed ? "primary" : "default"}
            onClick={() => setAutoProceed(true)}
          >
            Yes
          </Button>
          <Button
            type={autoProceed ? "default" : "primary"}
            onClick={() => setAutoProceed(false)}
          >
            No
          </Button>
        </Flex>
      </Flex>
      <Button
        type="primary"
        style={{ marginTop: "48px" }}
        onClick={onClickCreateMeeting}
      >
        Create
      </Button>
    </Flex>
  );
};

export default CreateMeeting;

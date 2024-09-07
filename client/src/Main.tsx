import React, { FC } from "react";

const Main: FC = () => {
  const [meetingCode, setMeetingCode] = React.useState<string>("");

  const joinMeeting = async () => {
    console.log("join meeting with code", meetingCode);
  };

  return (
    <div>
      Meeting code:
      <input
        type="text"
        value={meetingCode}
        onChange={(e) => setMeetingCode(e.target.value)}
      />
      <button onClick={joinMeeting}>Join</button>
    </div>
  );
};

export default Main;

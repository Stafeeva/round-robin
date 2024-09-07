import React, { FC } from "react";
import { useParams } from "react-router";

const Meeting: FC = () => {
  // TOOD - load meeting from server

  // get meeting code from url
  const meetingCode = useParams().code;
  console.log("meetingCode", meetingCode);

  // TODO - fetch meeting data from server and save in staate
  // will need to use useEffect and fetch (and get token from local storage)

  // TODO - display meeting data

  // TODO - set up web sockets (and close web socket on unmount)
  // will get updated meeting via web sockets and update state (e.g. as move to next speaker / speaker joins meeting etc)

  // TODO - button to start meeting / move to next speaker & logic to handle that

  return <div>Meeting</div>;
};

export default Meeting;

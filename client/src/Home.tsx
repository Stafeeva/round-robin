import React, { FC, useEffect } from "react";
import { Button } from "antd";
import { Flex } from "antd";
import { Link, useNavigate } from "react-router-dom";

const Home: FC = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = React.useState([]);

  useEffect(() => {
    // get token from local storage
    const token = localStorage.getItem("token");

    console.log("token", token);
    // if token exist, redirect to login page
    if (token === null) {
      navigate("/login");
    }

    const parsedToken = JSON.parse(token as string);
    console.log("parsedToken", parsedToken);

    // fetch list of meetings from api
    fetch("/api/meeting", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${parsedToken.token}`,
      },
    })
      .then((response) => {
        if (response.status === 401) {
          navigate("/login");
        }

        // TODO check for 200 status code?
        return response.json();
      })
      .then((data) => {
        console.log("data", data);
        setMeetings(data);
      });
  }, []);

  return (
    <Flex
      style={{ width: "100%", height: "100vh" }}
      align="center"
      vertical
      justify="space-around"
    >
      <Flex
        vertical
        gap="middle"
        style={{
          width: "400px",
          border: "1px solid #1677ff",
          borderRadius: "8px",
          padding: "72px",
        }}
      >
        <Link to="/create">Create a new meeting</Link>
        <Link to="/join">Join a meeting</Link>
      </Flex>

      <h2>My Meetings</h2>
      {meetings.map((meeting: any) => (
        <Link to={`/meeting/${meeting.code}`}>
          {meeting.name} {meeting.code}
        </Link>
      ))}
    </Flex>
  );
};

export default Home;

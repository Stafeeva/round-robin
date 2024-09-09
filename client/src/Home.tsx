import React, { FC, useEffect } from "react";
import { Button, Flex } from "antd";
import { Link, useNavigate } from "react-router-dom";

const Home: FC = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = React.useState([]);

  useEffect(() => {
    // get token from local storage
    const token = localStorage.getItem("token");

    // if token exist, redirect to login page
    if (token === null) {
      return navigate("/login");
    }

    const parsedToken = JSON.parse(token as string);

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

        return response.json();
      })
      .then((data) => {
        setMeetings(data);
      });
  }, []);

  return (
    <div style={{ width: "400px" }}>
      <h1>My Meetings</h1>
      {meetings.map((meeting: any) => (
        <Link to={`/meeting/${meeting.code}`}>
          {meeting.name} {meeting.code}
        </Link>
      ))}
      <div className="action-buttons">
        <Flex style={{ flexDirection: "column", gap: "12px" }}>
          <Link to="/create">
            <Button type="primary">Create a new meeting</Button>
          </Link>
          <Link to="/join">
            <Button type="primary">Join a meeting</Button>
          </Link>
        </Flex>
      </div>
    </div>
  );
};

export default Home;
